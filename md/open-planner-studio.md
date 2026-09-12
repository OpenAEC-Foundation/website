# Open Planner Studio

> Open-source construction scheduling with Gantt charts, critical path (CPM), WBS, resource levelling, baselines and progress tracking. One task grid for the whole schedule: it powers both the Gantt task list and the full Table view, with keyboard cell navigation, multi-cell paste from a spreadsheet, dependency editing in the cell, a column chooser, and a per-task duration unit of days or hours. Opens Microsoft Project (.mpp) files natively — date-faithful to the minute across a 216-file test corpus, with split tasks, resource leveling, timephased assignments and manually scheduled tasks read from the file and drawn as interrupted Gantt bars. Uses IFC 4.3 as its native file format and ships a built-in MCP server so an AI assistant can read and edit the schedule.

**Status:** beta
**License:** LGPL-3.0
**Platforms:** Windows, macOS, Linux, Web
**Category:** Project Planning
**Current version:** v2026.9.0 (2026-09-02)
**Tool ID:** `open-planner-studio`
**GitHub repo:** `OpenAEC-Foundation/open-planner-studio`

## Live stats

- Stars: **19**
- Commits: **1782**
- Forks: **7**
- Open issues: **14**
- Releases: **21**
- Total downloads: **1,007**
- Downloads by platform: Windows (554), Linux (deb) (163), Linux (AppImage) (140), macOS (78), Archive (27), Linux (snap) (23), Linux (rpm) (22)

## Key features

- Built-in MCP server: an AI client such as Claude Code can read and edit the schedule, with pause, read-only mode and automatic backups
- Interactive Gantt on HTML5 Canvas: drag and drop, vertical drag of a whole selection, collapsible non-working days, week numbers, Ctrl+click multi-select
- Critical path (CPM) with float, near-critical work, multiple critical paths and deadline analysis, plus a "dates as recorded" view for when a file's stored dates differ from recalculation
- WBS with collapsible chapters in one task grid that powers both the Gantt task list and the full Table view: keyboard cell navigation, multi-cell paste from a spreadsheet, dependency editing in the cell, a column chooser with pinning, and per-surface column preferences
- Custom task types, reusable on the installation and carried with the project so they stay readable after IFC exchange
- Per-task duration unit of days or hours: an hour task consumes real working minutes on its own calendar, and the unit survives IFC, MSPDI and P6 round-trips
- Native IFC 4.3 as the file format, with a built-in IFC code editor
- Native MS Project (.mpp) import: no converter, date-faithful to the minute across a 216-file test corpus, with split tasks, resource leveling, timephased assignments and manually scheduled tasks read and drawn as interrupted Gantt bars
- Resources (labour, equipment, subcontractors) with histogram and automatic levelling of overallocation
- Resource libraries: one shared pool across projects, with deviations flagged
- Occupancy overview: per library item, the load committed across all open projects as a table and a histogram, with days over capacity flagged — the double booking a single project cannot show
- Multiple baselines and progress tracking with status date, actual start and progress line
- Construction calendars: public holidays, building recess, frost delay, inspection moments, phasing, hour-level planning and a configurable break in the daily pattern
- Import and export of IFC, CSV, MS Project (.xml) and Primavera P6 (.xml)
- 4D BIM: the schedule is an open IFC 4.3 file, so BIM software can lay it directly alongside a building model for 4D analysis of the construction sequence
- Reporting with live print preview, paper up to A2, a baseline overlay, a status or progress line, bars coloured by task, category or resource, compressible non-working days, configurable font size, repeating header, multi-page timeline and PDF export at roughly 220 DPI
- Document-bound AutoSave: once a project has a writable file it can be written back periodically without a dialog, kept separate from the always-on crash recovery
- Runs natively on Windows, macOS and Linux and fully in the browser, including open, save, auto-save and crash recovery
- In-app manual in all 14 interface languages, with eight sample projects

## Tech stack

`Rust` · `TypeScript` · `Tauri 2`

## When to use this

Construction and civil engineering scheduling, as an open-source alternative to Microsoft Project, Primavera P6 or Asta Powerproject — especially when existing MS Project (.mpp) files need to open with date-faithful accuracy, when the schedule should stay in an open format (IFC 4.3) that BIM software can use for 4D, or when an AI assistant should be able to work on the schedule directly.

## Alternative to

- Microsoft Project
- Primavera P6
- Asta Powerproject
- TILOS

## Standards & integration

- IFC 4.3
- IFCX
- MS Project MPP
- MS Project XML
- Primavera P6 XML
- MCP

All OpenAEC tools exchange data via the open **IFCX** format (based on IFC 4.3).

## Download & links

- Product page: https://open-aec.com/open-planner-studio/
- Live demo: https://open-planner-studio.open-aec.com/
- GitHub repo: https://github.com/OpenAEC-Foundation/open-planner-studio
- Latest stable release: https://github.com/OpenAEC-Foundation/open-planner-studio/releases/tag/v2026.9.0
- Nightly builds: https://github.com/OpenAEC-Foundation/open-planner-studio/releases/tag/nightly

## Direct downloads (most popular)

- [Windows · Open.Planner.Studio_2026.9.0_x64-setup.exe](https://github.com/OpenAEC-Foundation/open-planner-studio/releases/download/v2026.9.0/Open.Planner.Studio_2026.9.0_x64-setup.exe) (v2026.9.0 — 7.8 MB)
- [Windows · Open.Planner.Studio_2026.8.1_x64-setup.exe](https://github.com/OpenAEC-Foundation/open-planner-studio/releases/download/v2026.8.1/Open.Planner.Studio_2026.8.1_x64-setup.exe) (v2026.8.1 — 7.6 MB)
- [Linux (AppImage) · Open.Planner.Studio_2026.9.0_amd64.AppImage](https://github.com/OpenAEC-Foundation/open-planner-studio/releases/download/v2026.9.0/Open.Planner.Studio_2026.9.0_amd64.AppImage) (v2026.9.0 — 82.7 MB)
- [Windows · Open.Planner.Studio_2026.7.14_x64-setup.exe](https://github.com/OpenAEC-Foundation/open-planner-studio/releases/download/v2026.7.14/Open.Planner.Studio_2026.7.14_x64-setup.exe) (v2026.7.14 — 7.4 MB)
- [macOS · Open.Planner.Studio_2026.7.13_universal.dmg](https://github.com/OpenAEC-Foundation/open-planner-studio/releases/download/v2026.7.13/Open.Planner.Studio_2026.7.13_universal.dmg) (v2026.7.13 — 15.4 MB)
- [Windows · Open.Planner.Studio_2026.6.0_x64-setup.exe](https://github.com/OpenAEC-Foundation/open-planner-studio/releases/download/v2026.6.0/Open.Planner.Studio_2026.6.0_x64-setup.exe) (v2026.6.0 — 4.6 MB)
- [Linux (deb) · Open.Planner.Studio_2026.8.1_amd64.deb](https://github.com/OpenAEC-Foundation/open-planner-studio/releases/download/v2026.8.1/Open.Planner.Studio_2026.8.1_amd64.deb) (v2026.8.1 — 8.7 MB)
- [Linux (deb) · Open.Planner.Studio_2026.9.0_amd64.deb](https://github.com/OpenAEC-Foundation/open-planner-studio/releases/download/v2026.9.0/Open.Planner.Studio_2026.9.0_amd64.deb) (v2026.9.0 — 8.9 MB)

---

Part of the [OpenAEC Foundation](https://open-aec.com/) ecosystem — open-source software for buildings, civil infrastructure (GWW) and civil engineering. All tools communicate through **IFCX**.
