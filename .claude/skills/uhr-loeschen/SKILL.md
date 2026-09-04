---
name: uhr-loeschen
description: Eine Uhr komplett aus Shopify und von der Website entfernen (Produkt, Bilder, Datenblatt, lokale Reservebilder). Auslöser: „komplett löschen", „rauslöschen", „ganz weg" mit einem Produktlink.
---

# Uhr löschen

Löschen ist unwiderruflich — Produkt, Bilder und Datenblatt sind danach in Shopify weg.
Wenn der Auftrag nur „rausnehmen" oder „verkauft" sagt, ist das **nicht** Löschen:
Skill `uhr-status`. Bei Zweifel nachfragen, mit den drei Deutungen (verkauft / löschen / ausblenden).

```
python3 tools/uhr.py loeschen p567
```

Ablauf des Skripts: Kennung auflösen → letzte 50 Bestellungen prüfen (hängt eine
Bestellung an der Uhr, stoppt es; dann ist „verkauft" der richtige Weg) →
`productDelete` → Bildordner `assets/products/p567` entfernen → Zuordnung in
`js/data.js` löschen → Rückfalldatei bauen → warten, bis Besucher die Uhr nicht
mehr sehen → committen, pushen.

Shopify-Aufrufe wörtlich über den Connector ausführen, Antwort als JSON in
`arbeit/_loeschen-p567/antwort.json`, dann
`python3 tools/uhr.py ergebnis arbeit/_loeschen-p567 --datei arbeit/_loeschen-p567/antwort.json`.

## Danach nennen

- `hahn-vo.de/produkt?id=p567` leitet jetzt in die Shop-Übersicht (kein Fehler, kein 404).
- Die Marke fällt automatisch aus dem Filter, wenn keine Uhr der Marke mehr da ist.
- Bei Ersatz durch ein neues Inserat derselben Uhr („dafür das rein, hier sind neue Bilder"): erst löschen, dann `uhr-anlegen` — und wenn der alte Eintrag eine alte GoDaddy-Kennung hatte (p2446, p4284 …), bekommt der neue die Kennung aus dem Code (p522, p504). Alte Adressen leiten in den Shop.

## Alternative ohne Löschen

Soll das Produkt in Shopify bleiben, aber von der Website verschwinden: internen
Code in `AUSSCHLUSS` in `api/katalog.js` eintragen, Bestand 0 setzen
(`uhr-status … verkauft`), committen, pushen. Umkehrbar mit einem Handgriff.
`publishableUnpublish` blockt der Connector aus Sicherheitsgründen — nicht versuchen.
