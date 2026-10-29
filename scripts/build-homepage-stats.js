// scripts/build-homepage-stats.js
// Reads data/stats.json and updates index.html tool cards with current stats.
// This makes the stats STATIC in the HTML (instant load, no fetch).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const stats = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'stats.json'), 'utf8'));
const indexPath = path.join(ROOT, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Build repo lookup
const repoMap = {};
stats.repos.forEach(r => { repoMap[r.name.toLowerCase()] = r; });

// Downloads per repo (data/downloads.json, without update checks and checksums)
const downloadsPath = path.join(ROOT, 'data', 'downloads.json');
const downloadMap = {};
if (fs.existsSync(downloadsPath)) {
  const dl = JSON.parse(fs.readFileSync(downloadsPath, 'utf8'));
  (dl.rankedByDownloads || []).forEach(r => { downloadMap[r.repo.toLowerCase()] = r.downloads; });
}

function formatVersion(tag) {
  if (!tag) return null;
  const m = tag.match(/v?(\d+)\.(\d+)/);
  return m ? `v${m[1]}.${m[2]}` : tag;
}

const ICON_COMMIT = '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="3"/></svg>';
const ICON_VERSION = '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h4l1 1v4l-1 1H2L1 7V3l1-1zm7 7h4l1 1v4l-1 1H9l-1-1v-4l1-1z"/></svg>';
const ICON_STAR = '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg>';
const ICON_DOWNLOAD = '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M7.25 1.75a.75.75 0 011.5 0v6.69l2.22-2.22a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06l2.22 2.22V1.75zM2.75 12.5a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H2.75z"/></svg>';
const ICON_DATE = '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4 1.5a.5.5 0 011 0V2h6v-.5a.5.5 0 011 0V2h1a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1h1v-.5zM2 5v9h12V5H2z"/></svg>';

// Format date: "2026-05-19" -> "19 mei 2026" (NL) / "19 May 2026" (EN)
const MONTHS_NL = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatDate(iso, months) {
  if (!iso) return null;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return `${parseInt(m[3], 10)} ${months[parseInt(m[2], 10) - 1]} ${m[1]}`;
}

// "33760" -> "33.760" (NL) / "33,760" (EN); bilingual via the .lang-nl/.lang-en spans
function downloadsChip(count) {
  const nl = count.toLocaleString('nl-NL');
  const en = count.toLocaleString('en-US');
  return `<span class="tool-stat" data-stat="downloads" title="Downloads" data-i18n="tools.downloadsTitle" data-i18n-attr="title">` +
    `${ICON_DOWNLOAD} <span class="lang-nl">${nl}</span><span class="lang-en">${en}</span> downloads</span>`;
}

function buildStatsHtml(repo, downloads) {
  const parts = [];
  if (downloads > 0) parts.push(downloadsChip(downloads));
  if (repo.commits != null && repo.commits > 0) {
    parts.push(`<span class="tool-stat">${ICON_COMMIT} ${repo.commits} commits</span>`);
  }
  const ver = formatVersion(repo.latestRelease);
  if (ver) {
    parts.push(`<span class="tool-stat">${ICON_VERSION} ${ver}</span>`);
  }
  if (repo.stars != null && repo.stars > 0) {
    parts.push(`<span class="tool-stat">${ICON_STAR} ${repo.stars}</span>`);
  }
  const updatedNl = formatDate(repo.updatedAt, MONTHS_NL);
  const updatedEn = formatDate(repo.updatedAt, MONTHS_EN);
  if (updatedNl) {
    // Bilingual date spans toggled by CSS based on `html[lang]` attribute.
    // Title attr is i18n'd via data-i18n-attr so it switches with the language.
    parts.push(
      `<span class="tool-stat" title="Laatst gewijzigd op GitHub" data-i18n="tools.lastModified" data-i18n-attr="title">` +
      `${ICON_DATE} <span class="lang-nl">${updatedNl}</span><span class="lang-en">${updatedEn}</span>` +
      `</span>`
    );
  }
  return parts.length > 0
    ? `<div class="tool-stats">\n              ${parts.join('\n              ')}\n            </div>`
    : '';
}

let updates = 0;

// Find each <article class="tool-card" data-repo="..."> and inject/replace tool-stats
// We use a regex that matches the entire article block from <article ...> to </article>
const articleRegex = /<article class="tool-card"([^>]*?)data-repo="([^"]+)"([^>]*)>([\s\S]*?)<\/article>/g;

