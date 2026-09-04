#!/usr/bin/env python3
"""Lokaler Server für die Website — http://localhost:8440

Wie Vercel, nur ohne die Serverfunktionen: saubere Adressen ohne .html,
und /produkt liefert die Vorlage produkt-vorlage.html (die Uhr füllt dann
js/product.js aus js/data.js bzw. der Live-Schnittstelle).

    python3 tools/serve.py            # Port 8440
    python3 tools/serve.py 8441       # anderer Port
"""
import http.server, os, sys, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8440


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def translate_path(self, path):
        pfad = urllib.parse.urlparse(path).path
        if pfad == '/produkt':
            return os.path.join(ROOT, 'produkt-vorlage.html')
        voll = super().translate_path(path)
        # Saubere Adressen: /shop → shop.html
        if not os.path.exists(voll) and os.path.isfile(voll + '.html'):
            return voll + '.html'
        return voll

    def log_message(self, fmt, *args):
        sys.stdout.write('%s %s\n' % (self.log_date_time_string(), fmt % args))


if __name__ == '__main__':
    print('Hahn & Vo Shop → http://localhost:%d' % PORT)
    http.server.ThreadingHTTPServer(('', PORT), Handler).serve_forever()
