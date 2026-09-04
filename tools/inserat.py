#!/usr/bin/env python3
"""Inserat lesen — Kleinanzeigen, eBay, Chrono24 oder ein Ordner mit Fotos.

Liefert für jede Quelle dasselbe Ergebnis in einem Arbeitsordner:

    arbeit/<name>/inserat.json     Titel, Preis, Beschreibung, Details, Bildliste
    arbeit/<name>/bilder/00.jpg …  alle eigenen Fotos in voller Auflösung
    arbeit/<name>/kontaktbogen.jpg alle Fotos mit Positionsnummer auf einem Blatt

Aufruf:

    python3 tools/inserat.py <URL>                 # Plattform wird an der URL erkannt
    python3 tools/inserat.py <URL> --name omega    # Name des Arbeitsordners
    python3 tools/inserat.py --ordner ~/Desktop/neue-uhr   # Fotos + beschreibung.txt

Der Ordner-Eingang ist der Rückfall, wenn eine Plattform sperrt: Fotos in einen
Ordner ziehen, daneben eine beschreibung.txt (freier Text, gern die kopierte
Inseratsbeschreibung), optional eine Zeile „Preis: 3450".

Kleinanzeigen sperrt IP-Bereiche zeitweise („IP-Bereich vorübergehend gesperrt").
Dagegen hilft nur: sichtbarer Browser, erst die Startseite besuchen, Cookies
annehmen, dann das Inserat — und bei Sperre warten und erneut versuchen. Genau
das tut dieses Skript, bis zu sechs Mal.

Was bei Kleinanzeigen zu beachten ist: Die Seite zeigt unter dem Inserat
„ähnliche Anzeigen" — oft die eigenen anderen Uhren von Hahn & Vo. Die
eigenen Fotos sind der erste Block in der Auflösung $_59.AUTO VOR dem
Verkäufer-Avatar (prod-user). Alles danach gehört fremden Anzeigen.
"""
import argparse, io, json, os, re, shutil, sys, time, urllib.request

UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARBEIT = os.path.join(ROOT, 'arbeit')


# ---------------------------------------------------------------- Hilfen

def sag(*a):
    print(*a, flush=True)


def preis_aus_text(t):
    """„3.450 €", „3450 € VB", „EUR 1.234,00" → 3450 (int) und ob VB."""
    if not t:
        return None, False
    s = str(t)
    vb = bool(re.search(r'\bVB\b', s))
    m = re.search(r'(\d{1,3}(?:[.\s]\d{3})+|\d+)(?:,(\d{2}))?', s)
    if not m:
        return None, vb
    ganz = re.sub(r'[.\s]', '', m.group(1))
    return int(ganz), vb


def lade(url, ziel, referer=None):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Referer': referer or url})
    with urllib.request.urlopen(req, timeout=90) as r:
        daten = r.read()
    with open(ziel, 'wb') as f:
        f.write(daten)
    return len(daten)


def bildgroesse(pfad):
    try:
        from PIL import Image
        with Image.open(pfad) as im:
            return im.size
    except Exception:
        return (0, 0)


