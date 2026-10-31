# Open Infra Studio

> Open-source GIS plugin for Open CAD Studio. Sets the project location and coordinate system, then brings aerial photos, WMS/TMS underlays, WFS vector data, OpenStreetMap and Dutch base data from PDOK into the DWG. BGT, the cadastral map (BRK) and KLIC deliveries (IMKL 2.0) land on NLCS 5.02 layers with their source attributes as object data, through the official NLCS-BGT 5.0 mapping, and a drawing sheet with title block, legend, north arrow, scale bar and RD crosses is generated around the import area.

**Status:** beta
**License:** GPL-3.0-only
**Platforms:** Windows, Linux, macOS
**Category:** GIS
**Current version:** v2026.44.5 (2026-10-29)
**Tool ID:** `open-infra-studio`
**GitHub repo:** `OpenAEC-Foundation/Open-Infra`

## Live stats

- Stars: **0**
- Commits: **0**
- Forks: **0**
- Open issues: **0**
- Releases: **10**
- Total downloads: **3,108**
- Downloads by platform: Other (2954), Windows (139), Archive (15)

## Key features

- Project location by clicking the map or searching an address, place, parcel or coordinate pair (PDOK Locatieserver and Nominatim), stored in the drawing
- Aerial photos and maps as WMS/TMS underlays, with 19 server presets for the Netherlands, Flanders and worldwide plus your own servers
- WFS vector data with a chosen label attribute, colour and clipping to the import area
- OpenStreetMap themes worldwide: buildings, roads, rail, water, civil structures, land use, cables and pipelines, fences, house numbers
- PDOK in one click: aerial photo, cadastral map, AHN, BAG, parcels, NWB road sections, hectometre markers, ProRail tracks, waterways
- BGT: 42 PDOK collections, current objects only, mapped with the official NLCS-BGT 5.0 mapping (719 rules)
- Cadastral map (BRK): parcel boundaries and parcel numbers at their BRK rotation
- KLIC deliveries (the Kadaster zip or the area-information XML): 13 IMKL 2.0 themes, cables and pipes labelled per network operator with diameter and material
- NLCS 5.02 built in: 3,659 objects, 543 linetypes, 256 colours, layer styles per drawing status
- Object data: every entity keeps its source attributes
- NLCS drawing sheet: frame, title block with data sources, legend of the layers used, north arrow, scale bar and RD crosses, A3 to A0 chosen automatically
- 14 built-in coordinate systems, automatic UTM worldwide, any EPSG code
- 28 GIS commands for the ribbon, scripts and automation

## Tech stack

`Rust` · `egui` · `proj4rs`

## When to use this

Starting an infrastructure or civil drawing from the existing situation: the project location, aerial photos and maps as underlays, and the Dutch base registers (BGT, cadastre, KLIC) on NLCS layers with a finished drawing sheet. Outside the Netherlands, WMS, WFS, OpenStreetMap and any coordinate system. Conversion to RD New uses the 7-parameter transformation (about 0.2 m from RDNAPTRANS), so use data already supplied in RD for setting out. On macOS the ribbon buttons and commands work but the workbench window does not yet.

## Standards & integration

- NLCS 5.02
- BGT
- BRK
- KLIC / IMKL 2.0
- WMS
- WFS
- OGC API Features
- EPSG:28992
- DWG

## Download & links

- Product page: https://open-aec.com/open-infra-studio/
- GitHub repo: https://github.com/OpenAEC-Foundation/Open-Infra
- Latest stable release: https://github.com/OpenAEC-Foundation/Open-Infra-Studio/releases/tag/v2026.44.5

## Direct downloads (most popular)

- [Other · plugin.toml](https://github.com/OpenAEC-Foundation/Open-Infra-Studio/releases/download/v2026.43/plugin.toml) (v2026.43)
- [Other · plugin.toml](https://github.com/OpenAEC-Foundation/Open-Infra-Studio/releases/download/v0.2.0/plugin.toml) (v0.2.0)
- [Other · plugin.toml](https://github.com/OpenAEC-Foundation/Open-Infra-Studio/releases/download/v2026.44.2/plugin.toml) (v2026.44.2)
- [Other · plugin.toml](https://github.com/OpenAEC-Foundation/Open-Infra-Studio/releases/download/v0.2.1/plugin.toml) (v0.2.1)
- [Other · plugin.toml](https://github.com/OpenAEC-Foundation/Open-Infra-Studio/releases/download/v2026.44.1/plugin.toml) (v2026.44.1)
- [Other · plugin.toml](https://github.com/OpenAEC-Foundation/Open-Infra-Studio/releases/download/v2026.44/plugin.toml) (v2026.44)
- [Other · plugin.toml](https://github.com/OpenAEC-Foundation/Open-Infra-Studio/releases/download/v2026.44.3/plugin.toml) (v2026.44.3)
- [Other · plugin.toml](https://github.com/OpenAEC-Foundation/Open-Infra-Studio/releases/download/v2026.44.5/plugin.toml) (v2026.44.5)

---

Part of the [OpenAEC Foundation](https://open-aec.com/) ecosystem — open-source software for buildings, civil infrastructure (GWW) and civil engineering.
