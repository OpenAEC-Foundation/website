#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const langs = ['nl', 'en', 'fr', 'tr', 'es'];
const url = lang => `https://open-aec.com/${lang === 'nl' ? '' : lang + '/'}ifccad/`;
const source = read('ifccad/index.html');
assert.match(source, /<meta name="i18n-page" content="ifccad"/);
assert.match(source, /src="\/shared\/i18n\.js\?v=/);
const keys = [...source.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
assert.ok(keys.length >= 57, 'All IFCCAD content must have translation keys');
const dig = (obj, key) => key.split('.').reduce((o, k) => o?.[k], obj);
const flatten = (o, prefix = '') => Object.entries(o).flatMap(([k, v]) => typeof v === 'object' ? flatten(v, prefix + k + '.') : [prefix + k]).sort();
const text = s => s.replace(/<[^>]*>/g, '').replace(/&(?:amp|rarr);/g, ' ').replace(/\s+/g, ' ').trim();
let reference;
for (const lang of langs) {
  const html = read(`${lang === 'nl' ? '' : lang + '/'}ifccad/index.html`);
  assert.match(html, new RegExp(`<html lang="${lang}"`));
  assert.ok(html.includes(`<link rel="canonical" href="${url(lang)}"`), `${lang}: canonical`);
  assert.doesNotMatch(html, /name="robots" content="noindex/);
  const graph = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m => JSON.parse(m[1])['@graph'] || []);
  assert.equal(graph.find(n => n['@type'] === 'WebPage')?.inLanguage, lang, `${lang}: schema language`);
  const crumbs = graph.find(n => n['@type'] === 'BreadcrumbList')?.itemListElement;
  assert.deepEqual(crumbs?.map(c => c.name), ['Home', 'IFCCAD'], `${lang}: localized breadcrumbs`);
  for (const alternate of langs) {
    assert.ok(html.includes(`hreflang="${alternate}" href="${url(alternate)}"`), `${lang}: ${alternate} alternate`);
    const flag = [...html.matchAll(/<a\b[^>]*class="[^"]*lang-btn[^>]*>/g)].find(m => m[0].includes(`data-lang="${alternate}"`))?.[0];
    assert.ok(flag?.includes(`href="${new URL(url(alternate)).pathname}"`), `${lang}: ${alternate} language link`);
    if (alternate === lang) assert.match(flag, /class="[^"]*\bactive\b/);
  }
  if (lang !== 'nl') {
    assert.match(html, new RegExp(`<meta name="i18n-static" content="${lang}"`));
    const translations = JSON.parse(read(`shared/translations/ifccad${lang === 'en' ? '' : '.' + lang}.json`));
    const allKeys = flatten(translations);
    if (reference) assert.deepEqual(allKeys, reference, `${lang}: complete translation dictionary`);
    reference = allKeys;
    for (const key of [...keys, 'meta.title', 'meta.description']) {
      const value = dig(translations, key);
      assert.ok(typeof value === 'string' && value.trim(), `${lang}: missing ${key}`);
      const sourceElement = [...source.matchAll(/<[^>]+data-i18n="([^"]+)"[^>]*>/g)].find(m => m[1] === key)?.[0];
      if (sourceElement?.includes('data-i18n-attr=')) {
        const attr = /data-i18n-attr="([^"]+)"/.exec(sourceElement)[1];
        const translatedElement = [...html.matchAll(/<[^>]+data-i18n="([^"]+)"[^>]*>/g)].find(m => m[1] === key)?.[0];
        assert.ok(translatedElement?.includes(attr + '="' + value + '"'), lang + ': translated ' + attr);
      } else if (key === 'meta.description') {
        const actual = /<meta name="description" content="([^"]+)"/.exec(html)?.[1];
        assert.ok(actual && value.startsWith(actual.replace(/…$/, '')), `${lang}: translated description`);
      } else assert.ok(text(html).includes(text(value)), `${lang}: ${key} must be rendered`);
    }
    assert.ok(read(`${lang}/ifcx/index.html`).includes(`href="/${lang}/ifccad/"`), `${lang}: IFCX cross-link`);
    assert.ok(html.includes(`href="/${lang}/ifcx/"`), `${lang}: IFCX link`);
  }
  assert.ok(read('sitemap.xml').includes(`<loc>${url(lang)}</loc>`), `${lang}: sitemap`);
}
console.log('IFCCAD: all five languages, rendered translations and language links verified.');
