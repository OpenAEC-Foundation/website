#!/usr/bin/env node
// scripts/add-category-tags.js
// Adds data-categories="..." attribute + visible <div class="tool-cats">
// chip block to each tool-card on the homepage. Idempotent.

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(file, 'utf8');

// Category mapping per data-repo key (lowercased).
// A=Architecture, E=Engineering, C=Construction, I=Infra & GWW
const CATS = {
  // IFCX card has no data-repo — handled separately below
  'open-pdf-studio':            ['A','E','C','I'],
  'open-calc-studio':           ['C','I'],
  'open-heatloss-studio':       ['E'],
  'open-geotechniek-studio':    ['E','I'],
  'pile-plan-studio':           ['E','I'],
  'open-speech-studio':         ['A','E','C','I'],
  'open-books':                 ['A'],
  'y-app':                      ['A','E','C','I'],
  'monty-ifc-viewer':           ['C'],
  'open-calculations-studio':   ['E','I'],
  'open-field-studio':          ['C'],
  'open-2d-studio':             ['A','E'],
  'opencadstudio':              ['A','E','C'],
  'open-energy-studio':         ['E'],
  'open-planner-studio':        ['A','C','I'],
  'open-pointcloud-studio':     ['E','C','I'],
  'openaec-bim-validator':      ['E','C'],
  'openaec-docs':               ['A','E','C','I'],
  'openaec-cloud':              ['A','E','C','I'],
  'openaec-bcf-platform':       ['E','C'],
  'open-frame-studio':          ['E','I'],
};

function chipsHtml(cats) {
  return cats.map(c =>
    `<span class="tool-cat tool-cat-${c.toLowerCase()}">${c}</span>`
  ).join('');
}

// Match each <article class="tool-card" ... data-repo="..."> opening tag
// and either insert data-categories="..." (if missing) or update it.
let updated = 0, skipped = 0;
html = html.replace(
  /<article class="tool-card"([^>]*?)data-repo="([^"]+)"([^>]*)>/g,
  (full, before, repo, after) => {
    const key = repo.toLowerCase();
    const cats = CATS[key];
    if (!cats) {
      skipped++;
      console.warn(`  ⚠  no category mapping for data-repo="${repo}"`);
      return full;
    }
    // Strip any existing data-categories
    const cleanBefore = before.replace(/\s*data-categories="[^"]*"/g, '');
    const cleanAfter  = after.replace(/\s*data-categories="[^"]*"/g, '');
    updated++;
    return `<article class="tool-card"${cleanBefore}data-repo="${repo}" data-categories="${cats.join(',')}"${cleanAfter}>`;
  }
);

// Insert the visible chip block right after the FIRST <div> child of each tool-card,
// before the title row. The title row contains the H3. We insert chips right before it.
// Pattern: capture the inner div's opening and any leading whitespace before the
// title row that contains `<h3 ... data-i18n="tools.items.X.title"`.
// We rewrite by replacing the entire article block (greedy).
html = html.replace(
  /(<article class="tool-card"[^>]*data-repo="([^"]+)"[^>]*>[\s\S]*?<\/article>)/g,
  (block, _all, repo) => {
    const key = repo.toLowerCase();
    const cats = CATS[key];
    if (!cats) return block;
    // Remove any existing tool-cats block first (idempotent)
    let out = block.replace(/\s*<div class="tool-cats">[\s\S]*?<\/div>\s*\n/g, '\n');
    // Insert chips just before the row containing the H3 title with data-i18n="tools.items.<key>.title"
    // The H3 row is the line starting with `<div style="display:flex;align-items:center;...">` containing <h3 ...>
    out = out.replace(
      /(\s*)(<div style="display:flex;align-items:center;gap:var\(--sp-2\);margin-bottom:var\(--sp-2\);flex-wrap:wrap;"><h3)/,
      (_m, indent, tail) =>
        `${indent}<div class="tool-cats">${chipsHtml(cats)}</div>${indent}${tail}`
    );
    return out;
  }
);

// IFCX card has its own simple structure (no <h3 data-i18n="tools.items.X.title">
// inside a flex row). Inject chips for it too — all categories (universal foundation).
const ifcxCats = ['A','E','C','I'];
html = html.replace(
  /(<article class="tool-card" style="border: 2px solid var\(--amber\);">[\s\S]*?<div>\s*\n)/,
  (full) => {
    if (/tool-cats/.test(full)) return full; // idempotent
    return full + `            <div class="tool-cats">${chipsHtml(ifcxCats)}</div>\n`;
  }
);

fs.writeFileSync(file, html);
console.log(`✓ ${updated} tool cards updated, ${skipped} skipped`);
