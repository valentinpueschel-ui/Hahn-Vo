# Kasse siezen — die 27 Stellen, die zählen

Shopify liefert die deutsche Kasse durchgehend in der Du-Form aus. Insgesamt
enthalten **742** Textbausteine ein „du“ — die allermeisten davon sind
Fehlermeldungen und Sonderfälle, die ein Kunde von Hahn & Vo nie zu sehen
bekommt (Amazon Pay, Krypto-Wallets, Abonnements, Geschenkgutscheine,
Multibanco, Abholung an mehreren Filialen, Teillieferungen).

**Ohne Belang für uns.** Wer eine Uhr kauft, sieht diese 27 Sätze. Mehr nicht.

## Warum das Handarbeit ist

Die Schnittstelle lehnt Schreibzugriffe auf die Hauptsprache ab:

> *Locale darf nicht mit dem primären Gebietsschema des Shops identisch sein*

Deutsch ist bei Hahn & Vo die Hauptsprache. Damit fällt der automatische Weg
weg — Shopify erlaubt Übersetzungen nur in **zusätzliche** Sprachen. Auch der
Umweg über die Theme-Dateien scheitert: Die Kassentexte stehen nicht in den
Theme-Dateien, sondern kommen aus Shopifys eigenem System.

## So gehst du vor

*Einstellungen → Sprachen → Deutsch → Standardinhalt ändern*
→ Kategorie **Checkout & System**

Oben ist ein Suchfeld. Kopier den Text aus der linken Spalte hinein, dann
erscheint genau dieser eine Eintrag. Rechten Text einsetzen, speichern,
nächster. Etwa 20 Minuten für alles.

---

## Kontakt

| Suchen nach | Ersetzen durch |
|---|---|
| Hast du ein Konto? | Haben Sie ein Konto? |
| Wird für deine Bestellbestätigung und Warenkorberinnerungen verwendet | Wird für Ihre Bestellbestätigung und Warenkorberinnerungen verwendet |
| Weitere Informationen darüber, wie deine Kontaktinformationen verwendet werden | Weitere Informationen darüber, wie Ihre Kontaktinformationen verwendet werden |
| Falls wir dich zu deiner Bestellung kontaktieren müssen | Falls wir Sie zu Ihrer Bestellung kontaktieren müssen |
| Diese wird auch als deine Rechnungsadresse für diese Bestellung verwendet. | Diese wird auch als Ihre Rechnungsadresse für diese Bestellung verwendet. |

> Der letzte Satz steht **zweimal** in der Liste (Kontakt und Versand).
> Beide ändern.

## Lieferung

| Suchen nach | Ersetzen durch |
|---|---|
| Gib deine Lieferadresse ein, um verfügbare Versandarten anzuzeigen. | Bitte geben Sie Ihre Lieferadresse ein, um verfügbare Versandarten anzuzeigen. |
| Gib eine vollständige Lieferadresse ein, um verfügbare Versandarten anzuzeigen. | Bitte geben Sie eine vollständige Lieferadresse ein, um verfügbare Versandarten anzuzeigen. |
| Gib eine gültige Lieferadresse ein, um verfügbare Versandarten anzuzeigen. | Bitte geben Sie eine gültige Lieferadresse ein, um verfügbare Versandarten anzuzeigen. |
| Gib eine andere Lieferadresse ein, um verfügbare Versandarten anzuzeigen | Bitte geben Sie eine andere Lieferadresse ein, um verfügbare Versandarten anzuzeigen |
| Es sind keine Versandarten für deinen Warenkorb oder deine Adresse verfügbar | Es sind keine Versandarten für Ihren Warenkorb oder Ihre Adresse verfügbar |
| Der Versanddienstleister kann diese Nummer verwenden, um dich zu kontaktieren. | Der Versanddienstleister kann diese Nummer verwenden, um Sie zu kontaktieren. |
| Du erhältst gegebenenfalls aktuelle Informationen zur Zustellung. | Sie erhalten gegebenenfalls aktuelle Informationen zur Zustellung. |

