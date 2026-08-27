// Shared navigation loader — drop <script src="/shared/nav.js"></script> in any page
(function() {
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNav);
  } else {
    loadNav();
  }
})();
