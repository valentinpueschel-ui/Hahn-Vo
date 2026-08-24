# Hahn & Vo — Shop-Website (Redesign-Demo)

Komplettes Redesign von hahn-vo.de als statische Site — Luxusuhren-E-Commerce nach den
H&V Brand Guidelines 2025 (Petrol #0E334F · Creme #FFFAE7 · Weiß · Inter).

## Starten

Doppelklick auf `serve.command` → http://localhost:8440

## Seiten

| Seite | Datei | Inhalt |
|---|---|---|
| Home | `index.html` | Logo-Hero mit Filmloop + Slot-Machine-Roll, New In, Leistungen, Kundenstimmen, 3er-Block, Q&A, Über-uns-Teaser, Instagram |
| Shop | `shop.html` | 62 echte Produkte, Kategorien Uhren/Zubehör, Filter Marke/Preis/Status, Sortierung, Hover-Bildwechsel, Status-Badges |
| Produkt | `produkt.html?id=…` | Galerie mit Zoom, Spec-Tabelle, Warenkorb/WhatsApp/Showroom-CTAs |
| Ankauf | `ankauf.html` | Leitfaden-Wizard (8 Schritte, nach Goatwatch-Vorbild), 4 Optionen, 4-Schritte-Prozess, Ankauf-FAQ |
| Suchauftrag | `suchauftrag.html` | Find-my-watch-Wizard (7 Schritte), Sourcing-Prozess, Korea-Story |
| Über uns | `ueber-uns.html` | Gründerstory, Werte, Showroom mit Terminanfrage |
| Kasse | `checkout.html` | 5 Schritte: Warenkorb → Daten → Übergabe → Zahlung → Prüfen, Bestellnummer |
| Rechtliches | `impressum/datenschutz/agb/widerruf.html` | Demo-Fassungen, vor Launch juristisch prüfen |

## Daten

`js/data.js` ist die einzige Wahrheitsquelle für Produkte — erzeugt aus dem
Live-Bestand von hahn-vo.de:

```
python3 tools/build_data.py          # Bestand holen, Bilder laden, data.js schreiben
python3 tools/build_data.py --dry-run
```

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

**Wichtig zur Quelle:** Der Shop liest aus
`https://<websiteId>.mysimplestore.com/api/v2/products`. Die ältere Adresse
`onlinestore.godaddy.com/api/v1/products` liefert einen **veralteten Stand**
(am 21.08.2026 fehlten dort 32 neue Uhren und 28 längst verkaufte standen noch
drin). Immer die v2-Adresse verwenden.

Stand 21.08.2026: **66 Uhren**. Produktbilder liegen lokal unter
`assets/products/p<id>/`, interner Code je Uhr ist `HV-<id>`.

**Kundenstimmen:** echt — Wortlaut und Fotos von hahn-vo.de/suchanfrage-einer-uhr
uebernommen (24.08.2026), Fotos unter `assets/img/reviews/`. Kaufdatum und
Uhrenmodell werden nur angezeigt, wenn sie in `js/data.js` gepflegt sind.

**Platzhalter:** Showroom-Fotos
(`way-showroom.jpg`, `showroom-band.jpg`) und das Ankauf-Motiv
(`way-ankauf.jpg`) sind echte Aufnahmen des Hauses, vom Kunden geliefert
(21.08.2026) — vorlaeufig, bis professionelle Fotos vorliegen.

## Technik

- Statisch, kein Build-Schritt. GSAP + ScrollTrigger + Lenis lokal gevendort, Inter variable lokal.
- `js/shell.js` injiziert Header/Footer/Cart-Drawer auf jeder Seite.
- Warenkorb in `localStorage` (`hv_cart_v1`), Bestellungen/Formulare ebenso (`hv_orders`, `hv_ankauf_requests`, `hv_suchauftrag_requests`) — kein Backend.
- Checkout ist funktional bis zur Bestellbestätigung; Zahlarten: Überweisung, Zahlung im Showroom, Finanzierungsanfrage.
- Kontakt/Socials echt: info@hahntime.com, WhatsApp +49 176 203 800 47 (auch im Impressum),
  Telefon +49 176 8421 1760, IG @hahn.vo, TikTok @hahn.vo, YouTube @hahn-vo.

Port 8440 (Vergabe: 8408 De Shi, 8412 Marit, 8418 hahnvo-lmse, 8420 Terheggen, 8433 Lindenkamp).
