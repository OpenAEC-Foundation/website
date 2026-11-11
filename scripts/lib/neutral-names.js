// Release-teksten komen uit de app-repo's en noemen soms andere softwareproducten bij naam.
// Op de website tonen we liever het bestandsformaat of een neutrale omschrijving.
// Beide generatoren (release notes en release highlights) halen elke tekst hierdoor
// voordat ze schrijven; generate-release-notes.js gebruikt het ook als vangnet.
// \p{L}* vangt ook verbogen vormen in andere talen mee, zoals 'MS Projectom' of 'Microsoft Projectiin'.
const VERVANG = [
  // Opsommingen van calculatiepakketten bij het CUF-XML-formaat: één neutrale omschrijving.
  [/\b(?:Ibis|Kraan|ArchiCalc|WpCalc|Matrix|Acto)(?:,\s*(?:Ibis|Kraan|ArchiCalc|WpCalc|Matrix|Acto))+/gu, 'gangbare Nederlandse calculatiepakketten'],
  [/\bIbis\b|\bArchiCalc\b|\bWpCalc\b/gu, 'extern calculatiepakket'],
  [/\b(?:Microsoft|MS)[- ]Project\p{L}*/gu, 'MPP/MSPDI'],
  [/\bPrimavera(?: P6)?\p{L}*|\bP6\b/gu, 'XER'],
  [/\bAsta(?: Powerproject)?\b|\bPower[Pp]roject\p{L}*/gu, 'PP'],
  [/\b(?:Vabi|VABI)(?: Elements)?\p{L}*|\bUniec(?: ?\d+)?\p{L}*/gu, 'extern rekenpakket'],
  [/\bAutoCAD\p{L}*/gu, 'CAD'],
  [/\bRevit\p{L}*|\bArchi[Cc][Aa][Dd]\p{L}*/gu, 'BIM-software'],
  [/\bIBIS[- ]TRAD\b|\bIbis[- ]Trad\b|\bIBIS\b/gu, 'extern calculatieformaat'],
];

function neutralText(text) {
  if (typeof text !== 'string') return text;
  // Links blijven ongemoeid: alleen de tekst tussen de URL's wordt aangepast.
  return text.split(/(https?:\/\/[^\s)\]"'<>]+)/).map((deel, i) => (i % 2
    ? deel
    : VERVANG.reduce((s, [re, door]) => s.replace(re, door), deel))).join('');
}

// Loopt door een JSON-structuur en past elke tekst aan; sleutels en niet-teksten blijven gelijk.
function neutralNames(value) {
  if (typeof value === 'string') return neutralText(value);
  if (Array.isArray(value)) return value.map(neutralNames);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, neutralNames(v)]));
  }
  return value;
}

module.exports = { neutralNames, neutralText };
