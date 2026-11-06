# OpenAEC tools — Markdown index

> Machine-readable Markdown mirrors of the OpenAEC product pages. Use these when feeding the OpenAEC catalog to AI assistants (Claude, Continue, Cursor, etc).

Generated: 2026-11-06T06:06:14.115Z

**Foundation totals:** 73 public repos · 5183 stars · 26191 commits · 106 contributors.

**Total downloads across tools:** 221,771 (26 repos).

## Live

- [Monty IFC Viewer](./monty-ifc-viewer.md) — Lightweight IFC viewer for quick BIM model inspection. (`v1.0.1`)
- [OpenAEC BIM Validator](./bim-validator.md) — IDS validation against NL-BIM Basis ILS and RVB BIM Norm. Browser-based, 3D viewer, BCF export. (`v2026.45.5`)

## Beta

- [Open PDF Studio](./open-pdf-studio.md) — Open-source PDF editor and annotator with a custom Rust PDF engine. 20+ annotation tools, measurement, redaction, OCR, forms. Vector PDF rendering optimized for CAD drawings. (`v2026.44.8`)
- [Open Calc Studio](./open-calc-studio.md) — Cost estimation and budgeting for buildings, civil infrastructure and GWW projects. STABU/RAW support, IFCX integration, MCP server for AI control. (`v2026.45.0`)
- [Open Energy Studio](./open-energy-studio.md) — Building energy analysis and performance for the Dutch NTA 8800 / BENG framework. (`v2026.44.0`)
- [Open Planner Studio](./open-planner-studio.md) — Free, open-source construction scheduling with Gantt charts, critical path (CPM), WBS, resources, leveling, baselines and progress tracking. Opens Microsoft Project (.mpp) and Primavera P6 (.xer) files directly — .mpp dates match to the minute across a 216-file test corpus — and calculates with named scheduling profiles for Primavera P6, Microsoft Project or Open Planner Studio. Task types per task (fixed duration, units or work), task splitting, saved layouts, a progress sheet that round-trips through Excel or CSV, and eleven report types including a DCMA 14-point assessment. Saves natively as IFC 4.3 (ADD2), exports MS Project XML, Primavera P6 XML and CSV, and offers an optional MCP server for an AI assistant in the desktop app. Interface and Help in 28 languages. Runs on Windows, macOS and Linux and fully in the browser. (`v2026.44.0`)
- [Open Pile Plan Studio](./open-pile-plan-studio.md) — Interactive pile-plan variants with load points, CPT selection, pile options, utilization, estimated costs and IFCPP project files. (`v2026.45.1`)
- [Open Pointcloud Studio](./open-pointcloud-studio.md) — Desktop application for viewing, measuring, editing and converting laser scans and other point clouds, and for turning them into section drawings, meshes and the flat faces of a building. Runs on Windows, macOS and Linux, is written in Rust and needs no browser or web view. (`v2026.45.1`)
- [Open Infra Studio](./open-infra-studio.md) — Open-source GIS and civil design plugin for Open CAD Studio. Sets the project location and coordinate system, then brings aerial photos, WMS/TMS underlays, WFS vector data, OpenStreetMap and Dutch base data from PDOK into the DWG. BGT, the cadastral map (BRK) and KLIC deliveries (IMKL 2.0) land on NLCS 5.02 layers with their source attributes as object data, through the official NLCS-BGT 5.0 mapping, and a drawing sheet with title block, legend, north arrow, scale bar and RD crosses is generated around the import area. (`v2026.45.4`)
- [Open Speech Studio](./open-speech-studio.md) — Local speech-to-text using Whisper AI. CTRL+Win shortcut for OS-wide dictation. Privacy-first, no cloud. (`v0.12.2`)
- [Open Field Studio](./open-field-studio.md) — Site inspection and quality control. Defect pinning on floorplans, NEN 2767 checklists, offline-first. (`v0.3.6`)
- [OpenAEC Installer](./openaec-installer.md) — Central hub to discover, install, update and launch every OpenAEC tool from one app. (`v0.2.14`)
- [Open CalcSheet Studio](./open-calcsheet-studio.md) — Structural calculations you can read back: every result shows its formula, numbers and units, and all your sheets end up in one report. (`nightly`)
- [BCF Manager Studio](./bcf-manager-studio.md) — BCF 2.1 issue management platform. BCF API 2.1 server, IFC GlobalId linking, self-hosted with Docker. (`n/a`)
- [Y-app](./y-app.md) — Communication and collaboration for construction projects. (`v0.34.0`)
- [Open 3D Viewer Studio](./open-3d-viewer.md) — Viewer for the 3D models that architects, engineers and builders exchange: SketchUp, Tekla Structures, Revit, IFC, glTF, OBJ, STL, PLY, CityJSON, LandXML and DWG/DXF. Measure, section, explode and save as IFC 4, as a desktop app and in the browser. (`v2026.45.11`)
- [Open Safety Studio](./open-safety-studio.md) — Safety plans for construction: health and safety plan (V&G), BLVC plan, risk matrix and safe maintenance, with the Dutch legal basis alongside. Live demo in the browser. (`n/a`)

