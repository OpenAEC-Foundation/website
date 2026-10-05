'use strict';

// A page that changes must not be shown with the texts from before the change.
// The server lets a browser keep a translation file for a week without asking
// again, so shared/i18n.js asks for the files under the ?v= of its own
// address: a page that loads the script under a new value gets fresh texts.
// Run with: node --test scripts/check-i18n-translation-cache.test.js

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'shared', 'i18n.js'), 'utf8');

// Runs shared/i18n.js as a page would, for a visitor whose browser asks for
// `lang`, and returns the addresses the script requests.
function requestsFor({ src, lang, staticLang = null, page = 'open-pointcloud-studio' }) {
  const requested = [];
  const metas = {
    'meta[name="i18n-page"]': { content: page },
    'meta[name="i18n-static"]': staticLang ? { content: staticLang } : null,
  };
  vm.runInNewContext(source, {
    URL,
    window: {},
    navigator: { languages: [lang] },
    localStorage: { getItem: () => null, setItem() {} },
    fetch: url => { requested.push(url); return Promise.resolve({ ok: false }); },
    document: {
      title: 'Open Pointcloud Studio',
      readyState: 'complete',
      baseURI: 'https://open-aec.com/open-pointcloud-studio/',
      currentScript: src === null ? null : { src },
      documentElement: {},
      querySelector: selector => metas[selector] || null,
      querySelectorAll: () => [],
      addEventListener() {},
    },
  });
  return requested;
}

test('translation files are requested under the version of the script address', () => {
  for (const src of ['/shared/i18n.js?v=20261004', 'https://open-aec.com/shared/i18n.js?v=20261004']) {
    assert.deepEqual(requestsFor({ src, lang: 'fr-FR' }), [
      '/shared/translations/open-pointcloud-studio.json?v=20261004',
      '/shared/translations/open-pointcloud-studio.fr.json?v=20261004',
    ]);
    assert.deepEqual(requestsFor({ src, lang: 'en' }),
      ['/shared/translations/open-pointcloud-studio.json?v=20261004']);
  }
  // Another value is another address, so nothing a browser kept is reused.
  assert.deepEqual(requestsFor({ src: '/shared/i18n.js?v=20260728', lang: 'en', page: 'faq' }),
    ['/shared/translations/faq.json?v=20260728']);
});

test('a script address without a version asks for the plain file, as before', () => {
  for (const src of ['/shared/i18n.js', 'https://open-aec.com/shared/i18n.js?x=1', '', null]) {
    assert.deepEqual(requestsFor({ src, lang: 'tr' }), [
      '/shared/translations/open-pointcloud-studio.json',
      '/shared/translations/open-pointcloud-studio.tr.json',
    ]);
  }
});

test('a Dutch visitor and a page in its own language request no translation file', () => {
  assert.deepEqual(requestsFor({ src: '/shared/i18n.js?v=20261004', lang: 'nl-NL' }), []);
  assert.deepEqual(requestsFor({ src: '/shared/i18n.js?v=20261004', lang: 'nl', staticLang: 'fr' }), []);
});

test('the Open Pointcloud Studio page loads its scripts under a version', () => {
  for (const language of ['', 'en/', 'fr/', 'tr/', 'es/']) {
    const html = fs.readFileSync(path.join(root, language, 'open-pointcloud-studio', 'index.html'), 'utf8');
    for (const script of ['i18n.js', 'downloads.js']) {
      assert.match(html, new RegExp(`<script src="/shared/${script.replace('.', '\\.')}\\?v=\\d{8}"></script>`),
        `${language || 'nl/'}: ${script}`);
    }
  }
});
