// scripts/check-release-timeline.js
// Bewaakt de releasetijdlijn op de Open Planner Studio-productpagina:
// de placeholder, de statisch voorgerenderde inhoud, de highlights-data en
// de koppeling tussen beide databronnen.
//
// Draaien: node scripts/check-release-timeline.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const readJson = (p) => JSON.parse(read(p));

const REPO = 'open-planner-studio';
const PAGES = [
  `${REPO}/index.html`,
  `en/${REPO}/index.html`,
  `fr/${REPO}/index.html`,
  `tr/${REPO}/index.html`,
  `es/${REPO}/index.html`,
];

// 1. Elke taalversie staat in tijdlijn-modus en laadt het gedeelde script.
for (const page of PAGES) {
  const html = read(page);
  assert.ok(
    html.includes(`<div data-release-notes="${REPO}" data-release-notes-timeline>`),
    `${page}: release-notesplaceholder staat niet in tijdlijn-modus`,
  );
  assert.ok(!html.includes('data-release-notes-latest'), `${page}: oude latest-modus staat er nog`);
  assert.ok(html.includes('/shared/release-notes.js'), `${page}: laadt het release-notesscript niet`);

  // 2. De statische pre-render voor crawlers is aanwezig en is een tijdlijn.
  assert.ok(html.includes('<!-- rn:start'), `${page}: mist de statische pre-render`);
  assert.ok(html.includes('<ol class="rn-timeline">'), `${page}: statische pre-render is geen tijdlijn`);
  assert.ok(html.includes('class="rn-tl-primary-title"'), `${page}: tijdlijn mist de hoofdkop`);
  assert.match(html, /aria-expanded="false"/, `${page}: "Meer"-knop mist aria-expanded`);
}

// 3. De hoogtepunten-data voldoet aan het contract (zelfde validatie als de generator).
const { validate } = require('./generate-release-highlights.js');
const highlights = readJson(`data/release-highlights/${REPO}.json`);
assert.equal(validate(highlights, REPO), null, 'release-highlights voldoen niet aan het contract');

// 4. Elke release met koppen bestaat ook in de release-notes-data, want daar
//    komt de datum vandaan. Zonder die join staat er een kaartje zonder datum.
const notes = readJson(`data/release-notes/${REPO}.json`);
const knownTags = new Set();
for (const group of notes.groups || []) {
  for (const rel of group.releases || []) knownTags.add(rel.tag);
}
for (const rel of highlights.releases) {
  assert.ok(knownTags.has(rel.tag), `hoogtepunt ${rel.tag} heeft geen release in data/release-notes/${REPO}.json`);
}

// 5. De sitetalen die de widget kent moeten in de data zitten; de rest valt
//    terug op en. nl/en/fr/tr zijn de talen die de eigenaar heeft vastgelegd.
for (const rel of highlights.releases) {
  for (const loc of ['nl', 'en', 'fr', 'tr']) {
    assert.ok(rel.highlights[loc], `hoogtepunt ${rel.tag} mist de ${loc}-copy`);
  }
}

// 6. De stijl staat in shared/style.css en niet alleen in de JS-injectie,
//    anders is de pre-render zonder JavaScript ongestyled.
const css = read('shared/style.css');
for (const cls of ['.rn-timeline', '.rn-tl-card', '.rn-tl-primary-title', '.rn-tl-secondary']) {
  assert.ok(css.includes(cls), `shared/style.css mist ${cls}`);
}

console.log('Release timeline: OK');
