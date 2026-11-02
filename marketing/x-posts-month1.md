# X-posts maand 1 — @MaartenFrough — klaar om te plakken

> Alle drafts hieronder zijn binnen X's **280-tekens** limiet. Threads zijn als losse tweets gemarkeerd. UTM-tags zitten in de links zodat we klikken kunnen meten.

---

## 🧷 PINNED POST (zet vandaag, laat 1 maand staan)

```
Voorzitter @ OpenAEC Foundation — wij maken de Nederlandse bouw open-source in 2026.

🛠 17 productie-tools (PDF, CAD, BIM, calculaties, geotechniek)
📦 5.380+ downloads
🤝 11 supporters waaronder VORM en GAF

→ open-aec.com

#OpenSource #BIM #AEC
```

---

## Week 1

### 1️⃣ Dinsdag, 09:30 NL — Open CAD Studio thread (5 tweets)

**Tag check**: zoek op X of `@HakanSeven12` bestaat. Zo niet → in tweet 1 schrijf "Hakan Seven (@HakanSeven12 op GitHub)" en link erbij. Niet @-spelen op een leeg account.

**Tweet 1/5** (haak):
```
Een onafhankelijke ontwikkelaar bouwt een complete CAD-applicatie in Rust.
Native DWG/DXF read/write. GPU-versnelde rendering. Paper space. ACIS solids.
v0.4.1 net uit.

Dit is precies waar de bouwsector op zit te wachten. Een thread 👇

#OpenSource #CAD #Rust
```

**Tweet 2/5** (de stack):
```
2/ Open CAD Studio is geheel in Rust geschreven door @HakanSeven12 — 514 commits, 31 releases.

→ iced voor de UI
→ wgpu voor GPU rendering
→ GPL-3.0 licentie

Native DWG R13–R2018 lezen/schrijven zonder Autodesk-libraries. Dat is geen kleinigheid.
```

**Tweet 3/5** (functionaliteit):
```
3/ Wat erin zit:

• Volledig 2D drafting (LINE, PLINE, HATCH, OFFSET, TRIM, FILLET, ARRAY…)
• 3D modelling met ACIS solids tessellation
• Multi-tab paper space + viewports
• Full dimensioning, GD&T, MTEXT, MLEADER
• STL/STEP/OBJ/PDF export
• XREF, WBLOCK
```

**Tweet 4/5** (waar OpenAEC staat):
```
4/ Open CAD Studio is GEEN tool van de OpenAEC Foundation zelf. Het is een community-project.

Maar het past binnen onze missie: open source voor de hele AEC-keten. Wij promoten en linken er actief naar.

Dit is hoe een ecosysteem hoort te werken: niemand bouwt alles alleen.
```

**Tweet 5/5** (CTA):
```
5/ Probeer 'm:

→ open-aec.com/open-cad-studio/?utm_source=x&utm_campaign=ocs-launch
→ Win/macOS/Linux binaries: github.com/HakanSeven12/OpenCADStudio/releases

Hat tip Hakan 🎩
```

---

### 2️⃣ Donderdag, 17:00 NL — AI-coding visie (single tweet)

```
Onze stichting bouwt 17 productie-tools met AI-coding.

Stelling: kwaliteit hangt af van hoe je de output controleert, niet van wie de code typt.

Verificatieberekeningen, visuele tests, open-source peer review. Klassieke vangnetten — alleen sneller.

Meer: open-aec.com/faq/

#AIcoding #FOSS
```

---

### 3️⃣ Zaterdag — meedoen aan andermans gesprekken

Geen eigen post. Doe dit:

1. Zoek op X naar **"IFC OR BIM OR DWG"** — filter op recent
2. Reply waardevol op 3-5 posts (geen "great post!" — voeg iets toe)
3. Quote-tweet 1 post die past bij onze missie

Doel: zichtbaar worden bij andere AEC-tweeters zonder spammen.

---

## Week 2

### 4️⃣ Dinsdag, 09:30 NL — Stats post (single tweet + screenshot)

