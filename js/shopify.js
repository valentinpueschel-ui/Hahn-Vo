/* HAHN & VO — Shopify-Anbindung (Storefront-API).
   Der Warenkorb lebt komplett auf unserer Seite: wir sprechen die Cart-API
   direkt an und rendern alles selbst — kein Shopify-Widget, kein iframe.
   Nur die Zahlung läuft am Ende über Shopifys gesicherte Kasse (Shopify
   verbietet das Einbetten per x-frame-options: DENY).

   Uhren werden automatisch zugeordnet (Referenznummer oder Titel); neue
   Uhren brauchen keinen Code, nur einen Eintrag in Shopify. */
(function () {
  'use strict';
  var HV = (window.HV = window.HV || {});
  var API_VERSION = '2024-10';
  var CAT_KEY = 'hv_shopify_catalog_v3';
  var CART_KEY = 'hv_shopify_cart_id';
  var CAT_TTL = 10 * 60 * 1000;

  function cfg() { return window.SHOPIFY || null; }
  function norm(s) { return (s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }

  function gql(query, variables) {
    var c = cfg();
    if (!c || !window.fetch) return Promise.reject(new Error('kein Shopify'));
    return fetch('https://' + c.domain + '/api/' + API_VERSION + '/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': c.storefrontAccessToken,
      },
      body: JSON.stringify({ query: query, variables: variables || {} }),
    }).then(function (r) { return r.json(); });
  }

  /* ================= Katalog ================= */
  var CAT_QUERY =
    '{ products(first: 100) { edges { node { id title availableForSale ' +
    'featuredImage { url } ' +
    'variants(first: 1) { edges { node { id availableForSale quantityAvailable price { amount currencyCode } } } } } } } }';

  var catPending = null;
  HV.shopifyCatalog = function () {
    if (!cfg()) return Promise.resolve([]);
    try {
      var raw = JSON.parse(sessionStorage.getItem(CAT_KEY));
      if (raw && (Date.now() - raw.t) < CAT_TTL) return Promise.resolve(raw.items);
    } catch (e) {}
    if (catPending) return catPending;
    catPending = gql(CAT_QUERY).then(function (d) {
      var edges = (d && d.data && d.data.products && d.data.products.edges) || [];
      var items = edges.map(function (e) {
        var n = e.node;
        var v = n.variants && n.variants.edges[0] && n.variants.edges[0].node;
        return {
          id: n.id.split('/').pop(),
          variantId: v ? v.id : null,
          title: n.title,
          available: !!(v ? v.availableForSale : n.availableForSale),
          price: v && v.price ? Math.round(parseFloat(v.price.amount)) : null,
          image: n.featuredImage ? n.featuredImage.url : null,
        };
      });
      try { sessionStorage.setItem(CAT_KEY, JSON.stringify({ t: Date.now(), items: items })); } catch (e) {}
      return items;
    }).catch(function () { return []; });
    return catPending;
  };

  /* ================= Zuordnung Uhr ↔ Shopify =================
     Wird global gebildet, nicht je Uhr: exakte Titelgleichheit zuerst,
     danach Referenznummer, erst zuletzt Teiltreffer — und jedes
     Shopify-Produkt wird nur EINMAL vergeben. Sonst schnappt sich eine
     kurz benannte Uhr das Produkt einer laenger benannten. */
  function buildMatches(catalog) {
    var explicit = (cfg() && cfg().products) || {};
    var prods = window.PRODUCTS || [];
    var out = {}, used = {};

    /* 1. Ausdrueckliche Zuordnung aus data.js */
    prods.forEach(function (p) {
      var id = explicit[p.id];
      if (!id) return;
      catalog.forEach(function (it) {
        if (it.id === String(id)) { out[p.id] = it; used[it.id] = true; }
      });
    });

    /* 2. Exakte Titelgleichheit — erst Marke+Modell, dann nur Modell */
    [function (p) { return norm(p.brand + p.name); },
     function (p) { return norm(p.name); }].forEach(function (keyFn) {
      prods.forEach(function (p) {
        if (out[p.id]) return;
        var k = keyFn(p);
        if (k.length < 6) return;
        catalog.forEach(function (it) {
          if (out[p.id] || used[it.id]) return;
          if (norm(it.title) === k) { out[p.id] = it; used[it.id] = true; }
        });
      });
    });

    /* 3. Referenznummer taucht im Shopify-Titel auf */
    prods.forEach(function (p) {
      if (out[p.id]) return;
      var ref = norm(p.ref);
      if (ref.length < 4) return;
      catalog.forEach(function (it) {
        if (out[p.id] || used[it.id]) return;
        if (norm(it.title).indexOf(ref) !== -1) { out[p.id] = it; used[it.id] = true; }
      });
    });

    /* 4. Teiltreffer als letzte Instanz — es gewinnt der engste */
    prods.forEach(function (p) {
      if (out[p.id]) return;
      var full = norm(p.brand + p.name);
      if (full.length < 12) return;
      var best = null, bestDiff = Infinity;
      catalog.forEach(function (it) {
        if (used[it.id]) return;
        var t = norm(it.title);
        if (t.length < 12) return;
        if (t.indexOf(full) !== -1 || full.indexOf(t) !== -1) {
          var diff = Math.abs(t.length - full.length);
          if (diff < bestDiff) { bestDiff = diff; best = it; }
        }
      });
      if (best) { out[p.id] = best; used[best.id] = true; }
    });

    return out;
  }

  var matchCache = null, matchCacheFor = null;
  function matchMap(catalog) {
    if (matchCacheFor === catalog && matchCache) return matchCache;
    matchCache = buildMatches(catalog || []);
    matchCacheFor = catalog;
    return matchCache;
  }
  HV.shopifyMatch = function (p, catalog) {
    if (!cfg() || !p) return null;
    return matchMap(catalog || [])[p.id] || null;
  };

  /* Reichert window.PRODUCTS mit Live-Daten aus Shopify an.
     Danach gilt: p.shopifyVariantId gesetzt = Uhr ist online kaufbar. */
  var syncPending = null;
  HV.shopifySync = function () {
    if (syncPending) return syncPending;
    syncPending = HV.shopifyCatalog().then(function (catalog) {
      var linked = [];
      (window.PRODUCTS || []).forEach(function (p) {
        var hit = HV.shopifyMatch(p, catalog);
        if (!hit || !hit.variantId) return;
        p.shopifyId = hit.id;
        p.shopifyVariantId = hit.variantId;
        p.shopifyAvailable = hit.available;
        if (hit.price) p.price = hit.price; /* Kassenpreis gewinnt */
        if (!hit.available && p.status === 'available') p.status = 'sold';
        linked.push(p);
      });
      document.dispatchEvent(new CustomEvent('hv:shopify-sync', { detail: { linked: linked } }));
      return linked;
    });
    return syncPending;
  };

  /* ================= Warenkorb (Storefront Cart API) ================= */
  var CART_FIELDS =
    'id checkoutUrl totalQuantity ' +
    'cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } } ' +
    'lines(first: 50) { edges { node { id quantity ' +
    'merchandise { ... on ProductVariant { id product { id title } } } ' +
    'cost { totalAmount { amount } } } } }';

  function shape(cart) {
    if (!cart) return null;
    return {
      id: cart.id,
      checkoutUrl: cart.checkoutUrl,
      count: cart.totalQuantity,
      subtotal: cart.cost ? Math.round(parseFloat(cart.cost.subtotalAmount.amount)) : 0,
      lines: (cart.lines.edges || []).map(function (e) {
        var n = e.node;
        return {
          lineId: n.id,
          variantId: n.merchandise.id,
          productId: n.merchandise.product.id.split('/').pop(),
          title: n.merchandise.product.title,
          qty: n.quantity,
          total: Math.round(parseFloat(n.cost.totalAmount.amount)),
        };
      }),
    };
  }

  function saveId(id) { try { localStorage.setItem(CART_KEY, id); } catch (e) {} }
  function loadId() { try { return localStorage.getItem(CART_KEY); } catch (e) { return null; } }

  var cartState = null;

  var Cart = {
    state: function () { return cartState; },

    /* Bestehenden Warenkorb laden (oder null) */
    load: function () {
      var id = loadId();
      if (!id) return Promise.resolve(null);
      return gql('query($id: ID!) { cart(id: $id) { ' + CART_FIELDS + ' } }', { id: id })
        .then(function (d) {
          var c = d && d.data && d.data.cart;
          if (!c) { try { localStorage.removeItem(CART_KEY); } catch (e) {} return null; }
          cartState = shape(c);
          return cartState;
        }).catch(function () { return null; });
    },

    add: function (variantId, qty) {
      qty = qty || 1;
      var id = loadId();
      if (!id) {
        return gql('mutation($lines: [CartLineInput!]!) { cartCreate(input: {lines: $lines}) { cart { ' + CART_FIELDS + ' } userErrors { message } } }',
          { lines: [{ merchandiseId: variantId, quantity: qty }] })
          .then(function (d) {
            var c = d.data && d.data.cartCreate && d.data.cartCreate.cart;
            if (!c) throw new Error('cartCreate fehlgeschlagen');
            saveId(c.id); cartState = shape(c); return cartState;
          });
      }
      return gql('mutation($id: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $id, lines: $lines) { cart { ' + CART_FIELDS + ' } userErrors { message } } }',
        { id: id, lines: [{ merchandiseId: variantId, quantity: qty }] })
        .then(function (d) {
          var c = d.data && d.data.cartLinesAdd && d.data.cartLinesAdd.cart;
          if (!c) { try { localStorage.removeItem(CART_KEY); } catch (e) {} return Cart.add(variantId, qty); }
          cartState = shape(c); return cartState;
        });
    },

    removeLine: function (lineId) {
      var id = loadId();
      if (!id) return Promise.resolve(null);
      return gql('mutation($id: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $id, lineIds: $lineIds) { cart { ' + CART_FIELDS + ' } } }',
        { id: id, lineIds: [lineId] })
        .then(function (d) {
          var c = d.data && d.data.cartLinesRemove && d.data.cartLinesRemove.cart;
          cartState = shape(c); return cartState;
        });
    },

    /* Kundendaten an den Warenkorb hängen — die Kasse ist damit vorausgefüllt */
    setBuyer: function (buyer) {
      var id = loadId();
      if (!id) return Promise.resolve(null);
      var identity = {};
      if (buyer.email) identity.email = buyer.email;
      if (buyer.phone) identity.phone = buyer.phone;
      if (buyer.address) {
        identity.deliveryAddressPreferences = [{
          deliveryAddress: {
            firstName: buyer.address.firstName || '',
            lastName: buyer.address.lastName || '',
            address1: buyer.address.address1 || '',
            zip: buyer.address.zip || '',
            city: buyer.address.city || '',
            country: buyer.address.country || 'DE',
          },
        }];
      }
      return gql('mutation($id: ID!, $b: CartBuyerIdentityInput!) { cartBuyerIdentityUpdate(cartId: $id, buyerIdentity: $b) { cart { ' + CART_FIELDS + ' } userErrors { message } } }',
        { id: id, b: identity })
        .then(function (d) {
          var r = d.data && d.data.cartBuyerIdentityUpdate;
          var c = r && r.cart;
          if (c) cartState = shape(c);
          return cartState;
        }).catch(function () { return cartState; });
    },

    /* Übergabewunsch + Anmerkung als Bestellnotiz — steht später auf der Bestellung */
    setNote: function (note) {
      var id = loadId();
      if (!id || !note) return Promise.resolve(cartState);
      return gql('mutation($id: ID!, $note: String!) { cartNoteUpdate(cartId: $id, note: $note) { cart { ' + CART_FIELDS + ' } } }',
        { id: id, note: note })
        .then(function (d) {
          var c = d.data && d.data.cartNoteUpdate && d.data.cartNoteUpdate.cart;
          if (c) cartState = shape(c);
          return cartState;
        }).catch(function () { return cartState; });
    },

    clearLocal: function () { try { localStorage.removeItem(CART_KEY); } catch (e) {} cartState = null; },
  };

  HV.shopifyCart = Cart;
})();
