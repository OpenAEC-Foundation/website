// De versietabel op de productpagina van Open Infra Studio moet overeenkomen met de releases.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { hostFromBody, apiFromBody } = require('./generate-infra-compat.js');
const { groupRows, renderRows, START, END, PAGES } = require('./build-infra-versions.js');

const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'infra-compat.json'), 'utf8'));

test('de release-tekst levert de versie waarvoor gebouwd is, niet een oudere die later genoemd wordt', () => {
  const body = 'for **Open CAD Studio v2026.43**.\n\n**Note:** this release is built for Open CAD Studio **v2026.44** (plugin API 14). A plugin for v2026.42 does not load.';
  assert.equal(hostFromBody(body), 'v2026.44');
  assert.equal(apiFromBody(body), 14);
  assert.equal(hostFromBody('open source GIS for Open CAD Studio v2026.42 (plugin API 10)'), 'v2026.42');
  assert.equal(hostFromBody('nothing here'), null);
});

test('opeenvolgende releases voor dezelfde versie worden één regel, nieuwste bovenaan', () => {
  const rows = groupRows({ releases: [
    { tag: 'v1', ocs: 'v2026.42', api: 10 },
    { tag: 'v2', ocs: 'v2026.42', api: 10 },
    { tag: 'v3', ocs: 'v2026.43', api: 13 },
  ] });
  assert.deepEqual(rows, [
    { ocs: 'v2026.43', api: 13, from: 'v3', to: 'v3' },
    { ocs: 'v2026.42', api: 10, from: 'v1', to: 'v2' },
  ]);
});

for (const [lang, rel] of Object.entries(PAGES)) {
  test(`${lang}: de pagina toont de actuele versietabel en de nieuwste release`, () => {
    const html = fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n');
    const a = html.indexOf(START), b = html.indexOf(END);
    assert.ok(a > 0 && b > a, 'markeringen van de versietabel ontbreken');
    assert.equal(html.slice(a + START.length, b).trim(), renderRows(data, lang).trim());
    assert.ok(html.includes(`/releases/download/${data.latest.tag}/`), 'downloadlinks wijzen niet naar de nieuwste release');
    assert.ok(html.includes(`Open CAD Studio ${data.latest.ocs} (plugin API ${data.latest.api})`), 'softwareRequirements klopt niet');
  });
}
