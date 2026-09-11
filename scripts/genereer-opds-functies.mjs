// Genereert data/open-pdf-studio-functies.json: het volledige functieoverzicht
// van Open PDF Studio, rechtstreeks uit de broncode van de app.
//
// Bron: de lint-tabbladen (js/solid/components/ribbon/*Tab.jsx), de
// vertaalbestanden van de app en de tool-lijst van de MCP-server. Zo blijft de
// website gelijk met de app zonder dat iemand een lijst bijhoudt.
//
// Gebruik:  node scripts/genereer-opds-functies.mjs [pad-naar-open-pdf-studio-repo]
//           (standaard: de map naast deze website-repo)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));
const WEBSITE = resolve(HIER, '..');
const REPO = resolve(process.argv[2] || join(WEBSITE, '..', 'open-pdf-studio'));
const APP = join(REPO, 'open-pdf-studio');
const TALEN = ['nl', 'en', 'fr', 'tr'];

if (!existsSync(join(APP, 'package.json'))) {
  console.error(`Open PDF Studio niet gevonden in ${APP}`);
  process.exit(1);
}

// Tabbladen in de volgorde van het lint. Contextuele tabbladen verschijnen
// alleen als er iets geselecteerd is.
const TABS = [
  { key: 'home', bestand: 'HomeTab.jsx' },
  { key: 'view', bestand: 'ViewTab.jsx' },
  { key: 'drawing', bestand: 'DrawingTab.jsx' },
  { key: 'comment', bestand: 'CommentTab.jsx' },
  { key: 'organize', bestand: 'OrganizeTab.jsx' },
  { key: 'help', bestand: 'HelpTab.jsx' },
  { key: 'format', bestand: 'FormatTab.jsx', contextueel: true },
  { key: 'arrange', bestand: 'ArrangeTab.jsx', contextueel: true },
];

const KNOP_TAGS = ['RibbonButton', 'SplitButton', 'ColorPickerButton'];

// ── vertalingen ──────────────────────────────────────────────────────────
const _ns = new Map();
function namespace(taal, ns) {
  const sleutel = `${taal}/${ns}`;
  if (!_ns.has(sleutel)) {
    const pad = join(APP, 'js', 'i18n', 'locales', taal, `${ns}.json`);
    _ns.set(sleutel, existsSync(pad) ? JSON.parse(readFileSync(pad, 'utf8')) : {});
  }
  return _ns.get(sleutel);
}

function vertaal(ns, sleutel) {
  const uit = {};
  for (const taal of TALEN) {
    let v = namespace(taal, ns);
    for (const deel of sleutel.split('.')) v = v && typeof v === 'object' ? v[deel] : undefined;
    if (typeof v === 'string' && v.trim()) uit[taal] = v.trim();
  }
  if (!uit.en && !uit.nl) return null;
  for (const taal of TALEN) if (!uit[taal]) uit[taal] = uit.en || uit.nl;
  return uit;
}

// ── JSX lezen ────────────────────────────────────────────────────────────

/** Leest de attributen van een JSX-openingstag vanaf `start` tot de echte '>'
 *  (niet die in `=>` of binnen accolades). */
