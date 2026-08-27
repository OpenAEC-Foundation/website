// Shared release notes component for OpenAEC product pages
// Usage: <div data-release-notes="repo-name"></div>
//        <script src="/shared/release-notes.js"></script>
(function() {
  const STORAGE_KEY = 'openaec-lang';

  const I18N = {
    nl: {
      title: 'Release notes',
      desc: (n) => `${n} wijzigingen, gegroepeerd per minor versie. Live opgehaald van GitHub.`,
      loading: 'Releases laden...',
      latest: 'Laatste',
      nightly: 'Nightly',
      version: 'Versie',
      versions: 'Versies',
      releases: 'releases',
      changes: 'wijzigingen',
      change: 'wijziging',
      release: 'release',
      from: 'van',
      until: 'tot',
      viewGitHub: 'Bekijk op GitHub →',
      viewAll: 'Bekijk alle releases op GitHub →',
      error: 'Kon release notes niet laden.',
      noReleases: 'Nog geen releases beschikbaar.',
      published: 'Uitgebracht',
      totalReleases: 'releases in totaal',
      totalChanges: 'wijzigingen in totaal',
      showMore: 'Toon meer',
      showLess: 'Toon minder',
    },
    en: {
      title: 'Release notes',
      desc: (n) => `${n} changes, grouped by minor version. Fetched live from GitHub.`,
      loading: 'Loading releases...',
      latest: 'Latest',
      nightly: 'Nightly',
      version: 'Version',
      versions: 'Versions',
      releases: 'releases',
      changes: 'changes',
      change: 'change',
      release: 'release',
      from: 'from',
      until: 'to',
      viewGitHub: 'View on GitHub →',
      viewAll: 'View all releases on GitHub →',
      error: 'Could not load release notes.',
      noReleases: 'No releases available yet.',
      published: 'Published',
      totalReleases: 'total releases',
      totalChanges: 'total changes',
      showMore: 'Show more',
      showLess: 'Show less',
    },
    fr: {
      title: 'Notes de version',
      desc: (n) => `${n} modifications, regroupées par version mineure. Récupérées en direct depuis GitHub.`,
      loading: 'Chargement des versions...',
      latest: 'Dernière',
      nightly: 'Nightly',
      version: 'Version',
      versions: 'Versions',
      releases: 'versions',
      changes: 'modifications',
      change: 'modification',
      release: 'version',
      from: 'de',
      until: 'à',
      viewGitHub: 'Voir sur GitHub →',
      viewAll: 'Voir toutes les versions sur GitHub →',
      error: 'Impossible de charger les notes de version.',
      noReleases: 'Aucune version disponible pour le moment.',
      published: 'Publiée',
      totalReleases: 'versions au total',
      totalChanges: 'modifications au total',
      showMore: 'Afficher plus',
      showLess: 'Afficher moins',
    },
    tr: {
      title: 'Sürüm notları',
      desc: (n) => `${n} değişiklik, küçük sürümlere göre gruplandırılmış. GitHub'dan canlı olarak alınır.`,
      loading: 'Sürümler yükleniyor...',
      latest: 'En son',
      nightly: 'Nightly',
      version: 'Sürüm',
      versions: 'Sürümler',
      releases: 'sürüm',
      changes: 'değişiklik',
      change: 'değişiklik',
      release: 'sürüm',
      from: 'başlangıç',
      until: 'kadar',
      viewGitHub: "GitHub'da görüntüle →",
      viewAll: "Tüm sürümleri GitHub'da görüntüle →",
      error: 'Sürüm notları yüklenemedi.',
      noReleases: 'Henüz sürüm mevcut değil.',
      published: 'Yayımlandı',
      totalReleases: 'toplam sürüm',
      totalChanges: 'toplam değişiklik',
      showMore: 'Daha fazla göster',
      showLess: 'Daha az göster',
    },
  };

  function getLang() {
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

  function t(key) {
    const lang = getLang();
    return I18N[lang]?.[key] || I18N.en[key] || key;
  }

  function injectStyles() {
    if (document.getElementById('release-notes-styles')) return;
    const style = document.createElement('style');
    style.id = 'release-notes-styles';
    style.textContent = `
      .rn-section { background: white; padding: 3rem 1.5rem; }
      .rn-container { max-width: 900px; margin: 0 auto; }
      .rn-header-block { margin-bottom: var(--sp-6); }
      .rn-title { font-family: var(--font-heading); font-weight: 700; font-size: 1.75rem; color: var(--deep-forge); margin-bottom: var(--sp-2); }
      .rn-desc { color: #57534E; font-size: 0.95rem; }

      .rn-stats { display: flex; gap: var(--sp-4); flex-wrap: wrap; margin-top: var(--sp-4); }
      .rn-stat-card {
        background: var(--blueprint-white);
        border: 1px solid #E7E5E4;
        border-radius: var(--radius-md);
        padding: var(--sp-3) var(--sp-4);
        flex: 1;
        min-width: 140px;
      }
      .rn-stat-num { font-family: var(--font-heading); font-weight: 700; font-size: 1.5rem; color: var(--amber); }
      .rn-stat-label { font-size: 0.75rem; color: var(--scaffold-gray); text-transform: uppercase; letter-spacing: 0.05em; }

      .rn-groups { display: flex; flex-direction: column; gap: var(--sp-5); }
      .rn-group {
        border: 1px solid #E7E5E4;
        border-radius: var(--radius-lg);
        overflow: hidden;
      }
      .rn-group.latest { border-color: var(--amber); }
      .rn-group-header {
        background: var(--blueprint-white);
        padding: var(--sp-4) var(--sp-5);
        border-bottom: 1px solid transparent;
        display: flex; align-items: center; gap: var(--sp-3);
        flex-wrap: wrap;
        cursor: pointer;
        user-select: none;
      }
      .rn-group.expanded .rn-group-header { border-bottom-color: #E7E5E4; }
      .rn-group-header:hover { background: #F5F5F4; }
      .rn-group.latest .rn-group-header { background: #FFFBEB; }
      .rn-group.latest .rn-group-header:hover { background: #FEF3C7; }
      .rn-group-toggle {
        margin-left: auto;
        font-family: var(--font-code);
        font-size: 0.75rem;
        color: var(--scaffold-gray);
        transition: transform 0.2s ease;
      }
      .rn-group.expanded .rn-group-toggle { transform: rotate(90deg); color: var(--amber); }
      .rn-group-body { display: none; }
      .rn-group.expanded .rn-group-body { display: block; }
      .rn-group-version {
        font-family: var(--font-code);
        font-weight: 700;
        font-size: 1.25rem;
        color: var(--deep-forge);
      }
      .rn-group-meta {
        font-size: 0.8125rem;
        color: var(--scaffold-gray);
      }
      .rn-group-badge {
        font-family: var(--font-code); font-size: 0.65rem;
        font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;
        padding: 2px 8px; border-radius: var(--radius-full);
        background: #FED7AA; color: #9A3412;
      }
      .rn-group.expanded .rn-group-body { padding: var(--sp-4) var(--sp-5); background: white; }

      .rn-changes-list {
        list-style: none;
        padding: 0;
        margin: 0;
        counter-reset: change-counter;
      }
      .rn-changes-list li {
        counter-increment: change-counter;
        position: relative;
        padding: var(--sp-2) 0 var(--sp-2) var(--sp-8);
        font-size: 0.875rem;
        color: var(--deep-forge);
        line-height: 1.6;
        border-bottom: 1px solid #F5F5F4;
      }
      .rn-changes-list li:last-child { border-bottom: none; }
      /* Uitgebreide changelog-sectie (docs/CHANGELOG.md) */
      .rn-changelog { color: var(--deep-forge); font-size: 0.95rem; line-height: 1.7; }
      .rn-changelog h4 {
        font-family: var(--font-heading);
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--amber);
        margin: var(--sp-6) 0 var(--sp-3);
        padding-bottom: var(--sp-2);
        border-bottom: 1px solid #E7E5E4;
      }
      .rn-changelog h4:first-child { margin-top: 0; }
      .rn-changelog p { margin: 0 0 var(--sp-3); max-width: 78ch; }
      .rn-changelog ul { margin: 0 0 var(--sp-4); padding-left: var(--sp-5); max-width: 78ch; }
      .rn-changelog li { margin-bottom: var(--sp-3); }
      .rn-changelog li::marker { color: var(--amber); }
      .rn-changelog code {
        font-family: var(--font-code);
        font-size: 0.85em;
        background: var(--concrete);
        padding: 1px 5px;
        border-radius: var(--radius-sm);
      }
      .rn-changelog a { color: var(--info); }
      .rn-changes-list li::before {
        content: counter(change-counter, decimal-leading-zero);
        position: absolute;
        left: 0;
        top: var(--sp-2);
        font-family: var(--font-code);
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--amber);
        background: #FFFBEB;
        padding: 2px 6px;
        border-radius: 3px;
        min-width: 32px;
        text-align: center;
      }

      .rn-releases-detail {
        margin-top: var(--sp-4);
        padding-top: var(--sp-4);
        border-top: 1px dashed #E7E5E4;
      }
      .rn-release-row {
        display: flex; gap: var(--sp-3); align-items: baseline;
        font-size: 0.75rem;
        padding: var(--sp-1) 0;
      }
      .rn-release-tag {
        font-family: var(--font-code); font-weight: 700;
        color: var(--deep-forge);
        min-width: 80px;
      }
      .rn-release-date { color: var(--scaffold-gray); }
      .rn-release-link { color: var(--amber); text-decoration: none; margin-left: auto; }

      .rn-toggle {
        background: none;
        border: 1px solid var(--amber);
        color: var(--amber);
        font-family: var(--font-body);
        font-size: 0.8125rem;
        padding: 6px 14px;
        border-radius: var(--radius-md);
        cursor: pointer;
        margin-top: var(--sp-3);
      }
      .rn-toggle:hover { background: var(--amber); color: white; }

      .rn-viewall {
        margin-top: var(--sp-6); font-size: 0.8125rem;
        text-align: center;
      }
      .rn-viewall a { color: var(--amber); text-decoration: none; }
      .rn-viewall a:hover { text-decoration: underline; }
      .rn-loading, .rn-error { color: var(--scaffold-gray); font-size: 0.875rem; }
    `;
    document.head.appendChild(style);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  async function fetchData(repo) {
    // Try localStorage cache first
    const cacheKey = `rn-${repo}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) return data;
      }
    } catch (e) {}

    const res = await fetch(`/data/release-notes/${repo}.json`);
    if (!res.ok) throw new Error('No data file');
    const data = await res.json();
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }));
    } catch (e) {}
    return data;
  }

  function renderGroup(group, isLatest) {
    const showAllId = `rn-showall-${group.minorVersion.replace('.', '-')}`;
    const dateRange = group.firstDate === group.lastDate
      ? group.firstDate
      : `${group.firstDate} ${t('until')} ${group.lastDate}`;

    // Use EN version of changes if available and language is EN
    const lang = getLang();
    const changes = dedupe((lang === 'en' && Array.isArray(group.allChangesEn))
      ? group.allChangesEn
      : group.allChanges);

    return `
      <div class="rn-group ${isLatest ? 'latest expanded' : ''}" data-group-index="${group._idx}">
        <div class="rn-group-header" data-toggle-group>
          <span class="rn-group-version">v${group.minorVersion}</span>
          <span class="rn-group-meta">
            ${group.releaseCount} ${group.releaseCount === 1 ? t('release') : t('releases')}
            · ${group.changeCount} ${group.changeCount === 1 ? t('change') : t('changes')}
            · ${dateRange}
          </span>
          ${isLatest ? `<span class="rn-group-badge">${t('latest')}</span>` : ''}
          <span class="rn-group-toggle">▶</span>
        </div>
        <div class="rn-group-body"></div>
      </div>
    `;
  }

  // Lazy render group body content on first expand
  function renderGroupBody(group) {
    const lang = getLang();
    const changes = dedupe((lang === 'en' && Array.isArray(group.allChangesEn))
      ? group.allChangesEn
      : group.allChanges);
    const changesList = changes.map(c => `<li>${inline(c)}</li>`).join('');
    const releaseRows = group.releases.map(r => `
      <div class="rn-release-row">
        <span class="rn-release-tag">${escapeHtml(r.tag)}</span>
        <span class="rn-release-date">${r.date}</span>
        <span class="rn-release-date">·</span>
        <span class="rn-release-date">${r.changes.length} ${r.changes.length === 1 ? t('change') : t('changes')}</span>
        <a href="${r.url}" target="_blank" rel="noopener" class="rn-release-link">${t('viewGitHub')}</a>
      </div>
    `).join('');

    return `
      ${changes.length > 0
        ? `<ol class="rn-changes-list">${changesList}</ol>`
        : `<p class="rn-loading">${({en: 'No changelog parsed — see release on GitHub below.', fr: 'Aucun changelog disponible — voir la version sur GitHub ci-dessous.', tr: "Değişiklik günlüğü mevcut değil — sürümü aşağıdaki GitHub bağlantısından inceleyin.", nl: 'Geen changelog beschikbaar — bekijk de release op GitHub hieronder.'})[getLang()] || 'Geen changelog beschikbaar — bekijk de release op GitHub hieronder.'}</p>`}
      <div class="rn-releases-detail">
        ${releaseRows}
      </div>
    `;
  }

  // Opeenvolgende patch-releases herhalen vaak letterlijk dezelfde changelogregels.
  // Die stapelden op in de groepstelling; hier houden we de eerste van elke regel.
  function dedupe(list) {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    return list.filter(c => {
      const k = String(c).trim();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  // Inline markdown binnen één regel: eerst alles escapen, daarna alleen code,
  // vet en links toestaan. Geen ruimte voor injectie. Staat los van
  // renderMarkdown omdat de losse changelog-regels hem ook nodig hebben — die
  // komen als kale markdown uit de release-JSON.
  function inline(s) {
    return escapeHtml(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }

  // Minimale markdown-renderer voor de changelog-sectie. Bewust klein: we
  // escapen eerst alles en staan daarna alleen koppen, lijsten, vet, code en
  // links toe. Genoeg voor docs/CHANGELOG.md, geen ruimte voor injectie.
  function renderMarkdown(md) {
    const out = [];
    let list = null;      // opgebouwde <li>-teksten
    let para = [];        // opgebouwde alinea-regels

    const flushList = () => {
      if (list && list.length) out.push(`<ul>${list.map(i => `<li>${inline(i)}</li>`).join('')}</ul>`);
      list = null;
    };
    const flushPara = () => {
      if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
      para = [];
    };

    for (const raw of md.split('\n')) {
      const line = raw.replace(/\s+$/, '');
      const heading = line.match(/^(#{3,4})\s+(.*)$/);
      const bullet = line.match(/^\s*[-*]\s+(.*)$/);

      if (heading) {
        flushList(); flushPara();
        out.push(`<h4>${inline(heading[2])}</h4>`);
      } else if (bullet) {
        flushPara();
        if (!list) list = [];
        list.push(bullet[1]);
      } else if (!line.trim()) {
        flushList(); flushPara();
      } else if (list) {
        // Doorlopende regel van het vorige opsommingsteken (hangende inspringing).
        list[list.length - 1] += ' ' + line.trim();
      } else {
        para.push(line.trim());
      }
    }
    flushList(); flushPara();
    return out.join('\n');
  }

  // Alleen de nieuwste release tonen. Opt-in per pagina via
  // <div data-release-notes="repo" data-release-notes-latest>, zodat pagina's
  // die het volledige archief willen tonen ongemoeid blijven.
  function renderLatestOnly(container, data) {
    const group = data.groups && data.groups[0];
    const release = group && group.releases && group.releases[0];
    if (!release) {
      container.innerHTML = `<p class="rn-loading">${t('noReleases')}</p>`;
      return;
    }
    const lang = getLang();
    const changes = (lang === 'en' && Array.isArray(release.changesEn) && release.changesEn.length)
      ? release.changesEn
      : release.changes;

    container.innerHTML = `
      <div class="rn-header-block">
        <h2 class="rn-title" data-rn-title>${t('title')}</h2>
        <p class="rn-desc" data-rn-desc>
          <strong>${escapeHtml(release.tag)}</strong> · ${release.date}${data.latestChangelog
            ? ''
            : ` · ${changes.length} ${changes.length === 1 ? t('change') : t('changes')}`}
        </p>
      </div>
      <div class="rn-groups">
        <div class="rn-group latest expanded">
          <div class="rn-group-body">
            ${data.latestChangelog
              ? `<div class="rn-changelog">${renderMarkdown(data.latestChangelog)}</div>`
              : changes.length
                ? `<ol class="rn-changes-list">${changes.map(c => `<li>${inline(c)}</li>`).join('')}</ol>`
                : `<p class="rn-loading">${t('noReleases')}</p>`}
            <div class="rn-releases-detail">
              <div class="rn-release-row">
                <span class="rn-release-tag">${escapeHtml(release.tag)}</span>
                <span class="rn-release-date">${release.date}</span>
                <a href="${release.url}" target="_blank" rel="noopener" class="rn-release-link">${t('viewGitHub')}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p class="rn-viewall">
        <a href="https://github.com/OpenAEC-Foundation/${data.repo}/releases" target="_blank" rel="noopener">${t('viewAll')}</a>
      </p>
    `;
  }

  function renderAll(container, data, latestOnly) {
    if (latestOnly) return renderLatestOnly(container, data);
    const totalChanges = data.totalChanges;
    const totalReleases = data.totalReleases;

    // Assign indices for lazy lookup
    data.groups.forEach((g, i) => { g._idx = i; });

    container.innerHTML = `
      <div class="rn-header-block">
        <h2 class="rn-title" data-rn-title>${t('title')}</h2>
        <p class="rn-desc" data-rn-desc>${t('desc')(totalChanges)}</p>
        <div class="rn-stats">
          <div class="rn-stat-card">
            <div class="rn-stat-num">${totalChanges}</div>
            <div class="rn-stat-label">${t('totalChanges')}</div>
          </div>
          <div class="rn-stat-card">
            <div class="rn-stat-num">${totalReleases}</div>
            <div class="rn-stat-label">${t('totalReleases')}</div>
          </div>
          <div class="rn-stat-card">
            <div class="rn-stat-num">${data.groups.length}</div>
            <div class="rn-stat-label">${t('versions')}</div>
          </div>
        </div>
      </div>
      <div class="rn-groups">
        ${data.groups.map((g, i) => renderGroup(g, i === 0)).join('')}
      </div>
      <p class="rn-viewall">
        <a href="https://github.com/OpenAEC-Foundation/${data.repo}/releases" target="_blank" rel="noopener">${t('viewAll')}</a>
      </p>
    `;

    // Render the first (latest) group's body immediately
    const firstGroup = container.querySelector('.rn-group.expanded');
    if (firstGroup && data.groups[0]) {
      const body = firstGroup.querySelector('.rn-group-body');
      if (body) body.innerHTML = renderGroupBody(data.groups[0]);
    }

    // Click handler for collapsible groups (event delegation)
    container.querySelectorAll('[data-toggle-group]').forEach(header => {
      header.addEventListener('click', () => {
        const group = header.parentElement;
        const idx = parseInt(group.getAttribute('data-group-index'), 10);
        const wasExpanded = group.classList.contains('expanded');

        if (!wasExpanded) {
          // Lazy-render body on first expand
          const body = group.querySelector('.rn-group-body');
          if (body && !body.innerHTML.trim() && data.groups[idx]) {
            body.innerHTML = renderGroupBody(data.groups[idx]);
          }
        }
        group.classList.toggle('expanded');
      });
    });
  }

  async function init() {
    injectStyles();
    const placeholders = document.querySelectorAll('[data-release-notes]');

    for (const placeholder of placeholders) {
      const repo = placeholder.getAttribute('data-release-notes');
      const latestOnly = placeholder.hasAttribute('data-release-notes-latest');

      placeholder.innerHTML = `
        <section class="rn-section">
          <div class="rn-container">
            <p class="rn-loading">${t('loading')}</p>
          </div>
        </section>
      `;

      const container = placeholder.querySelector('.rn-container');

      try {
        const data = await fetchData(repo);
        // Een tool zonder releases levert een blok op met "0 wijzigingen / 0 releases
        // / 0 versies". Dat leest als kapot terwijl er simpelweg nog niets is; dan
        // verbergen we het hele blok liever.
        if (!data || !(data.totalReleases > 0) && !(data.groups && data.groups.length)) {
          placeholder.style.display = 'none';
          return;
        }
        renderAll(container, data, latestOnly);
        placeholder._rnData = data;
      } catch (err) {
        // De data ontbreekt (nog). Een foutmelding tonen aan bezoekers helpt niemand.
        placeholder.style.display = 'none';
      }
    }

    // Re-render when language changes
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setTimeout(() => {
          document.querySelectorAll('[data-release-notes]').forEach(p => {
            const container = p.querySelector('.rn-container');
            if (p._rnData && container) {
              renderAll(container, p._rnData, p.hasAttribute('data-release-notes-latest'));
            }
          });
        }, 50);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
