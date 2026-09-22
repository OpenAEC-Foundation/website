// scripts/generate-release-notes.js
// Fetches all releases from product repos, parses bodies into change items,
// groups by minor version, and writes /data/release-notes/{repo}.json
const fs = require('fs');
const path = require('path');

const ORG = 'OpenAEC-Foundation';
const TOKEN = process.env.GITHUB_TOKEN;
const headers = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'OpenAEC-Release-Notes-Bot',
};
if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

// Tool repos to generate release notes for
const TOOL_REPOS = [
  'open-pdf-studio',
  'open-2d-studio',
  'open-calc-studio',
  'open-energy-studio',
  'open-planner-studio',
  'open-pointcloud-studio',
  'open-heatloss-studio',
  'open-speech-studio',
  'open-field-studio',
  'open-frame-studio',
  'open-geotechniek-studio',
  'pile-plan-studio',
  'monty-ifc-viewer',
  'OpenAEC-BIM-validator',
  'openaec-bcf-platform',
  'openaec-docs',
  'openaec-cloud',
  'Y-app',
];

// Sommige repo's onderhouden een uitgebreide changelog met een sectie per
// uitgebrachte versie. Die tekst is de inhoudelijke tegenhanger van de korte
// release-body en is wat we op de productpagina willen tonen.
const CHANGELOG_PATHS = ['docs/CHANGELOG.md', 'CHANGELOG.md', 'RELEASE_NOTES.md'];

async function fetchChangelog(repo, fetchImpl = fetch) {
  for (const p of CHANGELOG_PATHS) {
    try {
      const res = await fetchImpl(
        `https://api.github.com/repos/${ORG}/${repo}/contents/${p}`,
        { headers: { ...headers, Accept: 'application/vnd.github.v3.raw' } }
      );
      if (res.ok) return await res.text();
    } catch (e) {}
  }
  return null;
}

// Haalt de sectie voor één versie uit de changelog. Koppen zien eruit als
// "## v2026.7.13 — 2026-07-27"; de sectie loopt tot de volgende "## ".
function extractChangelogSection(md, tag) {
  if (!md || !tag) return null;
  const lines = md.split('\n');
  const version = tag.replace(/^v/, '');
  const start = lines.findIndex(l =>
    /^##\s+/.test(l) && l.replace(/^##\s+/, '').replace(/^v/, '').startsWith(version)
  );
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) { end = i; break; }
  }
  const body = lines.slice(start + 1, end).join('\n').trim();
  return body || null;
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
    const data = await ghFetch(`https://api.github.com/repos/${ORG}/${repo}/releases?per_page=100&page=${page}`);
    if (!Array.isArray(data) || data.length === 0) break;
    all.push(...data);
    page++;
  }
  return all;
}

// Parse a release body into individual change items
function parseChanges(body) {
  if (!body) return [];
  const changes = [];

  // Strip boilerplate
  let cleaned = body
    .replace(/^### Downloads[\s\S]*?(?=^##|^###|$)/gm, '')
    .replace(/^## What's New in [^\n]*\n/gm, '')
    .replace(/^Free, open-source [^\n]*\n/g, '')
    .replace(/^Built from .*$/gm, '')
    .replace(/^Source: .*$/gm, '')
    .replace(/^Build version: .*$/gm, '');

  // Find bullet items (- or * at start of line)
  const lines = cleaned.split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^[\s]*[-*]\s+(.+)$/);
    if (match) {
      const item = match[1].trim();
      // Skip download lines
      if (/^\*?\*?(Windows|macOS|Linux|Android|Snap|Download)/.test(item)) continue;
      if (item.length < 4) continue;
      changes.push(item);
    }
  }

  return changes;
}

// Extract minor version: "v1.47.4" -> "1.47", "v0.7.8" -> "0.7"
function getMinorVersion(tag) {
  const m = tag.match(/v?(\d+)\.(\d+)/);
  if (!m) return tag;
  return `${m[1]}.${m[2]}`;
}

