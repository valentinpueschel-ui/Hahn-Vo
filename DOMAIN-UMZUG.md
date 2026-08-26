# hahn-vo.de auf die neue Website legen

**Die Domain muss nicht übertragen werden.** Sie bleibt bei GoDaddy. Es ändern
sich nur zwei DNS-Einträge — das dauert Minuten und lässt sich jederzeit
zurückdrehen. Ein echter Registrar-Umzug wäre der langsame Weg (Auth-Code,
Transfer-Sperre, fünf bis sieben Tage) und bringt hier nichts.

## Ausgangslage, geprüft am 26.08.2026

| | |
|---|---|
| Registrar und DNS | GoDaddy (`ns65/ns66.domaincontrol.com`) |
| hahn-vo.de zeigt auf | `76.223.105.230` und `13.248.243.5` — den alten GoDaddy-Shop |
| www | Verweis auf hahn-vo.de |
| **MX (E-Mail)** | **keine** |
| shop.hahn-vo.de | existiert noch nicht |

**Das Wichtigste: An hahn-vo.de hängt keine E-Mail.** Die Postfächer laufen über
**hahntime.com** bei Google Workspace, mit eigenen Nameservern. Der Umzug kann
also nichts treffen, was Post empfängt — das übliche Hauptrisiko entfällt.

## Vorher erledigen

1. **Bestellungen und Kundendaten aus dem alten Shop sichern.** Nach der
   Umstellung ist der Laden für Kunden weg. Der GoDaddy-Adminbereich bleibt
   zugänglich, aber **die Website-Buchung erst kündigen, wenn alles gesichert
   ist**.
2. **Rechtstexte prüfen lassen.** Ab dem Wechsel sind Impressum, AGB,
   Datenschutz und Widerruf die öffentlich gültigen. Das steht noch aus.
3. **TTL herunterdrehen**, eine Stunde vorher: Bei GoDaddy die TTL der
   A-Einträge auf 600 Sekunden setzen. Dann greift ein Rückzieher in zehn
   Minuten statt in Stunden.

Die 63 Uhren des alten Shops sind alle im neuen enthalten — am 26.08. Zeile für
Zeile geprüft. Es geht kein Artikel verloren.

## Schritt 1 — shop.hahn-vo.de für die Kasse (risikofrei)

Unabhängig vom Rest und jederzeit machbar. Danach heißt die Kasse
`shop.hahn-vo.de/checkouts/…` statt `tami1g-0j.myshopify.com/…`.

**GoDaddy** → Domain-Portfolio → hahn-vo.de → DNS → Eintrag hinzufügen

| Typ | Name | Wert | TTL |
|---|---|---|---|
| CNAME | `shop` | `shops.myshopify.com` | 1 Stunde |

**Shopify** → Einstellungen → Domains → Bestehende Domain verbinden →
`shop.hahn-vo.de` → Verifizieren → anschließend als **primäre Domain** setzen.
Das Zertifikat stellt Shopify selbst aus.

## Schritt 2 — hahn-vo.de auf die neue Website

**Zuerst in Vercel**, damit das Zertifikat sofort ausgestellt werden kann,
sobald DNS greift:

Vercel → Projekt → Settings → Domains → **Add** → `hahn-vo.de` eintragen und
`www.hahn-vo.de` gleich mit. Vercel zeigt danach die genauen Werte an —
**diese nehmen**, nicht die hier abgeschriebenen. Üblich sind:

| Typ | Name | Wert |
|---|---|---|
| A | `@` | `216.198.79.1` |
| CNAME | `www` | `cname.vercel-dns.com` |

**Dann bei GoDaddy**, DNS-Verwaltung:

1. Die **beiden bestehenden A-Einträge** für `@` löschen
   (`76.223.105.230`, `13.248.243.5`) — das sind die des alten Shops.
2. Den A-Eintrag aus Vercel anlegen.
3. `www` auf den Vercel-CNAME zeigen lassen.

Nichts anderes anfassen. Der `shop`-Eintrag aus Schritt 1 bleibt.

Danach: zehn Minuten bis wenige Stunden warten. Vercel stellt das Zertifikat
automatisch aus, sobald die Einträge greifen.

## Danach prüfen

- `https://hahn-vo.de` zeigt die neue Seite, Schloss-Symbol im Browser
- `https://www.hahn-vo.de` landet ebenfalls dort
- Eine alte Produktadresse öffnen, etwa
  `hahn-vo.de/shop/ols/products/tudor-black-bay-36-stgg-79503-aus-2022-im-full-set`
  → muss auf die neue Produktseite umleiten
- `https://hahn-vo.de/chrono24.xml` liefert den Feed
- Eine Uhr in den Warenkorb legen und bis zur Kasse durchgehen

## Alte Adressen laufen nicht ins Leere

In `vercel.json` liegen **78 Weiterleitungen**: alle 63 Produktadressen des
alten Shops zeigen punktgenau auf die passende neue Produktseite, dazu die
alten Menüpunkte (`/shop`, `/ankauf-&-inzahlungnahme`, `/suchanfrage-einer-uhr`,
`/über-uns`, `/unser-showroom`, die Rechtsseiten) und ein Auffangnetz für den
Rest. Damit bleiben Google-Treffer, der Instagram-Profillink und die Verweise
aus den Chrono24-Anzeigen gültig.

Getestet am 26.08.2026 auf der Vercel-Adresse, alle greifen.

## Nach dem Wechsel nachziehen

- **Chrono24**: Feed-Adresse auf `https://hahn-vo.de/chrono24.xml` ändern.
  Die Verweise auf die Produktseiten stellen sich von selbst um — der Feed
  nimmt die Adresse, unter der er aufgerufen wird.
- **Instagram, TikTok, WhatsApp-Kanal, Google-Unternehmensprofil**: Profillinks
  prüfen. Sie zeigen auf hahn-vo.de und funktionieren weiter, aber Links auf
  Unterseiten sollten stimmen.
- **GoDaddy-Website-Buchung** kündigen, sobald alles läuft und gesichert ist.

## Wenn etwas schiefgeht

A-Einträge bei GoDaddy zurück auf `76.223.105.230` und `13.248.243.5`, dann ist
der alte Shop wieder da. Bei TTL 600 dauert das zehn Minuten. Deshalb die TTL
vorher herunterdrehen.
