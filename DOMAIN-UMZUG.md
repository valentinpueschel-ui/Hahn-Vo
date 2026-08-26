# hahn-vo.de auf die neue Website legen

> **Erledigt am 26.08.2026.** hahn-vo.de, www.hahn-vo.de und shop.hahn-vo.de
> laufen. Was unten steht, ist die Aufzeichnung des Vorgangs — und die
> Anleitung, falls es je zurückgedreht werden muss.

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

**In Vercel bereits erledigt** (26.08.2026): `hahn-vo.de` und `www.hahn-vo.de`
sind im Projekt **hahn-vo-df1c** eingetragen, die Eigentümerprüfung ist durch.
Es fehlt nur noch DNS.

Die von Vercel für diese Domain ausgegebenen Werte:

| Typ | Name | Wert |
|---|---|---|
| A | `@` | `216.198.79.1` |
| A | `@` | `64.29.17.1` |
| CNAME | `www` | `fcf5f4acf8d453b4.vercel-dns-017.com` |

Beide A-Einträge anlegen, nicht nur einen — das ist die Ausfallsicherung.
Für `www` ginge auch `cname.vercel-dns.com`, der obige Wert ist der von
Vercel bevorzugte.

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


---

## Durchgeführt am 26.08.2026

| Eintrag | vorher | nachher |
|---|---|---|
| A `@` | „WebsiteBuilder Site" (GoDaddy-Baukasten) | `216.198.79.1` + `64.29.17.1`, TTL 600 |
| CNAME `www` | `@` | `fcf5f4acf8d453b4.vercel-dns-017.com`, TTL 600 |
| CNAME `shop` | — | `shops.myshopify.com` |

Unangetastet blieben die Nameserver, `_domainconnect` und der
DMARC-Eintrag. Der vollständige Stand von vorher ist gesichert.

**Nachgemessen nach der Umstellung:**

- hahn-vo.de und www.hahn-vo.de: HTTP 200, gültiges Zertifikat
- Startseite lädt den Katalog aus Shopify (`HV.katalogQuelle = shopify`),
  74 Uhren, 4 davon als verkauft
- Alte Adressen leiten weiter, im Browser geprüft:
  `/shop/ols/products/tudor-black-bay-36-…` → `/produkt.html?id=p426`
- `/chrono24.xml` liefert 68 Artikel, die Produktverweise darin lauten jetzt
  von selbst `https://hahn-vo.de/produkt.html?id=…`
- Warenkorb und Kasse: Kassenadresse ist `https://shop.hahn-vo.de/cart/…`
- Keine Fehlermeldung in der Browser-Konsole

**Stolperstein, den es zu kennen lohnt:** Der A-Eintrag war kein normaler
Eintrag, sondern GoDaddys Platzhalter „WebsiteBuilder Site". Er ließ sich über
die Schnittstelle problemlos durch echte Adressen ersetzen.

**Und einer beim Prüfen:** Direkt nach der Umstellung schien die alte Seite
noch ausgeliefert zu werden. Das war der DNS-Zwischenspeicher des eigenen
Rechners (TTL 3600 vom alten Eintrag). Alle öffentlichen Auflöser hatten
längst die neuen Werte. Wer gleich nach einer Umstellung prüft, sollte
gegen einen öffentlichen Auflöser testen, nicht gegen den eigenen.

## Was jetzt noch offen ist

1. **Chrono24**: Feed-Adresse `https://hahn-vo.de/chrono24.xml` beim Support
   hinterlegen — zusammen mit der Dublettenfrage aus `CHRONO24-FEED.md`.
2. **GoDaddy-Website-Buchung** kündigen, sobald die Bestellungen des alten
   Shops gesichert sind.
3. **Rechtstexte** anwaltlich prüfen lassen. Sie sind seit dem 26.08.
   öffentlich verbindlich.
