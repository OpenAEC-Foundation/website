# Open Pointcloud Studio

> Desktop application for viewing, measuring, editing and converting laser scans and other point clouds. Runs on Windows, macOS and Linux, is written in Rust and needs no browser or web view.

**Status:** beta
**License:** GPL-3.0-only (application), LGPL-3.0-or-later (point-cloud library)
**Platforms:** Windows, macOS, Linux
**Category:** Reality Capture
**Current version:** v0.8.0 (2026-10-03)
**Tool ID:** `open-pointcloud-studio`
**GitHub repo:** `OpenAEC-Foundation/open-pointcloud-studio`

## Live stats

- Stars: **5**
- Commits: **189**
- Forks: **2**
- Open issues: **12**
- Releases: **9**
- Total downloads: **360**
- Downloads by platform: Windows (188), Linux (AppImage) (46), macOS (37), Windows (MSI) (33), Linux (deb) (29), Other (17), Archive (10)

## Key features

- Opens point clouds in LAS, LAZ, E57, PLY, PCD, PTX, PTS and text formats, and meshes in OBJ, PLY, OFF and STL
- Opens a whole scan project at once: a folder of scans, or the scans that a scan project file (.rcp) lists
- Large files stay usable while they open: LAS and LAZ open from their header, an E57 file of 512 MiB or more first shows a sample spread through the file when its layout allows that
- An octree index on disk supplies the detail for the current camera, up to a point budget of at most ten million points; built automatically from one million points
- Four colour modes (stored colour, elevation, intensity, classification), eye-dome lighting, classes shown or hidden one by one
- Section box with six draggable faces that limits what is shown, selected and meshed; its content can be exported on its own; aligned to the axes of the scan
- Measuring: distance along a polyline (segments, total, horizontal length, height difference) and area of a polygon in its own plane
- Saved views with notes and arrows, exported as one BCF 2.1 file with camera, clipping planes and a picture each
- Scanner stations of E57, PCD and PTX scans, station photos to stand in and look around, walking with W A S D
- Box selection and point picking, delete with undo and redo, thin, move and scale; the source file is never changed
- Export of the whole cloud, the selection, the section box or every Nth point as LAS, LAZ, E57, PLY, XYZ, PTS or CSV; merging of visible LAS and LAZ scans
- Terrain mesh and 3D surface (not watertight), saved as OBJ, binary PLY or binary STL, with open edges and connected parts reported
- 3D BAG building models of the Netherlands for an area in RD New coordinates
- Local command API on the loopback address and an MCP server (open-pointcloud-studio --mcp)
- Command-line modes without a window: converting a scan, exporting the points inside a box, merging scans, building an index and making meshes
- Interface in Dutch and English

## Tech stack

`Rust` · `iced` · `wgpu`

## When to use this

Opening and inspecting laser scans and whole scan projects, cutting floor plans and sections with the section box, measuring distances and areas, handing over viewpoints with notes as BCF, converting between point-cloud formats, and making meshes from scans.

## Standards & integration

- LAS
- LAZ
- E57
- PLY
- PCD
- PTX
- BCF 2.1
- MCP

## Download & links

- Product page: https://open-aec.com/open-pointcloud-studio/
- GitHub repo: https://github.com/OpenAEC-Foundation/open-pointcloud-studio
- Latest stable release: https://github.com/OpenAEC-Foundation/open-pointcloud-studio/releases/tag/v0.8.0

## Direct downloads (most popular)

- [Windows · open-pointcloud-studio-v0.7.0-windows-setup.exe](https://github.com/OpenAEC-Foundation/open-pointcloud-studio/releases/download/v0.7.0/open-pointcloud-studio-v0.7.0-windows-setup.exe) (v0.7.0 — 8.7 MB)
- [Windows · open-pointcloud-studio_0.8.0_x64-setup.exe](https://github.com/OpenAEC-Foundation/open-pointcloud-studio/releases/download/v0.8.0/open-pointcloud-studio_0.8.0_x64-setup.exe) (v0.8.0 — 10.3 MB)
- [Linux (AppImage) · open-pointcloud-studio_0.8.0_amd64.AppImage](https://github.com/OpenAEC-Foundation/open-pointcloud-studio/releases/download/v0.8.0/open-pointcloud-studio_0.8.0_amd64.AppImage) (v0.8.0 — 15.7 MB)
- [Windows · open-pointcloud-studio_0.8.0_windows-x64.zip](https://github.com/OpenAEC-Foundation/open-pointcloud-studio/releases/download/v0.8.0/open-pointcloud-studio_0.8.0_windows-x64.zip) (v0.8.0 — 12.2 MB)
- [Windows · open-pointcloud-studio-v0.4.2-windows.zip](https://github.com/OpenAEC-Foundation/open-pointcloud-studio/releases/download/v0.4.2/open-pointcloud-studio-v0.4.2-windows.zip) (v0.4.2 — 9.2 MB)

---

Part of the [OpenAEC Foundation](https://open-aec.com/) ecosystem — open-source software for buildings, civil infrastructure (GWW) and civil engineering.
