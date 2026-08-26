#!/usr/bin/env python3
"""ARCHIV — NICHT MEHR AUSFUEHREN.

Dieses Skript hat js/data.js aus dem alten hahn-vo.de-Shop gebaut. Seit dem
26.08.2026 kommt der Bestand aus Shopify, und die alte Schnittstelle enthaelt
nachweislich verkaufte Uhren (66 Eintraege gegenueber 63 live). Wer das hier
ausfuehrt, ueberschreibt die Rueckfalllosung mit veralteten Daten.

Zum Auffrischen stattdessen:  python3 tools/fallback_bauen.py

Bleibt liegen, weil die Bild- und Beschreibungsaufbereitung dokumentiert,
woher der Altbestand stammt.
"""
import argparse, json, os, re, subprocess, urllib.request
import concurrent.futures as cf

SITE_ID = '6aadd0a7-b3e8-4362-8212-325d2d084f72'
API = f'https://{SITE_ID}.mysimplestore.com/api/v2/products'
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0 Safari/537.36'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMGDIR = os.path.join(ROOT, 'assets', 'products')

MARKEN = [
    'A. Lange & Söhne', 'A. Lange und Söhne', 'Audemars Piguet', 'Baume & Mercier',
    'Patek Philippe', 'Vacheron Constantin', 'Jaeger-LeCoultre', 'Jaeger Le Coultre',
    'Glashütte Original', 'Glashuette Original', 'Tag Heuer', 'TAG Heuer', 'MB&F',
    'Breitling', 'Cartier', 'Panerai', 'Montblanc', 'Longines', 'Junghans', 'Hublot',
    'Bvlgari', 'Bulgari', 'Zenith', 'Chopard', 'Rolex', 'Omega', 'Tudor', 'Nomos',
    'NOMOS', 'Sinn', 'IWC',
]
KANON = {'A. Lange und Söhne': 'A. Lange & Söhne', 'Jaeger Le Coultre': 'Jaeger-LeCoultre',
         'Tag Heuer': 'TAG Heuer', 'NOMOS': 'Nomos', 'Bulgari': 'Bvlgari',
         'Glashuette Original': 'Glashütte Original'}


def hole_alle():
    prods, seite = {}, 1
    while seite < 12:
        url = f'{API}?page_fallback=true&app=vnext&page={seite}&per_page=50'
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        with urllib.request.urlopen(req, timeout=60) as r:
            d = json.loads(r.read())
        items = d.get('products') or d.get('data') or []
        if not items:
            break
        for it in items:
            prods[it['id']] = it        # UUID als Schluessel: neue Uhren haben keine Alt-ID
        seite += 1
    return prods


def marke_und_modell(name):
    for m in MARKEN:
        if name.lower().startswith(m.lower()):
            marke = KANON.get(m, m)
            return marke, name[len(m):].strip()
    return '', name


def modell_saeubern(rest, ref):
    s = rest
    if ref:
        s = re.sub(re.escape(ref), ' ', s, flags=re.I)
    s = re.sub(r'\bRef\.?:?\s*', ' ', s, flags=re.I)
    s = re.sub(r'\b(im |aus |mit )?Full ?[Ss]et\b', ' ', s)
    s = re.sub(r'\bSERVICE[^,]*', ' ', s, flags=re.I)
    s = re.sub(r'\b(Jahr|Baujahr)\s*(19|20)\d\d\b', ' ', s, flags=re.I)
    s = re.sub(r'\baus\s+(dem\s+)?(Jahr\s+)?(19|20)\d\d\b', ' ', s, flags=re.I)
    s = re.sub(r'\b(19|20)\d\d\b', ' ', s)
    s = re.sub(r'\b\d{2}/\d{4}\b', ' ', s)
    s = re.sub(r'\bmit (Garantiekarte|Echtheitszertifikat|Dokumenten|Rechnung)\b', ' ', s, flags=re.I)
    s = re.sub(r'\b(Uhrenbox|Original Rolex Box|Tudor Box|Box)\b', ' ', s, flags=re.I)
    s = re.sub(r'\b(99% neu|NEU|neuwertig|ungetragen)\b', ' ', s)
    s = s.replace('ZB', 'Zifferblatt')
    s = re.sub(r'\s+', ' ', s).strip(' -–—,.:')
    return s


def ref_aus(name):
    kandidaten = re.findall(r'[A-Z0-9][A-Za-z0-9./-]{3,}', name)
    for k in reversed(kandidaten):
        if re.fullmatch(r'(19|20)\d\d', k):        continue
        if re.fullmatch(r'\d+[xX×]\d+', k):        continue
        if re.fullmatch(r'\d{1,2}[.,]?\d?mm', k):  continue
        if re.fullmatch(r'\d{1,2}/(19|20)\d\d', k):  continue
        if k.lower() in ('full', 'set', 'service', 'automatik', 'chronograph'): continue
        if any(c.isdigit() for c in k):
            return k
    return None


