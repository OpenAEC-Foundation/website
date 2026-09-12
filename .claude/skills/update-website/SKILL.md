---
name: update-website
description: Use when the user asks to "update the website", "refresh stats", "update news/stars/downloads", or any variation that requests a full refresh of GitHub-derived data on the OpenAEC website. Runs all generator scripts in the correct order, then commits.
---

# OpenAEC Website — Full Refresh Procedure

## When to invoke

Triggers (NL or EN):
- "Update de website"
- "Update statistieken / nieuws / stars / downloads"
- "Refresh stats"
- "Run de updates"
- "Trigger de daily update lokaal"

## What it does

Mirrors the daily GitHub Action (`.github/workflows/update-stats.yml`) but runs locally so changes appear instantly on disk and the user can review before pushing.

## Procedure

### One-command path (preferred)

```bash
node scripts/update-website.js
```

This runs all 7 steps below in order and creates a local commit. To skip the commit:

```bash
node scripts/update-website.js --no-commit
```

### Manual path (if a single step needs re-running)

Run in this exact order — later scripts depend on outputs of earlier ones:

| # | Script | Reads | Writes | Purpose |
|---|--------|-------|--------|---------|
| 1 | `node scripts/generate-stats.js` | GitHub API | `data/stats.json` | Per-repo stars, commits, contributors, latest release |
| 2 | `node scripts/generate-release-notes.js` | GitHub API | `data/news.json` (partial) | Release notes feed for /nieuws/ |
| 2b | `node scripts/generate-release-highlights.js` | `https://open-planner-studio.open-aec.com/release-highlights.json` | `data/release-highlights/<repo>.json` | Redactionele koppen per release voor de releasetijdlijn; laat bij een netwerkfout de bestaande file staan |
| 3 | `node scripts/generate-downloads.js` | GitHub API | `data/downloads.json`, `data/history-downloads/YYYY-MM-DD.json` | Per-tool download totals + daily snapshot |
| 4 | `node scripts/compute-download-trends.js` | `data/history-downloads/` | `data/download-trends.json` | Weekly delta per tool |
| 5 | `node scripts/build-homepage-stats.js` | `data/stats.json` | `index.html` (mutated) | Injects tool-stats into each `<article class="tool-card" data-repo>` block |
| 6 | `node scripts/build-tools-api.js` | `data/stats.json`, `data/downloads.json` | `api/tools.json` | Machine-readable catalog |
| 7 | `node scripts/build-markdown-mirrors.js` | All HTML | `md/*.md` | Markdown mirrors at `/md/` for AI assistants |

### Required env

```bash
$env:GITHUB_TOKEN = "ghp_..."   # PowerShell
export GITHUB_TOKEN="ghp_..."   # bash
```

Without a token API calls are heavily rate-limited (60 req/h vs 5000 req/h).

## After running

1. **Verify the news page**: open `data/news.json` — confirm the top entries match today's expected GitHub activity (releases, commits on tracked repos).
2. **Verify the homepage**: each tool-card should show 3-4 stat chips (commits / version / stars / "Laatst gewijzigd"). The "Laatst gewijzigd" date should be in NL format (e.g. `19 mei 2026`).
3. **Spot-check `data/stats.json`** for the `generated` timestamp — should be within the last minute.
4. **Commit & push**:
   ```bash
   git add data/ index.html api/ md/
   git commit -m "chore: update statistics YYYY-MM-DD"
   git push
   ```

## Common edits that often pair with a refresh

When the user asks for a refresh they often also want content changes that the auto-update *won't* do:

- New tool added to homepage → manual `<article class="tool-card">` block + i18n entries in BOTH NL and EN translation objects (~lines 1490 and 1660 in `index.html`)
- Tool description change → edit `index.html` (HTML + NL i18n + EN i18n + Schema.org JSON-LD)
- Tool order change → move `<article>` blocks within `<div class="tools-grid">` (~line 750+)
- Tool tag change (Beta/Alpha/Beschikbaar/In ontwikkeling) → edit the `<span class="tool-tag">` chips next to the title

**Always update ALL 4 locations** when changing a tool description:
1. `<p data-i18n="tools.items.X.desc">` in HTML body
2. `items: { X: { desc: "..." } }` in NL translation object
3. `items: { X: { desc: "..." } }` in EN translation object
4. `"description": "..."` in Schema.org JSON-LD at top of file

## Troubleshooting

- **`GITHUB_TOKEN not set`**: API rate limit will hit ~60 calls. Set the token.
- **`build-homepage-stats.js` updated 0 cards**: a tool-card lost its `data-repo` attribute, or `data/stats.json` doesn't contain a repo with that name. Check `data-repo` casing — script lowercases for comparison.
- **News page missing recent entries**: re-run `generate-release-notes.js` and check the date filter inside the script (default: last 60 days).
- **Branch protection blocks push**: open a PR instead (the GitHub Action does this automatically).
