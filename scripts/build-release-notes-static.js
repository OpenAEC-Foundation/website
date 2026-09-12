#!/usr/bin/env node
/**
 * build-release-notes-static.js
 *
 * Twee dingen die alleen met JavaScript gebeurden en daardoor onzichtbaar
 * waren voor crawlers en voor LLM's die geen JavaScript uitvoeren:
 *
 *  1. De uitgebreide changelog van de nieuwste versie. shared/release-notes.js
 *     haalt data/release-notes/<repo>.json client-side op en rendert die.
 *     Dit script schrijft dezelfde inhoud als statische HTML in de placeholder,
 *     tussen <!-- rn:start --> en <!-- rn:end -->. De widget overschrijft die
 *     inhoud zodra JavaScript draait, dus bezoekers zien exact hetzelfde.
 *
 *  2. softwareVersion in de SoftwareApplication-JSON-LD. Dat veld stond er
 *     bewust niet in omdat data/stats.json achterloopt en build-tags bevat
 *     ("untagged-<sha>", "0.1.1-pr13.alpha"). data/release-notes/<repo>.json
 *     heeft wél de juiste tag en wordt bij elke refresh bijgewerkt, dus die
 *     gebruiken we hier — daarmee is het veld zelf-corrigerend.
 *
 *  3. De releasetijdlijn. Pagina's met data-release-notes-timeline krijgen
 *     dezelfde tijdlijn als de widget rendert: per release een kaartje met de
 *     redactionele koppen uit data/release-highlights/<repo>.json, en een
 *     compacte regel voor releases van vóór die catalogus.
 *
 * Alleen pagina's met data-release-notes-latest of data-release-notes-timeline
 * worden verwerkt. De taal komt uit <meta name="i18n-static">; staat die er
 * niet, dan is de pagina Nederlands.
 *
 * Inputs:  data/release-notes/<repo>.json, data/release-highlights/<repo>.json,
 *          de productpagina's
 * Outputs: de productpagina's (in-place)
 *
 * Draaien: `node scripts/build-release-notes-static.js`
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['old', 'presentation foundation', '.git', '.claude', 'node_modules']);

function htmlFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Zelfde beperkte markdown-ondersteuning als in shared/release-notes.js:
// eerst alles escapen, daarna alleen koppen, lijsten, vet, code en links.
function renderMarkdown(md) {
  const inline = (s) => escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  const out = [];
  let list = null, para = [];
  const flushList = () => { if (list && list.length) out.push(`<ul>${list.map(i => `<li>${inline(i)}</li>`).join('')}</ul>`); list = null; };
  const flushPara = () => { if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`); para = []; };

  for (const raw of md.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    const heading = line.match(/^(#{3,4})\s+(.*)$/);
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (heading) { flushList(); flushPara(); out.push(`<h4>${inline(heading[2])}</h4>`); }
    else if (bullet) { flushPara(); if (!list) list = []; list.push(bullet[1]); }
    else if (!line.trim()) { flushList(); flushPara(); }
    else if (list) { list[list.length - 1] += ' ' + line.trim(); }
    else { para.push(line.trim()); }
  }
  flushList(); flushPara();
  return out.join('\n');
}

function staticBlock(data) {
  const rel = data.latestStable;
  if (!rel) return null;
  const body = data.latestChangelog
    ? `<div class="rn-changelog">${renderMarkdown(data.latestChangelog)}</div>`
    : '';
  if (!body) return null;
  return [
    '<!-- rn:start Gegenereerd door scripts/build-release-notes-static.js — niet met de hand bewerken -->',
    '<section class="rn-section"><div class="rn-container">',
    '<div class="rn-header-block">',
    '<h2 class="rn-title">Release notes</h2>',
    `<p class="rn-desc"><strong>${escapeHtml(rel.tag)}</strong> &middot; ${escapeHtml(rel.date || '')}</p>`,
    '</div>',
    '<div class="rn-groups"><div class="rn-group latest expanded"><div class="rn-group-body">',
    body,
    '</div></div></div>',
    `<p class="rn-viewall"><a href="https://github.com/OpenAEC-Foundation/${escapeHtml(data.repo)}/releases" target="_blank" rel="noopener">Bekijk alle releases op GitHub &rarr;</a></p>`,
    '</div></section>',
    '<!-- rn:end -->',
  ].join('\n');
}

// ── Tijdlijn ───────────────────────────────────────────────────────────────
// Dezelfde inhoud als shared/release-notes.js in tijdlijn-modus rendert, maar
// dan statisch en in de taal van de pagina. De teksten staan hier bewust een
// tweede keer: dit script draait in Node zonder bundler, net als de bestaande
// renderMarkdown-kopie hierboven.

const T = {
  nl: { title: 'Release notes', latest: 'Laatste', more: 'Meer', viewGitHub: 'Bekijk op GitHub →', viewAll: 'Bekijk alle releases op GitHub →', noNotes: 'Geen notities beschikbaar voor deze versie.', desc: 'De hoofdpunten per versie. Klik op Meer voor de volledige notities.', days: (n, one) => `${n} ${one ? 'dag' : 'dagen'}`, commits: (n) => `${n} commits`, lines: (n) => `+${n} regels code` },
  en: { title: 'Release notes', latest: 'Latest', more: 'More', viewGitHub: 'View on GitHub →', viewAll: 'View all releases on GitHub →', noNotes: 'No notes available for this version.', desc: 'The headlines per version. Use More for the full notes.', days: (n, one) => `${n} ${one ? 'day' : 'days'}`, commits: (n) => `${n} commits`, lines: (n) => `+${n} lines of code` },
  fr: { title: 'Notes de version', latest: 'Dernière', more: 'Plus', viewGitHub: 'Voir sur GitHub →', viewAll: 'Voir toutes les versions sur GitHub →', noNotes: 'Aucune note disponible pour cette version.', desc: 'Les points forts par version. Cliquez sur Plus pour les notes complètes.', days: (n, one) => `${n} ${one ? 'jour' : 'jours'}`, commits: (n) => `${n} commits`, lines: (n) => `+${n} lignes de code` },
  tr: { title: 'Sürüm notları', latest: 'En son', more: 'Daha fazla', viewGitHub: "GitHub'da görüntüle →", viewAll: "Tüm sürümleri GitHub'da görüntüle →", noNotes: 'Bu sürüm için not bulunmuyor.', desc: "Sürüm başına öne çıkanlar. Tüm notlar için Daha fazla'ya tıklayın.", days: (n) => `${n} gün`, commits: (n) => `${n} commit`, lines: (n) => `+${n} kod satırı` },
  es: { title: 'Notas de la versión', latest: 'Última', more: 'Más', viewGitHub: 'Ver en GitHub →', viewAll: 'Ver todas las versiones en GitHub →', noNotes: 'No hay notas disponibles para esta versión.', desc: 'Los puntos clave por versión. Pulse Más para ver las notas completas.', days: (n, one) => `${n} ${one ? 'día' : 'días'}`, commits: (n) => `${n} commits`, lines: (n) => `+${n} líneas de código` },
};

const ICON_PATHS = {
  tasks: '<path d="M4 6h10M4 12h10M4 18h10"/><path d="M18 5l2 2 3-3"/>',
  import: '<path d="M12 3v11"/><path d="M8 10l4 4 4-4"/><path d="M4 17v3h16v-3"/>',
  library: '<path d="M4 4h4v16H4z"/><path d="M10 4h4v16h-4z"/><path d="M16.5 5l3.5 1-3 15-3.5-1z"/>',
  relations: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H14a2 2 0 0 1 2 2v7.5"/>',
  examples: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 17h4"/>',
};

const iconSvg = (name) =>
  `<svg class="rn-tl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name] || '<circle cx="12" cy="12" r="4"/>'}</svg>`;

const slug = (s) => String(s).replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');

function num(n, lang) {
  try { return new Intl.NumberFormat(lang).format(n); } catch (e) { return String(n); }
}

function statsLine(stats, lang) {
  if (!stats) return '';
  const tr = T[lang] || T.nl;
  const parts = [];
  if (typeof stats.daysSincePrevious === 'number') parts.push(tr.days(num(stats.daysSincePrevious, lang), stats.daysSincePrevious === 1));
  if (typeof stats.commitsSincePrevious === 'number') parts.push(tr.commits(num(stats.commitsSincePrevious, lang)));
  if (typeof stats.addedCodeLines === 'number') parts.push(tr.lines(num(stats.addedCodeLines, lang)));
  if (!parts.length) return '';
  return `<p class="rn-tl-stats">${parts.map(escapeHtml).join(' &middot; ')}</p>`;
}

// Dezelfde keuze als de widget: voor de nieuwste release de uitgebreide
// changelog, anders de losse regels uit de GitHub-release-body.
function notesBody(data, release, lang) {
  const isLatest = data.latestStable && data.latestStable.tag === release.tag;
  if (isLatest && data.latestChangelog) {
    return `<div class="rn-changelog">${renderMarkdown(data.latestChangelog)}</div>`;
  }
  const source = (lang === 'en' && Array.isArray(release.changesEn) && release.changesEn.length)
    ? release.changesEn
    : (release.changes || []);
  const seen = new Set();
  const changes = source.filter((c) => {
    const k = String(c).trim();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  if (!changes.length) return `<p class="rn-loading">${escapeHtml((T[lang] || T.nl).noNotes)}</p>`;
  const inline = (s) => escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return `<ol class="rn-changes-list">${changes.map((c) => `<li>${inline(c)}</li>`).join('')}</ol>`;
}

// ── Releases zonder redactionele koppen ────────────────────────────────────
// Dezelfde platte lijst als shared/release-notes.js rendert: de eerste vijf
// bullets uit de GitHub-releasebody, de rest achter "Meer".
const PLAIN_MAX = 5;
const PLAIN_CHARS = 160;

const inlineMd = (s) => escapeHtml(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

function plainChanges(release, lang) {
  const useEn = lang !== 'nl' && Array.isArray(release.changesEn) && release.changesEn.length;
  const source = useEn ? release.changesEn : (release.changes || []);
  const seen = new Set();
  return source.filter((c) => {
    const k = String(c).trim();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// Afkappen op een heel woord; een oneven aantal "**" alsnog sluiten, anders
// blijft er markdown zichtbaar in de tekst staan.
function truncateChange(s, max) {
  const str = String(s).trim().replace(/\s+/g, ' ');
  if (str.length <= max) return str;
  let cut = str.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  if (sp > max * 0.6) cut = cut.slice(0, sp);
  cut = cut.replace(/[\s.,;:\u2013\u2014-]+$/, '');
  if ((cut.match(/\*\*/g) || []).length % 2 === 1) cut += '**';
  return cut + '\u2026';
}

