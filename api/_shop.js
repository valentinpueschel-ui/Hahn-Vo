/* HAHN & VO — gemeinsamer Unterbau für /chrono24.xml und /api/katalog.json.
 *
 * Holt den Bestand aus der Shopify-Storefront-API und bringt ihn in eine
 * Form, mit der beide Ausgaben arbeiten können. Dateien mit Unterstrich
 * bedient Vercel nicht als eigene Adresse — das hier ist nur ein Baustein.
 */

var SHOP = 'tami1g-0j.myshopify.com';
var STOREFRONT_TOKEN = '89c87251e5d1f73c1302b1674ba75b69';
var API = 'https://' + SHOP + '/api/2024-10/graphql.json';

/* Die Metafelder im Namensraum „uhr". */
var FELDER = ['referenz', 'baujahr', 'durchmesser', 'gehaeuse', 'zifferblatt', 'band',
  'aufzug', 'kaliber', 'zustand', 'lieferumfang', 'geschlecht', 'code',
  'besteuerung', 'glas', 'chrono24', 'reserviert'];

/* Marken mit mehreren Wörtern lassen sich nicht am ersten Leerzeichen
 * abtrennen — „A. Lange & Söhne" wäre sonst die Marke „A.". Deshalb eine
 * feste Liste, längster Treffer gewinnt. Schreibweise links ist die
 * verbindliche, die Aliasse fangen Varianten aus den Produkttiteln ab. */
var MARKEN = [
  { name: 'A. Lange & Söhne', alias: ['a. lange & söhne', 'a. lange und söhne', 'a.lange & söhne', 'lange & söhne'] },
  { name: 'Baume & Mercier', alias: ['baume & mercier', 'baume und mercier', 'baume mercier'] },
  { name: 'Girard Perregaux', alias: ['girard perregaux', 'girard-perregaux'] },
  { name: 'Jaeger-LeCoultre', alias: ['jaeger-lecoultre', 'jaeger le coultre', 'jaeger lecoultre'] },
  { name: 'Patek Philippe', alias: ['patek philippe'] },
  { name: 'TAG Heuer', alias: ['tag heuer'] },
  { name: 'Vacheron Constantin', alias: ['vacheron constantin'] },
  /* „IWC Schaffhausen" ist derselbe Hersteller wie „IWC" — der Zusatz gehört
   * weder in die Marke noch in den Modellnamen. */
  { name: 'IWC', alias: ['iwc schaffhausen', 'iwc'] },
  { name: 'Breitling', alias: ['breitling'] },
  { name: 'Bvlgari', alias: ['bvlgari', 'bulgari'] },
  { name: 'Cartier', alias: ['cartier'] },
  { name: 'Hublot', alias: ['hublot'] },
  { name: 'Longines', alias: ['longines'] },
  { name: 'MB&F', alias: ['mb&f'] },
  { name: 'Nomos', alias: ['nomos'] },
  { name: 'Omega', alias: ['omega'] },
  { name: 'Panerai', alias: ['panerai'] },
  { name: 'Rolex', alias: ['rolex'] },
  { name: 'Sinn', alias: ['sinn'] },
  { name: 'Tudor', alias: ['tudor'] },
];

function markeUndModell(titel) {
  var t = String(titel || '').trim();
  var klein = t.toLowerCase();
  var beste = null;
  MARKEN.forEach(function (m) {
    m.alias.forEach(function (a) {
      if (klein.indexOf(a) === 0 && (!beste || a.length > beste.laenge)) {
        beste = { name: m.name, laenge: a.length };
      }
    });
  });
  if (!beste) {
    /* Unbekannte Marke: erstes Wort, damit trotzdem etwas Sinnvolles dasteht. */
    var erstes = t.split(' ')[0];
    return { marke: erstes, modell: t.slice(erstes.length).trim() || t };
  }
  var rest = t.slice(beste.laenge).trim().replace(/^[-–—·,]\s*/, '');
  return { marke: beste.name, modell: rest || t };
}

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
    'variants(first:1){edges{node{id price{amount} compareAtPrice{amount}}}} ' +
    'metafields(identifiers:[' + ids + ']){key value}}}}}';
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

/* Liefert alle Produkte in einheitlicher Form. */
async function holeBestand() {
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
    if (daten.errors) throw new Error('Shopify: ' + JSON.stringify(daten.errors).slice(0, 300));
    var seite = daten.data.products;
    seite.edges.forEach(function (e) {
      var n = e.node;
      var f = {};
      (n.metafields || []).forEach(function (m) { if (m && m.value) f[m.key] = m.value; });
      var v = ((n.variants.edges[0] || {}).node) || {};
      var mm = markeUndModell(n.title);
      alle.push({
        shopifyId: String(n.id).split('/').pop(),
        variantId: v.id || null,
        titel: n.title,
        marke: mm.marke,
        modell: mm.modell,
        beschreibung: beschreibungAusHtml(n.descriptionHtml),
        verfuegbar: !!n.availableForSale,
        preis: v.price ? Math.round(parseFloat(v.price.amount)) : null,
        listenpreis: v.compareAtPrice ? Math.round(parseFloat(v.compareAtPrice.amount)) : null,
        bilder: (n.images.edges || []).map(function (b) { return b.node.url; }),
        f: f,
      });
    });
    if (!seite.pageInfo.hasNextPage) break;
    cursor = seite.pageInfo.endCursor;
  }
  return alle;
}

/* Zuordnung Shopify-Produkt → Uhren-Kennung der Website, aus js/data.js.
 * So behalten bestehende Uhren ihre Adresse (produkt.html?id=p426), auch wenn
 * der Katalog aus Shopify kommt. */
async function holeKennungen(basis) {
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

module.exports = {
  SHOP: SHOP,
  STOREFRONT_TOKEN: STOREFRONT_TOKEN,
  FELDER: FELDER,
  MARKEN: MARKEN,
  markeUndModell: markeUndModell,
  beschreibungAusHtml: beschreibungAusHtml,
  holeBestand: holeBestand,
  holeKennungen: holeKennungen,
};
