#!/usr/bin/env node
/**
 * build-schema.js
 *
 * Drie stukken gestructureerde data die overal ontbraken:
 *
 *  - WebSite       stond op 0 pagina's. Hiermee weet een zoekmachine dat alle
 *                  losse pagina's één site vormen, met één naam en één uitgever.
 *  - BreadcrumbList stond op 0 pagina's. Dit is wat Google als kruimelpad onder
 *                  een zoekresultaat toont in plaats van een kale URL.
 *  - dateModified  stond op 2 van de 48 pagina's. Versheid weegt zwaar mee bij
 *                  de vraag of een AI-assistent een pagina citeert; zonder dit
 *                  veld moet zo'n crawler er zelf naar raden.
 *
 * De datum komt uit git: de laatste commit die het bestand aanraakte. Dat is
 * eerlijker dan een vaste datum in de HTML, die niemand bijwerkt.
 *
 * Het blok staat tussen <!-- schema:start --> en <!-- schema:end --> en wordt
 * bij elke run overschreven. Bestaande JSON-LD op de pagina blijft staan.
 *
 * Inputs:  de pagina's zelf, git
 * Outputs: die pagina's (in-place)
 *
 * Draaien: `node scripts/build-schema.js`
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const ORIGIN = 'https://open-aec.com';
const SKIP_DIRS = new Set(['old', 'presentation foundation', '.git', '.claude', 'node_modules']);
// De taalmappen worden wél meegenomen: dit script draait ná build-i18n-pages.js
// en zet daar de juiste URL, taal en kruimelpad, in plaats van de Nederlandse
// die uit het origineel meekwamen.
const LANG_DIRS = new Set(['en', 'fr', 'tr']);

function htmlFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

/** Laatste commitdatum van een bestand; valt terug op de bestandsdatum. */
function lastModified(file) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (out) return out;
  } catch (e) { /* geen git of geen historie */ }
  return fs.statSync(file).mtime.toISOString().slice(0, 10);
}

/** Leesbare naam per padsegment, voor het kruimelpad. */
function label(segment) {
  return segment
    .replace(/\.html$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bOpenaec\b/g, 'OpenAEC')
    .replace(/\bIfcx\b/g, 'IFCX')
    .replace(/\bBim\b/g, 'BIM')
    .replace(/\bPdf\b/g, 'PDF')
    .replace(/\bCad\b/g, 'CAD')
    .replace(/\bFaq\b/g, 'FAQ');
}

function breadcrumb(url) {
  const parts = url.split('/').filter(Boolean);
  // /en/over-ons.html hoort te lezen als "Home > About us", niet als
  // "Home > En > Over Ons": de taalmap is de wortel van die versie.
  let root = '/';
  if (LANG_DIRS.has(parts[0])) root = '/' + parts.shift() + '/';
  const items = [{ name: 'Home', item: ORIGIN + root }];
  let acc = root.replace(/\/$/, '');
  parts.forEach((p, i) => {
    acc += '/' + p;
    const isLast = i === parts.length - 1;
    items.push({ name: label(p), item: ORIGIN + acc + (isLast && !p.includes('.') ? '/' : '') });
  });
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.name, item: it.item,
    })),
  };
}

function urlFor(rel) {
  const p = '/' + rel.split(path.sep).join('/');
  return p.endsWith('/index.html') ? p.slice(0, -'index.html'.length) : p;
}

let changed = 0;
let unchanged = 0;

for (const file of htmlFiles(ROOT)) {
  const rel = path.relative(ROOT, file);
  if (rel === path.join('shared', 'nav.html')) continue;

  const html = fs.readFileSync(file, 'utf8');
  if (!/<\/head>/.test(html)) continue;

  const url = urlFor(rel);
  const lang = (/<html[^>]*lang="([^"]+)"/.exec(html) || [, 'nl'])[1];

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': ORIGIN + '/#website',
        url: ORIGIN + '/',
        name: 'OpenAEC Foundation',
        inLanguage: lang,
        publisher: { '@id': ORIGIN + '/#organization' },
      },
      {
        '@type': 'Organization',
        '@id': ORIGIN + '/#organization',
        name: 'OpenAEC Foundation',
        url: ORIGIN + '/',
        sameAs: [
          'https://github.com/OpenAEC-Foundation',
          'https://www.linkedin.com/company/23749451',
        ],
      },
      {
        '@type': 'WebPage',
        '@id': ORIGIN + url + '#webpage',
        url: ORIGIN + url,
        isPartOf: { '@id': ORIGIN + '/#website' },
        inLanguage: lang,
        dateModified: lastModified(file),
        breadcrumb: { '@id': ORIGIN + url + '#breadcrumb' },
      },
      Object.assign({ '@id': ORIGIN + url + '#breadcrumb' }, breadcrumb(url)),
    ],
  };

  const block =
    '  <!-- schema:start -->\n' +
    '  <script type="application/ld+json">\n' +
    JSON.stringify(graph, null, 2).split('\n').map(l => '  ' + l).join('\n') +
    '\n  </script>\n  <!-- schema:end -->\n';

  let out = html.replace(/[ \t]*<!-- schema:start -->[\s\S]*?<!-- schema:end -->\n?/, '');
  out = out.replace('</head>', block + '</head>');

  if (out !== html) { fs.writeFileSync(file, out); changed++; } else { unchanged++; }
}

console.log(`  ${changed} pagina('s) voorzien van WebSite, BreadcrumbList en dateModified, ${unchanged} ongewijzigd`);
