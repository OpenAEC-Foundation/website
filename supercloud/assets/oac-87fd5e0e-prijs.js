// Rekent de maandprijs van een samenstelling uit bouwstenen (src/content/prijzen.json).
// Dezelfde code draait in de browser (rekenhulp op de prijzenpagina) en bij de bouw
// (de "vanaf"-prijzen van de voorbeeldplannen), zodat die nooit uit elkaar lopen.
(function () {
  "use strict";

  const rond = (x) => Math.round(x * 100) / 100;

  /**
   * keuze: { gebruikers, apps: { slug: aantal }, erp, opslag: "standaard"|"plus"|null,
   *          extra_tb, omgeving: bool, office, ai (euro), sla: "basis"|"zakelijk"|"premium" }
   * Geeft { regels: [{ soort, sleutel, aantal, bedrag }], totaal, per_gebruiker, gratis }.
   */
  function bereken(prijzen, keuze) {
    const g = Math.max(1, Math.floor(keuze.gebruikers || 1));
    const regels = [];
    const regel = (soort, sleutel, aantal, bedrag) => {
      if (aantal > 0 && bedrag > 0) regels.push({ soort, sleutel, aantal, bedrag: rond(bedrag) });
    };
    for (const [slug, n] of Object.entries(keuze.apps || {})) {
      const niveau = prijzen.apps[slug];
      if (!niveau || !(n > 0)) continue;
      const aantal = Math.min(Math.floor(n), g);
      const perStuk = prijzen.app_niveaus[niveau] + (prijzen.app_rekenkosten[slug] || 0);
      regel("app", slug, aantal, aantal * perStuk);
    }
    if (keuze.erp > 0) {
      const aantal = Math.min(Math.floor(keuze.erp), g);
      regel("erp", "erp", aantal, aantal * prijzen.erp);
    }
    const pakket = keuze.opslag && prijzen.opslag[keuze.opslag];
    if (pakket) {
      const aantal = Math.max(g, prijzen.opslag_min_gebruikers);
      regel("opslag", keuze.opslag, aantal, aantal * pakket.prijs);
    }
    if (keuze.extra_tb > 0) regel("extra_tb", "extra_tb", Math.floor(keuze.extra_tb), Math.floor(keuze.extra_tb) * prijzen.extra_tb);
    if (keuze.omgeving) regel("omgeving", "omgeving", 1, prijzen.omgeving);
    if (keuze.office > 0) {
      const aantal = Math.min(Math.floor(keuze.office), g);
      regel("office", "office", aantal, aantal * prijzen.office);
    }
    if (keuze.ai > 0) regel("ai", "ai", 1, keuze.ai);
    // Serviceniveau: een vast bedrag per maand plus een deel per gebruiker; Basis is inbegrepen.
    const sla = keuze.sla && prijzen.sla && prijzen.sla[keuze.sla];
    if (sla) regel("sla", `sla_${keuze.sla}`, 1, sla.vast + g * sla.per_gebruiker);
    // Zonder betaalde bouwstenen is het de gratis laag; anders telt elke gebruiker mee.
    const gratis = regels.length === 0;
    if (!gratis) regels.unshift({ soort: "gebruiker", sleutel: "gebruiker", aantal: g, bedrag: rond(g * prijzen.gebruiker) });
    const totaal = rond(regels.reduce((s, r) => s + r.bedrag, 0));
    return { regels, totaal, per_gebruiker: rond(totaal / g), gratis };
  }

  globalThis.oacPrijs = { bereken };
})();
