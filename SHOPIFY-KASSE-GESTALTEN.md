# Kasse gestalten — Werte zum Einsetzen

*Einstellungen → Checkout → Anpassen*

Der Editor öffnet eine Vorschau der Kasse mit einer Seitenleiste links.
Alles unten ist dort einstellbar. Fünf Minuten, dann sieht die Kasse aus wie
die Website.

> **Warum nicht automatisch?** Shopify erlaubt das Setzen der Kassen-Gestaltung
> über die Schnittstelle nur auf dem **Plus**-Tarif. Hahn & Vo ist auf
> „Shopify“. Der Editor im Adminbereich kann dasselbe — nur eben von Hand.

---

## 1. Logo

Das Logo ist bereits in eurer Shopify-Mediathek. Im Editor unter
**Logo → Bild auswählen** liegt es unter *Dateien* mit dem Namen
`hahn-vo-logo.png`.

- **Breite:** 220 px
- **Position:** links

Es zeigt die HV-Marke mit dem Schriftzug „HAHN & VO“ in Marcellus, im
Markenblau — genau die Kombination aus dem Seitenkopf.

Beide Fassungen liegen auch im Projekt:

| Datei | wofür |
|---|---|
| `assets/img/checkout-logo.png` | dunkles Logo für hellen Grund ← **diese nehmen** |
| `assets/img/checkout-logo-creme.png` | helles Logo, falls der Kopf je dunkel wird |

## 2. Farben

| Feld im Editor | Wert |
|---|---|
| Akzentfarbe / Buttons | `#0E334F` |
| Schaltflächen-Schrift | `#FFFAE7` |
| Hintergrund Hauptbereich | `#FFFAE7` |
| Hintergrund Bestellübersicht | `#F7F1DC` |
| Textfarbe | `#0E334F` |
| Rahmen / Linien | `#D8D6C6` |
| Fehlerfarbe | `#8B2E2E` |
| Erfolgsfarbe | `#1E6B4E` |

Das sind exakt die Farben der Website: Petrol `#0E334F` als einzige
Markenfarbe, Creme `#FFFAE7` als Grundton, das etwas dunklere `#F7F1DC` für
die Bestellübersicht, damit sie sich absetzt, ohne kalt zu wirken.

## 3. Schrift

| Feld | Wert |
|---|---|
| Überschriften | **Inter**, Halbfett |
| Fließtext | **Inter**, Normal |

Inter steht in Shopifys Schriftbibliothek zur Verfügung. Marcellus gibt es
dort nicht — deshalb steckt der Serifen-Schriftzug im Logo, nicht in der
Schriftwahl. So bleibt der Auftritt trotzdem stimmig: Auf der Website ist
Marcellus ebenfalls nur dem Wortzeichen vorbehalten, alles andere ist Inter.

## 4. Ecken

**Eckenradius: 0** (eckig). Die Website nutzt 2 px, das ist mit bloßem Auge
nicht zu unterscheiden. Eckige Kanten wirken ruhiger und teurer als
abgerundete.

---

## Was der Editor auf diesem Tarif nicht kann

- Getrennte Farbschemata für einzelne Bereiche
- Versalien und Sperrung in den Schaltflächen (auf der Website steht dort
  `UHR ANSEHEN` mit weitem Zeichenabstand)
- Eigene Schriftdateien hochladen

Das gibt es erst mit Shopify Plus. Für den Eindruck, auf den es ankommt —
Logo, Farbe, Schrift — reicht der normale Editor.
