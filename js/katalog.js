/* HAHN & VO — Katalog aus Shopify laden.
 *
 * js/data.js enthält weiterhin einen vollständigen Stand. Diese Datei holt
 * unmittelbar danach den aktuellen Bestand von /api/katalog.json und ersetzt
 * ihn. Dadurch reicht es, eine Uhr in Shopify anzulegen — die Website zeigt
 * sie beim nächsten Aufruf, ohne dass jemand Code ändert.
 *
 * Antwortet die Schnittstelle nicht innerhalb von 2,5 Sekunden, bleibt der
 * Stand aus data.js stehen. Die Seite kann dadurch nicht leer werden.
 */
(function () {
  'use strict';
  var HV = (window.HV = window.HV || {});
  var ZEITLIMIT = 2500;

  HV.katalogQuelle = 'data.js';

  function anwenden(daten) {
    if (!daten || !Array.isArray(daten.produkte) || !daten.produkte.length) return;
    /* Die Liste an Ort und Stelle austauschen: Manche Seiten halten schon eine
     * Referenz darauf, die sonst auf den alten Stand zeigen würde. */
    var liste = window.PRODUCTS || (window.PRODUCTS = []);
    liste.length = 0;
    daten.produkte.forEach(function (p) { liste.push(p); });
    if (window.SHOPIFY && daten.shopify) window.SHOPIFY.products = daten.shopify;
    HV.katalogQuelle = 'shopify';
    HV.katalogStand = daten.stand;
  }

  var loesen;
  HV.katalogBereit = new Promise(function (resolve) { loesen = resolve; });
  var erledigt = false;
  function abschliessen() {
    if (erledigt) return;
    erledigt = true;
    loesen(HV.katalogQuelle);
    document.dispatchEvent(new CustomEvent('hv:katalog', { detail: { quelle: HV.katalogQuelle } }));
  }

  /* Sicherheitsnetz, falls die Schnittstelle hängt. */
  setTimeout(abschliessen, ZEITLIMIT);

  try {
    fetch('/api/katalog.json', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { anwenden(d); })
      .catch(function () { /* Stand aus data.js bleibt */ })
      .then(abschliessen, abschliessen);
  } catch (e) {
    abschliessen();
  }

  /* Seiten, die ohne Katalog nichts anzeigen können, warten hierauf. */
  HV.wennKatalogBereit = function (fn) { HV.katalogBereit.then(fn); };
})();
