// Shared navigation loader — drop <script src="/shared/nav.js"></script> in any page
(function() {
  if (!document.getElementById('openaec-analytics-loader')) {
    var analytics = document.createElement('script');
    analytics.id = 'openaec-analytics-loader';
    analytics.src = '/shared/analytics.js?v=20261026';
    analytics.defer = true;
    document.head.appendChild(analytics);
  }
  function loadNav() {
    var placeholder = document.getElementById('shared-nav');
    if (!placeholder) {
      // Auto-insert at start of body if no placeholder exists
      placeholder = document.createElement('div');
      placeholder.id = 'shared-nav';
      document.body.insertBefore(placeholder, document.body.firstChild);
    }

    // Staat de nav al statisch in de HTML (build-nav-static.js)? Dan niets
    // ophalen — alleen laten weten dat hij er is, zodat i18n.js zijn werk doet.
    if (placeholder.innerHTML.indexOf('nav:start') !== -1) {
      if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        var staticNav = placeholder.querySelector('.navbar');
        if (staticNav) staticNav.classList.add('homepage-nav');
      }
      document.dispatchEvent(new CustomEvent('nav:loaded'));
      return;
    }

    fetch('/shared/nav.html')
      .then(function(res) { return res.text(); })
      .then(function(html) {
        placeholder.innerHTML = html;

        // Add homepage-nav class if on homepage
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
          var nav = placeholder.querySelector('.navbar');
          if (nav) nav.classList.add('homepage-nav');
        }

        // Let listeners (i18n.js) know the navbar DOM is available.
        document.dispatchEvent(new CustomEvent('nav:loaded'));
      });
  }

  // Wie op het forum is ingelogd, ziet dat rechtsboven in de navigatie van elke pagina. Het forum (forum.js) zet
  // alleen de naam in localStorage onder `openaec-forum-account`; de sessie zelf blijft bij het forum.
  function accountKnop() {
    var menu = document.querySelector('#shared-nav .nav-menu');
    if (!menu) return;
    var oud = menu.querySelector('.nav-account');
    if (oud) oud.remove();
    var account = null;
    try { account = JSON.parse(localStorage.getItem('openaec-forum-account') || 'null'); } catch (e) { account = null; }
    if (!account || !account.naam) return;
    if (!document.getElementById('nav-account-stijl')) {
      var stijl = document.createElement('style');
      stijl.id = 'nav-account-stijl';
      stijl.textContent = '.nav-account{display:inline-flex;align-items:center;gap:8px;padding:3px 12px 3px 3px;margin-left:8px;border-radius:999px;border:1px solid rgba(255,255,255,.28);color:inherit;text-decoration:none;font-weight:600;font-size:.88rem;line-height:1}' +
        '.nav-account:hover{border-color:var(--amber,#D97706)}' +
        '.nav-account-av{width:28px;height:28px;border-radius:50%;background:var(--amber,#D97706);color:#fff;display:grid;place-items:center;font-size:.72rem;font-weight:700}' +
        '.nav-account-naam{max-width:11em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}';
      document.head.appendChild(stijl);
    }
    var delen = String(account.naam).trim().split(/\s+/);
    var ini = ((delen[0] || '?').charAt(0) + (delen.length > 1 ? delen[delen.length - 1].charAt(0) : '')).toUpperCase();
    var knop = document.createElement('a');
    knop.className = 'nav-account';
    knop.href = '/forum/';
    knop.title = account.naam;
    var av = document.createElement('span');
    av.className = 'nav-account-av';
    av.setAttribute('aria-hidden', 'true');
    av.textContent = ini;
    var naam = document.createElement('span');
    naam.className = 'nav-account-naam';
    naam.textContent = account.naam;
    knop.appendChild(av);
    knop.appendChild(naam);
    // Dezelfde tekstkleur als de andere links in de balk (licht op donker, ook in het uitklapmenu op mobiel).
    var link = menu.querySelector('.nav-link');
    if (link) knop.style.color = getComputedStyle(link).color;
    menu.insertBefore(knop, menu.querySelector('.lang-switcher'));
  }
  document.addEventListener('nav:loaded', accountKnop);
  document.addEventListener('openaec:account', accountKnop);
  window.addEventListener('storage', function (ev) { if (ev.key === 'openaec-forum-account') accountKnop(); });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNav);
  } else {
    loadNav();
  }
})();
