# Artikel-pitches voor NL vakbladen

> 8 concrete pitches, op volgorde van haalbaarheid + impact. Elk pitch heeft: doelpublicatie, lengte, haakje, structuur, en de unieke USP die geen ander artikel kan claimen.

---

## 1. 🔥 "Open source als antwoord op de licentie-druk in de Nederlandse bouw"

**Voor**: Cobouw  
**Type**: Opinie + bedrijfsverhaal  
**Lengte**: 800–1.000 woorden  
**Status**: ⏳ pitchen — wacht op één Cobouw-redacteurnaam

**Haak**: Bluebeam, Autodesk en Trimble verhogen hun NL-licenties dit jaar weer met 8–15%. Een Nederlandse stichting bouwt een complete open-source AEC-stack als alternatief — met BRO, IFC 4.3 en supporters als VORM en GAF.

**Structuur**:
1. Anekdote: aannemer A betaalt €X/jaar voor 4 Bluebeam-licenties die hij voor 80% niet gebruikt
2. Wat OpenAEC is + wat al draait (Open PDF, Open 2D, Open Geotechniek)
3. Hoe het verdienmodel werkt (stichting + supporters + dienstverlening)
4. Wat het nog niet kan + roadmap
5. Call: "Wil je supporter worden of meebouwen? open-aec.com"

**USP die alleen wij hebben**: 17 productie-tools, 5.380 downloads, supporters met namen die de lezer kent.

---

## 2. 🔥 "IFCX als opvolger van IFC STEP — hoe ziet de toekomst van open BIM-data eruit?"

**Voor**: Bouw en ICT + parallel buildingSMART NL blog  
**Type**: Technische deep-dive  
**Lengte**: 1.500 woorden + één diagram  
**Status**: ⏳ pitchen

**Haak**: IFC 4.3 STEP is een 30 jaar oud bestandsformaat dat slecht aansluit op moderne JSON-LD/web-tooling. IFCX is buildingSMART's antwoord. Wij implementeren het als eerste in productie-tools.

**Structuur**:
1. Wat is mis met IFC STEP? (groot, regex-only te parsen, geen namespaces)
2. Wat lost IFCX op? (JSON-LD, namespaces, web-native)
3. Hands-on: één voorbeeldbestand vergeleken in IFC STEP vs IFCX
4. Hoe OpenAEC tools het gebruiken
5. Wat moet er nog gebeuren voordat IFCX productie-rijp is

**USP**: We hebben echt werkende code (Open CalcSheet Studio doet live IFCX export). Geen ander artikel in NL kan dat tonen.

---

## 3. 🔥 "Sonderingen lezen zonder Wintapp: een open BRO-viewer voor de civielsector"

**Voor**: Geotechniek-vakblad KIVI + Cobouw (kort)  
**Type**: Product-introductie + technisch  
**Lengte**: 1.200 woorden + 4 screenshots  
**Status**: ⏳ pitchen — kan gelijk

**Haak**: Het Kadaster ontsluit 80.000+ openbare sonderingen via de BRO API, maar bestaande viewers zijn commercieel of zwaar verouderd. Wij bouwden een gratis open-source alternatief.

**Structuur**:
1. Probleem: sondering opvragen → krijg .GEF terug → wat nu?
2. Robertson SBT-classificatie uitgelegd (waarom belangrijk)
3. Open Geotechniek Studio: features, screenshots
4. BRO-kaartview demo
5. Wat ontbreekt nog (Bro-Loket sondering uploaden, Excel-export)

**USP**: We zijn de enige NL open-source CPT-viewer met BRO + Robertson SBT + Kadaster-luchtfoto.

---

## 4. 🟡 "Open CalcSheet Studio: een open opvolger van CalcPAD"

**Voor**: De Constructeur (KIVI) + LinkedIn-uitsnede  
**Type**: Product-introductie  
**Lengte**: 900 woorden  
**Status**: ⏳ wacht tot OCS 0.3.0 (release ~Q3)

**Haak**: CalcPAD is closed-source, Windows-only, en mist BIM-integratie. We bouwden een moderne open variant met dezelfde syntax + live IFCX export.

