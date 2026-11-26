#!/usr/bin/env node
/**
 * Writes data/aec-landscape.json: other open-source BIM and CAD products in the AEC sector,
 * mostly new ones (first commit in 2025 or later), plus a few established ones for comparison,
 * with their GitHub stars, number of contributors, first commit and last push.
 * The list of projects and who is behind each one is kept by hand below; the numbers come
 * from the GitHub API. Read by /aec-open-source/.
 *
 * Usage: GITHUB_TOKEN=... node scripts/generate-aec-landscape.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const PROJECTS = [
  // BIM, new
  { cat: 'BIM', name: 'Pascal Editor', repo: 'pascalorg/editor', org: 'Pascal', country: 'United States', url: 'https://editor.pascal.app', what: { nl: '3D-architectuursoftware in de browser, met scan-to-BIM.', en: '3D architecture software in the browser, with scan-to-BIM.' } },
  { cat: 'BIM', name: 'BimCraft', repo: 'getcadcraft/bimcraft', org: 'CadCraft', country: 'United States', url: 'https://getcadcraft.com/apps/bimcraft', what: { nl: 'BIM-modeller: wanden, deuren en ramen op bouwlagen en stramienen, met aanzichten en lijsten.', en: 'BIM authoring: walls, doors and windows on levels and grids, with views and schedules.' } },
  { cat: 'BIM', name: 'Lapin', repo: 'Ciuntuc-BIM-Studio/lapin', org: 'Ciuntuc BIM Studio', country: '', url: 'https://github.com/Ciuntuc-BIM-Studio/lapin', what: { nl: 'Klassieke BIM-modeller, direct gebouwd op IFC.', en: 'Classic BIM modeller built natively on IFC.' } },
  { cat: 'BIM', name: 'CreaBIM', repo: 'chopinregis/CreaBIM', org: 'Regis Nde Tene (OpeningDesign)', country: '', url: 'https://chopinregis.github.io/CreaBIM/', what: { nl: 'BIM voor architecten, modelleren zoals in Blender.', en: 'BIM for architects, modelled like Blender.' } },
  { cat: 'BIM', name: 'MutinyBIM', repo: 'permitzip/mutinybim', org: 'PermitZIP', country: 'United States', url: 'https://mutinybim.com', what: { nl: 'Gebouwmodel met één gedeelde kern en add-ons per discipline.', en: 'Building model engine with one shared kernel and trade add-ons.' } },
  { cat: 'BIM', name: 'Massing', repo: 'ibuilder/massing', org: 'Matthew M. Emma', country: 'United States', url: 'https://massing.build', what: { nl: 'Zelf te hosten IFC-platform: BIM-viewer en modelleren in de browser.', en: 'Self-hosted IFC platform: BIM viewer and modelling in the browser.' } },
  { cat: 'BIM', name: 'IFC-Lite', repo: 'LTplus-AG/ifc-lite', org: 'LTplus AG', country: 'Switzerland', url: 'https://ifclite.dev', what: { nl: 'Gebouwmodellen bekijken, bevragen, bewerken en controleren in de browser.', en: 'View, query, edit and validate building models in the browser.' } },
  { cat: 'BIM', name: 'IFC Flow', repo: 'louistrue/ifc-flow', org: 'Louis Trümpler (LTplus AG)', country: 'Switzerland', url: 'https://ifcflow.com', what: { nl: 'Visueel, met nodes werken met IFC-bestanden.', en: 'Node-based visual tool for working with IFC files.' } },
  { cat: 'BIM', name: 'Hestia', repo: 'engdennylsonsantos-cloud/Hestia', org: 'Dennylson Santos', country: 'Brazil', url: 'https://www.hestiabim.com', what: { nl: 'BIM in de browser voor woningbouw.', en: 'Browser-based BIM for residential architecture.' } },
  { cat: 'BIM', name: 'OpenConstructionDesign', repo: 'datadrivenconstruction/OpenConstructionDesign', org: 'DataDrivenConstruction', country: 'Germany', url: 'https://openconstructiondesign.com', what: { nl: 'CAD-BIM-editor in Rust die je door AI kunt laten bedienen.', en: 'CAD-BIM editor in Rust that AI can drive.' } },
  // CAD, new
  { cat: 'CAD', name: 'SolidCraft', repo: 'tangency-labs/solidcraft', org: 'Tangency Labs', country: '', url: 'https://solidcraft.io', what: { nl: 'Parametrische 3D-CAD, volledig in Rust.', en: 'Parametric 3D CAD, built in pure Rust.' } },
  { cat: 'CAD', name: 'CadCraft', repo: 'getcadcraft/cadcraft', org: 'CadCraft', country: 'United States', url: 'https://getcadcraft.com', what: { nl: '2D-tekenen en 3D-modelleren met opdrachtregel, lagen, blokken en maten.', en: '2D drafting and 3D modelling with a command line, layers, blocks and dimensions.' } },
  { cat: 'CAD', name: 'Ingetrazo', repo: 'ingelibre/ingetrazo', org: 'Ingelibre', country: '', url: 'https://ingetrazo.com', what: { nl: 'Vrije 3D-modeller voor architectuur en techniek.', en: 'Free 3D modeller for architecture and engineering.' } },
  { cat: 'CAD', name: 'CAD Viewer', repo: 'mlightcad/cad-viewer', org: 'mlightcad', country: '', url: 'https://mlightcad.com/cad-viewer/', what: { nl: 'DWG/DXF bekijken en bewerken in de browser.', en: 'DWG/DXF viewer and editor in the browser.' } },
  { cat: 'CAD', name: 'QymCAD', repo: 'QymIs-Tech/QymCAD', org: 'QymIs.Tech', country: 'Kazakhstan', url: 'https://cad.qymis.tech', what: { nl: 'Parametrische 3D-CAD op de OpenCASCADE-kern.', en: 'Parametric 3D CAD on the OpenCASCADE kernel.' } },
  { cat: 'CAD', name: 'FluidCAD', repo: 'Fluid-CAD/FluidCAD', org: 'FluidCAD', country: '', url: 'https://fluidcad.io', what: { nl: 'Parametrische CAD, met de muis en met code.', en: 'Parametric CAD, by mouse and by code.' } },
  { cat: 'CAD', name: 'PaliCAD', repo: 'braydennilsen/PaliCAD', org: 'Brayden Nilsen', country: '', url: 'https://palicad.com', what: { nl: 'Lichte 3D-CAD met direct modelleren en een eigen kern.', en: 'Lightweight direct-modelling 3D CAD with its own kernel.' } },
  { cat: 'CAD', name: 'cadrs', repo: 'rvdende/cadrs', org: 'Rouan van der Ende (Netron)', country: 'South Africa', url: 'https://cadrs.net', what: { nl: 'Parametrische, feature-gebaseerde CAD in Rust.', en: 'Parametric, feature-based CAD in Rust.' } },
  { cat: 'CAD', name: 'NassCAD', repo: 'Nx-Nass/NassCAD', org: 'Nasser (independent)', country: '', url: 'https://www.nasscad.com', what: { nl: '3D-CAD voor browser en Windows, met STEP en IFC.', en: '3D CAD for browser and Windows, with STEP and IFC.' } },
  // Established, for comparison
  { cat: 'BIM', name: 'Bonsai (IfcOpenShell)', repo: 'IfcOpenShell/IfcOpenShell', org: 'Community (OSArch)', country: 'International', url: 'https://bonsaibim.org', what: { nl: 'BIM-modeller in Blender, op IfcOpenShell.', en: 'BIM modeller in Blender, on IfcOpenShell.' } },
  { cat: 'BIM', name: 'Speckle', repo: 'specklesystems/speckle-server', org: 'Speckle Systems', country: 'United Kingdom', url: 'https://speckle.systems', what: { nl: 'Data-uitwisseling en samenwerken tussen ontwerpprogramma’s.', en: 'Data exchange and collaboration between design programs.' } },
  { cat: 'CAD', name: 'FreeCAD', repo: 'FreeCAD/FreeCAD', org: 'FreeCAD Project Association', country: 'International', url: 'https://www.freecad.org', what: { nl: 'Parametrische 3D-CAD, met een BIM-werkbank.', en: 'Parametric 3D CAD, with a BIM workbench.' } },
  { cat: 'CAD', name: 'LibreCAD', repo: 'LibreCAD/LibreCAD', org: 'Community', country: 'International', url: 'https://librecad.org', what: { nl: '2D-CAD met DXF.', en: '2D CAD with DXF.' } },
  { cat: 'CAD', name: 'QCAD', repo: 'qcad/qcad', org: 'RibbonSoft GmbH', country: 'Switzerland', url: 'https://qcad.org', what: { nl: '2D-CAD voor tekeningen en plattegronden.', en: '2D CAD for drawings and floor plans.' } },
  { cat: 'CAD', name: 'Chili3D', repo: 'xiangechen/chili3d', org: 'Independent developer', country: 'China', url: 'https://chili3d.com', what: { nl: '3D-CAD in de browser (WebAssembly).', en: '3D CAD in the browser (WebAssembly).' } },
];

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const HEADERS = { 'User-Agent': 'openaec-website', Accept: 'application/vnd.github+json', ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}) };

async function get(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(url, { headers: HEADERS });
    if (r.status === 202) { await new Promise(res => setTimeout(res, 2000)); continue; }
    if (!r.ok) throw new Error(`${url}: ${r.status}`);
    return r;
  }
  throw new Error(`${url}: still computing`);
}

/** Number of pages of a list with per_page=1 = number of items. */
function lastPage(r) {
  const link = r.headers.get('link') || '';
  const m = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
  return m ? Number(m[1]) : null;
}