def specs_aus(desc):
    d = desc or ''
    def feld(*keys):
        for k in keys:
            m = re.search(k + r':\s*([^\n]{1,60})', d)
            if m:
                v = m.group(1).strip(' .,;')
                return v if v else None
        return None
    prosa = d
    for marker in ('Weitere Informationen und Lieferumfang', 'Weitere Informationen',
                   'Gesamtwertung', 'Gesamtbewertung', 'Lieferumfang'):
        i = prosa.find(marker)
        if i > 60:
            prosa = prosa[:i]
            break
    prosa = re.sub(r'\s+', ' ', prosa).strip()
    if len(prosa) > 520:
        schnitt = prosa[:520]
        p = max(schnitt.rfind('. '), schnitt.rfind('! '), schnitt.rfind('? '))
        if p > 150:
            prosa = schnitt[:p + 1]
    if prosa and not prosa.rstrip().endswith(('.', '!', '?')):
        prosa = prosa.rstrip(' ,;:—-') + '.'
    prosa = re.sub(r'Interner Code:\s*\S+\.?', '', prosa).strip()

    lieferumfang = []
    for muster, label in [(r'[Oo]riginale?\s+\w*\s*Papiere', 'Papiere'),
                          (r'[Oo]riginale?\s+\w*\s*Box|Uhrenbox', 'Box'),
                          (r'Garantiekarte', 'Garantiekarte'),
                          (r'Echtheitszertifikat', 'Echtheitszertifikat')]:
        if re.search(muster, d):
            lieferumfang.append(label)
    if 'Full Set' in d or len(lieferumfang) >= 2:
        lieferumfang = ['Full Set'] + [x for x in lieferumfang if x != 'Full Set']
    return {
        'rating': feld('Gesamtwertung', 'Gesamtbewertung'),
        'size': (feld('Gehäusedurchmesser') or '').replace('mm', ' mm').replace('  ', ' ').strip() or None,
        'year': feld('Baujahr'),
        'material': feld('Gehäusematerial'),
        'dial': feld('Zifferblattfarbe', 'Zifferblatt'),
        'strap': feld('Armbandmaterial'),
        'movement': feld('Uhrwerk', 'Werk'),
        'fullset': ', '.join(dict.fromkeys(lieferumfang)) or None,
        'desc': prosa,
    }


def bilder_urls(p, max_n=6):
    urls = []
    for a in (p.get('image_list') or []):
        u = a.get('url') or ''
        u = re.sub(r'/:/rs=.*$', '', u)          # Transformationssuffix entfernen
        if u and u not in urls:
            urls.append(u)
    return urls[:max_n]


