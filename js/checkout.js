/* HAHN & VO — multi-step checkout.
   Steps: 0 cart review · 1 customer data · 2 delivery · 3 payment · 4 review → confirm.
   Demo build: the order is persisted to localStorage, no live payment. */
(function () {
  'use strict';
  var HV = window.HV;
  var panel = document.getElementById('coPanel');
  var summary = document.getElementById('coSummary');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.co-step-tab'));

  var order = {
    kunde: {}, delivery: 'showroom', payment: 'ueberweisung', note: '',
  };
  var step = 0;

  /* Versandzonen — muss mit den Zonen in Shopify übereinstimmen:
     Deutschland kostenfrei · Europa 80 € · weltweit 150 € */
  /* Muss deckungsgleich mit der Shopify-Zone "Europa" bleiben (32 Laender). */
  var EUROPA = ['AT','BE','BG','CH','CY','CZ','DK','EE','ES','FI','FR','GB','GR','HR','HU','IE',
                'IS','IT','LI','LT','LU','LV','MC','MT','NL','NO','PL','PT','RO','SE','SI','SK'];
  var LAENDER = [
    ['DE','Deutschland'], ['AT','Österreich'], ['CH','Schweiz'], ['FR','Frankreich'], ['IT','Italien'],
    ['NL','Niederlande'], ['BE','Belgien'], ['LU','Luxemburg'], ['ES','Spanien'], ['PT','Portugal'],
    ['DK','Dänemark'], ['SE','Schweden'], ['NO','Norwegen'], ['FI','Finnland'], ['PL','Polen'],
    ['CZ','Tschechien'], ['HU','Ungarn'], ['GR','Griechenland'], ['IE','Irland'],
    ['GB','Vereinigtes Königreich'], ['US','USA'], ['CA','Kanada'], ['JP','Japan'],
    ['KR','Südkorea'], ['SG','Singapur'], ['AE','Vereinigte Arabische Emirate'],
    ['HK','Hongkong'], ['AU','Australien'], ['XX','Anderes Land']
  ];
  function landName(code) {
    for (var i = 0; i < LAENDER.length; i++) if (LAENDER[i][0] === code) return LAENDER[i][1];
    return 'Deutschland';
  }
  function versandkosten() {
    if (order.delivery === 'showroom') return 0;
    var c = order.kunde.land || 'DE';
    if (c === 'DE') return 0;
    return EUROPA.indexOf(c) !== -1 ? 80 : 150;
  }
  function versandLabel() {
    if (order.delivery === 'showroom') return 'entfällt (Abholung)';
    var vk = versandkosten();
    return vk === 0 ? 'kostenfrei' : HV.fmtEUR(vk);
  }

  function items() { return HV.cart.items(); }

  /* ---------- summary sidebar ---------- */
  function renderSummary() {
    var list = items();
    var deliveryLabel = order.delivery === 'showroom'
      ? 'Persönliche Übergabe im Showroom — kostenfrei'
      : 'Versicherter Werttransport — weltweit';
    var vk = versandkosten();
    var zeigen = step >= 2;
    summary.innerHTML =
      '<h3>Ihre Bestellung</h3>' +
      list.map(function (p) {
        return '<div class="co-sum-item">' +
          '<img src="' + p.images[0] + '" alt="">' +
          '<div><div class="b">' + p.brand + '</div><div class="n">' + p.name + '</div></div>' +
          '<span class="num" style="font-weight:620;font-size:13.5px">' + HV.fmtEUR(p.price) + '</span>' +
        '</div>';
      }).join('') +
      '<div class="co-sum-row"><span>Zwischensumme</span><span class="num">' + HV.fmtEUR(HV.cart.total()) + '</span></div>' +
      '<div class="co-sum-row"><span>' + (order.delivery === 'showroom' ? 'Übergabe' : 'Versand') + '</span>' +
        '<span class="num">' + (zeigen ? versandLabel() : '—') + '</span></div>' +
      '<div class="co-sum-total"><span>Gesamt</span><span class="num">' +
        HV.fmtEUR(HV.cart.total() + (zeigen ? vk : 0)) + '</span></div>' +
      '<p style="font-size:11.5px;color:var(--ink-60);line-height:1.55;margin-top:14px">Alle Preise sind Endpreise inkl. MwSt. Ein Teil unserer Uhren ist differenzbesteuert nach § 25a UStG — dort wird die Mehrwertsteuer auf der Rechnung nicht gesondert ausgewiesen. Die Angabe steht bei jeder Uhr im Datenblatt. Jede Uhr mit 12 Monaten Garantie und 14 Tagen Rückgaberecht.</p>';
  }

  /* ---------- step tabs ---------- */
  function syncTabs() {
    tabs.forEach(function (t, i) {
      t.classList.toggle('is-active', i === step);
      t.classList.toggle('is-done', i < step);
      t.querySelector('.dot').textContent = i < step ? '✓' : (i + 1);
    });
  }
  tabs.forEach(function (t, i) {
    t.style.cursor = 'pointer';
    t.addEventListener('click', function () { if (i < step) go(i); });
  });

  function esc(s) { return (s || '').replace(/</g, '&lt;'); }

  /* ---------- step renderers ---------- */
  function stepCart() {
    var list = items();
    if (!list.length) {
      panel.innerHTML =
        '<h2>Ihr Warenkorb ist leer.</h2>' +
        '<p style="color:var(--ink-60);margin-bottom:24px">Entdecken Sie unsere Kollektion — jede Uhr geprüft, garantiert und sofort verfügbar.</p>' +
        '<a class="btn btn-solid" href="/shop">Zum Shop <span class="arr">→</span></a>';
      return;
    }
    panel.innerHTML =
      '<h2>Warenkorb prüfen</h2>' +
      list.map(function (p) {
        return '<div class="co-sum-item" style="grid-template-columns:84px 1fr auto auto">' +
          '<img src="' + p.images[0] + '" alt="" style="width:84px;height:84px">' +
          '<div><div class="b">' + p.brand + '</div><div class="n">' + p.name + '</div>' +
          '<div style="font-size:11.5px;color:var(--ink-60);margin-top:3px">' + (p.ref ? 'Ref. ' + p.ref + ' · ' : '') + (p.fullset || '') + '</div></div>' +
          '<span class="num" style="font-weight:640">' + HV.fmtEUR(p.price) + '</span>' +
          '<button class="cd-remove" data-rm="' + p.id + '">Entfernen</button>' +
        '</div>';
      }).join('') +
      '<div class="co-actions"><a class="btn btn-outline" href="/shop">Weiter stöbern</a>' +
      '<button class="btn btn-solid" data-next>Weiter zu Ihren Daten <span class="arr">→</span></button></div>';
  }

  function stepData() {
    var k = order.kunde;
    panel.innerHTML =
      '<h2>Ihre Daten</h2>' +
      '<div class="form-grid">' +
        '<div class="field"><label>Vorname *</label><input id="fVor" value="' + esc(k.vor) + '" autocomplete="given-name"></div>' +
        '<div class="field"><label>Nachname *</label><input id="fNach" value="' + esc(k.nach) + '" autocomplete="family-name"></div>' +
        '<div class="field span2"><label>E-Mail *</label><input id="fMail" type="email" value="' + esc(k.mail) + '" autocomplete="email"></div>' +
        '<div class="field span2"><label>Telefon (für Übergabe-Abstimmung) *</label><input id="fTel" type="tel" value="' + esc(k.tel) + '" autocomplete="tel"></div>' +
        '<div class="field span2"><label>Straße &amp; Hausnummer *</label><input id="fStr" value="' + esc(k.str) + '" autocomplete="street-address"></div>' +
        '<div class="field"><label>PLZ *</label><input id="fPlz" value="' + esc(k.plz) + '" autocomplete="postal-code"></div>' +
        '<div class="field"><label>Ort *</label><input id="fOrt" value="' + esc(k.ort) + '" autocomplete="address-level2"></div>' +
        '<div class="field span2"><label>Land *</label><select id="fLand" autocomplete="country">' +
          LAENDER.map(function (l) {
            return '<option value="' + l[0] + '"' + ((k.land || 'DE') === l[0] ? ' selected' : '') + '>' + l[1] + '</option>';
          }).join('') +
        '</select></div>' +
      '</div>' +
      '<p class="wiz-error" id="dataErr">Bitte alle Pflichtfelder korrekt ausfüllen.</p>' +
      '<div class="co-actions"><button class="btn btn-outline" data-back>← Zurück</button>' +
      '<button class="btn btn-solid" data-next>Weiter zur Übergabe <span class="arr">→</span></button></div>';
  }

  function stepDelivery() {
    panel.innerHTML =
      '<h2>Wie möchten Sie Ihre Uhr erhalten?</h2>' +
      '<div class="chip-row">' +
        '<label class="chip"><input type="radio" name="dl" value="showroom"' + (order.delivery === 'showroom' ? ' checked' : '') + '>' +
          '<span class="chip-face"><span><span class="chip-title">Persönliche Übergabe im Showroom</span>' +
          '<div class="chip-sub">Garden Tower, 7. Etage, Frankfurt — mit Besichtigung, Anprobe und Zeit. Terminabstimmung nach der Bestellung. Kostenfrei.</div></span><span class="micro">Empfohlen</span></span></label>' +
        '<label class="chip"><input type="radio" name="dl" value="versand"' + (order.delivery === 'versand' ? ' checked' : '') + '>' +
          '<span class="chip-face"><span><span class="chip-title">Versicherter Werttransport</span>' +
          '<div class="chip-sub">Vollversichert, doppelt verpackt, mit Sendungsverfolgung. Deutschland kostenfrei · Europa 80 € · weltweit 150 €.</div></span></span></label>' +
      '</div>' +
      '<div class="co-actions"><button class="btn btn-outline" data-back>← Zurück</button>' +
      '<button class="btn btn-solid" data-next>Weiter zur Zahlung <span class="arr">→</span></button></div>';
  }

  function stepPayment() {
    if (HV.cart.hasShopify && HV.cart.hasShopify()) {
      order.payment = 'shopify';
      panel.innerHTML =
        '<h2>Zahlung</h2>' +
        /* Die Auswahl muss dem entsprechen, was im Shopify-Konto wirklich
           freigeschaltet ist — Stand 24.08.2026: Shopify Payments (Visa,
           Mastercard, Amex), Apple Pay, Google Pay, Shop Pay, PayPal,
           Banküberweisung. */
        '<p style="color:var(--ink-60);font-size:14.5px;line-height:1.7;max-width:58ch">Ihre Zahlung läuft über unsere verschlüsselte Kasse — abgesichert nach Bankenstandard. Sie wählen dort zwischen Kreditkarte, Apple&nbsp;Pay, Google&nbsp;Pay, PayPal und Banküberweisung. Ihre Daten sind bereits hinterlegt.</p>' +
        '<div class="pay-row">' +
          '<span class="pay-badge">Kreditkarte</span><span class="pay-badge">Apple&nbsp;Pay</span>' +
          '<span class="pay-badge">Google&nbsp;Pay</span><span class="pay-badge">PayPal</span>' +
          '<span class="pay-badge">Banküberweisung</span>' +
        '</div>' +
        '<div class="field" style="margin-top:22px"><label>Anmerkung zur Bestellung (optional)</label>' +
        '<textarea id="fNote" placeholder="z. B. Wunschtermin für die Übergabe …">' + esc(order.note) + '</textarea></div>' +
        '<div class="co-actions"><button class="btn btn-outline" data-back>← Zurück</button>' +
        '<button class="btn btn-solid" data-next>Bestellung prüfen <span class="arr">→</span></button></div>';
      return;
    }
    panel.innerHTML =
      '<h2>Wie möchten Sie zahlen?</h2>' +
      '<div class="chip-row">' +
        '<label class="chip"><input type="radio" name="pay" value="ueberweisung"' + (order.payment === 'ueberweisung' ? ' checked' : '') + '>' +
          '<span class="chip-face"><span><span class="chip-title">Banküberweisung</span>' +
          '<div class="chip-sub">Sie erhalten unsere Bankverbindung mit der Bestellbestätigung. Die Uhr bleibt bis Zahlungseingang fest für Sie reserviert.</div></span></span></label>' +
        (order.delivery === 'showroom'
          ? '<label class="chip"><input type="radio" name="pay" value="showroom"' + (order.payment === 'showroom' ? ' checked' : '') + '>' +
            '<span class="chip-face"><span><span class="chip-title">Zahlung bei Übergabe im Showroom</span>' +
            '<div class="chip-sub">EC-/Kreditkarte oder Überweisung vor Ort — nach Besichtigung der Uhr.</div></span></span></label>'
          : '') +
      '</div>' +
      '<div class="field" style="margin-top:18px"><label>Anmerkung zur Bestellung (optional)</label>' +
      '<textarea id="fNote" placeholder="z. B. Wunschtermin für die Übergabe …">' + esc(order.note) + '</textarea></div>' +
      '<div class="co-actions"><button class="btn btn-outline" data-back>← Zurück</button>' +
      '<button class="btn btn-solid" data-next>Bestellung prüfen <span class="arr">→</span></button></div>';
  }

  function stepReview() {
    var k = order.kunde;
    var payLabel = { ueberweisung: 'Banküberweisung', showroom: 'Zahlung bei Übergabe im Showroom', shopify: 'Verschlüsselte Kasse — Karte, Apple Pay, PayPal, Sofortüberweisung' }[order.payment];
    var dlLabel = order.delivery === 'showroom' ? 'Persönliche Übergabe im Showroom' : 'Versicherter Werttransport';
    panel.innerHTML =
      '<h2>Bestellung prüfen</h2>' +
      '<dl class="spec-table" style="margin-bottom:8px">' +
        '<div class="row"><dt>Besteller</dt><dd>' + esc(k.vor) + ' ' + esc(k.nach) + '<br>' + esc(k.str) + ', ' + esc(k.plz) + ' ' + esc(k.ort) + '<br>' + landName(k.land) + '<br>' + esc(k.mail) + ' · ' + esc(k.tel) + '</dd></div>' +
        '<div class="row"><dt>Übergabe</dt><dd>' + dlLabel + '</dd></div>' +
        '<div class="row"><dt>Versand</dt><dd>' + versandLabel() + '</dd></div>' +
        '<div class="row"><dt>Zahlung</dt><dd>' + payLabel + '</dd></div>' +
        (order.note ? '<div class="row"><dt>Anmerkung</dt><dd>' + esc(order.note) + '</dd></div>' : '') +
      '</dl>' +
      '<label class="filter-opt" style="margin:14px 0 4px;padding-left:0"><input type="checkbox" id="fAgb"> <span style="font-size:13px">Ich habe die <a href="/agb" target="_blank" style="text-decoration:underline">AGB</a> und die <a href="/widerruf" target="_blank" style="text-decoration:underline">Widerrufsbelehrung</a> zur Kenntnis genommen. *</span></label>' +
      '<p class="wiz-error" id="agbErr">Bitte bestätigen Sie AGB und Widerrufsbelehrung.</p>' +
      '<div class="co-actions"><button class="btn btn-outline" data-back>← Zurück</button>' +
      '<button class="btn btn-solid" data-confirm>Zahlungspflichtig bestellen</button></div>';
  }

  function stepConfirm(orderNum) {
    var confirmedCount = items().length;
    document.getElementById('coSteps').style.display = 'none';
    summary.style.display = 'none';
    document.getElementById('coLayout').style.gridTemplateColumns = '1fr';
    panel.innerHTML =
      '<div class="co-confirm">' +
        '<span class="ok-mark">✓</span>' +
        '<span class="co-ordernum num">Bestellung ' + orderNum + '</span>' +
        '<h2 class="display-m" style="max-width:24ch">Vielen Dank — Ihre Bestellung ist verbindlich eingegangen.</h2>' +
        '<p style="color:var(--ink-60);max-width:56ch;line-height:1.7">' +
        (confirmedCount > 1 ? 'Wir haben alle ' + confirmedCount + ' Uhren' : 'Wir haben die Uhr') +
        ' fest für Sie zurückgelegt. Sie erhalten in Kürze eine Bestellbestätigung per E-Mail' +
        (order.payment === 'showroom' ? '. Wir melden uns noch heute zur Terminabstimmung; gezahlt wird bei der Übergabe im Showroom.' :
         ' — inklusive unserer Bankverbindung. Nach Zahlungseingang stimmen wir umgehend die Übergabe mit Ihnen ab.') + '</p>' +
        '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">' +
          '<a class="btn btn-solid" href="/shop">Weiter stöbern</a>' +
          '<a class="btn btn-outline" href="' + window.SITE.whatsapp + '" target="_blank" rel="noopener">Fragen? WhatsApp</a>' +
        '</div>' +
      '</div>';
    HV.cart.clear();
  }

  /* ---------- flow ---------- */
  var renderers = [stepCart, stepData, stepDelivery, stepPayment, stepReview];
  function go(i) {
    step = i;
    renderers[i]();
    syncTabs();
    renderSummary();
    if (window.gsap) gsap.fromTo(panel, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function collectStep() {
    if (step === 1) {
      order.kunde = {
        vor: val('fVor'), nach: val('fNach'), mail: val('fMail'), tel: val('fTel'),
        str: val('fStr'), plz: val('fPlz'), ort: val('fOrt'), land: val('fLand') || 'DE',
      };
      var k = order.kunde;
      var ok = k.vor && k.nach && /.+@.+\..+/.test(k.mail) && k.tel && k.str && k.plz && k.ort;
      if (!ok) { document.getElementById('dataErr').classList.add('is-visible'); return false; }
    }
    if (step === 2) {
      var dl = panel.querySelector('input[name=dl]:checked');
      if (dl) order.delivery = dl.value;
    }
    if (step === 3) {
      var pay = panel.querySelector('input[name=pay]:checked');
      if (pay) order.payment = pay.value;
      order.note = val('fNote');
    }
    return true;
  }
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }

  panel.addEventListener('click', function (e) {
    if (e.target.closest('[data-rm]')) {
      HV.cart.remove(e.target.closest('[data-rm]').dataset.rm);
      go(0);
      return;
    }
    if (e.target.closest('[data-next]')) {
      if (!items().length) { go(0); return; }
      if (collectStep()) go(step + 1);
    }
    if (e.target.closest('[data-back]')) go(step - 1);
    if (e.target.closest('[data-confirm]')) {
      if (!document.getElementById('fAgb').checked) {
        document.getElementById('agbErr').classList.add('is-visible');
        return;
      }
      if (HV.cart.hasShopify && HV.cart.hasShopify()) { handoff(); return; }
      var num = 'HV-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000));
      try {
        var log = JSON.parse(localStorage.getItem('hv_orders') || '[]');
        log.push({ num: num, at: new Date().toISOString(), order: order, items: items().map(function (p) { return p.id; }), total: HV.cart.total() });
        localStorage.setItem('hv_orders', JSON.stringify(log));
      } catch (err) { /* private mode */ }
      stepConfirm(num);
    }
  });

  /* ---------- Übergabe an die gesicherte Kasse ---------- */
  function handoff() {
    var k = order.kunde;
    var ov = document.createElement('div');
    ov.className = 'co-handoff';
    ov.innerHTML =
      '<div class="ho-inner">' +
        '<div class="ho-mark">' + (HV.MARK || '') + '</div>' +
        '<span class="micro" style="opacity:.7">Gesicherte Zahlung</span>' +
        '<h2 class="display-m">Einen Moment —<br>wir übergeben an die verschlüsselte Kasse.</h2>' +
        '<p class="ho-sub">Ihre Angaben sind bereits hinterlegt. Sie schließen die Zahlung im nächsten Schritt ab.</p>' +
        '<div class="ho-bar"><i></i></div>' +
      '</div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add('is-on'); });

    var note = 'Übergabe: ' +
      (order.delivery === 'showroom' ? 'Persönlich im Showroom (Garden Tower, 7. Etage)' : 'Versicherter Werttransport') +
      (order.note ? ' — Anmerkung: ' + order.note : '');

    var started = Date.now();
    HV.shopifyCart.setBuyer({
      email: k.mail, phone: k.tel,
      address: { firstName: k.vor, lastName: k.nach, address1: k.str, zip: k.plz, city: k.ort, country: 'DE' },
    })
      .then(function () { return HV.shopifyCart.setNote(note); })
      .then(function (state) {
        var s2 = state || HV.shopifyCart.state();
        var url = s2 && s2.checkoutUrl;
        var wait = Math.max(0, 1100 - (Date.now() - started));
        setTimeout(function () {
          if (url) { location.href = url; return; }
          ov.querySelector('.ho-sub').textContent = 'Die Kasse ist gerade nicht erreichbar. Bitte versuchen Sie es erneut oder schreiben Sie uns per WhatsApp.';
          ov.querySelector('.ho-bar').style.display = 'none';
        }, wait);
      });
  }

  document.addEventListener('hv:cart', function () { if (step === 0) { renderSummary(); } });

  go(0);
})();
