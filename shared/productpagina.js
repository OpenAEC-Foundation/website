// Productpagina: gedrag van de vaste onderdelen van een app-pagina op open-aec.com
// (tabs bij Functies, plakkende navigatie, release notes inklappen, download per besturingssysteem).
// Hoort bij shared/productpagina.css; standaard beschreven in de OpenAEC-Blueprint,
// templates/website-productpagina/. Elk onderdeel doet niets als het niet op de pagina staat.
  // Functies: tabbladen. Zonder JavaScript staan de hoogtepunten en alle
  // tegels gewoon onder elkaar; dit script maakt er tabbladen van.
  (function () {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.pp-tab'));
    var list = document.querySelector('.pp-tabs');
    var hl = document.querySelector('[data-panel="highlights"]');
    var grid = document.querySelector('.pp-tiles');
    var panel = document.getElementById('pp-feature-panel');
    if (!tabs.length || !list || !hl || !grid || !panel) return;
    var tiles = Array.prototype.slice.call(grid.querySelectorAll('.pp-tile'));
    function inCat(tile, cat) {
      return cat === 'all' || (' ' + (tile.getAttribute('data-cats') || '') + ' ').indexOf(' ' + cat + ' ') > -1;
    }
    tabs.forEach(function (tab) {
      var cat = tab.getAttribute('data-tab');
      var count = tab.querySelector('[data-count]');
      if (!count) return;
      if (cat === 'highlights') count.textContent = String(hl.querySelectorAll('.pp-hl-row').length);
      else count.textContent = String(tiles.filter(function (t) { return inCat(t, cat); }).length);
    });
    function select(tab, focus) {
      var cat = tab.getAttribute('data-tab');
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', tab.id);
      hl.hidden = cat !== 'highlights';
      grid.hidden = cat === 'highlights';
      tiles.forEach(function (t) { t.hidden = cat === 'highlights' || !inCat(t, cat); });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
    document.documentElement.classList.add('pp-js');
    list.hidden = false;
    select(tabs[0], false);
  })();

  // Plakkende navigatie: zet de hoogte van de sitebalk in --pp-nav-h en
  // markeer de sectie die nu in beeld is.
  (function () {
    var root = document.documentElement;
    function measure() {
      var nav = document.getElementById('shared-nav');
      var h = nav ? nav.getBoundingClientRect().height : 0;
      if (h > 0) root.style.setProperty('--pp-nav-h', Math.round(h) + 'px');
    }
    // Elke doelsectie krijgt een eigen scroll-margin-top: de kop van de
    // sectie (niet de bovenrand met padding) komt dan 8 px onder de subnav.
    var GAP = 8;
    function headOf(sec) {
      return sec.querySelector('.section-head, .pill-label, h2, .rn-header-block, .rn-title') || sec;
    }
    function setMargins() {
      var sub = document.querySelector('.pp-subnav');
      var navH = parseFloat(getComputedStyle(root).getPropertyValue('--pp-nav-h')) || 0;
      var subH = sub ? sub.getBoundingClientRect().height : 0;
      root.style.setProperty('--pp-sub-h', Math.round(subH) + 'px');
      document.querySelectorAll('.pp-anchor, #releases').forEach(function (sec) {
        var inner = headOf(sec).getBoundingClientRect().top - sec.getBoundingClientRect().top;
        sec.style.scrollMarginTop = Math.round(navH + subH + GAP - inner) + 'px';
      });
    }
    measure();
    setMargins();
    window.addEventListener('resize', function () { measure(); setMargins(); });
    window.addEventListener('load', setMargins);
    // Vlak voor een sprong opnieuw meten: de release notes worden pas laat
    // door JavaScript opgebouwd en kunnen hun kop dan verplaatst hebben.
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (a) { measure(); setMargins(); }
    }, true);
    document.addEventListener('nav:loaded', function () { measure(); setMargins(); });
    var links = Array.prototype.slice.call(document.querySelectorAll('.pp-subnav a[href^="#"]'));
    var sections = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    function update() {
      var line = (parseFloat(getComputedStyle(root).getPropertyValue('--pp-nav-h')) || 68) + 80;
      var current = -1;
      sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= line) current = i; });
      links.forEach(function (a, i) {
        var on = i === current;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    }
    var queued = false;
    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; update(); });
    }, { passive: true });
    update();
  })();

  // Release notes: de laatste drie staan open, de rest achter een knop.
  (function () {
    var wrap = document.getElementById('releases');
    var btn = document.querySelector('[data-rel-toggle]');
    if (!wrap || !btn) return;
    var show = btn.querySelector('[data-rel-show]');
    var hide = btn.querySelector('[data-rel-hide]');
    btn.hidden = false;
    btn.addEventListener('click', function () {
      var open = wrap.classList.toggle('pp-show-all');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      show.hidden = open;
      hide.hidden = !open;
      if (!open) wrap.scrollIntoView({ block: 'start' });
    });
  })();

  // Downloads: één hoofdknop voor het besturingssysteem van de bezoeker, de
  // rest onder "Andere platforms". De versie, links en groottes komen live uit
  // de nieuwste GitHub-release. Zonder JavaScript wijzen alle knoppen al naar
  // de bestanden van de release die in de HTML staat.
  (function () {
    // De repo staat op het downloadblok: <section id="download" data-pp-repo="owner/repo">.
    var section = document.getElementById('download');
    var REPO = section && section.getAttribute('data-pp-repo');
    if (!REPO) return;
    var state = { tag: null };
    var match = {
      windows: /_x64-setup\.exe$/i,
      'windows-user': /_x64_user-setup\.exe$/i,
      macos: /_universal\.dmg$/i,
      'linux-deb': /_amd64\.deb$/i,
      'linux-rpm': /\.x86_64\.rpm$/i,
      'linux-appimage': /_amd64\.AppImage$/i,
      'linux-snap': /_amd64\.snap$/i,
      android: /\.apk$/i
    };

    // Zelfde herkenning als shared/downloads.js.
    function detectOS(nav) {
      var ua = String((nav && nav.userAgent) || '');
      var platform = String((nav && nav.userAgentData && nav.userAgentData.platform) || (nav && nav.platform) || '');
      if (/android/i.test(ua)) return 'android';
      if (/iphone|ipad|ipod/i.test(ua)) return 'mobile';
      if (/win/i.test(platform) || /windows/i.test(ua)) return 'windows';
      if (/mac/i.test(platform) || /mac os x/i.test(ua)) return 'macos';
      if (/linux|x11|cros/i.test(platform + ' ' + ua)) return 'linux-appimage';
      return null;
    }

    function setPrimary(key) {
      var primary = document.querySelector('[data-pp-primary]');
      if (!primary) return;
      primary.setAttribute('data-pp-dl', key);
      var source = document.querySelector('.pp-files [data-pp-dl="' + key + '"]');
      if (source) primary.href = source.href;
      document.querySelectorAll('[data-os]').forEach(function (el) {
        el.hidden = el.getAttribute('data-os') !== key;
      });
      document.querySelectorAll('[data-pp-item]').forEach(function (el) {
        el.classList.toggle('is-primary', el.getAttribute('data-pp-item') === key);
      });
      var size = document.querySelector('[data-pp-size="' + key + '"]');
      var target = document.querySelector('[data-pp-primary-size]');
      if (size && target) target.textContent = size.textContent;
    }

    var os = detectOS(navigator);
    // Android: een eigen app als die er is, anders net als een iPhone de browser.
    if (os === 'android') os = document.querySelector('.pp-files [data-pp-dl="android"]') ? 'android' : 'mobile';
    if (os === 'mobile') {
      // Op een telefoon is de browser de beste keuze; de installers blijven
      // onder "Andere platforms".
      var main = document.querySelector('[data-pp-primary]');
      var meta = document.querySelector('.pp-dl-meta');
      if (main) main.hidden = true;
      if (meta) meta.hidden = true;
      var note = document.querySelector('[data-pp-mobile]');
      if (note) note.hidden = false;
      var browserNote = document.querySelector('.pp-dl-note');
      if (browserNote) browserNote.hidden = true;
      os = null;
    } else if (os) {
      setPrimary(os);
    }
    var current = os || 'windows';

    // Re-apply the version into the i18n-managed labels. Runs on load and again
    // whenever i18n rewrites them (language switch) via the observer below.
    function patch() {
      if (!state.tag) return;
      document.querySelectorAll('[data-pp-ver]').forEach(function (el) {
        var want = el.innerHTML.replace(/v\d+\.\d+\.\d+/g, state.tag);
        if (el.innerHTML !== want) el.innerHTML = want;
      });
    }

    function fmtSize(bytes) {
      return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function apply(rel) {
      state.tag = rel.tag_name;
      var assets = rel.assets || [];
      Object.keys(match).forEach(function (key) {
        var re = match[key];
        var hit = assets.filter(function (x) { return re.test(x.name); })[0];
        document.querySelectorAll('[data-pp-dl="' + key + '"]').forEach(function (a) {
          if (hit) a.href = hit.browser_download_url;
        });
        if (hit) {
          document.querySelectorAll('[data-pp-size="' + key + '"]').forEach(function (el) {
            el.textContent = fmtSize(hit.size);
          });
        }
      });
      setPrimary(current);
      patch();
    }

    function start() {
      try {
        var obs = new MutationObserver(patch);
        document.querySelectorAll('[data-pp-ver]').forEach(function (el) {
          obs.observe(el, { childList: true, subtree: true, characterData: true });
        });
      } catch (e) {}

      fetch('https://api.github.com/repos/' + REPO + '/releases/latest')
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (rel) { if (rel && rel.tag_name) apply(rel); })
        .catch(function () {});
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  })();

// Kop: schermafbeeldingen-slider (openingsbeeld + hoogtepunten). Pijlen, bolletjes,
// vegen en pijltoetsen; draait niet vanzelf. Zonder JavaScript zie je het eerste beeld.
(function () {
  var root = document.querySelector('[data-pp-slider]');
  if (!root) return;
  var track = root.querySelector('.slider-track');
  var slides = Array.prototype.slice.call(root.querySelectorAll('.slider-slide'));
  var dots = root.querySelector('.slider-dots');
  var prev = root.querySelector('.slider-prev');
  var next = root.querySelector('.slider-next');
  if (!track || slides.length < 2) return;
  var TEKST = {
    nl: { prev: 'Vorige afbeelding', next: 'Volgende afbeelding', dot: 'Afbeelding ', label: 'Schermafbeeldingen' },
    en: { prev: 'Previous image', next: 'Next image', dot: 'Image ', label: 'Screenshots' },
    fr: { prev: 'Image précédente', next: 'Image suivante', dot: 'Image ', label: "Captures d'écran" },
    tr: { prev: 'Önceki görsel', next: 'Sonraki görsel', dot: 'Görsel ', label: 'Ekran görüntüleri' },
    es: { prev: 'Imagen anterior', next: 'Imagen siguiente', dot: 'Imagen ', label: 'Capturas de pantalla' }
  };
  var current = 0;
  var buttons = slides.map(function (_, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'slider-dot';
    b.addEventListener('click', function () { go(i); });
    if (dots) dots.appendChild(b);
    return b;
  });

  function label() {
    var t = TEKST[(document.documentElement.lang || 'nl').slice(0, 2)] || TEKST.en;
    root.setAttribute('aria-label', t.label);
    if (prev) prev.setAttribute('aria-label', t.prev);
    if (next) next.setAttribute('aria-label', t.next);
    buttons.forEach(function (b, i) { b.setAttribute('aria-label', t.dot + (i + 1) + ' / ' + slides.length); });
  }

  function go(i) {
    current = (i + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + current * 100 + '%)';
    slides.forEach(function (s, n) {
      var on = n === current;
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
      // Alleen het zichtbare beeld en zijn buren laden.
      if (Math.abs(n - current) <= 1 || Math.abs(n - current) === slides.length - 1) {
        var img = s.querySelector('img[loading="lazy"]');
        if (img) img.loading = 'eager';
      }
    });
    buttons.forEach(function (b, n) {
      b.classList.toggle('active', n === current);
      if (n === current) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  }

  root.setAttribute('role', 'region');
  root.setAttribute('aria-roledescription', 'carousel');
  if (prev) prev.addEventListener('click', function () { go(current - 1); });
  if (next) next.addEventListener('click', function () { go(current + 1); });
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { go(current - 1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { go(current + 1); e.preventDefault(); }
  });

  // Vegen op telefoon en tablet: horizontaal meer dan 40 px, en meer dan verticaal.
  var x0 = null, y0 = null;
  track.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  track.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(current + (dx < 0 ? 1 : -1));
    x0 = y0 = null;
  }, { passive: true });

  label();
  go(0);
  try { new MutationObserver(label).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] }); } catch (e) {}
})();
