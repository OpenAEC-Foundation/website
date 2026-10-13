'use strict';

// The QR code in socials/ is printed on flyers, banners and slides. It encodes
// https://open-aec.com/socials/ directly (no QR service, no redirect that can
// expire), so it keeps working for as long as that address answers. These
// checks fail when the page or the QR files disappear or drift apart.
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

test('the QR files encode exactly that address', () => {
  const svg = read('socials', 'qr-openaec-socials.svg');
  assert.match(svg, new RegExp(`<title>QR-code: ${QR_URL}</title>`));
  const png = fs.readFileSync(path.join(root, 'socials', 'qr-openaec-socials.png'));
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
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
