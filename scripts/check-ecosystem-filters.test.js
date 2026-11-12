const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

// Run the homepage filter against the actual cards in each language page.
for (const language of ['', 'en', 'fr', 'tr', 'es', 'de']) {
  test(`${language || 'nl'}: Pile Plan appears in the general and Dutch catalogs`, () => {
    const html = fs.readFileSync(path.join(__dirname, '..', language, 'index.html'), 'utf8');
    const cards = [...html.matchAll(/<article\b([^>]*\bclass="[^"]*tool-card[^"]*"[^>]*)>/g)].map(([, attrs]) => {
      const classes = new Set();
      return {
        dataset: Object.fromEntries([...attrs.matchAll(/data-([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value])),
        classList: {
          add: value => classes.add(value),
          toggle: (value, active) => active ? classes.add(value) : classes.delete(value),
          contains: value => classes.has(value),
        },
      };
    });
    const categories = ['AECI', 'all', 'A', 'E', 'C', 'I', 'NL', 'COMMON', 'STD'];
    const buttons = categories.map(cat => ({
      dataset: { cat }, classList: { toggle() {} }, setAttribute() {},
      addEventListener(event, callback) { this.click = callback; },
    }));
    const counts = categories.map(cat => ({ getAttribute: () => cat, textContent: '' }));
    const source = html.match(/\/\/ Tool category filter[^\n]*\n\s*(\(function\(\)\s*\{[\s\S]*?\}\)\(\);)/);
    assert.ok(source, 'homepage category filter exists');
    vm.runInNewContext(source[1], {
      document: {
        querySelector: () => ({ querySelectorAll: () => cards }),
        querySelectorAll: selector => selector === '.cat-filter-btn' ? buttons : counts,
      },
    });
    const pilePlan = cards.find(card => card.dataset.repo === 'pile-plan-studio');
    const energy = cards.find(card => card.dataset.repo === 'open-energy-studio');
    assert.ok(pilePlan, 'Pile Plan card exists');
    assert.equal(pilePlan.classList.contains('is-hidden'), false, 'Pile Plan is included on initial load');
    for (const category of ['all', 'E', 'I', 'NL']) {
      buttons.find(button => button.dataset.cat === category).click();
      assert.equal(pilePlan.classList.contains('is-hidden'), false, `Pile Plan is visible in ${category}`);
      const visibleCount = cards.filter(card => !card.classList.contains('is-hidden')).length;
      assert.equal(Number(counts.find(count => count.getAttribute() === category).textContent), visibleCount);
      assert.equal(energy.classList.contains('is-hidden'), category !== 'NL', 'other Dutch tools keep their dedicated category');
    }
    buttons.find(button => button.dataset.cat === 'A').click();
    assert.equal(pilePlan.classList.contains('is-hidden'), true, 'Pile Plan is not an Architecture tool');
  });

  test(`${language || 'nl'}: AECI is the default; common tools and standards have their own categories`, () => {
    const html = fs.readFileSync(path.join(__dirname, '..', language, 'index.html'), 'utf8');
    const cards = [...html.matchAll(/<article\b([^>]*\bclass="[^"]*tool-card[^"]*"[^>]*)>[\s\S]*?data-i18n="tools\.items\.(\w+)\.title"/g)].map(([, attrs, key]) => {
      const classes = new Set();
      return {
        key,
        dataset: Object.fromEntries([...attrs.matchAll(/data-([\w-]+)="([^"]*)"/g)].map(([, k, value]) => [k, value])),
        classList: {
          add: value => classes.add(value),
          toggle: (value, active) => active ? classes.add(value) : classes.delete(value),
          contains: value => classes.has(value),
        },
      };
    });
    const categories = ['AECI', 'all', 'COMMON', 'STD'];
    const buttons = categories.map(cat => ({
      dataset: { cat }, classList: { toggle() {} }, setAttribute() {},
      addEventListener(event, callback) { this.click = callback; },
    }));
    const source = html.match(/\/\/ Tool category filter[^\n]*\n\s*(\(function\(\)\s*\{[\s\S]*?\}\)\(\);)/);
    vm.runInNewContext(source[1], {
      document: {
        querySelector: () => ({ querySelectorAll: () => cards }),
        querySelectorAll: selector => selector === '.cat-filter-btn' ? buttons : [],
      },
    });
    const shown = () => cards.filter(card => !card.classList.contains('is-hidden')).map(card => card.key);
    for (const key of ['openOffice', 'openPaint', 'openSpeech', 'browser', 'ifccad', 'ifcx']) {
      assert.ok(!shown().includes(key), `${key} is not in the default AECI view`);
    }
    assert.ok(shown().includes('openCad'), 'Open CAD Studio is in the default AECI view');
    buttons.find(button => button.dataset.cat === 'all').click();
    for (const key of ['openCad', 'openOffice', 'browser', 'ifcx']) assert.ok(shown().includes(key), `${key} is under All`);
    buttons.find(button => button.dataset.cat === 'COMMON').click();
    assert.deepEqual(shown().sort(), ['browser', 'openOffice', 'openPaint', 'openSpeech']);
    buttons.find(button => button.dataset.cat === 'STD').click();
    assert.deepEqual(shown().sort(), ['ifccad', 'ifcx']);
  });
}
