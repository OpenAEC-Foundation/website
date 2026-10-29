# Open 3D Viewer Studio product page

Content and image evidence checked on 29 October 2026. This is website work only;
no viewer source or format-reader crates are changed by this PR.

## Activation and publication

The existing `/open-3d-viewer/` page is already present in the homepage catalog,
shared footer and sitemap, including EN/FR/TR/ES URLs. There is no separate page
activation flag in the current website source. The update retains that route,
shared navigation, consent-based analytics and the existing design system.

The curated API generator omitted this viewer even though the Markdown mirror
already contained it. The viewer is now included in the API generator, and both
catalog sources describe the Rust application and its platform limitations.

Pushing this branch does not deploy. `.github/workflows/deploy.yml` deploys on
push to `main` or manual dispatch. Do not merge merely to share a preview.

## Feature evidence

Reference source: `OpenAEC-Foundation/open-3d-viewer`, UI PR #15, revision
`d8a78c24cf4086281998d7c92252e0b366c8b6cb`, based on format-reader PR #13.
These PRs are still open. The page explicitly labels the product beta and the
images as development-build captures.

- README, `src/loaders/` and the loader registry: Revit RVT/RFA and IFC import
  are desktop-only; SKP is partial, Tekla DB1 is beta and version dependent;
  glTF/GLB, OBJ, STL and PLY with faces are available. Browser glTF requires
  embedded buffers. Texture mapping is incomplete.
- `src/app.rs`, `src/shell.rs`, `src/remote.rs`: orbit/pan/zoom, views,
  perspective/orthographic projection, element properties, layer visibility,
  solid/wireframe/edges, section box/plane, measurement and explode.
- README and `src/export/`: IFC 4 export uses triangulated geometry and
  available element data, not a complete native-model roundtrip.
- README license section: LGPL-3.0-or-later viewer; standard desktop packages
  additionally contain a proprietary Revit reader. No claim that the entire
  desktop package is open source.
- Removed unsupported claims: WebGL/three.js, STEP, FBX, DWG/DXF, point clouds,
  points and hidden-line display modes, and more than twenty formats.

## Images

Images are genuine application captures. No generated product mockups, model
files, profile catalogues, credentials or binary application builds are committed.

- `open-3d-viewer-house.png`: real-window capture of the Revit sample house in
  desktop build 2026.44.12, 23 layers and 206,763 loaded triangles. Site,
  topography, planting and entourage are hidden and the camera frames the house.
  The file was opened using a neutral relative filename so no personal folder
  path is shown. Captured through the app's documented screenshot API.
- `open-3d-viewer-section-measure.png`: same real window and model, with the
  section box clipping the roof/upper level and a distance of 4.541 m between
  two chosen model coordinates. Both operations returned successful results
  through the app API and were visually checked. Explode was separately checked
  with a genuine headless `--explode 0,0,30 --explode-mode storeys` capture.
- `open-3d-viewer-tekla.png`: viewport captured through the viewer's documented
  local remote API, using the existing separately validated Tekla desktop build.
  A real DB1 9.08 model plus its sibling profile catalogue produced 803 elements,
  8 layers and 35,768 triangles. The website caption explicitly marks this beta
  geometry as incomplete. No file name or personal folder is visible.

The compact-ribbon Windows build from UI PR #15 was still compiling during
initial page preparation. The Revit images above show the earlier real UI;
they do not claim to show the new ribbon. Replace them with verified captures
after the final UI build has passed visual review. The Tekla image also requires
the separately validated reader work; it is not evidence that every released
viewer can open DB1 9.08.

## Video follow-up

There is no empty player or fabricated demo link. The page reserves an editorial
section for the later 40–60 second recording: Revit house, Tekla overview,
selection/properties, section box, distance measurement, final overview. Capture
the final reviewed UI and use the verified Tekla model. Review the resulting
video and poster before adding a `<video controls preload="metadata">` element.

## Validation

Run the repository's catalog, release, direct-download and SEO checks. The
existing Pile Plan checker currently expects `v2026.43.2` in an unchanged product
page that no longer contains it. Record this baseline failure separately.
Check product copy and images in all five languages, and confirm that the format
table scrolls inside its container on narrow screens without widening the page.