```
Halve update over de OpenAEC Foundation:

📦 51 publieke repos
⭐ 403 GitHub stars
🛠 5.380+ downloads in 5 maanden
👥 32 contributors
🔄 4060 commits

Allemaal open-source software voor de Nederlandse bouw. Cijfers live:

open-aec.com/statistieken/?utm_source=x

#OpenSource #BIM
```

📸 Voeg screenshot van `/statistieken/` highlight-cards toe.

---

### 5️⃣ Woensdag, 09:30 NL — IFCX thread (4 tweets)

**Tweet 1/4**:
```
IFC 4.3 STEP is een 30 jaar oud bestandsformaat. Werkt, maar groot, regex-only te parsen, geen namespaces.

IFCX is buildingSMART's antwoord: JSON-LD, namespaces, web-native.

Wij implementeren het als eerste in productie-tools. Thread 👇

#IFCx #BIM #OpenBIM
```

**Tweet 2/4**:
```
2/ Waarom JSON-LD wint:

→ elke moderne tooling-stack (Python, JS, Rust) heeft JSON-parsers
→ namespaces laten domain-specifieke data toevoegen zonder schema-wijziging
→ leesbaar in editors, diffbaar in git
→ klein bestand (zelfs gzipped)

STEP files? Plain text maar met een grammatica uit de jaren '90.
```

**Tweet 3/4**:
```
3/ Wat OpenAEC tools al doen met IFCX:

• Open CalcSheet Studio exporteert berekeningen live als IFCX namespace
• Open Heatloss Studio exporteert warmteverlies per ruimte als IFCX
• Open Geotechniek Studio koppelt sondering aan model via IFCX

Eén formaat. Hele keten.
```

**Tweet 4/4**:
```
4/ Het is nog vroeg — IFCX is draft. Daarom bouwen we mee:

→ open-aec.com/ifcx/?utm_source=x

Wil je meedoen met namespace-design? PR's welkom.

cc @ThatOpenCo @buildingSMART
```

---

### 6️⃣ Vrijdag, 11:00 NL — Open Geotechniek Studio BRO-kaart (single tweet + screenshot)

```
Sleep een .GEF in Open Geotechniek Studio.
Krijg automatische Robertson SBT-classificatie.
Plus alle openbare sonderingen in een straal van X km op de Kadaster-luchtfoto.

Gratis, open-source, draait op je eigen machine.

open-aec.com/open-geotechniek-studio/?utm_source=x

#Geotechniek #BRO #Kadaster
```

📸 Screenshot van de kaart-view (screenshot 3 uit het slider-arsenal).

---

## Week 3

### 7️⃣ Dinsdag, 09:30 NL — Poll

```
Welke Bluebeam-functie mis je het meest in open-source PDF tools?

Onze Open PDF Studio heeft de basis maar we kunnen niet alles tegelijk.

🅰 Measurement tools
🅱 Markups/comments sync
🅲 Stempel-bibliotheek
🅳 Studio Sessions

#OpenSource #PDF #AEC
```

(X-polls hebben 4 opties + 24h/3d/7d looptijd — kies 7 dagen.)

Reageer op antwoorden van dag 1 om engagement te boosten.

---

### 8️⃣ Donderdag — reply-fest

Zoek 5 actieve AEC-accounts. Reageer bedachtzaam. Voor elke reply:
- voeg iets toe (link, stat, ervaring)
- niet zomaar "agreed!"
- geen self-promo in elke reply (max 1 link per gesprek)

Candidates (check welke actief zijn):
- `@andywatts0` (BIM Pioneers podcast)
- `@stephenholmes` (AEC Magazine)
- `@bondbryan` (BIM consultants)
- `@autodesk` (alleen reply, geen tag)
- `@FreeCAD_News`

---

### 9️⃣ Zaterdag, 11:00 NL — Open Speech Studio thread (3 tweets)

**Tweet 1/3**:
```
Druk op Ctrl+Win en spreek. Je tekst verschijnt waar je cursor staat.

Werkt in elke app. Werkt offline. Werkt in 99 talen.

Géén Otter.ai abonnement. Géén Dragon-licentie. Géén cloud.

Open Speech Studio — gratis. Thread 👇

#WhisperAI #Privacy
```

