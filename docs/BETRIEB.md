# Betrieb der Website mit Claude Code — für Hannes

Du brauchst kein Terminalwissen. Du öffnest Claude Code im Projektordner und sagst,
was passieren soll. Die Regeln und Abläufe stecken im Projekt (`CLAUDE.md`, `.claude/skills/`),
Claude findet sie von selbst.

## Einmalig einrichten (30 Minuten)

1. **Claude Code als Mac-App installieren** (claude.com/claude-code) und mit deinem Claude-Konto anmelden (Abo mit ausreichend Nutzung — eine Uhr anzulegen ist tokenintensiv, Max ist sinnvoll). Terminal-Variante: `npm install -g @anthropic-ai/claude-code`.
2. **Shopify verbinden:** claude.ai → Einstellungen → Connectors → Shopify → mit deinem Shop-Login (info@hahntime.com) verbinden.
3. **Projekt holen:** GitHub-Konto anlegen (falls noch keins), von Valentin ins Repo eingeladen werden oder das Repo übernehmen. Leeren Ordner `hahn-vo` auf dem Schreibtisch anlegen, in der Claude-App öffnen und sagen: „Hol das Projekt von github.com/<konto>/Hahn-Vo in diesen Ordner und richte meinen Mac dafür ein." Claude installiert, was fehlt (`tools/einrichten.sh` sagt ihm, was), und meldet dich bei GitHub an.
4. **Prüfen:** `/mcp` im Claude-Fenster zeigt Shopify als verbunden; Claude meldet „einrichten.sh: 0 fehlen".

## Was du sagst — Beispiele

| Du sagst | Was passiert |
|---|---|
| „Lade diese Uhr hoch: `<Kleinanzeigen-Link>`" | Inserat wird gelesen, Bilder geholt, Claude zeigt dir Kontaktbogen und Felder, legt die Uhr in Shopify an, prüft live. Preis 1:1 aus dem Inserat. |
| „… für 3.250 €" | wie oben, mit deinem Preis |
| „`<eBay-Link>` auf die Website" / „`<Chrono24-Link>` …" | dasselbe; wenn die Plattform sperrt, sagt Claude dir, dass du die Fotos in einen Ordner ziehen sollst |
| „Fotos liegen in ~/Desktop/neue-uhr, Beschreibung in der beschreibung.txt" | Ordner-Eingang, funktioniert immer |
| „hahn-vo.de/produkt?id=p567 auf verkauft" | Bestand 0, „Verkauft" bleibt sichtbar, Chrono24 nimmt sie beim nächsten Abruf raus |
| „p567 reservieren" / „Reservierung bei p567 raus" | Kennzeichen setzen/entfernen |
| „p567 Preis auf 3.250" / „p567 auf Sale, 9.190 statt 9.990" | Preis bzw. Streichpreis |
| „p567 komplett löschen" | weg aus Shopify und Website (Claude fragt nach, wenn „rausnehmen" nicht eindeutig ist) |
| „Bei p567 das Set-Foto als zweites Bild" / „das angehängte Bild als Hover" | Bildreihenfolge ändern |
| „Text auf Über uns ändern: …" / Screenshot mit Markierung | Website-Änderung, lokal geprüft, deployt |

Claude führt Skripte und Shopify-Aufrufe aus und berichtet am Ende kurz: Link, Preis,
Besteuerung, was Cover und zweites Bild zeigen, was unsicher war. Gefragt wirst du
nur, wenn Preis oder Artikelnummer fehlen — oder einmal, bevor etwas unwiderruflich
gelöscht wird. Beim allerersten Mal fragt Claude Code für jedes Werkzeug (Skripte,
Shopify, Git) einmal nach einer Erlaubnis: **„Immer erlauben"** wählen — danach nie wieder.

## Woran du erkennst, dass alles gut ist

- Die Antwort enthält den Link `hahn-vo.de/produkt?id=pXXX` — öffnen, ansehen.
- Beim Überfahren der Karte im Shop erscheint das Set-Foto oder ein weiteres Frontbild.
- Die Uhr steht unter ihrer Marke im Filter „Marken".
- Besteuerung stimmt (differenzbesteuert nur, wenn § 25a im Inserat oder in deiner Liste `daten/differenzbesteuerung.csv`).

Änderungen sind auf der Website nach spätestens fünf Minuten sichtbar; die Kasse rechnet sofort mit dem neuen Stand.

## Was du regelmäßig pflegst

- **`daten/differenzbesteuerung.csv`** — jede neue differenzbesteuerte Uhr dort eintragen (oder § 25a ins Inserat schreiben, dann erkennt Claude es).
- **Neue Marke im Bestand** (zwei Wörter, z. B. „Grand Seiko"): Claude sagen „neue Marke Grand Seiko eintragen" — sie kommt in die Markenliste.
- **Markenseiten** (`hahn-vo.de/marken/rolex` …) entstehen automatisch für jede Marke im Bestand. Der Text oben auf der Seite steht in `daten/marken.json` — für neue Marken gibt es einen Standardtext; ein eigener Text: „Schreib einen Text für die Markenseite Grand Seiko".
- **Kundenstimmen:** Text + Foto der gekauften Uhr an Claude geben.

## Wenn etwas nicht klappt

- Claude meldet „FEHLER: …" mit Ursache. Meist ein fehlendes Feld oder eine Sperre der Plattform. Claude sagt, was zu tun ist.
- Website nicht erreichbar: vercel.com → Projekt `hahn-vo-df1c` → Deployments (letzter Push rot?).
- Mail aus Formularen kommt nicht an: Spam-Ordner in info@hahntime.com; sonst `ANFRAGEN.md`.
- Sonst: Valentin. Er hat dieselben Werkzeuge und dasselbe Wissen im Projekt.

## Was Claude nie von allein tut

Andere Uhren anfassen, Produkte ohne Auftrag löschen, Preise erfinden, Baujahre schätzen,
Texte mit fremden Marken übernehmen, Zahlarten oder Garantiezusagen umformulieren.
