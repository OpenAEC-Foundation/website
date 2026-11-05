#!/usr/bin/env node
// Haalt per release van Open Infra Studio op bij welke Open CAD Studio-versie en plugin-API
// hij hoort, en schrijft dat naar data/infra-compat.json. build-infra-versions.js maakt daar
// de versietabel en de versienummers op de productpagina van.
//
// Een release verandert niet meer, dus wat al in het bestand staat wordt niet opnieuw opgehaald.
// Lukt ophalen niet, dan blijft het bestaande bestand staan en stopt de dagelijkse update niet.

const fs = require('fs');
const path = require('path');

const REPO = 'OpenAEC-Foundation/Open-Infra-Studio';
const HOST_REPO = 'HakanSeven12/OpenCADStudio';
const OUT = path.join(__dirname, '..', 'data', 'infra-compat.json');
const HEADERS = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'openaec-website',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function json(url) {
  const r = await fetch(url, { headers: HEADERS });
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r.json();
}

// De release-tekst noemt de versie waarvoor gebouwd is; latere alinea's noemen ook oudere versies.
function hostFromBody(body) {
  const text = String(body || '').replace(/\*/g, '');
  const built = text.match(/built for Open CAD Studio v?(\d{4}\.\d+(?:\.\d+)?)/i);
  const first = built || text.match(/Open CAD Studio v?(\d{4}\.\d+(?:\.\d+)?)/i);
  return first ? `v${first[1]}` : null;
}

function apiFromBody(body) {
  const m = String(body || '').match(/plugin[- ]API\s+(\d+)/i);
  return m ? Number(m[1]) : null;
}

// plugin.toml bij de tag is leidend voor de plugin-API; de release-tekst is de terugval.
async function apiFromManifest(tag) {
  const r = await fetch(`https://raw.githubusercontent.com/${REPO}/${encodeURIComponent(tag)}/plugin.toml`);
  if (!r.ok) return null;
  const m = (await r.text()).match(/^\s*api_version\s*=\s*(\d+)/m);
  return m ? Number(m[1]) : null;
}

async function main() {
  const known = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { releases: [] };
  const byTag = new Map((known.releases || []).map(r => [r.tag, r]));

  const list = await json(`https://api.github.com/repos/${REPO}/releases?per_page=100`);
  const usable = list.filter(r => !r.draft && !r.prerelease && /^v\d/.test(r.tag_name));
  if (!usable.length) throw new Error('geen releases gevonden');

  for (const rel of usable) {
    if (byTag.has(rel.tag_name)) continue;
    const ocs = hostFromBody(rel.body);
    const api = (await apiFromManifest(rel.tag_name)) ?? apiFromBody(rel.body);
    if (!ocs || api === null) {
      console.warn(`  ${rel.tag_name}: geen Open CAD Studio-versie of plugin-API gevonden, overgeslagen`);
      continue;
    }
    byTag.set(rel.tag_name, { tag: rel.tag_name, published: rel.published_at.slice(0, 10), ocs, api });
  }

  const releases = [...byTag.values()].sort((a, b) =>
    (a.published + a.tag).localeCompare(b.published + b.tag, undefined, { numeric: true }));
  const newest = releases[releases.length - 1];
  const newestRel = usable.find(r => r.tag_name === newest.tag);
  const host = await json(`https://api.github.com/repos/${HOST_REPO}/releases/latest`);

  const result = {
    repo: REPO,
    ocsRepo: HOST_REPO,
    ocsLatest: host.tag_name,
    latest: {
      tag: newest.tag,
      published: newest.published,
      ocs: newest.ocs,
      api: newest.api,
      sizes: Object.fromEntries((newestRel ? newestRel.assets : []).map(a => [a.name, a.size])),
    },
    releases,
  };
  const text = JSON.stringify(result, null, 2) + '\n';
  if (!fs.existsSync(OUT) || fs.readFileSync(OUT, 'utf8') !== text) fs.writeFileSync(OUT, text);
  console.log(`  ${releases.length} releases; nieuwste ${newest.tag} voor Open CAD Studio ${newest.ocs} (plugin-API ${newest.api})`);
}

if (require.main === module) {
  main().catch(err => {
    console.warn(`  Open Infra-versies niet bijgewerkt: ${err.message}`);
  });
}

module.exports = { hostFromBody, apiFromBody };
