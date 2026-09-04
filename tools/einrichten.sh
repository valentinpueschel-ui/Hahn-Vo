#!/bin/bash
# Prüft, ob dieser Mac alles hat, um mit Claude Code die Website zu betreiben.
# Aufruf im Projektordner:   bash tools/einrichten.sh
# Installiert nichts von selbst — sagt, was fehlt und wie es geht.

cd "$(dirname "$0")/.." || exit 1
ok=0; fehlt=0
gut()   { echo "  ✔ $1"; ok=$((ok+1)); }
schlecht() { echo "  ✘ $1"; echo "      → $2"; fehlt=$((fehlt+1)); }

echo "Hahn & Vo — Umgebung prüfen ($(pwd))"
echo

echo "Werkzeuge"
# git und python3 bringen Apples Command Line Tools mit — kein Homebrew nötig:
#   xcode-select --install   (öffnet einen Apple-Dialog, einmal bestätigen)
command -v git >/dev/null && gut "git $(git --version | cut -d' ' -f3)" || schlecht "git fehlt" "xcode-select --install   (Apple-Dialog bestätigen, ~10 Minuten)"
command -v python3 >/dev/null && gut "python3 $(python3 --version | cut -d' ' -f2)" || schlecht "python3 fehlt" "xcode-select --install   (bringt python3 mit)"
command -v node >/dev/null && gut "node $(node --version) (optional, genauere Prüfung von js/data.js)" || echo "  · node fehlt — nicht nötig, die Skripte prüfen js/data.js dann per JSON-Prüfung"
command -v claude >/dev/null && gut "Claude Code (Terminal)" || echo "  · Claude Code im Terminal nicht gefunden — mit der Mac-App ist das in Ordnung"
command -v gh >/dev/null && gut "GitHub CLI" || echo "  · gh fehlt — nicht zwingend; zum Pushen reicht eine GitHub-Anmeldung (siehe unten)"
if git config --get credential.helper >/dev/null 2>&1 || (command -v gh >/dev/null && gh auth status >/dev/null 2>&1); then gut "GitHub-Anmeldung fürs Pushen vorhanden"; else echo "  · GitHub-Anmeldung fürs Pushen: entweder 'gh auth login' (öffnet den Browser) oder beim ersten Push Benutzername + Token eingeben"; fi

echo
echo "Python-Pakete"
python3 -c "import playwright" 2>/dev/null && gut "playwright" || schlecht "playwright fehlt (Inserate lesen)" "python3 -m pip install --user playwright && python3 -m playwright install chromium   (Homebrew-Python: --break-system-packages statt --user)"
python3 -c "from playwright.sync_api import sync_playwright" 2>/dev/null && python3 - <<'PY' 2>/dev/null && gut "Chromium für Playwright" || schlecht "Chromium für Playwright fehlt" "python3 -m playwright install chromium"
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(); b.close()
PY
python3 -c "import PIL" 2>/dev/null && gut "Pillow (Kontaktbögen)" || schlecht "Pillow fehlt" "python3 -m pip install --user pillow"
python3 -c "import openpyxl" 2>/dev/null && gut "openpyxl (Excel-Listen)" || echo "  · openpyxl fehlt — nur für Excel-Listen nötig: python3 -m pip install --user openpyxl"

echo
echo "Repo und Deploy"
remote=$(git remote get-url origin 2>/dev/null)
[ -n "$remote" ] && gut "origin = $remote" || schlecht "kein git remote" "git remote add origin <GitHub-Adresse>"
if git ls-remote --exit-code origin >/dev/null 2>&1; then gut "GitHub erreichbar, Zugriff vorhanden"; else schlecht "GitHub nicht erreichbar / kein Zugriff" "Als Mitarbeiter im Repo eingetragen? gh auth login oder SSH-Schlüssel"; fi
zweig=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
[ "$zweig" = "main" ] && gut "auf Zweig main (Vercel deployt von main)" || schlecht "auf Zweig $zweig" "git checkout main"
curl -s -o /dev/null -w '%{http_code}' https://hahn-vo.de/api/katalog.json | grep -q 200 && gut "hahn-vo.de/api/katalog.json antwortet" || schlecht "Katalog-Schnittstelle antwortet nicht" "Vercel-Deployment prüfen (vercel.com → Projekt hahn-vo-df1c)"

echo
echo "Zugänge"
if [ -f "$HOME/.hv-tokens" ]; then
  if grep -qE '^SHOPIFY_ADMIN_TOKEN=shpat_|^SHOPIFY_CLIENT_ID=' "$HOME/.hv-tokens"; then gut "~/.hv-tokens mit Shopify-Zugang (Direktmodus möglich)"; else gut "~/.hv-tokens vorhanden, ohne Shopify-Zugang (Connector-Modus)"; fi
else
  echo "  · ~/.hv-tokens fehlt — nicht nötig, solange der Shopify-Connector in claude.ai verbunden ist"
fi
echo "  · Shopify-Connector: in claude.ai → Einstellungen → Connectors → Shopify verbinden (mit dem Shop-Login)."
echo "    In Claude Code prüfen mit:  claude mcp list   → „claude.ai Shopify … Connected“"

echo
echo "Ergebnis: $ok in Ordnung, $fehlt fehlen."
[ $fehlt -eq 0 ] && echo "Bereit. Starte:  claude   und sag z. B. „Lade diese Uhr hoch: <Link>“." || exit 1
