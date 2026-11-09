#!/usr/bin/env node
/**
 * build-wiki-tekeningstandaard.js
 *
 * De tekeningstandaard staat als open data in data/tekeningstandaard/<land>.json,
 * zodat tools en BIM-modellen hem kunnen inlezen. Dit script schrijft dezelfde
 * data als leesbare, statische HTML in de wikipagina, tussen
 * <!-- standaard:start --> en <!-- standaard:end -->. Zo is er één bron: wie
 * de standaard aanpast, past de JSON aan en draait dit script.
 *
 * Inputs:  data/tekeningstandaard/nl.json
 * Outputs: wiki/tekeningstandaard/index.html (in-place)
 *
 * Draaien: `node scripts/build-wiki-tekeningstandaard.js`
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data', 'tekeningstandaard', 'nl.json');
const PAGE = path.join(ROOT, 'wiki', 'tekeningstandaard', 'index.html');
const MARKER = /<!-- standaard:start -->[\s\S]*?<!-- standaard:end -->/;

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const std = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const sources = Object.fromEntries((std.sources || []).map((s) => [s.id, s]));

// Een verwijzing naar een bron wordt een link naar de bronnenlijst onderaan.
function cite(ids) {
  const list = [].concat(ids || []).filter((id) => sources[id]);
  if (!list.length) return '';
  return list.map((id) => `<a class="ts-cite" href="#bron-${esc(id)}">${esc(sources[id].short || sources[id].title)}</a>`).join(' ');
}

function status(s) {
  const label = { norm: 'norm', gangbaar: 'gangbare praktijk', voorstel: 'voorstel OpenAEC', open: 'nog uitzoeken' }[s] || s;
  return `<span class="ts-status ts-status-${esc(s)}">${esc(label)}</span>`;
}

function section(id, title, lead, body) {
  return `
    <section class="ts-section" id="${id}">
      <h2>${esc(title)}</h2>
      ${lead ? `<p class="ts-lead">${lead}</p>` : ''}
      ${body}
    </section>`;
}

function table(head, rows, cls = '') {
  return `<div class="table-scroll"><table class="ts-table ${cls}"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

// ── Arcering als SVG-staal, getekend uit de patroondefinitie ───────────────
// Elk patroontype uit de dataset heeft hier een tekenregel. De staaltjes zijn
// een weergave van de definitie, geen schaalgetrouwe plot.
const INK = '#2A2A32';
// Vaste, "willekeurig" ogende posities, zodat elke build hetzelfde tekent.
const SPECKS = [[6, 7], [15, 22], [24, 9], [31, 27], [40, 14], [47, 5], [53, 24], [61, 11], [66, 28], [10, 30], [36, 4], [57, 17], [20, 15], [45, 29], [3, 18], [27, 20], [63, 3], [50, 12]];
const PEBBLES = [[8, 9], [20, 7], [33, 11], [46, 8], [59, 10], [13, 21], [27, 24], [40, 20], [53, 25], [64, 21], [6, 30], [34, 30], [58, 31]];

function swatch(p, label, uid) {
  const W = 72, H = 36;
  const id = `pat-${uid}`;
  const lw = p.lineWidth || 0.8;
  const sp = p.spacing || 6;
  const box = (fill) => `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="${fill}" stroke="${INK}"/>`;
  let defs = '', body = '';
  const bg = p.background ? `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="${p.background}"/>` : '';
  switch (p.type) {
    case 'solid': body = box(p.fill || INK); break;
    case 'none': body = box('#FFFFFF'); break;
    case 'lines':
    case 'crosshatch': {
      // Eén lijn per patroontegel, gedraaid naar de hoek; kruisarcering krijgt
      // er een tweede lijn haaks op.
      const dash = p.dash ? ` stroke-dasharray="${p.dash.join(' ')}"` : '';
      defs = `<pattern id="${id}" width="${sp}" height="${sp}" patternUnits="userSpaceOnUse" patternTransform="rotate(${90 - (p.angle ?? 45)})"><line x1="0" y1="0" x2="0" y2="${sp}" stroke="${INK}" stroke-width="${lw}"${dash}/>${p.type === 'crosshatch' ? `<line x1="0" y1="0" x2="${sp}" y2="0" stroke="${INK}" stroke-width="${lw}"${dash}/>` : ''}</pattern>`;
      if (p.inset) body = `${box('#FFFFFF')}<rect x="6" y="11" width="${W - 12}" height="${H - 22}" fill="url(#${id})" stroke="${INK}" stroke-width="0.8"/>`;
      else body = `${box('#FFFFFF')}${bg}<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="url(#${id})" stroke="${INK}"/>`;
      break;
    }
    case 'dots':
      defs = `<pattern id="${id}" width="${sp}" height="${sp}" patternUnits="userSpaceOnUse"><circle cx="${sp / 2}" cy="${sp / 2}" r="0.9" fill="${INK}"/></pattern>`;
      body = `${box('#FFFFFF')}<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="url(#${id})" stroke="${INK}"/>`;
      break;
    case 'band': // baksteen in detail: omtrek met een dikke lijn boven en onder
      body = `${box('#FFFFFF')}<line x1="1" y1="3" x2="${W - 1}" y2="3" stroke="${INK}" stroke-width="2.4"/><line x1="1" y1="${H - 3}" x2="${W - 1}" y2="${H - 3}" stroke="${INK}" stroke-width="2.4"/>`;
      break;
    case 'blocks': { // lichte scheidingswand: blokken met horizontale of verticale lijnen
      const seg = W / 4;
      let fill = '';
      for (let i = 0; i < 4; i += 2) {
        const x0 = 0.5 + i * seg;
        if (p.fill === 'lines-v') for (let x = x0 + 2; x < x0 + seg; x += 3) fill += `<line x1="${x}" y1="${H * 0.3}" x2="${x}" y2="${H * 0.7}" stroke="${INK}" stroke-width="0.8"/>`;
        else fill += `<rect x="${x0}" y="${H * 0.3}" width="${seg}" height="${H * 0.4}" fill="${INK}"/>`;
      }
      body = `${box('#FFFFFF')}<rect x="0.5" y="${H * 0.3}" width="${W - 1}" height="${H * 0.4}" fill="none" stroke="${INK}" stroke-width="0.8"/>${fill}`;
      break;
    }
    case 'finish': { // afwerking: één doorlopende zigzag, bij samengesteld met een scheidingslijn
      const y = p.layered ? H * 0.38 : 4;
      body = `${box('#FFFFFF')}${p.layered ? `<line x1="1" y1="${y}" x2="${W - 1}" y2="${y}" stroke="${INK}" stroke-width="0.8"/>` : ''}<path d="M1 ${H - 2} L${W * 0.55} ${y} L${W - 1} ${H - 2}" fill="none" stroke="${INK}" stroke-width="0.8"/>`;
      break;
    }
    case 'plies': { // triplex: lagen met afwisselend gearceerde fineren
      let layers = '';
      const n = 4, h = (H - 1) / n;
      defs = `<pattern id="${id}" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="3" stroke="${INK}" stroke-width="0.7"/></pattern>`;
      for (let i = 0; i < n; i++) layers += `<rect x="0.5" y="${0.5 + i * h}" width="${W - 1}" height="${h}" fill="${i % 2 ? '#FFFFFF' : `url(#${id})`}" stroke="${INK}" stroke-width="0.8"/>`;
      body = `${box('#FFFFFF')}${layers}`;
      break;
    }
    case 'dotline': { // lijmnaad: lijn met bolletjes
      let d = '';
      for (let x = 10; x < W; x += 13) d += `<circle cx="${x}" cy="${H / 2}" r="1.8" fill="${INK}"/>`;
      return svgWrap(W, H, label, '', `<line x1="2" y1="${H / 2}" x2="${W - 2}" y2="${H / 2}" stroke="${INK}" stroke-width="1"/>${d}`);
    }
    case 'insulation': { // zigzag met hoeken van 60°: gelijkzijdige driehoeken over de laagdikte
      const h = H - 4, step = (2 * h) / Math.sqrt(3);
      let d = `M0 ${H - 2}`;
      for (let x = 0; x < W; x += step) d += ` L${x + step / 2} 2 L${x + step} ${H - 2}`;
      body = `${box('#FFFFFF')}<clipPath id="${id}"><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}"/></clipPath><path d="${d}" fill="none" stroke="${INK}" stroke-width="${lw}" clip-path="url(#${id})"/>`;
      break;
    }
    case 'strip': // lood (gestreept), zink (dik), bitumen en folie (dubbel)
      if (p.double) return svgWrap(W, H, label, '', `<line x1="2" y1="${H / 2 - 2}" x2="${W - 2}" y2="${H / 2 - 2}" stroke="${INK}" stroke-width="1.4"/><line x1="2" y1="${H / 2 + 2}" x2="${W - 2}" y2="${H / 2 + 2}" stroke="${INK}" stroke-width="1.4"/>`);
      return svgWrap(W, H, label, '', `<rect x="2" y="${H / 2 - 3}" width="${W - 4}" height="6" fill="${p.dashed ? '#FFFFFF' : INK}" stroke="${INK}"/>${p.dashed ? `<line x1="2" y1="${H / 2}" x2="${W - 2}" y2="${H / 2}" stroke="${INK}" stroke-width="6" stroke-dasharray="8 6"/>` : ''}`);
    case 'specks':
      body = `${box('#FFFFFF')}${SPECKS.map(([x, y]) => `<circle cx="${x + 1}" cy="${y + 2}" r="0.9" fill="${INK}"/>`).join('')}`;
      break;
    case 'pebbles':
      body = `${box('#FFFFFF')}${PEBBLES.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="2" fill="none" stroke="${INK}" stroke-width="0.7"/>`).join('')}`;
      break;
    case 'waves': {
      let w = '';
      for (const y of [10, 18, 26]) w += `<path d="M2 ${y} q 8.5 -4 17 0 t 17 0 t 17 0 t 17 0" fill="none" stroke="${INK}" stroke-width="0.8"/>`;
      return svgWrap(W, H, label, '', w);
    }
    case 'ground': { // maaiveld: een band visgraatarcering direct onder de maaiveldlijn
      const y0 = 6, band = 14;
      let g = `<line x1="1" y1="${y0}" x2="${W - 1}" y2="${y0}" stroke="${INK}" stroke-width="1.2"/>`;
      for (let x = -band; x < W; x += 3.5) {
        const left = Math.floor((x + band) / 18) % 2 === 0;
        g += left
          ? `<line x1="${x}" y1="${y0}" x2="${x + band}" y2="${y0 + band}" stroke="${INK}" stroke-width="0.7"/>`
          : `<line x1="${x + band}" y1="${y0}" x2="${x}" y2="${y0 + band}" stroke="${INK}" stroke-width="0.7"/>`;
      }
      return svgWrap(W, H, label, `<clipPath id="${id}"><rect x="0" y="0" width="${W}" height="${y0 + band}"/></clipPath>`, `<g clip-path="url(#${id})">${g}</g>`);
    }
    default: body = box('#FFFFFF');
  }
  return svgWrap(W, H, label, defs, body);
}

function svgWrap(W, H, label, defs, body) {
  return `<svg class="ts-swatch" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(label)}">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;
}

// "1:100", "1:50" → "1:100 en 1:50"; een aaneengesloten reeks → "1:50 tot 1:1"
function scaleRange(list, all) {
  if (!list || !list.length) return '';
  if (list.length === all.length) return 'alle schalen';
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} en ${list[1]}`;
  return `${list[0]} tot ${list[list.length - 1]}`;
}

// ── Secties ────────────────────────────────────────────────────────────────
const parts = [];

// Opbouw: land → discipline → fase → tekening → regels
parts.push(section('opbouw', 'Hoe de standaard is opgebouwd', esc(std.structure.lead), `
  <ol class="ts-steps">
    ${std.structure.levels.map((l) => `<li><strong>${esc(l.name)}</strong><span>${esc(l.text)}</span></li>`).join('')}
  </ol>
  ${std.drawingCategories ? `
  <h3>Soorten tekeningen</h3>
  <p>${esc(std.drawingCategories.lead)} ${cite(std.drawingCategories.sources)}</p>
  ${table(['', 'soort', 'wat erop staat'], std.drawingCategories.items.map((c) => [`<code>${esc(c.code)}</code>`, `<strong>${esc(c.name)}</strong>`, esc(c.text)]))}` : ''}
  <p class="ts-note">Elke regel heeft een status: ${status('norm')} uit een gepubliceerde norm, ${status('gangbaar')} zonder norm maar breed gebruikt, ${status('voorstel')} onze eigen afspraak, en ${status('open')} voor wat nog moet worden uitgezocht.</p>`));

// Fasen
parts.push(section('fasen', 'Fasen', esc(std.phasesLead), table(
  ['code', 'fase', 'wat de tekening moet laten zien', 'gangbare schalen', 'status'],
  std.phases.map((f) => [
    `<code>${esc(f.code)}</code>`,
    `<strong>${esc(f.name)}</strong>`,
    esc(f.purpose),
    esc((f.scales || []).join(', ')),
    `${status(f.status)} ${cite(f.sources)}`,
  ]),
)));

// Disciplines: per discipline een matrix tekening × fase
const phaseCodes = std.phases.filter((f) => f.drawings !== false).map((f) => f.code);
parts.push(section('disciplines', 'Disciplines en tekeningen per fase', esc(std.disciplinesLead),
  std.disciplines.map((d) => `
    <div class="ts-discipline" id="discipline-${esc(d.id)}">
      <h3>${esc(d.name)}${d.code ? ` <code>${esc(d.code)}</code>` : ''}</h3>
      <p>${esc(d.description)}</p>
      ${table(
        ['tekening', ...phaseCodes.map((c) => `<code>${esc(c)}</code>`)],
        (d.drawings || []).map((t) => [
          `<strong>${esc(t.name)}</strong>${t.note ? `<span class="ts-sub">${esc(t.note)}</span>` : ''}`,
          ...phaseCodes.map((c) => (t.phases && t.phases[c] ? `<span class="ts-scale">${esc(t.phases[c])}</span>` : '<span class="ts-none">–</span>')),
        ]),
        'ts-matrix',
      )}
      ${(d.rules || []).length ? `<ul class="ts-rules">${d.rules.map((r) => `<li>${esc(r.text)} ${status(r.status)} ${cite(r.sources)}</li>`).join('')}</ul>` : ''}
      ${cards(d)}
    </div>`).join('')));

// Per tekening: wat erop moet staan, per fase uitklapbaar
function cards(d) {
  if (!(d.cards || []).length) return '';
  const byPhase = {};
  for (const c of d.cards) (byPhase[c.phase] = byPhase[c.phase] || []).push(c);
  const list = (title, items) => (items && items.length ? `<div><strong>${esc(title)}</strong><ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>` : '');
  return Object.entries(byPhase).map(([phase, cs]) => {
    const ph = std.phases.find((p) => p.code === phase);
    return `
      <h4 class="ts-cards-title">Wat er op elke tekening staat in het ${esc(ph ? ph.name.toLowerCase() : phase)} <code>${esc(phase)}</code></h4>
      <div class="ts-cards">${cs.map((c) => `
        <details class="ts-card">
          <summary><strong>${esc(c.name)}</strong><span class="ts-scale">${esc(c.scale)}</span></summary>
          <div class="ts-card-body">${list('Algemeen', c.general)}${list('Maatvoering', c.dimensions)}${list('Specifiek', c.specific)}</div>
          <p class="ts-src">${status('gangbaar')} ${cite(c.sources)}</p>
        </details>`).join('')}
      </div>`;
  }).join('');
}

// Algemene regels
const g = std.general;
parts.push(section('algemeen', 'Algemene regels voor elke tekening', esc(g.lead), `
  <h3>Papierformaten</h3>
  ${table(['formaat', 'maat (mm)', 'gebruik'], g.paper.map((p) => [`<code>${esc(p.size)}</code>`, esc(p.mm), esc(p.use)]))}
  <p class="ts-src">${status(g.paperStatus)} ${cite(g.paperSources)}</p>

  <h3>Schalen</h3>
  <p>${g.scales.map((s) => `<span class="ts-chip">${esc(s)}</span>`).join(' ')}</p>
  <p class="ts-src">${status(g.scalesStatus)} ${cite(g.scalesSources)}</p>

  <h3>Lijndiktes</h3>
  <div class="ts-lines">${g.lineWidths.map((w) => `<div class="ts-line"><span style="height:${Math.max(w.mm * 3, 0.6)}px"></span><code>${esc(w.mm)} mm</code><em>${esc(w.use)}</em></div>`).join('')}</div>
  <p class="ts-src">${status(g.lineWidthsStatus)} ${cite(g.lineWidthsSources)}</p>

  <h3>Lijnsoorten</h3>
  ${table(['lijn', 'gebruik'], g.lineTypes.map((l) => [`<strong>${esc(l.name)}</strong>`, esc(l.use)]))}
  <p class="ts-src">${status(g.lineTypesStatus)} ${cite(g.lineTypesSources)}</p>

  <h3>Tekst</h3>
  ${table(['teksthoogte op papier', 'gebruik'], g.textHeights.map((t) => [`<code>${esc(t.mm)} mm</code>`, esc(t.use)]))}
  <p class="ts-src">${status(g.textStatus)} ${cite(g.textSources)}</p>

  <h3>Titelblok</h3>
  <p>${esc(g.titleBlock.text)}</p>
  <ul class="ts-fields">${g.titleBlock.fields.map((f) => `<li><strong>${esc(f.name)}</strong>${f.required ? ' <span class="ts-req">verplicht</span>' : ''}</li>`).join('')}</ul>
  <p class="ts-src">${status(g.titleBlock.status)} ${cite(g.titleBlock.sources)}</p>

  <h3>Overige afspraken</h3>
  <ul class="ts-rules">${g.other.map((r) => `<li><strong>${esc(r.topic)}.</strong> ${esc(r.text)} ${status(r.status)} ${cite(r.sources)}</li>`).join('')}</ul>`));

// Arceringen
// Arceringen volgens NEN 47: per materiaal de varianten met hun schalen
let swatchId = 0;
parts.push(section('arceringen', 'Arceringen', `${esc(std.hatchesLead)} ${cite(std.hatchesSources)}`,
  std.nen47.map((g) => `
  <h3>${esc(g.name)}</h3>
  ${table(['nr.', 'materiaal', 'arcering per schaal', 'B', 'opmerking'], g.items.map((m) => [
    `<code>${esc(m.nr)}</code>`,
    `<strong>${esc(m.name)}</strong>`,
    `<div class="ts-variants">${m.variants.map((v) => `<figure class="ts-variant">${swatch(v.pattern, `${m.name}, ${scaleRange(v.scales, std.hatchScales)}`, `${m.nr}-${++swatchId}`)}<figcaption>${esc(scaleRange(v.scales, std.hatchScales))}</figcaption></figure>`).join('')}</div>`,
    m.describe || m.variants.some((v) => v.describe) ? '<span class="ts-b" title="materiaal ook in woorden beschrijven">B</span>' : '',
    esc(m.note || ''),
  ]), 'ts-hatch-table')}`).join('') + `
  <p class="ts-note">${status('norm')} De arceringen zijn nagetekend uit een openbare weergave van de NEN 47-tabel. Lijnafstanden en diktes zijn een benadering; controleer ze tegen de norm zelf voordat een tool ze als definitief gebruikt.</p>`));

// Lagen en classificatie
parts.push(section('classificatie', 'Lagen en classificatie', esc(std.classification.lead), table(
  ['afspraak', 'waarvoor', 'beheer', 'status'],
  std.classification.items.map((c) => [
    `<strong>${esc(c.name)}</strong>`,
    esc(c.scope),
    esc(c.owner),
    `${status(c.status)} ${cite(c.sources)}`,
  ]),
)));

// Naar BIM
parts.push(section('bim', 'Van tekening naar BIM', esc(std.bim.lead), table(
  ['tekeningafspraak', 'in het model', 'in IFC'],
  std.bim.mapping.map((m) => [esc(m.drawing), esc(m.model), `<code>${esc(m.ifc)}</code>`]),
)));

// Andere landen
parts.push(section('landen', 'Andere landen', esc(std.countries.lead), table(
  ['land', 'vertrekpunt', 'status'],
  std.countries.items.map((c) => [`<strong>${esc(c.country)}</strong>`, `${esc(c.standard)} ${cite(c.sources)}`, status(c.status)]),
)));

// Bronnen
parts.push(section('bronnen', 'Bronnen', '', `
  <ol class="ts-sources">${std.sources.map((s) => `<li id="bron-${esc(s.id)}"><strong>${esc(s.title)}</strong>${s.note ? ` — ${esc(s.note)}` : ''}${s.url ? ` <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url.replace(/^https?:\/\//, ''))}</a>` : ''}</li>`).join('')}</ol>
  <p class="ts-note">Bijgewerkt op ${esc(std.updated)} · versie ${esc(std.version)} · <a href="/data/tekeningstandaard/nl.json">download de dataset (JSON)</a></p>`));

const html = fs.readFileSync(PAGE, 'utf8');
if (!MARKER.test(html)) throw new Error('markers <!-- standaard:start --> / <!-- standaard:end --> ontbreken in de wikipagina');
const out = html.replace(MARKER, `<!-- standaard:start -->${parts.join('\n')}\n    <!-- standaard:end -->`);
fs.writeFileSync(PAGE, out);
console.log(`  wiki/tekeningstandaard: ${std.phases.length} fasen, ${std.disciplines.length} disciplines, ${std.nen47.reduce((n, g) => n + g.items.length, 0)} materialen in NEN 47, ${std.sources.length} bronnen`);
