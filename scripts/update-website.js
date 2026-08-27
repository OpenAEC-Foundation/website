#!/usr/bin/env node
// scripts/update-website.js
// One-command full website refresh.
// Runs all GitHub-data generators in the exact same order as
// the daily GitHub Action (.github/workflows/update-stats.yml).
//
// Usage:
//   node scripts/update-website.js              # run all steps
//   node scripts/update-website.js --no-commit  # skip git commit/push
//
// Required env: GITHUB_TOKEN (personal access token with public_repo scope)

const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const STEPS = [
  { name: 'Generate statistics (stars, commits, contributors, releases)', cmd: 'node scripts/generate-stats.js' },
  { name: 'Generate release notes',                                       cmd: 'node scripts/generate-release-notes.js' },
  { name: 'Generate downloads stats (+ daily snapshot)',                  cmd: 'node scripts/generate-downloads.js' },
  { name: 'Compute download trends (weekly deltas)',                      cmd: 'node scripts/compute-download-trends.js' },
  { name: 'Update homepage tool stats (static HTML injection)',           cmd: 'node scripts/build-homepage-stats.js' },
  // Na generate-release-notes: leest data/release-notes/*.json en schrijft de
  // changelog van de nieuwste versie als statische HTML in de productpagina's,
  // plus softwareVersion in de JSON-LD. Zonder deze stap is die tekst alleen
  // via JavaScript zichtbaar en dus niet voor crawlers.
  { name: 'Render latest changelog + softwareVersion into product pages',  cmd: 'node scripts/build-release-notes-static.js' },
  { name: 'Build /api/tools.json machine-readable catalog',               cmd: 'node scripts/build-tools-api.js' },
  { name: 'Build markdown mirrors for AI assistants',                     cmd: 'node scripts/build-markdown-mirrors.js' },
  // Na tools-api: vult de losse getallen in lopende tekst (downloadaantallen,
  // versienummers, aantal tools) die eerder met de hand werden ingetypt en
  // daardoor achterliepen op de rest van de site.
  { name: 'Fill in-text figures (downloads, versions, tool count)',       cmd: 'node scripts/build-figures.js' },
];

const args = process.argv.slice(2);
const noCommit = args.includes('--no-commit');

function run(cmd, label) {
  console.log(`\n→ ${label}`);
  console.log(`  $ ${cmd}`);
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit', env: process.env });
  } catch (err) {
    console.error(`\n❌ FAILED: ${label}`);
    process.exit(1);
  }
}

console.log('=== OpenAEC website full refresh ===');
console.log(`Root: ${ROOT}`);
if (!process.env.GITHUB_TOKEN) {
  console.warn('⚠  GITHUB_TOKEN not set — API calls will be heavily rate-limited or fail.');
}

const t0 = Date.now();
for (const step of STEPS) {
  run(step.cmd, step.name);
}
const seconds = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\n✅ All steps completed in ${seconds}s`);

if (noCommit) {
  console.log('\n(skipped commit — --no-commit)');
  process.exit(0);
}

// Stage & commit changes (if any)
const today = new Date().toISOString().slice(0, 10);
try {
  execSync('git add data/ index.html api/ md/ 2>nul || git add data/ index.html api/ md/', { cwd: ROOT, stdio: 'inherit', shell: true });
  const diff = execSync('git diff --staged --name-only', { cwd: ROOT, encoding: 'utf8' });
  if (!diff.trim()) {
    console.log('\nNo data changes — nothing to commit.');
    process.exit(0);
  }
  console.log('\nStaged files:\n' + diff);
  execSync(`git commit -m "chore: update statistics ${today}"`, { cwd: ROOT, stdio: 'inherit' });
  console.log('\n✅ Committed. Run `git push` when ready.');
} catch (err) {
  console.error('\n⚠  Commit step failed (you may need to commit manually):', err.message);
}
