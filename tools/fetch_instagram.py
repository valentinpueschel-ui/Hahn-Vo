#!/usr/bin/env python3
"""Holt die neuesten Instagram-Beitraege von @hahn.vo und legt sie lokal ab.

Instagram liefert das Profilraster auch ohne Login aus, sobald eine echte
Browser-Engine rendert. Die Vorschaubilder liegen auf einer CDN-Adresse mit
ablaufender Signatur — deshalb werden sie heruntergeladen und lokal gespeichert.

    python3 tools/fetch_instagram.py              # 4 Beitraege
    python3 tools/fetch_instagram.py --anzahl 8
    python3 tools/fetch_instagram.py --dry-run

Ergebnis: assets/img/ig/<shortcode>.jpg und js/ig-posts.js (window.IG_POSTS).
Das Raster auf der Startseite liest ausschliesslich diese Datei.
"""

import argparse
import asyncio
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROFIL = 'https://www.instagram.com/hahn.vo/'
ZIEL_BILDER = os.path.join(ROOT, 'assets', 'img', 'ig')
ZIEL_JS = os.path.join(ROOT, 'js', 'ig-posts.js')
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/126.0 Safari/537.36')


async def beitraege_holen(anzahl):
    from playwright.async_api import async_playwright
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        seite = await browser.new_page(viewport={'width': 1400, 'height': 1400}, user_agent=UA)
        await seite.goto(PROFIL, wait_until='domcontentloaded', timeout=45000)
        await seite.wait_for_timeout(6000)
        # Raster: jeder Kachel-Link umschliesst genau ein Vorschaubild
        roh = await seite.evaluate("""
          [...document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')]
            .map(a => { const i = a.querySelector('img');
                        return i ? { href: a.getAttribute('href'),
                                     img: i.currentSrc || i.src,
                                     alt: (i.alt || '').slice(0, 300) } : null; })
            .filter(Boolean)
        """)
        gesehen, posts = set(), []
        for r in roh:
            m = re.search(r'/(p|reel)/([A-Za-z0-9_-]+)', r['href'] or '')
            if not m or not r['img'] or m.group(2) in gesehen:
                continue
            gesehen.add(m.group(2))
            posts.append({
                'shortcode': m.group(2),
                'url': 'https://www.instagram.com' + r['href'],
                'reel': m.group(1) == 'reel',
                'quelle': r['img'],          # Rasterbild, nur 360 px breit
                'alt': saubere_beschreibung(r['alt']),
            })
            if len(posts) >= anzahl:
                break

        # Das Profilraster liefert nur 360 px. Die oeffentliche Einbettung jedes
        # Beitrags haelt dieselbe Aufnahme in 900 px bereit — die holen wir uns.
        for p in posts:
            try:
                await seite.goto(f"https://www.instagram.com/p/{p['shortcode']}/embed/captioned/",
                                 wait_until='domcontentloaded', timeout=40000)
                await seite.wait_for_timeout(4000)
                gross = await seite.evaluate("""
                  [...document.images].map(i => ({src: i.src, w: i.naturalWidth}))
                    .filter(x => x.w > 400).sort((a, b) => b.w - a.w)[0] || null
                """)
                if gross:
                    p['quelle'] = gross['src']
                    p['breite'] = gross['w']
                text = await seite.evaluate(
                    "document.querySelector('.Caption')?.innerText || ''")
                if text.strip():
                    p['alt'] = saubere_beschreibung(text)
            except Exception as e:
                print(f"  {p['shortcode']}: Einbettung nicht erreichbar ({e.__class__.__name__}), "
                      f"Rasterbild wird verwendet")

        await browser.close()
    return posts


def saubere_beschreibung(alt):
    """Instagrams alt-Text ist brauchbar, aber technisch praefixiert."""
    alt = re.sub(r'^(Photo|Foto|Video|Reel) (by|von|shared by) .*?(on|am) [^:]*:?\s*', '', alt).strip()
    alt = re.sub(r'^hahn\.vo\s*', '', alt)
    alt = re.sub(r'#\S+', '', alt)
    alt = re.sub(r'\s+', ' ', alt).strip(' -–—·')
    return alt[:160] if alt else 'Beitrag von Hahn & Vo auf Instagram'


def bild_laden(url, ziel):
    r = subprocess.run(['curl', '-sL', '--max-time', '40', '-A', UA, url, '-o', ziel],
                       capture_output=True)
    return r.returncode == 0 and os.path.getsize(ziel) > 4000


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--anzahl', type=int, default=4, help='Wie viele Beitraege (Standard 4)')
    ap.add_argument('--dry-run', action='store_true', help='Nur anzeigen, nichts schreiben')
    args = ap.parse_args()

    print(f'Instagram-Profil lesen: {PROFIL}')
    posts = asyncio.run(beitraege_holen(args.anzahl))
    if not posts:
        print('Keine Beitraege gefunden — Instagram hat das Raster nicht ausgeliefert.')
        sys.exit(1)
    print(f'{len(posts)} Beitraege gefunden')
    for p in posts:
        print(f"  {'Reel ' if p['reel'] else 'Bild '} {p['shortcode']}  {p['alt'][:60]}")
    if args.dry_run:
        return

    os.makedirs(ZIEL_BILDER, exist_ok=True)
    fertig = []
    for p in posts:
        datei = os.path.join(ZIEL_BILDER, p['shortcode'] + '.jpg')
        if not bild_laden(p['quelle'], datei):
            print(f"  Vorschaubild fehlgeschlagen: {p['shortcode']} — Beitrag uebersprungen")
            if os.path.exists(datei):
                os.remove(datei)
            continue
        fertig.append({'url': p['url'], 'img': 'assets/img/ig/' + p['shortcode'] + '.jpg',
                       'reel': p['reel'], 'alt': p['alt']})
    if not fertig:
        print('Kein einziges Vorschaubild geladen — js/ig-posts.js bleibt unveraendert.')
        sys.exit(1)

    # Vorschaubilder aufraeumen, die kein Beitrag mehr braucht
    behalten = {os.path.basename(p['img']) for p in fertig}
    for name in os.listdir(ZIEL_BILDER):
        if name.endswith('.jpg') and name not in behalten:
            os.remove(os.path.join(ZIEL_BILDER, name))

    with open(ZIEL_JS, 'w', encoding='utf-8') as f:
        f.write('/* HAHN & VO — Instagram-Beitraege, Momentaufnahme von @hahn.vo.\n'
                '   Neu holen mit: python3 tools/fetch_instagram.py */\n')
        f.write('window.IG_POSTS = ' + json.dumps(fertig, ensure_ascii=False, indent=1) + ';\n')
    print(f'js/ig-posts.js geschrieben: {len(fertig)} Beitraege, Bilder in assets/img/ig/')


if __name__ == '__main__':
    main()
