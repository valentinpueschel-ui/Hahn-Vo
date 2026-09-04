---
name: website-aendern
description: Änderungen an Gestaltung, Texten, Rezensionen, Abschnitten oder Seiten von hahn-vo.de sauber umsetzen, lokal prüfen, deployen und live gegenprüfen. Auslöser: alles, was nicht Bestand ist — „Text ändern", „Layout", „Rezensionen", „Bild auf der Startseite", „Abschnitt weg", Screenshot mit Markierung.
---

# Website ändern

Die Seite ist statisch (HTML/CSS/JS, kein Build), liegt in diesem Repo und wird
von Vercel bei jedem Push auf `main` in ~40 Sekunden ausgeliefert. Der Bestand
kommt live aus Shopify — Bestandsänderungen gehören in die Skills `uhr-*`, nicht hierher.

## Ablauf

1. **Verstehen.** Screenshot mit Markierung? Genau die markierte Stelle. Text „so abändern"? Wörtlich übernehmen, keine eigenen Verbesserungen — nur echte Widersprüche zu bestehenden Aussagen (Versandkosten, Fristen, „Sie"-Form) nennen und nachfragen.
2. **Lokal starten.** `lsof -i :8440` prüfen; läuft nichts, `./serve.command` (= `python3 tools/serve.py`, Port 8440 — feste Vergabe, andere Projekte belegen 8408/8412/8418/8420/8433). Änderungen unter `http://localhost:8440` ansehen. Die Produktseite ist `produkt-vorlage.html` — live liefert `api/produkt.js` sie mit gefülltem Kopf aus; lokal bedient `tools/serve.py` `/produkt` aus der Vorlage. Es gibt bewusst keine `produkt.html` (sie würde die Serverfunktion verdrängen).
3. **Ändern.** Datei-Landkarte in `docs/SYSTEM.md`. Stil: Deutsch, Sie-Form, sparsam mit Gedankenstrichen (Kunde streicht sie), keine erfundenen Geschäftsaussagen (Garantie, Fristen, Zahlarten — die stehen fest, siehe CLAUDE.md).
4. **Prüfen mit Playwright** (Muster: `docs/PROBLEME-UND-LOESUNGEN.md` → „QC-Screenshots"): Desktop 1440 und 1920, Handy 390. Bei Scroll-Animationen `HV.lenis.scrollTo(y, {immediate:true})` + 1,4 s warten; Zustände in Ruhe UND mitten im Wechsel prüfen. Zusätzlich `reduced_motion="reduce"` und ohne JavaScript, wenn Zahlen oder Animationen im Spiel sind.
5. **`js/data.js` niemals mit `re.sub` und JSON als Ersatztext bearbeiten** — Backslashes werden als Gruppenverweise gelesen und zerschießen die Datei (Fehler vom 01.09.). Slice-Ersetzung: `t[:m.start()] + neu + t[m.end():]`. Danach `node -e "global.window={};require('./js/data.js')"`. Und `git diff --stat` ansehen, bevor committet wird.
6. **Commit** mit deutscher, sprechender Nachricht (was, warum), dann `git push origin HEAD`.
7. **Live prüfen ohne Trick.** Statische Dateien: die ausgelieferte Datei holen und die Änderung darin suchen (`curl -s https://hahn-vo.de/css/home.css | grep …`), bis zu zwei Minuten pollen. Kein `?t=`-Zeitstempel als einziger Beleg — der zeigt dir etwas, das Besucher noch nicht sehen.

## Was fest ist (nicht anfassen ohne Auftrag)

- Kundenstimmen: Wortlaut unverändert, in `window.TESTIMONIALS` (js/data.js), Fotos `assets/img/reviews/`. Neue Stimmen nur mit Foto der gekauften Uhr.
- „Neu eingetroffen" und das Schaufenster leiten sich aus dem Bestand ab (zuletzt angelegt, erhältlich, keine Zubehör) — es gibt keine handgepflegte Liste mehr. Nicht wieder eine einführen.
- Produktseite: kein Abschnitt „Diese Uhr" — die Angaben stehen im Datenblatt (Auftrag vom 02.09.).
- Zahlarten werden in der Kasse nicht aufgezählt — Shopify zeigt sie selbst.
- Rechtsseiten sind Demo-Fassungen; Änderungen dort mit Hinweis „juristisch prüfen".

## Typische Fallen (Kurzfassung, Details in docs/PROBLEME-UND-LOESUNGEN.md)

- Absolut positionierte Deko-Ebenen (`::before` mit Verlauf) liegen über normalem Inhalt → Bilder wirken milchig. `position: relative; z-index: 1` auf den Inhalt.
- CSS-`display` auf einer Klasse schlägt das `hidden`-Attribut → immer `.x[hidden]{display:none}` dazu.
- GSAP + CSS-Transform addieren sich; Ausgangslage nur an einer Stelle setzen.
- Zähler: Endwert ins HTML, Animation zählt hoch; Auslöser IntersectionObserver (Instagram-Browser, „Bewegung reduzieren").
- Satztrennung an `. ` bricht bei „Ref." — Abkürzungsliste beachten (`inSaetze` in js/home.js).
- Meta-Tags per Regex einsetzen: schließendes `>` mitnehmen, sonst gelber Streifen und kaputte Descriptions.
- Weiterleitungen in vercel.json dürfen nicht auf sich selbst zeigen (`/shop`, `/impressum`, `/agb` hießen im alten Shop genauso).
