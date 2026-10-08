// scripts/generate-downloads.js
// Aggregates download counts per repo and per platform from GitHub Releases.
const fs = require('fs');
const path = require('path');

const ORG = 'OpenAEC-Foundation';
const TOKEN = process.env.GITHUB_TOKEN;
const headers = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'OpenAEC-Downloads-Bot',
};
if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

// Tool repos to track downloads for
const TOOL_REPOS = [
  'open-pdf-studio',
  'open-2d-studio',
  'open-calc-studio',
  'open-energy-studio',
  'open-planner-studio',
  'open-pointcloud-studio',
  'open-heatloss-studio',
  'open-speech-studio',
  'Open-Field-Studio',
  'open-geotechniek-studio',
  'pile-plan-studio',
  'Open-Calculations-Studio',
  'monty-ifc-viewer',
  'OpenAEC-BIM-validator',
  'openaec-bcf-platform',
  'openaec-docs',
  'openaec-cloud',
  'Y-app',
  'openaec-installer',
  // Geen releases, dus 0 downloads — maar gemeten 0 is iets anders dan
  // ontbrekend: build-ecosystem-order.js laat ontbrekende data buiten de
  // weging, waardoor deze kaart anders onterecht zou stijgen.
  'open-books',
  // Community-project buiten de organisatie, telt wel mee in het ecosysteem.
  'HakanSeven12/OpenCADStudio',
];

// A checksum file is published beside a release file (NAME.sha256). Its
// downloads count for the repo, but it is no package for any system and no
// file to offer as a download, whatever the name before the extension says.
const isChecksum = (name) => /\.sha256$/i.test(name);

// Classify asset filename into platform/format
function classify(name) {
  const n = name.toLowerCase();
  if (isChecksum(n)) return 'Other';
  if (n.endsWith('.exe') || n.includes('_x64-setup') || n.includes('windows')) return 'Windows';
  if (n.endsWith('.msi') || n.endsWith('.msix')) return 'Windows (MSI)';
  if (n.endsWith('.dmg')) return 'macOS';
  if (n.endsWith('.pkg')) return 'macOS (pkg)';
  if (n.endsWith('.deb')) return 'Linux (deb)';
  if (n.endsWith('.rpm')) return 'Linux (rpm)';
  if (n.endsWith('.appimage')) return 'Linux (AppImage)';
  if (n.endsWith('.snap')) return 'Linux (snap)';
  if (n.endsWith('.flatpak')) return 'Linux (flatpak)';
  if (n.endsWith('.apk')) return 'Android';
  if (n.endsWith('.ipa')) return 'iOS';
  if (n.endsWith('.tar.gz') || n.endsWith('.tgz') || n.endsWith('.zip')) return 'Archive';
  if (n.endsWith('.sig') || n.endsWith('.pem') || n.endsWith('.asc')) return null; // skip sigs
  if (n === 'latest.json' || n.endsWith('.json')) return null; // skip updater manifests
  return 'Other';
}

async function ghFetch(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status}: ${url}`);
  return res.json();
}

async function fetchAllReleases(repo) {
  const all = [];
  let page = 1;
  while (true) {
    // Een repo mag 'eigenaar/naam' zijn; zonder schuine streep hoort hij bij de organisatie.
    const pad = repo.includes('/') ? repo : `${ORG}/${repo}`;
    const data = await ghFetch(`https://api.github.com/repos/${pad}/releases?per_page=100&page=${page}`);
    if (!Array.isArray(data) || data.length === 0) break;
    all.push(...data);
    page++;
  }
  return all;
}

// The release whose packages are the current downloads: the first one the API
// lists that is no draft, no pre-release and not the nightly build, which is
// how generate-release-notes.js picks latestStable. A repo with pre-releases
// only falls back to the first of those.
function newestRelease(releases) {
  const published = releases.filter(rel => !rel.draft && rel.tag_name !== 'nightly');
  return published.find(rel => !rel.prerelease) || published[0] || null;
}

// One file of a release, as the lists of downloads hold it.
function assetEntry(rel, asset, platform) {
  return {
    tag: rel.tag_name,
    name: asset.name,
    platform: platform,
    downloads: asset.download_count,
    sizeMB: Math.round(asset.size / 1024 / 1024 * 10) / 10,
    date: asset.created_at?.substring(0, 10),
    url: asset.browser_download_url,
  };
}

async function processRepo(repoPad) {
  return summarise(repoPad, await fetchAllReleases(repoPad));
}

