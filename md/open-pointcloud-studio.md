# Open Pointcloud Studio

> Desktop application for viewing, measuring, editing and converting laser scans and other point clouds, and for turning them into section drawings, meshes and the flat faces of a building. Runs on Windows, macOS and Linux, is written in Rust and needs no browser or web view.

**Status:** beta
**License:** GPL-3.0-only (application), LGPL-3.0-or-later (point-cloud library)
**Platforms:** Windows, macOS, Linux
**Category:** Reality Capture
**Current version:** v0.8.0 (2026-10-03)
**Tool ID:** `open-pointcloud-studio`
**GitHub repo:** `OpenAEC-Foundation/open-pointcloud-studio`

## Live stats

- Stars: **12**
- Commits: **200**
- Forks: **2**
- Open issues: **15**
- Releases: **9**
- Total downloads: **461**
- Downloads by platform: Windows (246), Linux (AppImage) (49), Archive (39), macOS (39), Windows (MSI) (33), Linux (deb) (29), Other (26)

## Key features

- Opens point clouds in LAS, LAZ, E57, PLY, PCD, PTX, PTS and text formats, and meshes in OBJ, PLY, OFF and STL
- Opens a whole scan project at once: a folder of scans, or the scans that a scan project file (.rcp) lists
- Large files stay usable while they open: LAS and LAZ open from their header, an E57 file of 512 MiB or more first shows a sample spread through the file when its layout allows that
- An octree index on disk supplies the detail for the current camera, up to a point budget of at most ten million points; built automatically from one million points; the points on screen stay while the camera moves
- Four colour modes (stored colour, elevation, intensity, classification), eye-dome lighting, classes shown or hidden one by one
- Section box with six draggable faces that limits what is shown, selected, meshed and searched for faces; its content can be exported on its own or drawn as a 2D drawing; aligned to the axes of the scan
- Measuring: distance along a polyline (segments, total, horizontal length, height difference) and area of a polygon in its own plane
- Saved views with notes and arrows, exported as one BCF 2.1 file with camera, clipping planes and a picture each
- Scanner stations of E57, PCD and PTX scans, station photos to stand in and look around, walking with W A S D
- Box selection and point picking, delete with undo and redo, thin, move and scale; the source file is never changed
- Export of the whole cloud, the selection, the section box or every Nth point as LAS, LAZ, E57, PLY, XYZ, PTS or CSV; merging of visible LAS and LAZ scans
- Terrain mesh and 3D surface (not watertight); any mesh, whether made here, opened from a file or downloaded from the 3D BAG, saved as OBJ, binary PLY or binary STL, with open edges and connected parts reported
- Section drawing: a 2D drawing at scale 1:1 of what the section box cuts, a plan or a vertical section, saved as DXF or DWG (file version R2004, R2010, R2013 or R2018); a filled cut draws the walls, columns and floors that are cut as filled regions with outlines, with a preview before a file is saved
- Closed mesh: a surface without overlaps from every point of a region, closed where the scan has points or a gap narrower than the hole limit, with door and window openings left open; reports the mean, 95% and largest distance between the points and the mesh; a mesh holds at most 4,000,000 vertices and 8,000,000 triangles
- Detected faces: the flat faces (floors, ceilings, walls, sloped planes) and the round columns and pipes of a region; a flat face is a plane with its outline, a column or pipe a cylinder without an outline, each with its area and the residual of its points; exported as JSON or as OBJ with a group per face
- 3D BAG building models of the Netherlands for an area in RD New coordinates, at most 2 by 2 km and about 5,000 buildings per download
- Local command API on the loopback address and an MCP server (open-pointcloud-studio --mcp)
- Command-line modes without a window: converting a scan, exporting the points inside a box, merging scans, building an index, drawing a section as DXF or DWG, making meshes and detecting faces
- Interface in Dutch and English

## Tech stack

`Rust` · `iced` · `wgpu`

## When to use this

