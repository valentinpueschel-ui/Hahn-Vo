/* HAHN & VO — Weiterleitung von der Shopify-Storefront auf die Website.
 *
 * Shopify liefert bei uns nur Katalog und Kasse. Die mitgelieferte Storefront
 * unter shop.hahn-vo.de ist nicht unser Auftritt — wer dort landet, etwa mit
 * dem Zurück-Weg aus der Kasse, soll auf hahn-vo.de weitergeleitet werden.
 *
 * Shopify hängt diese Datei über einen Script-Tag in alle Storefront-Seiten
 * ein. Die Kasse selbst bekommt sie nicht — dort laufen keine Script-Tags.
 * Zusätzlich sind unten die Pfade ausgenommen, die zum Kaufvorgang gehören.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * AUS seit 07.09.2026 — Shopify Trust & Safety, Ticket 8142a75a.
 *
 * Der Prüfer ruft die Ladenadresse des Shopify-Kontos auf, wird von hier
 * nach hahn-vo.de geworfen, sieht dort die Uhren über 10.000 USD stehen und
 * kann deshalb nicht bestätigen, dass sie aus dem Shopify-Laden entfernt
 * wurden. Solange die Prüfung läuft, muss shop.hahn-vo.de für ihn erreichbar
 * bleiben.
 *
 * WIEDER EINSCHALTEN, sobald Shopify die Prüfung geschlossen und die
 * Auszahlung freigegeben hat: unten AKTIV auf true setzen, committen, pushen.
 * Das Shopify-Theme lädt diese Datei unverändert von hahn-vo.de — im
 * Adminbereich ist dafür nichts zu tun.
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  var AKTIV = false;   /* ← auf true = Weiterleitung wieder an */

  if (!AKTIV) return;

  var ZIEL = 'https://hahn-vo.de';

  /* Pfade, die zum Kauf gehören und deshalb unberührt bleiben. */
  var AUSNAHMEN = ['/cart', '/checkout', '/checkouts', '/account', '/orders',
    '/policies', '/tools', '/apps', '/wpm', '/services'];

  var pfad = location.pathname || '/';
  for (var i = 0; i < AUSNAHMEN.length; i++) {
    if (pfad.indexOf(AUSNAHMEN[i]) === 0) return;
  }

  /* Aus einer Produktseite der Storefront wird die Übersicht auf der Website —
   * die Adressen unterscheiden sich, ein Tiefenverweis ginge ins Leere. */
  var ziel = ZIEL + (pfad === '/' ? '/' : '/shop');

  /* replace statt href: Der Zurück-Knopf soll nicht in die Storefront führen. */
  location.replace(ziel);
})();
