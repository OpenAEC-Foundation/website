# Google Analytics

De centrale loader staat in `shared/analytics.js`. De openbare meet-ID's per
productiehost staan in `shared/analytics-sites.json`. Beide tabellen moeten
gelijk blijven. De OpenAEC-hoofdsite gebruikt **G-F0SL23KPYG**.

`shared/nav.js` laadt de statistieken op de gewone websitepagina's. Zelfstandige
webapps laden in hun HTML-head:

```html
<script id="openaec-analytics-loader" src="https://open-aec.com/shared/analytics.js?v=20261026" defer></script>
```

De loader kiest de meet-ID op de exacte HTTPS-productiehost. Lokale previews,
andere hosts, afwijkende poorten en ingesloten documenten meten niet. Native
apps die lokale HTML gebruiken laden geen Google-tag.

Google Analytics laadt pas na **Allow**. **Decline** blijft bewaard. Via
**Statistics** kan de bezoeker de keuze wijzigen. Intrekken stopt de tag,
verwijdert de Analytics-cookies en herlaadt zonder Google-tag. Toestemming is
afzonderlijk per website opgeslagen.

Alleen handmatige, ontdubbelde `page_view`-gebeurtenissen zijn ingeschakeld.
Querystrings, hashes, formulierwaarden, documentnamen en accountgegevens
worden niet verstuurd. Voor webapps wordt alleen de oorsprong met `/` gemeten;
de openbare hoofdsite en CAD-website behouden hun openbare paginapad.
Advertentiesignalen staan uit.

Houd **Verbeterde meting** in iedere GA4-webstream uit. De loader voert zelf
de opgeschoonde paginaweergaven uit. Een groene build bevestigt niet dat
Google een echt bezoek heeft ontvangen: controleer dit na publicatie met een
toegestaan bezoek in **Rapporten → Realtime** van de juiste property.

## Controleren

Met Node.js, Playwright en een beschikbare browser:

```sh
node --test scripts/check-analytics.test.cjs
```

Stel eventueel `NODE_PATH` in naar de geïnstalleerde Playwright-module en
`CHROME_PATH` naar Chrome of Edge. De tests onderscheppen alle netwerkverzoeken
en registreren geen echte bezoeken. Ze controleren alle productiehosts,
toestemming, intrekken, dubbele initialisatie en opschoning van meetgegevens.

Bronnen: [Consent Mode](https://developers.google.com/tag-platform/security/concepts/consent-mode),
[handmatige paginaweergaven](https://developers.google.com/analytics/devguides/collection/ga4/views).
