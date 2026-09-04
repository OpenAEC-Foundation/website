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
    status: 'beta',
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
    status: 'alpha',
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
    description: 'Open-source construction scheduling with Gantt charts, critical path (CPM), WBS, resource levelling, baselines and progress tracking. One task grid for the whole schedule: it powers both the Gantt task list and the full Table view, with keyboard cell navigation, multi-cell paste from a spreadsheet, dependency editing in the cell, a column chooser, and a per-task duration unit of days or hours. Opens Microsoft Project (.mpp) files natively — date-faithful to the minute across a 216-file test corpus, with split tasks, resource leveling, timephased assignments and manually scheduled tasks read from the file and drawn as interrupted Gantt bars. Uses IFC 4.3 as its native file format and ships a built-in MCP server so an AI assistant can read and edit the schedule.',
    alternatives: ['Microsoft Project', 'Primavera P6', 'Asta Powerproject', 'TILOS'],
    features: [
      'Built-in MCP server: an AI client such as Claude Code can read and edit the schedule, with pause, read-only mode and automatic backups',
      'Interactive Gantt on HTML5 Canvas: drag and drop, vertical drag of a whole selection, collapsible non-working days, week numbers, Ctrl+click multi-select',
      'Critical path (CPM) with float, near-critical work, multiple critical paths and deadline analysis, plus a "dates as recorded" view for when a file\'s stored dates differ from recalculation',
      'WBS with collapsible chapters in one task grid that powers both the Gantt task list and the full Table view: keyboard cell navigation, multi-cell paste from a spreadsheet, dependency editing in the cell, a column chooser with pinning, and per-surface column preferences',
      'Custom task types, reusable on the installation and carried with the project so they stay readable after IFC exchange',
      'Per-task duration unit of days or hours: an hour task consumes real working minutes on its own calendar, and the unit survives IFC, MSPDI and P6 round-trips',
      'Native IFC 4.3 as the file format, with a built-in IFC code editor',
      'Native MS Project (.mpp) import: no converter, date-faithful to the minute across a 216-file test corpus, with split tasks, resource leveling, timephased assignments and manually scheduled tasks read and drawn as interrupted Gantt bars',
      'Resources (labour, equipment, subcontractors) with histogram and automatic levelling of overallocation',
      'Resource libraries: one shared pool across projects, with deviations flagged',
      'Occupancy overview: per library item, the load committed across all open projects as a table and a histogram, with days over capacity flagged — the double booking a single project cannot show',
      'Multiple baselines and progress tracking with status date, actual start and progress line',
      'Construction calendars: public holidays, building recess, frost delay, inspection moments, phasing, hour-level planning and a configurable break in the daily pattern',
      'Import and export of IFC, CSV, MS Project (.xml) and Primavera P6 (.xml)',
      '4D BIM: the schedule is an open IFC 4.3 file, so BIM software can lay it directly alongside a building model for 4D analysis of the construction sequence',
      'Reporting with live print preview, paper up to A2, a baseline overlay, a status or progress line, bars coloured by task, category or resource, compressible non-working days, configurable font size, repeating header, multi-page timeline and PDF export at roughly 220 DPI',
      'Document-bound AutoSave: once a project has a writable file it can be written back periodically without a dialog, kept separate from the always-on crash recovery',
      'Runs natively on Windows, macOS and Linux and fully in the browser, including open, save, auto-save and crash recovery',
      'In-app manual in all 14 interface languages, with eight sample projects',
    ],
    whenToUse: 'Construction and civil engineering scheduling, as an open-source alternative to Microsoft Project, Primavera P6 or Asta Powerproject — especially when existing MS Project (.mpp) files need to open with date-faithful accuracy, when the schedule should stay in an open format (IFC 4.3) that BIM software can use for 4D, or when an AI assistant should be able to work on the schedule directly.',
    standards: ['IFC 4.3', 'IFCX', 'MS Project MPP', 'MS Project XML', 'Primavera P6 XML', 'MCP'],
  },
  {
    id: 'open-pile-plan-studio',
    name: 'Pile Plan Studio',
    repo: 'pile-plan-studio',
    category: 'Foundation Engineering',
    status: 'beta',
    license: 'LGPL-3.0-or-later',
    platforms: ['Web', 'Windows'],
    techStack: ['Rust', 'WebAssembly', 'React', 'TypeScript', 'Tauri 2'],
    description: 'Interactive pile planning with load points, CPT selection, pile options, utilization, estimated costs and IFCPP project files.',
    alternatives: [],
    features: [
      'CSV and XLSX import for load points, CPT coordinates and foundation advice',
      'Automatic and manual CPT selection per load point',
      'Pile option comparison by size, tip level, utilization, governing CPT and estimated cost',
      'Single and bulk pile configuration assignment',
      'Greedy optimization with configurable limits',
      'IFCPP project save and reopen',
      'Shared Rust calculation core in browser and desktop',
    ],
    whenToUse: 'Exploring and assigning pile configurations across structural load points while keeping input data, engineering choices and cost estimates in one traceable project.',
    standards: ['IFCPP'],
  },
  {
    id: 'open-pointcloud-studio',
    name: 'Open Pointcloud Studio',
    repo: 'open-pointcloud-studio',
    category: 'Reality Capture',
    status: 'beta',
    license: 'LGPL-3.0',
    platforms: ['Windows', 'macOS', 'Linux'],
    techStack: ['Rust', 'WebGPU', 'Tauri 2'],
    description: 'Point cloud viewer for LAS / LAZ with RGB, elevation and classification rendering. EDL and octree LoD for large datasets.',
    alternatives: ['CloudCompare', 'Potree Desktop', 'Autodesk ReCap'],
    features: [
      'LAS and LAZ format support',
      'RGB, elevation and classification colouring',
      'Eye-Dome Lighting (EDL)',
      'Octree level-of-detail for very large clouds',
      'Cross-section and measurement tools',
    ],
    whenToUse: 'Inspecting laser-scanned site captures, comparing scans against BIM, lightweight viewing without CloudCompare or ReCap.',
    standards: ['LAS', 'LAZ'],
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
    status: 'alpha',
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
    id: 'open-frame-studio',
    name: 'Open Frame Studio',
    repo: 'open-frame-studio',
    category: 'Structural Engineering',
    status: 'alpha',
    license: 'LGPL-3.0',
    platforms: ['Windows', 'macOS', 'Linux'],
    techStack: ['Rust', 'TypeScript', 'Tauri 2'],
    description: '2D structural frame analysis for beams, columns, portal frames and civil load-bearing systems.',
    alternatives: ['Matrixframe', 'SCIA Engineer', 'Robot Structural Analysis'],
    features: [
      '2D frame modelling: beams, columns, portals',
      'Linear-elastic analysis',
      'Load cases and combinations',
      'Section libraries (steel, timber, concrete)',
      'Diagram output for N, V, M',
    ],
    whenToUse: 'Quick 2D structural sanity checks for buildings or civil load-bearing systems, design school workflows, validation of larger FEA results.',
    standards: ['Eurocode'],
  },
  {
    id: 'monty-ifc-viewer',
    name: 'Monty IFC Viewer',
    repo: 'monty-ifc-viewer',
    category: 'BIM Viewer',
    status: 'beta',
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
    status: 'in development',
    license: 'LGPL-3.0',
    platforms: ['Windows', 'macOS', 'Linux', 'Web'],
    techStack: ['Rust', 'TypeScript', 'Tauri 2'],
    description: 'BCF 2.1 issue management platform. BCF API 3.0, IFC GlobalId linking.',
    alternatives: ['BIMcollab', 'Solibri', 'usBIM.bcf'],
    features: [
      'BCF 2.1 topics, comments, viewpoints',
      'BCF API 3.0 server',
      'IFC GlobalId linking',
      '3D viewer integration',
      'Per-project access control',
    ],
    whenToUse: 'Central issue and clash coordination across BIM teams, replacing BIMcollab or Solibri issue management.',
    standards: ['BCF 2.1', 'BCF API 3.0'],
  },
  {
    id: 'bim-validator',
    name: 'OpenAEC BIM Validator',
    repo: 'OpenAEC-BIM-validator',
    category: 'BIM Validation',
    status: 'in development',
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
    status: 'in development',
    license: 'LGPL-3.0',
    platforms: ['Web', 'Self-hosted'],
    techStack: ['Nextcloud', 'PHP'],
    description: 'BIM document management based on Nextcloud. CDE-style document distribution and revisions.',
    alternatives: ['Autodesk Construction Cloud Docs', 'Bentley ProjectWise', 'Aconex'],
    features: [
      'CDE workflow on top of Nextcloud',
      'Document revision and status flags',
      'Folder permissions per project role',
      'OpenAEC SSO integration',
    ],
    whenToUse: 'Self-hosted common data environment (CDE) for construction projects.',
    standards: ['ISO 19650'],
  },
  {
    id: 'openaec-cloud',
    name: 'OpenAEC Cloud Platform',
    repo: 'openaec-cloud',
    category: 'Platform',
    status: 'in development',
    license: 'LGPL-3.0',
    platforms: ['Web', 'Self-hosted'],
    techStack: ['Rust', 'TypeScript'],
    description: 'Central platform: project management, user management, SSO and sync between OpenAEC tools.',
    alternatives: ['Autodesk Construction Cloud', 'Bentley iTwin'],
    features: [
      'Project workspaces',
      'User and team management',
      'SSO (OIDC) for all OpenAEC tools',
      'Cross-tool data sync via IFCX',
    ],
    whenToUse: 'Hosting OpenAEC tooling as a unified platform for a firm or project.',
    standards: ['IFCX', 'OIDC'],
  },
  {
    id: 'y-app',
    name: 'Y-app',
    repo: 'Y-app',
    category: 'Communication',
    status: 'alpha',
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
    name: 'Open 3D Viewer',
    repo: null,
    category: 'BIM Viewer',
    status: 'preview',
    license: 'LGPL-3.0',
    platforms: ['Web'],
    techStack: ['TypeScript', 'WebGPU', 'three.js'],
    description: 'Browser-based 3D viewer for inspecting BIM models without installing anything.',
    alternatives: ['Autodesk Viewer', 'BIMvision', 'IFC.js demo viewer'],
    features: [
      'IFC viewing in the browser',
      'Property inspection',
      'Section tools',
      'No install — pure web',
    ],
    whenToUse: 'Sharing a quick 3D preview of a BIM model with a stakeholder who has no viewer installed.',
    standards: ['IFC 2x3', 'IFC 4', 'IFC 4.3'],
  },
  {
    id: 'open-safety-studio',
    name: 'Open Safety Studio',
    repo: null,
    category: 'Safety',
    status: 'planned',
    license: 'LGPL-3.0',
    platforms: ['Windows', 'macOS', 'Linux'],
    techStack: ['Rust', 'TypeScript', 'Tauri 2'],
    description: 'Safety analysis and risk assessment for construction projects.',
    alternatives: ['VCA documentation tools', 'spreadsheet-based RI&E'],
    features: [
      'Risk inventory & evaluation (RI&E)',
      'Task risk analysis (TRA / LMRA)',
      'Linking risks to IFCX work locations',
      'PDF reports for VCA/ISO 45001 audits',
    ],
    whenToUse: 'Construction site safety planning, VCA and ISO 45001 documentation, replacing manual spreadsheets.',
    standards: ['VCA', 'ISO 45001'],
  },
];

