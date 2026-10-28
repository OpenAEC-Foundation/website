'use strict';

// The SEO basics a crawler needs without running JavaScript: one title, a
// description, a canonical, one H1, a <main> landmark, and a sitemap that only
// lists pages that exist. Run with: node --test scripts/check-seo-basics.test.js

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const ORIGIN = 'https://open-aec.com';

// Pages that carry the shared navigation: the product, content and news pages
// of the site itself, in every language. Unlisted and stand-alone pages
// (nijmegen, supercloud, socials, drafts) follow their own rules.
const pages = execFileSync('git', ['ls-files', '-z', '*.html'], { cwd: root, encoding: 'utf8' })
  .split('\0').filter(Boolean)
  .filter(f => !/^(old|nijmegen|presentation foundation|marketing|supercloud|shared)\//.test(f))
  .filter(f => !f.includes('.draft.'))
  .map(f => ({ file: f, html: fs.readFileSync(path.join(root, f), 'utf8') }))
  .filter(p => p.html.includes('id="shared-nav"') && !/<meta name="robots" content="[^"]*noindex/.test(p.html));

test('every page has one title, a description and a canonical on open-aec.com', () => {
  const problems = [];
  for (const { file, html } of pages) {
    const head = html.slice(0, html.indexOf('</head>'));
    const titles = (head.match(/<title[\s>]/g) || []).length;
    if (titles !== 1) problems.push(`${file}: ${titles} titles`);
    if (!/<meta name="description"[^>]*\scontent="[^"]{20,}"/.test(head)) problems.push(`${file}: no meta description`);
    const canonical = head.match(/<link rel="canonical" href="([^"]+)"/);
    if (!canonical) problems.push(`${file}: no canonical`);
    else if (!canonical[1].startsWith(ORIGIN + '/')) problems.push(`${file}: canonical ${canonical[1]}`);
  }
  assert.deepEqual(problems, []);
});

test('every page has exactly one H1 and one <main>', () => {
  const problems = [];
  for (const { file, html } of pages) {
    const h1 = (html.match(/<h1[\s>]/g) || []).length;
    const main = (html.match(/<main[\s>]/g) || []).length;
    if (h1 !== 1) problems.push(`${file}: ${h1} H1`);
    if (main !== 1) problems.push(`${file}: ${main} <main>`);
  }
  assert.deepEqual(problems, []);
});

test('every URL in the sitemap is a committed page', () => {
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const tracked = new Set(execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0'));
  const missing = [];
  for (const [, url] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    if (!url.startsWith(ORIGIN + '/')) continue;
    let rel = url.slice(ORIGIN.length + 1);
    if (rel === '' || rel.endsWith('/')) rel += 'index.html';
    if (!tracked.has(rel)) missing.push(url);
  }
  assert.deepEqual(missing, [], 'sitemap lists pages that are not in the repository');
});
