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

// A release with packages for two processors: the ten files of Open Pointcloud
// Studio 0.8.0, each published with a checksum file beside it. Every key has
// to end up on its own file, in whatever order the API lists them.
const pointcloudRepo = 'OpenAEC-Foundation/open-pointcloud-studio';
const pointcloudFiles = {
  windows: 'open-pointcloud-studio_0.8.0_x64-setup.exe',
  'windows-zip': 'open-pointcloud-studio_0.8.0_windows-x64.zip',
  macos: 'open-pointcloud-studio_0.8.0_macos-universal.dmg',
  'macos-tar': 'open-pointcloud-studio_0.8.0_macos-universal.tar.gz',
  'linux-appimage': 'open-pointcloud-studio_0.8.0_amd64.AppImage',
  'linux-arm64-appimage': 'open-pointcloud-studio_0.8.0_arm64.AppImage',
  'linux-deb': 'open-pointcloud-studio_0.8.0_amd64.deb',
  'linux-arm64-deb': 'open-pointcloud-studio_0.8.0_arm64.deb',
  'linux-tar': 'open-pointcloud-studio_0.8.0_linux-amd64.tar.gz',
  'linux-arm64-tar': 'open-pointcloud-studio_0.8.0_linux-arm64.tar.gz',
};
const pointcloudNames = Object.values(pointcloudFiles);
const checksumNames = pointcloudNames.map(name => `${name}.sha256`);
const pointcloudAsset = (tag, name) => ({
  name,
  browser_download_url: `https://github.com/${pointcloudRepo}/releases/download/${tag}/${name}`,
  size: 1000,
});
const pointcloudRelease = names => ({ assets: names.map(name => pointcloudAsset('v0.8.0', name)) });

