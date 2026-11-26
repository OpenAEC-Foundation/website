#!/usr/bin/env node
/**
 * Writes data/aec-landscape.json: other open-source BIM and CAD projects in the AEC sector,
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
  // BIM
  { cat: 'BIM', name: 'IfcOpenShell & Bonsai', repo: 'IfcOpenShell/IfcOpenShell', org: 'Community (OSArch)', country: 'International', url: 'https://ifcopenshell.org', what: { nl: 'IFC-bibliotheek en de BIM-modeller Bonsai in Blender.', en: 'IFC toolkit, plus the Bonsai BIM modeller in Blender.' } },
  { cat: 'BIM', name: 'That Open Engine (web-ifc)', repo: 'ThatOpen/engine_web-ifc', org: 'That Open Company', country: 'Spain', url: 'https://thatopen.com', what: { nl: 'IFC lezen en schrijven in de browser (WebAssembly).', en: 'Reads and writes IFC in the browser (WebAssembly).' } },
  { cat: 'BIM', name: 'That Open Components', repo: 'ThatOpen/engine_components', org: 'That Open Company', country: 'Spain', url: 'https://thatopen.com', what: { nl: 'Bouwstenen voor BIM-apps in de browser.', en: 'Building blocks for BIM apps in the browser.' } },
  { cat: 'BIM', name: 'xeokit SDK', repo: 'xeokit/xeokit-sdk', org: 'Creoox AG', country: 'Switzerland', url: 'https://xeokit.io', what: { nl: 'Web-viewer voor grote BIM-modellen.', en: 'Web viewer for large BIM models.' } },
  { cat: 'BIM', name: 'BIMserver', repo: 'opensourceBIM/BIMserver', org: 'opensourceBIM (TNO, TU Eindhoven)', country: 'Netherlands', url: 'https://github.com/opensourceBIM', what: { nl: 'Modelserver voor IFC met versies en queries.', en: 'IFC model server with versions and queries.' } },
  { cat: 'BIM', name: 'Speckle', repo: 'specklesystems/speckle-server', org: 'Speckle Systems', country: 'United Kingdom', url: 'https://speckle.systems', what: { nl: 'Data-uitwisseling en samenwerken tussen ontwerpprogramma’s.', en: 'Data exchange and collaboration between design programs.' } },
  { cat: 'BIM', name: 'Hypar Elements', repo: 'hypar-io/Elements', org: 'Hypar', country: 'United States', url: 'https://hypar.io', what: { nl: 'Bibliotheek om gebouwelementen met code te genereren.', en: 'Library for generating building elements in code.' } },
  { cat: 'BIM', name: 'xBIM Toolkit', repo: 'xBimTeam/XbimEssentials', org: 'xBIM team (Northumbria University)', country: 'United Kingdom', url: 'https://docs.xbim.net', what: { nl: '.NET-toolkit voor IFC en COBie.', en: '.NET toolkit for IFC and COBie.' } },
  { cat: 'BIM', name: 'Dynamo', repo: 'DynamoDS/Dynamo', org: 'Autodesk', country: 'United States', url: 'https://dynamobim.org', what: { nl: 'Visueel programmeren voor BIM-ontwerp.', en: 'Visual programming for BIM design.' } },
  { cat: 'BIM', name: 'pyRevit', repo: 'pyrevitlabs/pyRevit', org: 'pyRevitLabs (community)', country: 'International', url: 'https://pyrevitlabs.io', what: { nl: 'Scripts en gereedschappen in een BIM-programma.', en: 'Scripting and tools inside a BIM program.' } },
  { cat: 'BIM', name: 'Ladybug Tools', repo: 'ladybug-tools/ladybug', org: 'Ladybug Tools LLC', country: 'United States', url: 'https://www.ladybug.tools', what: { nl: 'Klimaat-, licht- en energieanalyse voor ontwerpers.', en: 'Climate, daylight and energy analysis for designers.' } },
  { cat: 'BIM', name: 'OpenStudio', repo: 'NatLabRockies/OpenStudio', org: 'U.S. national laboratory (formerly NREL)', country: 'United States', url: 'https://openstudio.net', what: { nl: 'Energiemodellen van gebouwen, op EnergyPlus.', en: 'Building energy models, on EnergyPlus.' } },
  // CAD
  { cat: 'CAD', name: 'FreeCAD', repo: 'FreeCAD/FreeCAD', org: 'FreeCAD Project Association', country: 'International', url: 'https://www.freecad.org', what: { nl: 'Parametrische 3D-CAD, met een BIM-werkbank.', en: 'Parametric 3D CAD, with a BIM workbench.' } },
  { cat: 'CAD', name: 'OpenSCAD', repo: 'openscad/openscad', org: 'Community', country: 'International', url: 'https://openscad.org', what: { nl: '3D-modellen beschrijven in code.', en: '3D models described in code.' } },
  { cat: 'CAD', name: 'LibreCAD', repo: 'LibreCAD/LibreCAD', org: 'Community', country: 'International', url: 'https://librecad.org', what: { nl: '2D-CAD met DXF.', en: '2D CAD with DXF.' } },
  { cat: 'CAD', name: 'CadQuery', repo: 'CadQuery/cadquery', org: 'Community', country: 'International', url: 'https://cadquery.readthedocs.io', what: { nl: 'Parametrische CAD in Python.', en: 'Parametric CAD in Python.' } },
  { cat: 'CAD', name: 'Chili3D', repo: 'xiangechen/chili3d', org: 'Independent developer', country: 'China', url: 'https://chili3d.com', what: { nl: '3D-CAD in de browser (WebAssembly).', en: '3D CAD in the browser (WebAssembly).' } },
  { cat: 'CAD', name: 'SolveSpace', repo: 'solvespace/solvespace', org: 'Community', country: 'International', url: 'https://solvespace.com', what: { nl: 'Parametrische 2D/3D-CAD met een eigen constraint-solver.', en: 'Parametric 2D/3D CAD with its own constraint solver.' } },
  { cat: 'CAD', name: 'build123d', repo: 'gumyr/build123d', org: 'Community', country: 'International', url: 'https://build123d.readthedocs.io', what: { nl: 'Python-CAD op de OCCT-kern.', en: 'Python CAD on the OCCT kernel.' } },
  { cat: 'CAD', name: 'JSCAD', repo: 'jscad/OpenJSCAD.org', org: 'Community', country: 'International', url: 'https://openjscad.xyz', what: { nl: '3D-modellen in JavaScript.', en: '3D models in JavaScript.' } },
  { cat: 'CAD', name: 'Open CASCADE Technology', repo: 'Open-Cascade-SAS/OCCT', org: 'Open Cascade (Capgemini)', country: 'France', url: 'https://dev.opencascade.org', what: { nl: 'Geometriekern onder veel open CAD-programma’s.', en: 'Geometry kernel under many open CAD programs.' } },
  { cat: 'CAD', name: 'QCAD', repo: 'qcad/qcad', org: 'RibbonSoft GmbH', country: 'Switzerland', url: 'https://qcad.org', what: { nl: '2D-CAD voor tekeningen en plattegronden.', en: '2D CAD for drawings and floor plans.' } },
  { cat: 'CAD', name: 'BRL-CAD', repo: 'BRL-CAD/brlcad', org: 'Community (from the U.S. Army Research Laboratory)', country: 'United States', url: 'https://brlcad.org', what: { nl: 'Solid-modelling en raytracing.', en: 'Solid modelling and ray tracing.' } },
  { cat: 'CAD', name: 'replicad', repo: 'sgenoud/replicad', org: 'Independent developer', country: 'Switzerland', url: 'https://replicad.xyz', what: { nl: 'CAD-bibliotheek voor de browser.', en: 'CAD library for the browser.' } },
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
