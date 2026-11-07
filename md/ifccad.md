# IFCCAD

> Experimental open CAD drawing profile using IFCX, with a native source alpha, nine dimension kinds, polyline widths and extrusion thickness. The Explorer opens IFCX in Open CAD Studio and exchanges supported DWG/DXF content.

**Status:** in development
**License:** MPL-2.0
**Platforms:** Web
**Category:** CAD Format
**Current version:** v2026.45.2 (2026-11-06)
**Tool ID:** `ifccad`
**GitHub repo:** `OpenAEC-Foundation/ifccad`

## Live stats

- Stars: **19**
- Commits: **287**
- Forks: **1**
- Open issues: **12**
- Releases: **5**
- Total downloads: **17**
- Downloads by platform: Other (10), Archive (7)

## Key features

- Native source alpha with schemas, examples and strict validation; no general alpha file-compatibility guarantee
- Nine ordinary dimension kinds with optional stored graphics, planar polyline widths, primitive extrusion thickness and native SOLID/TRACE
- Solid, line-pattern and gradient Hatch storage with classic editing and boundary records
- Explorer opens the actual IFCX snapshot in Open CAD Studio and offers supported DWG/DXF exchange
- Experimental CBOR and CBOR + Zstd store the typed drawing projection, not arbitrary IFCX information
- Additional native entity families and associative BIM regeneration remain development goals

## Tech stack

`Rust` · `WebAssembly` · `JavaScript`

## When to use this

Exploring an open alternative to DWG, inspecting IFCCAD drawings and testing supported conversion routes. Experimental; complete round trips and associative BIM regeneration are not yet guaranteed.

## Standards & integration

- IFCX
- DWG
- DXF

All OpenAEC tools exchange data via the open **IFCX** format (based on IFC 4.3).

## Download & links

- Product page: https://open-aec.com/ifccad/
- Live demo: https://ifccad-explorer.open-aec.com
- GitHub repo: https://github.com/OpenAEC-Foundation/ifccad
- Latest release: https://github.com/OpenAEC-Foundation/ifccad/releases/tag/v2026.45.2

## Direct downloads (current release)

- [Other · ifccad-2026.45.2-native.crate](https://github.com/OpenAEC-Foundation/ifccad/releases/download/v2026.45.2/ifccad-2026.45.2-native.crate) (v2026.45.2 — 0.7 MB)
- [Archive · ifccad-2026.45.2-native.tar.gz](https://github.com/OpenAEC-Foundation/ifccad/releases/download/v2026.45.2/ifccad-2026.45.2-native.tar.gz) (v2026.45.2 — 0.7 MB)
- [Other · SHA256SUMS](https://github.com/OpenAEC-Foundation/ifccad/releases/download/v2026.45.2/SHA256SUMS) (v2026.45.2)

---

Part of the [OpenAEC Foundation](https://open-aec.com/) ecosystem — open-source software for buildings, civil infrastructure (GWW) and civil engineering. All tools communicate through **IFCX**.