// The download figures of one repo, from the releases the API returned.
function summarise(repoPad, releases) {
  // In de uitvoer staat alleen de repo-naam, ook bij een externe eigenaar,
  // zodat de rest van de site (statistieken, api/tools.json) blijft matchen.
  const repo = repoPad.includes('/') ? repoPad.split('/').pop() : repoPad;

  let totalDownloads = 0;
  let totalAssets = 0;
  const byPlatform = {};
  const byVersion = {};
  const topAssets = [];
  const allAssets = []; // for snapshot: every asset with id + count

  releases.forEach(rel => {
    const isNightly = rel.tag_name === 'nightly' || rel.prerelease;
    (rel.assets || []).forEach(asset => {
      const platform = classify(asset.name);
      if (!platform) return; // skip signatures, manifests

      totalDownloads += asset.download_count;
      totalAssets++;

      byPlatform[platform] = (byPlatform[platform] || 0) + asset.download_count;
      if (!isNightly) {
        byVersion[rel.tag_name] = (byVersion[rel.tag_name] || 0) + asset.download_count;
      }

      // Track every asset by id for daily snapshot
      allAssets.push({
        id: asset.id,
        repo,
        tag: rel.tag_name,
        name: asset.name,
        platform,
        downloads: asset.download_count,
      });

      if (asset.download_count > 0 && !isChecksum(asset.name)) {
        topAssets.push(assetEntry(rel, asset, platform));
      }
    });
  });

  topAssets.sort((a, b) => b.downloads - a.downloads);

  // Every package of the newest stable release, whatever its download count.
  // topAssets ranks the files of all releases together, so files of a
  // superseded release can fill it while the newest ones are still unknown.
  const newest = newestRelease(releases);
  const latestAssets = (newest?.assets || [])
    .filter(asset => classify(asset.name) && !isChecksum(asset.name))
    .map(asset => assetEntry(newest, asset, classify(asset.name)));

  return {
    repo,
    totalDownloads,
    totalAssets,
    releases: releases.length,
    byPlatform,
    byVersion,
    topAssets: topAssets.slice(0, 10),
    latestAssets,
    _allAssets: allAssets, // internal: for snapshot
  };
}

async function main() {
  console.log('Fetching download stats for', TOOL_REPOS.length, 'tools...\n');
  const perTool = [];

  for (const repo of TOOL_REPOS) {
    try {
      const data = await processRepo(repo);
      perTool.push(data);
      console.log(`  ${repo.padEnd(35)} ${String(data.totalDownloads).padStart(6)} downloads across ${data.totalAssets} assets`);
    } catch (e) {
      console.warn(`  ${repo}: error - ${e.message}`);
    }
  }

  // Aggregate totals
  const grandTotal = perTool.reduce((s, t) => s + t.totalDownloads, 0);
  const platformTotals = {};
  perTool.forEach(t => {
    Object.entries(t.byPlatform).forEach(([p, n]) => {
      platformTotals[p] = (platformTotals[p] || 0) + n;
    });
  });

  // Top tools by downloads
  const ranked = [...perTool].sort((a, b) => b.totalDownloads - a.totalDownloads);

  // Strip internal _allAssets before writing public file
  const publicPerTool = perTool.map(({ _allAssets, ...rest }) => rest);

  const output = {
    generated: new Date().toISOString(),
    grandTotal,
    totalRepos: perTool.length,
    platformTotals,
    rankedByDownloads: ranked.map(t => ({ repo: t.repo, downloads: t.totalDownloads, releases: t.releases })),
    perTool: publicPerTool,
  };

  const dataDir = path.join(__dirname, '..', 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'downloads.json'), JSON.stringify(output, null, 2));

  // Write compact daily snapshot for tracking deltas over time
  const historyDir = path.join(dataDir, 'history-downloads');
  fs.mkdirSync(historyDir, { recursive: true });
  const today = new Date().toISOString().substring(0, 10);
  const snapshot = {
    date: today,
    generated: output.generated,
    grandTotal,
    perRepo: {},
    perAsset: {},
  };
  perTool.forEach(t => {
    snapshot.perRepo[t.repo] = t.totalDownloads;
    t._allAssets.forEach(a => {
      snapshot.perAsset[a.id] = {
        repo: a.repo,
        tag: a.tag,
        platform: a.platform,
        downloads: a.downloads,
      };
    });
  });
  fs.writeFileSync(path.join(historyDir, `${today}.json`), JSON.stringify(snapshot, null, 2));

  // Cleanup snapshots older than 365 days
  const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString().substring(0, 10);
  fs.readdirSync(historyDir).forEach(f => {
    if (f.endsWith('.json') && f.substring(0, 10) < oneYearAgo) {
      fs.unlinkSync(path.join(historyDir, f));
    }
  });

  console.log(`\nGrand total: ${grandTotal} downloads across ${perTool.length} tools`);
  console.log('Per platform:');
  Object.entries(platformTotals).sort((a, b) => b[1] - a[1]).forEach(([p, n]) => {
    console.log(`  ${p.padEnd(20)} ${n}`);
  });
  console.log(`\nWritten to data/downloads.json + data/history-downloads/${today}.json`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
  });
}

module.exports = { classify, newestRelease, summarise };
