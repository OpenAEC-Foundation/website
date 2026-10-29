# Open 3D Viewer Studio

> Explore 3D and BIM models with selection, properties, layers, sections and measurement. Revit and IFC import are desktop-only. Screenshots show a development build.

**Status:** beta
**License:** LGPL-3.0-or-later viewer; proprietary Revit reader in standard desktop builds
**Platforms:** Windows, Linux, macOS, Web (WebGPU; limited import)
**Category:** BIM Viewer
**Current version:** n/a
**Tool ID:** `open-3d-viewer`

## Key features

- Orbit, pan, zoom; standard views and perspective or orthographic projection
- Element selection, available properties and layer visibility
- Solid, wireframe and edges render modes
- Section box and section plane with cut fills
- Distance, angle, polygon and area measurement
- Explode by storey or element
- IFC 4 export with triangulated geometry and available element data; not a full native roundtrip
- Desktop imports: Revit RVT/RFA, IFC, partial SketchUp SKP, beta Tekla DB1, glTF/GLB, OBJ, STL and face-based PLY
- Web imports exclude Revit and IFC; glTF needs embedded buffers
- SKP is partial; Tekla geometry and database-version support are incomplete
- No STEP, DWG/DXF, FBX, point clouds or full texture rendering

## Tech stack

`Rust` · `iced 0.14` · `wgpu` · `WebAssembly`

## When to use this

Inspect model geometry and available element data, cut sections and take measurements. Use desktop for Revit or IFC.

## Alternative to

- Autodesk Viewer
- BIMvision

## Standards & integration

- IFC 4 export

## Download & links

- Product page: https://open-aec.com/open-3d-viewer/
- Live demo: https://open-3d-viewer.open-aec.com/

---

Part of the [OpenAEC Foundation](https://open-aec.com/) ecosystem — open-source software for buildings, civil infrastructure (GWW) and civil engineering.
