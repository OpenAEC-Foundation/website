/* Vrijwillige bezoekersstatistieken: Basic Consent Mode, geen tag zonder toestemming.
 * Enhanced Measurement moet ook in de GA4-webstream uit staan: alleen onze
 * opgeschoonde page_view-events worden verstuurd, geen formulieren/zoekopdrachten.
 * https://developers.google.com/tag-platform/security/concepts/consent-mode
 * https://developers.google.com/analytics/devguides/collection/ga4/views
 */
(function (global) {
    'use strict';
    var sites = [{"hostname":"open-aec.com","measurementId":"G-F0SL23KPYG","siteName":"OpenAEC","publicPaths":true},{"hostname":"open-calc-studio.open-aec.com","measurementId":"G-JYYSL31SP3","siteName":"Open Calc Studio","publicPaths":false},{"hostname":"open-energy-studio.open-aec.com","measurementId":"G-LVNNXLYVRE","siteName":"Open Energy Studio","publicPaths":false},{"hostname":"open-safety-studio.open-aec.com","measurementId":"G-N5RD53RZC6","siteName":"Open Safety Studio","publicPaths":false},{"hostname":"open-pdf-studio.open-aec.com","measurementId":"G-8EC0532L3Y","siteName":"Open PDF Studio","publicPaths":false},{"hostname":"pile-plan-studio.open-aec.com","measurementId":"G-PZREN5RHXL","siteName":"Open Pile Plan Studio","publicPaths":false},{"hostname":"open-geotechniek-studio.open-aec.com","measurementId":"G-R5YRR0BJDH","siteName":"Open Geotechniek Studio","publicPaths":false},{"hostname":"www.opencadstudio.com","measurementId":"G-R1BC55C597","siteName":"Open CAD Studio","publicPaths":true},{"hostname":"open-3d-viewer.open-aec.com","measurementId":"G-X5V42XQQGT","siteName":"Open 3D Viewer","publicPaths":false},{"hostname":"open-planner-studio.open-aec.com","measurementId":"G-NFY8J768D0","siteName":"Open Planner Studio","publicPaths":false},{"hostname":"open-calculations-studio.open-aec.com","measurementId":"G-RWP33R2L3P","siteName":"Open Structural Calculation Studio","publicPaths":false},{"hostname":"open-heatloss-studio.open-aec.com","measurementId":"G-CQ1ZE1ZY6B","siteName":"Open Heatloss Studio","publicPaths":false},{"hostname":"open-books.open-aec.com","measurementId":"G-4DPGVSXBRN","siteName":"Open Books Studio","publicPaths":false},{"hostname":"monty-ifc-viewer.open-aec.com","measurementId":"G-P5NJB2GLK3","siteName":"Monty IFC Viewer","publicPaths":false},{"hostname":"open-field-studio.open-aec.com","measurementId":"G-K4HZJS2HWQ","siteName":"Open Field Studio","publicPaths":false},{"hostname":"ifccad-explorer.open-aec.com","measurementId":"G-B686L3E8V0","siteName":"IFCCAD Explorer","publicPaths":false},{"hostname":"open-feedback-studio.open-aec.com","measurementId":"G-RGW1KSKR03","siteName":"Open Feedback Studio","publicPaths":false},{"hostname":"y-app.impertio.app","measurementId":"G-094583J40R","siteName":"Y-app","publicPaths":false}];
    var config = sites.find(function (site) { return site.hostname === global.location.hostname; });
    if (!config) return;
    if (global.OpenAECStatistics || global.top !== global.self ||
        global.location.protocol !== 'https:' || global.location.hostname !== config.hostname ||
        global.location.port || !/^G-[A-Z0-9]+$/.test(config.measurementId)) return;

    var storageKey = 'openaec_statistics_consent_v1';
    var choice = readChoice();
    var loaded = false;
    var lastPage = null;
    var scheduled = false;
    var panel;
    var settingsButton;
    var disableKey = 'ga-disable-' + config.measurementId;
    global[disableKey] = choice !== 'granted';

    function readChoice() {
        try { return global.localStorage.getItem(storageKey); }
        catch (_) { return null; }
    }

    function safeLocation() {
        return global.location.origin + (config.publicPaths ? global.location.pathname : '/');
    }

    function safeReferrer() {
        try { return document.referrer ? new URL(document.referrer).origin + '/' : ''; }
        catch (_) { return ''; }
    }

    function command() { global.dataLayer.push(arguments); }

    function pageView() {
        if (choice !== 'granted' || !loaded || global[disableKey]) return;
        var page = safeLocation();
        if (lastPage === page) return;
        lastPage = page;
        command('event', 'page_view', {
            send_to: config.measurementId,
            page_location: page,
            page_title: config.siteName,
            page_referrer: safeReferrer()
        });
    }

    function schedulePageView() {
        if (scheduled) return;
        scheduled = true;
        global.setTimeout(function () { scheduled = false; pageView(); }, 0);
    }

    function enable() {
        global[disableKey] = false;
        if (loaded) { pageView(); return; }
        loaded = true;
        global.dataLayer = global.dataLayer || [];
        global.gtag = command;
        command('consent', 'default', {
            analytics_storage: 'denied', ad_storage: 'denied',
            ad_user_data: 'denied', ad_personalization: 'denied'
        });
        command('consent', 'update', {
            analytics_storage: 'granted', ad_storage: 'denied',
            ad_user_data: 'denied', ad_personalization: 'denied'
        });
        command('js', new Date());
        command('set', 'ads_data_redaction', true);
        command('set', 'url_passthrough', false);
        command('config', config.measurementId, {
            send_page_view: false,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            page_location: safeLocation(),
            page_title: config.siteName,
            page_referrer: safeReferrer(),
            // Geen campagnewaarden uit querystrings overnemen.
            campaign_id: '(not set)', campaign_name: '(not set)', campaign_source: '(direct)',
            campaign_medium: '(none)', campaign_term: '(not set)', campaign_content: '(not set)',
            cookie_domain: config.hostname,
            cookie_flags: 'SameSite=Lax;Secure',
            cookie_expires: 60 * 60 * 24 * 180
        });
        var tag = document.createElement('script');
        tag.id = 'openaec-google-tag';
        tag.async = true;
        tag.referrerPolicy = 'no-referrer';
        tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + config.measurementId;
        document.head.appendChild(tag);
        pageView();
    }

    function clearCookies() {
        document.cookie.split(';').forEach(function (entry) {
            var name = entry.split('=')[0].trim();
            if (name !== '_ga' && name.indexOf('_ga_') !== 0) return;
            ['', '; domain=' + config.hostname, '; domain=.' + config.hostname].forEach(function (domain) {
                document.cookie = name + '=; Max-Age=0; path=/' + domain + '; SameSite=Lax; Secure';
            });
        });
    }

    function choose(value, persist) {
        var wasLoaded = loaded;
        choice = value;
        // De officiële opt-out-vlag staat vóór verdere tag-/consentcommando's.
        global[disableKey] = value !== 'granted';
        if (persist !== false) {
            try { global.localStorage.setItem(storageKey, value); } catch (_) { /* Keuze geldt voor deze pagina. */ }
        }
        panel.hidden = true;
        settingsButton.setAttribute('aria-expanded', 'false');
        if (value === 'granted') enable();
        else {
            clearCookies();
            if (wasLoaded) {
                // Geen denied-consentping: stop de geladen tag en laad zonder tag opnieuw.
                var tag = document.getElementById('openaec-google-tag');
                if (tag) tag.remove();
                global.location.reload();
            }
        }
    }

    function init() {
        var style = document.createElement('style');
        style.textContent = '#analytics-consent{position:fixed;bottom:calc(64px + env(safe-area-inset-bottom,0px));right:12px;z-index:10020;' +
            'box-sizing:border-box;width:min(390px,calc(100vw - 24px));max-height:calc(100vh - 84px - env(safe-area-inset-bottom,0px));overflow:auto;padding:18px;border:1px solid var(--border-soft,#d7d4ca);' +
            'border-radius:10px;background:var(--bg-surface,#fff);color:var(--text-primary,#142e42);' +
            'box-shadow:0 4px 24px #0003;font:15px/1.5 system-ui,sans-serif}' +
            '#analytics-consent[hidden]{display:none}#analytics-consent h2{font:600 18px system-ui;margin:0 0 8px}' +
            '#analytics-consent p{margin:0 0 12px}#analytics-consent .analytics-actions{display:flex;gap:10px;flex-wrap:wrap}' +
            '#analytics-consent button,#analytics-settings{font:inherit;cursor:pointer;border:1px solid #52686b;' +
            'border-radius:6px;padding:8px 12px;background:var(--bg-surface,#fff);color:var(--text-primary,#142e42)}' +
            '#analytics-consent button:focus-visible,#analytics-settings:focus-visible{outline:3px solid #c4a048;outline-offset:3px}' +
            '#analytics-settings{position:fixed;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:10019;font:13px system-ui;box-shadow:0 2px 8px #0002}';
        document.head.appendChild(style);
        panel = document.createElement('section');
        panel.id = 'analytics-consent';
        panel.setAttribute('aria-labelledby', 'analytics-title');
        panel.innerHTML = '<h2 id="analytics-title">Visitor statistics</h2>' +
            '<p>With your permission, we use Google Analytics to count visits. ' +
            'This sets cookies and sends technical visit data to Google. ' +
            'We do not send search terms, form content, or document names. ' +
            'You can change your choice using Statistics.</p>' +
            '<div class="analytics-actions"><button type="button" id="analytics-accept">Allow</button>' +
            '<button type="button" id="analytics-deny">Decline</button></div>';
        panel.hidden = choice === 'granted' || choice === 'denied';
        settingsButton = document.createElement('button');
        settingsButton.id = 'analytics-settings';
        settingsButton.type = 'button';
        settingsButton.textContent = 'Statistics';
        settingsButton.setAttribute('aria-controls', panel.id);
        settingsButton.setAttribute('aria-expanded', String(!panel.hidden));
        settingsButton.onclick = function () {
            panel.hidden = !panel.hidden;
            settingsButton.setAttribute('aria-expanded', String(!panel.hidden));
        };
        document.body.appendChild(panel);
        document.body.appendChild(settingsButton);
        document.getElementById('analytics-accept').onclick = function () { choose('granted'); };
        document.getElementById('analytics-deny').onclick = function () { choose('denied'); };
        if (choice === 'granted') enable();
    }

    global.OpenAECStatistics = { open: function () {
        if (panel) { panel.hidden = false; settingsButton.setAttribute('aria-expanded', 'true'); }
    } };
    ['pushState', 'replaceState'].forEach(function (method) {
        var original = global.history[method];
        global.history[method] = function () {
            var result = original.apply(this, arguments);
            schedulePageView();
            return result;
        };
    });
    global.addEventListener('hashchange', schedulePageView);
    global.addEventListener('popstate', schedulePageView);
    global.addEventListener('storage', function (event) {
        if (panel && event.key === storageKey && event.newValue !== choice) {
            choose(event.newValue === 'granted' ? 'granted' : 'denied', false);
        }
    });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})(window);
