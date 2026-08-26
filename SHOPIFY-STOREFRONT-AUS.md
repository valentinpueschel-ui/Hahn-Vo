# Shopify-Storefront ausblenden — zwei Minuten im Adminbereich

## Das Problem

Shopify bringt eine eigene Ladenseite mit, erreichbar unter
`shop.hahn-vo.de`. Bei uns liefert Shopify aber nur Katalog und Kasse —
verkauft wird auf hahn-vo.de.

Wer aus der Kasse zurückgeht, landet auf dieser Shopify-Seite: fremdes
Aussehen, andere Navigation, ein zweiter Laden mit denselben Uhren. Das
verwirrt und wirkt unseriös.

## Warum ich das nicht selbst gemacht habe

Zwei Wege wären möglich gewesen, beide sind mir verschlossen:

- **Theme bearbeiten** — Schreibzugriff auf das veröffentlichte Theme ist
  gesperrt. Eine sinnvolle Sicherung: Ein Fehler dort legt den Laden lahm.
- **Script-Tag** — dafür fehlt dem Zugang die Berechtigung
  (`write_script_tags`).

Auch der Umweg über *Weiterleitungen* scheitert: Shopify lässt die
Startseite `/` dort nicht umleiten.

## Was zu tun ist

*Onlineshop → Themes → bei „Horizon" auf ⋯ → **Code bearbeiten***

Datei **`layout/theme.liquid`** öffnen. Direkt nach der Zeile `<head>`
diesen Block einfügen:

```liquid
    {%- comment -%}
      Die Shopify-Storefront ist nicht unser Auftritt. Verkauft wird auf
      hahn-vo.de; Shopify liefert nur Katalog und Kasse. Wer hier landet —
      etwa mit Zurück aus der Kasse — wird auf die Website geleitet.
      Warenkorb, Rechtstexte, Konto und der Theme-Editor bleiben ausgenommen,
      damit Kasse und Vorschau nutzbar bleiben.
    {%- endcomment -%}
    {%- unless request.design_mode
        or request.page_type == 'cart'
        or request.page_type == 'policy'
        or request.page_type == 'password'
        or request.page_type == 'captcha'
        or request.page_type contains 'customers' -%}
      <script src="https://hahn-vo.de/storefront-weiterleitung.js"></script>
    {%- endunless -%}
```

Speichern. Fertig.

## Warum nur eine Zeile

Die eigentliche Logik steht in `storefront-weiterleitung.js` in diesem
Projekt und wird von hahn-vo.de ausgeliefert. Damit lässt sie sich hier
ändern, ohne je wieder das Theme anzufassen. Im Theme steht nur der Aufruf.

Das Skript nimmt zusätzlich die Pfade `/cart`, `/checkout`, `/checkouts`,
`/account`, `/orders`, `/policies`, `/tools`, `/apps` aus — doppelt
abgesichert gegen den Fall, dass eine Kassenseite doch über das Theme läuft.

## Danach prüfen

1. `https://shop.hahn-vo.de/` aufrufen → muss auf hahn-vo.de landen
2. Auf hahn-vo.de eine Uhr in den Warenkorb legen und zur Kasse gehen →
   **die Kasse muss normal funktionieren**
3. In der Kasse zurückgehen → muss auf hahn-vo.de landen, nicht im
   Shopify-Laden

Sollte Schritt 2 haken, den Block im Theme wieder entfernen — dann ist
sofort alles wie vorher.

## Alternative ohne Theme-Änderung

Wenn ihr das Theme gar nicht anfassen wollt: Im Adminbereich unter
*Onlineshop → Menüs → Weiterleitungen* lassen sich einzelne Pfade umleiten
(`/collections/all`, `/products/…`). Die Startseite `/` geht dort allerdings
nicht — und genau dort landet man aus der Kasse. Deshalb ist der Theme-Weg
der einzige, der das Problem wirklich löst.
