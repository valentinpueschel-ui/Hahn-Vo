/* HAHN & VO — cart: localStorage state + slide-in drawer.
   Watches are unique pieces, so quantity is always 1 per reference. */
(function () {
  'use strict';

  var KEY = 'hv_cart_v1';
  var HV = (window.HV = window.HV || {});

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function write(ids) {
    localStorage.setItem(KEY, JSON.stringify(ids));
    render();
  }
  function items() {
    var byId = {};
    (window.PRODUCTS || []).forEach(function (p) { byId[p.id] = p; });
    return read().map(function (id) { return byId[id]; }).filter(Boolean)
      .filter(function (p) { return p.status !== 'sold'; });
  }
  function total() {
    return items().reduce(function (s, p) { return s + (p.price || 0); }, 0);
  }

  HV.fmtEUR = function (n) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  };
  /* Uhren, die in Shopify liegen, werden im echten Shopify-Warenkorb
     gespiegelt. reconcile() gleicht beide Seiten selbstheilend ab. */
  function shopifyItems() {
    return items().filter(function (p) { return p.shopifyVariantId; });
  }
  function hasShopify() { return shopifyItems().length > 0; }

  function reconcile() {
    if (!HV.shopifyCart || !window.SHOPIFY) return Promise.resolve(null);
    var wanted = shopifyItems();
    var ready = HV.shopifyCart.state() ? Promise.resolve(HV.shopifyCart.state()) : HV.shopifyCart.load();
    return ready.then(function (state) {
      var have = (state && state.lines) || [];
      var ops = [];
      wanted.forEach(function (p) {
        var there = have.some(function (l) { return l.variantId === p.shopifyVariantId; });
        if (!there) ops.push(function () { return HV.shopifyCart.add(p.shopifyVariantId); });
      });
      have.forEach(function (l) {
        var keep = wanted.some(function (p) { return p.shopifyVariantId === l.variantId; });
        if (!keep) ops.push(function () { return HV.shopifyCart.removeLine(l.lineId); });
      });
      return ops.reduce(function (chain, op) { return chain.then(op); }, Promise.resolve())
        .catch(function () { return null; });
    });
  }
  HV.cart = {
    ids: read,
    items: items,
    total: total,
    hasShopify: hasShopify,
    reconcile: reconcile,
    has: function (id) { return read().indexOf(id) !== -1; },
    add: function (id) {
      var ids = read();
      if (ids.indexOf(id) === -1) { ids.push(id); write(ids); }
      openDrawer();
      reconcile();
    },
    remove: function (id) {
      write(read().filter(function (x) { return x !== id; }));
      reconcile();
    },
    clear: function () { write([]); reconcile(); },
  };

  /* ---------- drawer markup ---------- */
  var overlay = document.createElement('div');
  overlay.className = 'cart-overlay';
  var drawer = document.createElement('aside');
  drawer.className = 'cart-drawer';
  drawer.setAttribute('aria-label', 'Warenkorb');
  drawer.innerHTML =
    '<div class="cd-head">' +
      '<span class="micro">Warenkorb (<span data-cd-count>0</span>)</span>' +
      '<button class="micro" data-cart-close aria-label="Warenkorb schließen">Schließen ✕</button>' +
    '</div>' +
    '<div class="cd-items" data-cd-items></div>' +
    '<div class="cd-empty" data-cd-empty hidden>' +
      '<p>Ihr Warenkorb ist leer.</p>' +
      '<a class="btn btn-solid" href="shop.html">Kollektion entdecken</a>' +
    '</div>' +
    '<div class="cd-foot" data-cd-foot>' +
      '<div class="cd-total-row"><span class="micro micro-dim">Zwischensumme</span><span class="cd-total num" data-cd-total></span></div>' +
      '<p class="cd-note">Alle Preise sind Endpreise, differenzbesteuert nach § 25a UStG — die Mehrwertsteuer wird nicht gesondert ausgewiesen. Versicherter Versand oder persönliche Übergabe im Showroom — Abstimmung im nächsten Schritt.</p>' +
      '<a class="btn btn-solid" href="checkout.html">Zur Kasse <span class="arr">→</span></a>' +
    '</div>';
  document.body.append(overlay, drawer);

  function openDrawer() {
    overlay.classList.add('is-open');
    drawer.classList.add('is-open');
  }
  function closeDrawer() {
    overlay.classList.remove('is-open');
    drawer.classList.remove('is-open');
  }
  HV.cart.open = openDrawer;

  overlay.addEventListener('click', closeDrawer);
  drawer.addEventListener('click', function (e) {
    if (e.target.closest('[data-cart-close]')) closeDrawer();
    var rm = e.target.closest('[data-cd-remove]');
    if (rm) HV.cart.remove(rm.dataset.cdRemove);
  });
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cart-open]')) { e.preventDefault(); openDrawer(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

  /* ---------- render ---------- */
  function render() {
    var list = items();
    var box = drawer.querySelector('[data-cd-items]');
    var empty = drawer.querySelector('[data-cd-empty]');
    var foot = drawer.querySelector('[data-cd-foot]');
    drawer.querySelector('[data-cd-count]').textContent = list.length;
    drawer.querySelector('[data-cd-total]').textContent = HV.fmtEUR(total());

    box.innerHTML = list.map(function (p) {
      return '<div class="cd-item">' +
        '<a class="cd-item-img" href="produkt.html?id=' + p.id + '"><img src="' + p.images[0] + '" alt="' + p.name + '" loading="lazy"></a>' +
        '<div>' +
          '<div class="cd-item-brand">' + p.brand + '</div>' +
          '<a class="cd-item-name" href="produkt.html?id=' + p.id + '">' + p.name + '</a>' +
          '<div class="cd-item-price num">' + HV.fmtEUR(p.price) +
            (p.shopifyVariantId ? '<span class="cd-live">sofort kaufbar</span>' : '') + '</div>' +
        '</div>' +
        '<button class="cd-remove" data-cd-remove="' + p.id + '">Entfernen</button>' +
      '</div>';
    }).join('');

    empty.hidden = list.length !== 0;
    foot.style.display = list.length ? '' : 'none';

    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = list.length;
      el.style.transform = 'scale(1.25)';
      setTimeout(function () { el.style.transform = ''; }, 200);
    });
    document.dispatchEvent(new CustomEvent('hv:cart', { detail: { items: list } }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();

  /* Live-Preise und Verfügbarkeit aus Shopify nachziehen */
  if (HV.shopifySync) {
    HV.shopifySync().then(function () { render(); return HV.cart.reconcile(); });
  }
})();
