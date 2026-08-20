/* HAHN & VO — Shopify-Buy-Button-Integration (Testlauf).
   Rendert NUR den Kaufen-Button (kein Bild/Titel/Preis — die liefert unsere
   Produktseite) im Look des Design-Systems, plus Shopify-Cart mit deutschen
   Texten. Checkout läuft über den echten Shopify-Checkout. */
(function () {
  'use strict';
  var HV = (window.HV = window.HV || {});
  var SDK_URL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';

  var BTN_STYLES = {
    'width': '100%',
    'padding-top': '19px',
    'padding-bottom': '19px',
    'font-family': 'Inter, sans-serif',
    'font-size': '11.5px',
    'font-weight': '600',
    'letter-spacing': '0.15em',
    'text-transform': 'uppercase',
    'color': '#FFFAE7',
    'background-color': '#0E334F',
    'border-radius': '2px',
    ':hover': { 'background-color': '#081E30', 'color': '#FFFAE7' },
    ':focus': { 'background-color': '#081E30' },
  };

  function loadSdk(cb) {
    if (window.ShopifyBuy && window.ShopifyBuy.UI) { cb(); return; }
    var script = document.createElement('script');
    script.async = true;
    script.src = SDK_URL;
    script.onload = cb;
    document.head.appendChild(script);
  }

  /* Mountet den Buy-Button für eine Uhr in den gegebenen Container.
     Gibt true zurück, wenn für die Uhr eine Shopify-ID hinterlegt ist. */
  HV.mountShopifyBuy = function (productKey, node) {
    var cfg = window.SHOPIFY;
    if (!cfg || !cfg.products || !cfg.products[productKey] || !node) return false;

    loadSdk(function () {
      var client = ShopifyBuy.buildClient({
        domain: cfg.domain,
        storefrontAccessToken: cfg.storefrontAccessToken,
      });
      ShopifyBuy.UI.onReady(client).then(function (ui) {
        ui.createComponent('product', {
          id: cfg.products[productKey],
          node: node,
          moneyFormat: decodeURIComponent('%E2%82%AC%7B%7Bamount_with_comma_separator%7D%7D'),
          options: {
            product: {
              contents: { img: false, title: false, price: false, options: true, button: true },
              googleFonts: ['Inter'],
              styles: {
                product: { 'margin': '0', 'max-width': '100%', 'text-align': 'left' },
                button: BTN_STYLES,
                options: { 'margin-bottom': '10px' },
              },
              text: { button: 'In den Warenkorb', outOfStock: 'Verkauft', unavailable: 'Nicht verfügbar' },
            },
            cart: {
              googleFonts: ['Inter'],
              popup: false,
              styles: {
                button: BTN_STYLES,
                cart: { 'background-color': '#FFFAE7' },
                footer: { 'background-color': '#FFFAE7' },
              },
              text: {
                title: 'Warenkorb',
                total: 'Zwischensumme',
                empty: 'Ihr Warenkorb ist leer.',
                notice: 'Versand und Steuern werden an der Kasse berechnet.',
                button: 'Zur Kasse',
              },
            },
            toggle: {
              googleFonts: ['Inter'],
              styles: {
                toggle: {
                  'font-family': 'Inter, sans-serif',
                  'background-color': '#0E334F',
                  ':hover': { 'background-color': '#081E30' },
                  ':focus': { 'background-color': '#081E30' },
                },
                count: { 'color': '#FFFAE7', ':hover': { 'color': '#FFFAE7' } },
                iconPath: { 'fill': '#FFFAE7' },
              },
            },
            lineItem: {
              styles: {
                variantTitle: { 'color': '#0E334F' },
                title: { 'color': '#0E334F' },
                price: { 'color': '#0E334F' },
                fullPrice: { 'color': '#0E334F' },
                discount: { 'color': '#0E334F' },
                discountIcon: { 'fill': '#0E334F' },
                quantity: { 'color': '#0E334F' },
                quantityIncrement: { 'color': '#0E334F', 'border-color': '#0E334F' },
                quantityDecrement: { 'color': '#0E334F', 'border-color': '#0E334F' },
                quantityInput: { 'color': '#0E334F', 'border-color': '#0E334F' },
              },
            },
          },
        });
      });
    });
    return true;
  };
})();