function tagTekst(bron, start) {
  let diepte = 0;
  let aanhaling = null;
  for (let i = start; i < bron.length; i++) {
    const c = bron[i];
    if (aanhaling) {
      if (c === aanhaling && bron[i - 1] !== '\\') aanhaling = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { aanhaling = c; continue; }
    if (c === '{') diepte++;
    else if (c === '}') diepte--;
    else if (c === '>' && diepte === 0) return bron.slice(start, i + 1);
  }
  return bron.slice(start);
}

/** Welke t-functie hoort bij welke namespace in dit bestand. */
function tFuncties(bron) {
  const kaart = {};
  const re = /const\s*\{\s*t(?:\s*:\s*(\w+))?\s*\}\s*=\s*useTranslation\(\s*'(\w+)'\s*\)/g;
  let m;
  while ((m = re.exec(bron))) kaart[m[1] || 't'] = m[2];
  return kaart;
}

/** Eerste vertaalsleutel in een attribuutwaarde, als {ns, sleutel}. */
function sleutelUit(attrs, naam, tkaart) {
  const m = new RegExp(`(?:^|[\\s<])${naam}=\\{`).exec(attrs);
  if (!m) return null;
  // Waarde tussen de accolades, met geneste accolades meegeteld.
  let diepte = 0;
  let eind = -1;
  for (let i = m.index + m[0].length - 1; i < attrs.length; i++) {
    if (attrs[i] === '{') diepte++;
    else if (attrs[i] === '}' && --diepte === 0) { eind = i; break; }
  }
  if (eind < 0) return null;
  const waarde = attrs.slice(m.index + m[0].length, eind);
  const aanroep = waarde.match(/\b(\w+)\(\s*'([\w.]+)'/);
  if (!aanroep || !tkaart[aanroep[1]]) return null;
  return { ns: tkaart[aanroep[1]], sleutel: aanroep[2] };
}

function leesTab(tab) {
  const bron = readFileSync(join(APP, 'js', 'solid', 'components', 'ribbon', tab.bestand), 'utf8');
  const tkaart = tFuncties(bron);
  const groepen = [];
  let groep = null;
  const re = new RegExp(`<(RibbonGroup|${KNOP_TAGS.join('|')})\\b`, 'g');
  let m;
  while ((m = re.exec(bron))) {
    const attrs = tagTekst(bron, m.index);
    if (m[1] === 'RibbonGroup') {
      const s = sleutelUit(attrs, 'label', tkaart);
      groep = { label: s ? vertaal(s.ns, s.sleutel) : null, functies: [] };
      groepen.push(groep);
      continue;
    }
    if (!groep) { groep = { label: null, functies: [] }; groepen.push(groep); }
    const label = sleutelUit(attrs, 'label', tkaart) || sleutelUit(attrs, 'mainLabel', tkaart)
      || sleutelUit(attrs, 'title', tkaart) || sleutelUit(attrs, 'mainTitle', tkaart);
    const uitleg = sleutelUit(attrs, 'title', tkaart) || sleutelUit(attrs, 'mainTitle', tkaart);
    if (!label) continue;
    const l = vertaal(label.ns, label.sleutel);
    if (!l) continue;
    let u = uitleg ? vertaal(uitleg.ns, uitleg.sleutel) : null;
    // Een gebruikshint tussen haakjes ("dubbelklik om te voltooien") hoort in
    // de uitleg, niet in de naam van de functie.
    if (Object.values(l).some((v) => /\s\([^)]+\)$/.test(v))) {
      const kaal = {};
      for (const [taal, v] of Object.entries(l)) kaal[taal] = v.replace(/\s\([^)]+\)$/, '');
      if (!u || u.en === l.en) u = { ...l };
      Object.assign(l, kaal);
    }
    const id = (attrs.match(/\bid="([^"]+)"/) || [])[1] || null;
    // Dezelfde knop kan in een groep twee keer voorkomen (klein/groot bij
    // verschillende vensterbreedtes) — één keer tonen is genoeg.
    if (groep.functies.some((f) => f.label.en === l.en)) continue;
    groep.functies.push({ id, label: l, ...(u && u.en !== l.en ? { uitleg: u } : {}) });
  }
  return {
    key: tab.key,
    label: vertaal('ribbon', `tabs.${tab.key}`),
    contextueel: !!tab.contextueel,
    groepen: groepen.filter((g) => g.functies.length),
  };
}

// ── MCP-tools ────────────────────────────────────────────────────────────
function leesMcpTools() {
  const bron = readFileSync(join(APP, 'src-tauri', 'src', 'mcp_server.rs'), 'utf8');
  const tools = [];
  const re = /"name":\s*"([a-z_]+)",\s*"description":\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(bron))) {
    const beschrijving = m[2].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    // Eerste zin volstaat voor een overzicht.
    const eerste = beschrijving.split(/(?<=\.)\s/)[0];
    if (!tools.some((t) => t.naam === m[1])) tools.push({ naam: m[1], beschrijving: eerste });
  }
  // De app-tools eerst; de losse render- en testtools van de server achteraan.
  return [...tools.filter((t) => t.naam.startsWith('app_')), ...tools.filter((t) => !t.naam.startsWith('app_'))];
}

// ── schrijven ────────────────────────────────────────────────────────────
const versie = JSON.parse(readFileSync(join(APP, 'package.json'), 'utf8')).version;
const tabs = TABS.map(leesTab);
const mcp = leesMcpTools();
const aantalFuncties = tabs.reduce((n, t) => n + t.groepen.reduce((m, g) => m + g.functies.length, 0), 0);

const uit = {
  product: 'Open PDF Studio',
  versie,
  gegenereerd: new Date().toISOString().slice(0, 10),
  talen: TALEN,
  aantallen: { functies: aantalFuncties, tabbladen: tabs.length, mcpTools: mcp.length },
  tabs,
  mcp,
};
const doel = join(WEBSITE, 'data', 'open-pdf-studio-functies.json');
writeFileSync(doel, JSON.stringify(uit, null, 1) + '\n', 'utf8');
console.log(`v${versie}: ${aantalFuncties} functies op ${tabs.length} tabbladen, ${mcp.length} MCP-tools -> ${doel}`);
for (const t of tabs) {
  console.log(`  ${t.label?.nl || t.key}: ${t.groepen.map((g) => `${g.label?.nl || '—'} (${g.functies.length})`).join(', ')}`);
}
