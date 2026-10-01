// Direct downloads: download buttons point at the installer file itself, never
// at a GitHub release page.
//
//   <a href="<direct installer URL>" data-gh-download="owner/repo">            -> installer for the visitor's OS
//   <a href="<direct installer URL>" data-gh-download="owner/repo" data-platform="windows">  -> always that format
//
// The href in the HTML is a working direct link (the Windows installer of a
// known release), so the button works without JavaScript or when the GitHub
// API is rate limited. This script only swaps in the newest release and, for
// buttons without data-platform, the file that matches the visitor's OS.
(function () {
  'use strict';

  const formats = {
    windows: /_x64-setup\.exe$/i,
    'windows-msi': /\.msi$/i,
    macos: /\.dmg$/i,
    'linux-appimage': /\.appimage$/i,
    'linux-deb': /_amd64\.deb$/i,
    'linux-rpm': /\.rpm$/i,
    android: /\.apk$/i,
  };

  // Per detected OS: the formats to try, in order.
  const preference = {
    windows: ['windows', 'windows-msi'],
    macos: ['macos'],
    linux: ['linux-appimage', 'linux-deb', 'linux-rpm'],
    android: ['android'],
  };

  function downloadsForRelease(release, repo) {
    const assetPath = '/' + repo + '/releases/download/';
    const result = {};
    for (const asset of release?.assets || []) {
      if (typeof asset.name !== 'string' || typeof asset.browser_download_url !== 'string') continue;
      let url;
      try { url = new URL(asset.browser_download_url); } catch (_) { continue; }
      if (url.protocol !== 'https:' || url.hostname !== 'github.com' ||
          !url.pathname.toLowerCase().startsWith(assetPath.toLowerCase())) continue;
      for (const [platform, pattern] of Object.entries(formats)) {
        if (pattern.test(asset.name) && !result[platform]) {
          result[platform] = { url: url.href, name: asset.name, size: asset.size };
          break;
        }
      }
    }
    return result;
  }

  // Newest stable release with an installer; a pre-release only when the
  // project has no stable one yet.
  function selectLatestRelease(releases, repo) {
    if (!Array.isArray(releases)) return null;
    const usable = releases
      .filter(release => !release.draft && release.tag_name &&
        Number.isFinite(Date.parse(release.published_at)) &&
        Object.keys(downloadsForRelease(release, repo)).length > 0)
      .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at));
    return usable.find(release => !release.prerelease) || usable[0] || null;
  }

  function detectOS(nav) {
    const ua = String(nav?.userAgent || '');
    const platform = String(nav?.userAgentData?.platform || nav?.platform || '');
    if (/android/i.test(ua)) return 'android';
    if (/iphone|ipad|ipod/i.test(ua)) return null;
    if (/win/i.test(platform) || /windows/i.test(ua)) return 'windows';
    if (/mac/i.test(platform) || /mac os x/i.test(ua)) return 'macos';
    if (/linux|x11|cros/i.test(platform + ' ' + ua)) return 'linux';
    return null;
  }

  // The asset a button should point at, or null to keep the baked-in href.
  function pickAsset(available, platform, os) {
    if (platform) return available[platform] || null;
    for (const key of (preference[os] || []).concat(preference.windows)) {
      if (available[key]) return available[key];
    }
    return null;
  }

  async function start() {
    const links = document.querySelectorAll('a[data-gh-download]');
    const repos = new Set();
    links.forEach(a => repos.add(a.getAttribute('data-gh-download')));
    const os = detectOS(navigator);

    for (const repo of repos) {
      if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) continue;
      try {
        const response = await fetch('https://api.github.com/repos/' + repo + '/releases?per_page=15');
        if (!response.ok) continue;
        const release = selectLatestRelease(await response.json(), repo);
        if (!release) continue;
        const available = downloadsForRelease(release, repo);
        links.forEach(a => {
          if (a.getAttribute('data-gh-download') !== repo) return;
          const asset = pickAsset(available, a.getAttribute('data-platform'), os);
          if (!asset) return;
          a.href = asset.url;
          a.title = asset.name;
        });
      } catch (_) {
        // Keep the direct installer URL baked into the HTML.
      }
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { downloadsForRelease, selectLatestRelease, detectOS, pickAsset };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  }
})();
