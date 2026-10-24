# Open BIM Studio

> Open-source BIM modeller in development, built in the DynLex programming language with a native Vulkan interface. It aims to be both as direct as sketching (selection, grips, snapping, Push/Pull, face splitting) and properly technical: parametric building systems, reinforcement (bars, cages, stirrups, meshes, schedules), connections with plates, bolts and screws, and plans, sections and sheets developed from the same model as PDF or SVG. IFCX and binary IFCX are the project format, with IFC import and export, plus a local API and an MCP adapter. A development preview: there is a Linux preview for testers; a tested Windows installer is not yet available.

**Status:** in development
**License:** MPL-2.0
**Platforms:** Linux
**Category:** BIM Modelling
**Current version:** v0.1.1 (2026-10-23)
**Tool ID:** `open-bim-studio`
**GitHub repo:** `OpenAEC-Foundation/open-bim-studio`

## Live stats

- Stars: **0**
- Commits: **405**
- Forks: **0**
- Open issues: **3**
- Releases: **2**
- Total downloads: **0**

## Key features

- Building model: levels, grids, layered walls, floors, roofs, ceilings, openings, beams, columns, piles and persistent spaces
- Direct editing: selection, grips, numerical properties, snapping, transforms, boundary editing with Tab, Push/Pull and face splitting
- Parametric systems: building-system types with frames and panels, hosted window systems, stairs, railings and component libraries
- Reinforcement: parametric bars, cages, stirrups, area reinforcement and meshes, with position labels, schedules and Dutch or international notation
- Connections: modular connection nodes, member voids and added parts such as plates, bolts and screws
- Views and drawings: plans, sections, 3D views, section boxes, dimensions, tags, drawing standards, sheets and PDF/SVG output
- Interchange: IFC import and export, IFCX and binary IFCX project files, DXF reference geometry
- Automation: a local request/response API and an MCP adapter

## Tech stack

`DynLex` · `LLVM` · `Vulkan` · `GLFW`

## When to use this

Following the development of an open-source BIM modeller written in DynLex, and testing the Linux preview. It is a development preview: the listed areas are implemented, not validated in every combination, large-model performance is still being worked on, and IFC/IFCX support is not a certification claim. Not yet for production projects.

## Standards & integration

- IFC
- IFCX
- DXF
- PDF
- SVG
- MCP

All OpenAEC tools exchange data via the open **IFCX** format (based on IFC 4.3).

## Download & links

- Product page: https://open-aec.com/open-bim-studio/
- GitHub repo: https://github.com/OpenAEC-Foundation/open-bim-studio
- Latest stable release: https://github.com/OpenAEC-Foundation/open-bim-studio/releases/tag/v0.1.1

---

Part of the [OpenAEC Foundation](https://open-aec.com/) ecosystem — open-source software for buildings, civil infrastructure (GWW) and civil engineering. All tools communicate through **IFCX**.