// The same orders on every run: a small generator with a fixed seed.
function shuffled(list, seed) {
  const out = list.slice();
  let state = seed;
  const next = () => (state = (state * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

test('gives every file of a release with x86-64 and ARM packages its own key, in any order', () => {
  const everything = pointcloudNames.concat(checksumNames);
  const armFirst = everything.filter(name => /arm64/.test(name))
    .concat(everything.filter(name => !/arm64/.test(name)));
  const orders = {
    'as published': everything,
    'by name, as the API lists them': everything.slice().sort(),
    reversed: everything.slice().reverse(),
    'reversed by name': everything.slice().sort().reverse(),
    'checksums first': checksumNames.concat(pointcloudNames),
    'ARM files first': armFirst,
    'ARM files last': armFirst.slice().reverse(),
  };
  for (let seed = 1; seed <= 200; seed++) orders[`shuffle ${seed}`] = shuffled(everything, seed);

  for (const [label, names] of Object.entries(orders)) {
    const found = downloads.downloadsForRelease(pointcloudRelease(names), pointcloudRepo);
    assert.deepEqual(Object.keys(found).sort(), Object.keys(pointcloudFiles).sort(), label);
    for (const [platform, name] of Object.entries(pointcloudFiles)) {
      assert.equal(found[platform].name, name, `${label}: ${platform}`);
      assert.equal(found[platform].url,
        `https://github.com/${pointcloudRepo}/releases/download/v0.8.0/${name}`, `${label}: ${platform}`);
    }
  }
});

test('checksum files are no downloads', () => {
  for (const name of checksumNames) assert.equal(downloads.platformFor(name), null, name);
  assert.deepEqual(downloads.downloadsForRelease(pointcloudRelease(checksumNames), pointcloudRepo), {});
  const releases = [
    { tag_name: 'v0.8.1', published_at: '2026-10-05T12:00:00Z', assets: checksumNames.map(name => pointcloudAsset('v0.8.1', name)) },
    { tag_name: 'v0.8.0', published_at: '2026-10-04T12:00:00Z', assets: pointcloudNames.concat(checksumNames).map(name => pointcloudAsset('v0.8.0', name)) },
  ];
  assert.equal(downloads.selectLatestRelease(releases, pointcloudRepo).tag_name, 'v0.8.0');
});

test('an x86-64 button never gets an ARM file and an ARM button never an x86-64 file', () => {
  const x86Keys = ['linux-appimage', 'linux-deb', 'linux-tar'];
  const armKeys = ['linux-arm64-appimage', 'linux-arm64-deb', 'linux-arm64-tar'];
  const armNames = [
    'open-pointcloud-studio_0.8.0_arm64.AppImage',
    'open-pointcloud-studio_0.8.0_arm64.deb',
    'open-pointcloud-studio_0.8.0_linux-arm64.tar.gz',
    'App_1.0.0_aarch64.AppImage',
    'app-1.0.0-aarch64.AppImage',
    'App_1.0.0_arm64.deb',
    'app-1.0.0-linux-aarch64.tar.gz',
  ];
  const x86Names = [
    'open-pointcloud-studio_0.8.0_amd64.AppImage',
    'open-pointcloud-studio_0.8.0_amd64.deb',
    'open-pointcloud-studio_0.8.0_linux-amd64.tar.gz',
    'open-pointcloud-studio-v0.7.0-linux.tar.gz',
    'App_1.0.0_amd64.AppImage',
    'App-1.0.0-linux-x86_64.AppImage',
    'App_1.0.0_amd64.deb',
  ];
  for (const name of armNames) assert.ok(armKeys.includes(downloads.platformFor(name)), name);
  for (const name of x86Names) assert.ok(x86Keys.includes(downloads.platformFor(name)), name);

  // A release with ARM packages only: nothing for an x86-64 button, and
  // nothing for a visitor whose system is detected as Linux.
  const armOnly = downloads.downloadsForRelease(pointcloudRelease(armNames.slice(0, 3)), pointcloudRepo);
  assert.deepEqual(Object.keys(armOnly).sort(), armKeys);
  for (const key of x86Keys) assert.equal(downloads.pickAsset(armOnly, key, 'linux'), null);
  assert.equal(downloads.pickAsset(armOnly, null, 'linux'), null);
  assert.equal(downloads.pickAsset(armOnly, 'linux-arm64-deb', 'linux').name, 'open-pointcloud-studio_0.8.0_arm64.deb');

  // Two ARM AppImages and no x86-64 one: the second does not spill over.
  const twoArm = downloads.downloadsForRelease(
    pointcloudRelease(['App_1.0.0_aarch64.AppImage', 'App_1.0.0_arm64.AppImage']), pointcloudRepo);
  assert.deepEqual(Object.keys(twoArm), ['linux-arm64-appimage']);
});

test('keeps recognising the file names of earlier releases', () => {
  const earlier = {
    'open-pointcloud-studio-v0.7.0-windows-setup.exe': 'windows',
    'open-pointcloud-studio-v0.7.0-windows.zip': 'windows-zip',
    'open-pointcloud-studio-v0.7.0-macos.tar.gz': 'macos-tar',
    'open-pointcloud-studio-v0.7.0-linux.tar.gz': 'linux-tar',
    'Open.Calc.Studio_0.13.0_x64-setup.exe': 'windows',
    'Open.Calc.Studio_0.13.0_x64_en-US.msi': 'windows-msi',
    'Open.Calc.Studio_0.13.0_aarch64.dmg': 'macos',
    'Open.Calc.Studio_0.13.0_amd64.AppImage': 'linux-appimage',
    'Open.Calc.Studio_0.13.0_amd64.deb': 'linux-deb',
    'Open.Calc.Studio-0.13.0-1.x86_64.rpm': 'linux-rpm',
    'app-release.apk': 'android',
  };
  for (const [name, platform] of Object.entries(earlier)) {
    assert.equal(downloads.platformFor(name), platform, name);
  }
  for (const name of ['latest.json', 'App_1.0.0_amd64.AppImage.sig', 'App_1.0.0_x64-setup.nsis.zip',
    'App_aarch64.app.tar.gz', 'App_1.0.0_amd64.AppImage.tar.gz', 'source.zip']) {
    assert.equal(downloads.platformFor(name), null, name);
  }
});

test('offers the 0.8.0 package for the visitor OS and prefers that release over 0.7.0', () => {
  const available = downloads.downloadsForRelease(
    pointcloudRelease(pointcloudNames.concat(checksumNames).sort()), pointcloudRepo);
  assert.equal(downloads.pickAsset(available, null, 'windows').name, pointcloudFiles.windows);
  assert.equal(downloads.pickAsset(available, null, 'macos').name, pointcloudFiles.macos);
  assert.equal(downloads.pickAsset(available, null, 'linux').name, pointcloudFiles['linux-appimage']);
  for (const [platform, name] of Object.entries(pointcloudFiles)) {
    assert.equal(downloads.pickAsset(available, platform, 'windows').name, name, platform);
  }

  const releases = [
    { tag_name: 'v0.7.0', published_at: '2026-10-03T00:22:13Z', assets: [
      'open-pointcloud-studio-v0.7.0-linux.tar.gz', 'open-pointcloud-studio-v0.7.0-linux.tar.gz.sha256',
      'open-pointcloud-studio-v0.7.0-macos.tar.gz', 'open-pointcloud-studio-v0.7.0-macos.tar.gz.sha256',
      'open-pointcloud-studio-v0.7.0-windows-setup.exe', 'open-pointcloud-studio-v0.7.0-windows-setup.exe.sha256',
      'open-pointcloud-studio-v0.7.0-windows.zip', 'open-pointcloud-studio-v0.7.0-windows.zip.sha256',
    ].map(name => pointcloudAsset('v0.7.0', name)) },
    { tag_name: 'v0.8.0', published_at: '2026-10-04T12:00:00Z', assets: pointcloudRelease(pointcloudNames.concat(checksumNames)).assets },
  ];
  assert.equal(downloads.selectLatestRelease(releases, pointcloudRepo).tag_name, 'v0.8.0');
  const before = downloads.downloadsForRelease(releases[0], pointcloudRepo);
  assert.deepEqual(Object.keys(before).sort(), ['linux-tar', 'macos-tar', 'windows', 'windows-zip']);
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

test('a button with a data-platform has a fallback file of that same platform', () => {
  for (const file of htmlFiles(root)) {
    const html = fs.readFileSync(file, 'utf8');
    for (const m of html.matchAll(/<a\s[^>]*data-gh-download="[^"]+"[^>]*>/g)) {
      const platform = m[0].match(/data-platform="([^"]+)"/)?.[1];
      if (!platform) continue;
      const name = (m[0].match(/href="([^"]+)"/)?.[1] || '').split('/').pop();
      assert.equal(downloads.platformFor(name), platform,
        `${path.relative(root, file)}: ${name} is no ${platform} file`);
    }
  }
});

test('the Open Pointcloud Studio page offers every package of one release, in every language', () => {
  const button = /<a\s[^>]*data-gh-download="OpenAEC-Foundation\/open-pointcloud-studio"[^>]*>/g;
  const linksIn = html => [...html.matchAll(button)].map(m => {
    const href = m[0].match(/href="([^"]+)"/)[1];
    return { href, tag: href.split('/').at(-2), platform: m[0].match(/data-platform="([^"]+)"/)?.[1] };
  });
  for (const language of ['', 'en/', 'fr/', 'tr/', 'es/']) {
    const label = language || 'nl/';
    const html = fs.readFileSync(path.join(root, language, 'open-pointcloud-studio', 'index.html'), 'utf8');
    const start = html.indexOf('id="download"');
    assert.ok(start >= 0, `${label}: download block missing`);
    const block = html.slice(start, html.indexOf('</section>', start));
    const hero = html.slice(html.indexOf('class="hero-downloads"'), start);

    assert.deepEqual(linksIn(block).map(link => link.platform).sort(), Object.keys(pointcloudFiles).sort(),
      `${label}: the download block needs one link for every package`);
    assert.deepEqual(linksIn(hero).map(link => link.platform), ['windows', 'macos', 'linux-appimage'],
      `${label}: the hero needs the installer, the disk image and the AppImage`);
    assert.equal(new Set(linksIn(html).map(link => link.tag)).size, 1,
      `${label}: all links must point at the same release`);
  }
});

// The markdown mirror of a tool (md/<tool>.md) offers direct downloads too,
// taken from the download data. For Open Pointcloud Studio these have to be
// the packages of the newest stable release, every one of them, and no file
// of an earlier release, however often that was downloaded.
const { summarise } = require(path.join(root, 'scripts', 'generate-downloads.js'));
const mirrors = require(path.join(root, 'scripts', 'build-markdown-mirrors.js'));

const counted = (tag, name, count) => ({
  ...pointcloudAsset(tag, name),
  download_count: count,
  size: 10 * 1024 * 1024,
  created_at: '2026-10-03T22:07:20Z',
});
const release = (tag, files, extra = {}) => ({
  tag_name: tag,
  published_at: '2026-10-03T22:29:36Z',
  assets: Object.entries(files).map(([name, count]) => counted(tag, name, count)),
  ...extra,
});
// As the API lists them: newest first, the files of a release by name. The
// files of 0.8.0 have no downloads yet, as on the day of the release.
const pointcloudReleases = [
  release('v0.9.0-rc.1', { 'open-pointcloud-studio_0.9.0-rc.1_x64-setup.exe': 12 }, { prerelease: true }),
  release('v0.8.1', { 'open-pointcloud-studio_0.8.1_x64-setup.exe': 0 }, { draft: true }),
  release('v0.8.0', Object.fromEntries(pointcloudNames.concat(checksumNames).sort().map(name => [name, 0]))),
  release('v0.7.0', {
    'open-pointcloud-studio-v0.7.0-linux.tar.gz': 1,
    'open-pointcloud-studio-v0.7.0-linux.tar.gz.sha256': 1,
    'open-pointcloud-studio-v0.7.0-macos.tar.gz': 1,
    'open-pointcloud-studio-v0.7.0-windows-setup.exe': 9,
    'open-pointcloud-studio-v0.7.0-windows.zip': 2,
  }),
  release('v0.4.2', { 'open-pointcloud-studio-v0.4.2-windows.zip': 4 }),
  release('v0.3.0', {
    'Open.Pointcloud.Studio_0.3.0_aarch64.dmg': 34,
    'Open.Pointcloud.Studio_0.3.0_amd64.AppImage': 40,
    'Open.Pointcloud.Studio_0.3.0_amd64.deb': 25,
    'Open.Pointcloud.Studio_0.3.0_x64-setup.exe': 150,
    'Open.Pointcloud.Studio_0.3.0_x64_en-US.msi': 32,
  }),
];
const pointcloudTool = mirrors.TOOLS.find(tool => tool.id === 'open-pointcloud-studio');
const stable = tag => ({ latestStable: { tag, url: `https://github.com/${pointcloudRepo}/releases/tag/${tag}` } });
const mirrorOf = (tool, summary, releaseInfo) => {
  const { _allAssets, ...perTool } = summary;
  const data = { perTool: [perTool], rankedByDownloads: [{ repo: perTool.repo, downloads: perTool.totalDownloads, releases: perTool.releases }] };
  return mirrors.buildToolMarkdown(tool, null, data, releaseInfo);
};
// The lines of the list of direct downloads, and its heading.
const directDownloads = markdown => {
  const lines = markdown.split('\n');
  const start = lines.findIndex(line => line.startsWith('## Direct downloads'));
  if (start < 0) return { heading: null, links: [] };
  const end = lines.findIndex((line, i) => i > start && (line.startsWith('## ') || line === '---'));
  return { heading: lines[start], links: lines.slice(start + 1, end).filter(line => line.startsWith('- [')) };
};

test('the download data holds every package of the newest stable release, without its checksum files', () => {
  const summary = summarise('open-pointcloud-studio', pointcloudReleases);
  assert.deepEqual(summary.latestAssets.map(a => a.name), pointcloudNames.slice().sort());
  for (const a of summary.latestAssets) {
    assert.equal(a.tag, 'v0.8.0', a.name);
    assert.equal(a.url, `https://github.com/${pointcloudRepo}/releases/download/v0.8.0/${a.name}`);
    assert.equal(a.sizeMB, 10, a.name);
  }
  // The ranking of all releases cannot serve as that list: it holds no file
  // of 0.8.0 at all, and no checksum file.
  assert.equal(summary.topAssets.length, 10);
  assert.deepEqual(summary.topAssets.filter(a => a.tag === 'v0.8.0'), []);
  assert.deepEqual(summary.topAssets.filter(a => /\.sha256$/.test(a.name)), []);
  assert.equal(summary.topAssets[0].name, 'Open.Pointcloud.Studio_0.3.0_x64-setup.exe');

  // No stable release yet: the first pre-release. No release with files: nothing.
  assert.deepEqual(summarise('x', pointcloudReleases.slice(0, 2)).latestAssets.map(a => a.tag), ['v0.9.0-rc.1']);
  assert.deepEqual(summarise('x', []).latestAssets, []);
});

test('the mirror of Open Pointcloud Studio offers the packages of the newest release and marks the ARM ones', () => {
  const summary = summarise('open-pointcloud-studio', pointcloudReleases);
  const { heading, links } = directDownloads(mirrorOf(pointcloudTool, summary, stable('v0.8.0')));
  assert.equal(heading, '## Direct downloads (current release)');
  assert.deepEqual(
    links.map(line => line.match(/\]\(([^)]+)\)/)[1]),
    pointcloudNames.slice().sort().map(name => `https://github.com/${pointcloudRepo}/releases/download/v0.8.0/${name}`));
  for (const line of links) {
    const arm = /arm64/.test(line.match(/\]\(([^)]+)\)/)[1]);
    assert.equal(/64-bit ARM, experimental · /.test(line), arm, line);
  }
});