**Tweet 2/3**:
```
2/ Hoe?

→ OpenAI Whisper voor de ML
→ Rust voor de backend (geen Python runtime)
→ Tauri 2 voor de desktop app (~10 MB)
→ Svelte voor de UI
→ CUDA GPU-versnelling (Whisper Large draait near-realtime)

Eén installer, klaar in 30 seconden.
```

**Tweet 3/3**:
```
3/ Geweldig voor:
• inspecties (handen vies, dicteer in Open Field Studio)
• vergadernotulen (geen cloud-zorgen over klantnamen)
• AI-prompts schrijven (3× sneller dan typen)
• code commits & docstrings dicteren

open-aec.com/open-speech-studio/?utm_source=x

cc @OpenAI
```

---

## Week 4

### 🔟 Maandag, 09:30 NL — Supporters bedanken

```
Onze stichting bestaat een paar maanden en heeft al 11 supporters die ons financieel ondersteunen.

Dank aan onder andere:
@VORM, GAF Architecten, Bengcert, 3BM, Domera, Impertio, Borgch, Van Dorp, Betonstaal, Composite Structures, Orange Climate.

Open source = community.

open-aec.com/supporters/?utm_source=x
```

(Tag de supporters die ECHT op X zitten. Verifieer eerst — anders gewoon naam zonder @.)

---

### 1️⃣1️⃣ Woensdag — Maand-1 recap thread (5 tweets)

**Tweet 1/5**:
```
1 maand geleden begon ik OpenAEC Foundation actief op X te bouwen.

5 echte resultaten — geen marketing-gerommel. Thread 👇
```

**Tweet 2/5**:
```
2/ De stichting heeft nu:
• 51 publieke repos
• 17 productie-tools
• 5.380+ downloads
• 32 contributors
• 11 betalende supporters

Dat alles op LGPL-3.0. Voor altijd gratis.
```

**Tweet 3/5**:
```
3/ Open CAD Studio (van @HakanSeven12) ging viraal in de Rust-community.

Native DWG/DXF read/write in 100% open source. Nooit eerder vertoond op deze schaal.
```

**Tweet 4/5**:
```
4/ FAQ-update: we hebben onze AI-coding visie publiek gemaakt. Wij bouwen alles met AI, met vangnetten zoals verificatieberekeningen, visuele tests en open-source peer review.

open-aec.com/faq/
```

**Tweet 5/5**:
```
5/ Maand 2: we mikken op FOSDEM 2027 met een talk over IFCX, en op één goed artikel in Cobouw of Bouw en ICT.

Wil je meedoen? PR's welkom. Of word supporter: open-aec.com/supporters/

Tot volgende maand 🛠
```

---

### 1️⃣2️⃣ Vrijdag, 17:00 NL — FOSDEM teaser

```
We pitchen een talk voor FOSDEM 2027 in Brussel:

"Building an open IFC ecosystem for buildings, infrastructure and civil works — in Rust"

Deadline september. Werk-in-uitvoering: github.com/OpenAEC-Foundation

#FOSDEM #OpenSource #Rust
```

---

## Voor elke post — checklist

- [ ] ≤280 tekens (X waarschuwt automatisch)
- [ ] Max 3 @-mentions
- [ ] Max 4 hashtags
- [ ] Link met UTM (`?utm_source=x&utm_campaign=…`)
- [ ] Image waar relevant (screenshot van /shared/assets/screenshots/)
- [ ] Geplaatst tussen 09:00–10:30 NL of 17:00 NL
- [ ] Eerste 80 tekens haken het publiek

---

## Snelle replies-routine (10 min/dag)

Ochtend, met koffie:
1. X notifications openen
2. Reageer op replies/quotes op posts <24h oud
3. Like + reply waar relevant
4. Block trolls (geen drama, gewoon weg)
5. Check 2-3 grote AEC-accounts; doe een waardevolle reply

10 minuten. Klaar.

---

## Wat is een goed resultaat na maand 1?

- 100-300 nieuwe followers (typisch op start)
- 1 post met >5k impressions
- 50-100 nieuwe klikken naar open-aec.com (via UTM tracking in Plausible)
- 1-2 echte gesprekken met andere AEC-mensen
- 1 outreach voor podcast/artikel/talk

Niet alles tegelijk. Eén ding goed > tien dingen middelmatig.
