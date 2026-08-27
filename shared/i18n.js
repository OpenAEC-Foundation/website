// Shared i18n for all OpenAEC subpages
(function() {
  const STORAGE_KEY = 'openaec-lang';
  // De titel in de HTML is de Nederlandse. Vastleggen bij het laden, zodat we
  // hem kunnen terugzetten als de bezoeker naar Nederlands schakelt.
  const ORIGINAL_TITLE = document.title;

  // Stored preference > browser language (nl/en/fr/tr) > English.
  function getCurrentLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    const supported = ['nl', 'en', 'fr', 'tr'];
    const list = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || 'en'];
    for (let i = 0; i < list.length; i++) {
      const code = String(list[i] || '').toLowerCase().split('-')[0];
      if (supported.indexOf(code) !== -1) return code;
    }
    return 'en';
  }

  // Statisch vertaalde pagina's (en/, fr/, tr/ — zie scripts/build-i18n-pages.js)
  // dragen hun taal in de URL en in de HTML. Daar mag JavaScript niets meer
  // omzetten: de taal hoort bij het adres, niet bij een voorkeur in localStorage.
  const STATIC_LANG = (document.querySelector('meta[name="i18n-static"]') || {}).content || null;

  function setLanguage(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    applyTranslations(lang);
    updateButtons(lang);
  }

  function updateButtons(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
  }

  // Set innerHTML / attribute only when it actually differs — keeps the DOM
  // quiet so we don't poke anything that's watching mutations.
  function setHtmlIfChanged(el, html) {
    if (el.innerHTML !== html) el.innerHTML = html;
  }
  function setAttrIfChanged(el, attr, value) {
    if (el.getAttribute(attr) !== value) el.setAttribute(attr, value);
  }

  function applyTranslations(lang) {
    if (STATIC_LANG) return;   // de HTML is al vertaald
    if (lang === 'nl') {
      // Dutch is the default — restore original content from data-i18n-nl
      document.title = ORIGINAL_TITLE;
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const original = el.getAttribute('data-i18n-nl');
        if (original != null) setHtmlIfChanged(el, original);
      });
      applyInlineTranslations(lang);
      return;
    }

    // For non-NL languages, find the page's translation data.
    // EN  → /shared/translations/<page>.json   (legacy default, always exists)
    // FR  → /shared/translations/<page>.fr.json (with EN fallback)
    // TR  → /shared/translations/<page>.tr.json (with EN fallback)
    //
    // The EN file is always loaded as the base and the language file is merged
    // over it, key by key. Taking only the first file that loads would leave
    // any key it happens to miss untranslated — the element then keeps its
    // Dutch markup, which is worse than showing English.
    const pageId = document.querySelector('meta[name="i18n-page"]')?.content;
    if (!pageId) {
      applyInlineTranslations(lang);
      return;
    }

    const urls = [`/shared/translations/${pageId}.json`];
    if (lang !== 'en') urls.push(`/shared/translations/${pageId}.${lang}.json`);

    function loadJson(url) {
      return fetch(url)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);
    }

    // Later sources win; nested objects are merged rather than replaced.
    function mergeInto(target, source) {
      Object.keys(source).forEach(key => {
        const value = source[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (!target[key] || typeof target[key] !== 'object') target[key] = {};
          mergeInto(target[key], value);
        } else {
          target[key] = value;
        }
      });
      return target;
    }

    Promise.all(urls.map(loadJson))
      .then(sources => {
        const found = sources.filter(Boolean);
        if (!found.length) { applyInlineTranslations(lang); return; }
        const translations = found.reduce(mergeInto, {});
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.getAttribute('data-i18n');
          if (!el.getAttribute('data-i18n-nl')) {
            el.setAttribute('data-i18n-nl', el.innerHTML);
          }
          const translation = key.split('.').reduce((obj, k) => obj?.[k], translations);
          if (translation) {
            const attr = el.getAttribute('data-i18n-attr');
            if (attr) setAttrIfChanged(el, attr, translation);
            else setHtmlIfChanged(el, translation);
          }
        });
        // De paginatitel staat niet in de body en heeft dus geen data-i18n;
        // hij komt uit de sleutel meta.title. Ontbreekt die, dan blijft de
        // Nederlandse titel staan — beter dan een lege tab.
        document.title = (translations.meta && translations.meta.title) || ORIGINAL_TITLE;

        applyInlineTranslations(lang);
      })
      .catch(() => applyInlineTranslations(lang));
  }

  function applyInlineTranslations(lang) {
    // Apply translations from data-i18n-<lang> attributes (used by nav links).
    // Non-EN, non-NL languages fall back to EN if their own attribute is missing.
    document.querySelectorAll('[data-i18n-en], [data-i18n-fr], [data-i18n-tr]').forEach(el => {
      if (!el.getAttribute('data-i18n-nl')) {
        el.setAttribute('data-i18n-nl', el.innerHTML);
      }
      if (lang === 'nl') {
        const original = el.getAttribute('data-i18n-nl');
        if (original != null) setHtmlIfChanged(el, original);
        return;
      }
      const own = el.getAttribute('data-i18n-' + lang);
      const en  = el.getAttribute('data-i18n-en');
      const newHtml = own || en;
      if (newHtml) setHtmlIfChanged(el, newHtml);
    });
  }

  // ───────────────────────────────────────────────────────────────────────
  // Wire-up — no MutationObserver. Language buttons are bound via event
  // delegation on `document`, so any .lang-btn (also those injected later
  // by nav.js) works without polling or watching DOM mutations. nav.js
  // dispatches a 'nav:loaded' CustomEvent after it injects the navbar; we
  // listen for that to apply translations + activate the right button.
  // ───────────────────────────────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('.lang-btn');
    if (!btn) return;
    // Op statische pagina's is de schakelaar een gewone link naar de andere
    // taalversie; die laten we het werk doen.
    if (STATIC_LANG || btn.tagName === 'A') return;
    setLanguage(btn.getAttribute('data-lang'));
  });

  document.addEventListener('nav:loaded', () => {
    if (STATIC_LANG) { updateButtons(STATIC_LANG); return; }
    const lang = getCurrentLang();
    if (lang !== 'nl') applyInlineTranslations(lang);
    updateButtons(lang);
  });

  function init() {
    // Op een statisch vertaalde pagina bepaalt de URL de taal, niet de
    // opgeslagen voorkeur. Anders zou een bezoeker met 'nl' in localStorage
    // op /fr/over-ons.html een pagina krijgen die zichzelf Nederlands noemt.
    if (STATIC_LANG) {
      document.documentElement.lang = STATIC_LANG;
      updateButtons(STATIC_LANG);
      return;
    }
    const lang = getCurrentLang();
    document.documentElement.lang = lang;
    if (lang !== 'nl') applyTranslations(lang);
    updateButtons(lang);
  }

  // Expose globally
  window.setLanguage = setLanguage;
  window.getCurrentLang = getCurrentLang;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