function plainItem(rel, lang) {
  const tr = T[lang] || T.nl;
  const changes = plainChanges(rel, lang);
  if (!changes.length) {
    return [
      '<li class="rn-tl-item">',
      '<div class="rn-tl-row">',
      `<span class="rn-tl-version">${escapeHtml(rel.tag)}</span>`,
      `<span class="rn-tl-date">${escapeHtml(rel.date || '')}</span>`,
      `<a href="${escapeHtml(rel.url || '')}" target="_blank" rel="noopener">${escapeHtml(tr.viewGitHub)}</a>`,
      '</div>',
      '</li>',
    ].join('');
  }
  const shown = changes.slice(0, PLAIN_MAX);
  const rest = changes.slice(PLAIN_MAX);
  const id = `rn-more-${slug(rel.tag)}`;
  return [
    '<li class="rn-tl-item">',
    '<div class="rn-tl-plain">',
    '<div class="rn-tl-row">',
    `<span class="rn-tl-version">${escapeHtml(rel.tag)}</span>`,
    `<span class="rn-tl-date">${escapeHtml(rel.date || '')}</span>`,
    '</div>',
    `<ul class="rn-tl-plain-list">${shown.map((c) => `<li>${inlineMd(truncateChange(c, PLAIN_CHARS))}</li>`).join('')}</ul>`,
    '<div class="rn-tl-actions">',
    rest.length ? `<button type="button" class="rn-toggle" data-rn-more aria-expanded="false" aria-controls="${id}">${escapeHtml(tr.more)}</button>` : '',
    `<a class="rn-tl-gh" href="${escapeHtml(rel.url || '')}" target="_blank" rel="noopener">${escapeHtml(tr.viewGitHub)}</a>`,
    '</div>',
    rest.length ? `<div class="rn-tl-more" id="${id}" hidden><ol class="rn-changes-list">${rest.map((c) => `<li>${inlineMd(c)}</li>`).join('')}</ol></div>` : '',
    '</div>',
    '</li>',
  ].join('');
}

