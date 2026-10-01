'use strict';

// Download buttons must start the download, not send visitors to a GitHub
// release page. Run with: node --test scripts/check-direct-downloads.test.js

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const downloads = require(path.join(root, 'shared', 'downloads.js'));
const repo = 'OpenAEC-Foundation/open-calc-studio';
const assetUrl = (tag, name) => `https://github.com/${repo}/releases/download/${tag}/${name}`;
const asset = (tag, name) => ({ name, browser_download_url: assetUrl(tag, name), size: 1000 });

test('prefers the newest stable release and falls back to a pre-release', () => {
  const releases = [
    { tag_name: 'v0.14.0-beta', prerelease: true, published_at: '2026-09-30T12:00:00Z', assets: [asset('v0.14.0-beta', 'Open.Calc.Studio_0.14.0_x64-setup.exe')] },
    { tag_name: 'v0.13.1', draft: true, published_at: '2026-09-29T12:00:00Z', assets: [asset('v0.13.1', 'Open.Calc.Studio_0.13.1_x64-setup.exe')] },
    { tag_name: 'v0.13.0', published_at: '2026-09-12T12:00:00Z', assets: [asset('v0.13.0', 'Open.Calc.Studio_0.13.0_x64-setup.exe')] },
    { tag_name: 'v0.12.0', published_at: '2026-08-12T12:00:00Z', assets: [asset('v0.12.0', 'Open.Calc.Studio_0.12.0_x64-setup.exe')] },
  ];
  assert.equal(downloads.selectLatestRelease(releases, repo).tag_name, 'v0.13.0');
  assert.equal(downloads.selectLatestRelease(releases.slice(0, 2), repo).tag_name, 'v0.14.0-beta');
  assert.equal(downloads.selectLatestRelease([], repo), null);
});

test('only offers installer assets from the repository itself', () => {
  const release = { assets: [
    asset('v1', 'App_1.0.0_x64-setup.exe'),
    asset('v1', 'App_1.0.0_x64_user-setup.exe'),
    asset('v1', 'App_1.0.0_universal.dmg'),
    asset('v1', 'App_1.0.0_amd64.AppImage'),
    asset('v1', 'App_1.0.0_amd64.AppImage.sig'),
    asset('v1', 'latest.json'),
    { name: 'App_1.0.0_amd64.deb', browser_download_url: 'https://example.org/App_1.0.0_amd64.deb' },
  ] };
  const found = downloads.downloadsForRelease(release, repo);
  assert.deepEqual(Object.keys(found).sort(), ['linux-appimage', 'macos', 'windows']);
  assert.equal(found.windows.name, 'App_1.0.0_x64-setup.exe');
});

test('picks the file for the visitor OS, with Windows as fallback', () => {
  const available = { windows: { url: 'w' }, macos: { url: 'm' }, 'linux-deb': { url: 'd' } };
  assert.equal(downloads.detectOS({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', platform: 'MacIntel' }), 'macos');
  assert.equal(downloads.detectOS({ userAgent: 'Mozilla/5.0 (Linux; Android 14)', platform: 'Linux armv8l' }), 'android');
  assert.equal(downloads.detectOS({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', platform: 'Win32' }), 'windows');
  assert.equal(downloads.pickAsset(available, null, 'macos').url, 'm');
  assert.equal(downloads.pickAsset(available, null, 'linux').url, 'd');
  assert.equal(downloads.pickAsset(available, null, 'android').url, 'w');
  assert.equal(downloads.pickAsset(available, 'windows', 'macos').url, 'w');
  assert.equal(downloads.pickAsset(available, 'android', 'android'), null);
});

const SKIP_DIRS = new Set(['old', 'nijmegen', 'presentation foundation', 'node_modules', 'marketing', 'docs']);
function htmlFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

test('no download button on the site links to a GitHub release page', () => {
  const releasePage = /^https:\/\/github\.com\/[^/]+\/[^/]+\/releases(\/latest|\/tag\/[^/"]+)?\/?$/;
  const offenders = [];
  for (const file of htmlFiles(root)) {
    const html = fs.readFileSync(file, 'utf8');
    for (const m of html.matchAll(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
      const [tag, href, label] = m;
      const isDownload = /download|télécharger|descargar|indir/i.test(label) ||
        /data-i18n="[^"]*download[^"]*"/i.test(tag);
      if (isDownload && releasePage.test(href)) {
        offenders.push(`${path.relative(root, file)}: ${href}`);
      }
    }
  }
  assert.deepEqual(offenders, [], 'download buttons must link to the installer file itself');
});

test('every direct-download button carries a working direct fallback URL', () => {
  for (const file of htmlFiles(root)) {
    const html = fs.readFileSync(file, 'utf8');
    for (const m of html.matchAll(/<a\s[^>]*data-gh-download="([^"]+)"[^>]*>/g)) {
      const href = m[0].match(/href="([^"]+)"/)?.[1] || '';
      assert.ok(href.startsWith(`https://github.com/${m[1]}/releases/download/`),
        `${path.relative(root, file)}: ${m[1]} button needs a direct installer href, found ${href}`);
      assert.ok(html.includes('/shared/downloads.js'),
        `${path.relative(root, file)}: uses data-gh-download but does not load shared/downloads.js`);
    }
  }
});