## Abholung im Showroom

| Suchen nach | Ersetzen durch |
|---|---|
| Dein ausgewählter Standort | Ihr ausgewählter Standort |
| dein Standort | Ihr Standort |

## Zahlung

| Suchen nach | Ersetzen durch |
|---|---|
| Du wirst zu %{gateway_label} weitergeleitet, um deinen Kauf abzuschließen. | Sie werden zu %{gateway_label} weitergeleitet, um Ihren Kauf abzuschließen. |
| Nachdem du deine Bestellung überprüft hast, wirst du zu %{gateway_label} weitergeleitet, um deinen Kauf abzuschließen. | Nachdem Sie Ihre Bestellung überprüft haben, werden Sie zu %{gateway_label} weitergeleitet, um Ihren Kauf abzuschließen. |
| Klicke hier, um dein PayPal-Konto zu verbinden | Klicken Sie hier, um Ihr PayPal-Konto zu verbinden |
| Wähle die mit deiner Karte oder Zahlungsmethode verknüpfte Adresse aus. | Bitte wählen Sie die mit Ihrer Karte oder Zahlungsmethode verknüpfte Adresse aus. |
| Gib die mit deiner Karte oder Zahlungsmethode verknüpfte Adresse ein. | Bitte geben Sie die mit Ihrer Karte oder Zahlungsmethode verknüpfte Adresse ein. |
| Die Rechnungsadresse deiner Zahlungsmethode muss mit der Lieferadresse übereinstimmen. | Die Rechnungsadresse Ihrer Zahlungsmethode muss mit der Lieferadresse übereinstimmen. |
| Deine Zahlung wird verarbeitet. Deine Bestellung ist in Kürze abgeschlossen. | Ihre Zahlung wird verarbeitet. Ihre Bestellung ist in Kürze abgeschlossen. |
| Du wirst zu {{walletName}} weitergeleitet, um deinen Kauf abzuschließen | Sie werden zu {{walletName}} weitergeleitet, um Ihren Kauf abzuschließen |
| Du wirst aufgefordert, dich mit {{walletName}} anzumelden. | Sie werden aufgefordert, sich mit {{walletName}} anzumelden. |
| Deinen Kauf im {{walletName}}-Fenster fortsetzen | Ihren Kauf im {{walletName}}-Fenster fortsetzen |

> Der erste Satz steht **zweimal** in der Liste (einmal mit, einmal ohne
> Schaltflächenbeschriftung). Beide ändern.

## Bestellübersicht und Warenkorb

| Suchen nach | Ersetzen durch |
|---|---|
| Die endgültige Steuer und der Gesamtbetrag werden per E-Mail oder SMS bestätigt, nachdem du die Bestellung aufgegeben hast. | Die endgültige Steuer und der Gesamtbetrag werden per E-Mail oder SMS bestätigt, nachdem Sie die Bestellung aufgegeben haben. |
| Dein Warenkorb ist leer | Ihr Warenkorb ist leer |

> „Dein Warenkorb ist leer“ steht **zweimal** in der Liste. Beide ändern.

---

## Was du nicht ändern kannst

Manche Texte kommen nicht von Shopify, sondern vom Zahlungsanbieter selbst.
Die PayPal-Schaltfläche und die Texte innerhalb des PayPal-Fensters gehören
PayPal. Da hilft kein Sprach-Editor.

## Danach

Die **E-Mails** sind ein eigener Durchgang:
*Einstellungen → Benachrichtigungen*. Dort stehen Bestellbestätigung,
Versandbestätigung und der Rest. Am wichtigsten ist die Bestellbestätigung —
sie enthält die Bankverbindung.

Sag Bescheid, wenn du durch bist. Dann gehe ich die Kasse noch einmal
komplett durch und melde, was übrig geblieben ist.
