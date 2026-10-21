// scripts/generate-news-signals.js
// Zoekt nieuwswaardige gebeurtenissen voor de socials van OpenAEC en schrijft
// ze naar data/news-signals.json. Een lokale skill (openaec-nieuws) leest dat
// bestand en maakt er posts van; dit script post zelf niets.
//
// Signalen (alleen binnen de laatste WINDOW_DAYS dagen):
//   release     een nieuwe stabiele release (geen nightly), "groot" bij een
//               nieuwe minor/major versie, "klein" bij een patch
//   downloads   downloads van de laatste 7 dagen tegenover het weekgemiddelde
//               van de 4 weken daarvoor (ratio)
//   stars       idem voor GitHub-sterren, zodra er genoeg eigen momentopnamen zijn
//   milestone   een rond getal gepasseerd, per tool of voor het hele ecosysteem
//
// Inputs:  data/stats.json, data/history-downloads/*.json, data/history/*.json,
//          data/release-notes/*.json, api/tools.json (namen)
// Outputs: data/news-signals.json en een dagelijkse momentopname van sterren per
//          repo in data/history-repos/<datum>.json (90 dagen bewaard)
//
// Faalt nooit hard: ontbreekt een bron, dan slaat het die soort signaal over.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const WINDOW_DAYS = 14;
const KEEP_DAYS = 90;

const MIJLPALEN = {
  repoStars: [100, 250, 500, 1000, 2500, 5000, 10000, 25000],
  repoDownloads: [1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000],
  totaalStars: [1000, 2500, 5000, 7500, 10000, 25000],
  totaalDownloads: [100000, 150000, 200000, 250000, 500000, 1000000],
  bijdragers: [50, 75, 100, 150, 200, 300],
};

const lees = (p, standaard = null) => {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return standaard; }
};
const dag = (d) => d.toISOString().slice(0, 10);
const vandaag = new Date();
const grens = dag(new Date(vandaag.getTime() - WINDOW_DAYS * 864e5));

// Namen uit de catalogus; repo-naam als terugval.
const tools = lees(path.join(ROOT, 'api', 'tools.json'), {});
const naamVan = {};
for (const t of Array.isArray(tools) ? tools : tools.tools || []) {
  if (t.repo) naamVan[t.repo.toLowerCase()] = t.name;
}
naamVan.opencadstudio = 'Open CAD Studio';
const naam = (repo) => naamVan[String(repo).toLowerCase()] || repo;

// Momentopnamen uit een map, oud → nieuw.
function snapshots(map) {
  const dir = path.join(DATA, map);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort()
    .map((f) => ({ datum: f.slice(0, 10), ...lees(path.join(dir, f), {}) }));
}
// Laatste momentopname op of vóór een datum.
const opDatum = (lijst, datum) => [...lijst].reverse().find((s) => s.datum <= datum);

const signalen = [];
const voegToe = (s) => signalen.push(s);

// ── 1. Releases ────────────────────────────────────────────────────────────
const rnDir = path.join(DATA, 'release-notes');
if (fs.existsSync(rnDir)) {
  for (const f of fs.readdirSync(rnDir).filter((x) => x.endsWith('.json'))) {
    const rn = lees(path.join(rnDir, f));
    const rel = rn && rn.latestStable;
    if (!rel || !rel.date || rel.date < grens || /nightly/i.test(rel.tag || '')) continue;
    const delen = String(rel.tag).replace(/^v/i, '').split(/[.-]/).map(Number);
    const patch = delen.length >= 3 && !Number.isNaN(delen[2]) ? delen[2] : 0;
    const vorigeGroepen = (rn.groups || []).map((g) => g.minorVersion);
    voegToe({
      id: `release:${rn.repo}:${rel.tag}`,
      soort: 'release',
      repo: rn.repo,
      tool: naam(rn.repo),
      datum: rel.date,
      versie: rel.tag,
      grootte: patch === 0 ? 'groot' : 'klein',
      url: rel.url,
      releases14d: (rn.groups || []).flatMap((g) => g.releases || [])
        .filter((r) => r.date >= grens && !/nightly/i.test(r.tag || '')).length,
      notitie: vorigeGroepen.length ? `versiereeks ${vorigeGroepen[0]}` : undefined,
    });
  }
}

