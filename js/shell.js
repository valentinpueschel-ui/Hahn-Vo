/* HAHN & VO — shared shell: header, mobile menu, footer, cart drawer.
   Injected on every page so markup stays in one place. */
(function () {
  'use strict';

  window.HV = window.HV || {};

  var MARK =
    '<svg class="brand-mark" viewBox="755.6 330.9 408.7 406.6" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M 955.960938 348.515625 L 955.960938 719.96875 C 955.960938 728.671875 948.871094 735.542969 940.386719 735.542969 C 939.839844 735.542969 939.308594 735.523438 938.757812 735.46875 C 916.734375 733.179688 895.757812 727.351562 876.410156 718.578125 C 868.203125 714.855469 862.871094 706.742188 862.871094 697.726562 L 862.871094 580.089844 C 862.871094 577.855469 861.058594 576.042969 858.824219 576.042969 C 856.589844 576.042969 854.773438 577.855469 854.773438 580.089844 L 854.773438 686.09375 C 854.773438 692.652344 849.351562 697.269531 843.617188 697.269531 C 841.382812 697.269531 839.109375 696.574219 837.078125 695.015625 C 788.800781 658.027344 757.640625 599.765625 757.640625 534.269531 C 757.640625 468.71875 788.800781 410.476562 837.078125 373.46875 C 839.109375 371.929688 841.382812 371.234375 843.617188 371.234375 C 849.351562 371.234375 854.773438 375.832031 854.773438 382.390625 L 854.773438 488.394531 C 854.773438 490.632812 856.589844 492.445312 858.824219 492.445312 C 861.058594 492.445312 862.871094 490.632812 862.871094 488.394531 L 862.871094 370.757812 C 862.871094 361.746094 868.203125 353.628906 876.410156 349.910156 C 895.757812 341.132812 916.734375 335.308594 938.757812 333.035156 C 939.308594 332.980469 939.839844 332.945312 940.386719 332.945312 C 948.871094 332.945312 955.960938 339.832031 955.960938 348.515625"/>' +
    '<path fill="currentColor" d="M 1162.359375 534.269531 C 1162.359375 638.882812 1082.976562 724.914062 981.1875 735.449219 C 980.636719 735.503906 980.105469 735.542969 979.574219 735.542969 C 971.109375 735.542969 964.058594 728.636719 964.058594 719.96875 L 964.058594 348.515625 C 964.058594 339.832031 971.128906 332.945312 979.628906 332.945312 C 980.160156 332.945312 980.691406 332.980469 981.242188 333.035156 C 1003.265625 335.308594 1024.242188 341.132812 1043.589844 349.910156 C 1051.796875 353.628906 1057.128906 361.746094 1057.128906 370.757812 L 1057.128906 606.179688 C 1057.128906 608.414062 1058.941406 610.230469 1061.175781 610.230469 C 1063.410156 610.230469 1065.226562 608.414062 1065.226562 606.179688 L 1065.226562 382.390625 C 1065.226562 375.835938 1070.648438 371.234375 1076.382812 371.234375 C 1078.617188 371.234375 1080.90625 371.929688 1082.921875 373.46875 C 1131.199219 410.476562 1162.359375 468.71875 1162.359375 534.269531"/>' +
    '</svg>';
  window.HV.MARK = MARK;

  var page = document.body.dataset.page || '';
  var headerDark = document.body.dataset.header === 'dark';

  var NAV_LEFT = [
    ['/', 'home', 'Home'],
    ['/shop', 'shop', 'Shop'],
    ['/ankauf', 'ankauf', 'Ankauf'],
    ['/suchauftrag', 'suchauftrag', 'Suchauftrag'],
  ];
  var NAV_RIGHT = [
    ['/referenz-checker', 'referenz-checker', 'Referenz-Checker'],
    ['/ueber-uns', 'ueber-uns', 'Über uns'],
  ];

  function navLinks(list) {
    return list.map(function (l) {
      var active = page === l[1] ? ' is-active' : '';
      return '<a class="nav-link' + active + '" href="' + l[0] + '">' + l[2] + '</a>';
    }).join('');
  }

  /* ---------- header ---------- */
  var header = document.createElement('header');
  header.className = 'site-header' + (headerDark ? ' header-dark' : '');
  header.innerHTML =
    '<div class="wrap">' +
      '<nav class="nav-left" aria-label="Hauptnavigation">' + navLinks(NAV_LEFT) + '</nav>' +
      '<a class="brand" href="/" aria-label="Hahn &amp; Vo — Startseite">' + MARK +
        '<span class="brand-word">Hahn &amp; Vo</span>' +
      '</a>' +
      '<div class="nav-right">' + navLinks(NAV_RIGHT) +
        '<button class="nav-link cart-btn" data-cart-open aria-label="Warenkorb öffnen">Warenkorb <span class="cart-count" data-cart-count>0</span></button>' +
        '<button class="burger" data-burger aria-label="Menü" aria-expanded="false"><span></span><span></span><span></span></button>' +
      '</div>' +
    '</div>';
  document.body.prepend(header);

  /* mobile menu — sibling of the header (never a child: backdrop/filter would trap it) */
  var mm = document.createElement('nav');
  mm.className = 'mobile-menu';
  mm.setAttribute('aria-label', 'Mobiles Menü');
  mm.innerHTML =
    NAV_LEFT.concat(NAV_RIGHT).map(function (l) {
      return '<a href="' + l[0] + '">' + l[2] + '</a>';
    }).join('') +
    '<div class="mm-meta micro"><a href="https://www.instagram.com/hahn.vo/" target="_blank" rel="noopener">Instagram</a><a href="mailto:info@hahntime.com">E-Mail</a></div>';
  header.after(mm);

  var burger = header.querySelector('[data-burger]');
  burger.addEventListener('click', function () {
    var open = mm.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    document.documentElement.classList.toggle('menu-lock', open);
  });
  mm.addEventListener('click', function (e) { if (e.target.tagName === 'A') { mm.classList.remove('is-open'); burger.classList.remove('is-open'); } });

  /* solid on scroll + hide on scroll down */
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-solid', y > 40);
    if (y > 300 && y > lastY + 4 && !mm.classList.contains('is-open')) header.classList.add('is-hidden');
    else if (y < lastY - 4 || y < 300) header.classList.remove('is-hidden');
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- footer ---------- */
  var footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML =
    '<div class="wrap">' +
      '<div class="sf-grid">' +
        '<div class="sf-col">' +
          '<div class="sf-brandline">' + MARK + '<div><div class="brand-word">Hahn &amp; Vo</div><div class="micro" style="opacity:.6;margin-top:4px">Luxury Watches</div></div></div>' +
          '<p class="sf-tag">Kuratierte Luxusuhren — auf Echtheit geprüft, mit Garantie. Showroom im Garden Tower, Frankfurt am Main.</p>' +
        '</div>' +
        '<div class="sf-col"><h3>Navigation</h3>' +
          '<a href="/shop">Shop</a><a href="/ankauf">Ankauf &amp; Inzahlungnahme</a><a href="/suchauftrag">Suchauftrag</a><a href="/ueber-uns">Über uns</a>' +
        '</div>' +
        '<div class="sf-col"><h3>Service</h3>' +
          '<a href="/referenz-checker">Referenz-Checker</a><a href="/#faq">Fragen &amp; Antworten</a><a href="/ueber-uns#showroom">Showroom &amp; Termine</a><a href="mailto:info@hahntime.com">info@hahntime.com</a><a href="https://www.instagram.com/hahn.vo/" target="_blank" rel="noopener">Instagram</a>' +
        '</div>' +
        '<div class="sf-col"><h3>Showroom</h3>' +
          '<p>Garden Tower · 7. Etage<br>Neue Mainzer Str. 46–50<br>60311 Frankfurt am Main</p>' +
          '<p style="opacity:.66;font-size:12.5px;margin-top:10px">Besuche nach Terminvereinbarung</p>' +
        '</div>' +
      '</div>' +
      '<div class="sf-legal">' +
        '<span>© 2026 Hahn &amp; Vo OHG · Alle Preise sind Endpreise inkl. MwSt.</span>' +
        '<div class="links"><a href="/impressum">Impressum</a><a href="/datenschutz">Datenschutz</a><a href="/agb">AGB</a><a href="/widerruf">Widerruf</a></div>' +
      '</div>' +
    '</div>' +
    '<div class="sf-watermark" aria-hidden="true">Hahn &amp; Vo</div>';
  document.body.append(footer);
})();
