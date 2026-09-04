# Bestand pflegen — alles in Shopify

Seit dem 26.08.2026 holt die Website ihren Bestand direkt aus Shopify. Für den
Alltag heißt das:

> **Eine Uhr wird nur noch in Shopify gepflegt. Website und Chrono24 ziehen nach.**

Niemand muss mehr eine Datei bearbeiten oder etwas hochladen.

> **Seit 04.09.2026 gibt es dafür Claude-Skills** (`.claude/skills/`, Anleitung in
> `docs/BETRIEB.md`): Link zum Inserat reicht, der Rest läuft geführt. Was unten
> steht, ist der Weg von Hand im Shopify-Adminbereich — er funktioniert weiterhin,
> nur ohne die schöne `pXXX`-Adresse und ohne lokale Reservebilder.

## Was wo landet

| In Shopify | Website | Chrono24 |
|---|---|---|
| Neue Uhr angelegt | erscheint im Shop | neue Anzeige |
| Preis geändert | neuer Preis | neuer Preis |
| Bestand auf 0 gesetzt | „Verkauft", nicht mehr kaufbar | Anzeige verschwindet |
| Bild getauscht | neue Galerie | neue Bilder |
| Beschreibung geändert | neuer Text | neuer Text |
| Uhr gelöscht | verschwindet | verschwindet |

**Wie lange dauert es?** Die Website übernimmt Änderungen nach spätestens
**fünf Minuten**, Chrono24 beim nächsten Abruf, also **innerhalb eines Tages**.
Wer sofort nachsehen will, hängt an die Adresse ein `?x=1` an — das umgeht den
Zwischenspeicher.

## Eine neue Uhr anlegen

*Shopify → Produkte → Produkt hinzufügen*

Pflicht, damit die Uhr überall sauber erscheint:

1. **Titel** — mit der Marke beginnen, z. B. `Rolex Datejust 41 Zifferblatt schwarz`.
   Die Marke wird daraus erkannt, auch mehrwortige wie *A. Lange & Söhne*.
2. **Preis**
3. **Bestand 1** (Einzelstück) und *Bestand verfolgen* an
4. **Bilder** — das erste ist das Titelbild, bis zu 16 gehen an Chrono24
5. **Vertriebskanäle**: Onlineshop und Kaufen-Schaltfläche
6. **Metafelder** ausfüllen, mindestens: Interner Code, Referenz, Aufzug,
   Zustand, Lieferumfang, Besteuerung, Geschlecht, Durchmesser, Gehäuse,
   Zifferblatt, Band, Glas

Der **interne Code** ist wichtig: Er ist die Artikelnummer auf Chrono24 und der
Verwendungszweck bei Banküberweisung. Hannes' Artikelnummer aus der
Inventarliste, ohne Präfix — `427` oder `550-26`.

Ohne Aufzug gilt der Eintrag als **Zubehör**: Er erscheint im Shop unter
Zubehör, aber nicht auf Chrono24. Genau so sind die Faltschließe und das
Reiseetui hinterlegt.

## Wenn eine Uhr verkauft ist

Bestand auf **0** setzen. Sie bleibt dann als „Verkauft" im Shop stehen (gut
für die Wirkung: man sieht, was durchgeht) und verschwindet von Chrono24.
Soll sie ganz weg, das Produkt in Shopify löschen.

## Eine Uhr von Chrono24 fernhalten

Beim Produkt das Metafeld **Chrono24** auf `nein` setzen. Im Shop bleibt sie,
auf Chrono24 erscheint sie nicht. Leer heißt: wird gemeldet.

## Wie es technisch läuft

| Adresse | was sie tut |
|---|---|
| `/api/katalog.json` | erzeugt den Katalog bei jedem Aufruf aus Shopify |
| `/chrono24.xml` | dasselbe als XML für Chrono24 |
| `js/data.js` | Rückfalllösung, Stand vom 26.08.2026 |

Die Seite lädt zuerst `js/data.js` und ersetzt den Stand sofort durch den
Katalog aus Shopify. **Antwortet Shopify nicht innerhalb von 2,5 Sekunden,
bleibt der Stand aus `data.js` stehen** — die Seite kann dadurch nicht leer
werden, zeigt dann aber alte Preise. Ob gerade der eine oder der andere Weg
greift, verrät in der Browser-Konsole `HV.katalogQuelle` (`shopify` oder
`data.js`).

Shop- und Produktseite warten kurz auf den Katalog, damit nichts flackert. Die
Startseite wartet nicht — dort läuft der Preloader sofort los, und die
New-In-Reihe wird nachgezogen, sobald der Katalog da ist.

`js/data.js` sollte gelegentlich nachgezogen werden, damit die Rückfalllösung
nicht veraltet. Nötig ist es nicht.

## Was weiterhin von Hand gepflegt wird

Das steht in `js/data.js` und nicht in Shopify:

- **Kundenstimmen** (`window.TESTIMONIALS`)
- **Häufige Fragen** (`window.FAQ`)
- **Kontaktdaten und Verknüpfungen** (`window.SITE`)
- **Auswahl fürs Flaggschiff-Panel auf der Startseite** (`window.NEW_IN`,
  `window.FLAGSHIP_ID`) — eine redaktionelle Auswahl. Uhren, die nicht mehr
  verfügbar sind, fallen dort automatisch heraus.
