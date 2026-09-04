# Übergabe an Hahn & Vo — Konten, Zugänge, Reihenfolge

Stand 04.09.2026. Grundsatz: Konnektoren sind persönliche Verknüpfungen und
lassen sich nicht übertragen — Hannes verbindet sie in seinem eigenen claude.ai neu.
Fast alle Konten dahinter gehören Hahn & Vo schon. In Valentins Namen laufen nur
das GitHub-Repo, das Vercel-Projekt und Valentins Claude-Umfeld.

## Was wem gehört

| Was | Gehört heute | Übergabe |
|---|---|---|
| Shopify-Store `tami1g-0j` | Hannes ist Store-Inhaber (info@hahntime.com, bestätigt 04.09.) | nichts; Valentins Mitarbeiterzugang nach der Übergabe einschränken oder entfernen |
| Shopify ↔ Claude (Connector) | Valentins claude.ai | Hannes: claude.ai → Connectors → Shopify, mit seinem Login |
| Shopify Admin-Zugang für den Direktmodus | existiert nicht | optional: App im Dev-Dashboard des Shop-Inhabers, Client-ID/Secret in `~/.hv-tokens` |
| GitHub-Repo `valentinpueschel-ui/Hahn-Vo` (öffentlich) | Valentin | Settings → Transfer ownership → Hannes' GitHub-Konto (kostenlos). Danach Vercel neu verbinden (unten) |
| GitHub ↔ Claude | `gh` auf Valentins Mac | Hannes: `gh auth login` oder SSH-Schlüssel |
| Vercel-Projekt `hahn-vo-df1c` + Env-Vars (`RESEND_API_KEY`, `ANFRAGE_AN`) | Valentins Hobby-Team | Neues Team „Hahn & Vo", Pro (20 $/Monat), Projekt übertragen (nimmt Env-Vars + Domain mit), Hannes Owner, Valentin kostenloser Viewer |
| Domain hahn-vo.de, DNS | Hahn & Vo (GoDaddy) | nichts; Valentins Personal Access Token widerrufen |
| Resend (Mailversand) | Hannes (Konto auf info@hahntime.com, Passwort bei ihm) | nichts; nur Key rotieren, weil Valentin den aktuellen kennt (neuer Key → Vercel Env → Redeploy) |
| Chrono24 Händlerkonto `hahnundvo`, Feed `/chrono24.xml` | Hannes | nichts; klären, ob Chrono24 den Feed zieht (`CHRONO24-FEED.md`) |
| Cloud-Auftrag „p567 auf verkauft" (08.09.) | Valentins claude.ai | läuft einmal; künftige Aufträge legt Hannes selbst an (`/schedule`) |
| Claude-Gedächtnis, Scratchpad-Skripte | Valentins Mac | ersetzt durch `CLAUDE.md`, `docs/`, `tools/`, `.claude/skills/` — im Repo |
| Ordner `hahnvo-lmse` (MB&F-Filmprojekt) | nur lokal bei Valentin | separat übergeben, falls gewünscht |
| Composio, Gmail, Notion, Drive, Higgsfield, Framer | Valentins andere Kunden | für Hahn & Vo nicht nötig |

## Warum Vercel Pro und warum Hannes Owner

- Hobby erlaubt keine Team-Mitglieder und laut Vercel nur nicht-kommerzielle Nutzung — ein laufender Shop darauf ist ein Risiko (Konto kann pausiert werden).
- Analytics-Ereignisse (50.000/Monat) teilen sich auf Hobby alle acht Projekte in Valentins Team; Verlauf nur 1 Monat statt 12.
- Pro: 20 $/Monat, ein bezahlter Sitz enthalten = Hannes. Viewer-Sitze sind kostenlos = Valentin. Deployen braucht keinen Vercel-Sitz — es läuft über Git-Push.
- Ein eigenes Team, weil ein Viewer alle Projekte des Teams sieht — Valentins Team enthält andere Kunden.

## Reihenfolge

1. **Hannes' Konten:** GitHub-Konto, Claude-Abo, Shopify-Connector verbinden.
2. **Repo übertragen** (GitHub → Settings → Danger Zone → Transfer). Valentin bleibt Mitarbeiter.
3. **Vercel:** neues Team, Pro buchen, Projekt `hahn-vo-df1c` übertragen (Vercel → Project Settings → Transfer). Dann Settings → Git → mit dem Repo unter Hannes' Konto verbinden (Vercel-GitHub-App auf seinem Konto installieren). Ein Test-Push muss deployen.
4. **Hannes' Mac:** `git clone`, `bash tools/einrichten.sh`, Playwright-Chromium installieren.
5. **Probelauf zu zweit (90 Minuten):** Hannes legt eine echte Uhr mit dem Skill an, setzt eine auf reserviert, ändert ein Bild — Valentin sieht zu.
6. **Aufräumen:** Valentins Vercel-Token, GoDaddy-PAT, Resend-Key widerrufen/rotieren; `~/.hv-tokens` und `.shopify-token` bei Valentin löschen; verwaistes Vercel-Projekt `hahn-vo` (Stand 22.07.) löschen; Testbestellung #1002 archivieren.
7. **Offen aus dem Betrieb:** Kleinanzeigen-Inserat der Omega 166.001 korrigieren (Rolex-Text); Link-Vorschau der Produktseiten (zeigt Gründerfoto statt Uhr); p567-Geschlecht (33 mm als „Herren"); p522 Baujahr „ca. 2009" als festes Jahr.

## Was Hannes wissen muss, was Valentin nicht mitgeben kann

- Kleinanzeigen sperrt IP-Bereiche zeitweise; von Frankfurt aus vermutlich seltener als aus Seoul.
- eBay- und Chrono24-Leser sind gebaut, aber noch nicht an echten Inseraten erprobt (bis 04.09. gab es nur Kleinanzeigen-Aufträge). Rückfall ist immer der Ordner-Eingang.
- Der Direktmodus (`--direkt`) ist ungetestet, bis eine App im Dev-Dashboard des Shop-Inhabers existiert.
