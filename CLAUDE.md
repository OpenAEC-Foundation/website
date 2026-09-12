# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The OpenAEC Foundation website (https://open-aec.com) — ~47 pages of hand-written static HTML/CSS/JS. **No build step, no `package.json`, no framework, no bundler.** Node is used only for a set of generator scripts under `scripts/`. Deploy is rsync to `/var/www/open-aec.com` on push to `main` (`.github/workflows/deploy.yml`). Everything generated is committed — `.gitignore` contains only `.worktrees/`.

`README.md` is badly stale (says 16 repos, NL/EN only, GitHub Pages). Do not trust it as a spec.

## Commands

Serve locally (the `.claude/launch.json` entry is named `website`, `npx serve` on port 4500):

```bash
npx serve
```

Refresh all GitHub-derived data (stats, news, downloads, homepage chips, api, md mirrors) and commit:

```bash
node scripts/update-website.js
```

Add `--no-commit` to skip the commit. Requires `GITHUB_TOKEN` in the environment (60 vs 5000 req/h). The 7 steps and their read/write dependencies are documented in `.claude/skills/update-website/SKILL.md` — run them individually only in that order.

### Tests

There is no test runner. The two checker scripts are the only tests and are **not wired into CI** — run them by hand after touching the homepage, a product page, or the generators:

```bash
node scripts/check-open-pile-plan-studio.js && node scripts/check-homepage-catalog-product-pages.js
```

They use `node:assert/strict` and fail with a Dutch message. `check-open-pile-plan-studio.js` doubles as the executable checklist for adding a new tool (see below). `check-homepage-catalog-product-pages.js` pins several literal CSS colour values in `bim-validator/index.html` and the exact screenshot order in Open Speech Studio — those assertions are deliberate, not accidental.

## Architecture

### Two name spaces per tool

Every tool has a **page slug** and a **GitHub repo name**, and they usually differ (`open-pile-plan-studio` vs `pile-plan-studio`). Slug is used for the directory, `meta[name=i18n-page]`, `shared/translations/*`, `md/*.md`, and the `id` in `api/tools.json`. Repo name is used for `data-repo`, `data-release-notes`, `data/release-notes/*.json`, and the repo lists inside the generator scripts. `build-homepage-stats.js` lowercases repo names when matching; everything else preserves casing.

### i18n — two separate engines

Four languages: **nl (default, the literal HTML text), en, fr, tr**. Preference in `localStorage` under `openaec-lang`. Language is client-side only — there are no per-language URLs and no `hreflang` anywhere.

- **Subpages** use `shared/i18n.js`. A page declares `<meta name="i18n-page" content="<slug>">`; translations load from `/shared/translations/<slug>.json` (EN) and `<slug>.fr.json` / `<slug>.tr.json` (with EN fallback). Nodes carry `data-i18n="dotted.key"`, attributes use `data-i18n-attr`. NL originals are cached into `data-i18n-nl` on first switch. Without the meta tag only inline-attribute translation runs.
- **The homepage does not use it.** `index.html` has a self-contained inline `const translations = { nl, en, fr, tr }` (~line 1686) plus its own `detectLang()`/`i18n` object. Adding a tool means adding `tools.items.<camelKey>` to **all four** objects — the pile-plan checker asserts exactly 4 occurrences of the key.
- Nav links use inline `data-i18n-en` / `-fr` / `-tr` attributes in `shared/nav.html`, not JSON.

`shared/nav.js` fetches and injects `shared/nav.html` into `#shared-nav` (auto-creating the placeholder if absent), then dispatches a `nav:loaded` CustomEvent; `shared/i18n.js` listens for it to translate the late-injected nav. There is no MutationObserver — deliberately.

### Product page skeleton

`<tool-slug>/index.html`, `<html lang="nl">`, head order: charset → viewport → title → description → `meta name="i18n-page"` → favicon → `/shared/style.css` → inline `SoftwareApplication` JSON-LD → page-local `<style>` block. Body: `#shared-nav` + `nav.js` → `.page-header` → `.section` blocks → `<div data-release-notes="<repo-name>">` + `release-notes.js` → `.footer.page-footer` → page scripts → **`shared/i18n.js` last**.

Shared scripts are loaded with a uniform cache-bust query `?v=20260603` across all pages. Bump it everywhere or nowhere.

**Canonical host is the apex `https://open-aec.com`** — not `www`. Every page carries `<link rel="canonical">`, a full Open Graph + Twitter block, and the `rel="alternate"` pair pointing at `/llms.txt` and `/api/tools.json`, injected directly after the `<meta name="description">`. Keep that block when editing a head; a new page must get one too. `og:image` must be a raster (PNG/JPEG ≥1200×630) — LinkedIn, X, Slack and WhatsApp all reject SVG. Pages with no screenshot omit `og:image` and use `twitter:card: summary` instead of `summary_large_image`.

