#!/usr/bin/env node
/**
 * build-ecosystem-order.js
 *
 * De tool-kaarten in de sectie #ecosysteem op de homepage stonden in de
 * volgorde waarin ze ooit zijn toegevoegd. Dat zei een bezoeker niets: een
 * alpha-project dat al maanden stilligt kon boven een tool staan die wekelijks
 * uitkomt en duizenden keren gedownload is.
 *
 * Dit script sorteert die kaarten op twee dingen die we wél kunnen meten:
 *
 *   VOLWASSENHEID  hoe af is het?      versienummer, aantal releases,
 *                                      downloads, commits, bijdragers
 *   ACTIVITEIT     wordt eraan gewerkt? laatste push, laatste release,
 *                                      releases in de laatste 90 dagen,
 *                                      commits per maand sinds start
 *
 * Beide tellen even zwaar (50/50). Binnen een groep is elk onderdeel een
 * score van 0..1; ontbrekende gegevens tellen niet mee als een nul, maar
 * vallen uit de weging (de resterende gewichten worden genormaliseerd).
 * Een tool zonder enige meetbare data zakt naar de onderkant.
 *
 * Alles wordt gerekend ten opzichte van de peildatum in de databestanden,
 * niet ten opzichte van vandaag. Het script is daarmee idempotent: opnieuw
 * draaien zonder verse data geeft exact dezelfde volgorde.
 *
 * Uitzondering: de IFCX-kaart staat vast op plek 1. IFCX is geen applicatie
 * maar het dataformaat waar de rest op draait, en de kaart is daarom
 * visueel uitgelicht (amber rand).
 *
 * Bronnen, in volgorde van betrouwbaarheid voor versie en releasedatum:
 * data/release-notes/<repo>.json (de echte releasegeschiedenis) en pas
 * daarna stats.json — die bewaart `releases[0]` van de GitHub API, en dat
 * is bij een concept-release een lege datum. Voor open-calc-studio staat er
 * daardoor v0.9.0 zonder datum in stats.json, terwijl de releasenotes
 * v0.13.0 van 12-09-2026 kennen.
 *
 * Let op: `lastPush` komt uit `updated_at` van de GitHub API, niet uit
 * `pushed_at`. Dat veld verspringt ook bij een ster of een gewijzigde
 * omschrijving. stats.json bewaart `pushed_at` niet.
 *
 * Inputs:  data/stats.json, data/downloads.json, data/release-notes/*.json
 * Outputs: de tools-grid in index.html en en/ fr/ tr/ es/ index.html
 *
 * Draaien: `node scripts/build-ecosystem-order.js`
 *          `node scripts/build-ecosystem-order.js --dry-run`  (alleen tonen)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGES = ['index.html', 'en/index.html', 'fr/index.html', 'tr/index.html', 'es/index.html'];

// De kaart die altijd bovenaan blijft: het dataformaat, geen applicatie.
const PINNED_FIRST = ['ifcx'];

// ── data ───────────────────────────────────────────────────────────────────

const stats = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/stats.json'), 'utf8'));
const downloads = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/downloads.json'), 'utf8'));

// Peildatum: de jongste van de twee databestanden.
const ASOF = new Date([stats.generated, downloads.generated].sort().at(-1));

const statsByRepo = new Map(stats.repos.map((r) => [r.name.toLowerCase(), r]));
const dlByRepo = new Map((downloads.perTool || []).map((t) => [t.repo.toLowerCase(), t]));

/** Releasegeschiedenis per repo: nieuwste stabiele versie, laatste datum, aantal in 90 dagen. */
const RELEASE_NOTES_DIR = path.join(ROOT, 'data/release-notes');
const notesByRepo = new Map();
for (const file of fs.existsSync(RELEASE_NOTES_DIR) ? fs.readdirSync(RELEASE_NOTES_DIR) : []) {
  if (!file.endsWith('.json')) continue;
  const data = JSON.parse(fs.readFileSync(path.join(RELEASE_NOTES_DIR, file), 'utf8'));
  const dates = [];
  for (const group of data.groups || []) {
    for (const release of group.releases || []) if (release.date) dates.push(release.date);
  }
  dates.sort();
  notesByRepo.set(file.slice(0, -5).toLowerCase(), {
    version: data.latestStable ? data.latestStable.tag : null,
    lastDate: (data.latestStable && data.latestStable.date) || dates.at(-1) || null,
    total: typeof data.totalReleases === 'number' ? data.totalReleases : null,
    dates,
  });
}

// ── scorefuncties ──────────────────────────────────────────────────────────

const clamp01 = (n) => Math.max(0, Math.min(1, n));

/** Logaritmische schaal: 0 → 0, `top` → 1. Zo drukt één uitschieter de rest niet plat. */
const logScale = (value, top) => (value > 0 ? clamp01(Math.log1p(value) / Math.log1p(top)) : 0);