function getPatchNumber(tag) {
  const m = tag.match(/v?\d+\.\d+\.(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

async function processRepo(repo) {
  console.log(`\nProcessing ${repo}...`);
  const releases = await fetchAllReleases(repo);
  console.log(`  ${releases.length} releases found`);

  // Filter out nightly/draft
  let stable = releases.filter(r => !r.draft && !r.prerelease && r.tag_name !== 'nightly');

  // Alpha-only repos: when a repo has no stable release yet, surface the
  // prereleases instead so the product page still shows a release history.
  if (stable.length === 0) {
    stable = releases.filter(r => !r.draft && r.tag_name !== 'nightly');
  }

  // Per-repo exclusion of "bad" historical version ranges that pre-date a
  // version reset. Y-app reset from v1.x.x back down to v0.x.x in 2026-03,
  // so the old v1.x tags are confusing and should not be surfaced.
  const EXCLUDE_TAGS = {
    'Y-app': /^v1\./i,
  };
  if (EXCLUDE_TAGS[repo]) {
    const pattern = EXCLUDE_TAGS[repo];
    const before = stable.length;
    stable = stable.filter(r => !pattern.test(r.tag_name));
    console.log(`  excluding ${before - stable.length} legacy releases matching ${pattern} (pre-reset versions)`);
  }

  // Group by minor version
  const groups = {};
  stable.forEach(rel => {
    const minor = getMinorVersion(rel.tag_name);
    if (!groups[minor]) {
      groups[minor] = {
        minorVersion: minor,
        releases: [],
        allChanges: [],
        firstDate: rel.published_at?.substring(0, 10),
        lastDate: rel.published_at?.substring(0, 10),
      };
    }
    const changes = parseChanges(rel.body);
    groups[minor].releases.push({
      tag: rel.tag_name,
      name: rel.name || rel.tag_name,
      date: rel.published_at?.substring(0, 10),
      url: rel.html_url,
      changes: changes,
      patchNum: getPatchNumber(rel.tag_name),
    });
    groups[minor].allChanges.push(...changes);
    if (rel.published_at?.substring(0, 10) < groups[minor].firstDate) {
      groups[minor].firstDate = rel.published_at?.substring(0, 10);
    }
    if (rel.published_at?.substring(0, 10) > groups[minor].lastDate) {
      groups[minor].lastDate = rel.published_at?.substring(0, 10);
    }
  });

  // Sort releases within each group (newest patch first)
  Object.values(groups).forEach(g => {
    g.releases.sort((a, b) => b.patchNum - a.patchNum);
    g.releaseCount = g.releases.length;
    g.changeCount = g.allChanges.length;
  });

  // Sort groups: newest minor first
  const groupedList = Object.values(groups).sort((a, b) => {
    return b.minorVersion.localeCompare(a.minorVersion, undefined, { numeric: true });
  });

  // Total stats
  const totalReleases = stable.length;
  const totalChanges = groupedList.reduce((sum, g) => sum + g.changeCount, 0);
  const latestStable = stable[0];
  const nightly = releases.find(r => r.tag_name === 'nightly');

  const changelogMd = await fetchChangelog(repo);
  const latestChangelog = latestStable
    ? extractChangelogSection(changelogMd, latestStable.tag_name)
    : null;

  return {
    repo: repo,
    generated: new Date().toISOString(),
    totalReleases: totalReleases,
    totalChanges: totalChanges,
    latestStable: latestStable ? {
      tag: latestStable.tag_name,
      name: latestStable.name,
      date: latestStable.published_at?.substring(0, 10),
      url: latestStable.html_url,
    } : null,
    // Uitgebreide beschrijving van de nieuwste versie, uit het changelogdocument.
    // null wanneer de repo geen ondersteunde bron of sectie voor deze tag heeft.
    latestChangelog: latestChangelog,
    nightly: nightly ? {
      tag: nightly.tag_name,
      date: nightly.published_at?.substring(0, 10),
      url: nightly.html_url,
    } : null,
    groups: groupedList,
  };
}

async function main() {
  const outDir = path.join(__dirname, '..', 'data', 'release-notes');
  fs.mkdirSync(outDir, { recursive: true });

  for (const repo of TOOL_REPOS) {
    try {
      const data = await processRepo(repo);
      fs.writeFileSync(
        path.join(outDir, `${repo}.json`),
        JSON.stringify(data, null, 2)
      );
      console.log(`  ✓ ${data.totalReleases} releases, ${data.totalChanges} changes`);
    } catch (e) {
      console.warn(`  ✗ ${repo}: ${e.message}`);
    }
  }

  console.log('\nDone!');
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
  });
}

module.exports = { fetchChangelog, parseChanges };