function flattenReleases(data) {
  const all = [];
  (data.groups || []).forEach((g) => (g.releases || []).forEach((r) => all.push(r)));
  return all.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
}

function timelineBlock(data, highlights, lang) {
  const tr = T[lang] || T.nl;
  const releases = flattenReleases(data);
  if (!releases.length) return null;

  const byTag = {};
  ((highlights && highlights.releases) || []).forEach((r) => { byTag[r.tag] = r; });

  let latestSeen = false;
  const items = releases.map((rel) => {
    const hl = byTag[rel.tag];
    const copy = hl && hl.highlights ? (hl.highlights[lang] || hl.highlights.en) : null;
    if (!copy) return plainItem(rel, lang);
    const isLatest = !latestSeen;
    latestSeen = true;
    const id = `rn-more-${slug(rel.tag)}`;
    const secondary = (copy.secondary || []).slice(0, 4).map((h) => [
      '<li class="rn-tl-sec">',
      iconSvg(h.icon),
      '<span>',
      `<span class="rn-tl-cat">${escapeHtml(h.category)}</span>`,
      `<span class="rn-tl-sec-title">${escapeHtml(h.title)}</span>`,
      '</span>',
      '</li>',
    ].join('')).join('');

    return [
      `<li class="rn-tl-item${isLatest ? ' latest' : ''}">`,
      '<article class="rn-tl-card">',
      '<header class="rn-tl-head">',
      `<h3 class="rn-tl-version">${escapeHtml(rel.tag)}</h3>`,
      `<span class="rn-tl-date"><time datetime="${escapeHtml(rel.date || '')}">${escapeHtml(rel.date || '')}</time></span>`,
      isLatest ? `<span class="rn-group-badge">${escapeHtml(tr.latest)}</span>` : '',
      '</header>',
      statsLine(hl.stats, lang),
      '<div class="rn-tl-primary">',
      `<span class="rn-tl-cat">${escapeHtml(copy.primary.category)}</span>`,
      `<h4 class="rn-tl-primary-title">${escapeHtml(copy.primary.title)}</h4>`,
      `<p class="rn-tl-primary-desc">${escapeHtml(copy.primary.description)}</p>`,
      '</div>',
      `<ul class="rn-tl-secondary">${secondary}</ul>`,
      '<div class="rn-tl-actions">',
      `<button type="button" class="rn-toggle" data-rn-more aria-expanded="false" aria-controls="${id}">${escapeHtml(tr.more)}</button>`,
      `<a class="rn-tl-gh" href="${escapeHtml(rel.url || '')}" target="_blank" rel="noopener">${escapeHtml(tr.viewGitHub)}</a>`,
      '</div>',
      // De volledige notities staan er ook zonder JavaScript in — crawlers
      // lezen ze, de widget vervangt ze zodra hij draait.
      `<div class="rn-tl-more" id="${id}" hidden>${notesBody(data, rel, lang)}</div>`,
      '</article>',
      '</li>',
    ].join('');
  }).join('\n');

  const latest = data.latestStable || releases[0];

  return [
    '<!-- rn:start Gegenereerd door scripts/build-release-notes-static.js — niet met de hand bewerken -->',
    '<section class="rn-section"><div class="rn-container">',
    '<div class="rn-header-block">',
    `<h2 class="rn-title">${escapeHtml(tr.title)}</h2>`,
    `<p class="rn-desc"><strong>${escapeHtml(latest.tag)}</strong> &middot; ${escapeHtml(latest.date || '')} &middot; ${escapeHtml(tr.desc)}</p>`,
    '</div>',
    `<ol class="rn-timeline">${items}</ol>`,
    `<p class="rn-viewall"><a href="https://github.com/OpenAEC-Foundation/${escapeHtml(data.repo)}/releases" target="_blank" rel="noopener">${escapeHtml(tr.viewAll)}</a></p>`,
    '</div></section>',
    '<!-- rn:end -->',
  ].join('\n');
}

