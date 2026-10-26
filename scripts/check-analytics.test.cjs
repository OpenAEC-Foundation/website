const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const { chromium } = require('playwright');

const root = join(__dirname, '..');
const loaderPath = join(root, 'shared/analytics.js');
assert.ok(existsSync(loaderPath), 'The central analytics loader must exist');
const source = readFileSync(loaderPath, 'utf8');
const sites = JSON.parse(readFileSync(join(root, 'shared/analytics-sites.json'), 'utf8'));
const consentKey = 'openaec_statistics_consent_v1';
let browser;
before(async () => {
    browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH ||
        (process.platform === 'win32' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : undefined) });
});
after(async () => { if (browser) await browser.close(); });

// Every request is intercepted. The external tag returns an empty script;
// only commands emitted by the real loader are inspected, never real traffic.
async function fixture(t, options = {}) {
    const context = await browser.newContext({ serviceWorkers: 'block' });
    t.after(() => context.close());
    const requests = [];
    const html = '<!doctype html><html><head><title>Private account 123</title>' +
        '<script src="/shared/analytics.js"></script></head><body>' +
        '<input name="email" value="private@example.test"></body></html>';
    await context.route('**/*', async route => {
        const request = route.request();
        const url = new URL(request.url());
        requests.push({ url: url.href, referrer: request.headers().referer || '' });
        if (/(^|\.)(googletagmanager|google-analytics)\.com$/.test(url.hostname)) {
            return route.fulfill({ contentType: 'text/javascript', body: '' });
        }
        if (url.pathname === '/shared/analytics.js') {
            return route.fulfill({ contentType: 'text/javascript', body: source });
        }
        if (request.isNavigationRequest()) return route.fulfill({ contentType: 'text/html', body: html });
        return route.abort();
    });
    if (options.choice) await context.addInitScript(({ key, choice }) => {
        if (localStorage.getItem(key) === null) localStorage.setItem(key, choice);
    }, { key: consentKey, choice: options.choice });
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    await page.goto(options.url || 'https://open-aec.com/over-ons.html?email=private@example.test#account-123', {
        referer: 'https://example.test/private/account-123?email=private@example.test'
    });
    return { context, page, requests };
}

function googleRequests(requests) {
    return requests.filter(request => /(^|\.)(googletagmanager|google-analytics)\.com$/.test(new URL(request.url).hostname));
}
async function commands(page) {
    return page.evaluate(() => (window.dataLayer || []).map(args => Array.from(args)));
}
async function views(page) {
    return (await commands(page)).filter(args => args[0] === 'event' && args[1] === 'page_view');
}
async function accept(page) {
    await page.click('#analytics-accept');
    await page.waitForFunction(() => (window.dataLayer || []).some(args => args[0] === 'event'));
}

test('no external tag or measurement before consent or after refusal and reload', async t => {
    const { page, requests } = await fixture(t);
    await page.locator('#analytics-consent').waitFor({ state: 'visible' });
    assert.equal(googleRequests(requests).length, 0);
    assert.deepEqual(await views(page), []);
    await page.click('#analytics-deny');
    assert.equal(await page.evaluate(key => localStorage.getItem(key), consentKey), 'denied');
    await page.reload();
    await page.locator('#analytics-settings').waitFor();
    assert.equal(googleRequests(requests).length, 0);
    assert.equal(await page.locator('#openaec-google-tag').count(), 0);
    assert.deepEqual(await views(page), []);
});

test('acceptance emits one correct tag and a sanitized explicit page view', async t => {
    const { page, requests } = await fixture(t);
    await accept(page);
    await page.waitForFunction(() => document.getElementById('openaec-google-tag'));
    assert.equal(await page.locator('#openaec-google-tag').count(), 1);
    const tag = await page.locator('#openaec-google-tag').evaluate(el => ({ src: el.src, policy: el.referrerPolicy }));
    assert.equal(tag.src, 'https://www.googletagmanager.com/gtag/js?id=G-F0SL23KPYG');
    assert.equal(tag.policy, 'no-referrer');
    const queued = await commands(page);
    const config = queued.find(args => args[0] === 'config');
    assert.equal(config[1], 'G-F0SL23KPYG');
    assert.equal(config[2].send_page_view, false);
    assert.equal(config[2].allow_google_signals, false);
    assert.equal(config[2].allow_ad_personalization_signals, false);
    assert.deepEqual((await views(page)).map(args => args[2]), [{
        send_to: 'G-F0SL23KPYG', page_location: 'https://open-aec.com/over-ons.html',
        page_title: 'OpenAEC', page_referrer: 'https://example.test/'
    }]);
    assert.ok(!JSON.stringify(queued).includes('private@example.test'));
    assert.ok(!JSON.stringify(queued).includes('account-123'));
    assert.equal(googleRequests(requests).length, 1);
    assert.equal(googleRequests(requests)[0].referrer, '');
    assert.equal(requests.some(request => new URL(request.url).pathname.endsWith('analytics-sites.json')), false);
});