async function project(p) {
  const api = `https://api.github.com/repos/${p.repo}`;
  const repo = await (await get(api)).json();
  const c = await get(`${api}/contributors?per_page=1&anon=true`);
  const contributors = lastPage(c) ?? (await c.json()).length;
  const first = await get(`${api}/commits?per_page=1`);
  const pages = lastPage(first);
  let firstCommit = null;
  if (pages) {
    const oldest = await (await get(`${api}/commits?per_page=1&page=${pages}`)).json();
    firstCommit = oldest[0]?.commit?.author?.date?.slice(0, 10) || null;
  } else {
    firstCommit = (await first.json())[0]?.commit?.author?.date?.slice(0, 10) || null;
  }
  // Some histories carry a bogus early date (an imported commit at 1970); fall back to the repo.
  const created = repo.created_at.slice(0, 10);
  if (!firstCommit || firstCommit < '1975-01-01') firstCommit = created;
  return {
    ...p,
    repo: repo.full_name,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    contributors,
    started: firstCommit,
    onGithubSince: created,
    lastPush: repo.pushed_at.slice(0, 10),
    license: repo.license?.spdx_id && repo.license.spdx_id !== 'NOASSERTION' ? repo.license.spdx_id : null,
    language: repo.language,
    isNew: firstCommit >= '2025-01-01',
  };
}

(async () => {
  const out = [];
  for (const p of PROJECTS) {
    try { out.push(await project(p)); process.stdout.write(`  ${p.repo}\n`); }
    catch (e) { console.error(`  ${p.repo}: ${e.message}`); process.exitCode = 1; }
  }
  if (process.exitCode) { console.error('Niet alle projecten opgehaald; bestand niet geschreven.'); return; }
  out.sort((a, b) => b.stars - a.stars);
  const file = path.join(__dirname, '..', 'data', 'aec-landscape.json');
  fs.writeFileSync(file, JSON.stringify({ generated: new Date().toISOString(), projects: out }, null, 2) + '\n');
  console.log(`data/aec-landscape.json: ${out.length} projecten`);
})();