## Alpha

- [Open BIM Studio](./open-bim-studio.md) — Open-source BIM modeller in development, built in the DynLex programming language with a native Vulkan interface. It aims to be both as direct as sketching (selection, grips, snapping, Push/Pull, face splitting) and properly technical: parametric building systems, reinforcement (bars, cages, stirrups, meshes, schedules), connections with plates, bolts and screws, and plans, sections and sheets developed from the same model as PDF or SVG. IFCX and binary IFCX are the project format, with IFC import and export, plus a local API and an MCP adapter. A development preview: there is a Linux preview for testers; a tested Windows installer is not yet available. (`v0.1.1`)
- [Open Heatloss Studio](./open-heatloss-studio.md) — Heat loss calculations for buildings per NEN 12831 and ISSO 51:2023. Rust calculation engine, IFCX integration, PDF reports. (`v0.1.1-pr13.alpha`)
- [Open Office Studio](./open-office-studio.md) — Open-source office suite: documents, spreadsheets, presentations, notes, Access databases and email in one desktop app, without an account or telemetry. Development releases, not yet signed off for production work. (`v2026.45.1`)
- [Open Paint Studio](./open-paint-studio.md) — Simple image editor in the spirit of MS Paint, with editable vector objects, a local API and an MCP server. (`v2026.43.2`)

## In development

- [IFCCAD](./ifccad.md) — Experimental open CAD drawing profile using IFCX, with a native source alpha, nine dimension kinds, polyline widths and extrusion thickness. The Explorer opens IFCX in Open CAD Studio and exchanges supported DWG/DXF content. (`v2026.45.1`)
- [OpenAEC SuperCloud](./openaec-cloud.md) — Own cloud, account and SSO platform on your own Nextcloud: desktop sync client, shared cloud storage for the tools, one account for every app. (`n/a`)

## Retired

- [Open 2D Studio](./open-2d-studio.md) — 2D CAD application with drawing tools, DXF import/export, layers and dimensions. (`v0.35.0`)
- [Open Frame Studio](./open-frame-studio.md) — Design window and door frames (kozijnen) in 2D and 3D, with frame schedules, workshop drawings, cutting lists and IFC export. (`v0.6.0`)
- [OpenAEC Docs](./openaec-docs.md) — BIM document management on top of Nextcloud: project files and folders, project manifests and links with the BIM Validator and BCF platform. (`n/a`)

## Schema

A JSON index mapping tool IDs to markdown URLs is available at [./index.json](./index.json).

## About the foundation

See [./about.md](./about.md) for OpenAEC Foundation background, governance, license stance and contact.
