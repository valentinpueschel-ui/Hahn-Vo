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

`js/data.js` ist die Single Source of Truth (neu bauen: `python3 tools/build_data.py`) — generiert aus dem Live-Bestand von
hahn-vo.de (GoDaddy-Storefront-API, 66 Produkte, Stand 21.08.2026). Produktbilder
liegen lokal unter `assets/products/p<id>/`. Regenerieren: Script im Scratchpad
(`build_datajs.py`) bzw. neu scrapen über `…onlinestore.godaddy.com/api/v1/products`.

**Demo-Staging:** Die Status „reserviert" (4 Uhren) und „verkauft" (5 Uhren) sind für
die Demo gesetzt — im Live-Bestand ist alles erhältlich. Kundenstimmen sind
redaktionelle Platzhalter. Showroom-Fotos (`way-showroom.jpg`, `showroom-band.jpg`)
sind KI-Visualisierungen (Higgsfield Cinema Studio 2.5).

## Technik

- Statisch, kein Build-Schritt. GSAP + ScrollTrigger + Lenis lokal gevendort, Inter variable lokal.
- `js/shell.js` injiziert Header/Footer/Cart-Drawer auf jeder Seite.
- Warenkorb in `localStorage` (`hv_cart_v1`), Bestellungen/Formulare ebenso (`hv_orders`, `hv_ankauf_requests`, `hv_suchauftrag_requests`) — kein Backend.
- Checkout ist funktional bis zur Bestellbestätigung; Zahlarten: Überweisung, Zahlung im Showroom, Finanzierungsanfrage.
- Kontakt/Socials echt: info@hahntime.com, WhatsApp +49 176 8421 1760, IG @hahn.vo, TikTok @hahn.vo.

Port 8440 (Vergabe: 8408 De Shi, 8412 Marit, 8418 hahnvo-lmse, 8420 Terheggen, 8433 Lindenkamp).
