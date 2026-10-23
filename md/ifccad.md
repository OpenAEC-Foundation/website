# IFCCAD

> An open CAD drawing format based on IFCX. Usable on its own, with development towards reliable DWG/DXF exchange and future BIM integration.

**Status:** in development
**License:** MPL-2.0
**Platforms:** Web
**Category:** CAD Format
**Current version:** n/a
**Tool ID:** `ifccad`
**GitHub repo:** `OpenAEC-Foundation/ifccad`

## Live stats

- Stars: **14**
- Commits: **245**
- Forks: **1**
- Open issues: **12**
- Releases: **0**
- Total downloads: **0**

## Key features

- Open, standalone CAD drawing profile using IFCX; no BIM model required
- Format Explorer for inspecting drawing structure and trying DWG/DXF conversion
- Development towards faithful round trips, with explicit conversion diagnostics and a bounded preservation pilot
- BIM integration and associative regeneration remain development goals

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
- Latest stable release: https://github.com/OpenAEC-Foundation/ifccad/releases

---

Part of the [OpenAEC Foundation](https://open-aec.com/) ecosystem — open-source software for buildings, civil infrastructure (GWW) and civil engineering. All tools communicate through **IFCX**.
