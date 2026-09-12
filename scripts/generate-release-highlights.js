#!/usr/bin/env node
/**
 * generate-release-highlights.js
 *
 * Haalt de release-hoogtepunten op die een product zelf publiceert en zet ze
 * in data/release-highlights/<repo>.json. Dat bestand voedt de releasetijdlijn
 * onderaan de productpagina (shared/release-notes.js, tijdlijn-modus).
 *
 * Waarom een aparte bron naast data/release-notes/<repo>.json: de release-notes
 * komen uit GitHub en zijn een commit-achtige opsomming. De hoogtepunten zijn
 * de redactionele koppen die de app zelf in de "Wat is er nieuw"-dialoog toont —
 * per release één hoofdkop en vier korte koppen, in veertien talen. Eén bron
 * voor app en website, zodat beide hetzelfde verhaal vertellen.
 *
 * Contract van de opgehaalde JSON (schema 1):
 *
 *   { "schema": 1, "product": "open-planner-studio", "generated": "<ISO>",
 *     "releases": [ { "version": "2026.9.0", "tag": "v2026.9.0",
 *       "stats": { "daysSincePrevious", "commitsSincePrevious", "addedCodeLines" },
 *       "highlights": { "<locale>": { "primary": {category,title,description,icon,docsId?},
 *                                     "secondary": [ {category,title,description,icon} x4 ] } } } ] }
 *
 * De datum per release komt NIET uit dit bestand maar uit
 * data/release-notes/<repo>.json (join op `tag`) — GitHub is daar de bron.
 *
 * Faalgedrag is bewust: bij een netwerkfout, een niet-200, ongeldige JSON of
 * een antwoord dat het contract niet haalt, blijft het bestaande bestand
 * ongemoeid en eindigt het script alsnog met 0. Een tijdelijk onbereikbare
 * productsite mag de websitebuild niet rood maken en mag zeker geen lege of
 * halve file achterlaten.
 *
 * Inputs:  de live highlights-URL per product
 * Outputs: data/release-highlights/<repo>.json
 *
 * Draaien: `node scripts/generate-release-highlights.js`
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'data', 'release-highlights');

// Producten die hun hoogtepunten publiceren. De sleutel is de repo-naam, want
// daarmee wordt in de browser gezocht: /data/release-highlights/<repo>.json.
const SOURCES = [
  {
    repo: 'open-planner-studio',
    url: 'https://open-planner-studio.open-aec.com/release-highlights.json',
  },
];

const TIMEOUT_MS = 15000;

function isHighlight(h) {
  return !!h
    && typeof h === 'object'
    && typeof h.category === 'string'
    && typeof h.title === 'string'
    && typeof h.description === 'string'
    && typeof h.icon === 'string';
}

/**
 * Alleen een antwoord dat het hele contract haalt mag de bestaande file
 * vervangen. Half-geldige data is erger dan oude data: de tijdlijn zou dan
 * kaartjes zonder koppen tonen.
 */
function validate(data, repo) {
  if (!data || typeof data !== 'object') return 'geen object';
  if (data.schema !== 1) return `onbekend schema: ${JSON.stringify(data.schema)}`;
  if (data.product && data.product !== repo) return `product "${data.product}" hoort niet bij ${repo}`;
  if (!Array.isArray(data.releases) || data.releases.length === 0) return 'geen releases';

  for (const rel of data.releases) {
    if (!rel || typeof rel !== 'object') return 'release is geen object';
    if (typeof rel.version !== 'string' || !rel.version) return 'release zonder version';
    if (typeof rel.tag !== 'string' || !rel.tag) return `release ${rel.version} zonder tag`;
    if (!rel.highlights || typeof rel.highlights !== 'object') return `release ${rel.tag} zonder highlights`;

    const locales = Object.keys(rel.highlights);
    if (locales.length === 0) return `release ${rel.tag} zonder locales`;
    if (!locales.includes('en')) return `release ${rel.tag} mist de en-terugval`;

    for (const loc of locales) {
      const copy = rel.highlights[loc];
      if (!copy || typeof copy !== 'object') return `release ${rel.tag}/${loc} is geen object`;
      if (!isHighlight(copy.primary)) return `release ${rel.tag}/${loc} heeft geen geldige primary`;
      if (!Array.isArray(copy.secondary) || copy.secondary.length !== 4) {
        return `release ${rel.tag}/${loc} heeft geen vier secondary-koppen`;
      }
      if (!copy.secondary.every(isHighlight)) return `release ${rel.tag}/${loc} heeft een ongeldige secondary`;
    }
  }
  return null;
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'OpenAEC-Release-Highlights-Bot' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function processSource(source) {
  const outFile = path.join(OUT_DIR, `${source.repo}.json`);
  const hasExisting = fs.existsSync(outFile);
  console.log(`\n${source.repo}: ${source.url}`);

  let data;
  try {
    data = await fetchJson(source.url);
  } catch (e) {
    console.warn(`  ✗ ophalen mislukt (${e.message}) — bestaande file ${hasExisting ? 'blijft staan' : 'ontbreekt nog'}`);
    return;
  }

  const problem = validate(data, source.repo);
  if (problem) {
    console.warn(`  ✗ antwoord voldoet niet aan het contract (${problem}) — bestaande file ${hasExisting ? 'blijft staan' : 'ontbreekt nog'}`);
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(data, null, 2) + '\n');
  const tags = data.releases.map((r) => r.tag).join(', ');
  console.log(`  ✓ ${data.releases.length} releases weggeschreven (${tags})`);
}

async function main() {
  for (const source of SOURCES) {
    await processSource(source);
  }
  console.log('\nKlaar.');
}

module.exports = { validate };

// Alleen draaien wanneer dit script zélf wordt aangeroepen; check-scripts
// importeren `validate` en mogen daar geen netwerkronde van krijgen.
if (require.main === module) {
  main().catch((err) => {
    // Ook hier: nooit een half bestand achterlaten en de keten niet breken.
    console.warn('Onverwachte fout:', err && err.message);
  });
}
