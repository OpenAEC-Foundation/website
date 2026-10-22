# Open Planner Studio

> Free, open-source construction scheduling with Gantt charts, critical path (CPM), WBS, resources, leveling, baselines and progress tracking. Opens Microsoft Project (.mpp) and Primavera P6 (.xer) files directly — .mpp dates match to the minute across a 216-file test corpus — and calculates with named scheduling profiles for Primavera P6, Microsoft Project or Open Planner Studio. Task types per task (fixed duration, units or work), task splitting, saved layouts, a progress sheet that round-trips through Excel or CSV, and eleven report types including a DCMA 14-point assessment. Saves natively as IFC 4.3 (ADD2), exports MS Project XML, Primavera P6 XML and CSV, and offers an optional MCP server for an AI assistant in the desktop app. Interface and Help in 28 languages. Runs on Windows, macOS and Linux and fully in the browser.

**Status:** beta
**License:** LGPL-3.0
**Platforms:** Windows, macOS, Linux, Web
**Category:** Project Planning
**Current version:** v2026.10.0 (2026-10-21)
**Tool ID:** `open-planner-studio`
**GitHub repo:** `OpenAEC-Foundation/open-planner-studio`

## Live stats

- Stars: **35**
- Commits: **4569**
- Forks: **13**
- Open issues: **39**
- Releases: **22**
- Total downloads: **2,829**
- Downloads by platform: Windows (1731), Linux (AppImage) (330), Linux (deb) (280), macOS (225), Linux (rpm) (114), Linux (snap) (77), Archive (72)

## Key features

- Opens Microsoft Project (.mpp, MS Project 2010–2021) and Primavera P6 (.xer) files directly, read-only and without the original program; .mpp dates match to the minute across a 216-file test corpus
- Primavera P6 XML and MS Project XML import and export, plus CSV; each export states what the format does not carry
- Scheduling profiles: one solver with named profiles for Primavera P6, Microsoft Project and Open Planner Studio, each a set of visible conventions
- "Dates as recorded" view that shows the dates the other package stored in the file
- Critical path (CPM) with float, near-critical work, multiple critical paths, constraints and deadlines
- One task grid for the Gantt task list and the full Table view: keyboard cell navigation, paste from a spreadsheet, dependency editing in the cell, WBS templates and custom work categories
- Task type per task (fixed duration and units, fixed duration and work, fixed work, fixed units) that keeps duration, units and work consistent; the former Task type field is now called Work category
- User task splitting in the Gantt, with draggable pieces
- Layouts: saved views (filter, grouping, sort, columns, time scale, overlays) as ribbon buttons
- Resources (labour, equipment, material, subcontractors) with histogram, editable hour distribution per assignment and background leveling that explains overallocation per day
- Resource libraries shared across projects, with an occupancy overview that flags double booking across all open projects
- Multiple baselines and progress tracking with status date and progress line; a progress sheet that round-trips through Excel (.xlsx) or CSV with a preview
- Calendars with public holidays, the construction holiday and own working times; plan each task in days or hours
- Eleven report types (Gantt print, resource diagram, milestones, variance, look-ahead, critical and near-critical, progress, schedule health with the DCMA 14-point assessment, resource loading, resource assignments, WBS summary) with PDF on A4 up to A1
- Native IFC 4.3 (ADD2) file format, with IFC4 as a save option, so BIM software can use the schedule for 4D
- AutoSave to the document's own file, separate from always-on crash recovery
- Optional built-in MCP server in the desktop app: an AI client such as Claude Code can read and edit the schedule, with pause, read-only mode, automatic backups and an activity log
- Interface and in-app Help in 28 languages, including right-to-left Arabic and Persian; the Help was rewritten into 78 articles
- Runs on Windows, macOS and Linux and fully in the browser

## Tech stack

`Rust` · `TypeScript` · `Tauri 2`

## When to use this

Construction and civil engineering scheduling, as an open-source alternative to Microsoft Project, Primavera P6 or Asta Powerproject — especially when existing MS Project (.mpp) or Primavera P6 (.xer) files need to open faithfully, when the schedule should stay in an open format (IFC 4.3) that BIM software can use for 4D, or when an AI assistant should be able to work on the schedule directly.

## Alternative to

- Microsoft Project
- Primavera P6
- Asta Powerproject
- TILOS

## Standards & integration

- IFC 4.3
- IFC4
- IFCX
- MS Project MPP
- MS Project XML
- Primavera P6 XER
- Primavera P6 XML
- DCMA 14-point assessment
- MCP

All OpenAEC tools exchange data via the open **IFCX** format (based on IFC 4.3).

## Download & links

- Product page: https://open-aec.com/open-planner-studio/
- Live demo: https://open-planner-studio.open-aec.com/
- GitHub repo: https://github.com/OpenAEC-Foundation/open-planner-studio
- Latest stable release: https://github.com/OpenAEC-Foundation/open-planner-studio/releases/tag/v2026.10.0
- Nightly builds: https://github.com/OpenAEC-Foundation/open-planner-studio/releases/tag/nightly

## Direct downloads (most popular)

- [Windows · Open.Planner.Studio_2026.9.0_x64-setup.exe](https://github.com/OpenAEC-Foundation/open-planner-studio/releases/download/v2026.9.0/Open.Planner.Studio_2026.9.0_x64-setup.exe) (v2026.9.0 — 7.8 MB)
- [Linux (AppImage) · Open.Planner.Studio_2026.9.0_amd64.AppImage](https://github.com/OpenAEC-Foundation/open-planner-studio/releases/download/v2026.9.0/Open.Planner.Studio_2026.9.0_amd64.AppImage) (v2026.9.0 — 82.7 MB)
- [macOS · Open.Planner.Studio_2026.9.0_universal.dmg](https://github.com/OpenAEC-Foundation/open-planner-studio/releases/download/v2026.9.0/Open.Planner.Studio_2026.9.0_universal.dmg) (v2026.9.0 — 16.3 MB)
- [Linux (deb) · Open.Planner.Studio_2026.9.0_amd64.deb](https://github.com/OpenAEC-Foundation/open-planner-studio/releases/download/v2026.9.0/Open.Planner.Studio_2026.9.0_amd64.deb) (v2026.9.0 — 8.9 MB)
- [Windows · Open.Planner.Studio_2026.8.1_x64-setup.exe](https://github.com/OpenAEC-Foundation/open-planner-studio/releases/download/v2026.8.1/Open.Planner.Studio_2026.8.1_x64-setup.exe) (v2026.8.1 — 7.6 MB)
- [Linux (rpm) · Open.Planner.Studio-2026.9.0-1.x86_64.rpm](https://github.com/OpenAEC-Foundation/open-planner-studio/releases/download/v2026.9.0/Open.Planner.Studio-2026.9.0-1.x86_64.rpm) (v2026.9.0 — 8.8 MB)
- [Windows · Open.Planner.Studio_2026.9.0_x64-setup.nsis.zip](https://github.com/OpenAEC-Foundation/open-planner-studio/releases/download/v2026.9.0/Open.Planner.Studio_2026.9.0_x64-setup.nsis.zip) (v2026.9.0 — 7.4 MB)
- [Linux (snap) · open-planner-studio_2026.9.0_amd64.snap](https://github.com/OpenAEC-Foundation/open-planner-studio/releases/download/v2026.9.0/open-planner-studio_2026.9.0_amd64.snap) (v2026.9.0 — 8 MB)

---

Part of the [OpenAEC Foundation](https://open-aec.com/) ecosystem — open-source software for buildings, civil infrastructure (GWW) and civil engineering. All tools communicate through **IFCX**.
