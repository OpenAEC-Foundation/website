#!/usr/bin/env node
/**
 * build-i18n-pages.js
 *
 * De site is viertalig, maar de taal zat alleen in localStorage: elke pagina
 * had één URL en JavaScript wisselde de tekst om. Voor een bezoeker werkt dat,
 * voor zoekmachines niet. Google indexeert dan alleen de Nederlandse versie —
 * Google's eigen documentatie vraagt om aparte URL's per taal met rel=alternate
 * hreflang. En de crawlers van AI-assistenten voeren meestal helemaal geen
 * JavaScript uit, dus die zagen sowieso alleen Nederlands.
 *
 * Resultaat: alle Engelse, Franse en Turkse vertalingen op de site waren
 * onvindbaar. Dit script bakt ze uit naar echte pagina's:
 *
 *     /over-ons.html          → Nederlands (het origineel blijft waar het staat)
 *     /en/over-ons.html       → Engels
 *     /fr/over-ons.html       → Frans
 *     /tr/over-ons.html       → Turks
 *
 * Elke versie krijgt:
 *  - de vertaalde tekst statisch in de HTML (geen JavaScript nodig)
 *  - <html lang="..."> en een vertaalde <title>
 *  - een eigen canonical
 *  - rel=alternate hreflang naar alle vier de versies plus x-default
 *  - interne links die binnen dezelfde taal blijven
 *  - een taalschakelaar van echte <a href>-links. Dat is geen detail: Google
 *    negeert hreflang als de taalversies niet met gewone links naar elkaar
 *    wijzen.
 *
 * De gegenereerde pagina's dragen <meta name="i18n-static">, waardoor
 * shared/i18n.js zijn handen thuishoudt — de HTML is al vertaald.
 *
 * Inputs:  de Nederlandse pagina's, shared/translations/*.json
 * Outputs: en/, fr/, tr/ plus hreflang in de Nederlandse originelen
 *
 * Draaien: `node scripts/build-i18n-pages.js`
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ORIGIN = 'https://open-aec.com';
const LANGS = ['en', 'fr', 'tr'];
const ALL = ['nl', ...LANGS];
const OG_LOCALE = { nl: 'nl_NL', en: 'en_US', fr: 'fr_FR', tr: 'tr_TR' };
const SKIP_DIRS = new Set(['old', 'presentation foundation', '.git', '.claude', 'node_modules', ...LANGS]);

// ── helpers ────────────────────────────────────────────────────────────────

function htmlFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
}

function mergeInto(target, source) {
  for (const k of Object.keys(source)) {
    const v = source[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if (!target[k] || typeof target[k] !== 'object') target[k] = {};
      mergeInto(target[k], v);
    } else target[k] = v;
  }
  return target;
}

const dig = (obj, dotted) => dotted.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

/**
 * Vervangt de inhoud van elk element met data-i18n="sleutel".
 * Regex kan dit niet: elementen bevatten andere elementen, soms van dezelfde
 * soort. We zoeken daarom de bijbehorende sluittag door mee te tellen hoe diep
 * we zitten in tags met dezelfde naam.
 */
function translateElements(html, translations) {
  const open = /<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*\bdata-i18n="([^"]+)"[^>]*)>/g;
  let out = '';
  let last = 0;
  let m;

  while ((m = open.exec(html)) !== null) {
    const [whole, tag, attrs, key] = m;
    const value = dig(translations, key);
    const bodyStart = m.index + whole.length;

    // Attribuutvertaling (placeholder, title, ...) heeft geen body nodig.
    const attrTarget = /\bdata-i18n-attr="([^"]+)"/.exec(attrs);
    if (attrTarget && typeof value === 'string') {
      const re = new RegExp(`\\b${attrTarget[1]}="[^"]*"`);
      const newOpen = re.test(whole)
        ? whole.replace(re, `${attrTarget[1]}="${value.replace(/"/g, '&quot;')}"`)
        : whole.replace(/>$/, ` ${attrTarget[1]}="${value.replace(/"/g, '&quot;')}">`);
      out += html.slice(last, m.index) + newOpen;
      last = bodyStart;
      continue;
    }

    if (typeof value !== 'string') continue; // geen vertaling: laten staan

    // Zoek de sluittag die bij deze opening hoort.
    const scan = new RegExp(`<${tag}\\b[^>]*>|</${tag}\\s*>`, 'g');
    scan.lastIndex = bodyStart;
    let depth = 1, close = -1, s;
    while ((s = scan.exec(html)) !== null) {
      if (s[0][1] === '/') { depth--; if (depth === 0) { close = s.index; break; } }
      else if (!s[0].endsWith('/>')) depth++;
    }
    if (close === -1) continue;

    out += html.slice(last, bodyStart) + value;
    last = close;
    open.lastIndex = close;
  }
  return out + html.slice(last);
}

