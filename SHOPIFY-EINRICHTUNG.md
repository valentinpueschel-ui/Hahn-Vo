# Shopify — was noch im Adminbereich einzustellen ist

Die Website ist fertig verdrahtet. Was hier steht, lässt sich nur direkt in
Shopify setzen.

---

## Stand vom 24.08.2026 — erledigt

Am 24.08.2026 direkt über die Admin-Schnittstelle gesetzt und an der echten
Kasse nachgeprüft:

| Punkt | Stand |
|---|---|
| Shop-Name „Hahn & Vo“ | erledigt |
| Markt **Europa** (32 Länder) | angelegt, aktiv, EUR |
| Markt **Übrige Welt** (202 Länder) | angelegt, aktiv, EUR |
| Zone Deutschland | `Versicherter Werttransport` **0,00 €**, ohne Mindestbestellwert |
| Zone Europa | `Versicherter Werttransport` **80,00 €** |
| Zone Übrige Welt | `Versicherter Werttransport` **150,00 €** |
| Alte Tarife `Standard 5,99 €` und `Express 9,99 €` | gelöscht |
| Abholung im Showroom | aktiviert, kostenlos, mit Terminhinweis |
| Zahlarten | PayPal, Banküberweisung |

Nachgemessen an der Kasse: Deutschland 0 €, Österreich 80 €, Frankreich 80 €,
Schweiz 80 €, USA 150 €. Auswählbare Länder: 235.

**Nicht freigeschaltet:** Russland, Belarus, Iran, Nordkorea, Syrien, Kuba —
bewusst ausgelassen (Sanktionen). Falls doch gewünscht, sag Bescheid.

### Was noch offen ist

1. **Kreditkarte, Apple Pay, Google Pay** — Shopify Payments ist nicht aktiviert.
   Solange das so bleibt, nennt die Website nur PayPal und Banküberweisung.
   *Einstellungen → Zahlungen → Shopify Payments aktivieren*
2. **Anrede:** Die Kasse duzt. Die 27 Stellen, die ein Kunde wirklich sieht,
   stehen mit fertigem Ersatztext in `SHOPIFY-SIEZEN.md`.
3. **Kassen-Gestaltung:** Logo liegt in der Shopify-Mediathek, alle Werte
   stehen in `SHOPIFY-KASSE-GESTALTEN.md`. Per Schnittstelle nicht moeglich —
   Shopify erlaubt das nur auf dem Plus-Tarif.
5. **Eigene Domain** `shop.hahn-vo.de` statt `tami1g-0j.myshopify.com`.

---

## 1. Versandzonen — ✅ erledigt am 24.08.2026

*Einstellungen → Versand und Zustellung → Versand → Tarife bearbeiten*

Drei Zonen anlegen, jeweils mit **Pauschaltarif**:

| Zone | Länder | Preis |
|---|---|---|
| Deutschland | Deutschland | **0,00 €** |
| Europa | Österreich, Schweiz, Frankreich, Italien, Niederlande, Belgien, Luxemburg, Spanien, Portugal, Dänemark, Schweden, Norwegen, Finnland, Polen, Tschechien, Ungarn, Griechenland, Irland, Vereinigtes Königreich, Island, Liechtenstein, Monaco, Malta, Estland, Lettland, Litauen, Slowenien, Slowakei, Kroatien, Rumänien, Bulgarien | **80,00 €** |
| Übrige Welt | alle restlichen Länder | **150,00 €** |

Tarifname jeweils: `Versicherter Werttransport`

> Diese Werte stehen so auch auf der Website (`js/checkout.js`, Liste `EUROPA`).
> Wenn du sie in Shopify änderst, sag Bescheid — dann ziehe ich die Website nach.

---

## 2. Abholung im Showroom — ✅ erledigt am 24.08.2026

*Einstellungen → Versand und Zustellung → Abholung vor Ort → Standort aktivieren*

Ohne diesen Punkt berechnet Shopify auch dann Versand, wenn der Kunde auf
unserer Seite „Persönliche Übergabe im Showroom“ gewählt hat.

- Abholung aktivieren, Kosten **kostenlos**
- Hinweis für den Kunden:
  > Abholung nach Terminvereinbarung im Garden Tower, 7. Etage, Neue Mainzer Straße 46–50, 60311 Frankfurt am Main. Wir melden uns nach Ihrer Bestellung zur Abstimmung.

---

## 3. Banküberweisung — ✅ hinterlegt am 24.08.2026

*Einstellungen → Zahlungen → Manuelle Zahlungsmethoden → Banküberweisung*

Zwei Felder, zwei Zeitpunkte:

**„Zusätzliche Details"** — erscheint in der Kasse, sobald der Kunde die
Zahlart auswählt:

```
Sie erhalten unsere Bankverbindung mit der Bestellbestätigung. Ihre Uhr bleibt bis zum Zahlungseingang für Sie reserviert.
```

**„Zahlungsanweisungen"** — erscheint nach dem Bestellabschluss und in der
Bestellbestätigung. Enthält Kontoinhaber, IBAN, BIC und Bank (im Adminbereich
hinterlegt, hier bewusst nicht wiederholt — das Verzeichnis ist öffentlich).
Inhaltlich gilt:

- Zahlungsfrist **24 Stunden** (Stand 24.08.2026). Anmerkung: Bei fünf- bis
  sechsstelligen Beträgen scheitert ein Tag oft am Tageslimit im
  Online-Banking — sieben Tage wären praxisnäher.
- Bank: Städtische Sparkasse Offenbach a.M., **BIC HELADEF1OFF**
  — mit dem Buchstaben O, nicht der Ziffer 0
- Verwendungszweck: interner Code der Uhr, mit Beispiel (z. B. HV-4846),
  damit der Kunde weiß, wo er ihn findet
- Durchgehend siezen

Der interne Code steht bei jeder Uhr in der Beschreibung und auf unserer
Website in der Datenblatt-Tabelle (Zeile „Interner Code“).

---

## 4. Anrede: „Sie“ statt „du“

Shopify liefert die deutschen Texte standardmäßig in der Du-Form aus. An zwei
Stellen umstellen:

**a) Kasse und Onlineshop**
*Einstellungen → Sprachen → Deutsch → Standardinhalt ändern* → Kategorie
„Checkout & System“. **Die fertige Liste steht in `SHOPIFY-SIEZEN.md`** — 27
Stellen mit Suchtext und Ersatztext, etwa 20 Minuten Arbeit. Über die
Schnittstelle geht es nicht: Shopify lehnt Schreibzugriffe auf die
Hauptsprache ab.

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