/** Exponentieel verval op dagen: vandaag → 1, na `halfLife` dagen → 0,5. */
const decay = (days, halfLife) => (days == null ? null : clamp01(Math.pow(0.5, days / halfLife)));

const daysBefore = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Math.max(0, (ASOF - d) / 86400000);
};

/**
 * Versienummer → rijpheid. Een CalVer-release (v2026.37) betekent een project
 * dat op datum uitbrengt en dus voorbij het 0.x-stadium is. Bij SemVer telt
 * major 1+ als volwassen; binnen 0.x groeit de score met de minor.
 */
function versionScore(tag) {
  if (!tag) return null;
  const m = String(tag).match(/v?(\d+)\.(\d+)/);
  if (!m) return null;
  const major = Number(m[1]);
  const minor = Number(m[2]);
  if (major >= 2000) return 1;             // CalVer, bv. v2026.37
  if (major >= 2) return 1;
  if (major === 1) return 0.85;
  return clamp01(0.10 + logScale(minor, 40) * 0.5); // 0.x → 0,10 .. 0,60
}

/** Commits per maand sinds aanmaak — hoe hard er doorgewerkt wordt. */
function velocityScore(repo) {
  if (!repo || !repo.commits || !repo.createdAt) return null;
  const months = Math.max(1, daysBefore(repo.createdAt) / 30.44);
  return logScale(repo.commits / months, 150);
}

// Gewichten. De twee blokken tellen elk 0,50 op.
const WEIGHTS = {
  // volwassenheid — 0,50
  version: 0.15,
  releases: 0.15,
  downloads: 0.10,
  commits: 0.05,
  contributors: 0.05,
  // activiteit — 0,50
  lastPush: 0.15,
  lastRelease: 0.10,
  cadence: 0.15,
  velocity: 0.10,
};

/** Meest recente versie uit downloads.json, voor repo's die niet in stats.json staan. */
function latestVersionFromDownloads(dl) {
  if (!dl || !dl.byVersion) return null;
  const keys = Object.keys(dl.byVersion);
  return keys.length ? keys[0] : null;
}

function scoreCard(repoName) {
  if (!repoName) return { total: null, parts: {} };
  const repoKey = repoName.toLowerCase();
  const repo = statsByRepo.get(repoKey) || null;
  const dl = dlByRepo.get(repoKey) || null;
  const notes = notesByRepo.get(repoKey) || null;
  if (!repo && !dl && !notes) return { total: null, parts: {} };

  const releases = repo ? repo.releases : notes && notes.total != null ? notes.total : dl ? dl.releases : null;
  const version = (notes && notes.version) || (repo && repo.latestRelease) || latestVersionFromDownloads(dl);
  const lastRelease = (notes && notes.lastDate) || (repo && repo.latestReleaseDate) || null;

  // Releasetempo: hoeveel releases in de laatste 90 dagen voor de peildatum.
  // Alleen te bepalen als we de releasegeschiedenis hebben; anders onbekend,
  // want "geen bestand" is iets anders dan "geen releases".
  const cadence = notes
    ? logScale(
        notes.dates.filter((d) => {
          const age = daysBefore(d);
          return age != null && age <= 90;
        }).length,
        20,
      )
    : null;

  // De tweede parameter van logScale is het plafond: de waarde waarbij het
  // onderdeel 1,0 scoort. Die zijn gekozen op de koploper van nu
  // (Open CAD Studio: 90 releases, 3.400 commits; 37.000 downloads). Groeit
  // die verder, dan loopt hij simpelweg tegen 1,0 aan — de rangorde blijft
  // kloppen, alleen de onderlinge afstand bovenin wordt kleiner.
  const parts = {
    version: versionScore(version),
    releases: releases == null ? null : logScale(releases, 90),
    downloads: dl ? logScale(dl.totalDownloads, 37000) : null,
    commits: repo ? logScale(repo.commits, 3400) : null,
    contributors: repo ? clamp01((repo.contributors || 0) / 10) : null,
    lastPush: repo ? decay(daysBefore(repo.updatedAt), 60) : null,
    lastRelease: decay(daysBefore(lastRelease), 90),
    cadence,
    velocity: velocityScore(repo),
  };

  // Genormaliseerd gewogen gemiddelde over de onderdelen die data hebben.
  let sum = 0;
  let weight = 0;
  for (const [key, value] of Object.entries(parts)) {
    if (value == null) continue;
    sum += value * WEIGHTS[key];
    weight += WEIGHTS[key];
  }
  return { total: weight > 0 ? sum / weight : null, parts, version, releases };
}

// ── HTML ───────────────────────────────────────────────────────────────────

const GRID_OPEN = '<div class="tools-grid">';
const CARD_RE = /<article class="tool-card"[\s\S]*?<\/article>/g;

/**
 * Zoekt de `</div>` die bij een `<div>` op positie `start` hoort, door de
 * diepte te tellen. Zonder die grens zou de kaartregex ook een tool-card
 * pakken die later op de pagina wordt toegevoegd, buiten het ecosysteem-grid.
 */
