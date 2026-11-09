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
function swatch(p) {
  const W = 88, H = 56;
  const id = `pat-${p.id}`;
  let defs = '', fill = 'none';
  const lw = p.lineWidth || 0.6;
  const sp = p.spacing || 6;
  if (p.type === 'solid') {
    fill = p.fill || '#2A2A32';
  } else if (p.type === 'lines' || p.type === 'crosshatch') {
    // Eén lijn per patroontegel, gedraaid naar de hoek; kruisarcering krijgt
    // er een tweede lijn haaks op.
    defs = `<pattern id="${id}" width="${sp}" height="${sp}" patternUnits="userSpaceOnUse" patternTransform="rotate(${p.angle || 45})"><line x1="0" y1="0" x2="0" y2="${sp}" stroke="#2A2A32" stroke-width="${lw}"/>${p.type === 'crosshatch' ? `<line x1="0" y1="0" x2="${sp}" y2="0" stroke="#2A2A32" stroke-width="${lw}"/>` : ''}</pattern>`;
    fill = `url(#${id})`;
  } else if (p.type === 'dots') {
    defs = `<pattern id="${id}" width="${sp}" height="${sp}" patternUnits="userSpaceOnUse"><circle cx="${sp / 2}" cy="${sp / 2}" r="${lw}" fill="#2A2A32"/></pattern>`;
    fill = `url(#${id})`;
  } else if (p.type === 'insulation') {
    // Isolatie: de bekende zigzag- of golflijn over de laagdikte.
    const n = 6, step = W / n;
    let d = `M0 ${H - 6}`;
    for (let i = 0; i < n; i++) d += ` L${step * i + step / 2} 6 L${step * (i + 1)} ${H - 6}`;
    return `<svg class="ts-swatch" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(p.name)}"><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="#FFFFFF" stroke="#2A2A32"/><path d="${d}" fill="none" stroke="#2A2A32" stroke-width="${lw}"/></svg>`;
  } else if (p.type === 'none') {
    fill = '#FFFFFF';
  }
  return `<svg class="ts-swatch" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(p.name)}"><defs>${defs}</defs><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="#FFFFFF"/><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="${fill}" stroke="#2A2A32"/></svg>`;
}

// ── Secties ────────────────────────────────────────────────────────────────
const parts = [];

// Opbouw: land → discipline → fase → tekening → regels
parts.push(section('opbouw', 'Hoe de standaard is opgebouwd', esc(std.structure.lead), `
  <ol class="ts-steps">
    ${std.structure.levels.map((l) => `<li><strong>${esc(l.name)}</strong><span>${esc(l.text)}</span></li>`).join('')}
  </ol>
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
    </div>`).join('')));

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
parts.push(section('arceringen', 'Arceringen', `${esc(std.hatchesLead)} ${cite(std.hatchesSources)}`, `
  <div class="ts-hatches">${std.hatches.map((h) => `
    <figure class="ts-hatch">
      ${swatch(h.pattern ? { ...h.pattern, id: h.id, name: h.name } : { type: 'none', id: h.id, name: h.name })}
      <figcaption><strong>${esc(h.name)}</strong><span>${esc(h.description)}</span>${status(h.status)}</figcaption>
    </figure>`).join('')}</div>`));

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
console.log(`  wiki/tekeningstandaard: ${std.phases.length} fasen, ${std.disciplines.length} disciplines, ${std.hatches.length} arceringen, ${std.sources.length} bronnen`);
