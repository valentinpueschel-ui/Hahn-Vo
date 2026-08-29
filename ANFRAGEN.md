# Anfragen: Suchauftrag und Ankauf — wohin sie gehen

## Der Weg

1. Der Kunde füllt Suchauftrag oder Ankauf auf der Website aus.
2. Die Website schickt die Angaben an `/api/anfrage` (Vercel-Funktion,
   `api/anfrage.js`).
3. Die Funktion verschickt eine E-Mail an das Postfach — Empfänger ist die
   Umgebungsvariable `ANFRAGE_AN` in Vercel, aktuell **info@hahntime.com**.
   Antwortet man auf die Mail, geht die Antwort direkt an den Kunden
   (`reply_to`).
4. Der Kunde sieht „Die Suche läuft." bzw. „Wir melden uns innerhalb von
   12 Stunden" — und zusätzlich einen Knopf **Per WhatsApp nachfassen**,
   der WhatsApp mit dem fertigen Text öffnet.

Scheitert der Versand (kein Schlüssel, Dienst nicht erreichbar), sagt die
Website das ehrlich: „Bitte senden Sie Ihre Anfrage per WhatsApp." — mit
dem vorgefüllten WhatsApp-Knopf, einem E-Mail-Knopf und dem Text zum
Kopieren. **Nichts geht mehr stillschweigend verloren.**

## Was noch fehlt: der Mail-Schlüssel

Der Versand läuft über **Resend** (resend.com) — kostenlos bis 3.000 Mails
im Monat, das reicht für Jahre. Einrichtung, einmalig, fünf Minuten:

1. Auf resend.com ein Konto anlegen — **mit info@hahntime.com**, denn ohne
   verifizierte Domain darf Resend nur an die Konto-Adresse senden. Das ist
   hier genau richtig.
2. *API Keys → Create API Key*, Name „hahn-vo-website", Berechtigung
   „Sending access". Der Schlüssel beginnt mit `re_`.
3. Den Schlüssel in Vercel hinterlegen: Projekt **hahn-vo-df1c** →
   *Settings → Environment Variables* → `RESEND_API_KEY` = der Schlüssel,
   für Production, Preview und Development. Danach einmal neu deployen
   (*Deployments → ⋯ → Redeploy*).
4. Prüfen: Suchauftrag auf hahn-vo.de ausfüllen, Mail in info@hahntime.com.

Wer will, dass die Mails von **anfragen@hahn-vo.de** kommen statt von
`onboarding@resend.dev`: in Resend die Domain hahn-vo.de hinzufügen, die
drei DNS-Einträge bei GoDaddy setzen, dann `ANFRAGE_VON` in Vercel auf
`Hahn & Vo Website <anfragen@hahn-vo.de>` stellen. Nur Kosmetik — der
Empfang funktioniert auch ohne.

## Warum das vorher nicht ging

Bis 29.08.2026 speicherte das Formular die Angaben nur im Browser des
Kunden (`localStorage`) und zeigte „eingegangen" an. Es gab keinen Server,
keine Mail, keine Nachricht. Jede Anfrage seit dem Start der neuen Seite
ist deshalb nie angekommen — außer der Kunde hat zusätzlich WhatsApp
genutzt.

## Umgebungsvariablen (Vercel, Projekt hahn-vo-df1c)

| Variable | Zweck | Stand |
|---|---|---|
| `ANFRAGE_AN` | Empfänger-Postfach | gesetzt: info@hahntime.com |
| `RESEND_API_KEY` | Schlüssel für den Versand | **fehlt** |
| `ANFRAGE_VON` | Absender (optional) | nicht gesetzt → onboarding@resend.dev |
