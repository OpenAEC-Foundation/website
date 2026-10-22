#!/usr/bin/env node
// Herhaalbare websitebeelden uit de ongewijzigde OPS-releasetag.
// Gebruik: OPS_SOURCE=/pad/naar/ops-v2026.10.0 OPS_SHOTS_URL=http://100.86.248.78:3220 \
//   nice -n 19 node scripts/capture-ops-screenshots.cjs
// Start Vite zelf vanuit OPS_SOURCE. Playwright komt uit die checkout; geen website-dependencies.
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const source = process.env.OPS_SOURCE;
assert(source, 'OPS_SOURCE ontbreekt');
const commit = execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
assert.equal(commit, 'a3827b55b222b9d9e39e4d815d1223bbe299b3f1');
assert.equal(require(path.join(source, 'package.json')).version, '2026.10.0');
const { chromium } = require(require.resolve('playwright', { paths: [source] }));
const url = process.env.OPS_SHOTS_URL;
assert(url, 'OPS_SHOTS_URL ontbreekt');
const output = path.join(__dirname, '../shared/assets/screenshots');

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1048 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      localStorage.setItem('ops-locale', 'en');
      localStorage.setItem('ops-theme', 'dark');
      localStorage.setItem('ops-welcomeSeen', 'true');
      localStorage.setItem('ops-lastVersion', '2026.10.0');
    });
    await page.goto(url);
    await page.waitForFunction(() => window.__OPS__ && window.__OPS__.store.getState().libraryLoaded);
    await page.getByText('Open Planner Studio v2026.10.0', { exact: true }).waitFor();

    async function settle() {
      await page.evaluate(async () => { await document.fonts.ready; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); });
      // Canvas en rapportpreview renderen na React; wacht ook op hun paint.
      await page.waitForTimeout(600);
    }
    async function shot(name, clip) {
      await page.mouse.move(1, 1);
      await settle();
      const file = path.join(output, `open-planner-studio-${name}.png`);
      await page.screenshot({ path: file, ...(clip ? { clip } : {}) });
      console.log(`${path.basename(file)}: ${fs.statSync(file).size} bytes`);
    }
    async function example(file) {
      await page.evaluate(async file => {
        const response = await fetch(`/examples/${file}`);
        if (!response.ok) throw Error(`Voorbeeld ontbreekt: ${file}`);
        const store = window.__OPS__.store;
        if (!await store.getState().openExampleFromString(await response.text(), file)) throw Error(file);
        // Dezelfde bibliotheekkoppeling als de knop Voorbeelden in Backstage.
        if (file.startsWith('showcase-')) {
          const { applyDemoLibraryToShowcaseProject } = await import('/src/state/demoLibraryShowcase.ts');
          applyDemoLibraryToShowcaseProject();
        }
      }, file);
      await settle();
    }
    async function ui(value) { await page.evaluate(value => window.__OPS__.store.getState().setUI(value), value); }
    async function documentNamed(name) {
      await page.evaluate(name => {
        const s = window.__OPS__.store.getState();
        const doc = s.documents.find(d => d.payload.project.name === name);
        if (!doc) throw Error(`Document ontbreekt: ${name}`);
        s.switchDocument(doc.id);
      }, name);
      await settle();
    }
    const panel = { x: 12, y: 205, width: 1200, height: 750 };
    await example('03-kantoorgebouw-zuidas.ifc');
    await example('showcase-appartementencomplex.ifc');
    await example('showcase-rijwoningen-de-akkers.ifc');
    await ui({ activeRibbonTab: 'resources', showTaskTypes: true, showPropertiesPanel: true });
    await page.evaluate(() => {
      const s = window.__OPS__.store.getState();
      s.selectTask(s.tasks.find(t => t.name === 'Roof structure — House 3').id);
    });
    await settle();
    await page.evaluate(() => window.__OPS__.store.getState().setScroll(103, 320));
    await shot('hero');
    await shot('gantt'); // Ook de OG-/Twitter-/Schema.org-afbeelding vernieuwen.

    await documentNamed('Zuidas Office Building');
    await ui({ activeRibbonTab: 'planning', showPropertiesPanel: false });
    await page.evaluate(() => {
      const s = window.__OPS__.store.getState();
      s.setZoom(12); s.setScroll(0, 0);
    });
    await page.locator('[data-tour-anchor="gantt-panel"] canvas').first().waitFor();
    await shot('feat-critical-path', { x: 364, y: 205, width: 1036, height: 648 });

    // Echt voorbeeld via de officiële MSPDI-schrijver en de normale importgrens teruglezen.
    await page.evaluate(async () => {
      const { writeMSPDI } = await import('/src/services/msproject/mspdiWriter.ts');
      const { parseOpenedFile } = await import('/src/services/formatRegistry.ts');
      const s = window.__OPS__.store.getState();
      const text = writeMSPDI(s.project, s.calendar, s.tasks, s.sequences, s.resources, s.assignments, s.calendars, s.baselines, s.activeBaselineId, s.customTaskTypes);
      const parsed = await parseOpenedFile({ name: 'Zuidas Office Building.xml', text });
      s.applyOpenedImport(parsed, { filePath: null, fileHandle: null, siteFileId: null, recompute: true, fit: true, hourDataNotice: true });
    });
    await page.setViewportSize({ width: 1200, height: 750 });
    await ui({ activeRibbonTab: 'planning', showPropertiesPanel: false });
    await settle();
    await page.evaluate(() => { const s = window.__OPS__.store.getState(); s.setZoom(5); s.setScroll(0, 0); });
    await shot('feat-file-import');

    await documentNamed('6 New Terraced Houses, De Akkers');
    await page.setViewportSize({ width: 1224, height: 990 });
    await ui({ activeRibbonTab: 'table', showPropertiesPanel: false });
    await page.locator('[data-task-grid-surface-id="full-task-grid"]').waitFor();
    await page.evaluate(() => {
      const s = window.__OPS__.store.getState();
      s.setTaskGridColumns('full-task-grid', [
        { id: 'task.wbsCode', width: 65, pinned: true },
        { id: 'task.name', width: 340, pinned: true },
        { id: 'task.time.scheduleDuration', width: 90, pinned: false },
        { id: 'task.time.start', width: 145, pinned: false },
        { id: 'task.time.finish', width: 145, pinned: false },
        { id: 'task.taskType', width: 145, pinned: false },
      ]);
      s.selectTasks([]); s.setScroll(0, 0);
    });
    await shot('feat-task-table', panel);

    await example('showcase-verbouwing-eengezinswoning.ifc');
    await documentNamed('6 New Terraced Houses, De Akkers');
    await ui({ activeRibbonTab: 'resources', showResourcePanel: true, resourcePanelDocked: false });
    await page.locator('[data-ops-occupancy-view-button]').click();
    await page.locator('[data-ops-occupancy-histogram-section]').waitFor();
    await page.locator('[data-ops-occupancy-expand]').first().click();
    await page.locator('[data-ops-occupancy-row]').first().click();
    await page.locator('[data-ops-occupancy-histogram]').waitFor();
    await shot('feat-occupancy', panel);

    await ui({ activeRibbonTab: 'report', showResourcePanel: false });
    await page.getByLabel('Report type', { exact: true }).first().click();
    await page.getByRole('option', { name: 'Schedule health', exact: true }).click();
    await page.locator('[data-ops-report-section="dcma"]').waitFor();
    await shot('feat-reports', panel);

    await documentNamed('Zuidas Office Building');
    await page.setViewportSize({ width: 1224, height: 1200 });
    await ui({ activeRibbonTab: 'ifc', uiFontScale: 150 });
    const editor = page.locator('textarea');
    await editor.waitFor();
    const content = await editor.inputValue();
    assert(content.includes("FILE_SCHEMA(('IFC4X3_ADD2'))"));
    assert(content.includes('IFCTASKTIME('));
    // De echte IFC-editor, gescrold naar taken. Geen nagebouwd codevenster.
    await editor.evaluate(el => { const i = el.value.indexOf('=IFCWORKSCHEDULE('); el.scrollTop = Math.max(0, (el.value.slice(0, i).split('\n').length - 4) * 20); });
    const editorBox = await editor.boundingBox();
    assert(editorBox && editorBox.height >= 750);
    await shot('feat-ifc', { x: 12, y: Math.ceil(editorBox.y), width: 1200, height: 750 });
    assert.deepEqual(errors, [], 'Onverwachte browserfouten');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
