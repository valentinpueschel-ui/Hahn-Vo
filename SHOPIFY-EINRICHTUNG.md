# Shopify — was noch im Adminbereich einzustellen ist

Die Website ist fertig verdrahtet. Was hier steht, lässt sich nur direkt in
Shopify setzen. Reihenfolge egal, alle Punkte sind unabhängig.

---

## 1. Versandzonen

*Einstellungen → Versand und Zustellung → Versand → Tarife bearbeiten*

Drei Zonen anlegen, jeweils mit **Pauschaltarif**:

| Zone | Länder | Preis |
|---|---|---|
| Deutschland | Deutschland | **0,00 €** |
| Europa | Österreich, Schweiz, Frankreich, Italien, Niederlande, Belgien, Luxemburg, Spanien, Portugal, Dänemark, Schweden, Norwegen, Finnland, Polen, Tschechien, Ungarn, Griechenland, Irland, Vereinigtes Königreich, Island, Liechtenstein, Monaco, Malta, Estland, Lettland, Litauen, Slowenien, Slowakei, Kroatien, Rumänien, Bulgarien | **79,00 €** |
| Übrige Welt | alle restlichen Länder | **150,00 €** |

Tarifname jeweils: `Versicherter Werttransport`

> Diese Werte stehen so auch auf der Website (`js/checkout.js`, Liste `EUROPA`).
> Wenn du sie in Shopify änderst, sag Bescheid — dann ziehe ich die Website nach.

---

## 2. Abholung im Showroom

*Einstellungen → Versand und Zustellung → Abholung vor Ort → Standort aktivieren*

Ohne diesen Punkt berechnet Shopify auch dann Versand, wenn der Kunde auf
unserer Seite „Persönliche Übergabe im Showroom“ gewählt hat.

- Abholung aktivieren, Kosten **kostenlos**
- Hinweis für den Kunden:
  > Abholung nach Terminvereinbarung im Garden Tower, 7. Etage, Neue Mainzer Straße 46–50, 60311 Frankfurt am Main. Wir melden uns nach Ihrer Bestellung zur Abstimmung.

---

## 3. Banküberweisung: Text für die Kasse

*Einstellungen → Zahlungen → Manuelle Zahlungsmethoden → Banküberweisung*

Ins Feld **„Zusätzliche Details“** (erscheint in der Kasse und in der
Bestellbestätigung) folgenden Text einsetzen:

```
Bitte überweisen Sie den Rechnungsbetrag innerhalb von 24 Stunden auf folgendes Konto:

Kontoinhaber: Hahn & Vo OHG
IBAN: [IBAN EINSETZEN]
BIC: [BIC EINSETZEN]
Bank: [BANK EINSETZEN]

Verwendungszweck: Bitte den internen Code verwenden (siehe Beschreibung der Uhr, z. B. HV-462).

Ihre Uhr bleibt bis zum Zahlungseingang verbindlich für Sie reserviert. Sobald der Betrag bei uns eingegangen ist, melden wir uns zur Abstimmung von Versand oder Übergabetermin.
```

Der interne Code steht bei jeder Uhr in der Beschreibung und auf unserer
Website in der Datenblatt-Tabelle (Zeile „Interner Code“).

**Zahlungsanweisungen-Feld** (falls separat vorhanden), kurz:

```
Überweisung innerhalb von 24 Stunden. Verwendungszweck: interner Code der Uhr (siehe Beschreibung).
```

---

## 4. Anrede: „Sie“ statt „du“

Shopify liefert die deutschen Texte standardmäßig in der Du-Form aus. An zwei
Stellen umstellen:

**a) Kasse und Onlineshop**
*Onlineshop → Themes → … → Sprache bearbeiten* → Suchfeld nutzen und die
Du-Formen ersetzen (`dein` → `Ihr`, `du` → `Sie`, `deine` → `Ihre`).

**b) E-Mails (Bestellbestätigung, Versandbestätigung usw.)**
*Einstellungen → Benachrichtigungen* → jede Vorlage öffnen → Text anpassen.
Die wichtigsten drei:

- **Bestellbestätigung** — die bekommt jeder Käufer sofort
- **Bestellung storniert**
- **Versandbestätigung**

Formulierungen für die Bestellbestätigung:

| statt | besser |
|---|---|
| Danke für deinen Einkauf! | Vielen Dank für Ihren Einkauf. |
| Wir informieren dich, sobald deine Bestellung versandt wurde. | Wir informieren Sie, sobald Ihre Bestellung versandt wurde. |
| Deine Bestellung | Ihre Bestellung |
| Deine Rechnungsadresse / Lieferadresse | Ihre Rechnungsadresse / Lieferadresse |
| Wenn du Fragen hast, antworte auf diese E-Mail | Bei Fragen antworten Sie einfach auf diese E-Mail |

---

## 5. Shop-Name und Erscheinungsbild

- *Einstellungen → Allgemein*: Shop-Name auf `Hahn & Vo`, rechtlicher Firmenname auf `Hahn & Vo OHG`
- *Einstellungen → Checkout → Branding anpassen*: Logo hochladen, Akzentfarbe `#0E334F`, Schrift `Inter`
- *Einstellungen → Domains*: `shop.hahn-vo.de` verbinden und als primäre Domain setzen

---

## 6. Bestand abgleichen

Siehe **SHOPIFY-AUFRAEUMEN.md**: 28 verkaufte Uhren löschen, 32 neue über
`shopify-neue-uhren.csv` importieren. Danach bei allen Uhren Bestand **1**
prüfen (*Produkte → alle auswählen → Bulk-Bearbeitung → Spalte Inventar*).
