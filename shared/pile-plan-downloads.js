// Direct downloads for the newest published Open Pile Plan Studio release.
// The HTML contains a working Windows fallback when this request cannot run.
(function () {
  'use strict';

  const API = 'https://api.github.com/repos/OpenAEC-Foundation/pile-plan-studio/releases?per_page=20';
  const ASSET_PATH = '/OpenAEC-Foundation/pile-plan-studio/releases/download/';
  const formats = {
    windows: /_x64-setup\.exe$/i,
    macos: /_universal\.dmg$/i,
    'linux-deb': /_amd64\.deb$/i,
    'linux-appimage': /_amd64\.appimage$/i,
  };

  function downloadsForRelease(release) {
    const result = {};
    for (const asset of release?.assets || []) {
      if (typeof asset.name !== 'string' || typeof asset.browser_download_url !== 'string') continue;
      let url;
      let filename;
      try {
        url = new URL(asset.browser_download_url);
        filename = decodeURIComponent(url.pathname.split('/').pop());
      } catch (_) { continue; }
      if (url.protocol !== 'https:' || url.hostname !== 'github.com' ||
          !url.pathname.startsWith(ASSET_PATH) ||
          filename !== asset.name) continue;

      for (const [platform, pattern] of Object.entries(formats)) {
        if (pattern.test(asset.name) && !result[platform]) {
          result[platform] = { url: url.href, size: asset.size };
          break;
        }
      }
    }
    return result;
  }

  function selectLatestRelease(releases) {
    if (!Array.isArray(releases)) return null;
    return releases
      .filter(release => !release.draft && release.tag_name &&
        Number.isFinite(Date.parse(release.published_at)) &&
        Object.keys(downloadsForRelease(release)).length > 0)
      .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))[0] || null;
  }

  function applyRelease(release) {
    const available = downloadsForRelease(release);
    if (!Object.keys(available).length) return;

    document.querySelectorAll('[data-pile-download]').forEach(card => {
      const asset = available[card.getAttribute('data-pile-download')];
      card.hidden = !asset;
      if (!asset) return;
      card.querySelector('[data-download-link]').href = asset.url;
      if (Number.isFinite(asset.size)) {
        card.querySelector('[data-download-size]').textContent =
          (asset.size / 1048576).toFixed(1) + ' MB';
      }
    });
    document.querySelectorAll('[data-pile-download-version]').forEach(label => {
      label.textContent = release.tag_name;
    });
  }

  async function start() {
    try {
      const response = await fetch(API);
      if (!response.ok) return;
      const release = selectLatestRelease(await response.json());
      if (release) applyRelease(release);
    } catch (_) {
      // Keep the direct Windows installer URL baked into the HTML.
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { downloadsForRelease, selectLatestRelease };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  }
})();
