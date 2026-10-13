'use strict';

// The printed QR code (kept outside this repo, in the OpenAEC PR folder) encodes
// https://open-aec.com/socials/ directly: no QR service, no redirect that can
// expire. It keeps working for as long as that page answers, so these checks
// fail when the page or the contact cards it links disappear.
// Run with: node --test scripts/check-socials-qr.test.js

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const QR_URL = 'https://open-aec.com/socials/';
const read = (...p) => fs.readFileSync(path.join(root, ...p), 'utf8');

test('the page the QR code points to exists and is canonical', () => {
  const html = read('socials', 'index.html');
  assert.match(html, new RegExp(`<link rel="canonical" href="${QR_URL}">`));
  assert.doesNotMatch(html, /name="robots" content="[^"]*noindex/);
  assert.match(read('sitemap.xml'), new RegExp(`<loc>${QR_URL}</loc>`));
});

test('every contact card linked from the page exists', () => {
  for (const lang of ['', 'en', 'fr', 'tr', 'es']) {
    const html = read(lang, 'socials', 'index.html');
    for (const [, href] of html.matchAll(/href="(\/socials\/[^"]+\.vcf)"/g)) {
      const vcf = read(...href.split('/').filter(Boolean));
      assert.match(vcf, /^BEGIN:VCARD\r\n/, `${href} is geen geldige contactkaart`);
      assert.match(vcf, /\r\nEND:VCARD\r\n$/, `${href} is niet volledig`);
    }
  }
});
