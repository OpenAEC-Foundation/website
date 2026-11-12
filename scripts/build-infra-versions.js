#!/usr/bin/env node
// Zet de gegevens uit data/infra-compat.json op de productpagina van Open Infra Studio:
// de versietabel, de vereiste Open CAD Studio-versie in de teksten, de downloadlinks en de
// bestandsgrootten. Werkt op de Nederlandse pagina, de taalversies en de vertaalbestanden,
// omdat de dagelijkse update build-i18n-pages.js niet draait. Zonder wijziging schrijft het niets.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data', 'infra-compat.json');
const PAGES = { nl: 'open-infra-studio/index.html', en: 'en/open-infra-studio/index.html', fr: 'fr/open-infra-studio/index.html', tr: 'tr/open-infra-studio/index.html', es: 'es/open-infra-studio/index.html', de: 'de/open-infra-studio/index.html' };
const JSONS = { en: 'open-infra-studio.json', fr: 'open-infra-studio.fr.json', tr: 'open-infra-studio.tr.json', es: 'open-infra-studio.es.json', de: 'open-infra-studio.de.json' };
const LATEST = { nl: 'nieuwste', en: 'latest', fr: 'dernière', tr: 'en yeni', es: 'la más reciente', de: 'neueste' };
const START = '<!-- infra-versies:start -->';
const END = '<!-- infra-versies:end -->';
const HOST_KEYS = ['header.plugin', 'install.intro', 'install.step1', 'download.compat', 'limits.version'];
const API_KEYS = ['download.compat'];
const SIZE_KEYS = {
  winSize: 'openaec.open-infra-windows-x86_64.dll',
  linuxSize: 'openaec.open-infra-linux-x86_64.so',
  macSize: 'openaec.open-infra-macos-aarch64.dylib',
  civielWinSize: 'open-infra-civiel-windows-x86_64.zip',
  civielLinuxSize: 'open-infra-civiel-linux-x86_64.zip',
  civielMacSize: 'open-infra-civiel-macos-aarch64.zip',
};

// Opeenvolgende releases voor dezelfde Open CAD Studio-versie worden één regel, nieuwste bovenaan.
function groupRows(data) {
  const rows = [];
  for (const rel of data.releases) {
    const last = rows[rows.length - 1];
    if (last && last.ocs === rel.ocs && last.api === rel.api) last.to = rel.tag;
    else rows.push({ ocs: rel.ocs, api: rel.api, from: rel.tag, to: rel.tag });
  }
  return rows.reverse();
}

function renderRows(data, lang, nl = '\n') {
  const label = ` <span class="versie-nu" data-i18n="versions.latest">${LATEST[lang]}</span>`;
  const infra = `https://github.com/${data.repo}/releases/tag/`;
  const host = `https://github.com/${data.ocsRepo}/releases/tag/`;
  return groupRows(data).map((row, i) => {
    const range = row.from === row.to ? '' : `${row.from} – `;
    return `          <tr${i === 0 ? ' class="versie-rij-nu"' : ''}><td><a href="${host}${row.ocs}" target="_blank" rel="noopener">${row.ocs}</a>${row.ocs === data.ocsLatest ? label : ''}</td><td>${row.api}</td><td>${range}<a href="${infra}${row.to}" target="_blank" rel="noopener">${row.to}</a>${i === 0 ? label : ''}</td></tr>`;
  }).join(nl);
}

