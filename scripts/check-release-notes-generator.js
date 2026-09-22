// scripts/check-release-notes-generator.js
// Regression checks for the GitHub release-note generator.
//
// Run with: node scripts/check-release-notes-generator.js
const assert = require('node:assert/strict');
const { fetchChangelog, parseChanges } = require('./generate-release-notes.js');

const requestedPaths = [];
const fetchFixture = async (url) => {
  requestedPaths.push(url);
  if (url.endsWith('/RELEASE_NOTES.md')) {
    return { ok: true, text: async () => '# Release notes' };
  }
  return { ok: false };
};

const changes = [...parseChanges('### Added\r\n\r\n- First change\r\n- Second change\r\n')];

assert.deepEqual(
  changes,
  ['First change', 'Second change'],
  'release bullets met CRLF-regeleinden worden niet herkend',
);

(async () => {
  const changelog = await fetchChangelog('pile-plan-studio', fetchFixture);
  assert.equal(changelog, '# Release notes', 'RELEASE_NOTES.md wordt niet als changelogbron gebruikt');
  assert.ok(
    requestedPaths.some((url) => url.endsWith('/RELEASE_NOTES.md')),
    'RELEASE_NOTES.md wordt niet opgevraagd',
  );

  console.log('Release-notes generator: OK');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
