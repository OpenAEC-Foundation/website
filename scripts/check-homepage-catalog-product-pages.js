const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(ROOT, relativePath));

const homepage = read('index.html');
const validator = read('bim-validator/index.html');
const speech = read('open-speech-studio/index.html');
const validatorMarkdown = read('md/bim-validator.md');
const markdownIndex = read('md/index.md');
const markdownIndexJson = JSON.parse(read('md/index.json'));
const stats = JSON.parse(read('data/stats.json'));
const downloads = JSON.parse(read('data/downloads.json'));
const tools = JSON.parse(read('api/tools.json'));

const expectedGeneratedAt = [stats.generated, downloads.generated].sort().at(-1);
assert.equal(markdownIndexJson.generated, expectedGeneratedAt, 'Markdown JSON-index gebruikt geen stabiele brondatum');
assert.ok(
  markdownIndex.includes(`Generated: ${expectedGeneratedAt}`),
  'Markdown-index gebruikt geen stabiele brondatum',
);

const retiredHomepageRepos = [
  'open-energy-studio',
  'open-2d-studio',
  'openaec-cloud',
  'openaec-docs',
];

for (const repo of retiredHomepageRepos) {
  assert.ok(!homepage.includes(`data-repo="${repo}"`), `homepage bevat nog kaart: ${repo}`);
}

for (const page of [
  'open-energy-studio/index.html',
  'open-2d-studio/index.html',
  'openaec-cloud/index.html',
  'openaec-docs/index.html',
]) {
  assert.ok(exists(page), `productpagina ontbreekt: ${page}`);
}

for (const id of ['open-energy-studio', 'open-2d-studio', 'openaec-cloud', 'openaec-docs']) {
  assert.ok(tools.tools.some((tool) => tool.id === id), `API-vermelding ontbreekt: ${id}`);
}

assert.ok(
  validator.includes('https://github.com/OpenAEC-Foundation/OpenAEC-BIM-validator'),
  'BIM Validator mist GitHub-link',
);
assert.match(
  validator,
  /<a href="https:\/\/github\.com\/OpenAEC-Foundation\/OpenAEC-BIM-validator" target="_blank" rel="noopener" class="btn btn-primary github-cta"[^>]*>/,
  'BIM Validator GitHub-link mist veilige attributen of toegankelijke knopstijl',
);
assert.ok(validator.includes('id="recent-developments"'), 'BIM Validator mist recente ontwikkelingen');
assert.ok(
  validator.includes('data-release-notes="OpenAEC-BIM-validator"'),
  'BIM Validator mist release-notescomponent',
);
assert.ok(
  validator.includes('<script src="/shared/release-notes.js?v=20260728"></script>'),
  'BIM Validator laadt het release-notesscript niet',
);
assert.match(
  validator,
  /\.development-item time\s*\{[^}]*color:\s*#57534E/s,
  'BIM Validator-datums missen voldoende contrast',
);
assert.match(
  validator,
  /\.development-link\s*\{[^}]*color:\s*var\(--info\)/s,
  'BIM Validator-links missen voldoende contrast',
);
assert.match(
  validator,
  /\.header-actions \.github-cta\s*\{[^}]*color:\s*#18181B/s,
  'BIM Validator GitHub-knop mist contrastrijke tekst',
);
assert.match(
  validator,
  /\.header-actions \.github-cta:hover,[\s\S]*?background:\s*var\(--signal-orange\);[\s\S]*?color:\s*#18181B/,
  'BIM Validator GitHub-knop mist contrastrijke hoverstijl',
);
for (const text of [
  'Project data separated per organization',
  'Open and save projects locally or in connected project storage',
  'Interactive section planes for focused model inspection',
]) {
  assert.ok(validatorMarkdown.includes(text), `BIM Validator Markdown-spiegel mist: ${text}`);
}

const expectedSpeechScreenshots = [
  '/shared/assets/screenshots/open-speech-studio-tts.png',
  '/shared/assets/screenshots/open-speech-studio-models.png',
  '/shared/assets/screenshots/open-speech-studio-settings.png',
];
const speechScreenshotPaths = [...speech.matchAll(/<div class="slider-slide"><img src="([^"]*open-speech-studio[^"]*)"/g)]
  .map((match) => match[1]);
assert.deepEqual(speechScreenshotPaths, expectedSpeechScreenshots, 'Speech Studio galerij is niet actueel');
assert.ok(
  homepage.includes('<img class="tool-thumb" src="/shared/assets/screenshots/open-speech-studio-tts.png" alt="Open Speech Studio">'),
  'homepage gebruikt niet de nieuwe Speech Studio-thumbnail',
);
assert.match(
  homepage,
  /\.logo-full\s*\{[^}]*max-width:\s*100%[^}]*height:\s*auto/s,
  'homepage-logo is niet begrensd voor mobiele schermen',
);

console.log('Homepage catalog and product pages: OK');