function closingDiv(html, start) {
  const tagRe = /<div\b|<\/div>/gi;
  tagRe.lastIndex = start;
  let depth = 0;
  let m;
  while ((m = tagRe.exec(html))) {
    depth += m[0][1] === '/' ? -1 : 1;
    if (depth === 0) return m.index;
  }
  return -1;
}

/** Splitst de tools-grid in kaarten plus de witruimte ertussen. */
function readGrid(html, file) {
  const gridStart = html.indexOf(GRID_OPEN);
  if (gridStart === -1) throw new Error(`${file}: <div class="tools-grid"> niet gevonden`);
  const gridEnd = closingDiv(html, gridStart);
  if (gridEnd === -1) throw new Error(`${file}: tools-grid wordt niet afgesloten`);
  const region = html.slice(gridStart, gridEnd);

  CARD_RE.lastIndex = 0;
  const matches = [...region.matchAll(CARD_RE)];
  if (!matches.length) throw new Error(`${file}: geen tool-card gevonden`);

  const cards = matches.map((m) => {
    const key = (m[0].match(/data-i18n="tools\.items\.([^."]+)\.title"/) || [])[1];
    if (!key) throw new Error(`${file}: kaart zonder tools.items.<key>.title`);
    return {
      key,
      repo: (m[0].match(/data-repo="([^"]+)"/) || [])[1] || null,
      html: m[0],
    };
  });

  const first = matches[0];
  const last = matches[matches.length - 1];
  const blockStart = gridStart + first.index;
  const blockEnd = gridStart + last.index + last[0].length;

  // Witruimte tussen kaart i en i+1, op positie bewaard (niet aan een kaart gebonden).
  const gaps = [];
  for (let i = 1; i < matches.length; i++) {
    const prevEnd = matches[i - 1].index + matches[i - 1][0].length;
    gaps.push(region.slice(prevEnd, matches[i].index));
  }

  return { cards, gaps, blockStart, blockEnd };
}

function rebuild(html, grid, order) {
  const byKey = new Map(grid.cards.map((c) => [c.key, c]));
  const pieces = order.map((key) => {
    const card = byKey.get(key);
    if (!card) throw new Error(`kaart "${key}" ontbreekt op deze pagina`);
    return card.html;
  });
  let out = pieces[0];
  for (let i = 1; i < pieces.length; i++) out += grid.gaps[i - 1] + pieces[i];
  return html.slice(0, grid.blockStart) + out + html.slice(grid.blockEnd);
}

// ── uitvoeren ──────────────────────────────────────────────────────────────

const dryRun = process.argv.includes('--dry-run');

const nlPath = path.join(ROOT, PAGES[0]);
const nlGrid = readGrid(fs.readFileSync(nlPath, 'utf8'), PAGES[0]);

const scored = nlGrid.cards.map((card, index) => ({
  ...card,
  index,
  ...scoreCard(card.repo),
}));

const pinnedRank = new Map(PINNED_FIRST.map((key, i) => [key, i]));

const order = [...scored]
  .sort((a, b) => {
    const pa = pinnedRank.has(a.key) ? pinnedRank.get(a.key) : Infinity;
    const pb = pinnedRank.has(b.key) ? pinnedRank.get(b.key) : Infinity;
    if (pa !== pb) return pa - pb;
    // Kaarten zonder meetbare data onderaan, onderling in de oude volgorde.
    if (a.total == null && b.total == null) return a.index - b.index;
    if (a.total == null) return 1;
    if (b.total == null) return -1;
    return b.total - a.total;
  })
  .map((c) => c.key);

const byKey = new Map(scored.map((c) => [c.key, c]));
console.log(`Peildatum: ${ASOF.toISOString().slice(0, 10)}\n`);
console.log('  #  score  tool                       repo');
order.forEach((key, i) => {
  const c = byKey.get(key);
  const score = c.total == null ? '  —  ' : c.total.toFixed(3);
  const pin = pinnedRank.has(key) ? ' (vast)' : '';
  console.log(`${String(i + 1).padStart(3)}  ${score}  ${key.padEnd(18)} ${(c.repo || '—').padEnd(26)}${pin}`);
});

if (dryRun) {
  console.log('\n--dry-run: geen bestanden geschreven');
  process.exit(0);
}

let written = 0;
for (const page of PAGES) {
  const file = path.join(ROOT, page);
  if (!fs.existsSync(file)) {
    console.warn(`  overgeslagen (bestaat niet): ${page}`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const grid = readGrid(html, page);
  if (grid.cards.length !== order.length) {
    throw new Error(`${page}: ${grid.cards.length} kaarten, verwacht ${order.length}`);
  }
  const next = rebuild(html, grid, order);
  if (next !== html) {
    fs.writeFileSync(file, next);
    written++;
  }
}
console.log(`\n${written} van de ${PAGES.length} pagina's herschreven`);
