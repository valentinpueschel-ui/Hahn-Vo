#!/usr/bin/env python3
"""Baut eine Shopify-Importdatei (CSV) aus js/data.js.

    python3 tools/shopify_csv.py --only p426 -o shopify-pilot.csv
    python3 tools/shopify_csv.py -o shopify-alle.csv

Hochladen in Shopify: Produkte -> Importieren -> Datei waehlen -> Importieren.
Bilder zieht Shopify selbst von den oeffentlichen URLs der Live-Website.
"""
import argparse, csv, json, os, re

IMG_BASE = 'https://hahn-vo-df1c.vercel.app/'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

COLS = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
        'Option1 Name', 'Option1 Value', 'Variant SKU', 'Variant Inventory Tracker',
        'Variant Inventory Qty', 'Variant Inventory Policy', 'Variant Fulfillment Service',
        'Variant Price', 'Variant Requires Shipping', 'Variant Taxable',
        'Image Src', 'Image Position', 'Image Alt Text', 'Status']


def load():
    src = open(os.path.join(ROOT, 'js', 'data.js'), encoding='utf-8').read()
    return json.loads(re.search(r'window\.PRODUCTS = (\[.*?\]);\n\nwindow\.FLAGSHIP_ID', src, re.S).group(1))


def handle(p):
    base = f"{p['brand']}-{p['name']}"
    h = re.sub(r'[^a-z0-9]+', '-', base.lower().replace('ä','ae').replace('ö','oe')
               .replace('ü','ue').replace('ß','ss')).strip('-')
    return f"{h}-{p['id']}"[:100]


def body(p):
    rows = [('Referenz', p.get('ref')), ('Baujahr', p.get('year')), ('Durchmesser', p.get('size')),
            ('Gehäuse', p.get('material')), ('Zifferblatt', p.get('dial')), ('Band', p.get('strap')),
            ('Werk', p.get('movement')), ('Lieferumfang', p.get('fullset')), ('Zustand', p.get('rating'))]
    table = ''.join(f'<tr><th align="left" style="padding:4px 18px 4px 0">{k}</th><td>{v}</td></tr>'
                    for k, v in rows if v)
    return (f"<p>{p.get('desc') or ''}</p><table>{table}</table>"
            '<p>Jede Uhr wird vor dem Verkauf geprüft. 12 Monate Garantie auf das Werk, '
            '14 Tage Rückgaberecht, weltweiter versicherter Versand oder persönliche Übergabe '
            'in unserem Showroom in Frankfurt.</p>')


def tags(p):
    t = [p.get('brand'), p.get('ref'), p.get('year'), p.get('rating')]
    if p.get('fullset') and 'Full Set' in p['fullset']:
        t.append('Full Set')
    return ', '.join(str(x) for x in t if x)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only'); ap.add_argument('-o', '--out', default='shopify-import.csv')
    a = ap.parse_args()
    prods = load()
    if a.only:
        prods = [p for p in prods if p['id'] == a.only]
    rows = []
    for p in prods:
        h = handle(p)
        imgs = p.get('images', [])[:6]
        rows.append({
            'Handle': h, 'Title': f"{p['brand']} {p['name']}".strip(), 'Body (HTML)': body(p),
            'Vendor': p.get('brand') or 'Hahn & Vo',
            'Type': 'Zubehör' if p.get('category') == 'zubehoer' else 'Armbanduhr',
            'Tags': tags(p), 'Published': 'TRUE',
            'Option1 Name': 'Titel', 'Option1 Value': 'Einzelstück',
            'Variant SKU': p.get('sku') or ('HV-' + p['id'].upper()),
            'Variant Inventory Tracker': 'shopify',
            'Variant Inventory Qty': 0 if p.get('status') == 'sold' else 1,
            'Variant Inventory Policy': 'deny', 'Variant Fulfillment Service': 'manual',
            'Variant Price': p['price'], 'Variant Requires Shipping': 'TRUE',
            'Variant Taxable': 'TRUE',
            'Image Src': IMG_BASE + imgs[0] if imgs else '',
            'Image Position': 1 if imgs else '',
            'Image Alt Text': f"{p['brand']} {p['name']}" if imgs else '',
            'Status': 'active',
        })
        for i, img in enumerate(imgs[1:], start=2):
            rows.append({'Handle': h, 'Image Src': IMG_BASE + img, 'Image Position': i,
                         'Image Alt Text': f"{p['brand']} {p['name']}"})
    out = os.path.join(ROOT, a.out)
    with open(out, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=COLS, extrasaction='ignore')
        w.writeheader()
        for r in rows:
            w.writerow({c: r.get(c, '') for c in COLS})
    print(f'{out}\n  {len(prods)} Uhren · {len(rows)} Zeilen (inkl. Zusatzbilder)')


if __name__ == '__main__':
    main()
