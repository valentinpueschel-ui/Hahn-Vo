# Wie hahn-vo.de zusammenhängt

Stand 04.09.2026. Die Landkarte für jeden, der das System übernimmt — Mensch oder Claude.

## Die drei Teile

```
 Hannes / Claude Code                     Besucher
        │                                    │
        │ Skills + tools/uhr.py               │ hahn-vo.de
        ▼                                    ▼
   ┌─────────┐   Storefront-API   ┌──────────────────────┐   git push   ┌────────┐
   │ Shopify │ ◀────────────────  │ Vercel: Website +    │ ◀─────────── │ GitHub │
   │ Produkte│                    │ api/katalog.js       │  (deployt    │ Repo   │
   │ Bestand │  Kasse unter       │ api/chrono24.js      │   in ~40 s)  │        │
   │ Kasse   │  shop.hahn-vo.de   │ api/anfrage.js       │              └────────┘
   └─────────┘                    └──────────────────────┘
                                          │  Resend-Mail
                                          ▼
                                   info@hahntime.com
```

1. **Shopify** (`tami1g-0j.myshopify.com`, Inhaber info@hahntime.com) — hält jede Uhr als Produkt mit Metafeldern im Namensraum `uhr`, den Bestand (1 = erhältlich, 0 = verkauft), das Kennzeichen `uhr.reserviert`, und die Kasse. Der Bestand hier ist die einzige Wahrheit.
2. **Die Website** (dieses Repo, auf Vercel) — statisches HTML/CSS/JS ohne Build-Schritt. Drei Serverfunktionen: `/api/katalog.json` (Bestand aus Shopify, 5 min Edge-Cache), `/chrono24.xml` (derselbe Bestand als Feed), `/api/anfrage` (Formulare → Mail).
3. **GitHub** (`main`) — jeder Push wird von Vercel automatisch ausgeliefert. Wer pushen darf, deployt. Vercel-Zugang braucht nur, wer Analytics, Umgebungsvariablen oder Domain anfassen will.

## Der Weg einer Uhr

| Schritt | Wer | Wo |
|---|---|---|
| Inserat lesen, Bilder holen | `tools/inserat.py` | `arbeit/<name>/` |
| Felder entscheiden, Bilder ansehen | Claude (Skill `uhr-anlegen`) | `arbeit/<name>/uhr.json` |
| Bilder ins Projekt, pushen | `tools/uhr.py` | `assets/products/pXXX/N.jpg` → öffentlich auf hahn-vo.de |
| Produkt, Felder, Preis, Kanäle, Bestand, Bilder | Shopify-Aufrufe aus `tools/uhr.py`, ausgeführt über Connector oder direkt | Shopify |
| Kennung `pXXX` ↔ Shopify-ID | `tools/uhr.py` → `js/data.js` (`window.SHOPIFY.products`) | Repo |
| Rückfalldatei | `tools/fallback_bauen.py` → `js/data.js` (`window.PRODUCTS`) | Repo |
| Live prüfen, committen, pushen | `tools/uhr.py` | hahn-vo.de |

Danach: Website zeigt die Uhr binnen 5 Minuten, Chrono24 zieht sie beim nächsten Abruf (12–24 h).

## Status-Logik

`api/katalog.js`: `status = !verfuegbar ? 'sold' : (reserviert ? 'reserved' : 'available')`.
`verfuegbar` = Storefront `availableForSale` (Bestand > 0). Verkauft schlägt reserviert.
Ausblenden ohne Löschen: interner Code in `AUSSCHLUSS` (`api/katalog.js`).

## Kennungen

- **`pXXX`** — Adresse der Uhr (`/produkt?id=p567`). Neue Uhren: `p` + Code-Präfix (`567-26` → `p567`). Alte Uhren aus dem GoDaddy-Shop haben historische Nummern (p426 …), die nichts mit dem Code zu tun haben — Kollisionen möglich, deshalb `tools/uhr.py frei`.
- **Interner Code** (`uhr.code`, z. B. `567-26`) — Hannes' Artikelnummer. Überweisungszweck, Chrono24-Artikelnummer.
- **SKU** `HV-P567`. **Handle** `<slug>-p567`.
- **Ersatzkennung** `s` + letzte 7 Ziffern der Shopify-ID — bekommt jede Uhr, die nur in Shopify angelegt wurde, ohne Eintrag in `js/data.js`. Funktioniert, ist nur weniger hübsch.

## Datei-Landkarte

