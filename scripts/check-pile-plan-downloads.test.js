'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const logicPath = path.join(root, 'shared', 'pile-plan-downloads.js');
const downloads = fs.existsSync(logicPath) ? require(logicPath) : {};
const assetUrl = (tag, name) =>
  `https://github.com/OpenAEC-Foundation/pile-plan-studio/releases/download/${tag}/${name}`;

test('uses the newest published release with an installer, including alpha releases', () => {
  assert.equal(typeof downloads.selectLatestRelease, 'function');
  const windows = {
    name: 'Open.Pile.Plan.Studio_0.4.1_x64-setup.exe',
    browser_download_url: assetUrl('v0.4.1-alpha', 'Open.Pile.Plan.Studio_0.4.1_x64-setup.exe'),
    size: 7285984,
  };
  const releases = [
    { tag_name: 'v0.4.3-alpha', draft: false, published_at: '2026-09-26T12:00:00Z', assets: [{ name: 'source.zip' }] },
    { tag_name: 'v0.4.2-alpha', draft: true, published_at: '2026-09-25T12:00:00Z', assets: [windows] },
    { tag_name: 'v0.4.0-alpha', draft: false, published_at: '2026-09-21T12:00:00Z', assets: [windows] },
    { tag_name: 'v0.4.1-alpha', draft: false, prerelease: true, published_at: '2026-09-23T12:00:00Z', assets: [windows] },
  ];

  assert.equal(downloads.selectLatestRelease(releases).tag_name, 'v0.4.1-alpha');
  assert.equal(downloads.selectLatestRelease([]), null);
});

test('offers only actual installer assets and their direct download URLs', () => {
  assert.equal(typeof downloads.downloadsForRelease, 'function');
  const release = {
    assets: [
      { name: 'Open.Pile.Plan.Studio_0.4.1_x64-setup.exe', browser_download_url: assetUrl('v0.4.1-alpha', 'Open.Pile.Plan.Studio_0.4.1_x64-setup.exe'), size: 7285984 },
      { name: 'Open.Pile.Plan.Studio_0.4.1_universal.dmg', browser_download_url: assetUrl('v0.4.1-alpha', 'Open.Pile.Plan.Studio_0.4.1_universal.dmg'), size: 10000000 },
      { name: 'source.zip', browser_download_url: assetUrl('v0.4.1-alpha', 'source.zip'), size: 1000 },
      { name: 'other_amd64.deb', browser_download_url: 'https://example.org/other_amd64.deb', size: 1000 },
      { name: 'bad_x64-setup.exe', browser_download_url: 'https://github.com/OpenAEC-Foundation/pile-plan-studio/releases/download/v0.4.1-alpha/bad%XX_x64-setup.exe', size: 1000 },
    ],
  };

  assert.deepEqual(downloads.downloadsForRelease(release), {
    windows: { url: assetUrl('v0.4.1-alpha', 'Open.Pile.Plan.Studio_0.4.1_x64-setup.exe'), size: 7285984 },
    macos: { url: assetUrl('v0.4.1-alpha', 'Open.Pile.Plan.Studio_0.4.1_universal.dmg'), size: 10000000 },
  });
});

test('every language page works without JavaScript and links to the installer, not a release page', () => {
  const installer = assetUrl('v0.4.1-alpha', 'Open.Pile.Plan.Studio_0.4.1_x64-setup.exe');
  for (const language of ['', 'en/', 'fr/', 'tr/', 'es/']) {
    const html = fs.readFileSync(path.join(root, language, 'open-pile-plan-studio', 'index.html'), 'utf8');
    assert.ok(html.includes('id="download"'), `${language || 'nl/'}: download block missing`);
    assert.ok(html.includes(`href="${installer}"`), `${language || 'nl/'}: installer fallback missing`);
    assert.ok(html.includes('href="#download"'), `${language || 'nl/'}: download navigation missing`);
  }
});

test('download block follows the screenshots and full introduction in every language', () => {
  for (const language of ['', 'en/', 'fr/', 'tr/', 'es/']) {
    const html = fs.readFileSync(path.join(root, language, 'open-pile-plan-studio', 'index.html'), 'utf8');
    const screenshots = html.indexOf('class="media-slider"');
    const introduction = html.indexOf('class="explainer"');
    const introductionEnd = html.indexOf('</div>', introduction);
    const download = html.indexOf('id="download"');
    const why = html.indexOf('data-i18n="why.title"');

    assert.ok(screenshots >= 0 && introduction >= 0 && introductionEnd >= 0 &&
      download >= 0 && why >= 0, `${language || 'nl/'}: required page section missing`);
    assert.ok(screenshots < introduction && introductionEnd < download && download < why,
      `${language || 'nl/'}: download should follow the introduction and precede Why`);
  }
});
