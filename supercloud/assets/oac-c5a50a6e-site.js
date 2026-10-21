// Gedrag van de site: mobiel menu, taalkeuze, zoeken en filteren in de
// marketplace.
// Alles werkt ook zonder dit script; het script maakt het alleen prettiger.
(function () {
  "use strict";

  const FILTERS = ["groep", "discipline", "soort", "status", "cat"];

  /** Alle waarden die in de catalogus voorkomen, per filter. */
  function bekendeWaarden(apps) {
    const bekend = {};
    for (const f of FILTERS) bekend[f] = new Set(apps.flatMap((a) => (Array.isArray(a[f]) ? a[f] : [a[f]])));
    return bekend;
  }

  /** Leest filters uit een querystring; onbekende waarden worden genegeerd. */
  function leesFilters(search, bekend) {
    const params = new URLSearchParams(search);
    const filters = { q: (params.get("q") || "").trim() };
    for (const f of FILTERS) filters[f] = new Set(params.getAll(f).filter((w) => bekend[f].has(w)));
    return filters;
  }

  /**
   * Schrijft filters terug naar een querystring (zonder "?"), in vaste volgorde.
   * Parameters uit `origineel` die niet van de filters zijn (bijv. utm_source) blijven staan.
   */
  function schrijfFilters(filters, origineel = "") {
    const params = new URLSearchParams();
    for (const [k, w] of new URLSearchParams(origineel)) if (k !== "q" && !FILTERS.includes(k)) params.append(k, w);
    if (filters.q) params.set("q", filters.q);
    for (const f of FILTERS) for (const w of [...filters[f]].sort()) params.append(f, w);
    return params.toString();
  }

  /** Past een app bij de filters? OF binnen een filter, EN tussen filters. */
  function past(app, filters) {
    for (const f of FILTERS) {
      if (filters[f].size === 0) continue;
      const waarden = Array.isArray(app[f]) ? app[f] : [app[f]];
      if (!waarden.some((w) => filters[f].has(w))) return false;
    }
    const woorden = filters.q.toLowerCase().split(/\s+/).filter(Boolean);
    return woorden.every((w) => app.zoek.includes(w));
  }

  if (globalThis.__OAC_TEST) {
    globalThis.__oac = { bekendeWaarden, leesFilters, schrijfFilters, past };
    return;
  }

  // ---- Navigatie ----------------------------------------------------------
  const nav = document.querySelector(".nav");
  const menuknop = document.querySelector(".menuknop");
  if (nav && menuknop) {
    menuknop.addEventListener("click", () => {
      const open = nav.dataset.open !== "true";
      nav.dataset.open = String(open);
      menuknop.setAttribute("aria-expanded", String(open));
    });
  }
  const talen = document.querySelector(".talen");
  if (talen) {
    document.addEventListener("click", (e) => {
      if (talen.open && !talen.contains(e.target)) talen.open = false;
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && talen.open) {
        talen.open = false;
        talen.querySelector("summary").focus();
      }
    });
  }

  // ---- Video en muziek ----------------------------------------------------
  // Video's starten alleen als de bezoeker beweging niet heeft uitgezet, en
  // pauzeren buiten beeld. Muziek speelt alleen na een klik.
  const rustig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const videos = document.querySelectorAll("video[data-automatisch]");
  if (!rustig && videos.length && "IntersectionObserver" in window) {
    const inBeeld = new Set();
    const speel = (video) => {
      if (document.visibilityState !== "visible" || !inBeeld.has(video)) return;
      if (video.preload === "none") video.preload = "auto";
      const poging = video.play();
      if (poging && poging.catch) poging.catch(() => {});
    };
    const kijker = new IntersectionObserver((items) => {
      for (const item of items) {
        const video = item.target;
        if (item.isIntersecting) {
          inBeeld.add(video);
          speel(video);
        } else {
          inBeeld.delete(video);
          video.pause();
        }
      }
    }, { threshold: 0.2 });
    videos.forEach((v) => {
      kijker.observe(v);
      // Als het eerste afspelen te vroeg kwam (tabblad nog niet zichtbaar, video nog niet geladen).
      v.addEventListener("canplay", () => speel(v));
    });
    document.addEventListener("visibilitychange", () => videos.forEach(speel));
  }
  const muziekknop = document.querySelector("[data-muziek]");
  const muziek = document.querySelector("[data-muziek-audio]");
  if (muziekknop && muziek) {
    muziekknop.hidden = false;
    const tekst = muziekknop.querySelector("[data-muziek-tekst]");
    const zet = (aan) => {
      muziekknop.setAttribute("aria-pressed", String(aan));
      tekst.textContent = aan ? muziekknop.dataset.uit : muziekknop.dataset.aan;
    };
    muziekknop.addEventListener("click", () => {
      if (muziek.paused) {
        muziek.volume = 0.6;
        const poging = muziek.play();
        if (poging && poging.then) poging.then(() => zet(true)).catch(() => zet(false));
        else zet(true);
      } else {
        muziek.pause();
        zet(false);
      }
    });
    // Speelt de bezoeker de uitlegfilm (met eigen muziek) af, dan stopt de achtergrondmuziek.
    document.querySelectorAll(".uitleg-video").forEach((v) => v.addEventListener("play", () => {
      if (!muziek.paused) { muziek.pause(); zet(false); }
    }));
  }

  // ---- Marketplace --------------------------------------------------------
  const catalogusEl = document.getElementById("catalogus");
  if (catalogusEl) {
    const apps = JSON.parse(catalogusEl.textContent);
    const perSlug = new Map(apps.map((a) => [a.slug, a]));
    const bekend = bekendeWaarden(apps);
    const filterEl = document.querySelector("[data-filters]");
    const zoekveld = document.getElementById("zoekveld");
    const teller = document.querySelector("[data-teller]");
    const tellerTekst = teller ? teller.textContent.replace(/^\s*\d+/, "") : "";
    const standaard = document.querySelector("[data-standaard]");
    const leeg = document.querySelector("[data-leeg]");
    let filters = leesFilters(location.search, bekend);

    // Disciplinekeuze bovenin: één tegelijk, of alle.
    const tabs = [...document.querySelectorAll("[data-cat-tab]")];
    const zetTabs = () => {
      const gekozen = [...filters.cat][0] || "";
      for (const tab of tabs) tab.setAttribute("aria-pressed", String(tab.dataset.catTab === gekozen));
    };
    for (const tab of tabs) {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        filters.cat = new Set(tab.dataset.catTab ? [tab.dataset.catTab] : []);
        toepassen();
      });
    }

    filterEl.dataset.js = "";
    zoekveld.value = filters.q;
    for (const vak of filterEl.querySelectorAll("input[type=checkbox]")) vak.checked = filters[vak.name].has(vak.value);

    const toepassen = () => {
      let totaal = 0;
      for (const groep of document.querySelectorAll("[data-groep]")) {
        let zichtbaar = 0;
        for (const li of groep.querySelectorAll("li[data-slug]")) {
          const ok = past(perSlug.get(li.dataset.slug), filters);
          li.hidden = !ok;
          if (ok) zichtbaar++;
        }
        groep.hidden = zichtbaar === 0;
        const gt = groep.querySelector("[data-groepteller]");
        if (gt) gt.textContent = String(zichtbaar);
        totaal += zichtbaar;
      }
      const actief = Boolean(filters.q) || FILTERS.some((f) => filters[f].size > 0);
      if (standaard) standaard.hidden = actief;
      zetTabs();
      if (leeg) leeg.hidden = totaal > 0;
      if (teller) teller.textContent = totaal + tellerTekst;
      const query = schrijfFilters(filters, location.search);
      history.replaceState(null, "", location.pathname + (query ? "?" + query : ""));
    };

    filterEl.addEventListener("change", (e) => {
      const vak = e.target;
      if (!(vak instanceof HTMLInputElement) || !FILTERS.includes(vak.name)) return;
      if (vak.checked) filters[vak.name].add(vak.value);
      else filters[vak.name].delete(vak.value);
      toepassen();
    });
    zoekveld.addEventListener("input", () => {
      filters.q = zoekveld.value.trim();
      toepassen();
    });
    zoekveld.form.addEventListener("submit", (e) => e.preventDefault());
    filterEl.querySelector("[data-wis]").addEventListener("click", () => {
      filters = leesFilters("", bekend);
      zoekveld.value = "";
      for (const vak of filterEl.querySelectorAll("input[type=checkbox]")) vak.checked = false;
      toepassen();
    });
    const filterknop = filterEl.querySelector("[data-filterknop]");
    filterknop.addEventListener("click", () => {
      const open = filterEl.dataset.open !== "true";
      filterEl.dataset.open = String(open);
      filterknop.setAttribute("aria-expanded", String(open));
    });
    toepassen();
  }

  // ---- Rekenhulp op de prijzenpagina ----------------------------------------
  // prijs.js laadt na dit script; bij DOMContentLoaded is het er altijd.
  document.addEventListener("DOMContentLoaded", () => {
    const hulp = document.querySelector("[data-rekenhulp]");
    const dataEl = document.getElementById("prijzen");
    if (!hulp || !dataEl || !globalThis.oacPrijs) return;
    const data = JSON.parse(dataEl.textContent);
    const geld = new Intl.NumberFormat(data.locale, { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const veld = (naam) => hulp.querySelectorAll(`[data-veld="${naam}"]`);
    const getal = (naam) => Math.max(0, Math.floor(Number(veld(naam)[0].value) || 0));

    function lees() {
      const apps = {};
      for (const el of hulp.querySelectorAll("[data-app]")) {
        const n = Math.max(0, Math.floor(Number(el.value) || 0));
        if (n > 0) apps[el.dataset.app] = n;
      }
      const opslag = [...veld("opslag")].find((el) => el.checked);
      const sla = [...veld("sla")].find((el) => el.checked);
      return {
        gebruikers: Math.max(1, getal("gebruikers")),
        apps,
        erp: getal("erp"),
        opslag: opslag && opslag.value ? opslag.value : null,
        extra_tb: getal("extra_tb"),
        omgeving: veld("omgeving")[0].checked,
        office: getal("office"),
        ai: getal("ai"),
        sla: sla ? sla.value : "basis",
      };
    }

    function zet(keuze) {
      veld("gebruikers")[0].value = keuze.gebruikers || 1;
      for (const naam of ["erp", "extra_tb", "office", "ai"]) veld(naam)[0].value = keuze[naam] || 0;
      for (const el of veld("opslag")) el.checked = el.value === (keuze.opslag || "");
      veld("omgeving")[0].checked = Boolean(keuze.omgeving);
      for (const el of veld("sla")) el.checked = el.value === (keuze.sla || "basis");
      for (const el of hulp.querySelectorAll("[data-app]")) el.value = (keuze.apps && keuze.apps[el.dataset.app]) || 0;
      toon();
    }

    function naamVan(r) {
      if (r.soort === "app") return data.apps[r.sleutel] || r.sleutel;
      return data.regels[r.sleutel] || r.sleutel;
    }

    function toon() {
      const keuze = lees();
      const uit = globalThis.oacPrijs.bereken(data.prijzen, keuze);
      hulp.querySelector("[data-totaal]").textContent = geld.format(uit.totaal);
      hulp.querySelector("[data-per-gebruiker]").textContent = uit.gratis ? "" : `${geld.format(uit.per_gebruiker)} ${data.per_gebruiker}`;
      hulp.querySelector("[data-gratis]").hidden = !uit.gratis;
      const lijst = hulp.querySelector("[data-regels]");
      lijst.replaceChildren(...uit.regels.map((r) => {
        const li = document.createElement("li");
        const naam = document.createElement("span");
        naam.textContent = r.aantal > 1 || r.soort === "gebruiker" ? `${r.aantal} × ${naamVan(r)}` : naamVan(r);
        const bedrag = document.createElement("span");
        bedrag.textContent = geld.format(r.bedrag);
        li.append(naam, bedrag);
        return li;
      }));
      // De keuze gaat mee naar de aanmelding op de accounts-site.
      const knop = hulp.querySelector("[data-aanmeld-basis]");
      const q = new URLSearchParams();
      q.set("gebruikers", String(keuze.gebruikers));
      const apps = Object.entries(keuze.apps).map(([s, n]) => `${s}:${n}`).join(",");
      if (apps) q.set("apps", apps);
      for (const naam of ["erp", "extra_tb", "office", "ai"]) if (keuze[naam]) q.set(naam, String(keuze[naam]));
      if (keuze.opslag) q.set("opslag", keuze.opslag);
      if (keuze.omgeving) q.set("omgeving", "1");
      q.set("sla", keuze.sla);
      knop.href = `${knop.dataset.aanmeldBasis}&${q.toString()}`;
    }

    hulp.addEventListener("input", toon);
    hulp.addEventListener("change", toon);
    for (const knop of document.querySelectorAll("button[data-plan]")) {
      knop.hidden = false;
      knop.addEventListener("click", () => {
        zet(knop.dataset.plan ? data.plannen[knop.dataset.plan] : { gebruikers: 1 });
        if (!hulp.contains(knop)) hulp.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    hulp.hidden = false;
    const start = new URLSearchParams(location.search).get("plan");
    zet((start && data.plannen[start]) || data.plannen.supercloud || { gebruikers: 1 });
  });

})();