test('history changes track public paths once and ignore query and hash changes', async t => {
    const { page } = await fixture(t);
    await accept(page);
    await page.evaluate(() => history.pushState({}, '', '/nieuws/?query=private#secret'));
    await page.waitForFunction(() => window.dataLayer.filter(args => args[0] === 'event').length === 2);
    await page.evaluate(() => {
        history.replaceState({}, '', '/nieuws/?query=another#other');
        dispatchEvent(new HashChangeEvent('hashchange'));
        dispatchEvent(new PopStateEvent('popstate'));
    });
    await page.waitForTimeout(50);
    assert.deepEqual((await views(page)).map(args => args[2].page_location), [
        'https://open-aec.com/over-ons.html', 'https://open-aec.com/nieuws/'
    ]);
    await page.evaluate(() => history.back());
    await page.waitForFunction(() => window.dataLayer.filter(args => args[0] === 'event').length === 3);
    assert.equal((await views(page))[2][2].page_location, 'https://open-aec.com/over-ons.html');
});

test('revocation disables measurement, clears analytics cookies and reloads without a tag', async t => {
    const { context, page, requests } = await fixture(t);
    await accept(page);
    await context.addCookies([
        { name: '_ga', value: 'test', domain: 'open-aec.com', path: '/', secure: true },
        { name: '_ga_F0SL23KPYG', value: 'test', domain: '.open-aec.com', path: '/', secure: true },
        { name: 'functional', value: 'keep', domain: 'open-aec.com', path: '/', secure: true }
    ]);
    await page.click('#analytics-settings');
    const before = googleRequests(requests).length;
    await Promise.all([page.waitForEvent('load'), page.click('#analytics-deny')]);
    assert.equal(await page.evaluate(() => window['ga-disable-G-F0SL23KPYG']), true);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), consentKey), 'denied');
    assert.equal(await page.locator('#openaec-google-tag').count(), 0);
    assert.equal(googleRequests(requests).length, before);
    const cookies = await context.cookies();
    assert.equal(cookies.some(cookie => cookie.name === '_ga' || cookie.name.startsWith('_ga_')), false);
    assert.equal(cookies.find(cookie => cookie.name === 'functional')?.value, 'keep');
});

test('loading the central loader twice creates one interface, one tag and one view', async t => {
    const { page, requests } = await fixture(t);
    await page.addScriptTag({ content: source });
    assert.equal(await page.locator('#analytics-consent').count(), 1);
    assert.equal(await page.locator('#analytics-settings').count(), 1);
    await accept(page);
    await page.addScriptTag({ content: source });
    assert.equal(await page.locator('#openaec-google-tag').count(), 1);
    assert.equal((await views(page)).length, 1);
    assert.equal(googleRequests(requests).length, 1);
});

test('all eighteen registered hosts select their own stream and preserve only public paths', async t => {
    assert.equal(sites.length, 18);
    assert.equal(new Set(sites.map(site => site.hostname)).size, 18);
    assert.equal(sites.find(site => site.hostname === 'open-aec.com').measurementId, 'G-F0SL23KPYG');
    assert.equal(sites.find(site => site.hostname === 'open-calc-studio.open-aec.com').measurementId, 'G-JYYSL31SP3');
    for (const site of sites) await t.test(site.hostname, async t => {
        const { page, requests } = await fixture(t, {
            url: `https://${site.hostname}/documents/account-123?email=private@example.test#private`, choice: 'granted'
        });
        await page.waitForFunction(() => (window.dataLayer || []).some(args => args[0] === 'event'));
        assert.equal(await page.locator('#openaec-google-tag').getAttribute('src'),
            `https://www.googletagmanager.com/gtag/js?id=${site.measurementId}`);
        const expectedPath = ['open-aec.com', 'www.opencadstudio.com'].includes(site.hostname) ? '/documents/account-123' : '/';
        assert.equal((await views(page))[0][2].page_location, `https://${site.hostname}${expectedPath}`);
        assert.equal((await views(page))[0][2].page_title, site.siteName);
        await page.evaluate(() => history.pushState({}, '', '/accounts/another-id?private=yes#secret'));
        await page.waitForTimeout(25);
        assert.equal((await views(page)).length, expectedPath === '/' ? 1 : 2);
        assert.equal(googleRequests(requests).length, 1);
    });
});

test('unknown hosts, insecure origins and nonstandard ports cannot initialize analytics', async t => {
    for (const url of [
        'https://localhost/', 'http://open-aec.com/', 'https://open-aec.com:8443/',
        'https://evil.test/', 'https://open-aec.com.evil.test/', 'https://www.open-aec.com/'
    ]) await t.test(url, async t => {
        const { page, requests } = await fixture(t, { url, choice: 'granted' });
        assert.equal(await page.locator('#analytics-consent, #analytics-settings, #openaec-google-tag').count(), 0);
        assert.equal(await page.evaluate(() => typeof window.OpenAECStatistics), 'undefined');
        assert.equal(googleRequests(requests).length, 0);
    });
});

test('a registered host inside an iframe cannot initialize analytics', async t => {
    const { page, requests } = await fixture(t, { url: 'https://evil.test/' });
    const navigation = page.waitForEvent('framenavigated', {
        predicate: frame => frame.url().startsWith('https://open-aec.com/')
    });
    await page.evaluate(() => {
        const iframe = document.createElement('iframe');
        iframe.src = 'https://open-aec.com/embedded?account=123';
        document.body.appendChild(iframe);
    });
    const frame = await navigation;
    assert.ok(frame);
    await frame.waitForLoadState('load');
    assert.equal(await frame.locator('#analytics-consent, #analytics-settings, #openaec-google-tag').count(), 0);
    assert.equal(await frame.evaluate(() => typeof window.OpenAECStatistics), 'undefined');
    assert.equal(googleRequests(requests).length, 0);
});
