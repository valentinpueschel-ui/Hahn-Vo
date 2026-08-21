#!/usr/bin/env python3
"""Legt die Uhren aus js/data.js als Produkte in Shopify an.

Vorbereitung in Shopify: Einstellungen -> Apps und Vertriebskanaele ->
App entwickeln -> App erstellen -> Admin-API-Integration konfigurieren ->
Zugriff auf write_products, read_products, write_inventory, read_locations
-> Installieren -> Admin-API-Zugriffstoken (beginnt mit shpat_) kopieren.

    export SHOPIFY_ADMIN_TOKEN=shpat_xxx

    python3 tools/shopify_import.py --check            # Zugang pruefen
    python3 tools/shopify_import.py --only p426        # eine Uhr (Pilot)
    python3 tools/shopify_import.py --limit 5          # die naechsten fuenf
    python3 tools/shopify_import.py                    # alle

Der Lauf ist wiederholbar: Uhren, deren Artikelnummer schon in Shopify
liegt, werden uebersprungen.
"""
import argparse, json, os, re, sys, urllib.request

SHOP = 'tami1g-0j.myshopify.com'
API = '2024-10'
IMG_BASE = 'https://hahn-vo-df1c.vercel.app/'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def gql(token, query, variables=None):
    body = json.dumps({'query': query, 'variables': variables or {}}).encode()
    req = urllib.request.Request(
        f'https://{SHOP}/admin/api/{API}/graphql.json', data=body,
        headers={'Content-Type': 'application/json', 'X-Shopify-Access-Token': token})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            out = json.loads(r.read())
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            raise SystemExit('Token wird abgelehnt (HTTP %d). Stimmen die Rechte '
                             'write_products / read_products / write_inventory / read_locations?' % e.code)
        raise SystemExit('HTTP %d von Shopify: %s' % (e.code, e.read()[:300].decode('utf-8', 'replace')))
    except urllib.error.URLError as e:
        raise SystemExit('Shopify nicht erreichbar: %s' % e.reason)
    if 'errors' in out:
        raise SystemExit('API-Fehler: ' + json.dumps(out['errors'], ensure_ascii=False)[:600])
    return out['data']


def load_products():
    src = open(os.path.join(ROOT, 'js', 'data.js'), encoding='utf-8').read()
    m = re.search(r'window\.PRODUCTS = (\[.*?\]);\n\nwindow\.FLAGSHIP_ID', src, re.S)
    return json.loads(m.group(1))


def description_html(p):
    rows = [('Referenz', p.get('ref')), ('Baujahr', p.get('year')),
            ('Durchmesser', p.get('size')), ('Gehäuse', p.get('material')),
            ('Zifferblatt', p.get('dial')), ('Band', p.get('strap')),
            ('Werk', p.get('movement')), ('Lieferumfang', p.get('fullset')),
            ('Zustand', p.get('rating'))]
    rows = [(k, v) for k, v in rows if v]
    table = ''.join(f'<tr><th align="left" style="padding:4px 18px 4px 0;font-weight:600">{k}</th>'
                    f'<td style="padding:4px 0">{v}</td></tr>' for k, v in rows)
    intro = p.get('desc') or ''
    return (f'<p>{intro}</p><table>{table}</table>'
            '<p>Jede Uhr wird vor dem Verkauf geprüft. 12 Monate Garantie auf das Werk, '
            '14 Tage Rückgaberecht, weltweiter versicherter Versand oder persönliche '
            'Übergabe in unserem Showroom in Frankfurt.</p>')


def tags(p):
    t = [p['brand']] if p.get('brand') else []
    for key in ('ref', 'year', 'rating', 'material'):
        if p.get(key):
            t.append(str(p[key]))
    if p.get('fullset') and 'Full Set' in p['fullset']:
        t.append('Full Set')
    return [x for x in t if x][:12]


