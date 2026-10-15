// Alle functies van Open PDF Studio, uit data/open-pdf-studio-functies.json
// (gegenereerd door scripts/genereer-opds-functies.mjs uit de broncode van de
// app). Plaats <div data-opds-functies></div> op de pagina en laad dit script.
(function () {
  const TEKST = {
    nl: {
      meer: (n) => `Toon alle ${n} gereedschappen`,
      minder: 'Toon minder',
      titel: 'Alle functies',
      intro: (d) => `Het volledige lint van versie ${d.versie}: ${d.aantallen.functies} functies op ${d.aantallen.tabbladen} tabbladen. Deze lijst komt rechtstreeks uit de broncode en loopt dus altijd gelijk met de app.`,
      zoek: 'Zoek een functie, bijvoorbeeld "meten" of "knipsel"',
      geen: 'Geen functie gevonden.',
      contextueel: 'verschijnt bij een selectie',
      mcpTitel: 'Bedienbaar door AI',
      mcpIntro: (d) => `Via de ingebouwde MCP-server (Model Context Protocol, een open standaard) kan een AI-model zoals Claude de app bedienen: ${d.aantallen.mcpTools} gereedschappen, en daarmee ook elke functie hierboven. De server draait lokaal; het bestand zelf gaat niet naar een externe dienst. Beschrijvingen in het Engels, zoals het AI-model ze ziet.`,
      treffers: (n) => `${n} ${n === 1 ? 'functie' : 'functies'}`,
    },
    en: {
      meer: (n) => `Show all ${n} tools`,
      minder: 'Show less',
      titel: 'All features',
      intro: (d) => `The complete ribbon of version ${d.versie}: ${d.aantallen.functies} features across ${d.aantallen.tabbladen} tabs. This list is generated from the source code, so it always matches the app.`,
      zoek: 'Search a feature, e.g. "measure" or "snippet"',
      geen: 'No feature found.',
      contextueel: 'appears when something is selected',
      mcpTitel: 'Operable by AI',
      mcpIntro: (d) => `Through the built-in MCP server (Model Context Protocol, an open standard) an AI model such as Claude can operate the app: ${d.aantallen.mcpTools} tools, and through them every feature above. The server runs locally; the file itself is not sent to an external service. Descriptions as the AI model sees them.`,
      treffers: (n) => `${n} ${n === 1 ? 'feature' : 'features'}`,
    },
    fr: {
      meer: (n) => `Afficher les ${n} outils`,
      minder: 'Afficher moins',
      titel: 'Toutes les fonctions',
      intro: (d) => `Le ruban complet de la version ${d.versie} : ${d.aantallen.functies} fonctions réparties sur ${d.aantallen.tabbladen} onglets. Cette liste est générée à partir du code source et correspond donc toujours à l'application.`,
      zoek: 'Rechercher une fonction, par ex. « mesurer »',
      geen: 'Aucune fonction trouvée.',
      contextueel: 'apparaît lors d\'une sélection',
      mcpTitel: 'Pilotable par l\'IA',
      mcpIntro: (d) => `Grâce au serveur MCP intégré (Model Context Protocol, un standard ouvert), un modèle d'IA comme Claude peut piloter l'application : ${d.aantallen.mcpTools} outils, et à travers eux chaque fonction ci-dessus. Le serveur tourne en local ; le fichier lui-même n'est pas envoyé à un service externe. Descriptions en anglais.`,
      treffers: (n) => `${n} ${n === 1 ? 'fonction' : 'fonctions'}`,
    },
    tr: {
      meer: (n) => `${n} aracın tümünü göster`,
      minder: 'Daha az göster',
      titel: 'Tüm özellikler',
      intro: (d) => `Sürüm ${d.versie} şeridinin tamamı: ${d.aantallen.tabbladen} sekmede ${d.aantallen.functies} özellik. Bu liste kaynak koddan üretilir ve bu yüzden her zaman uygulamayla aynıdır.`,
      zoek: 'Bir özellik arayın, örn. "ölç"',
      geen: 'Özellik bulunamadı.',
      contextueel: 'bir seçim yapıldığında görünür',
      mcpTitel: 'Yapay zekâ ile kullanılabilir',
      mcpIntro: (d) => `Yerleşik MCP sunucusu (Model Context Protocol, açık bir standart) sayesinde Claude gibi bir yapay zekâ modeli uygulamayı kullanabilir: ${d.aantallen.mcpTools} araç ve bunlar üzerinden yukarıdaki her özellik. Sunucu yerel olarak çalışır; dosyanın kendisi harici bir hizmete gönderilmez. Açıklamalar İngilizcedir.`,
      treffers: (n) => `${n} özellik`,
    },
  };

  const STIJL = `
    .opf { margin-top: var(--sp-8); }
    .opf-intro { color: var(--text-muted); max-width: 60rem; margin-bottom: var(--sp-6); }
    .opf-zoek { width: 100%; max-width: 32rem; padding: var(--sp-3) var(--sp-4); border: 1.5px solid rgba(42,42,50,0.15); border-radius: var(--radius-md);
      font: inherit; font-size: 0.95rem; margin-bottom: var(--sp-6); background: #fff; }
    .opf-zoek:focus { outline: 2px solid var(--amber); outline-offset: 1px; }
    .opf-tabs { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--sp-4); align-items: start; }
    .opf-tab { background: linear-gradient(180deg, #FFFFFF, var(--blueprint-white)); border: 1px solid rgba(42,42,50,0.07); border-radius: var(--radius-lg); box-shadow: 0 1px 0 #FFFFFF inset, var(--shadow-float); }
    .opf-tab[open] { grid-column: 1 / -1; }
    .opf-tab > summary { cursor: pointer; padding: var(--sp-4) var(--sp-5); font-family: var(--font-heading);
      font-weight: 600; display: flex; justify-content: space-between; gap: var(--sp-3); list-style: none; }
    .opf-tab > summary::-webkit-details-marker { display: none; }
    .opf-tab > summary::after { content: '+'; color: var(--amber); font-weight: 700; }
    .opf-tab[open] > summary::after { content: '−'; }
    .opf-tel { color: var(--text-muted); font-weight: 400; font-size: 0.85rem; margin-left: auto; }
    .opf-ctx { display: block; color: var(--text-muted); font-weight: 400; font-size: 0.8rem; }
    .opf-body { padding: 0 var(--sp-5) var(--sp-4); }
    .opf-groep { margin-top: var(--sp-3); }
    .opf-groep h5 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--amber);
      margin: 0 0 var(--sp-2); }
    .opf-lijst { display: flex; flex-wrap: wrap; gap: var(--sp-2); margin: 0; padding: 0; list-style: none; }
    .opf-lijst li { font-size: 0.85rem; padding: 2px 8px; background: var(--concrete); border: 1px solid rgba(42,42,50,0.08); border-radius: var(--radius-sm); }
    .opf-lijst li[title] { cursor: help; }
    .opf-leeg { color: var(--text-muted); }
    .opf-mcp { margin-top: var(--sp-10); }
    .opf-mcp h3 { margin-bottom: var(--sp-2); }
    .opf-mcp-lijst { columns: 2 320px; column-gap: var(--sp-8); margin: var(--sp-4) 0 0; padding: 0; list-style: none; }
    .opf-mcp-lijst li { break-inside: avoid; font-size: 0.85rem; margin-bottom: var(--sp-2); color: var(--text-muted); }
    .opf-mcp-lijst li.opf-ingeklapt { display: none; }
    .opf-meer-rij { text-align: center; margin-top: var(--sp-6); max-width: none; }
    .opf-mcp-lijst code { color: var(--night-build); font-weight: 600; margin-right: 6px; }
    .opf-verborgen { display: none !important; }
  `;

  function taal() {
    const h = (document.documentElement.lang || '').slice(0, 2).toLowerCase();
    if (TEKST[h]) return h;
    const p = location.pathname.split('/')[1];
    return TEKST[p] ? p : 'nl';
  }

  // Groepskoppen staan in het lint soms in hoofdletters; hier als gewone kop.
  const netjes = (s) => (s && s === s.toUpperCase() && /[A-ZÀ-Ý]{3}/.test(s))
    ? s.charAt(0) + s.slice(1).toLowerCase() : s;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function render(el, d) {
    const l = taal();
    const T = TEKST[l];
    const v = (o) => (o && (o[l] || o.en || o.nl)) || '';
    const tabs = d.tabs.map((t) => {
      const aantal = t.groepen.reduce((n, g) => n + g.functies.length, 0);
      const groepen = t.groepen.map((g) => `
        <div class="opf-groep">
          ${g.label ? `<h5>${esc(netjes(v(g.label)))}</h5>` : ''}
          <ul class="opf-lijst">${g.functies.map((f) => {
            const naam = v(f.label);
            const uitleg = f.uitleg ? v(f.uitleg) : '';
            return `<li data-zoek="${esc((naam + ' ' + uitleg + ' ' + v(g.label)).toLowerCase())}"${uitleg ? ` title="${esc(uitleg)}"` : ''}>${esc(naam)}</li>`;
          }).join('')}</ul>
        </div>`).join('');
      return `
        <details class="opf-tab" data-tab="${esc(t.key)}">
          <summary><span>${esc(v(t.label))}${t.contextueel ? `<span class="opf-ctx">${esc(T.contextueel)}</span>` : ''}</span>
            <span class="opf-tel">${esc(T.treffers(aantal))}</span></summary>
          <div class="opf-body">${groepen}</div>
        </details>`;
    }).join('');

    el.innerHTML = `
      <h2>${esc(T.titel)}</h2>
      <p class="opf-intro">${esc(T.intro(d))}</p>
      <input class="opf-zoek" type="search" placeholder="${esc(T.zoek)}" aria-label="${esc(T.zoek)}">
      <div class="opf-tabs">${tabs}</div>
      <p class="opf-leeg opf-verborgen">${esc(T.geen)}</p>
      <div class="opf-mcp">
        <h3>${esc(T.mcpTitel)}</h3>
        <p class="opf-intro">${esc(T.mcpIntro(d))}</p>
        <ul class="opf-mcp-lijst">${d.mcp.map((m) =>
          `<li data-zoek="${esc((m.naam + ' ' + m.beschrijving).toLowerCase())}"><code>${esc(m.naam)}</code>${esc(m.beschrijving)}</li>`).join('')}</ul>
        ${d.mcp.length > MCP_ZICHTBAAR ? `<p class="opf-meer-rij"><button type="button" class="btn btn-secondary btn-sm opf-meer" aria-expanded="false">${esc(T.meer(d.mcp.length))}</button></p>` : ''}
      </div>`;

    // AI-gereedschappen: eerst een handvol, de rest achter een knop.
    const meer = el.querySelector('.opf-meer');
    if (meer) meer.addEventListener('click', () => {
      const open = meer.getAttribute('aria-expanded') !== 'true';
      meer.setAttribute('aria-expanded', open ? 'true' : 'false');
      meer.textContent = open ? T.minder : T.meer(d.mcp.length);
      inklappen(el);
      if (!open) el.querySelector('.opf-mcp').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    inklappen(el);

    const zoek = el.querySelector('.opf-zoek');
    zoek.addEventListener('input', () => filter(el, zoek.value));
  }

  function filter(el, term) {
    const q = term.trim().toLowerCase();
    let totaal = 0;
    for (const tab of el.querySelectorAll('.opf-tab')) {
      let inTab = 0;
      for (const groep of tab.querySelectorAll('.opf-groep')) {
        let inGroep = 0;
        for (const li of groep.querySelectorAll('li')) {
          const raak = !q || li.dataset.zoek.includes(q);
          li.classList.toggle('opf-verborgen', !raak);
          if (raak) inGroep++;
        }
        groep.classList.toggle('opf-verborgen', !inGroep);
        inTab += inGroep;
      }
      tab.classList.toggle('opf-verborgen', !inTab);
      if (q) tab.open = inTab > 0;
      totaal += inTab;
    }
    for (const li of el.querySelectorAll('.opf-mcp-lijst li')) {
      const raak = !q || li.dataset.zoek.includes(q);
      li.classList.toggle('opf-verborgen', !raak);
      if (raak) totaal++;
    }
    el.querySelector('.opf-leeg').classList.toggle('opf-verborgen', totaal > 0);
    inklappen(el);
  }

  const MCP_ZICHTBAAR = 8;
  function inklappen(el) {
    const meer = el.querySelector('.opf-meer');
    const zoekt = !!(el.querySelector('.opf-zoek') || {}).value;
    const open = zoekt || (meer && meer.getAttribute('aria-expanded') === 'true');
    el.querySelectorAll('.opf-mcp-lijst li').forEach((li, i) => li.classList.toggle('opf-ingeklapt', !open && i >= MCP_ZICHTBAAR));
    if (meer) meer.parentElement.hidden = zoekt;
  }

  function start() {
    const el = document.querySelector('[data-opds-functies]');
    if (!el) return;
    const s = document.createElement('style');
    s.textContent = STIJL;
    document.head.appendChild(s);
    el.classList.add('opf');
    fetch('/data/open-pdf-studio-functies.json')
      .then((r) => r.json())
      .then((d) => {
        render(el, d);
        // Taalknop van de site: die zet <html lang>, dus daarop meeluisteren.
        new MutationObserver(() => render(el, d))
          .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
      })
      .catch(() => { el.hidden = true; });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