| Datei | Aufgabe |
|---|---|
| `index.html`, `shop.html`, `produkt.html`, `ankauf.html`, `suchauftrag.html`, `ueber-uns.html`, `checkout.html`, `referenz-checker.html`, 4 Rechtsseiten | die Seiten |
| `css/base.css`, `home.css`, `pages.css`, `shop.css` … | Gestaltung; Petrol `#0E334F`, Creme `#FFFAE7`, Inter + Marcellus (Wortmarke) |
| `js/shell.js` | Header, Footer, Warenkorb-Drawer auf jeder Seite |
| `js/katalog.js` | holt `/api/katalog.json`, ersetzt `window.PRODUCTS` an Ort und Stelle, 2,5 s Zeitlimit, Ereignis `hv:katalog` |
| `js/data.js` | Rückfalldatei + `window.SHOPIFY.products` (pXXX → Shopify-ID) + `TESTIMONIALS`, `FAQ`, `SITE` |
| `js/home.js` | Startseite: Preloader, Schaufenster/„Neu eingetroffen" (aus Bestand), Kundenstimmen-Deck, Zähler |
| `js/shop.js`, `js/product.js` | Shop-Raster mit Filtern (Marke/Preis/Status), Produktseite mit Galerie und Datenblatt |
| `js/shopify.js`, `js/cart.js`, `js/checkout.js` | Storefront-API, Warenkorb, Übergabe an die Shopify-Kasse |
| `js/wizard.js` | Ankauf- und Suchauftrag-Leitfäden |
| `api/_shop.js` | Shopify-Abfrage, **MARKEN-Liste** (mehrwortige Marken), Kennungen aus data.js |
| `api/katalog.js` | Katalog-Schnittstelle, `AUSSCHLUSS` |
| `api/chrono24.js` | Feed, `EINSTELLUNGEN` (Aufschlag, Rundung, Ausschluss) |
| `api/anfrage.js` | Mailversand (Resend), Empfänger aus `ANFRAGE_AN` |
| `api/sitemap.js` | Sitemap aus dem Bestand |
| `vercel.json` | saubere Adressen, Rewrites (`/api/katalog.json`, `/chrono24.xml`, `/sitemap.xml`), Weiterleitungen vom alten Shop |
| `assets/products/pXXX/` | eigene Bildkopien (Cover 0.jpg, Hover 1.jpg …) |
| `assets/img/reviews/` | Fotos der Kundenstimmen |
| `tools/inserat.py` | Inserat lesen (Kleinanzeigen, eBay, Chrono24, Ordner) |
| `tools/uhr.py` | anlegen / status / preis / loeschen / bilder / pruefen / frei |
| `tools/fallback_bauen.py` | Rückfalldatei aus Shopify, lokale Zuordnung gewinnt |
| `tools/einrichten.sh` | Umgebung prüfen |
| `daten/differenzbesteuerung.csv` | Hannes' Liste der differenzbesteuerten Uhren (ohne Seriennummern) |
| `.claude/skills/*` | die fünf Skills |
| `CLAUDE.md` | Regeln und Kurzfassung für jede Claude-Sitzung |

## Zeiten, die man kennen muss

| Was | Dauer |
|---|---|
| Push → live | ~40 s (statische Dateien, Bilder) |
| Shopify-Änderung → Website | bis 5 min (Edge-Cache von `/api/katalog.json`); `?frisch=1` umgeht ihn — nur für Tests |
| Kasse | immer sofort (rechnet direkt mit Shopify) |
| Chrono24 | 12–24 h |
| Kleinanzeigen-Sperre | 25 s warten, bis zu 6 Versuche |

## Konten (Stand 04.09.2026)

| Dienst | Konto | Aufgabe |
|---|---|---|
| Shopify | Hahn & Vo (info@hahntime.com) | Produkte, Bestand, Kasse, Zahlungen |
| GitHub | `valentinpueschel-ui/Hahn-Vo` (öffentlich) — Übertragung an Hannes geplant | Code, Bilder |
| Vercel | Projekt `hahn-vo-df1c`, Team von Valentin (Hobby) — eigenes Team geplant | Hosting, Analytics, Env-Vars `RESEND_API_KEY`, `ANFRAGE_AN` |
| GoDaddy | Hahn & Vo | Domain hahn-vo.de, DNS (A → Vercel, `www` → Vercel, `shop` → Shopify) |
| Resend | Konto auf info@hahntime.com | Mailversand der Formulare |
| Chrono24 | Händlerkonto `hahnundvo` | Feed-Abnehmer (ob der Feed aktiv ist: mit Chrono24 klären) |

Details zur Übergabe: `docs/UEBERGABE.md`. Was schiefging und warum: `docs/PROBLEME-UND-LOESUNGEN.md`.
Ältere Anleitungen (Domainumzug, Kasse, Siezen, Feed, Anfragen) liegen als `*.md` im Hauptordner.
