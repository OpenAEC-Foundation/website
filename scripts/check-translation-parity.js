#!/usr/bin/env node
/**
 * check-translation-parity.js
 *
 * Controleert of een vertaalbestand dezelfde opbouw heeft als het Engelse bestand
 * waar het van is afgeleid: dezelfde sleutels, dezelfde typen, dezelfde HTML-tags
 * en dezelfde plaatshouders. Een vertaling die een sleutel of een tag mist, laat
 * de pagina in die taal stil terugvallen op Engels of breekt de opmaak.
 *
 * Gebruik: node scripts/check-translation-parity.js <taal> [slug ...]
 *          zonder slugs: alle bestanden shared/translations/<slug>.<taal>.json
 */
'use strict';

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'shared', 'translations');
const [lang, ...slugs] = process.argv.slice(2);
if (!lang) {
  console.error('Gebruik: node scripts/check-translation-parity.js <taal> [slug ...]');
  process.exit(2);
}

const tags = (s) => (s.match(/<\/?[a-zA-Z][^>]*>/g) || []).map((t) => t.replace(/\s+/g, ' ')).sort().join('|');
const holders = (s) => (s.match(/\{[a-zA-Z0-9_]+\}|%[sd]/g) || []).sort().join('|');

function compare(en, tr, where, problems) {
  if (typeof en !== typeof tr || Array.isArray(en) !== Array.isArray(tr)) {
    problems.push(`${where}: type wijkt af`);
    return;
  }
  if (typeof en === 'string') {
    if (tags(en) !== tags(tr)) problems.push(`${where}: HTML-tags wijken af`);
    if (holders(en) !== holders(tr)) problems.push(`${where}: plaatshouders wijken af`);
    if (en.trim() && !tr.trim()) problems.push(`${where}: lege vertaling`);
    return;
  }
  if (en && typeof en === 'object') {
    const a = Object.keys(en), b = Object.keys(tr || {});
    for (const k of a) {
      if (!(k in tr)) problems.push(`${where}.${k}: ontbreekt`);
      else compare(en[k], tr[k], `${where}.${k}`, problems);
    }
    for (const k of b) if (!(k in en)) problems.push(`${where}.${k}: staat niet in het Engelse bestand`);
  }
}

const list = slugs.length
  ? slugs.map((s) => s.replace(/\.json$/, ''))
  : fs.readdirSync(DIR).filter((f) => f.endsWith(`.${lang}.json`)).map((f) => f.slice(0, -(`.${lang}.json`).length));

let failed = 0;
for (const slug of list) {
  const enFile = path.join(DIR, `${slug}.json`);
  const trFile = path.join(DIR, `${slug}.${lang}.json`);
  const problems = [];
  if (!fs.existsSync(trFile)) problems.push('bestand ontbreekt');
  else {
    try {
      compare(JSON.parse(fs.readFileSync(enFile, 'utf8')), JSON.parse(fs.readFileSync(trFile, 'utf8')), slug, problems);
    } catch (e) {
      problems.push(`geen geldige JSON: ${e.message}`);
    }
  }
  if (problems.length) {
    failed++;
    console.log(`✗ ${slug}.${lang}.json (${problems.length})`);
    for (const p of problems.slice(0, 25)) console.log(`    ${p}`);
  } else {
    console.log(`✓ ${slug}.${lang}.json`);
  }
}
console.log(`\n${list.length - failed} van ${list.length} in orde`);
process.exit(failed ? 1 : 0);
