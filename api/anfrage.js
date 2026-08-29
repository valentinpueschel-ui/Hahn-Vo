/* HAHN & VO — Anfragen aus Suchauftrag und Ankauf ins Postfach.
 *
 * Die Website schickt die Angaben hierher; von hier geht eine E-Mail an das
 * Postfach (ANFRAGE_AN, Standard info@hahntime.com). Versand über Resend —
 * der Schlüssel liegt als RESEND_API_KEY in den Vercel-Umgebungsvariablen,
 * nie im Code.
 *
 * Fehlt der Schlüssel oder scheitert der Versand, antwortet die Funktion
 * ehrlich mit einem Fehler. Die Website zeigt dann nicht „eingegangen“,
 * sondern macht WhatsApp zum Weg — mit fertig vorgefülltem Text. */

var STANDARD_AN = 'info@hahntime.com';
var STANDARD_VON = 'Hahn & Vo Website <onboarding@resend.dev>';

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function lies(req) {
  var b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
  return b && typeof b === 'object' ? b : {};
}

function finde(daten, muster) {
  var treffer = null;
  Object.keys(daten || {}).forEach(function (k) {
    var v = daten[k];
    if (!treffer && typeof v === 'string' && muster.test(v.trim())) treffer = v.trim();
  });
  return treffer;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, grund: 'nur-post' });

  var b = lies(req);
  var daten = b.daten && typeof b.daten === 'object' ? b.daten : {};
  /* Honigtopf: das Feld sieht nur ein Roboter — dann tun wir so, als sei alles gut. */
  if (daten.website) return res.status(200).json({ ok: true });

  var zeilen = Array.isArray(b.zeilen) ? b.zeilen.slice(0, 80).map(function (z) { return String(z).slice(0, 600); }) : [];
  if (!zeilen.length) return res.status(400).json({ ok: false, grund: 'leer' });

  var schluessel = process.env.RESEND_API_KEY;
  if (!schluessel) return res.status(503).json({ ok: false, grund: 'kein-versand' });

  var an = process.env.ANFRAGE_AN || STANDARD_AN;
  var von = process.env.ANFRAGE_VON || STANDARD_VON;
  var art = b.art === 'ankauf' ? 'Ankaufanfrage' : b.art === 'suchauftrag' ? 'Suchauftrag' : 'Anfrage';
  var kundeMail = finde(daten, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  var name = '';
  Object.keys(daten).forEach(function (k) {
    if (/name/i.test(k) && typeof daten[k] === 'string' && daten[k].trim()) name = (name + ' ' + daten[k].trim()).trim();
  });
  var wann = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'medium', timeStyle: 'short' });
  var betreff = art + (name ? ' von ' + name : '') + ' — hahn-vo.de';

  var text = art + ' über hahn-vo.de, ' + wann + '\n\n' + zeilen.join('\n') +
    (kundeMail ? '\n\nAntworten an: ' + kundeMail : '') + '\n\nSeite: ' + (b.seite || 'hahn-vo.de');
  var html = '<div style="font-family:-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.55;color:#0E334F">' +
    '<p style="margin:0 0 14px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7b8a">' + esc(art) + ' über hahn-vo.de · ' + esc(wann) + '</p>' +
    '<table style="border-collapse:collapse">' +
    zeilen.map(function (z) {
      var i = z.indexOf(': ');
      var k = i > 0 ? z.slice(0, i) : '', v = i > 0 ? z.slice(i + 2) : z;
      return '<tr><td style="padding:5px 18px 5px 0;color:#6b7b8a;vertical-align:top;white-space:nowrap">' + esc(k) + '</td><td style="padding:5px 0">' + esc(v) + '</td></tr>';
    }).join('') +
    '</table>' +
    (kundeMail ? '<p style="margin:18px 0 0">Antworten an <a href="mailto:' + esc(kundeMail) + '">' + esc(kundeMail) + '</a> — oder einfach auf diese Mail antworten.</p>' : '') +
    '<p style="margin:18px 0 0;font-size:12px;color:#6b7b8a">Seite: ' + esc(b.seite || 'hahn-vo.de') + '</p></div>';

  var antwort;
  try {
    antwort = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + schluessel, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: von, to: [an], reply_to: kundeMail || undefined,
        subject: betreff, text: text, html: html,
      }),
    });
  } catch (e) {
    return res.status(502).json({ ok: false, grund: 'netz' });
  }
  if (!antwort.ok) {
    var fehler = '';
    try { fehler = (await antwort.text()).slice(0, 200); } catch (e) { /* egal */ }
    return res.status(502).json({ ok: false, grund: 'resend', status: antwort.status, fehler: fehler });
  }
  return res.status(200).json({ ok: true });
};
