#!/usr/bin/env node
/**
 * build-markdown-mirrors.js
 *
 * Generates Markdown mirrors of all OpenAEC product pages under /md/.
 *
 * Why: AI assistants (Claude, Continue, Cursor, etc.) read Markdown more
 * cleanly than HTML. Markdown mirrors give them clean, citable content
 * with live stats baked in from /data/stats.json and /data/downloads.json.
 *
 * Inputs:
 *  - /data/stats.json            live per-repo commits/stars/version
 *  - /data/downloads.json        download counts per tool + platform
 *  - /data/release-notes/*.json  release info
 *  - /api/tools.json             structured tool catalog
 *  - /llms.txt                   foundation about-info source
 *
 * Outputs:
 *  - /md/<tool-id>.md            one file per product (18 tools)
 *  - /md/index.md                overview of all tools
 *  - /md/about.md                foundation info
 *  - /md/index.json              tool-id -> markdown URL map
 *
 * Run once: `node scripts/build-markdown-mirrors.js`
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'md');
const SITE_BASE = 'https://open-aec.com';

// ---------- helpers ----------

function readJson(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.warn(`[warn] Could not parse ${rel}: ${e.message}`);
    return null;
  }
}

function writeFile(rel, content) {
  const p = path.join(OUT_DIR, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
  return Buffer.byteLength(content, 'utf8');
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function findRepoStats(stats, repoName) {
  if (!stats || !stats.repos) return null;
  const lc = repoName.toLowerCase();
  return stats.repos.find(r => r.name.toLowerCase() === lc) || null;
}

function findDownloads(downloads, repoName) {
  if (!downloads || !downloads.perTool) return null;
  const lc = repoName.toLowerCase();
  return downloads.perTool.find(r => r.repo.toLowerCase() === lc) || null;
}

function findRanked(downloads, repoName) {
  if (!downloads || !downloads.rankedByDownloads) return null;
  const lc = repoName.toLowerCase();
  return downloads.rankedByDownloads.find(r => r.repo.toLowerCase() === lc) || null;
}

function platformList(byPlatform) {
  if (!byPlatform) return [];
  return Object.entries(byPlatform)
    .filter(([_, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([p, n]) => `${p} (${n})`);
}

// ---------- per-tool config ----------
//
// Curated, AEC-focused tool entries. Each entry sets the canonical id used
// for the /md/<id>.md filename and matches the slug used on the website.
// `repo` is the GitHub repo name as stored in stats.json / downloads.json
// (case-insensitive lookup).

const TOOLS = [
  {
  "id": "ifccad",
  "repo": "ifccad",
  "name": "IFCCAD",
  "category": "CAD Format",
  "status": "in development",
  "description": "An open CAD drawing format based on IFCX. Usable on its own, with development towards reliable DWG/DXF exchange and future BIM integration.",
  "keywords": [
    "IFCCAD",
    "IFCX",
    "CAD drawing format",
    "DWG",
    "DXF",
    "roundtrip",
    "preservation",
    "Format Explorer"
  ],
  "alternatives": [],
  "license": "MPL-2.0",
  "techStack": [
    "Rust",
    "WebAssembly",
    "JavaScript"
  ],
  "platforms": [
    "Web"
  ],
  "productPage": "https://open-aec.com/ifccad/",
  "liveDemo": "https://ifccad-explorer.open-aec.com",
  "nightly": false,
  "features": [
    "Open, standalone CAD drawing profile using IFCX; no BIM model required",
    "Format Explorer for inspecting drawing structure and trying DWG/DXF conversion",
    "Development towards faithful round trips, with explicit conversion diagnostics and a bounded preservation pilot",
    "BIM integration and associative regeneration remain development goals"
  ],
  "whenToUse": "Exploring an open alternative to DWG, inspecting IFCCAD drawings and testing supported conversion routes. Experimental; complete round trips and associative BIM regeneration are not yet guaranteed.",
  "standards": [
    "IFCX",
    "DWG",
    "DXF"
  ]
},
  {
    id: 'open-pdf-studio',
    name: 'Open PDF Studio',
    repo: 'open-pdf-studio',
    category: 'PDF / Document',
    status: 'beta',
    license: 'LGPL-3.0',
    platforms: ['Windows', 'macOS', 'Linux', 'Android'],
    techStack: ['Rust', 'SolidJS', 'Tauri 2', 'PDF.js', 'pdf-lib'],
    description: 'Open-source PDF editor and annotator with a custom Rust PDF engine. 20+ annotation tools, measurement, redaction, OCR, forms. Vector PDF rendering optimized for CAD drawings.',
    alternatives: ['Bluebeam Revu', 'Foxit PDF Editor', 'Adobe Acrobat Pro', 'PDF-XChange Editor'],
    features: [
      'PDF viewing, navigation, multi-tab documents',
      'Annotation tools: highlight, underline, strikethrough, sticky notes',
      'Drawing tools: freehand, shapes, callouts, text boxes',
      'Measurement tools: distance, area, perimeter (CAD-aware)',
      'Redaction with permanent content removal',
      'OCR for scanned drawings',
      'PDF form filling and editing',
      'Vector PDF rendering for sharp CAD drawings',
      'Custom Rust PDF engine (open-pdf-render)',
      'Thumbnail navigation with background prefetch',
      'Session restore',
    ],
    whenToUse: 'Marking up CAD drawings and construction documents, reviewing tenders, redlining shop drawings, redacting confidential content, and any PDF workflow where Bluebeam or Acrobat would normally be used.',
    standards: ['PDF', 'PDF/A', 'ISO 32000-1'],
  },
  {
    id: 'open-2d-studio',
    name: 'Open 2D Studio',
    repo: 'open-2d-studio',
    category: 'CAD',
    status: 'retired',
    license: 'LGPL-3.0',
    platforms: ['Windows', 'macOS', 'Linux'],
    techStack: ['Rust', 'React', 'TypeScript', 'Tauri 2', 'Canvas 2D', 'Zustand'],
    description: '2D CAD application with drawing tools, DXF import/export, layers and dimensions.',
    alternatives: ['AutoCAD LT', 'LibreCAD', 'NanoCAD', 'DraftSight'],
    features: [
      'Drawing primitives: line, polyline, arc, circle, rectangle, hatch',
      'Layer management with visibility and lock',
      'Linear and angular dimensioning',
      'DXF import and export',
      'Snap, ortho, grid',
      'Undo/redo history',
    ],
    whenToUse: 'Producing 2D drawings, marking up DXFs, simple drafting workflows where AutoCAD LT or LibreCAD would normally be used.',
    standards: ['DXF'],
  },
  {
    id: 'open-calc-studio',
    name: 'Open Calc Studio',
    repo: 'open-calc-studio',
    category: 'Cost Estimation',
    status: 'beta',
    license: 'LGPL-3.0',
    platforms: ['Windows', 'macOS', 'Linux', 'Web'],
    techStack: ['TypeScript', 'Rust', 'Tauri 2', 'MCP'],
    description: 'Cost estimation and budgeting for buildings, civil infrastructure and GWW projects. STABU/RAW support, IFCX integration, MCP server for AI control.',
    alternatives: ['Bouwprijs', 'IBIS-Trad', 'Vico Office', 'CostX'],
    features: [
      'Hierarchical cost build-up (chapters, sections, items)',
      'STABU and RAW catalog support',
      'IFCX integration for quantity take-off',
      'PDF and spreadsheet export',
      'MCP server for AI-driven estimation',
      'Multi-project workspaces',
    ],
    whenToUse: 'Building or civil project cost estimating using Dutch STABU/RAW catalogs, automated quantity take-off from IFCX models, AI-assisted estimating workflows.',
    standards: ['STABU', 'RAW', 'IFCX'],
  },
  {
    id: 'open-energy-studio',
    name: 'Open Energy Studio',
    repo: 'open-energy-studio',
    category: 'Building Physics',
    status: 'beta',
    license: 'LGPL-3.0',
    platforms: ['Windows', 'macOS', 'Linux'],
    techStack: ['Rust', 'TypeScript', 'Tauri 2'],
    description: 'Building energy analysis and performance for the Dutch NTA 8800 / BENG framework.',
    alternatives: ['Uniec', 'Vabi', 'DesignBuilder'],
    features: [
      'NTA 8800 energy performance calculation',
      'BENG indicator output (BENG 1/2/3)',
      'IFCX-based building data input',
      'PDF report generation',
    ],
    whenToUse: 'Computing BENG indicators and energy labels for buildings in the Netherlands, comparing energy concepts during design.',
    standards: ['NTA 8800', 'BENG', 'IFCX'],
  },
  {
    id: 'open-planner-studio',
    name: 'Open Planner Studio',
    repo: 'open-planner-studio',
    category: 'Project Planning',
    status: 'beta',
    license: 'LGPL-3.0',
    platforms: ['Windows', 'macOS', 'Linux', 'Web'],
    techStack: ['Rust', 'TypeScript', 'Tauri 2'],
    description: 'Free, open-source construction scheduling with Gantt charts, critical path (CPM), WBS, resources, leveling, baselines and progress tracking. Opens Microsoft Project (.mpp) and Primavera P6 (.xer) files directly — .mpp dates match to the minute across a 216-file test corpus — and calculates with named scheduling profiles for Primavera P6, Microsoft Project or Open Planner Studio. Task types per task (fixed duration, units or work), task splitting, saved layouts, a progress sheet that round-trips through Excel or CSV, and eleven report types including a DCMA 14-point assessment. Saves natively as IFC 4.3 (ADD2), exports MS Project XML, Primavera P6 XML and CSV, and offers an optional MCP server for an AI assistant in the desktop app. Interface and Help in 28 languages. Runs on Windows, macOS and Linux and fully in the browser.',
    alternatives: ['Microsoft Project', 'Primavera P6', 'Asta Powerproject', 'TILOS'],
    features: [
      'Opens Microsoft Project (.mpp, MS Project 2010–2021) and Primavera P6 (.xer) files directly, read-only and without the original program; .mpp dates match to the minute across a 216-file test corpus',
      'Primavera P6 XML and MS Project XML import and export, plus CSV; each export states what the format does not carry',
      'Scheduling profiles: one solver with named profiles for Primavera P6, Microsoft Project and Open Planner Studio, each a set of visible conventions',
      '"Dates as recorded" view that shows the dates the other package stored in the file',
      'Critical path (CPM) with float, near-critical work, multiple critical paths, constraints and deadlines',
      'One task grid for the Gantt task list and the full Table view: keyboard cell navigation, paste from a spreadsheet, dependency editing in the cell, WBS templates and custom work categories',
      'Task type per task (fixed duration and units, fixed duration and work, fixed work, fixed units) that keeps duration, units and work consistent; the former Task type field is now called Work category',
      'User task splitting in the Gantt, with draggable pieces',
      'Layouts: saved views (filter, grouping, sort, columns, time scale, overlays) as ribbon buttons',
      'Resources (labour, equipment, material, subcontractors) with histogram, editable hour distribution per assignment and background leveling that explains overallocation per day',
      'Resource libraries shared across projects, with an occupancy overview that flags double booking across all open projects',
      'Multiple baselines and progress tracking with status date and progress line; a progress sheet that round-trips through Excel (.xlsx) or CSV with a preview',
      'Calendars with public holidays, the construction holiday and own working times; plan each task in days or hours',
      'Eleven report types (Gantt print, resource diagram, milestones, variance, look-ahead, critical and near-critical, progress, schedule health with the DCMA 14-point assessment, resource loading, resource assignments, WBS summary) with PDF on A4 up to A1',
      'Native IFC 4.3 (ADD2) file format, with IFC4 as a save option, so BIM software can use the schedule for 4D',
      'AutoSave to the document\'s own file, separate from always-on crash recovery',
      'Optional built-in MCP server in the desktop app: an AI client such as Claude Code can read and edit the schedule, with pause, read-only mode, automatic backups and an activity log',
      'Interface and in-app Help in 28 languages, including right-to-left Arabic and Persian; the Help was rewritten into 78 articles',
      'Runs on Windows, macOS and Linux and fully in the browser',
    ],
    whenToUse: 'Construction and civil engineering scheduling, as an open-source alternative to Microsoft Project, Primavera P6 or Asta Powerproject — especially when existing MS Project (.mpp) or Primavera P6 (.xer) files need to open faithfully, when the schedule should stay in an open format (IFC 4.3) that BIM software can use for 4D, or when an AI assistant should be able to work on the schedule directly.',
    standards: ['IFC 4.3', 'IFC4', 'IFCX', 'MS Project MPP', 'MS Project XML', 'Primavera P6 XER', 'Primavera P6 XML', 'DCMA 14-point assessment', 'MCP'],
  },
  {
    id: 'open-pile-plan-studio',
    name: 'Open Pile Plan Studio',
    repo: 'pile-plan-studio',
    category: 'Foundation Engineering',
    status: 'beta',
    license: 'LGPL-3.0-or-later',
    platforms: ['Web', 'Windows'],
    techStack: ['Rust', 'WebAssembly', 'React', 'TypeScript', 'Tauri 2'],
    description: 'Interactive pile-plan variants with load points, CPT selection, pile options, utilization, estimated costs and IFCPP project files.',
    alternatives: [],
    features: [
      'CSV and XLSX import for load points, CPT coordinates and foundation advice',
      'Automatic and manual CPT selection per load point',
      'Pile option comparison by size, tip level, utilization, governing CPT and estimated cost',
      'Single and bulk pile configuration assignment',
      'HiGHS cost optimization with configuration limits and optional neighbour-difference reduction',
      'Grouped load points, locks and multiple pile-plan variants',
      'IFCPP project save and reopen',
      'Shared Rust calculation core in browser and desktop',
      'Local MCP access for AI assistants in the Windows desktop app',
    ],
    whenToUse: 'Exploring and assigning pile configurations across structural load points while keeping input data, engineering choices and cost estimates in one traceable project.',
    standards: ['IFCPP', 'MCP (Windows desktop)'],
  },
  {
    id: 'open-pointcloud-studio',
    name: 'Open Pointcloud Studio',
    repo: 'open-pointcloud-studio',
    category: 'Reality Capture',
    status: 'beta',
    license: 'GPL-3.0-only (application), LGPL-3.0-or-later (point-cloud library)',
    platforms: ['Windows', 'macOS', 'Linux'],
    techStack: ['Rust', 'iced', 'wgpu'],
    description: 'Desktop application for viewing, measuring, editing and converting laser scans and other point clouds, and for turning them into section drawings, meshes and the flat faces of a building. Runs on Windows, macOS and Linux, is written in Rust and needs no browser or web view.',
    alternatives: [],
    // The web demo belonged to the earlier application and is retired.
    liveDemo: false,
    // The application has no nightly builds and reads or writes no IFCX, so
    // the two shared template lines about those stay out of its mirror.
    nightly: false,
    ifcx: false,
    // The installers of the earlier application (v0.2.0 and v0.3.0) are a
    // different program; they and the checksum files stay out of the list of
    // direct downloads.
    assetFilter: (asset) => !/^Open\.Pointcloud\.Studio_|\.sha256$/.test(asset.name),
    // The mirror lists every package of the newest stable release, not the
    // most downloaded files of all releases: that ranking keeps offering
    // files of releases that have been superseded.
    currentReleaseOnly: true,
    // The Linux packages for 64-bit ARM are experimental. In the download
    // data they carry the same platform as the x86-64 ones, so the list
    // says which they are.
    assetLabel: (asset) => /[_.-](arm64|aarch64)\.(appimage|deb|tar\.gz)$/i.test(asset.name)
      ? `${asset.platform}, 64-bit ARM, experimental`
      : asset.platform,
    features: [
      'Opens point clouds in LAS, LAZ, E57, PLY, PCD, PTX, PTS and text formats, and meshes in OBJ, PLY, OFF and STL',
      'Opens a whole scan project at once: a folder of scans, or the scans that a scan project file (.rcp) lists',
      'Large files stay usable while they open: LAS and LAZ open from their header, an E57 file of 512 MiB or more first shows a sample spread through the file when its layout allows that',
      'An octree index on disk supplies the detail for the current camera, up to a point budget of at most ten million points; built automatically from one million points; the points on screen stay while the camera moves',
      'Four colour modes (stored colour, elevation, intensity, classification), eye-dome lighting, classes shown or hidden one by one',
      'Section box with six draggable faces that limits what is shown, selected, meshed and searched for faces; its content can be exported on its own or drawn as a 2D drawing; aligned to the axes of the scan',
      'Measuring: distance along a polyline (segments, total, horizontal length, height difference) and area of a polygon in its own plane',
      'Saved views with notes and arrows, exported as one BCF 2.1 file with camera, clipping planes and a picture each',
      'Scanner stations of E57, PCD and PTX scans, station photos to stand in and look around, walking with W A S D',
      'Box selection and point picking, delete with undo and redo, thin, move and scale; the source file is never changed',
      'Export of the whole cloud, the selection, the section box or every Nth point as LAS, LAZ, E57, PLY, XYZ, PTS or CSV; merging of visible LAS and LAZ scans',
      'Terrain mesh and 3D surface (not watertight); any mesh, whether made here, opened from a file or downloaded from the 3D BAG, saved as OBJ, binary PLY or binary STL, with open edges and connected parts reported',
      'Section drawing: a 2D drawing at scale 1:1 of what the section box cuts, a plan or a vertical section, saved as DXF or DWG (file version R2004, R2010, R2013 or R2018); a filled cut draws the walls, columns and floors that are cut as filled regions with outlines, with a preview before a file is saved',
      'Closed mesh: a surface without overlaps from every point of a region, closed where the scan has points or a gap narrower than the hole limit, with door and window openings left open; reports the mean, 95% and largest distance between the points and the mesh; a mesh holds at most 4,000,000 vertices and 8,000,000 triangles',
      'Detected faces: the flat faces (floors, ceilings, walls, sloped planes) and the round columns and pipes of a region; a flat face is a plane with its outline, a column or pipe a cylinder without an outline, each with its area and the residual of its points; exported as JSON or as OBJ with a group per face',
      '3D BAG building models of the Netherlands for an area in RD New coordinates, at most 2 by 2 km and about 5,000 buildings per download',
      'Local command API on the loopback address and an MCP server (open-pointcloud-studio --mcp)',
      'Command-line modes without a window: converting a scan, exporting the points inside a box, merging scans, building an index, drawing a section as DXF or DWG, making meshes and detecting faces',
      'Interface in Dutch and English',
    ],
    whenToUse: 'Opening and inspecting laser scans and whole scan projects, cutting floor plans and sections with the section box and saving them as 2D drawings in DXF or DWG, measuring distances and areas, handing over viewpoints with notes as BCF, converting between point-cloud formats, making meshes from scans, and finding the planes and cylinders of a room. The filled cut, the closed mesh and the detected faces were measured on generated rooms, not yet on a scan of a real building.',
    standards: ['LAS', 'LAZ', 'E57', 'PLY', 'PCD', 'PTX', 'DXF', 'DWG', 'BCF 2.1', 'MCP'],
  },
  {
    id: 'open-infra-studio',
    name: 'Open Infra Studio',
    repo: 'Open-Infra',
    category: 'GIS',
    status: 'beta',
    license: 'GPL-3.0-only',
    platforms: ['Windows', 'Linux', 'macOS'],
    techStack: ['Rust', 'egui', 'proj4rs'],
    description: 'Open-source GIS plugin for Open CAD Studio. Sets the project location and coordinate system, then brings aerial photos, WMS/TMS underlays, WFS vector data, OpenStreetMap and Dutch base data from PDOK into the DWG. BGT, the cadastral map (BRK) and KLIC deliveries (IMKL 2.0) land on NLCS 5.02 layers with their source attributes as object data, through the official NLCS-BGT 5.0 mapping, and a drawing sheet with title block, legend, north arrow, scale bar and RD crosses is generated around the import area.',
    alternatives: [],
    // A plugin for Open CAD Studio: no web demo, no nightly builds, no IFCX.
    liveDemo: false,
    nightly: false,
    ifcx: false,
    features: [
      'Project location by clicking the map or searching an address, place, parcel or coordinate pair (PDOK Locatieserver and Nominatim), stored in the drawing',
      'Aerial photos and maps as WMS/TMS underlays, with 19 server presets for the Netherlands, Flanders and worldwide plus your own servers',
      'WFS vector data with a chosen label attribute, colour and clipping to the import area',
      'OpenStreetMap themes worldwide: buildings, roads, rail, water, civil structures, land use, cables and pipelines, fences, house numbers',
      'PDOK in one click: aerial photo, cadastral map, AHN, BAG, parcels, NWB road sections, hectometre markers, ProRail tracks, waterways',
      'BGT: 42 PDOK collections, current objects only, mapped with the official NLCS-BGT 5.0 mapping (719 rules)',
      'Cadastral map (BRK): parcel boundaries and parcel numbers at their BRK rotation',
      'KLIC deliveries (the Kadaster zip or the area-information XML): 13 IMKL 2.0 themes, cables and pipes labelled per network operator with diameter and material',
      'NLCS 5.02 built in: 3,659 objects, 543 linetypes, 256 colours, layer styles per drawing status',
      'Object data: every entity keeps its source attributes',
      'NLCS drawing sheet: frame, title block with data sources, legend of the layers used, north arrow, scale bar and RD crosses, A3 to A0 chosen automatically',
      '14 built-in coordinate systems, automatic UTM worldwide, any EPSG code',
      '28 GIS commands for the ribbon, scripts and automation',
    ],
    whenToUse: 'Starting an infrastructure or civil drawing from the existing situation: the project location, aerial photos and maps as underlays, and the Dutch base registers (BGT, cadastre, KLIC) on NLCS layers with a finished drawing sheet. Outside the Netherlands, WMS, WFS, OpenStreetMap and any coordinate system. Conversion to RD New uses the 7-parameter transformation (about 0.2 m from RDNAPTRANS), so use data already supplied in RD for setting out. On macOS the ribbon buttons and commands work but the workbench window does not yet.',
    standards: ['NLCS 5.02', 'BGT', 'BRK', 'KLIC / IMKL 2.0', 'WMS', 'WFS', 'OGC API Features', 'EPSG:28992', 'DWG'],
  },
  {
    id: 'open-bim-studio',
    name: 'Open BIM Studio',
    repo: 'open-bim-studio',
    category: 'BIM Modelling',
    status: 'alpha',
    license: 'MPL-2.0',
    platforms: ['Linux'],
    techStack: ['DynLex', 'LLVM', 'Vulkan', 'GLFW'],
    description: 'Open-source BIM modeller in development, built in the DynLex programming language with a native Vulkan interface. It aims to be both as direct as sketching (selection, grips, snapping, Push/Pull, face splitting) and properly technical: parametric building systems, reinforcement (bars, cages, stirrups, meshes, schedules), connections with plates, bolts and screws, and plans, sections and sheets developed from the same model as PDF or SVG. IFCX and binary IFCX are the project format, with IFC import and export, plus a local API and an MCP adapter. A development preview: there is a Linux preview for testers; a tested Windows installer is not yet available.',
    alternatives: [],
    // Not released yet: no web demo, no nightly builds.
    liveDemo: false,
    nightly: false,
    ifcx: true,
    features: [
      'Building model: levels, grids, layered walls, floors, roofs, ceilings, openings, beams, columns, piles and persistent spaces',
      'Direct editing: selection, grips, numerical properties, snapping, transforms, boundary editing with Tab, Push/Pull and face splitting',
      'Parametric systems: building-system types with frames and panels, hosted window systems, stairs, railings and component libraries',
      'Reinforcement: parametric bars, cages, stirrups, area reinforcement and meshes, with position labels, schedules and Dutch or international notation',
      'Connections: modular connection nodes, member voids and added parts such as plates, bolts and screws',
      'Views and drawings: plans, sections, 3D views, section boxes, dimensions, tags, drawing standards, sheets and PDF/SVG output',
      'Interchange: IFC import and export, IFCX and binary IFCX project files, DXF reference geometry',
      'Automation: a local request/response API and an MCP adapter',
    ],
    whenToUse: 'Following the development of an open-source BIM modeller written in DynLex, and testing the Linux preview. It is a development preview: the listed areas are implemented, not validated in every combination, large-model performance is still being worked on, and IFC/IFCX support is not a certification claim. Not yet for production projects.',
    standards: ['IFC', 'IFCX', 'DXF', 'PDF', 'SVG', 'MCP'],
  },
  {
    id: 'open-heatloss-studio',
    name: 'Open Heatloss Studio',
    repo: 'open-heatloss-studio',
    category: 'Building Physics',
    status: 'alpha',
    license: 'LGPL-3.0',
    platforms: ['Windows', 'macOS', 'Linux'],
    techStack: ['Rust', 'TypeScript', 'Tauri 2'],
    description: 'Heat loss calculations for buildings per NEN 12831 and ISSO 51:2023. Rust calculation engine, IFCX integration, PDF reports.',
    alternatives: ['Vabi Elements', 'Stabicad Heatloss', 'Uniec'],
    features: [
      'Room-by-room transmission heat loss (NEN 12831)',
      'Ventilation heat loss',
      'U-value catalog and editor',
      'Climate data per municipality (ISSO 51:2023)',
      'IFCX building geometry input',
      'PDF report export',
      'Temperature factor checks',
    ],
    whenToUse: 'Sizing radiators and floor heating per NEN 12831, ISSO 51:2023 compliance reporting, Dutch building permit submissions.',
    standards: ['NEN 12831', 'ISSO 51:2023', 'IFCX'],
  },
  {
    id: 'open-speech-studio',
    name: 'Open Speech Studio',
    repo: 'open-speech-studio',
    category: 'Productivity',
    status: 'beta',
    license: 'LGPL-3.0',
    platforms: ['Windows', 'macOS', 'Linux'],
    techStack: ['Rust', 'Whisper', 'Tauri 2'],
    description: 'Local speech-to-text using Whisper AI. CTRL+Win shortcut for OS-wide dictation. Privacy-first, no cloud.',
    alternatives: ['Dragon NaturallySpeaking', 'Windows Speech Recognition', 'macOS Dictation'],
    features: [
      'Local Whisper-based transcription',
      'OS-wide CTRL+Win dictation hotkey',
      'No cloud, no telemetry',
      'Multi-language support',
      'Configurable models (tiny / base / small / medium / large)',
    ],
    whenToUse: 'Hands-free site notes, dictation for inspection reports, confidential dictation that may not leave the device.',
    standards: [],
  },
  {
    id: 'open-field-studio',
    name: 'Open Field Studio',
    repo: 'Open-Field-Studio',
    category: 'Field / Inspection',
    status: 'beta',
    license: 'LGPL-3.0',
    platforms: ['Windows', 'macOS', 'Linux', 'Android', 'iOS'],
    techStack: ['Rust', 'TypeScript', 'Tauri 2'],
    description: 'Site inspection and quality control. Defect pinning on floorplans, NEN 2767 checklists, offline-first.',
    alternatives: ['PlanRadar', 'Snagar', 'Fieldwire'],
    features: [
      'Defect pinning on PDF or image floorplans',
      'NEN 2767 condition assessment checklists',
      'Photo capture and annotation',
      'Offline-first sync',
      'BCF export for issue handover',
    ],
    whenToUse: 'On-site inspections, snagging, NEN 2767 condition assessment, quality control with offline mobile use.',
    standards: ['NEN 2767', 'BCF 2.1'],
  },
  {
    id: 'openaec-installer',
    name: 'OpenAEC Installer',
    repo: 'openaec-installer',
    category: 'Installer & Launcher',
    status: 'beta',
    license: 'CC-BY-SA-4.0',
    platforms: ['Windows', 'macOS', 'Linux'],
    techStack: ['Rust', 'Tauri 2', 'React', 'TypeScript'],
    description: 'Central hub to discover, install, update and launch every OpenAEC tool from one app.',
    alternatives: ['Autodesk Desktop App', 'manual downloads from GitHub'],
    features: [
      'Catalogue of all OpenAEC desktop apps and web tools',
      'Detects installed tools and versions (Windows registry, Linux AppImage folder)',
      'Update detection against the latest GitHub release',
      'One-click install and update with the official installers',
      'Web tools in tabs inside the app',
      'Updates itself; five themes, Dutch and English',
    ],
    whenToUse: 'Installing and keeping all OpenAEC tools up to date on one workstation without visiting each GitHub repository.',
    standards: [],
  },
  {
    id: 'open-paint-studio',
    name: 'Open Paint Studio',
    repo: 'open-paint-studio',
    category: 'Image Editing',
    status: 'alpha',
    license: 'MIT',
    platforms: ['Windows', 'macOS', 'Linux'],
    techStack: ['TypeScript', 'Rust', 'Tauri 2', 'ImageMagick WebAssembly'],
    description: 'Simple image editor in the spirit of MS Paint, with editable vector objects, a local API and an MCP server.',
    alternatives: ['MS Paint', 'Paint.NET'],
    features: [
      'Brush, eraser, fill, eyedropper, lines, rectangles, ellipses and inline text',
      'Editable vector objects: move, resize and restyle shapes and text; export editable SVG',
      'Crop, resize, rotate and flip; brightness, contrast, saturation, greyscale, invert, sepia',
      'Opens PNG, JPEG, WebP, GIF, BMP, TIFF, HEIC, AVIF, PSD, SVG, JPEG XL, camera RAW and IFCX/IFCXB locally',
      'Exports PNG, JPEG, WebP, SVG and IFCX/IFCXB',
      'Local API with token and an MCP server for AI assistants',
    ],
    whenToUse: 'Marking up screenshots and photos, sketching on floor plans, quick crops and colour fixes, and letting an AI assistant edit images through MCP.',
    standards: ['IFCX'],
  },
  {
    id: 'open-frame-studio',
    name: 'Open Frame Studio',
    repo: 'open-frame-studio',
    category: 'Window & Door Frame Design',
    status: 'retired',
    license: 'CC-BY-SA-4.0',
    platforms: ['Windows', 'macOS', 'Linux', 'Browser'],
    techStack: ['Rust', 'Svelte 5', 'Tauri 2', 'Three.js'],
    description: 'Design window and door frames (kozijnen) in 2D and 3D, with frame schedules, workshop drawings, cutting lists and IFC export.',
    alternatives: ['commercial kozijn software'],
    features: [
      '2D frame editor with grid subdivision, dimension lines and infills',
      'Profile editor and a library of 80+ timber, aluminium, uPVC and timber-aluminium profiles',
      '3D view with extruded profiles and glass',
      'Frame schedule (PDF, Excel), A3 workshop drawings and DXF',
      'IFC export with ILS Houten Kozijnen v2.0 property sets',
      'AI configurator via an OpenAI-compatible endpoint',
    ],
    whenToUse: 'Designing and documenting window and door frames for Dutch construction, from drawing to frame schedule, workshop drawing and BIM export.',
    standards: ['ILS Houten Kozijnen v2.0', 'IFC 4', 'NEN 3576'],
  },
  {
    id: 'monty-ifc-viewer',
    name: 'Monty IFC Viewer',
    repo: 'monty-ifc-viewer',
    category: 'BIM Viewer',
    status: 'live',
    license: 'LGPL-3.0',
    platforms: ['Windows', 'macOS', 'Linux'],
    techStack: ['Rust', 'WebGPU', 'Tauri 2', 'IfcOpenShell'],
    description: 'Lightweight IFC viewer for quick BIM model inspection.',
    alternatives: ['Solibri Anywhere', 'BIMvision', 'Tekla BIMsight', 'usBIM.viewer+'],
    features: [
      'IFC 2x3 / IFC 4 / IFC 4.3 viewing',
      'Property inspection',
      'Spatial structure tree',
      'Section and isolate tools',
      'Fast load times',
    ],
    whenToUse: 'Quick BIM model spot-checks without launching a full authoring tool, viewing IFCs sent by partners.',
    standards: ['IFC 2x3', 'IFC 4', 'IFC 4.3'],
  },
  {
    id: 'bcf-manager-studio',
    name: 'BCF Manager Studio',
    repo: 'openaec-bcf-platform',
    category: 'Issue Management',
    status: 'beta',
    license: 'LGPL-3.0',
    platforms: ['Web (self-hosted)'],
    techStack: ['Rust', 'Axum', 'PostgreSQL', 'React', 'TypeScript', 'Docker'],
    description: 'BCF 2.1 issue management platform. BCF API 2.1 server, IFC GlobalId linking, self-hosted with Docker.',
    alternatives: ['BIMcollab', 'Solibri', 'usBIM.bcf'],
    features: [
      'BCF 2.1 topics, comments, viewpoints',
      'BCF API 2.1 server (29 endpoints)',
      'IFC GlobalId linking',
      '3D viewer integration',
      'Per-project access control',
    ],
    whenToUse: 'Central issue and clash coordination across BIM teams, replacing BIMcollab or Solibri issue management.',
    standards: ['BCF 2.1', 'BCF API 2.1'],
  },
  {
    id: 'bim-validator',
    name: 'OpenAEC BIM Validator',
    repo: 'OpenAEC-BIM-validator',
    category: 'BIM Validation',
    status: 'live',
    license: 'LGPL-3.0',
    platforms: ['Web'],
    techStack: ['Rust (WASM)', 'TypeScript'],
    description: 'IDS validation against NL-BIM Basis ILS and RVB BIM Norm. Browser-based, 3D viewer, BCF export.',
    alternatives: ['Commercial BIM validation suites'],
    features: [
      'IDS (Information Delivery Specification) validation',
      'NL-BIM Basis ILS preset',
      'RVB BIM Norm preset',
      'Browser-based, no install',
      '3D viewer for failed elements',
      'BCF export of failures',
      'Project data separated per organization',
      'Open and save projects locally or in connected project storage',
      'Interactive section planes for focused model inspection',
    ],
    whenToUse: 'Pre-delivery IDS checks of IFC models against Dutch and RVB standards, browser-only quick validation.',
    standards: ['IDS', 'IFC 4', 'NL-BIM Basis ILS', 'RVB BIM Norm', 'BCF 2.1'],
  },
  {
    id: 'openaec-docs',
    name: 'OpenAEC Docs',
    repo: 'openaec-docs',
    category: 'Document Management',
    status: 'retired',
    license: 'LGPL-3.0',
    platforms: ['Web', 'Self-hosted'],
    techStack: ['Nextcloud', 'Rust', 'React', 'TypeScript', 'PostgreSQL'],
    description: 'BIM document management on top of Nextcloud: project files and folders, project manifests and links with the BIM Validator and BCF platform.',
    alternatives: ['Autodesk Construction Cloud Docs', 'Bentley ProjectWise', 'Aconex'],
    features: [
      'Project files and folders straight in Nextcloud',
      'Fixed project folders with allowed file types',
      'Project manifest of models, issue sets and reports',
      'Links with the OpenAEC BIM Validator and BCF platform',
      'OIDC single sign-on, several organisations per installation',
      'REST API',
    ],
    whenToUse: 'Self-hosted common data environment (CDE) for construction projects.',
    standards: ['ISO 19650'],
  },
  {
    id: 'openaec-cloud',
    name: 'OpenAEC SuperCloud',
    repo: 'openaec-cloud',
    category: 'Platform',
    status: 'in development',
    license: 'LGPL-3.0',
    platforms: ['Windows', 'Self-hosted (Nextcloud)'],
    techStack: ['Nextcloud', 'Rust', 'Tauri 2', 'SolidJS', 'Python'],
    description: 'Own cloud, account and SSO platform on your own Nextcloud: desktop sync client, shared cloud storage for the tools, one account for every app.',
    alternatives: ['Dropbox', 'OneDrive', 'Autodesk Construction Cloud'],
    features: [
      'Desktop sync client: two-way folder sync with Nextcloud',
      'Share links through your own server',
      'Windows cloud folder with on-demand files',
      'Shared Nextcloud storage library for OpenAEC tools (multi-tenant, project manifests)',
      'One OpenAEC account, central token checks',
    ],
    whenToUse: 'Keeping project files, accounts and issues on your own Nextcloud instead of Dropbox, OneDrive or a vendor cloud.',
    standards: ['IFCX', 'OIDC'],
  },
  {
    id: 'y-app',
    name: 'Y-app',
    repo: 'Y-app',
    category: 'Communication',
    status: 'beta',
    license: 'LGPL-3.0',
    platforms: ['Windows', 'macOS', 'Linux', 'Android', 'iOS'],
    techStack: ['Rust', 'TypeScript', 'Tauri 2'],
    description: 'Communication and collaboration for construction projects.',
    alternatives: ['Microsoft Teams', 'Slack', 'WhatsApp'],
    features: [
      'Project channels and direct messages',
      'File sharing with version tracking',
      'Integrated BCF issue references',
      'Mobile-first design',
    ],
    whenToUse: 'Project team chat with built-in BCF and document context.',
    standards: ['BCF 2.1'],
  },
  {
    id: 'open-3d-viewer',
    name: 'Open 3D Viewer Studio',
    repo: 'open-3d-viewer',
    category: 'BIM Viewer',
    status: 'beta',
    license: 'LGPL-3.0-or-later',
    platforms: ['Windows', 'macOS', 'Linux', 'Web'],
    techStack: ['Rust', 'iced', 'wgpu', 'WebGPU', 'WebAssembly'],
    description: 'Viewer for the 3D models that architects, engineers and builders exchange: SketchUp, Tekla Structures, Revit, IFC, glTF, OBJ, STL, PLY, CityJSON, LandXML and DWG/DXF. Measure, section, explode and save as IFC 4, as a desktop app and in the browser.',
    alternatives: [],
    features: [
      'Opens SketchUp (.skp, version 3 and later), Tekla Structures (.db1, beta), glTF/GLB, OBJ, STL, PLY, CityJSON/CityJSONSeq, LandXML TIN terrain and DWG/DXF model-space faces, on the desktop and in the browser',
      'Opens IFC and Revit (.rvt, .rfa) in the desktop app, with levels, grids, rooms, saved views and schedules',
      'Revit schedules as a table; a row selects its elements',
      'Several models at once, each with its own visibility toggle',
      'Measure distances, angles, areas and polygons',
      'Section box and section plane with filled cuts',
      'Exploded view per storey or per element',
      'Save as IFC 4 (IfcTriangulatedFaceSet, storeys, classes, properties, materials)',
      'OpenAEC Blueprint window: ribbon, File page, explorer, properties, five themes, Dutch and English, own shortcuts',
      'MCP server open-3d-viewer-mcp for AI agents, local on 127.0.0.1 with a token',
      'Signed installers for Windows, macOS and Linux',
    ],
    whenToUse: 'Opening a model you were sent (SketchUp, Tekla, Revit, IFC) without the program it was made in, measuring or sectioning it, or saving it as IFC 4.',
    standards: ['IFC 4 (export)', 'IFC (import, desktop app)', 'glTF', 'CityJSON', 'LandXML', 'MCP'],
    // Reads and writes IFC, not IFCX; no nightly builds.
    ifcx: false,
    nightly: false,
  },
  {
    id: 'open-safety-studio',
    name: 'Open Safety Studio',
    repo: null,
    category: 'Safety',
    status: 'beta',
    license: 'LGPL-3.0',
    platforms: ['Browser'],
    techStack: ['Rust', 'TypeScript', 'Tauri 2'],
    description: 'Safety plans for construction: health and safety plan (V&G), BLVC plan, risk matrix and safe maintenance, with the Dutch legal basis alongside. Live demo in the browser.',
    alternatives: ['VCA documentation tools', 'spreadsheet-based RI&E'],
    features: [
      'Health and safety plan (V&G) following Arbobesluit art. 2.28, incl. special risks from Annex II',
      'BLVC plan: accessibility, liveability, safety and communication around the site',
      '5x5 risk matrix (likelihood x severity)',
      'Safe maintenance following Bouwbesluit art. 6.53 and Arbobesluit art. 2.30',
      'IFC import, export and validation',
      'Templates and printable reports',
    ],
    whenToUse: 'Drawing up a health and safety plan, BLVC plan or safe-maintenance file for a Dutch construction project without starting from separate Word files and spreadsheets.',
    standards: ['Arbobesluit', 'Bouwbesluit', 'IFC'],
  },
];

// ---------- markdown builders ----------

// The files a mirror offers as direct downloads, with the heading they go
// under. By default the most downloaded files of all releases. A tool with
// `currentReleaseOnly` gets the packages of its newest stable release
// instead, every one of them. Download data written before it held those
// packages (latestAssets) has the ranking only; of that, the files of the
// newest stable release are kept.
function directDownloads(tool, dl, releaseInfo) {
  const keep = tool.assetFilter || (() => true);
  const ranked = dl && Array.isArray(dl.topAssets) ? dl.topAssets.filter(keep) : [];
  if (!tool.currentReleaseOnly) {
    return { heading: 'Direct downloads (most popular)', assets: ranked.slice(0, 8) };
  }
  const assets = dl && Array.isArray(dl.latestAssets)
    ? dl.latestAssets.filter(keep)
    : ranked.filter(a => a.tag === releaseInfo?.latestStable?.tag);
  return { heading: 'Direct downloads (current release)', assets };
}

function buildToolMarkdown(tool, stats, downloads, releaseInfo) {
  const repoStats = tool.repo ? findRepoStats(stats, tool.repo) : null;
  const dl = tool.repo ? findDownloads(downloads, tool.repo) : null;
  const ranked = tool.repo ? findRanked(downloads, tool.repo) : null;

  const version = repoStats?.latestRelease
    || releaseInfo?.latestStable?.tag
    || 'n/a';
  const releaseDate = repoStats?.latestReleaseDate
    || releaseInfo?.latestStable?.date
    || null;

  const stars = repoStats?.stars ?? 0;
  const commits = repoStats?.commits ?? 0;
  const forks = repoStats?.forks ?? 0;
  const issues = repoStats?.openIssues ?? 0;
  const totalDownloads = ranked?.downloads ?? 0;
  const totalReleases = ranked?.releases ?? repoStats?.releases ?? 0;

  const productPage = `${SITE_BASE}/${tool.id}/`;
  const liveDemo = typeof tool.liveDemo === 'string' ? tool.liveDemo : `https://${tool.id}.open-aec.com/`;
  const githubRepo = tool.repo
    ? `https://github.com/OpenAEC-Foundation/${tool.repo}`
    : null;
  const latestReleaseUrl = releaseInfo?.latestStable?.url
    || (tool.repo ? `https://github.com/OpenAEC-Foundation/${tool.repo}/releases` : null);
  const nightlyUrl = tool.nightly === false
    ? null
    : (releaseInfo?.nightly?.url
      || (tool.repo ? `https://github.com/OpenAEC-Foundation/${tool.repo}/releases/tag/nightly` : null));

  const lines = [];

  // Title + blockquote description
  lines.push(`# ${tool.name}`);
  lines.push('');
  lines.push(`> ${tool.description}`);
  lines.push('');

  // Key facts
  lines.push(`**Status:** ${tool.status}`);
  lines.push(`**License:** ${tool.license}`);
  lines.push(`**Platforms:** ${tool.platforms.join(', ')}`);
  lines.push(`**Category:** ${tool.category}`);
  lines.push(`**Current version:** ${version}${releaseDate ? ` (${releaseDate})` : ''}`);
  if (tool.repo) {
    lines.push(`**Tool ID:** \`${tool.id}\``);
    lines.push(`**GitHub repo:** \`OpenAEC-Foundation/${tool.repo}\``);
  } else {
    lines.push(`**Tool ID:** \`${tool.id}\``);
  }
  lines.push('');

  // Stats line (only if repo backed)
  if (tool.repo) {
    lines.push(`## Live stats`);
    lines.push('');
    lines.push(`- Stars: **${stars}**`);
    lines.push(`- Commits: **${commits}**`);
    lines.push(`- Forks: **${forks}**`);
    lines.push(`- Open issues: **${issues}**`);
    lines.push(`- Releases: **${totalReleases}**`);
    lines.push(`- Total downloads: **${totalDownloads.toLocaleString('en-US')}**`);
    if (dl && dl.byPlatform) {
      const plats = platformList(dl.byPlatform);
      if (plats.length) lines.push(`- Downloads by platform: ${plats.join(', ')}`);
    }
    lines.push('');
  }

  // Features
  lines.push(`## Key features`);
  lines.push('');
  for (const f of tool.features) lines.push(`- ${f}`);
  lines.push('');

  // Tech stack
  lines.push(`## Tech stack`);
  lines.push('');
  lines.push(tool.techStack.map(t => `\`${t}\``).join(' · '));
  lines.push('');

  // When to use this
  lines.push(`## When to use this`);
  lines.push('');
  lines.push(tool.whenToUse);
  lines.push('');

  // Alternatives
  if (tool.alternatives && tool.alternatives.length) {
    lines.push(`## Alternative to`);
    lines.push('');
    for (const a of tool.alternatives) lines.push(`- ${a}`);
    lines.push('');
  }

  // Standards & integration
  if (tool.standards && tool.standards.length) {
    lines.push(`## Standards & integration`);
    lines.push('');
    for (const s of tool.standards) lines.push(`- ${s}`);
    lines.push('');
    if (tool.ifcx !== false) {
      lines.push('All OpenAEC tools exchange data via the open **IFCX** format (based on IFC 4.3).');
      lines.push('');
    }
  }

  // Downloads / links
  lines.push(`## Download & links`);
  lines.push('');
  lines.push(`- Product page: ${productPage}`);
  if (tool.liveDemo !== false) lines.push(`- Live demo: ${liveDemo}`);
  if (githubRepo) lines.push(`- GitHub repo: ${githubRepo}`);
  if (latestReleaseUrl) lines.push(`- Latest stable release: ${latestReleaseUrl}`);
  if (nightlyUrl) lines.push(`- Nightly builds: ${nightlyUrl}`);
  lines.push('');

  // Download links
  const direct = directDownloads(tool, dl, releaseInfo);
  if (direct.assets.length) {
    lines.push(`## ${direct.heading}`);
    lines.push('');
    for (const a of direct.assets) {
      const size = a.sizeMB ? ` — ${a.sizeMB} MB` : '';
      const label = tool.assetLabel ? tool.assetLabel(a) : a.platform;
      lines.push(`- [${label} · ${a.name}](${a.url}) (${a.tag}${size})`);
    }
    lines.push('');
  }

  // Foundation footer
  lines.push(`---`);
  lines.push('');
  const ifcxNote = tool.ifcx !== false ? ' All tools communicate through **IFCX**.' : '';
  lines.push(`Part of the [OpenAEC Foundation](${SITE_BASE}/) ecosystem — open-source software for buildings, civil infrastructure (GWW) and civil engineering.${ifcxNote}`);
  lines.push('');

  return lines.join('\n');
}

function buildIndexMarkdown(tools, stats, downloads, generatedAt) {
  const lines = [];
  lines.push(`# OpenAEC tools — Markdown index`);
  lines.push('');
  lines.push(`> Machine-readable Markdown mirrors of the OpenAEC product pages. Use these when feeding the OpenAEC catalog to AI assistants (Claude, Continue, Cursor, etc).`);
  lines.push('');
  lines.push(`Generated: ${generatedAt}`);
  lines.push('');

  // Summary line from stats
  if (stats && stats.summary) {
    const s = stats.summary;
    lines.push(`**Foundation totals:** ${s.publicRepos} public repos · ${s.totalStars} stars · ${s.totalCommits} commits · ${s.uniqueContributors} contributors.`);
    lines.push('');
  }
  if (downloads) {
    lines.push(`**Total downloads across tools:** ${downloads.grandTotal?.toLocaleString('en-US') ?? 0} (${downloads.totalRepos ?? 0} repos).`);
    lines.push('');
  }

  // Group tools by status
  const byStatus = {};
  for (const t of tools) {
    (byStatus[t.status] ||= []).push(t);
  }
  const statusOrder = ['live', 'beta', 'alpha', 'preview', 'in development', 'planned', 'retired'];
  for (const status of statusOrder) {
    const list = byStatus[status];
    if (!list || !list.length) continue;
    lines.push(`## ${status.charAt(0).toUpperCase() + status.slice(1)}`);
    lines.push('');
    for (const t of list) {
      const repoStats = t.repo ? findRepoStats(stats, t.repo) : null;
      const v = repoStats?.latestRelease || 'n/a';
      lines.push(`- [${t.name}](./${t.id}.md) — ${t.description} (\`${v}\`)`);
    }
    lines.push('');
  }

  // Schema
  lines.push(`## Schema`);
  lines.push('');
  lines.push(`A JSON index mapping tool IDs to markdown URLs is available at [./index.json](./index.json).`);
  lines.push('');

  // About link
  lines.push(`## About the foundation`);
  lines.push('');
  lines.push(`See [./about.md](./about.md) for OpenAEC Foundation background, governance, license stance and contact.`);
  lines.push('');

  return lines.join('\n');
}

function buildAboutMarkdown(llmsTxt) {
  // We rebuild a cleaner Markdown version of llms.txt (it is already markdown-ish).
  // We keep the content but ensure a clean H1 + blockquote at the top.
  const lines = [];
  lines.push(`# OpenAEC Foundation`);
  lines.push('');
  lines.push(`> Open-source software ecosystem for the entire Architecture, Engineering & Construction (AEC) industry — buildings (B&U), civil infrastructure (GWW), and civil engineering (bridges, tunnels, roads, railways, water works). Mission: make all AEC software open source by end of 2026.`);
  lines.push('');

  if (llmsTxt) {
    // Strip the duplicate first H1+blockquote from llms.txt to avoid repeating.
    const trimmed = llmsTxt
      .replace(/^#\s+OpenAEC Foundation[\s\S]*?\n>\s+.*?\n+/, '')
      .trim();
    lines.push(trimmed);
    lines.push('');
  }

  lines.push(`---`);
  lines.push('');
  lines.push(`See [./index.md](./index.md) for the catalog of OpenAEC tools.`);
  lines.push('');
  return lines.join('\n');
}

// ---------- main ----------

function main() {
  const stats = readJson('data/stats.json');
  const downloads = readJson('data/downloads.json');
  const generatedAt = [stats?.generated, downloads?.generated]
    .filter(Boolean)
    .sort()
    .at(-1) || '1970-01-01T00:00:00.000Z';
  const llmsTxt = (() => {
    const p = path.join(ROOT, 'llms.txt');
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  })();

  ensureDir(OUT_DIR);

  const generated = [];
  let totalBytes = 0;

  // Per-tool MDs
  for (const tool of TOOLS) {
    let releaseInfo = null;
    if (tool.repo) {
      // release-notes filenames are case-sensitive but try multiple casings
      const candidates = [
        `data/release-notes/${tool.repo}.json`,
        `data/release-notes/${tool.repo.toLowerCase()}.json`,
        `data/release-notes/${tool.id}.json`,
      ];
      for (const c of candidates) {
        const found = readJson(c);
        if (found) { releaseInfo = found; break; }
      }
    }
    const md = buildToolMarkdown(tool, stats, downloads, releaseInfo);
    const file = `${tool.id}.md`;
    const bytes = writeFile(file, md);
    totalBytes += bytes;
    generated.push({ id: tool.id, file: `/md/${file}`, bytes });
  }

  // index.md
  const indexMd = buildIndexMarkdown(TOOLS, stats, downloads, generatedAt);
  totalBytes += writeFile('index.md', indexMd);
  generated.push({ id: '_index', file: '/md/index.md', bytes: Buffer.byteLength(indexMd, 'utf8') });

  // about.md
  const aboutMd = buildAboutMarkdown(llmsTxt);
  totalBytes += writeFile('about.md', aboutMd);
  generated.push({ id: '_about', file: '/md/about.md', bytes: Buffer.byteLength(aboutMd, 'utf8') });

  // index.json
  const indexJson = {
    $schema: 'https://open-aec.com/md/index.schema.json',
    generated: generatedAt,
    description: 'Markdown mirrors of OpenAEC product pages for AI tool integrations.',
    base: `${SITE_BASE}/md/`,
    tools: TOOLS.map(t => ({
      id: t.id,
      name: t.name,
      status: t.status,
      category: t.category,
      markdown: `${SITE_BASE}/md/${t.id}.md`,
      relativeMarkdown: `./${t.id}.md`,
      productPage: `${SITE_BASE}/${t.id}/`,
      githubRepo: t.repo ? `https://github.com/OpenAEC-Foundation/${t.repo}` : null,
    })),
    extras: {
      indexMarkdown: `${SITE_BASE}/md/index.md`,
      aboutMarkdown: `${SITE_BASE}/md/about.md`,
    },
  };
  const indexJsonStr = JSON.stringify(indexJson, null, 2);
  fs.writeFileSync(path.join(OUT_DIR, 'index.json'), indexJsonStr, 'utf8');
  totalBytes += Buffer.byteLength(indexJsonStr, 'utf8');

  // Summary
  const mdFileCount = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.md')).length;
  console.log('');
  console.log('  build-markdown-mirrors.js');
  console.log('  =========================');
  console.log(`  Output dir:           ${OUT_DIR}`);
  console.log(`  Tool markdown files:  ${TOOLS.length}`);
  console.log(`  Total .md files:      ${mdFileCount} (incl. index.md + about.md)`);
  console.log(`  Index JSON written:   ${path.join(OUT_DIR, 'index.json')}`);
  console.log(`  Total bytes written:  ${totalBytes.toLocaleString('en-US')} bytes`);
  console.log('');
}

if (require.main === module) main();

module.exports = { TOOLS, buildToolMarkdown };