// ---------- markdown builders ----------

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
  const liveDemo = `https://${tool.id}.open-aec.com/`;
  const githubRepo = tool.repo
    ? `https://github.com/OpenAEC-Foundation/${tool.repo}`
    : null;
  const latestReleaseUrl = releaseInfo?.latestStable?.url
    || (tool.repo ? `https://github.com/OpenAEC-Foundation/${tool.repo}/releases` : null);
  const nightlyUrl = releaseInfo?.nightly?.url
    || (tool.repo ? `https://github.com/OpenAEC-Foundation/${tool.repo}/releases/tag/nightly` : null);

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
    lines.push('All OpenAEC tools exchange data via the open **IFCX** format (based on IFC 4.3).');
    lines.push('');
  }

  // Downloads / links
  lines.push(`## Download & links`);
  lines.push('');
  lines.push(`- Product page: ${productPage}`);
  lines.push(`- Live demo: ${liveDemo}`);
  if (githubRepo) lines.push(`- GitHub repo: ${githubRepo}`);
  if (latestReleaseUrl) lines.push(`- Latest stable release: ${latestReleaseUrl}`);
  if (nightlyUrl) lines.push(`- Nightly builds: ${nightlyUrl}`);
  lines.push('');

  // Top assets (download links)
  if (dl && Array.isArray(dl.topAssets) && dl.topAssets.length) {
    lines.push(`## Direct downloads (most popular)`);
    lines.push('');
    for (const a of dl.topAssets.slice(0, 8)) {
      const size = a.sizeMB ? ` — ${a.sizeMB} MB` : '';
      lines.push(`- [${a.platform} · ${a.name}](${a.url}) (${a.tag}${size})`);
    }
    lines.push('');
  }

  // Foundation footer
  lines.push(`---`);
  lines.push('');
  lines.push(`Part of the [OpenAEC Foundation](${SITE_BASE}/) ecosystem — open-source software for buildings, civil infrastructure (GWW) and civil engineering. All tools communicate through **IFCX**.`);
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
  const statusOrder = ['beta', 'alpha', 'preview', 'in development', 'planned'];
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

main();