// ── 2. Pieken: laatste 7 dagen tegenover het weekgemiddelde van 4 weken ervoor ──
function pieken(lijst, haalWaarde, soort) {
  if (lijst.length < 2) return;
  const nu = lijst[lijst.length - 1];
  const d7 = opDatum(lijst, dag(new Date(new Date(nu.datum).getTime() - 7 * 864e5)));
  const d35 = opDatum(lijst, dag(new Date(new Date(nu.datum).getTime() - 35 * 864e5)));
  if (!d7 || !d35 || d7 === nu || d35 === d7) return;
  const repos = Object.keys(haalWaarde(nu) || {});
  for (const repo of repos) {
    const a = haalWaarde(nu)[repo], b = (haalWaarde(d7) || {})[repo], c = (haalWaarde(d35) || {})[repo];
    if ([a, b, c].some((v) => typeof v !== 'number')) continue;
    const week = a - b;
    const weken = (new Date(d7.datum) - new Date(d35.datum)) / (7 * 864e5);
    const gemiddeld = weken > 0 ? (b - c) / weken : 0;
    const minimum = soort === 'downloads' ? 50 : 10;
    if (week < minimum) continue;
    const ratio = gemiddeld > 0 ? week / gemiddeld : null;
    if (ratio !== null && ratio < 2) continue;
    voegToe({
      id: `${soort}:${repo}:${nu.datum}`,
      soort,
      repo,
      tool: naam(repo),
      datum: nu.datum,
      laatste7dagen: week,
      weekgemiddelde: Math.round(gemiddeld),
      ratio: ratio === null ? 'nieuw' : Math.round(ratio * 10) / 10,
      totaal: a,
    });
  }
}
const dlHist = snapshots('history-downloads');
pieken(dlHist, (s) => s.perRepo, 'downloads');

// Eigen momentopname van sterren per repo (de stats-historie bewaart alleen totalen).
const stats = lees(path.join(DATA, 'stats.json'), {});
const sterrenNu = {};
for (const r of stats.repos || []) sterrenNu[r.name] = r.stars;
const repoDir = path.join(DATA, 'history-repos');
fs.mkdirSync(repoDir, { recursive: true });
fs.writeFileSync(path.join(repoDir, `${dag(vandaag)}.json`), JSON.stringify({ generated: vandaag.toISOString(), stars: sterrenNu }, null, 2) + '\n');
for (const f of fs.readdirSync(repoDir)) {
  if (/^\d{4}-\d{2}-\d{2}\.json$/.test(f) && f.slice(0, 10) < dag(new Date(vandaag.getTime() - KEEP_DAYS * 864e5))) fs.unlinkSync(path.join(repoDir, f));
}
const sterHist = snapshots('history-repos');
pieken(sterHist, (s) => s.stars, 'stars');

// ── 3. Mijlpalen ───────────────────────────────────────────────────────────
function mijlpaal(id, wat, oud, nieuw, drempels, extra) {
  if (typeof oud !== 'number' || typeof nieuw !== 'number') return;
  const gehaald = drempels.filter((t) => oud < t && nieuw >= t);
  if (!gehaald.length) return;
  const t = gehaald[gehaald.length - 1];
  voegToe({ id: `milestone:${id}:${t}`, soort: 'milestone', wat, drempel: t, waarde: nieuw, grootte: 'groot', ...extra });
}
if (dlHist.length > 1) {
  const nu = dlHist[dlHist.length - 1], toen = opDatum(dlHist, grens) || dlHist[0];
  mijlpaal('downloads:totaal', 'downloads ecosysteem', toen.grandTotal, nu.grandTotal, MIJLPALEN.totaalDownloads, { datum: nu.datum });
  for (const repo of Object.keys(nu.perRepo || {})) {
    mijlpaal(`downloads:${repo}`, `downloads ${naam(repo)}`, (toen.perRepo || {})[repo], nu.perRepo[repo], MIJLPALEN.repoDownloads, { repo, tool: naam(repo), datum: nu.datum });
  }
}
const statHist = snapshots('history');
if (statHist.length > 1) {
  const nu = statHist[statHist.length - 1], toen = opDatum(statHist, grens) || statHist[0];
  mijlpaal('stars:totaal', 'sterren ecosysteem', toen.totalStars, nu.totalStars, MIJLPALEN.totaalStars, { datum: nu.datum });
  mijlpaal('bijdragers', 'bijdragers ecosysteem', toen.uniqueContributors, nu.uniqueContributors, MIJLPALEN.bijdragers, { datum: nu.datum });
}
if (sterHist.length > 1) {
  const nu = sterHist[sterHist.length - 1], toen = opDatum(sterHist, grens) || sterHist[0];
  for (const repo of Object.keys(nu.stars || {})) {
    mijlpaal(`stars:${repo}`, `sterren ${naam(repo)}`, (toen.stars || {})[repo], nu.stars[repo], MIJLPALEN.repoStars, { repo, tool: naam(repo), datum: nu.datum });
  }
}

// ── Schrijven ──────────────────────────────────────────────────────────────
signalen.sort((a, b) => String(b.datum).localeCompare(String(a.datum)));
const uit = {
  generated: vandaag.toISOString(),
  venster: { van: grens, tot: dag(vandaag), dagen: WINDOW_DAYS },
  totalen: { downloads: dlHist.length ? dlHist[dlHist.length - 1].grandTotal : null, ...(stats.summary ? { sterren: stats.summary.totalStars, commits: stats.summary.totalCommits, bijdragers: stats.summary.uniqueContributors } : {}) },
  signalen,
};
fs.writeFileSync(path.join(DATA, 'news-signals.json'), JSON.stringify(uit, null, 2) + '\n');
console.log(`news-signals: ${signalen.length} signaal/signalen (${signalen.map((s) => s.soort).join(', ') || 'geen'})`);
