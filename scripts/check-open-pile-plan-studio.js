const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(ROOT, relativePath));

function includes(relativePath, value) {
  assert.ok(read(relativePath).includes(value), `${relativePath} mist: ${value}`);
}

const homepage = read('index.html');
assert.ok(homepage.includes('data-repo="pile-plan-studio"'), 'homepage mist de repositorykoppeling');
assert.ok(homepage.includes('href="/open-pile-plan-studio/"'), 'homepage mist de productpaginalink');
assert.ok(homepage.includes('https://pile-plan-studio.open-aec.com/'), 'homepage mist de live demo');
assert.ok(homepage.includes('"name": "Open Pile Plan Studio"'), 'homepage mist de nieuwe productnaam');
assert.equal((homepage.match(/openPilePlan:\s*\{/g) || []).length, 5, 'homepage mist één of meer taalitems');

assert.ok(exists('open-pile-plan-studio/index.html'), 'productpagina ontbreekt');
includes('open-pile-plan-studio/index.html', '<title>Open Pile Plan Studio — OpenAEC Foundation</title>');
includes('open-pile-plan-studio/index.html', 'v0.4.0-alpha');
includes('open-pile-plan-studio/index.html', 'https://github.com/OpenAEC-Foundation/pile-plan-studio/releases');
includes('open-pile-plan-studio/index.html', 'content="open-pile-plan-studio"');
includes('open-pile-plan-studio/index.html', 'data-release-notes="pile-plan-studio"');
for (const file of [
  'shared/translations/open-pile-plan-studio.json',
  'shared/translations/open-pile-plan-studio.fr.json',
  'shared/translations/open-pile-plan-studio.tr.json',
  'shared/translations/open-pile-plan-studio.es.json',
]) {
  assert.ok(exists(file), `${file} ontbreekt`);
  JSON.parse(read(file));
}

for (const asset of [
  'shared/assets/screenshots/open-pile-plan-studio.png',
  'shared/assets/screenshots/open-pile-plan-studio-import.png',
  'shared/assets/screenshots/open-pile-plan-studio-optimization.png',
]) {
  assert.ok(exists(asset), `${asset} ontbreekt`);
}

const productPage = read('open-pile-plan-studio/index.html');
assert.ok(!productPage.includes('greedy optimizer'), 'oude optimizertekst staat nog op de productpagina');
assert.ok(!productPage.includes('pile-plan-studio-3.png'), 'verwijderde CPT-screenshot staat nog in de slider');

for (const language of ['en', 'fr', 'tr', 'es']) {
  includes(`${language}/open-pile-plan-studio/index.html`, 'Open Pile Plan Studio');
}

includes('sitemap.xml', 'https://open-aec.com/open-pile-plan-studio/');
includes('scripts/generate-downloads.js', "'pile-plan-studio'");
includes('scripts/generate-release-notes.js', "'pile-plan-studio'");
assert.ok(exists('data/release-notes/pile-plan-studio.json'), 'leeg release-notes resultaat ontbreekt');
includes('scripts/build-tools-api.js', "id: 'open-pile-plan-studio'");
includes('scripts/build-markdown-mirrors.js', "id: 'open-pile-plan-studio'");
includes('scripts/add-category-tags.js', "'pile-plan-studio':");

assert.ok(exists('api/tools.json'), 'api/tools.json ontbreekt');
includes('api/tools.json', '"id": "open-pile-plan-studio"');
assert.ok(exists('md/open-pile-plan-studio.md'), 'Markdown-productspiegel ontbreekt');
includes('md/index.json', '"id": "open-pile-plan-studio"');

console.log('Open Pile Plan Studio website integration: OK');