def kontaktbogen(bilder_dir, ziel):
    from PIL import Image, ImageDraw
    dateien = sorted(f for f in os.listdir(bilder_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png')))
    if not dateien:
        return None
    spalten = 4
    w, h = 340, 300
    zeilen = (len(dateien) + spalten - 1) // spalten
    blatt = Image.new('RGB', (w * spalten, h * zeilen), 'white')
    zeichnen = ImageDraw.Draw(blatt)
    for i, name in enumerate(dateien):
        try:
            im = Image.open(os.path.join(bilder_dir, name)).convert('RGB')
        except Exception:
            continue
        breite, hoehe = im.size
        im.thumbnail((w - 16, h - 40))
        x = (i % spalten) * w
        y = (i // spalten) * h
        blatt.paste(im, (x + (w - im.width) // 2, y + 32 + (h - 32 - im.height) // 2))
        zeichnen.rectangle([x + 2, y + 2, x + w - 2, y + 28], fill='black')
        zeichnen.text((x + 10, y + 9), 'Pos %d  ·  %dx%d' % (i, breite, hoehe), fill='white')
    blatt.save(ziel, quality=88)
    return ziel


def browser_starten(pw, sichtbar=True):
    b = pw.chromium.launch(headless=not sichtbar, args=['--disable-blink-features=AutomationControlled'])
    ctx = b.new_context(locale='de-DE', timezone_id='Europe/Berlin',
                        viewport={'width': 1400, 'height': 1000}, user_agent=UA)
    ctx.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>undefined})")
    return b, ctx


def cookies_annehmen(pg):
    for sel in ['#gdpr-banner-accept', "button:has-text('Alle akzeptieren')",
                "button:has-text('Accept all')", '#gdpr-banner-cmp-button',
                "button:has-text('Alle Cookies akzeptieren')", "button#onetrust-accept-btn-handler"]:
        try:
            pg.click(sel, timeout=2500)
            return True
        except Exception:
            pass
    return False


# ---------------------------------------------------------------- Kleinanzeigen

def lese_kleinanzeigen(url, sichtbar=True, versuche=6):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        for n in range(1, versuche + 1):
            b, ctx = browser_starten(pw, sichtbar)
            pg = ctx.new_page()
            try:
                pg.goto('https://www.kleinanzeigen.de/', wait_until='domcontentloaded', timeout=60000)
                pg.wait_for_timeout(3000)
                cookies_annehmen(pg)
                pg.wait_for_timeout(1500)
                pg.goto(url, wait_until='domcontentloaded', timeout=60000)
                pg.wait_for_timeout(4500)
                text = pg.evaluate('() => document.body.innerText')
                if 'gesperrt' in text.lower()[:1500] or 'vorübergehend' in text.lower()[:600]:
                    sag('  Versuch %d: Kleinanzeigen sperrt gerade — warte 25 s' % n)
                    b.close()
                    time.sleep(25)
                    continue
                d = pg.evaluate("""() => ({
                  titel: document.querySelector('#viewad-title')?.innerText?.trim(),
                  preis: document.querySelector('#viewad-price')?.innerText?.trim(),
                  beschreibung: document.querySelector('#viewad-description-text')?.innerText?.trim(),
                  details: [...document.querySelectorAll('.addetailslist--detail')]
                             .map(e => e.innerText.replace(/\\n+/g, ': ').trim()),
                  bilder: [...document.querySelectorAll('img')]
                             .map(i => i.getAttribute('data-imgsrc') || i.src)
                             .filter(u => u && u.indexOf('img.kleinanzeigen') >= 0)
                })""")
                b.close()
                if not d.get('titel'):
                    sag('  Versuch %d: Seite ohne Titel geladen (Inserat gelöscht?)' % n)
                    time.sleep(10)
                    continue
                return d
            except Exception as e:
                sag('  Versuch %d: Fehler %s' % (n, str(e)[:120]))
                try:
                    b.close()
                except Exception:
                    pass
                time.sleep(15)
    return None


def kleinanzeigen_eigene_bilder(urls):
    """Die eigene Galerie ist der erste $_59.AUTO-Block vor dem Verkäufer-Avatar."""
    eigene = []
    for u in urls:
        if 'prod-user' in u:
            break
        if '$_59.AUTO' not in u:
            continue
        m = re.search(r'/images/([0-9a-f]{2}/[0-9a-f-]{36})', u)
        if m and m.group(1) not in eigene:
            eigene.append(m.group(1))
    return eigene


def kleinanzeigen_details(liste):
    d = {}
    for z in liste or []:
        if ':' in z:
            k, v = z.split(':', 1)
            d[k.strip()] = v.strip()
    return d


def hole_kleinanzeigen(url, ziel, sichtbar):
    sag('Kleinanzeigen lesen …')
    d = lese_kleinanzeigen(url, sichtbar)
    if not d:
        raise SystemExit('Kleinanzeigen hat alle Versuche gesperrt. Später erneut versuchen — '
                         'oder die Fotos aus dem Inserat in einen Ordner ziehen und mit --ordner weitermachen.')
    pfade = kleinanzeigen_eigene_bilder(d['bilder'])
    bilder_dir = os.path.join(ziel, 'bilder')
    os.makedirs(bilder_dir, exist_ok=True)
    bilder = []
    for i, pfad in enumerate(pfade):
        datei = os.path.join(bilder_dir, '%02d.jpg' % i)
        quelle = 'https://img.kleinanzeigen.de/api/v1/prod-ads/images/%s?rule=$_86.JPG' % pfad
        try:
            groesse = lade(quelle, datei, referer='https://www.kleinanzeigen.de/')
        except Exception as e:
            sag('  Bild %d nicht geladen: %s' % (i, str(e)[:80]))
            continue
        if groesse < 15000:  # Platzhalter oder Fehlerbild
            os.remove(datei)
            continue
        b, h = bildgroesse(datei)
        bilder.append({'position': i, 'datei': 'bilder/%02d.jpg' % i, 'quelle': quelle, 'breite': b, 'hoehe': h})
    preis, vb = preis_aus_text(d.get('preis'))
    return {
        'quelle': 'kleinanzeigen', 'url': url, 'titel': d.get('titel'),
        'preis': preis, 'preis_text': d.get('preis'), 'verhandlungsbasis': vb,
        'beschreibung': d.get('beschreibung') or '',
        'details': kleinanzeigen_details(d.get('details')),
        'bilder': bilder,
        'hinweis': 'Eigene Galerie = %d Bilder (Block vor dem Verkäufer-Avatar). Fremde „ähnliche Anzeigen" ausgeschlossen.' % len(bilder),
    }


# ---------------------------------------------------------------- eBay

def hole_ebay(url, ziel, sichtbar):
    """Best-effort-Leser für eBay-Artikelseiten. Ungetestet gegen eBay-Sperren —
    wenn er scheitert, ist der Ordner-Eingang der Weg."""
    from playwright.sync_api import sync_playwright
    sag('eBay lesen …')
    d = None
    with sync_playwright() as pw:
        for n in range(1, 4):
            b, ctx = browser_starten(pw, sichtbar)
            pg = ctx.new_page()
            try:
                pg.goto(url, wait_until='domcontentloaded', timeout=60000)
                pg.wait_for_timeout(4000)
                cookies_annehmen(pg)
                pg.wait_for_timeout(1500)
                text = pg.evaluate('() => document.body.innerText')
                if re.search(r'Pardon Our Interruption|captcha|Zugriff verweigert', text[:2000], re.I):
                    sag('  Versuch %d: eBay blockt — warte 20 s' % n)
                    b.close()
                    time.sleep(20)
                    continue
                d = pg.evaluate("""() => {
                  const t = document.querySelector('h1.x-item-title__mainTitle, h1[data-testid="x-item-title"], h1');
                  const p = document.querySelector('.x-price-primary, [data-testid="x-price-primary"], #prcIsum');
                  const specs = {};
                  document.querySelectorAll('.ux-labels-values').forEach(e => {
                    const k = e.querySelector('.ux-labels-values__labels')?.innerText?.trim();
                    const v = e.querySelector('.ux-labels-values__values')?.innerText?.trim();
                    if (k && v) specs[k.replace(/:$/, '')] = v;
                  });
                  const imgs = [];
                  document.querySelectorAll('img').forEach(i => {
                    const s = i.getAttribute('data-zoom-src') || i.getAttribute('data-src') || i.src || '';
                    if (s.indexOf('i.ebayimg.com/images/g/') >= 0) imgs.push(s);
                  });
                  const fr = document.querySelector('#desc_ifr');
                  return { titel: t?.innerText?.trim(), preis: p?.innerText?.trim(), specs,
                           bilder: imgs, desc_src: fr?.src || null,
                           desc_inline: document.querySelector('#desc_div, .d-item-description')?.innerText?.trim() || '' };
                }""")
                beschreibung = d.get('desc_inline') or ''
                if d.get('desc_src'):
                    try:
                        p2 = ctx.new_page()
                        p2.goto(d['desc_src'], wait_until='domcontentloaded', timeout=60000)
                        p2.wait_for_timeout(2000)
                        beschreibung = p2.evaluate('() => document.body.innerText').strip()
                        p2.close()
                    except Exception:
                        pass
                d['beschreibung'] = beschreibung
                b.close()
                break
            except Exception as e:
                sag('  Versuch %d: Fehler %s' % (n, str(e)[:120]))
                try:
                    b.close()
                except Exception:
                    pass
                time.sleep(10)
    if not d or not d.get('titel'):
        raise SystemExit('eBay ließ sich nicht lesen. Fotos vom Inserat in einen Ordner ziehen und mit --ordner weitermachen.')
    # Bild-IDs einsammeln, größte Fassung laden
    ids = []
    for u in d['bilder']:
        m = re.search(r'/images/g/([^/]+)/', u)
        if m and m.group(1) not in ids:
            ids.append(m.group(1))
    bilder_dir = os.path.join(ziel, 'bilder')
    os.makedirs(bilder_dir, exist_ok=True)
    bilder = []
    for i, bid in enumerate(ids):
        datei = os.path.join(bilder_dir, '%02d.jpg' % i)
        ok = False
        for fassung in ('s-l1600', 's-l1200', 's-l800'):
            quelle = 'https://i.ebayimg.com/images/g/%s/%s.jpg' % (bid, fassung)
            try:
                if lade(quelle, datei, referer=url) > 15000:
                    ok = True
                    break
            except Exception:
                continue
        if not ok:
            continue
        b, h = bildgroesse(datei)
        bilder.append({'position': i, 'datei': 'bilder/%02d.jpg' % i, 'quelle': quelle, 'breite': b, 'hoehe': h})
    preis, vb = preis_aus_text(d.get('preis'))
    return {
        'quelle': 'ebay', 'url': url, 'titel': d.get('titel'), 'preis': preis, 'preis_text': d.get('preis'),
        'verhandlungsbasis': vb, 'beschreibung': d.get('beschreibung') or '',
        'details': d.get('specs') or {}, 'bilder': bilder,
        'hinweis': 'eBay-Leser ist Best-effort: Bilder und Artikelmerkmale prüfen. Bei „Preisvorschlag" gilt der Festpreis.',
    }


# ---------------------------------------------------------------- Chrono24

def hole_chrono24(url, ziel, sichtbar):
    """Öffentliche Chrono24-Inseratsseite (…--idNNNNNNNN.htm). Händlerbereich-Links
    (dealer-area) brauchen ein Login und funktionieren hier nicht."""
    from playwright.sync_api import sync_playwright
    sag('Chrono24 lesen …')
    if 'dealer-area' in url:
        raise SystemExit('Das ist ein Händlerbereich-Link (Login nötig). Bitte die öffentliche Inseratsadresse nehmen '
                         '(…--id12345678.htm) oder die Fotos in einen Ordner ziehen und --ordner nutzen.')
    d = None
    with sync_playwright() as pw:
        for n in range(1, 4):
            b, ctx = browser_starten(pw, sichtbar)
            pg = ctx.new_page()
            try:
                pg.goto('https://www.chrono24.de/', wait_until='domcontentloaded', timeout=60000)
                pg.wait_for_timeout(3000)
                cookies_annehmen(pg)
                pg.goto(url, wait_until='domcontentloaded', timeout=60000)
                pg.wait_for_timeout(4500)
                text = pg.evaluate('() => document.body.innerText')
                if re.search(r'captcha|Zugriff verweigert|Just a moment|DataDome', text[:2000], re.I):
                    sag('  Versuch %d: Chrono24 blockt — warte 25 s' % n)
                    b.close()
                    time.sleep(25)
                    continue
                d = pg.evaluate("""() => {
                  let ld = null;
                  document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
                    try { const j = JSON.parse(s.textContent); const arr = Array.isArray(j) ? j : [j];
                      arr.forEach(x => { if (x['@type'] === 'Product') ld = x; }); } catch (e) {}
                  });
                  const specs = {};
                  document.querySelectorAll('table tr').forEach(tr => {
                    const c = tr.querySelectorAll('td, th');
                    if (c.length >= 2) { const k = c[0].innerText.trim(); const v = c[1].innerText.trim(); if (k && v && k.length < 40) specs[k] = v; }
                  });
                  const imgs = [];
                  document.querySelectorAll('img').forEach(i => {
                    const s = i.getAttribute('data-src') || i.getAttribute('data-lazy') || i.src || '';
                    if (s.indexOf('img.chrono24.com/images/uhren/') >= 0) imgs.push(s);
                  });
                  const desc = document.querySelector('.js-description, [itemprop="description"], .description')?.innerText?.trim() || '';
                  return { ld, specs, bilder: imgs, beschreibung: desc,
                           titel: document.querySelector('h1')?.innerText?.trim(),
                           preis: document.querySelector('.js-price-shipping-country, .price, [data-price]')?.innerText?.trim() };
                }""")
                b.close()
                break
            except Exception as e:
                sag('  Versuch %d: Fehler %s' % (n, str(e)[:120]))
                try:
                    b.close()
                except Exception:
                    pass
                time.sleep(10)
    if not d or not (d.get('titel') or (d.get('ld') or {}).get('name')):
        raise SystemExit('Chrono24 ließ sich nicht lesen. Fotos in einen Ordner ziehen und mit --ordner weitermachen.')
    ld = d.get('ld') or {}
    titel = ld.get('name') or d.get('titel')
    preis = None
    off = ld.get('offers')
    if isinstance(off, dict) and off.get('price'):
        preis = int(float(off['price']))
    if preis is None:
        preis, _ = preis_aus_text(d.get('preis'))
    # Bilder: Basis-ID ohne Größen-Suffix, dann -Zoom laden
    basen = []
    quellen = list(d.get('bilder') or [])
    if isinstance(ld.get('image'), list):
        quellen = ld['image'] + quellen
    elif isinstance(ld.get('image'), str):
        quellen = [ld['image']] + quellen
    for u in quellen:
        m = re.search(r'(https://img\.chrono24\.com/images/uhren/[^/]+?)-(?:Zoom|ExtraLarge|Large|Medium|Square\w*|Small)\.jpg', u)
        if m and m.group(1) not in basen:
            basen.append(m.group(1))
    bilder_dir = os.path.join(ziel, 'bilder')
    os.makedirs(bilder_dir, exist_ok=True)
    bilder = []
    for i, basis in enumerate(basen):
        datei = os.path.join(bilder_dir, '%02d.jpg' % i)
        ok = False
        for fassung in ('Zoom', 'ExtraLarge', 'Large'):
            quelle = '%s-%s.jpg' % (basis, fassung)
            try:
                if lade(quelle, datei, referer='https://www.chrono24.de/') > 15000:
                    ok = True
                    break
            except Exception:
                continue
        if not ok:
            continue
        b, h = bildgroesse(datei)
        bilder.append({'position': i, 'datei': 'bilder/%02d.jpg' % i, 'quelle': quelle, 'breite': b, 'hoehe': h})
    return {
        'quelle': 'chrono24', 'url': url, 'titel': titel, 'preis': preis, 'preis_text': d.get('preis'),
        'verhandlungsbasis': False, 'beschreibung': d.get('beschreibung') or ld.get('description') or '',
        'details': d.get('specs') or {}, 'bilder': bilder,
        'hinweis': 'Chrono24-Leser ist Best-effort. Chrono24-Preise liegen meist über dem Website-Preis — Preis bewusst festlegen.',
    }


# ---------------------------------------------------------------- Ordner

def hole_ordner(quelle, ziel):
    sag('Ordner lesen …')
    quelle = os.path.expanduser(quelle)
    if not os.path.isdir(quelle):
        raise SystemExit('Ordner nicht gefunden: %s' % quelle)
    from PIL import Image
    bilder_dir = os.path.join(ziel, 'bilder')
    os.makedirs(bilder_dir, exist_ok=True)
    dateien = sorted(f for f in os.listdir(quelle)
                     if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.heic', '.tif', '.tiff')))
    bilder = []
    i = 0
    for name in dateien:
        pfad = os.path.join(quelle, name)
        datei = os.path.join(bilder_dir, '%02d.jpg' % i)
        try:
            im = Image.open(pfad)
            im = im.convert('RGB')
            im.save(datei, quality=92)
        except Exception as e:
            sag('  %s übersprungen (%s) — HEIC vorher in JPG wandeln (Vorschau → Exportieren)' % (name, str(e)[:60]))
            continue
        b, h = bildgroesse(datei)
        bilder.append({'position': i, 'datei': 'bilder/%02d.jpg' % i, 'quelle': pfad, 'breite': b, 'hoehe': h})
        i += 1
    text = ''
    for kandidat in ('beschreibung.txt', 'Beschreibung.txt', 'text.txt', 'inserat.txt'):
        p = os.path.join(quelle, kandidat)
        if os.path.exists(p):
            text = io.open(p, encoding='utf-8', errors='replace').read().strip()
            break
    preis = None
    m = re.search(r'Preis\s*[:=]\s*([\d.\s]+)', text)
    if m:
        preis, _ = preis_aus_text(m.group(1))
    titel = text.split('\n', 1)[0].strip()[:120] if text else os.path.basename(quelle.rstrip('/'))
    return {
        'quelle': 'ordner', 'url': quelle, 'titel': titel, 'preis': preis, 'preis_text': m.group(0) if m else None,
        'verhandlungsbasis': False, 'beschreibung': text, 'details': {}, 'bilder': bilder,
        'hinweis': 'Ordner-Eingang: Titel = erste Zeile der beschreibung.txt, Preis aus „Preis: …" oder per --preis.',
    }


# ---------------------------------------------------------------- Hauptprogramm

def plattform(url):
    u = url.lower()
    if 'kleinanzeigen.de' in u:
        return 'kleinanzeigen'
    if 'ebay.' in u:
        return 'ebay'
    if 'chrono24.' in u:
        return 'chrono24'
    return None


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('url', nargs='?', help='Inseratsadresse (Kleinanzeigen, eBay, Chrono24)')
    ap.add_argument('--ordner', help='statt URL: Ordner mit Fotos und beschreibung.txt')
    ap.add_argument('--name', help='Name des Arbeitsordners unter arbeit/ (Standard: aus der URL)')
    ap.add_argument('--preis', type=int, help='Preis überschreiben (Euro, ganz)')
    ap.add_argument('--kopflos', action='store_true', help='Browser unsichtbar (wird öfter gesperrt)')
    a = ap.parse_args()
    if not a.url and not a.ordner:
        ap.error('URL oder --ordner angeben')

    if a.ordner:
        name = a.name or os.path.basename(os.path.normpath(os.path.expanduser(a.ordner)))
    else:
        name = a.name or re.sub(r'[^a-z0-9]+', '-', a.url.lower().split('/')[-1].split('?')[0])[:40].strip('-') or 'inserat'
    ziel = os.path.join(ARBEIT, name)
    if os.path.isdir(ziel):
        shutil.rmtree(ziel)
    os.makedirs(ziel)

    if a.ordner:
        daten = hole_ordner(a.ordner, ziel)
    else:
        art = plattform(a.url)
        if art == 'kleinanzeigen':
            daten = hole_kleinanzeigen(a.url, ziel, not a.kopflos)
        elif art == 'ebay':
            daten = hole_ebay(a.url, ziel, not a.kopflos)
        elif art == 'chrono24':
            daten = hole_chrono24(a.url, ziel, not a.kopflos)
        else:
            raise SystemExit('Plattform nicht erkannt. Unterstützt: kleinanzeigen.de, ebay.*, chrono24.* — oder --ordner.')

    if a.preis:
        daten['preis'] = a.preis
        daten['preis_text'] = '%d € (per --preis gesetzt)' % a.preis

    bogen = kontaktbogen(os.path.join(ziel, 'bilder'), os.path.join(ziel, 'kontaktbogen.jpg'))
    daten['arbeitsordner'] = os.path.relpath(ziel, ROOT)
    daten['kontaktbogen'] = 'kontaktbogen.jpg' if bogen else None
    daten['gelesen_am'] = time.strftime('%Y-%m-%d %H:%M')
    with io.open(os.path.join(ziel, 'inserat.json'), 'w', encoding='utf-8') as f:
        json.dump(daten, f, ensure_ascii=False, indent=1)

    sag('')
    sag('Quelle:      ', daten['quelle'])
    sag('Titel:       ', daten['titel'])
    sag('Preis:       ', daten['preis'], '(%s)' % daten.get('preis_text'), '— VERHANDLUNGSBASIS' if daten.get('verhandlungsbasis') else '')
    sag('Bilder:      ', len(daten['bilder']), 'eigene')
    for k, v in list(daten['details'].items())[:12]:
        sag('  %-22s %s' % (k, v[:70]))
    sag('Beschreibung:', len(daten['beschreibung']), 'Zeichen')
    sag('')
    sag('Arbeitsordner:', daten['arbeitsordner'])
    sag('Kontaktbogen: ', os.path.join(daten['arbeitsordner'], 'kontaktbogen.jpg') if bogen else '— keine Bilder')
    if daten.get('hinweis'):
        sag('Hinweis:      ', daten['hinweis'])
    if not daten['bilder']:
        sag('WARNUNG: keine Bilder — ohne Fotos keine Uhr anlegen.')
        sys.exit(2)


if __name__ == '__main__':
    main()