Opening and inspecting laser scans and whole scan projects, cutting floor plans and sections with the section box and saving them as 2D drawings in DXF or DWG, measuring distances and areas, handing over viewpoints with notes as BCF, converting between point-cloud formats, making meshes from scans, and finding the planes and cylinders of a room. The filled cut, the closed mesh and the detected faces were measured on generated rooms, not yet on a scan of a real building.

## Standards & integration

- LAS
- LAZ
- E57
- PLY
- PCD
- PTX
- DXF
- DWG
- BCF 2.1
- MCP

## Download & links

- Product page: https://open-aec.com/open-pointcloud-studio/
- GitHub repo: https://github.com/OpenAEC-Foundation/open-pointcloud-studio
- Latest stable release: https://github.com/OpenAEC-Foundation/open-pointcloud-studio/releases/tag/v0.8.0

## Direct downloads (current release)

- [Linux (AppImage) · open-pointcloud-studio_0.8.0_amd64.AppImage](https://github.com/OpenAEC-Foundation/open-pointcloud-studio/releases/download/v0.8.0/open-pointcloud-studio_0.8.0_amd64.AppImage) (v0.8.0 — 15.7 MB)
- [Linux (deb) · open-pointcloud-studio_0.8.0_amd64.deb](https://github.com/OpenAEC-Foundation/open-pointcloud-studio/releases/download/v0.8.0/open-pointcloud-studio_0.8.0_amd64.deb) (v0.8.0 — 11.2 MB)
- [Linux (AppImage), 64-bit ARM, experimental · open-pointcloud-studio_0.8.0_arm64.AppImage](https://github.com/OpenAEC-Foundation/open-pointcloud-studio/releases/download/v0.8.0/open-pointcloud-studio_0.8.0_arm64.AppImage) (v0.8.0 — 15.8 MB)
- [Linux (deb), 64-bit ARM, experimental · open-pointcloud-studio_0.8.0_arm64.deb](https://github.com/OpenAEC-Foundation/open-pointcloud-studio/releases/download/v0.8.0/open-pointcloud-studio_0.8.0_arm64.deb) (v0.8.0 — 10.1 MB)
- [Archive · open-pointcloud-studio_0.8.0_linux-amd64.tar.gz](https://github.com/OpenAEC-Foundation/open-pointcloud-studio/releases/download/v0.8.0/open-pointcloud-studio_0.8.0_linux-amd64.tar.gz) (v0.8.0 — 16.4 MB)
- [Archive, 64-bit ARM, experimental · open-pointcloud-studio_0.8.0_linux-arm64.tar.gz](https://github.com/OpenAEC-Foundation/open-pointcloud-studio/releases/download/v0.8.0/open-pointcloud-studio_0.8.0_linux-arm64.tar.gz) (v0.8.0 — 16.6 MB)
- [macOS · open-pointcloud-studio_0.8.0_macos-universal.dmg](https://github.com/OpenAEC-Foundation/open-pointcloud-studio/releases/download/v0.8.0/open-pointcloud-studio_0.8.0_macos-universal.dmg) (v0.8.0 — 28.5 MB)
- [Archive · open-pointcloud-studio_0.8.0_macos-universal.tar.gz](https://github.com/OpenAEC-Foundation/open-pointcloud-studio/releases/download/v0.8.0/open-pointcloud-studio_0.8.0_macos-universal.tar.gz) (v0.8.0 — 25.1 MB)
- [Windows · open-pointcloud-studio_0.8.0_windows-x64.zip](https://github.com/OpenAEC-Foundation/open-pointcloud-studio/releases/download/v0.8.0/open-pointcloud-studio_0.8.0_windows-x64.zip) (v0.8.0 — 12.2 MB)
- [Windows · open-pointcloud-studio_0.8.0_x64-setup.exe](https://github.com/OpenAEC-Foundation/open-pointcloud-studio/releases/download/v0.8.0/open-pointcloud-studio_0.8.0_x64-setup.exe) (v0.8.0 — 10.3 MB)

---

Part of the [OpenAEC Foundation](https://open-aec.com/) ecosystem — open-source software for buildings, civil infrastructure (GWW) and civil engineering.
