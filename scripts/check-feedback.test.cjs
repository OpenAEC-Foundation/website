const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');

// Exercise the production dialog handlers without sending real feedback.
function dialog(pathname = '/ifccad/', language = 'nl', response = {}) {
  const nodes = new Map();
  function element() {
    return { value: '', hidden: false, innerHTML: '', handlers: {},
      addEventListener(event, handler) { this.handlers[event] = handler; },
      setAttribute() {}, focus() {}, showModal() {}, close() {}, checkValidity() { return true; },
      querySelector(selector) {
        if (!nodes.has(selector)) nodes.set(selector, element());
        return nodes.get(selector);
      },
      querySelectorAll() { return []; }
    };
  }
  const document = { documentElement: { lang: language }, head: { appendChild() {} },
    body: { appendChild() {} }, createElement: element, addEventListener() {} };
  const requests = [], window = {};
  runInNewContext(readFileSync(join(__dirname, '../shared/feedback.js'), 'utf8'), {
    document, window, location: { pathname }, HTMLDialogElement: function () {},
    fetch: async (url, options) => {
      requests.push({ url, fields: JSON.parse(options.body) });
      return { ok: true, json: async () => ({ success: true, githubIssueUrl: null, ...response }) };
    }
  });
  window.openFeedback();
  return { nodes, requests, async submit() {
    nodes.get('#fb-subject').value = 'Missing dimension';
    nodes.get('#fb-text').value = 'The dimension disappears after saving.';
    nodes.get('#fb-mail').value = 'reply@example.test';
    nodes.get('.fb-form').handlers.submit({ preventDefault() {} });
    await new Promise(resolve => setImmediate(resolve));
  } };
}

test('IFCCAD discloses public GitHub publication in every supported language', () => {
  for (const language of ['nl', 'en', 'fr', 'tr', 'es']) {
    const page = dialog(`/${language === 'nl' ? '' : language + '/'}ifccad/`, language);
    assert.equal(page.nodes.get('#fb-app').value, 'ifccad');
    assert.match(page.nodes.get('.fb-note-text').innerHTML, /GitHub/);
    assert.match(page.nodes.get('.fb-note-text').innerHTML, /OpenAEC-Foundation\/ifccad/);
  }
});

test('IFCCAD sends the public route and shows the returned issue link', async () => {
  const issue = 'https://github.com/OpenAEC-Foundation/ifccad/issues/123';
  const page = dialog('/ifccad/', 'nl', { githubIssueUrl: issue });
  await page.submit();
  assert.equal(page.requests.length, 1);
  assert.equal(page.requests[0].url, 'https://open-feedback-studio.pages.dev/api/feedback');
  assert.equal(page.requests[0].fields.app, 'ifccad');
  assert.equal(page.requests[0].fields.email, 'reply@example.test');
  assert.ok(!page.requests[0].fields.message.includes('reply@example.test'));
  assert.match(page.nodes.get('.fb-done').innerHTML, new RegExp(issue));
});

test('IFCCAD does not claim an issue was created when the API only stored feedback', async () => {
  const page = dialog();
  await page.submit();
  assert.match(page.nodes.get('.fb-done').innerHTML, /De makers zien je melding/);
  assert.ok(!page.nodes.get('.fb-done').innerHTML.includes('Er is een issue'));
});

test('switching from another public app to IFCCAD uses the selected repository', async () => {
  const page = dialog('/open-frame-studio/');
  page.nodes.get('#fb-app').value = 'ifccad';
  page.nodes.get('#fb-app').handlers.change();
  assert.match(page.nodes.get('.fb-note-text').innerHTML, /OpenAEC-Foundation\/ifccad/);
  await page.submit();
  assert.equal(page.requests[0].url, 'https://open-feedback-studio.pages.dev/api/feedback');
  assert.equal(page.requests[0].fields.app, 'ifccad');
});