def lade_bilder(aufgaben):
    def hol(t):
        url, ziel = t
        if os.path.exists(ziel) and os.path.getsize(ziel) > 1000:
            return True
        os.makedirs(os.path.dirname(ziel), exist_ok=True)
        for versuch in (url + '/:/rs=w:1200', url):
            r = subprocess.run(['curl', '-s', '-f', '-A', UA, '-o', ziel, versuch], timeout=90)
            if r.returncode == 0 and os.path.exists(ziel) and os.path.getsize(ziel) > 1000:
                return True
        return False
    ok = 0
    with cf.ThreadPoolExecutor(8) as ex:
        for r in ex.map(hol, aufgaben):
            ok += 1 if r else 0
    return ok, len(aufgaben)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()

    roh = hole_alle()
    print(f'Live-Bestand: {len(roh)} Uhren')

    # Stabile Kurz-IDs: Alt-ID beibehalten (Bilder + Shopify-Zuordnung bleiben gueltig),
    # fuer neue Uhren eine aus der UUID abgeleitete Nummer.
    def kurz_id(p, vergeben):
        alt = p.get('ols_product_id')
        if alt:
            return int(alt)
        h = int(re.sub(r'[^0-9a-f]', '', p['id'])[:8], 16) % 9000 + 1000
        while h in vergeben:
            h += 1
        return h

    reihenfolge = sorted(roh.values(), key=lambda p: p.get('created_at') or '', reverse=True)
    vergeben = set()
    for p in reihenfolge:
        p['_kurz'] = kurz_id(p, vergeben)
        vergeben.add(p['_kurz'])

    produkte, aufgaben = [], []
    for p in reihenfolge:
        pid = p['_kurz']
        name = p['name']
        marke, rest = marke_und_modell(name)
        ref = ref_aus(rest)
        modell = modell_saeubern(rest, ref)
        s = specs_aus(p.get('description_raw'))
        urls = bilder_urls(p)
        rel = []
        for i, u in enumerate(urls):
            ziel = os.path.join(IMGDIR, f'p{pid}', f'{i}.jpg')
            aufgaben.append((u, ziel))
            rel.append(f'assets/products/p{pid}/{i}.jpg')
        preis = (p.get('price') or {}).get('numeric')
        produkte.append({
            'id': f'p{pid}', 'brand': marke, 'name': modell or name, 'ref': ref,
            'price': int(preis) if preis else 0,
            'listPrice': None,
            'status': 'available' if p.get('available') else 'sold',
            'category': 'zubehoer' if 'schließe' in name.lower() or 'faltschliesse' in name.lower() else 'uhren',
            'fullset': s['fullset'], 'rating': s['rating'], 'year': s['year'], 'size': s['size'],
            'material': s['material'], 'dial': s['dial'], 'strap': s['strap'], 'movement': s['movement'],
            'sku': None, 'code': f'HV-{pid}', 'desc': s['desc'],
            'images': rel,
            'sourceUrl': 'https://hahn-vo.de/shop' + (p.get('relative_url') or ''),
        })

    if a.dry_run:
        for x in produkte[:70]:
            print(f"  {x['id']:6s} | {x['brand']:20s} | {x['name'][:46]:46s} | {x['price']:>7} € | ref {x['ref']}")
        return

    print(f'Bilder laden ({len(aufgaben)}) …')
    ok, ges = lade_bilder(aufgaben)
    print(f'  {ok}/{ges} geladen')

    # bestehende data.js: SITE, TESTIMONIALS, FAQ und passende Shopify-IDs behalten
    pfad = os.path.join(ROOT, 'js', 'data.js')
    alt = open(pfad, encoding='utf-8').read()
    def block(name, muster):
        m = re.search(muster, alt, re.S)
        return m.group(1) if m else None
    site = block('SITE', r'window\.SITE = (\{.*?\});')
    testi = block('TESTIMONIALS', r'window\.TESTIMONIALS = (\[.*?\]);')
    faq = block('FAQ', r'window\.FAQ = (\[.*?\]);')
    shop_alt = json.loads(block('SHOPIFY', r'"products": (\{.*?\})\n\};') or '{}')
    ids = {x['id'] for x in produkte}
    shop_neu = {k: v for k, v in shop_alt.items() if k in ids}

    flagship = next((x['id'] for x in produkte if x['brand'] == 'MB&F'), produkte[0]['id'])
    newin = [x['id'] for x in produkte if x['status'] == 'available'][:6]

    with open(pfad, 'w', encoding='utf-8') as f:
        f.write('/* HAHN & VO — Datenschicht (einzige Wahrheitsquelle).\n'
                '   Erzeugt aus dem Live-Bestand von hahn-vo.de mit tools/build_data.py */\n')
        f.write(f'window.SITE = {site};\n\n')
        f.write('window.PRODUCTS = ' + json.dumps(produkte, ensure_ascii=False, indent=1) + ';\n\n')
        f.write(f'window.FLAGSHIP_ID = {json.dumps(flagship)};\n')
        f.write('window.NEW_IN = ' + json.dumps(newin) + ';\n\n')
        f.write(f'window.TESTIMONIALS = {testi};\n\n')
        f.write(f'window.FAQ = {faq};\n\n')
        f.write('/* Shopify: Storefront-Zugang und feste Produktzuordnung. */\n')
        f.write('window.SHOPIFY = {\n "domain": "tami1g-0j.myshopify.com",\n'
                ' "storefrontAccessToken": "89c87251e5d1f73c1302b1674ba75b69",\n'
                ' "products": ' + json.dumps(shop_neu, ensure_ascii=False, indent=2).replace('\n', '\n ') + '\n};\n')
    print(f'js/data.js geschrieben: {len(produkte)} Uhren, {len(shop_neu)} bestehende Shopify-Zuordnungen behalten')

    # Warnen, wenn Kundenstimmen oder Instagram-Kacheln auf geloeschte Uhren zeigen
    tot = sorted({m for m in re.findall(r'assets/products/(p\d+)/', (testi or '') + '\n'
                                        + open(os.path.join(ROOT, 'js', 'home.js'), encoding='utf-8').read())
                  if not os.path.isdir(os.path.join(ROOT, 'assets', 'products', m))})
    if tot:
        print('  ACHTUNG: tote Bildverweise (Kundenstimmen/Instagram) auf: ' + ', '.join(tot))


if __name__ == '__main__':
    raise SystemExit(
        'Archiv: Dieses Skript wuerde js/data.js mit dem Stand des alten Shops\n'
        'ueberschreiben. Zum Auffrischen: python3 tools/fallback_bauen.py')
    main()