const setHost = (text, ocs) => text.replace(/v\d{4}\.\d+(?:\.\d+)?/g, ocs);
const setApi = (text, api) => text.replace(/(API(?:\s+de\s+plugins?|’si)?\s*)\d+/, `$1${api}`);
function setSize(text, bytes) {
  return text.replace(/\d+([.,])\d+/, (_, sep) => (bytes / 1048576).toFixed(1).replace('.', sep));
}
const setLinks = (text, tag) => text.replace(/(Open-Infra-Studio\/releases\/download\/)v[\w.-]+?\//g, `$1${tag}/`);

function element(html, key) {
  const re = new RegExp(`(data-i18n="${key.replace(/\./g, '\\.')}"[^>]*>)([\\s\\S]*?)(</(?:p|li|span|div)>)`);
  return { re, m: html.match(re) };
}

function updatePage(html, data, lang) {
  const nl = html.includes('\r\n') ? '\r\n' : '\n';
  const { tag, ocs, api, sizes } = data.latest;
  const a = html.indexOf(START);
  const b = html.indexOf(END);
  if (a < 0 || b < a) throw new Error(`${lang}: de markeringen van de versietabel ontbreken`);
  let out = html.slice(0, a + START.length) + nl + renderRows(data, lang, nl) + nl + '          ' + html.slice(b);

  for (const key of HOST_KEYS) {
    const { re, m } = element(out, key);
    if (!m) throw new Error(`${lang}: ${key} niet gevonden`);
    out = out.replace(re, (_, x, text, y) => x + setHost(text, ocs) + y);
  }
  for (const key of API_KEYS) {
    const { re } = element(out, key);
    out = out.replace(re, (_, x, text, y) => x + setApi(text, api) + y);
  }
  for (const [key, asset] of Object.entries(SIZE_KEYS)) {
    if (!sizes[asset]) continue;
    const { re } = element(out, `download.${key}`);
    out = out.replace(re, (_, x, text, y) => x + setSize(text, sizes[asset]) + y);
  }
  out = setLinks(out, tag);
  const plain = tag.replace(/^v/, '');
  out = out.replace(/("softwareVersion":\s*")[^"]+"/, `$1${plain}"`);
  out = out.replace(/("softwareRequirements":\s*")[^"]+"/, `$1Open CAD Studio ${ocs} (plugin API ${api})"`);
  out = out.replace(/v[\d.]+( · Rust<)/, `${tag}$1`);
  out = out.replace(/(data-i18n="download\.title"[^>]*>[^<]*<\/span>\s*)v[\w.-]+/, `$1${tag}`);
  return out;
}

function updateTranslations(d, data) {
  const { tag, ocs, api, sizes } = data.latest;
  const get = key => key.split('.').reduce((o, k) => o[k], d);
  const set = (key, v) => {
    const parts = key.split('.');
    parts.slice(0, -1).reduce((o, k) => o[k], d)[parts[parts.length - 1]] = v;
  };
  for (const key of HOST_KEYS) set(key, setHost(get(key), ocs));
  for (const key of API_KEYS) set(key, setApi(get(key), api));
  for (const [key, asset] of Object.entries(SIZE_KEYS)) {
    if (sizes[asset]) d.download[key] = setSize(d.download[key], sizes[asset]);
  }
  d.download.signed = setLinks(d.download.signed, tag);
  return d;
}

function write(file, text) {
  if (fs.readFileSync(file, 'utf8') !== text) {
    fs.writeFileSync(file, text);
    return 1;
  }
  return 0;
}

function main() {
  const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  let changed = 0;
  for (const [lang, rel] of Object.entries(PAGES)) {
    const file = path.join(ROOT, rel);
    changed += write(file, updatePage(fs.readFileSync(file, 'utf8'), data, lang));
  }
  for (const rel of Object.values(JSONS)) {
    const file = path.join(ROOT, 'shared', 'translations', rel);
    const raw = fs.readFileSync(file, 'utf8');
    let text = JSON.stringify(updateTranslations(JSON.parse(raw), data), null, 2) + '\n';
    if (raw.includes('\r\n')) text = text.replace(/\n/g, '\r\n');
    changed += write(file, text);
  }
  console.log(`  Open Infra Studio ${data.latest.tag} voor Open CAD Studio ${data.latest.ocs}: ${changed} bestand(en) bijgewerkt`);
}

if (require.main === module) main();

module.exports = { groupRows, renderRows, updatePage, START, END, PAGES };
