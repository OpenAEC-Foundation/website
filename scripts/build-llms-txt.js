#!/usr/bin/env node
/**
 * build-llms-txt.js
 *
 * llms.txt werd met de hand bijgehouden en liep daardoor ver achter: het meldde
 * 4.750 commits, 570 sterren en 32 bijdragers terwijl de echte cijfers 10.222,
 * 1.842 en 37 waren, en het zette een tool in de spotlight met een versienummer
 * van maanden terug.
 *
 * Dat is erger dan geen bestand hebben. Onderzoek uit 2026 laat zien dat de
 * grote AI-crawlers llms.txt in de praktijk niet ophalen — ze lezen gewoon de
 * HTML. De uitzondering zijn codeer-assistenten, die het wél gebruiken. Het
 * bestand blijft dus staan, maar dan wel met kloppende cijfers, en zonder dat
 * iemand eraan hoeft te denken.
 *
 * De handgeschreven inleiding en de secties eronder blijven van jou: alleen het
 * blok tussen <!-- stats:start --> en <!-- stats:end --> wordt overschreven.
 *
 * Inputs:  data/stats.json, data/downloads.json, api/tools.json
 * Outputs: llms.txt (alleen het statistiekblok)
 *
 * Draaien: `node scripts/build-llms-txt.js`
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function readJson(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
}

const stats = readJson('data/stats.json');
const downloads = readJson('data/downloads.json');
const tools = readJson('api/tools.json');

if (!stats || !stats.summary) {
  console.error('data/stats.json ontbreekt of heeft geen summary — eerst generate-stats.js draaien.');
  process.exit(1);
}

const s = stats.summary;
const n = v => Number(v).toLocaleString('en-US');
const generated = (stats.generated || '').slice(0, 10);

const lines = [
  '<!-- stats:start -->',
  '## Key facts (generated, do not edit by hand)',
  '',
  `Last updated: ${generated}`,
  '',
  `- ${n(s.publicRepos)} public repositories on GitHub (${n(s.totalRepos)} total including private)`,
  `- ${n(s.totalCommits)} commits by ${n(s.uniqueContributors)} contributors`,
  `- ${n(s.totalStars)} GitHub stars, ${n(s.totalForks)} forks`,
  `- ${n(s.closedIssues)} issues closed, ${n(s.mergedPRs)} pull requests merged`,
];

if (tools && tools.totalTools) {
  lines.push(`- ${n(tools.totalTools)} tools in the catalog — machine-readable at https://open-aec.com/api/tools.json`);
}
if (downloads && downloads.grandTotal) {
  lines.push(`- ${n(downloads.grandTotal)} downloads across ${n(downloads.totalRepos)} released tools`);
}

lines.push(
  '- All tools LGPL-3.0 or LGPL-2.1, built with Rust + Tauri 2 + TypeScript',
  '- Cross-platform: Windows, macOS, Linux, web',
  '',
  'Forks of external projects are excluded from these numbers: they are not our own software.',
  '',
  'Available in four languages, each on its own URL:',
  'Dutch at https://open-aec.com/, English at /en/, French at /fr/, Turkish at /tr/.',
  '<!-- stats:end -->'
);

const block = lines.join('\n');
const file = path.join(ROOT, 'llms.txt');
let txt = fs.readFileSync(file, 'utf8');

if (/<!-- stats:start -->[\s\S]*?<!-- stats:end -->/.test(txt)) {
  txt = txt.replace(/<!-- stats:start -->[\s\S]*?<!-- stats:end -->/, block);
} else {
  // Eerste keer: het handgeschreven "Key facts"-blok vervangen, of anders
  // achteraan aanhaken.
  const old = /## Key facts[\s\S]*?(?=\n## )/;
  txt = old.test(txt) ? txt.replace(old, block + '\n\n') : txt.trimEnd() + '\n\n' + block + '\n';
}

fs.writeFileSync(file, txt);
console.log(`  llms.txt bijgewerkt — ${n(s.publicRepos)} repos, ${n(s.totalCommits)} commits, ${n(s.totalStars)} stars (${generated})`);