/** Nav-links en knoppen gebruiken data-i18n-en/fr/tr in plaats van een sleutel. */
function translateInlineAttrs(html, lang) {
  return html.replace(
    /<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*\bdata-i18n-(?:en|fr|tr)="[^"]*"[^>]*)>([^<]*)<\/\1>/g,
    (whole, tag, attrs, body) => {
      const own = new RegExp(`\\bdata-i18n-${lang}="([^"]*)"`).exec(attrs);
      const en = /\bdata-i18n-en="([^"]*)"/.exec(attrs);
      const value = (own && own[1]) || (en && en[1]);
      return value ? `<${tag}${attrs}>${value}</${tag}>` : whole;
    }
  );
}

// ── pagina's verzamelen ────────────────────────────────────────────────────

/** URL-pad van een bestand: index.html wordt een map-URL. */
function urlFor(rel) {
  const p = '/' + rel.split(path.sep).join('/');
  return p.endsWith('/index.html') ? p.slice(0, -'index.html'.length) : p;
}

const pages = [];
for (const file of htmlFiles(ROOT)) {
  const rel = path.relative(ROOT, file);
  if (rel === path.join('shared', 'nav.html')) continue;
  const html = fs.readFileSync(file, 'utf8');
  if (!/data-i18n="/.test(html)) continue;

  const idMatch = /<meta name="i18n-page" content="([^"]+)"/.exec(html);
  let source = null;

  if (idMatch) {
    source = { kind: 'files', id: idMatch[1] };
  } else if (html.includes('const translations = {')) {
    // De homepage draagt zijn vertalingen inline mee.
    source = { kind: 'inline' };
  }
  if (!source) continue;

  pages.push({ file, rel, url: urlFor(rel), html, source });
}

const TRANSLATABLE = new Set(pages.map(p => p.url));

// ── vertalingen per pagina en taal ─────────────────────────────────────────

function inlineTranslations(html) {
  const i = html.indexOf('const translations = {');
  const start = html.indexOf('{', i);
  let depth = 0, j = start;
  for (; j < html.length; j++) {
    if (html[j] === '{') depth++;
    else if (html[j] === '}') { depth--; if (depth === 0) { j++; break; } }
  }
  // eslint-disable-next-line no-eval
  return eval('(' + html.slice(start, j) + ')');
}

function translationsFor(page, lang) {
  if (page.source.kind === 'inline') {
    const all = inlineTranslations(page.html);
    return mergeInto(mergeInto({}, all.en || {}), all[lang] || {});
  }
  const dir = path.join(ROOT, 'shared', 'translations');
  const en = readJson(path.join(dir, `${page.source.id}.json`)) || {};
  const own = lang === 'en' ? {} : (readJson(path.join(dir, `${page.source.id}.${lang}.json`)) || {});
  return mergeInto(mergeInto({}, en), own);
}

// ── linkherschrijving ──────────────────────────────────────────────────────

/**
 * Relatieve verwijzingen absoluut maken. Een pagina in /statuten/ die naar
 * "oprichtingsakte.md" wijst, komt in /fr/statuten/ terecht — daar bestaat dat
 * bestand niet. Absoluut maken houdt de verwijzing heel.
 */
function absolutise(html, pageUrl) {
  const dir = pageUrl.endsWith('/') ? pageUrl : pageUrl.slice(0, pageUrl.lastIndexOf('/') + 1);
  const fix = (chunk) => chunk.replace(/\b(href|src)="([^"]+)"/g, (whole, attr, u) => {
    if (/^(\/|https?:|#|mailto:|tel:|javascript:|data:|\/\/)/.test(u) || u.includes('${') || u.includes('$1')) return whole;
    return `${attr}="${dir}${u}"`;
  });

  // Alleen de opmaak aanpassen, niet de inhoud van <script> of <style>. Daar
  // staan href="..."-fragmenten in JavaScript-strings; die absoluut maken zou
  // de code stuk maken (een autolinker bouwde zo href="/pad/https://...").
  const parts = html.split(/(<(?:script|style)\b[\s\S]*?<\/(?:script|style)>)/i);
  return parts.map((part, i) => (i % 2 === 1 ? part : fix(part))).join('');
}

/** Interne links binnen dezelfde taal houden; assets en externe links niet. */
function rewriteLinks(html, lang) {
  if (lang === 'nl') return html;
  return html.replace(/href="(\/[^"]*)"/g, (whole, href) => {
    const [pathPart, tail = ''] = [href.split(/[#?]/)[0], href.slice(href.split(/[#?]/)[0].length)];
    if (!TRANSLATABLE.has(pathPart)) return whole;
    return `href="/${lang}${pathPart}${tail}"`;
  });
}

// ── head-aanpassingen ──────────────────────────────────────────────────────

function alternates(url) {
  const lines = ALL.map(l => {
    const href = l === 'nl' ? ORIGIN + url : `${ORIGIN}/${l}${url}`;
    return `  <link rel="alternate" hreflang="${l}" href="${href}">`;
  });
  lines.push(`  <link rel="alternate" hreflang="x-default" href="${ORIGIN + url}">`);
  return lines.join('\n');
}