**Structuur**:
1. Wie kent CalcPAD niet? Kort historisch overzicht
2. Waarom open source: geen vendor lock, cross-platform, embeddable als library
3. Voorbeeld: een windbelasting-berekening die ook IFCX exporteert
4. Hoe het werkt onder de motorkap (mathjs + KaTeX + Tauri)
5. Roadmap

**USP**: Eerste tool die rekenen + IFC-elementen genereert in één document.

---

## 5. 🟡 "Open BIM Validator Studio — IDS, NL-BIM Basis ILS en RVB BIM Norm in één tool"

**Voor**: BIM Magazine NL  
**Type**: Product-introductie + how-to  
**Lengte**: 1.100 woorden + screenshots van checks  
**Status**: ⏳ wacht tot validator beta-stabiel is

**Haak**: De NL-BIM Basis ILS en het RVB BIM Norm zijn de feitelijke standaarden — maar handmatig valideren tegen IDS-bestanden is een drama in Solibri. Wij maken het gratis en simpel.

**USP**: Eerste tool die NL-specifieke ILS-standaarden voorgeladen heeft.

---

## 6. 🟡 "GWW + BIM = mogelijk? IFC 4.3 in de praktijk"

**Voor**: Cobouw Infra-special OF Civiele Techniek  
**Type**: Verkennend  
**Lengte**: 1.000 woorden  

**Haak**: IFC 4.3 voegt IfcRoad, IfcBridge, IfcTunnel, IfcRail en IfcMarineFacility toe. Wij testen in de praktijk wat dat betekent voor sondering → fundering → kunstwerk-uitwisseling.

**USP**: Echt werkende IFC 4.3 export uit Open CalcSheet + Open Geotechniek.

---

## 7. 🟡 "Open Field Studio: NEN 2767 op je tablet — zonder abonnement"

**Voor**: Vakblad De Aannemer + Bouwkundig Adviseur magazine  
**Type**: Praktijkverhaal  
**Lengte**: 700 woorden  

**Haak**: Conditiemetingen volgens NEN 2767 worden meestal vastgelegd in apps die €30-50/gebruiker/maand kosten. Open Field Studio doet hetzelfde, draait offline en kost niets.

**USP**: NEN 2767 checklist al voorgeladen + werkt 100% offline (klanten in renovatie zonder dekking).

---

## 8. ❄ "De OpenAEC Foundation in 2026 — een Nederlandse open-source belofte"

**Voor**: NLdigital nieuwsbrief / NRC-supplement bouw  
**Type**: Lange achtergrond  
**Lengte**: 2.000+ woorden  

**Haak**: Foundation-jubileum: 1 jaar geleden gestart, 17 tools, 5.380 downloads, 11 supporters. Wat hebben we geleerd?

**Status**: ❄ april 2027 — past beter bij jubileum.

---

## Pitch-template (bewaar deze)

```
Onderwerp: Artikel-voorstel voor [PUBLICATIE]: [HAAK]

Beste [REDACTEUR],

Korte intro (2 zinnen) over wie je bent en de stichting.

Ik stel een artikel voor van ~[N] woorden over [ONDERWERP].
Het haakje: [1 zin].

Hoe ik dat zou aanpakken:
- [Bullet 1]
- [Bullet 2]
- [Bullet 3]

Waarom dit relevant is voor jullie lezers:
[2-3 zinnen — geen "OpenAEC is geweldig", wel "uw lezers worstelen met X
 en wij hebben Y opgelost"]

Ik kan binnen 2 weken een eerste versie aanleveren, incl. screenshots
en eventueel quote-bronnen (bijv. supporter VORM/GAF voor case-studies).

Vriendelijke groet,
Rick Diependaal
[Functie]
OpenAEC Foundation
```

---

## Volgorde-aanbeveling voor de eerste 3 maanden

| Maand | Pitch | Naar | Voorbereidingstijd |
|-------|-------|------|--------------------|
| **Juni 2026** | #1 (Cobouw — bedrijfsverhaal) | Cobouw | 2 dagen — 1 dag schrijven, 1 dag reviews |
| **Juli 2026** | #3 (Geotechniek — BRO/sonderingen) | KIVI Geotechniek | 1.5 dag |
| **Augustus 2026** | #2 (IFCX deep-dive) | Bouw en ICT + buildingSMART | 3 dagen (technisch zwaar) |

Niet meer dan één pitch per maand — anders schrijf je twee middelmatige artikelen i.p.v. één goed artikel.
