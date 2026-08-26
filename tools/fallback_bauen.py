#!/usr/bin/env python3
"""Frischt die Rückfalllösung in js/data.js aus Shopify auf.

Die Website holt ihren Bestand normalerweise live von /api/katalog.json.
js/data.js springt nur ein, wenn Shopify nicht antwortet. Damit dieser Stand
nicht veraltet, holt dieses Skript ihn gelegentlich nach.

    python3 tools/fallback_bauen.py            # data.js auffrischen
    python3 tools/fallback_bauen.py --dry-run  # nur zeigen, was sich ändert

Angefasst werden ausschließlich window.PRODUCTS und window.SHOPIFY.
Kundenstimmen, FAQ, Kontaktdaten und die Flaggschiff-Auswahl bleiben unberührt
— die werden von Hand gepflegt.

Bilder: Wo eine lokale Kopie unter assets/products/<id>/ liegt, wird sie
bevorzugt. Das hält die Rückfalllösung unabhängig von fremden Adressen.
"""
import argparse, io, json, os, re, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'js', 'data.js')
IMGDIR = os.path.join(ROOT, 'assets', 'products')
KATALOG = 'https://hahn-vo-df1c.vercel.app/api/katalog.json'


def hole_katalog(url):
    anfrage = urllib.request.Request(url, headers={'User-Agent': 'hahn-vo-fallback'})
    with urllib.request.urlopen(anfrage, timeout=60) as antwort:
        return json.load(antwort)


def lokale_bilder(uhr_id):
    ordner = os.path.join(IMGDIR, uhr_id)
    if not os.path.isdir(ordner):
        return None
    dateien = sorted(
        (f for f in os.listdir(ordner) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))),
        key=lambda f: (len(f), f))
    if not dateien:
        return None
    return ['assets/products/' + uhr_id + '/' + f for f in dateien]


def block_ersetzen(text, name, wert):
    """Ersetzt window.<name> = …; und behält die übrige Datei unverändert."""
    muster = re.compile(r'window\.' + name + r'\s*=\s*[\[{].*?\n[\]}];', re.S)
    neu = 'window.' + name + ' = ' + json.dumps(wert, ensure_ascii=False, indent=1) + ';'
    text, anzahl = muster.subn(lambda _m: neu, text, count=1)
    if anzahl != 1:
        raise SystemExit('Block window.%s nicht gefunden — data.js von Hand prüfen.' % name)
    return text


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--dry-run', action='store_true')
    p.add_argument('--url', default=KATALOG)
    args = p.parse_args()

    katalog = hole_katalog(args.url)
    produkte = katalog['produkte']
    print('Katalog geholt: %d Produkte, Stand %s' % (len(produkte), katalog.get('stand')))

    mit_lokal = 0
    for u in produkte:
        bilder = lokale_bilder(u['id'])
        if bilder:
            u['images'] = bilder
            mit_lokal += 1
        # Felder, die nur die Schnittstelle braucht, gehören nicht in die Datei
        u.pop('shopifyVariantId', None)
    print('Bilder: %d aus dem Projekt, %d von der Shopify-Adresse'
          % (mit_lokal, len(produkte) - mit_lokal))

    alt = io.open(DATA, encoding='utf-8').read()
    neu = block_ersetzen(alt, 'PRODUCTS', produkte)
    shopify = json.loads(re.search(r'window\.SHOPIFY\s*=\s*(\{.*?\n\});', neu, re.S).group(1))
    shopify['products'] = katalog['shopify']
    neu = block_ersetzen(neu, 'SHOPIFY', shopify)

    if args.dry_run:
        print('--dry-run: nichts geschrieben (%d Zeichen vorher, %d nachher)' % (len(alt), len(neu)))
        return
    io.open(DATA, 'w', encoding='utf-8').write(neu)
    print('js/data.js aufgefrischt.')


if __name__ == '__main__':
    main()