html = html.replace(articleRegex, (match, before, repoName, after, inner) => {
  // Open CAD Studio is an external repo whose card updates itself live in the
  // browser (data-ocs-* + fetch). Leave it untouched so we don't wipe those.
  const repo = repoMap[repoName.toLowerCase()];
  if (!repo) return match;

  const newStatsHtml = buildStatsHtml(repo, downloadMap[repoName.toLowerCase()] || 0);

  // Remove any existing <div class="tool-stats">...</div> block within this article
  let newInner = inner.replace(/<div class="tool-stats">[\s\S]*?<\/div>\s*/g, '');

  if (newStatsHtml) {
    // Insert the new stats block right after the description <p ...>...</p>
    const pMatch = newInner.match(/(<p[^>]*data-i18n="tools\.items\.[^"]+\.desc"[^>]*>[\s\S]*?<\/p>)/);
    if (pMatch) {
      newInner = newInner.replace(pMatch[1], pMatch[1] + '\n            ' + newStatsHtml);
      updates++;
    } else {
      // Fallback: insert before the closing </div> of the inner content wrapper
      const lastDivMatch = newInner.match(/(<\/p>)([^<]*<div class="tool-links">)/);
      if (lastDivMatch) {
        newInner = newInner.replace(lastDivMatch[0], lastDivMatch[1] + '\n            ' + newStatsHtml + '\n          </div>\n          ' + lastDivMatch[2].trim());
      }
    }
  }

  return `<article class="tool-card"${before}data-repo="${repoName}"${after}>${newInner}</article>`;
});

// Open CAD Studio (class "tool-card tool-card-featured", so not matched above)
// updates its own chips live in the browser; only its downloads chip is
// maintained here.
html = html.replace(/(<article class="tool-card[^"]*"[^>]*data-repo="OpenCADStudio"[^>]*>)([\s\S]*?)(<\/article>)/, (match, open, inner, close) => {
  const count = downloadMap['opencadstudio'];
  if (!count) return match;
  const cleaned = inner.replace(/\s*<span class="tool-stat" data-stat="downloads"[\s\S]*?<\/span> downloads<\/span>/, '');
  updates++;
  return open + cleaned.replace(/(<div class="tool-stats">)/, `$1
              ${downloadsChip(count)}`) + close;
});

// ─── Foundation-wide totals (e.g. CTA "⭐ 416 stars across 52 repos") ────
// Update any <... data-gh-stars>NNN</...> and <... data-gh-repos>NNN</...>
// elements with the current totals from stats.summary.
const totalStars = stats.summary?.totalStars;
const publicRepos = stats.summary?.publicRepos;
let totalsUpdates = 0;
if (totalStars != null) {
  // Replace the inner text of any tag that carries `data-gh-stars` (single line, no nested tags expected)
  html = html.replace(/(<([a-z]+)([^>]*\sdata-gh-stars\b[^>]*)>)([^<]*)(<\/\2>)/gi, (m, open, tag, attrs, inner, close) => {
    if (inner.trim() === String(totalStars)) return m;
    totalsUpdates++;
    return `${open}${totalStars}${close}`;
  });
}
if (publicRepos != null) {
  html = html.replace(/(<([a-z]+)([^>]*\sdata-gh-repos\b[^>]*)>)([^<]*)(<\/\2>)/gi, (m, open, tag, attrs, inner, close) => {
    if (inner.trim() === String(publicRepos)) return m;
    totalsUpdates++;
    return `${open}${publicRepos}${close}`;
  });
}

fs.writeFileSync(indexPath, html);
console.log(`Updated ${updates} tool cards with current GitHub stats`);
if (totalsUpdates > 0) {
  console.log(`Updated ${totalsUpdates} foundation-wide totals (stars=${totalStars}, repos=${publicRepos})`);
}
console.log(`Stats source: ${stats.generated}`);
