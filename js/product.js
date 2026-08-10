/* HAHN & VO — product detail page. Reads ?id= and renders from data.js. */
(function () {
  'use strict';
  var HV = window.HV;
  var id = new URLSearchParams(location.search).get('id');
  var p = HV.byId(id) || (window.PRODUCTS || [])[0];
  if (!p) { location.replace('shop.html'); return; }

  document.title = p.brand + ' ' + p.name + ' — Hahn & Vo';
  document.getElementById('crumbName').textContent = p.name;
  document.getElementById('pdBrand').textContent = p.brand;
  document.getElementById('pdName').textContent = p.name;
  document.getElementById('pdPrice').textContent = HV.fmtEUR(p.price);
  if (p.listPrice) {
    var lp = document.getElementById('pdList');
    lp.hidden = false;
    lp.textContent = 'Listenpreis neu: ' + HV.fmtEUR(p.listPrice);
  }

  /* status */
  var st = document.getElementById('pdStatus');
  st.classList.add('status-' + p.status);
  st.textContent = HV.statusLabel[p.status];

  /* gallery */
  var main = document.getElementById('mainImg');
  var mainWrap = document.getElementById('galleryMain');
  var thumbs = document.getElementById('thumbs');
  var current = 0;
  function show(i) {
    current = i;
    main.src = p.images[i];
    main.alt = p.brand + ' ' + p.name + ' — Bild ' + (i + 1);
    thumbs.querySelectorAll('button').forEach(function (b, bi) {
      b.classList.toggle('is-active', bi === i);
    });
  }
  thumbs.innerHTML = p.images.map(function (src, i) {
    return '<button aria-label="Bild ' + (i + 1) + '"><img src="' + src + '" alt="" loading="lazy"></button>';
  }).join('');
  thumbs.querySelectorAll('button').forEach(function (b, i) {
    b.addEventListener('click', function () { show(i); });
  });
  show(0);

  /* zoom: click toggles, cursor position steers transform-origin */
  mainWrap.addEventListener('click', function () {
    mainWrap.classList.toggle('is-zoom');
  });
  mainWrap.addEventListener('mousemove', function (e) {
    if (!mainWrap.classList.contains('is-zoom')) return;
    var r = mainWrap.getBoundingClientRect();
    main.style.transformOrigin =
      ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%';
  });

  /* keyboard gallery nav */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') show((current + 1) % p.images.length);
    if (e.key === 'ArrowLeft') show((current - 1 + p.images.length) % p.images.length);
  });

  /* CTAs by status */
  var add = document.getElementById('addToCart');
  function syncCartBtn() {
    if (HV.cart.has(p.id)) {
      add.innerHTML = 'Im Warenkorb ✓ &nbsp;·&nbsp; Zur Kasse <span class="arr">→</span>';
      add.dataset.mode = 'checkout';
    } else {
      add.innerHTML = 'In den Warenkorb <span class="arr">→</span>';
      add.dataset.mode = 'add';
    }
  }
  if (p.status === 'available') {
    syncCartBtn();
    add.addEventListener('click', function () {
      if (add.dataset.mode === 'checkout') { location.href = 'checkout.html'; return; }
      HV.cart.add(p.id);
      syncCartBtn();
    });
    document.addEventListener('hv:cart', syncCartBtn);
  } else {
    add.disabled = true;
    add.textContent = p.status === 'reserved' ? 'Reserviert' : 'Verkauft';
    document.getElementById(p.status === 'reserved' ? 'pdReservedNote' : 'pdSoldNote').hidden = false;
    if (p.status === 'sold') {
      var sc = document.querySelector('.pd-secondary-ctas');
      sc.innerHTML = '<a class="btn btn-outline" href="suchauftrag.html">Suchauftrag stellen</a>' +
        '<a class="btn btn-outline" id="pdWhatsapp2" href="' + window.SITE.whatsapp + '" target="_blank" rel="noopener">Per WhatsApp anfragen</a>';
    }
  }
  var wa = document.getElementById('pdWhatsapp');
  if (wa) {
    wa.href = window.SITE.whatsapp + '?text=' + encodeURIComponent(
      'Guten Tag, ich interessiere mich für die ' + p.brand + ' ' + p.name +
      (p.ref ? ' (Ref. ' + p.ref + ')' : '') + ' — ' + HV.fmtEUR(p.price));
  }

  /* spec table */
  var specs = [
    ['Marke', p.brand],
    ['Modell', p.name],
    ['Referenz', p.ref],
    ['Baujahr', p.year],
    ['Durchmesser', p.size],
    ['Gehäuse', p.material],
    ['Zifferblatt', p.dial],
    ['Band', p.strap],
    ['Werk', p.movement],
    ['Lieferumfang', p.fullset],
    ['Zustand', p.rating ? p.rating : null],
    ['Status', HV.statusLabel[p.status]],
  ].filter(function (row) { return row[1]; });
  document.getElementById('specTable').innerHTML = specs.map(function (row) {
    return '<div class="row"><dt>' + row[0] + '</dt><dd>' + row[1] + '</dd></div>';
  }).join('');

  /* description */
  if (p.desc) {
    document.getElementById('pdDesc').innerHTML = '<h3>Beschreibung</h3><p>' + p.desc + '</p>';
  }

  /* related: same brand first, then price neighbours */
  var related = (window.PRODUCTS || [])
    .filter(function (x) { return x.id !== p.id; })
    .sort(function (a, b) {
      var ab = (a.brand === p.brand ? 0 : 1) - (b.brand === p.brand ? 0 : 1);
      if (ab !== 0) return ab;
      return Math.abs(a.price - p.price) - Math.abs(b.price - p.price);
    })
    .slice(0, 4);
  document.getElementById('relatedGrid').innerHTML = related.map(HV.renderCard).join('');
})();