/** Platte tekst uit een vertaalwaarde, afgekapt op een woordgrens. */
function plain(value, max = 155) {
  if (typeof value !== 'string') return null;
  const txt = value.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
  if (!txt) return null;
  if (txt.length <= max) return txt;
  return txt.slice(0, txt.lastIndexOf(' ', max)).replace(/[,;:]$/, '') + '…';
}

function setHead(html, { lang, url, title, description }) {
  // Bestaand hreflang-blok van een vorige run weghalen.
  html = html.replace(/\n?[ \t]*<!-- hreflang:start -->[\s\S]*?<!-- hreflang:end -->/g, '');

  html = html.replace(/<html([^>]*)\blang="[^"]*"/, `<html$1lang="${lang}"`);

  if (title) {
    html = html.replace(/<title([^>]*)>[\s\S]*?<\/title>/, (w, a) => `<title${a}>${title}</title>`);
    html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title.replace(/"/g, '&quot;')}$2`);
  }

  // De beschrijving is wat in de zoekresultaten staat; die in het Nederlands
  // laten staan op een Engelse pagina kost meteen kliks. Waar geen eigen
  // meta.description bestaat, gebruiken we de hero-tekst van de pagina.
  if (description) {
    const esc = description.replace(/"/g, '&quot;');
    html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc}$2`);
    html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc}$2`);
    html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc}$2`);
  }

  const canonical = lang === 'nl' ? ORIGIN + url : `${ORIGIN}/${lang}${url}`;
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`);
  html = html.replace(/(<meta property="og:locale" content=")[^"]*(")/, `$1${OG_LOCALE[lang]}$2`);

  const block = `\n  <!-- hreflang:start -->\n${alternates(url)}\n  <!-- hreflang:end -->`;
  if (/<link rel="canonical"[^>]*>/.test(html)) {
    html = html.replace(/(<link rel="canonical"[^>]*>)/, `$1${block}`);
  } else {
    html = html.replace(/(<\/head>)/, `${block}\n$1`);
  }

  // Op de echte tag testen, niet op de losse tekst: pagina's die zelf
  // meta[name="i18n-static"] opvragen in JavaScript bevatten die string ook,
  // en dan zou de meta nooit worden toegevoegd.
  if (lang !== 'nl' && !/<meta name="i18n-static"/.test(html)) {
    html = html.replace(/(<\/head>)/, `  <meta name="i18n-static" content="${lang}">\n$1`);
  }
  return html;
}

/** Taalknoppen worden echte links — anders honoreert Google de hreflang niet. */
function linkifySwitcher(html, url, current) {
  return html.replace(
    /<button class="lang-btn([^"]*)" data-lang="([a-z]{2})">([^<]*)<\/button>/g,
    (whole, cls, l, label) => {
      const href = l === 'nl' ? url : `/${l}${url}`;
      const active = l === current ? ' active' : '';
      const base = cls.replace(/\s*active\s*/, '');
      return `<a class="lang-btn${base}${active}" data-lang="${l}" href="${href}" hreflang="${l}">${label}</a>`;
    }
  );
}

// ── uitvoeren ──────────────────────────────────────────────────────────────

let written = 0;
const generated = [];

for (const page of pages) {
  for (const lang of LANGS) {
    const tr = translationsFor(page, lang);
    let html = page.html;

    html = absolutise(html, page.url);
    html = translateElements(html, tr);
    html = translateInlineAttrs(html, lang);
    html = setHead(html, {
      lang,
      url: page.url,
      title: dig(tr, 'meta.title'),
      description: plain(dig(tr, 'meta.description')) || plain(dig(tr, 'header.desc')),
    });
    html = rewriteLinks(html, lang);
    html = linkifySwitcher(html, page.url, lang);

    const out = path.join(ROOT, lang, page.rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html);
    written++;
    generated.push(`/${lang}${page.url}`);
  }

  // Het Nederlandse origineel krijgt dezelfde hreflang-verwijzingen terug.
  let nl = setHead(page.html, { lang: 'nl', url: page.url, title: null, description: null });
  nl = linkifySwitcher(nl, page.url, 'nl');
  if (nl !== page.html) fs.writeFileSync(page.file, nl);
}

console.log(`  ${pages.length} pagina's × ${LANGS.length} talen → ${written} bestanden geschreven`);
console.log(`  Nederlandse originelen voorzien van hreflang en linkbare taalschakelaar`);

// ── sitemap bijwerken ──────────────────────────────────────────────────────

const smPath = path.join(ROOT, 'sitemap.xml');
if (fs.existsSync(smPath)) {
  let sm = fs.readFileSync(smPath, 'utf8');
  sm = sm.replace(/\n?[ \t]*<!-- i18n:start -->[\s\S]*?<!-- i18n:end -->/g, '');
  const rows = generated
    .map(u => `  <url><loc>${ORIGIN}${u}</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`)
    .join('\n');
  sm = sm.replace(/(\n)?<\/urlset>/, `\n  <!-- i18n:start -->\n${rows}\n  <!-- i18n:end -->\n</urlset>`);
  fs.writeFileSync(smPath, sm);
  console.log(`  sitemap.xml: ${generated.length} taal-URL's toegevoegd`);
}