def existing_skus(token):
    skus, cursor = set(), None
    while True:
        data = gql(token, '''query($c: String) { products(first: 100, after: $c) {
            edges { cursor node { variants(first: 1) { edges { node { sku } } } } }
            pageInfo { hasNextPage } } }''', {'c': cursor})
        edges = data['products']['edges']
        for e in edges:
            v = e['node']['variants']['edges']
            if v and v[0]['node']['sku']:
                skus.add(v[0]['node']['sku'])
        if not data['products']['pageInfo']['hasNextPage'] or not edges:
            break
        cursor = edges[-1]['cursor']
    return skus


PRODUCT_SET = '''mutation($input: ProductSetInput!) {
  productSet(synchronous: true, input: $input) {
    product { id handle title }
    userErrors { field message }
  }
}'''


def build_input(p, location_id):
    sku = p.get('sku') or ('HV-' + p['id'].upper())
    files = [{'originalSource': IMG_BASE + img, 'contentType': 'IMAGE',
              'alt': f"{p['brand']} {p['name']}"} for img in p.get('images', [])[:6]]
    variant = {
        'price': str(p['price']),
        'sku': sku,
        'taxable': True,
        'inventoryItem': {'tracked': True},
        'inventoryQuantities': [{'locationId': location_id, 'name': 'available',
                                 'quantity': 0 if p.get('status') == 'sold' else 1}],
        'optionValues': [{'optionName': 'Titel', 'name': 'Einzelstück'}],
    }
    return {
        'title': f"{p['brand']} {p['name']}".strip(),
        'descriptionHtml': description_html(p),
        'vendor': p['brand'] or 'Hahn & Vo',
        'productType': 'Armbanduhr' if p.get('category') != 'zubehoer' else 'Zubehör',
        'status': 'ACTIVE',
        'tags': tags(p),
        'productOptions': [{'name': 'Titel', 'values': [{'name': 'Einzelstück'}]}],
        'variants': [variant],
        'files': files,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--token', default=os.environ.get('SHOPIFY_ADMIN_TOKEN'))
    ap.add_argument('--only', help='eine data.js-ID, z. B. p426')
    ap.add_argument('--limit', type=int)
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args()

    if not a.token:
        sys.exit('Kein Token. export SHOPIFY_ADMIN_TOKEN=shpat_… oder --token angeben.')

    shop = gql(a.token, '{ shop { name currencyCode } locations(first: 1) { edges { node { id name } } } }')
    loc = shop['locations']['edges'][0]['node']
    print(f"Shop: {shop['shop']['name']} ({shop['shop']['currencyCode']}) · Lager: {loc['name']}")
    if a.check:
        return

    products = load_products()
    if a.only:
        products = [p for p in products if p['id'] == a.only]
        if not products:
            sys.exit(f'{a.only} nicht in data.js gefunden.')
    have = existing_skus(a.token)
    todo = [p for p in products if (p.get('sku') or '') not in have]
    print(f'{len(products)} Uhren geprüft · {len(products) - len(todo)} bereits in Shopify · {len(todo)} offen')
    if a.limit:
        todo = todo[:a.limit]

    ok = fail = 0
    for p in todo:
        payload = build_input(p, loc['id'])
        label = f"{p['id']} {payload['title'][:46]}"
        if a.dry_run:
            print(f'  [trocken] {label} · {p["price"]} € · {len(payload["files"])} Bilder')
            continue
        try:
            res = gql(a.token, PRODUCT_SET, {'input': payload})['productSet']
        except SystemExit as e:
            print(f'  FEHLER {label}: {e}'); fail += 1; continue
        errs = res.get('userErrors') or []
        if errs:
            print(f'  FEHLER {label}: ' + '; '.join(f"{'.'.join(x.get('field') or [])}: {x['message']}" for x in errs))
            fail += 1
        else:
            print(f"  angelegt {label} · {p['price']} € · {len(payload['files'])} Bilder")
            ok += 1
    print(f'\nFertig: {ok} angelegt, {fail} fehlgeschlagen.')


if __name__ == '__main__':
    main()
