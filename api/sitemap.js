/* HAHN & VO — Sitemap, live aus Shopify.
 *
 * Erreichbar unter /sitemap.xml (Umleitung in vercel.json). Wie der
 * Chrono24-Feed entsteht sie bei jedem Abruf neu: Eine neue Uhr steht darin,
 * sobald sie in Shopify angelegt ist, eine verkaufte fällt heraus.
 *
 * Verkaufte Uhren bleiben bewusst drin — ihre Seiten existieren weiter und
 * ziehen Besucher an, die dann Ähnliches im Bestand finden.
 */

var shop = require('./_shop');

/* Feste Seiten. Die Rechtstexte stehen bewusst hinten: Sie sollen gefunden
 * werden, aber nicht mit den Uhren um Aufmerksamkeit ringen. */
var SEITEN = [
  { pfad: '/', prio: '1.0', frequenz: 'daily' },
  { pfad: '/shop', prio: '0.9', frequenz: 'daily' },
  { pfad: '/ankauf', prio: '0.8', frequenz: 'monthly' },
  { pfad: '/suchauftrag', prio: '0.8', frequenz: 'monthly' },
  { pfad: '/ueber-uns', prio: '0.7', frequenz: 'monthly' },
  { pfad: '/referenz-checker', prio: '0.6', frequenz: 'monthly' },
  { pfad: '/impressum', prio: '0.2', frequenz: 'yearly' },
  { pfad: '/datenschutz', prio: '0.2', frequenz: 'yearly' },
  { pfad: '/agb', prio: '0.2', frequenz: 'yearly' },
  { pfad: '/widerruf', prio: '0.2', frequenz: 'yearly' },
];

function xmlEscape(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

async function baueSitemap(basis) {
  var heute = new Date().toISOString().slice(0, 10);
  var eintraege = SEITEN.map(function (s) {
    return '  <url>\n' +
      '    <loc>' + xmlEscape(basis + s.pfad) + '</loc>\n' +
      '    <lastmod>' + heute + '</lastmod>\n' +
      '    <changefreq>' + s.frequenz + '</changefreq>\n' +
      '    <priority>' + s.prio + '</priority>\n' +
      '  </url>\n';
  });

  /* Uhren. Fällt Shopify aus, bleibt wenigstens das Grundgerüst stehen. */
  var anzahlUhren = 0;
  try {
    var bestand = await shop.holeBestand();
    var kennungen = await shop.holeKennungen(basis);
    bestand.forEach(function (p) {
      var id = kennungen[p.shopifyId];
      if (!id) return;
      anzahlUhren++;
      var bild = (p.bilder || [])[0];
      eintraege.push('  <url>\n' +
        '    <loc>' + xmlEscape(basis + '/produkt?id=' + id) + '</loc>\n' +
        '    <lastmod>' + heute + '</lastmod>\n' +
        '    <changefreq>weekly</changefreq>\n' +
        '    <priority>' + (p.verfuegbar ? '0.8' : '0.4') + '</priority>\n' +
        (bild ? '    <image:image>\n' +
          '      <image:loc>' + xmlEscape(bild) + '</image:loc>\n' +
          '      <image:title>' + xmlEscape(p.titel) + '</image:title>\n' +
          '    </image:image>\n' : '') +
        '  </url>\n');
    });
  } catch (e) {
    /* Grundgerüst genügt — lieber eine kurze Sitemap als gar keine. */
  }

  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<!-- ' + SEITEN.length + ' Seiten, ' + anzahlUhren + ' Uhren -->\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
    eintraege.join('') + '</urlset>\n';
}

module.exports = async function handler(req, res) {
  var host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0];
  try {
    var xml = await baueSitemap('https://' + host);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(xml);
  } catch (e) {
    res.status(500).send('Sitemap konnte nicht erzeugt werden: ' + e.message);
  }
};

module.exports.baueSitemap = baueSitemap;
