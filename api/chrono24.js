/* HAHN & VO — Chrono24-Warenfeed.
 *
 * Chrono24 ruft diese Adresse alle 12–24 Stunden ab und liest den Bestand
 * daraus. Die Datei wird bei jedem Abruf neu erzeugt, direkt aus Shopify —
 * es gibt also nichts hochzuladen und nichts, was veralten kann.
 *
 * Erreichbar unter /chrono24.xml (Umleitung in vercel.json).
 *
 * Was ihr hier einstellen könnt, steht direkt darunter unter EINSTELLUNGEN.
 */

var EINSTELLUNGEN = {
  /* Aufschlag auf den Website-Preis, nur für Chrono24.
   * Erst Prozent, dann Euro. 0 und 0 heißt: gleicher Preis wie auf der Website.
   * Beispiel 5 % und 0 €: aus 3.390 € werden 3.560 €. */
  aufschlagProzent: 0,
  aufschlagEuro: 0,

  /* Auf volle 10 € aufrunden, damit keine krummen Preise entstehen. */
  rundenAuf: 10,

  /* Uhren ohne Bestand gar nicht erst ausliefern. Dadurch verschwindet eine
   * verkaufte Uhr beim nächsten Abruf von selbst aus Chrono24. */
  nurVerfuegbare: true,

  /* Einzelne Uhren dauerhaft heraushalten — interne Codes, z. B. ['HV-426'].
   * Für einzelne Uhren geht es auch ohne Code-Änderung: In Shopify beim
   * Produkt das Feld „Chrono24" auf „nein" setzen. */
  ausschluss: [],

  /* Zubehör gehört nicht in einen Uhrenmarktplatz. Erkannt am fehlenden
   * Aufzug: Eine Faltschließe hat keinen, eine Taschenuhr ohne
   * Referenznummer sehr wohl. */
  nurUhren: true,
};

var SHOP = 'tami1g-0j.myshopify.com';
var STOREFRONT_TOKEN = '89c87251e5d1f73c1302b1674ba75b69';
var API = 'https://' + SHOP + '/api/2024-10/graphql.json';

/* ---------- Übersetzung ins Chrono24-Vokabular ---------- */

var ZUSTAND = {
  'neu': 'brand new',
  'ungetragen': 'unworn',
  'sehr gut': 'very good (mint)',
  'gut': 'good (fine)',
  'befriedigend': 'fair',
  'defekt': 'scrap (incomplete/defect)',
};

var AUFZUG = {
  'automatik': 'automatic',
  'handaufzug': 'manual winding',
  'quarz': 'quartz',
};

var GLAS = {
  'saphirglas': 'sapphire glass',
  'mineralglas': 'mineral glass',
  'plexiglas': 'plexiglass',
  'kunststoff': 'plastic',
};

var GESCHLECHT = { 'herren': 'Mens', 'damen': 'Ladies' };

/* Materialien und Farben. Zusammensetzungen wie „Edelstahl/Gelbgold" werden
 * Bestandteil für Bestandteil übersetzt. */
var MATERIAL = {
  'edelstahl': 'Steel',
  'stahl': 'Steel',
  'titan': 'Titanium',
  'gelbgold': 'Yellow gold',
  'weißgold': 'White gold',
  'weissgold': 'White gold',
  'rotgold': 'Rose gold',
  'roségold': 'Rose gold',
  'rosegold': 'Rose gold',
  'gold': 'Gold',
  'keramik': 'Ceramic',
  'bronze': 'Bronze',
  'silber': 'Silver',
  'platin': 'Platinum',
  'leder': 'Leather',
  'kautschuk': 'Rubber',
  'kautschukband': 'Rubber',
  'textil': 'Textile',
  'stoff': 'Textile',
};

var FARBE = {
  'schwarz': 'Black',
  'blau': 'Blue',
  'weiß': 'White',
  'weiss': 'White',
  'silber': 'Silver',
  'grau': 'Grey',
  'grün': 'Green',
  'gruen': 'Green',
  'aqua green': 'Green',
  'braun': 'Brown',
  'hellbraun': 'Light brown',
  'burgunderrot': 'Bordeaux',
  'rot': 'Red',
  'gold': 'Gold',
  'champagner': 'Champagne',
  'anthrazit': 'Anthracite',
};

/* Lieferumfang → Papiere und Box getrennt. */
var LIEFERUMFANG = {
  'full set (box & papiere)': { papiere: true, box: true },
  'nur papiere': { papiere: true, box: false },
  'nur box': { papiere: false, box: true },
  'nur uhr': { papiere: false, box: false },
};

/* Klammerzusätze wie „(siehe Bilder)" gehören nicht ins Datenfeld, sondern
 * allenfalls in die Beschreibung. */
