# LinkedIn-carrousel voor Open PDF Studio: vierkante PDF (1080x1080 pt),
# huisstijl van open-aec.com. Elke pagina is één slide.
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from reportlab.pdfgen import canvas as rl
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit

W = H = 1080
AMBER = HexColor('#D97706')
GOLD = HexColor('#F59E0B')
NIGHT = HexColor('#2A2A32')
PAPER = HexColor('#FAFAF9')
GRAY = HexColor('#A1A1AA')
INK = HexColor('#1C1917')

UIT = 'Open-PDF-Studio-functies.pdf'
c = rl.Canvas(UIT, pagesize=(W, H))
c.setTitle('Open PDF Studio — wat kun je ermee?')
c.setAuthor('OpenAEC Foundation')
c.setSubject('Functionaliteiten van Open PDF Studio — gratis en open source')

def wrap(txt, font, size, maxw):
    return simpleSplit(txt, font, size, maxw)

def kader(donker=False):
    c.setFillColor(NIGHT if donker else PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    # accentbalk boven
    c.setFillColor(AMBER)
    c.rect(0, H - 14, W, 14, fill=1, stroke=0)

def voet(nummer, totaal, donker=False):
    c.setFont('Helvetica', 22)
    c.setFillColor(GRAY if donker else HexColor('#78716C'))
    c.drawString(80, 60, 'open-aec.com  ·  Open PDF Studio')
    c.drawRightString(W - 80, 60, f'{nummer}/{totaal}')

def titelslide():
    kader(donker=True)
    c.setFillColor(GOLD)
    c.setFont('Helvetica-Bold', 26)
    c.drawString(80, H - 180, 'GRATIS  ·  OPEN SOURCE  ·  GEEN ABONNEMENT')
    c.setFillColor(PAPER)
    c.setFont('Helvetica-Bold', 96)
    c.drawString(80, H - 330, 'Open PDF')
    c.setFillColor(AMBER)
    c.drawString(80, H - 430, 'Studio')
    c.setFillColor(PAPER)
    c.setFont('Helvetica', 40)
    for i, r in enumerate(wrap(
            'Een volwaardige PDF-editor voor de bouw. '
            'Annoteren, meten op schaal, symbolen plaatsen en hoeveelheden bepalen.',
            'Helvetica', 40, W - 160)):
        c.drawString(80, H - 540 - i * 54, r)
    # Grote kadervorm als visueel accent
    c.setStrokeColor(AMBER); c.setLineWidth(6)
    c.rect(80, 150, W - 160, 190, fill=0, stroke=1)
    c.setFillColor(GOLD); c.setFont('Helvetica-Bold', 34)
    c.drawString(120, 265, 'Windows  ·  macOS  ·  Linux  ·  Android')
    c.setFillColor(PAPER); c.setFont('Helvetica', 30)
    c.drawString(120, 205, 'Swipe voor wat je ermee kunt →')
    c.showPage()

def slide(nr, totaal, kop, sub, punten, accent=None):
    kader()
    c.setFillColor(AMBER)
    c.setFont('Helvetica-Bold', 26)
    c.drawString(80, H - 130, f'{nr:02d}')
    c.setFillColor(INK)
    c.setFont('Helvetica-Bold', 62)
    y = H - 210
    for r in wrap(kop, 'Helvetica-Bold', 62, W - 160):
        c.drawString(80, y, r); y -= 70
    c.setFillColor(HexColor('#57534E'))
    c.setFont('Helvetica', 34)
    for r in wrap(sub, 'Helvetica', 34, W - 160):
        c.drawString(80, y - 10, r); y -= 46
    y -= 40
    c.setFont('Helvetica', 34)
    for p in punten:
        c.setFillColor(AMBER)
        c.rect(80, y + 10, 16, 16, fill=1, stroke=0)
        c.setFillColor(INK)
        regels = wrap(p, 'Helvetica', 34, W - 190)
        for j, r in enumerate(regels):
            c.drawString(120, y, r); y -= 44
        y -= 18
    if accent:
        c.setFillColor(HexColor('#FFFBEB'))
        c.rect(80, 130, W - 160, 110, fill=1, stroke=0)
        c.setStrokeColor(AMBER); c.setLineWidth(5)
        c.line(80, 130, 80, 240)
        c.setFillColor(HexColor('#78350F')); c.setFont('Helvetica-Oblique', 30)
        for i, r in enumerate(wrap(accent, 'Helvetica-Oblique', 30, W - 220)):
            c.drawString(110, 195 - i * 38, r)
    voet(nr, totaal)
    c.showPage()

def slotslide(nr, totaal):
    kader(donker=True)
    c.setFillColor(AMBER); c.setFont('Helvetica-Bold', 26)
    c.drawString(80, H - 150, 'AAN DE SLAG')
    c.setFillColor(PAPER); c.setFont('Helvetica-Bold', 72)
    c.drawString(80, H - 260, 'Downloaden en')
    c.drawString(80, H - 340, 'meteen beginnen')
    c.setFillColor(GRAY); c.setFont('Helvetica', 36)
    for i, r in enumerate(wrap(
            'Geen account, geen licentiesleutel, geen telemetrie. '
            'Installeer en open je eerste tekening.', 'Helvetica', 36, W - 160)):
        c.drawString(80, H - 440 - i * 48, r)
    c.setFillColor(PAPER); c.setFont('Helvetica-Bold', 40)
    c.drawString(80, 430, 'open-aec.com/open-pdf-studio')
    c.setFillColor(GRAY); c.setFont('Helvetica', 32)
    c.drawString(80, 375, 'Broncode: github.com/OpenAEC-Foundation/open-pdf-studio')
    c.setStrokeColor(AMBER); c.setLineWidth(6)
    c.rect(80, 170, W - 160, 150, fill=0, stroke=1)
    c.setFillColor(GOLD); c.setFont('Helvetica-Bold', 34)
    c.drawString(120, 255, 'Mis je iets? Laat het weten.')
    c.setFillColor(PAPER); c.setFont('Helvetica', 28)
    c.drawString(120, 205, 'Alles wordt in de open ontwikkeld.')
    voet(nr, totaal, donker=True)
    c.showPage()

SLIDES = [
    ('Annoteren zonder omwegen',
     'Alles wat je op een tekening kwijt wilt.',
     ['Markeren, onderstrepen en doorhalen op de echte tekst',
      'Vormen, wolken, pijlen, polylijnen en splines',
      'Tekstvakken, aanhaallijnen en plaknotities',
      'Stempels en herbruikbare handtekeningen'],
     'Annotaties worden echte PDF-annotaties — ook zichtbaar in andere PDF-lezers.'),
    ('Meten op schaal',
     'Van tekening naar maat, zonder rekenmachine.',
     ['Kalibreer de schaal met twee klikken op een bekende maat',
      'Afstand, oppervlakte, omtrek en hoek',
      'Meerdere schalen op één blad via schaalgebieden',
      'Objectsnapping op eindpunten, middens en snijpunten'],
     'Een detail 1:20 naast een plattegrond 1:100? Elk gebied houdt zijn eigen schaal.'),
    ('Hoeveelheden bepalen',
     'Tellen en meten komen samen in één staat.',
     ['Telgereedschap met benoemde categorieën',
      'Lengtes, oppervlakken en aantallen in één overzicht',
      'Groeperen, sorteren, subtotalen en eindtotaal',
      'De staat als tabel terug op de tekening plaatsen'],
     None),
    ('Bouwkundige symbolen',
     'Parametrisch, niet zomaar een plaatje.',
     ['Wanden, balken, stramienen, peilmaten en profielen',
      'Constructie: opleggingen, punt- en q-lasten, veren, windverband',
      'Bouwplaats: kraan met zwenkstraal, draaicirkel, keet, parkeervak',
      'NEN 1414-sets voor brand, ventilatie en sprinkler'],
     'Maten en type pas je ná plaatsing aan — de tekening volgt vanzelf.'),
    ('Hoeken die zichzelf afwerken',
     'Tekenen zoals in CAD, zonder naslepen.',
     ['Wanden en balken sluiten automatisch in verstek aan',
      'Ook als de delen elkaar net passeren of te kort blijven',
      'Doorlopend tekenen: elke klik zet het volgende segment',
      'Een echte kruising blijft gewoon een kruising'],
     None),
    ('Revisies vergelijken',
     'Zien wat er veranderd is, zonder overlegverlies.',
     ['Twee revisies naast elkaar of over elkaar heen',
      'Toegevoegd, verwijderd en gewijzigd automatisch herkend',
      'Filterbare wijzigingslijst — klik en spring erheen',
      'Handmatige uitlijning als het blad verschoven is'],
     None),
    ('Het document zelf bewerken',
     'Meer dan annoteren alleen.',
     ['Pagina\'s invoegen, verwijderen, draaien en herordenen',
      'Meerdere PDF\'s samenvoegen tot één document',
      'Watermerken, kop- en voetteksten met variabelen',
      'Redigeren: gevoelige inhoud definitief verwijderen'],
     None),
    ('Gemaakt voor zware tekeningen',
     'A0-bladen met miljoenen lijnen blijven werkbaar.',
     ['Eigen render-engine in Rust, buiten de interface-thread',
      'Meerdere processen naast elkaar — één slechte pagina blokkeert niets',
      'Grote CAD-bladen vullen zich tegel voor tegel in',
      'Vloeiend zoomen en pannen op ware resolutie'],
     None),
    ('Van jou, op jouw machine',
     'Open source, en dat merk je.',
     ['Geen abonnement, geen account, geen telemetrie',
      '39 talen, inclusief rechts-naar-links',
      '5 thema\'s en een instelbare werkomgeving',
      'Sessies en tabbladen komen terug na een herstart'],
     'Documenten blijven lokaal. Alleen de update-controle gaat naar buiten.'),
]

titelslide()
totaal = len(SLIDES) + 2
for i, (kop, sub, punten, accent) in enumerate(SLIDES, start=1):
    slide(i, totaal, kop, sub, punten, accent)
slotslide(totaal, totaal)
c.save()
print('PDF geschreven:', UIT, '—', totaal, 'pagina\'s')
