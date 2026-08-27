#!/usr/bin/env node
/**
 * build-figures.js
 *
 * Losse getallen die in lopende tekst stonden — downloadaantallen, versie-
 * nummers, het aantal tools — werden met de hand ingetypt en liepen daardoor
 * achter op de rest van de site. De vergelijkingspagina noemde 4.393 downloads
 * terwijl data/downloads.json er 15.858 telde, en /vs/bouwprijs/ hield het op
 * Open Calc Studio v0.7.8 terwijl er al een nieuwere release stond.
 *
 * Dit script vult ze voortaan zelf in. Markeer een getal in de HTML zo:
 *
 *     <span data-figure="downloads:open-pdf-studio">15.858</span>
 *     <span data-figure="version:open-calc-studio">v0.10.0</span>
 *     <span data-figure="tools">20</span>
 *     <span data-figure="repos">69</span>
 *     <span data-figure="stars">1787</span>
 *
 * De inhoud van zo'n span wordt bij elke refresh overschreven. Wat er nu in
 * staat blijft leesbaar voor crawlers en voor bezoekers zonder JavaScript.
 *
 * Inputs:  data/downloads.json, data/release-notes/<repo>.json, data/stats.json,
 *          api/tools.json
 * Outputs: alle HTML-pagina's met een data-figure (in-place)
 *
 * Draaien: `node scripts/build-figures.js`
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['old', 'presentation foundation', '.git', '.claude', 'node_modules']);

function readJson(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.warn(`  Waarschuwing: ${rel} is geen geldige JSON (${e.message})`);
    return null;
  }
}

function htmlFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

// Nederlandse duizendtalscheiding, zoals de rest van de site het toont.
const nl = n => Number(n).toLocaleString('nl-NL');

const downloads = readJson('data/downloads.json');
const stats = readJson('data/stats.json');
const tools = readJson('api/tools.json');

function downloadsFor(repo) {
  const list = (downloads && downloads.perTool) || [];
  const hit = list.find(r => r.repo === repo);
  return hit ? hit.totalDownloads : null;
}

function versionFor(repo) {
  const d = readJson(path.join('data', 'release-notes', `${repo}.json`));
  return (d && d.latestStable && d.latestStable.tag) || null;
}

function resolve(spec) {
  const [kind, arg] = spec.split(':');
  switch (kind) {
    case 'downloads': {
      const n = downloadsFor(arg);
      return n == null ? null : nl(n);
    }
    case 'version':
      return versionFor(arg);
    case 'repos':
      return stats && stats.summary ? nl(stats.summary.publicRepos) : null;
    case 'stars':
      return stats && stats.summary ? nl(stats.summary.totalStars) : null;
    case 'tools':
      return tools && tools.totalTools ? String(tools.totalTools) : null;
    default:
      return null;
  }
}

let pages = 0;
let replaced = 0;
const unresolved = new Set();

// In de HTML staat de span letterlijk; in de vertaalbestanden staat hij als
// stukje HTML binnen een JSON-string, want i18n.js zet die waarde als innerHTML.
// Beide moeten mee, anders loopt de vertaalde pagina alsnog achter.
function stampFigures(text, onChange) {
  return text.replace(
    /(<span[^>]*\bdata-figure=(?:"|\\")([^"\\]+)(?:"|\\")[^>]*>)([\s\S]*?)(<\/span>)/g,
    (whole, open, spec, inner, close) => {
      const value = resolve(spec);
      if (value == null) {
        unresolved.add(spec);
        return whole;
      }
      if (inner === value) return whole;
      onChange();
      return open + value + close;
    }
  );
}

const targets = htmlFiles(ROOT).concat(
  fs.existsSync(path.join(ROOT, 'shared/translations'))
    ? fs.readdirSync(path.join(ROOT, 'shared/translations'))
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(ROOT, 'shared/translations', f))
    : []
);

for (const file of targets) {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes('data-figure=')) continue;

  let changed = 0;
  const out = stampFigures(text, () => { changed++; });

  if (changed) {
    if (file.endsWith('.json')) JSON.parse(out); // vangt een kapotte vervanging af
    fs.writeFileSync(file, out);
    console.log(`  ✓ ${path.relative(ROOT, file)} — ${changed} getal(len) bijgewerkt`);
    replaced += changed;
  }
  pages++;
}

for (const spec of unresolved) {
  console.warn(`  Waarschuwing: geen waarde voor data-figure="${spec}"`);
}
console.log(`\n${pages} pagina('s) met getallen bekeken, ${replaced} bijgewerkt.`);