function pageLang(html) {
  const m = html.match(/<meta\s+name="i18n-static"\s+content="([^"]+)"/);
  const lang = m ? m[1] : 'nl';
  return T[lang] ? lang : 'nl';
}

// softwareVersion in het SoftwareApplication-blok zetten of bijwerken.
// Bestaat het veld al, dan alleen de waarde vervangen — anders groeit er bij
// elke run een regel bij.
function stampVersion(html, tag) {
  const version = JSON.stringify(String(tag).replace(/^v/, ''));
  if (/"softwareVersion"\s*:/.test(html)) {
    return html.replace(/("softwareVersion"\s*:\s*)"[^"]*"/, `$1${version}`);
  }
  // Anders invoegen direct na operatingSystem in het eerste JSON-LD-blok dat
  // het heeft; dat is per conventie het SoftwareApplication-blok.
  return html.replace(
    /\n(\s*)"operatingSystem":[^\n]*\n/,
    (line, indent) => `${line}${indent}"softwareVersion": ${version},\n`
  );
}

// Een eerder gegenereerd blok eerst volledig weghalen. Zonder deze stap zou
// een tweede run de placeholder-<div> matchen tot de eerste </div> ín het
// gegenereerde blok, en het bestand beschadigen.
const STALE = /\n?<!-- rn:start[\s\S]*?<!-- rn:end -->\n?/g;

