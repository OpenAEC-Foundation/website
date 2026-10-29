#!/usr/bin/env node
// Productpagina-standaard: per app-pagina welke van de 9 vaste blokken er al zijn.
//
// De standaard staat in de OpenAEC-Blueprint (templates/productpagina-standaard.md); voorbeeld is
// open-planner-studio/index.html, de gedeelde onderdelen zijn shared/productpagina.css en .js.
//
//   node scripts/check-product-pages.js          overzicht + bewaking
//   node scripts/check-product-pages.js --quiet  alleen bewaking
//
// Bewaking: een pagina die shared/productpagina.css laadt, geldt als omgebouwd. Die moet alle verplichte
// blokken hebben, in de vaste volgorde; anders faalt dit script. Pagina's die nog niet omgebouwd zijn,
// staan alleen in het overzicht.
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['en', 'fr', 'tr', 'es', 'supercloud', '_voorbeeld', 'nijmegen', 'old', 'shared', 'scripts', 'node_modules', '.git']);
// App-pagina's zonder SoftwareApplication-schema; IFCX en IFCCAD zijn formaten, geen apps.
const EXTRA = ['open-books', 'open-safety-studio', 'open-3d-viewer', 'ext-drawing-statistics'];

function productPages() {
  const out = new Set(EXTRA.filter((d) => fs.existsSync(path.join(ROOT, d, 'index.html'))));
  for (const d of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!d.isDirectory() || SKIP.has(d.name)) continue;
    const f = path.join(ROOT, d.name, 'index.html');
    if (fs.existsSync(f) && /"@type":\s*"SoftwareApplication"/.test(fs.readFileSync(f, 'utf8'))) out.add(d.name);
  }
  return [...out].sort();
}

// Een blok: naam, of het altijd verplicht is, hoe je het vindt (positie in de HTML of -1) en wat er nog mist.
const BLOCKS = [
  { key: 'kop', name: 'Kop', find: (h) => h.search(/<header class="product-head\b/), detail(h) {
    const head = sliceBlock(h, /<header class="product-head\b/, '</header>');
    const miss = [];
    if (!/class="pp-tagline"/.test(head)) miss.push('tagline');
    if ((head.match(/class="btn btn-(?:glow|glass)/g) || []).length < 3) miss.push('3 knoppen');
    if (!/class="chip-row pp-proof"/.test(head)) miss.push('feitenchips');
    const slides = (head.match(/class="slider-slide"/g) || []).length;
    if (!/class="media-slider[^"]*"[^>]*data-pp-slider/.test(head) || slides < 3) miss.push(`slider ${slides}/3 beelden`);
    return miss;
  } },
  { key: 'nav', name: 'Navigatie', find: (h) => h.search(/<nav class="pp-subnav"/) },
  { key: 'functies', name: 'Functies', find: (h) => h.search(/<section[^>]*\bid="features"/), detail(h) {
    const s = sliceBlock(h, /<section[^>]*\bid="features"/, '</section>');
    const miss = [];
    if (!/class="pp-tabs"/.test(s)) miss.push('tabs');
    const rows = (s.match(/class="pp-hl-row"/g) || []).length;
    if (rows < 4) miss.push(`hoogtepunten ${rows}/4`);
    return miss;
  } },
  { key: 'download', name: 'Download', optional: (h) => !/releases\/download\/|data-gh-download/.test(h), find: (h) => h.search(/<section[^>]*\bid="download"[^>]*data-pp-repo=/) },
  { key: 'nieuw', name: 'Nieuw', find: (h) => h.search(/<section[^>]*\bid="whats-new"/) },
  { key: 'faq', name: 'Vragen', find: (h) => h.search(/<section[^>]*\bid="faq"/), detail(h) {
    const n = (sliceBlock(h, /<section[^>]*\bid="faq"/, '</section>').match(/class="pp-faq-item"/g) || []).length;
    return n < 6 ? [`vragen ${n}/6`] : [];
  } },
  { key: 'tech', name: 'Technologie', find: (h) => h.search(/<section[^>]*\bid="technology"/) },
  { key: 'releases', name: 'Releases', find: (h) => h.search(/<section[^>]*\bid="releases"[\s\S]{0,400}?data-release-notes=/) },
  { key: 'slot', name: 'Slotvlak', find: (h) => h.lastIndexOf('<section class="section surface-spot panel">') },
];

function sliceBlock(h, startRe, end) {
  const i = h.search(startRe);
  if (i < 0) return '';
  const j = h.indexOf(end, i);
  return h.slice(i, j < 0 ? undefined : j);
}

function check(slug) {
  const raw = fs.readFileSync(path.join(ROOT, slug, 'index.html'), 'utf8');
  const main = raw.slice(raw.indexOf('<body'));
  const converted = /\/shared\/productpagina\.css/.test(raw);
  const result = { slug, converted, blocks: {}, problems: [] };
  let last = -1;
  for (const b of BLOCKS) {
    const optional = b.optional ? b.optional(main) : false;
    const pos = b.find(main);
    const miss = pos >= 0 && b.detail ? b.detail(main) : [];
    result.blocks[b.key] = pos < 0 ? (optional ? 'nvt' : 'mist') : miss.length ? 'deels' : 'ok';
    if (!converted) continue;
    if (pos < 0 && !optional) result.problems.push(`${b.name} ontbreekt`);
    if (miss.length) result.problems.push(`${b.name}: ${miss.join(', ')}`);
    if (pos >= 0) {
      if (pos < last) result.problems.push(`${b.name} staat niet op zijn plek`);
      last = Math.max(last, pos);
    }
  }
  if (converted && !/\/shared\/productpagina\.js/.test(raw)) result.problems.push('shared/productpagina.js wordt niet geladen');
  return result;
}

const results = productPages().map(check);
const quiet = process.argv.includes('--quiet');
if (!quiet) {
  const mark = { ok: '✓', deels: '½', mist: '·', nvt: '–' };
  const w = Math.max(...results.map((r) => r.slug.length)) + 2;
  console.log('Productpagina-standaard: ✓ aanwezig · ½ deels · · ontbreekt · – niet nodig\n');
  console.log(`${'pagina'.padEnd(w)}${BLOCKS.map((b) => b.name.slice(0, 4).padEnd(6)).join('')} omgebouwd`);
  for (const r of results) {
    const done = BLOCKS.filter((b) => ['ok', 'nvt'].includes(r.blocks[b.key])).length;
    console.log(`${r.slug.padEnd(w)}${BLOCKS.map((b) => mark[r.blocks[b.key]].padEnd(6)).join('')} ${r.converted ? 'ja' : 'nee'}  ${done}/9`);
  }
  const conv = results.filter((r) => r.converted).length;
  console.log(`\n${conv} van ${results.length} pagina's omgebouwd.`);
}
const failing = results.filter((r) => r.problems.length);
if (failing.length) {
  console.error('\nOmgebouwde pagina\'s die niet aan de standaard voldoen:');
  for (const r of failing) console.error(`  ${r.slug}: ${r.problems.join('; ')}`);
  process.exit(1);
}
