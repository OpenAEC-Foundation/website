#!/usr/bin/env node
/**
 * build-nav-static.js
 *
 * De navigatie werd volledig door JavaScript ingeladen: elke pagina had een
 * lege <div id="shared-nav"></div> die shared/nav.js pas na het laden vulde.
 * Googlebot voert JavaScript uit en zag hem dus wel, maar de crawlers van de
 * AI-assistenten (GPTBot, ClaudeBot, PerplexityBot) doen dat overwegend niet.
 * Voor hen was elke pagina een eiland met alleen een footer — geen interne
 * links om de rest van de site langs te lopen.
 *
 * Dit script schrijft de inhoud van shared/nav.html statisch in de placeholder,
 * tussen <!-- nav:start --> en <!-- nav:end -->. nav.js blijft werken en laat
 * de statische versie met rust (zie de check op nav:start daar).
 *
 * Inputs:  shared/nav.html, alle pagina's met <div id="shared-nav">
 * Outputs: die pagina's (in-place)
 *
 * Draaien: `node scripts/build-nav-static.js`
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
// en/, fr/ en tr/ zijn gegenereerde uitvoer van build-i18n-pages.js en dragen
// een vertaalde nav. Die hier overschrijven met de Nederlandse zou het werk van
// dat script ongedaan maken.
const SKIP_DIRS = new Set(['old', 'presentation foundation', '.git', '.claude', 'node_modules', 'en', 'fr', 'tr']);

function htmlFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const navPath = path.join(ROOT, 'shared', 'nav.html');
if (!fs.existsSync(navPath)) {
  console.error('shared/nav.html niet gevonden');
  process.exit(1);
}
const nav = fs.readFileSync(navPath, 'utf8').trim();

// Match de al-statische versie (voor een herhaalde run) of de lege placeholder.
// De markers zijn nodig omdat de nav zelf </div> bevat.
const PLACEHOLDER = /<div id="shared-nav"><!-- nav:start -->[\s\S]*?<!-- nav:end --><\/div>|<div id="shared-nav"><\/div>/;

let changed = 0;
let skipped = 0;
let unchanged = 0;

for (const file of htmlFiles(ROOT)) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('id="shared-nav"')) continue;

  // shared/nav.html zelf is het fragment, niet een pagina die het gebruikt.
  if (path.relative(ROOT, file) === path.join('shared', 'nav.html')) continue;

  // Expliciet testen of de placeholder er staat: een tweede run vervangt de
  // nav door exact dezelfde inhoud, en dan is out === html terwijl er niks
  // mis is. Alleen een ontbrekende match is een echt probleem.
  if (!PLACEHOLDER.test(html)) {
    console.warn(`  ? ${path.relative(ROOT, file)} — placeholder niet herkend, overgeslagen`);
    skipped++;
    continue;
  }

  const block = `<div id="shared-nav"><!-- nav:start -->\n${nav}\n<!-- nav:end --></div>`;
  const out = html.replace(PLACEHOLDER, block);

  if (out !== html) {
    fs.writeFileSync(file, out);
    changed++;
  } else {
    unchanged++;
  }
}

console.log(`\n${changed} pagina('s) bijgewerkt, ${unchanged} al actueel, ${skipped} overgeslagen.`);