let pages = 0, stamped = 0;
for (const file of htmlFiles(ROOT)) {
  let html = fs.readFileSync(file, 'utf8').replace(STALE, '');
  const m = html.match(/<div([^>]*\bdata-release-notes="([^"]+)"[^>]*)>\s*<\/div>/);
  if (!m) continue;
  const timeline = /data-release-notes-timeline/.test(m[1]);
  if (!timeline && !/data-release-notes-latest/.test(m[1])) continue;

  const repo = m[2];
  const dataPath = path.join(ROOT, 'data', 'release-notes', `${repo}.json`);
  if (!fs.existsSync(dataPath)) { console.warn(`  ✗ geen data voor ${repo}`); continue; }
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  let block = null;
  let what = '';
  if (timeline) {
    const hlPath = path.join(ROOT, 'data', 'release-highlights', `${repo}.json`);
    const highlights = fs.existsSync(hlPath) ? JSON.parse(fs.readFileSync(hlPath, 'utf8')) : null;
    if (!highlights) console.warn(`  ! ${repo}: geen release-highlights, tijdlijn zonder koppen`);
    const lang = pageLang(html);
    block = timelineBlock(data, highlights, lang);
    const withCopy = ((highlights && highlights.releases) || []).length;
    what = `tijdlijn ${lang}, ${withCopy} met koppen`;
  } else {
    block = staticBlock(data);
    what = data.latestChangelog ? `${data.latestChangelog.split('\n').length} regels changelog` : '';
  }
  if (!block) { console.warn(`  ✗ ${repo}: niets te renderen, overgeslagen`); continue; }

  const original = fs.readFileSync(file, 'utf8');
  const opened = `<div${m[1]}>`;
  // Replacer as a FUNCTION, not a string: a changelog can contain a literal
  // "$" (e.g. IFC's null-value marker, described in prose), and a string
  // replacement argument treats "$&", "$$", "$1" etc. as special patterns —
  // "$&" in particular re-inserts the whole matched placeholder <div>,
  // corrupting the page. A function return value is inserted verbatim.
  html = html.replace(m[0], () => `${opened}\n${block}\n</div>`);
  const before = original;

  if (data.latestStable && data.latestStable.tag) {
    const v = stampVersion(html, data.latestStable.tag);
    if (v !== html) { html = v; stamped++; }
  }

  if (html !== before) {
    fs.writeFileSync(file, html);
    pages++;
    console.log(`  ✓ ${path.relative(ROOT, file)} — ${data.latestStable ? data.latestStable.tag : '?'}${what ? `, ${what}` : ''}`);
  }
}
console.log(`\n${pages} pagina('s) bijgewerkt, ${stamped} met softwareVersion.`);
