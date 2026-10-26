# Repository-instructies

## Analytics

- Behoud de centrale koppeling via `shared/nav.js` en `shared/analytics.js`.
- De hoofdsite `open-aec.com` gebruikt `G-F0SL23KPYG`; de exacte host/meet-ID-tabel
  staat in `shared/analytics-sites.json` en in de loader. Houd beide gelijk.
- Laad geen tweede Google-tag en behoud toestemming vóór het laden van Google.
- Verstuur geen zoektermen, accountgegevens, documentnamen of formulierwaarden.
- Nieuwe openbare pagina's gebruiken de gedeelde navigatie. Zelfstandige pagina's
  gebruiken de loader uit [docs/analytics.md](docs/analytics.md).
- Voer bij wijzigingen aan de loader of navigatie
  `node --test scripts/check-analytics.test.cjs` uit.