function kern(wert) {
  return String(wert || '').replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

function uebersetze(wert, tabelle) {
  var k = kern(wert).toLowerCase();
  if (!k) return null;
  if (tabelle[k]) return tabelle[k];
  /* Zusammensetzungen: „Edelstahl/Gelbgold", „Leder / Kautschuk", „Edelstahl + Kautschukband" */
  var teile = k.split(/\s*[\/+,]\s*/).filter(Boolean);
  if (teile.length > 1) {
    var uebersetzt = teile.map(function (t) { return tabelle[t.trim()] || null; });
    if (uebersetzt.every(Boolean)) return uebersetzt.join('/');
  }
  /* „Edelstahl 904L" → führendes bekanntes Wort gewinnt */
  var erstes = k.split(/[\s,]/)[0];
  return tabelle[erstes] || null;
}

function zustandNachChrono24(wert) {
  var k = kern(wert).toLowerCase();
  if (ZUSTAND[k]) return ZUSTAND[k];
  var treffer = Object.keys(ZUSTAND).filter(function (s) { return k.indexOf(s) === 0; });
  return treffer.length ? ZUSTAND[treffer.sort(function (a, b) { return b.length - a.length; })[0]] : null;
}

function preisFuerChrono24(betrag) {
  var p = Number(betrag);
  if (!isFinite(p) || p <= 0) return null;
  p = p * (1 + EINSTELLUNGEN.aufschlagProzent / 100) + EINSTELLUNGEN.aufschlagEuro;
  var stufe = EINSTELLUNGEN.rundenAuf;
  if (stufe > 0) p = Math.round(p / stufe) * stufe;
  return Math.round(p);
}

function xmlEscape(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    /* Steuerzeichen entfernen, sonst ist die Datei nicht wohlgeformt */
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

function tag(name, wert) {
  if (wert == null || wert === '') return '';
  return '      <' + name + '>' + xmlEscape(wert) + '</' + name + '>\n';
}

/* ---------- Daten holen ---------- */

var FELDER = ['referenz', 'baujahr', 'durchmesser', 'gehaeuse', 'zifferblatt', 'band',
  'aufzug', 'kaliber', 'zustand', 'lieferumfang', 'geschlecht', 'code',
  'besteuerung', 'glas', 'chrono24'];

function abfrage(cursor) {
  var ids = FELDER.map(function (k) {
    return '{namespace:"uhr",key:"' + k + '"}';
  }).join(',');
  return '{products(first:50' + (cursor ? ',after:"' + cursor + '"' : '') + '){' +
    'pageInfo{hasNextPage endCursor}' +
    /* Bestandszahlen darf der öffentliche Token nicht lesen; availableForSale
     * genügt: Shopify setzt es auf false, sobald der Bestand 0 ist. */
    'edges{node{id title descriptionHtml availableForSale ' +
    'images(first:16){edges{node{url}}} ' +
    'variants(first:1){edges{node{price{amount}}}} ' +
    'metafields(identifiers:[' + ids + ']){key value}}}}}';
}

async function holeProdukte() {
  var alle = [], cursor = null;
  for (var runde = 0; runde < 10; runde++) {
    var antwort = await fetch(API, {
      method: 'POST',
      headers: {
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: abfrage(cursor) }),
    });
    if (!antwort.ok) throw new Error('Shopify antwortet mit ' + antwort.status);
    var daten = await antwort.json();
    if (daten.errors) throw new Error('Shopify: ' + JSON.stringify(daten.errors));
    var seite = daten.data.products;
    seite.edges.forEach(function (e) { alle.push(e.node); });
    if (!seite.pageInfo.hasNextPage) break;
    cursor = seite.pageInfo.endCursor;
  }
  return alle;
}

/* Verweis auf unsere eigene Produktseite. Die Zuordnung Uhr ↔ Shopify-Produkt
 * steht in js/data.js, damit es dafür keine zweite Quelle gibt. */
async function holeVerweise(basis) {
  try {
    var antwort = await fetch(basis + '/js/data.js');
    if (!antwort.ok) return {};
    var text = await antwort.text();
    var treffer = text.match(/window\.SHOPIFY\s*=\s*(\{[\s\S]*?\n\});/);
    if (!treffer) return {};
    var karte = JSON.parse(treffer[1]).products || {};
    var umgekehrt = {};
    Object.keys(karte).forEach(function (uhrId) {
      umgekehrt[String(karte[uhrId])] = uhrId;
    });
    return umgekehrt;
  } catch (e) {
    return {};
  }
}

function beschreibungAusHtml(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* ---------- Feed bauen ---------- */

function baueArtikel(p, verweise, basis) {
  var f = {};
  (p.metafields || []).forEach(function (m) { if (m && m.value) f[m.key] = m.value; });

  var code = f.code;
  if (!code) return null;
  if (EINSTELLUNGEN.ausschluss.indexOf(code) !== -1) return null;
  if (String(f.chrono24 || '').trim().toLowerCase().match(/^(nein|no|aus|false|0)$/)) return null;
  if (EINSTELLUNGEN.nurUhren && !f.aufzug) return null;
  if (EINSTELLUNGEN.nurVerfuegbare && !p.availableForSale) return null;

  var variante = ((p.variants.edges[0] || {}).node) || {};
  var preis = preisFuerChrono24(variante.price && variante.price.amount);
  if (!preis) return null;

  /* Erstes Wort des Titels ist die Marke, der Rest das Modell. */
  var titel = String(p.title || '').trim();
  var marke = titel.split(' ')[0];
  var modell = titel.slice(marke.length).trim() || titel;

  var lieferumfang = LIEFERUMFANG[String(f.lieferumfang || '').toLowerCase()] || null;
  var uhrId = verweise[String(p.id).split('/').pop()];

  var x = '  <article>\n    <basic_information>\n';
  x += tag('article_id', code);
  x += tag('price', preis);
  x += tag('availability', 'in stock');
  x += tag('brand', marke);
  x += tag('model', modell);
  x += tag('product_name', titel);
  x += tag('reference_number', f.referenz);
  x += tag('gender', uebersetze(f.geschlecht, GESCHLECHT));
  x += tag('condition', zustandNachChrono24(f.zustand));
  x += tag('taxation_scheme',
    String(f.besteuerung || '').toLowerCase().indexOf('differenz') === 0 ? 'margin' : 'regular');
  if (uhrId) x += tag('link', basis + '/produkt.html?id=' + uhrId);
  x += tag('description', beschreibungAusHtml(p.descriptionHtml));
  x += '    </basic_information>\n';

  var werk = tag('movement_type', uebersetze(f.aufzug, AUFZUG)) + tag('caliber', f.kaliber);
  if (werk) x += '    <caliber>\n' + werk + '    </caliber>\n';

  var gehaeuse = tag('case_material', uebersetze(f.gehaeuse, MATERIAL)) +
    tag('case_diameter', kern(f.durchmesser)) +
    tag('crystal', uebersetze(f.glas, GLAS)) +
    tag('dial_color', uebersetze(f.zifferblatt, FARBE));
  if (gehaeuse) x += '    <case>\n' + gehaeuse + '    </case>\n';

  var band = tag('bracelet_material', uebersetze(f.band, MATERIAL));
  if (band) x += '    <bracelet>\n' + band + '    </bracelet>\n';

  var sonst = '';
  if (lieferumfang) {
    sonst += tag('original_papers', lieferumfang.papiere ? 'yes' : 'no');
    sonst += tag('original_box', lieferumfang.box ? 'yes' : 'no');
  }
  sonst += tag('year', f.baujahr);
  if (sonst) x += '    <miscellaneous>\n' + sonst + '    </miscellaneous>\n';

  var bilder = (p.images.edges || []).map(function (e) { return e.node.url; }).slice(0, 16);
  if (bilder.length) {
    x += '    <images>\n';
    bilder.forEach(function (u) { x += tag('image', u); });
    x += '    </images>\n';
  }

  return x + '  </article>\n';
}

async function baueFeed(basis) {
  var produkte = await holeProdukte();
  var verweise = await holeVerweise(basis);
  var artikel = [];
  var ausgelassen = [];
  produkte.forEach(function (p) {
    var a = baueArtikel(p, verweise, basis);
    if (a) artikel.push(a); else ausgelassen.push(p.title);
  });
  var xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<!-- Hahn & Vo OHG — Warenbestand, erzeugt am ' + new Date().toISOString() + ' -->\n' +
    '<!-- ' + artikel.length + ' Artikel von ' + produkte.length + ' im Shop -->\n' +
    '<articles>\n' + artikel.join('') + '</articles>\n';
  return { xml: xml, anzahl: artikel.length, gesamt: produkte.length, ausgelassen: ausgelassen };
}

module.exports = async function handler(req, res) {
  var host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0];
  var basis = 'https://' + host;
  try {
    var ergebnis = await baueFeed(basis);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    /* Chrono24 ruft alle 12–24 h ab; eine Stunde Zwischenspeicher genügt. */
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(ergebnis.xml);
  } catch (e) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(500).send('Feed konnte nicht erzeugt werden: ' + e.message);
  }
};

module.exports.baueFeed = baueFeed;
module.exports.EINSTELLUNGEN = EINSTELLUNGEN;