test('with download data from before the release, that mirror offers no file of an earlier release', () => {
  const summary = summarise('open-pointcloud-studio', pointcloudReleases);
  delete summary.latestAssets;
  const after = mirrorOf(pointcloudTool, summary, stable('v0.8.0'));
  assert.deepEqual(directDownloads(after), { heading: null, links: [] });
  assert.ok(after.includes(`https://github.com/${pointcloudRepo}/releases/tag/v0.8.0`));

  const before = directDownloads(mirrorOf(pointcloudTool, summary, stable('v0.7.0')));
  assert.equal(before.heading, '## Direct downloads (current release)');
  assert.equal(before.links.length, 3);
  for (const line of before.links) assert.match(line, /\/releases\/download\/v0\.7\.0\/open-pointcloud-studio-v0\.7\.0-/);
});

test('the mirror of any other tool keeps its list of most downloaded files', () => {
  const summary = summarise('open-calc-studio', pointcloudReleases);
  const tool = mirrors.TOOLS.find(t => t.id === 'open-calc-studio');
  const { heading, links } = directDownloads(mirrorOf(tool, summary, stable('v0.8.0')));
  assert.equal(heading, '## Direct downloads (most popular)');
  assert.equal(links.length, 8);
  assert.match(links[0], /^- \[Windows · Open\.Pointcloud\.Studio_0\.3\.0_x64-setup\.exe\]/);
  assert.ok(links.every(line => !line.includes('/v0.8.0/')));
});
