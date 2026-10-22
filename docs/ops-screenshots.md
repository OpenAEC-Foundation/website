# OPS-pagina: beelden en feiten bij v2026.10.0

Vernieuwd op 22 oktober 2026. De websitebranch is `claude/ops-page-overhaul` (PR #36).

## Bronnen

De testchip luidt nu: **Getest met echte MS Project- en P6-planningen**. Er is geen gecombineerd totaalaantal gebruikt. De OPS-bronnen op tag `v2026.10.0` zijn:

- `scripts/measure-profiles.mjs`: afzonderlijke metingen voor het MS Project-profiel en het P6-profiel; het P6-deel heeft een extern corpus nodig.
- `tests/planning/check-mpp-fidelity.ts` en `tests/planning/check-xer-product-fidelity-x12.ts`: de corpuscontroles voor respectievelijk `.mpp` en `.xer`.
- `tests/planning/check-adapters-hours.ts`: rondgangen via IFC, MSPDI XML en P6 XML. Dit levert geen op te tellen corpusomvang op.
- `docs/release-notes/v2026.10.0.md`: P6-import, rekenprofielen, taaktypen, voortgang via spreadsheets en nieuwe rapporten.

Het releaseblok gebruikt `data/release-notes/open-planner-studio.json` voor tags, datums en changelog. `data/release-highlights/open-planner-studio.json` bevat de producthoogtepunten en statistieken. De bronnen zijn de [GitHub Releases API](https://api.github.com/repos/OpenAEC-Foundation/open-planner-studio/releases) en het [officiële highlightsbestand](https://open-planner-studio.open-aec.com/release-highlights.json). Dat bestand bevat voor v2026.10.0 exact **50 dagen, 2882 commits en 248901 toegevoegde regels code**. GitHub vermeldt 21 oktober 2026 als publicatiedatum.

De Action `.github/workflows/update-stats.yml` haalt deze bestanden dagelijks om **06:00 UTC** op. Voor deze update zijn dezelfde scripts gedraaid: `generate-release-notes.js`, `generate-release-highlights.js` en `build-release-notes-static.js`. De twee ophaalscripts draaiden in een tijdelijke map; alleen hun OPS-uitvoer is overgenomen. De statische renderer wijzigde uitsluitend de vijf OPS-taalpagina's. Ook `softwareVersion` is nu 2026.10.0.

## Screenshotaanpak

In de websitegeschiedenis en scripts stond geen herhaalbaar OPS-capturescript. De bestaande bestanden waren PNG, Engelstalig en donker. De hero gebruikte `showcase-rijwoningen-de-akkers.ifc`. De detailbeelden waren uitsneden van de Gantt, tabel, bezetting en rapporten. Het oude IFC-beeld was een opgemaakt codefragment.

De acht gebruikte afbeeldingen zijn opnieuw gemaakt, inclusief de Gantt-afbeelding voor Open Graph, Twitter en Schema.org. Bestandsnamen, PNG-formaat en pixelafmetingen zijn behouden. Oude, niet op deze pagina gebruikte OPS-assets vallen buiten deze update.

De nieuwe beelden komen uit een ongewijzigde OPS-worktree op tag `v2026.10.0`, commit `a3827b55b222b9d9e39e4d815d1223bbe299b3f1`. Ze zijn vastgelegd met headless Chromium via Playwright. De dev-only storebrug opent echte voorbeelden en kiest de weergave. Bibliotheekkoppeling loopt via dezelfde helper als de knop Voorbeelden. Er zijn geen verzonnen taken of testresultaten toegevoegd.

Gebruikte projecten uit `public/examples/`: `03-kantoorgebouw-zuidas.ifc`, `showcase-appartementencomplex.ifc`, `showcase-rijwoningen-de-akkers.ifc` en `showcase-verbouwing-eengezinswoning.ifc`.

- Hero/Gantt: De Akkers, met eigenschappen en het nieuwe veld Taaktype.
- Kritiek pad: Zuidas.
- Bestandsimport: Zuidas via de echte MSPDI-schrijver naar XML en via de normale importgrens teruggelezen. De alttekst noemt nu expliciet XML.
- Tabel: De Akkers met berekende start/einde en de hernoemde werksoort.
- Bezetting: de gedeelde demo-resourcebibliotheek over drie showcase-projecten, met histogram.
- Rapporten: de nieuwe DCMA 14-puntsbeoordeling van De Akkers. De alttekst is aangepast.
- IFC: de echte IFC-editor van Zuidas, op 150% UI-tekstgrootte. Het opgemaakte codefragment is vervangen door echte appuitvoer.

## Opnieuw maken

Maak een tijdelijke worktree op de releasetag. Koppel daar de bestaande OPS-`node_modules` als die nog ontbreken. Start Vite onder `nice -n 19`, op een vrije poort, uitsluitend gebonden aan `100.86.248.78`.

```bash
export PATH="/home/agent/.nvm/versions/node/v22.23.2/bin:$PATH"
export TMPDIR="$HOME/tmp"
OPS_SOURCE="$HOME/tmp/ops-v2026.10.0" \
OPS_SHOTS_URL=http://100.86.248.78:3220 \
nice -n 19 node scripts/capture-ops-screenshots.cjs
```

Comprimeer daarna met Pillow 13 in een tijdelijke virtualenv. Het palet wordt verkleind tot 256 kleuren; er wordt niet geschaald.

```bash
python3 -m venv "$HOME/tmp/ops-shots-tools"
"$HOME/tmp/ops-shots-tools/bin/pip" install Pillow==13.0.0
nice -n 19 "$HOME/tmp/ops-shots-tools/bin/python" scripts/compress-ops-screenshots.py
```

Stop na afloop de eigen Vite-dienst en verwijder de tijdelijke OPS-worktree. Laat `website-ops-dev` op poort 3210 draaien.

## Afbeeldingen

Alle paden staan onder `shared/assets/screenshots/`.

| Bestand | Afmeting | Bytes |
|---|---:|---:|
| `open-planner-studio-hero.png` | 1920 × 1048 | 96385 |
| `open-planner-studio-gantt.png` | 1920 × 1048 | 96385 |
| `open-planner-studio-feat-critical-path.png` | 1036 × 648 | 17080 |
| `open-planner-studio-feat-file-import.png` | 1200 × 750 | 46758 |
| `open-planner-studio-feat-task-table.png` | 1200 × 750 | 37174 |
| `open-planner-studio-feat-occupancy.png` | 1200 × 750 | 27042 |
| `open-planner-studio-feat-reports.png` | 1200 × 750 | 39872 |
| `open-planner-studio-feat-ifc.png` | 1200 × 750 | 95811 |

## Controle

De gerichte controles `check-release-timeline.js` en `check-release-notes-generator.js` slagen. Alle vier vertaalbestanden parsen als JSON. De browsercontrole op `http://100.86.248.78:3210/` controleert alle vijf taalroutes, de nieuwste release met badge en statistieken, en het laden van alle zeven paginabeelden. Ook de Nederlandse browservoorkeur is afzonderlijk gecontroleerd. De acht PNG-responses van de server zijn byte voor byte gelijk aan de nieuwe bestanden. Op 390 px breedte ontstaat geen horizontale overflow. Er zijn geen volledige OPS-testsuites gedraaid.
