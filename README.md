# Hahn & Vo — Shop-Website (Redesign-Demo)

Komplettes Redesign von hahn-vo.de als statische Site — Luxusuhren-E-Commerce nach den
H&V Brand Guidelines 2025 (Petrol #0E334F · Creme #FFFAE7 · Weiß · Inter).

## Starten

Doppelklick auf `serve.command` → http://localhost:8440

## Seiten

| Seite | Datei | Inhalt |
|---|---|---|
| Home | `index.html` | Logo-Hero mit Filmloop + Slot-Machine-Roll, New In, Leistungen, Kundenstimmen, 3er-Block, Q&A, Über-uns-Teaser, Instagram |
| Shop | `shop.html` | 74 Produkte, Kategorien Uhren/Zubehör, Filter Marke/Preis/Status, Sortierung, Hover-Bildwechsel, Status-Badges |
| Produkt | `produkt.html?id=…` | Galerie mit Zoom, Spec-Tabelle, Warenkorb/WhatsApp/Showroom-CTAs |
| Ankauf | `ankauf.html` | Leitfaden-Wizard (8 Schritte, nach Goatwatch-Vorbild), 4 Optionen, 4-Schritte-Prozess, Ankauf-FAQ |
| Suchauftrag | `suchauftrag.html` | Find-my-watch-Wizard (7 Schritte), Sourcing-Prozess, Korea-Story |
| Über uns | `ueber-uns.html` | Gründerstory, Werte, Showroom mit Terminanfrage |
| Kasse | `checkout.html` | 5 Schritte: Warenkorb → Daten → Übergabe → Zahlung → Prüfen, Bestellnummer |
| Rechtliches | `impressum/datenschutz/agb/widerruf.html` | Demo-Fassungen, vor Launch juristisch prüfen |

## Daten

Der Bestand kommt **live aus Shopify**. Eine Uhr wird nur dort gepflegt,
Website und Chrono24-Feed ziehen nach — siehe `WEBSITE-KATALOG.md`.

| Adresse | Aufgabe |
|---|---|
| `/api/katalog.json` | erzeugt den Katalog bei jedem Aufruf aus Shopify (`api/katalog.js`) |
| `/chrono24.xml` | derselbe Bestand als XML fuer Chrono24 (`api/chrono24.js`) |
| `api/_shop.js` | gemeinsamer Unterbau: Shopify-Abfrage, Markenliste |

`js/data.js` ist nur noch die **Rueckfalllosung**: Antwortet Shopify nicht
innerhalb von 2,5 Sekunden, zeigt die Seite den dort hinterlegten Stand.
Welcher Weg gerade greift, verraet `HV.katalogQuelle` in der Browser-Konsole.
Auffrischen:

```
python3 tools/fallback_bauen.py            # aus Shopify holen, data.js schreiben
python3 tools/fallback_bauen.py --dry-run
```

Angefasst werden dabei nur `window.PRODUCTS` und `window.SHOPIFY`.
Kundenstimmen, FAQ, Kontaktdaten und die Flaggschiff-Auswahl (`window.NEW_IN`,
`window.FLAGSHIP_ID`) bleiben Handarbeit.

> `tools/archiv-alt_build_data.py` baute data.js frueher aus dem alten
> hahn-vo.de-Shop. Es ist gesperrt: Jene Schnittstelle enthaelt verkaufte
> Uhren (66 Eintraege gegenueber 63 live) und wuerde den Stand verschlechtern.

**Instagram-Beitraege:** Das Raster auf der Startseite zeigt die echten
Beitraege von @hahn.vo. Neu holen mit

```
python3 tools/fetch_instagram.py            # 4 Beitraege
python3 tools/fetch_instagram.py --anzahl 8
```

Das Werkzeug rendert das oeffentliche Profil (kein Login noetig), zieht je
Beitrag die 900-px-Fassung aus der Einbettung, speichert sie unter
`assets/img/ig/` und schreibt `js/ig-posts.js`. Es ist eine Momentaufnahme —
fuer neue Beitraege erneut ausfuehren.

Stand 27.08.2026: **76 Produkte** — 74 Uhren und 2 Zubehoerartikel.
Produktbilder der Altbestaende liegen lokal unter `assets/products/p<id>/`,
neuere kommen von der Shopify-Adresse. Interner Code je Uhr ist Hannes'
Artikelnummer aus der Inventarliste, ohne Praefix — `427` oder `550-26`.
Er ist zugleich die Artikelnummer auf Chrono24 und der Verwendungszweck bei
Bankueberweisung.

**Kundenstimmen:** echt — sechs Rezensionen samt Fotos, die Hannes am
28.08.2026 aus WhatsApp weitergegeben hat, Wortlaut unveraendert. Gepflegt in
`window.TESTIMONIALS` (js/data.js: name, watch, img, text), Fotos unter
`assets/img/reviews/`. Die Startseite baut daraus eine gepinnte, vom Scrollen
geblaetterte Buehne (js/home.js, css/home.css `.st-*`); ohne Bewegung wird
daraus eine ruhige Liste.

**Platzhalter:** Showroom-Fotos
(`way-showroom.jpg`, `showroom-band.jpg`) und das Ankauf-Motiv
(`way-ankauf.jpg`) sind echte Aufnahmen des Hauses, vom Kunden geliefert
(21.08.2026) — vorlaeufig, bis professionelle Fotos vorliegen.

## Technik

- Statisch, kein Build-Schritt. GSAP + ScrollTrigger + Lenis lokal gevendort, Inter variable lokal.
- `js/shell.js` injiziert Header/Footer/Cart-Drawer auf jeder Seite.
- Warenkorb in `localStorage` (`hv_cart_v1`), Bestellungen/Formulare ebenso (`hv_orders`, `hv_ankauf_requests`, `hv_suchauftrag_requests`) — kein Backend.
- Checkout laeuft ueber die Shopify-Kasse (Storefront-API). Dort sind derzeit
  Kreditkarte, Apple Pay, Google Pay, Shop Pay, PayPal und Bankueberweisung
  freigeschaltet; siehe SHOPIFY-EINRICHTUNG.md.
- Kontakt/Socials echt: info@hahntime.com, WhatsApp +49 176 203 800 47 (auch im Impressum),
  Telefon +49 176 8421 1760, IG @hahn.vo, TikTok @hahn.vo, YouTube @hahn-vo.

Port 8440 (Vergabe: 8408 De Shi, 8412 Marit, 8418 hahnvo-lmse, 8420 Terheggen, 8433 Lindenkamp).