Note the apex/www duplication is only half-fixed in this repo: both hosts still serve HTTP 200 from the same nginx. The 301 from `www` to apex lives in the server config, outside this repo.

There is still no `hreflang` anywhere — language is a client-side toggle with no per-language URLs, so only the Dutch text is crawlable.

### Homepage tool cards

`<article class="tool-card" data-repo="…" data-categories="A|E|C|I">` in `index.html`. The `<div class="tool-stats">` chips are **generated** — `build-homepage-stats.js` regex-matches each card and re-inserts the block immediately after the `<p data-i18n="tools.items.*.desc">`, so that `<p>` and its exact attribute must survive any edit. Never hand-edit `tool-stats`. `data-repo="OpenCADStudio"` is deliberately skipped (that card self-updates in the browser). Stat chips are bilingual via CSS (`.lang-nl` / `.lang-en`), not JS.

### Generated vs hand-written

Generated (committed, never hand-edit): `data/stats.json`, `data/news.json`, `data/downloads.json`, `data/download-trends.json`, `data/release-notes/*`, `data/history*/`, `api/tools.json`, `md/*`, and the `tool-stats` chips inside `index.html`.

Hand-written: `llms.txt` (an *input* to `build-markdown-mirrors.js`), `robots.txt`, `sitemap.xml` (adding a page means adding a `<url>` entry manually — the checker enforces it), `data/manual-news.json`, and the `TOOLS` array in `build-tools-api.js`.

News feed: `nieuws/index.html` merges `manual-news.json` (editorial, NL fields plus `_en`/`_fr`/`_tr` suffixed variants) ahead of the generated `news.json`, and filters out anything matching `/nightly/i`. Long-form articles live at `nieuws/<slug>/index.html` with `NewsArticle` JSON-LD; nothing links them into the feed automatically — add a `manual-news.json` entry pointing at the path.

### Design system

`shared/style.css` defines the tokens — use them rather than raw hex for anything brand-related: `--amber #D97706`, `--deep-forge #36363E`, `--signal-orange #EA580C`, `--warm-gold #F59E0B`, `--blueprint-white #FAFAF9`, `--concrete`, `--night-build`, `--success/--error/--info`; `--font-heading` (Space Grotesk) / `--font-body` (Inter) / `--font-code` (JetBrains Mono); `--sp-1…--sp-24`; `--radius-sm/md/lg/full`; `--shadow-sm/md/lg`; `--gradient-accent` (applied as `border-image: var(--gradient-accent) 1` for the 3px accent rule). House classes: `.section-label`, `.btn` + `.btn-primary/-secondary/-ghost/-dark`, `.card`, `.badge`, `.container`, `.section`/`.section-alt`/`.section-dark`, `.grid-2/-3/-4`. One breakpoint: `@media (max-width: 768px)`.

## Adding a new tool

`scripts/check-open-pile-plan-studio.js` is the definitive checklist. All of these must be touched:

1. `<tool-slug>/index.html` product page
2. `index.html`: tool card with `data-repo`, product-page link, live-demo link, Schema.org `name`, and the `tools.items.<key>` entry in **all four** language objects
3. `shared/translations/<slug>.json` + `.fr.json` + `.tr.json` (all must parse)
4. `sitemap.xml` entry
5. Repo name added to `scripts/generate-downloads.js` and `scripts/generate-release-notes.js`
6. `data/release-notes/<repo>.json` (may be empty)
7. `id: '<slug>'` in `scripts/build-tools-api.js` and `scripts/build-markdown-mirrors.js`
8. `'<repo>':` in the `CATS` map of `scripts/add-category-tags.js` (a one-off maintenance script, not part of the update pipeline)
9. Regenerate so `api/tools.json`, `md/<slug>.md` and `md/index.json` pick it up

When changing a tool description, update **all four** locations: the `<p data-i18n>` in the HTML body, the NL translation object, the EN translation object, and the Schema.org JSON-LD.

Removing a tool from the homepage ≠ deleting it. `open-energy-studio`, `open-2d-studio`, `openaec-cloud`, `openaec-docs` are retired from the catalog but keep their product pages and `api/tools.json` entries — the checker enforces exactly that.

## Notes

- `docs/superpowers/specs/` and `docs/superpowers/plans/` hold the design docs for recent features; read the matching one before changing anything the checkers guard.
- `openaec-website.jsx` is an unused React prototype, excluded from deploy. `PROMPTS.md` is a chronological log of user prompts, not documentation.
- `open-calculations-studio/` and `open-calc-studio/` are two different tools.
- Content is Dutch-first; commit messages in this repo are English Conventional Commits.
