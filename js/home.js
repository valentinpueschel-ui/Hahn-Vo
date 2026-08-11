/* HAHN & VO — home page logic: preloader, hero logo, section content. */
(function () {
  'use strict';
  var HV = window.HV;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- hero mark + preloader ---------- */
  var pre = document.querySelector('.preloader');
  var heroMark = document.getElementById('heroMark');
  pre.querySelector('.pre-mark').innerHTML = HV.MARK.replace('class="brand-mark"', '');
  heroMark.innerHTML = HV.MARK.replace('class="brand-mark"', '');

  /* minute track: 60 ticks around the mark, quarters accented */
  var SVGNS = 'http://www.w3.org/2000/svg';
  var preRing = document.getElementById('preRing');
  var preTicks = [];
  for (var ti = 0; ti < 60; ti++) {
    var quarter = ti % 15 === 0;
    var ang = ti * 6 * Math.PI / 180;
    var r1 = quarter ? 85 : 90;
    var tickEl = document.createElementNS(SVGNS, 'line');
    tickEl.setAttribute('x1', 100 + r1 * Math.sin(ang));
    tickEl.setAttribute('y1', 100 - r1 * Math.cos(ang));
    tickEl.setAttribute('x2', 100 + 96 * Math.sin(ang));
    tickEl.setAttribute('y2', 100 - 96 * Math.cos(ang));
    tickEl.setAttribute('stroke-width', quarter ? 2.2 : 1);
    tickEl.setAttribute('class', 'pre-tick');
    tickEl.dataset.op = quarter ? 0.75 : 0.3;
    preRing.appendChild(tickEl);
    preTicks.push(tickEl);
  }
  var preHand = document.getElementById('preHand');

  /* slot-machine letter roll for the hero title (NAU-style odometer) */
  var titleSpan = document.querySelector('.hero-title .reveal-line > span') ||
                  document.querySelector('.hero-title span span') ||
                  document.querySelector('.hero-title');
  function buildRoll(el) {
    var text = el.textContent;
    el.textContent = '';
    el.classList.add('roll');
    var letters = [];
    Array.prototype.forEach.call(text, function (ch) {
      var cell = document.createElement('span');
      cell.className = 'rl';
      if (ch.trim() === '' || ch === ' ') {
        cell.innerHTML = '<i>&nbsp;</i>';
        cell.style.width = '0.22em';
      } else {
        cell.innerHTML = '<i>' + ch + '</i><i>' + ch + '</i>';
        letters.push(cell);
      }
      el.appendChild(cell);
    });
    return letters;
  }
  function rollOnce(letters, dur) {
    var tl = gsap.timeline();
    letters.forEach(function (cell, idx) {
      var a = cell.children[0], b = cell.children[1];
      tl.fromTo([a, b],
        { yPercent: 0 },
        { yPercent: 115, duration: dur || 0.9, ease: 'power3.inOut',
          onComplete: function () { gsap.set([a, b], { yPercent: 0 }); } },
        idx * 0.07);
    });
    return tl;
  }

  var heroLetters = [];
  if (titleSpan && !reduce) {
    // strip the default reveal-line handling: the roll replaces it
    var mask = titleSpan.parentElement;
    if (mask && mask.classList.contains('reveal-line')) {
      mask.classList.remove('reveal-line');
      mask.removeAttribute('data-delay');
      gsap.set(titleSpan, { y: 0 });
    }
    heroLetters = buildRoll(titleSpan);
    heroLetters.forEach(function (cell) {
      gsap.set(cell.children[0], { yPercent: 115 });
      gsap.set(cell.children[1], { yPercent: 0 });
    });
  }

  function heroEntrance() {
    var tl = gsap.timeline();
    // letters roll up into place
    heroLetters.forEach(function (cell, idx) {
      tl.to([cell.children[0], cell.children[1]], {
        yPercent: '+=115', duration: 1.0, ease: 'power4.out',
        onComplete: (function (a, b) { return function () { gsap.set([a, b], { yPercent: 0 }); }; })(cell.children[0], cell.children[1]),
      }, 0.25 + idx * 0.06);
    });
    // mark floats in
    tl.fromTo(heroMark,
      { opacity: 0, y: 56, scale: 0.86, filter: 'blur(10px)' },
      { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out' }, 0.1);
    return tl;
  }

  /* preloader sequence — the hand starts on the real current second,
     flies back to 12 like a chronograph reset, recoils, then the page wipes in */
  if (!reduce) {
    document.documentElement.style.overflow = 'hidden';
    var now = new Date();
    var startAngle = (now.getSeconds() + now.getMilliseconds() / 1000) * 6;
    if (startAngle < 40) startAngle += 360; /* always a visible sweep */
    gsap.set(preHand, { svgOrigin: '100 100', rotation: startAngle });

    var ptl = gsap.timeline({
      onComplete: function () { document.documentElement.style.overflow = ''; },
    });
    ptl
      /* dial assembles */
      .to('.pre-watch', { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0)
      .fromTo('.pre-mark', { scale: 0.7, rotate: -14 }, { scale: 1, rotate: 0, duration: 0.7, ease: 'back.out(1.6)' }, 0.05)
      .add(function () {
        preTicks.forEach(function (t, i) {
          gsap.to(t, { opacity: parseFloat(t.dataset.op), duration: 0.3, delay: i * 0.012, ease: 'power1.out' });
        });
      }, 0.1)
      .to('.pre-word', { opacity: 1, duration: 0.4 }, 0.35)
      /* flyback: sweep from the live second back up to 12 */
      .to(preHand, { rotation: 360 + 366, duration: 1.35, ease: 'power3.inOut' }, 0.25)
      /* mechanical recoil past 12, spring back onto the marker */
      .to(preHand, { rotation: 360 + 360, duration: 0.6, ease: 'elastic.out(1.6, 0.26)' }, '>-0.06')
      /* wipe into the hero */
      .to(pre, { clipPath: 'inset(0 0 100% 0)', duration: 0.85, ease: 'power4.inOut' }, '-=0.28')
      .set(pre, { display: 'none' })
      .add(heroEntrance(), '-=1.15');
  } else {
    pre.style.display = 'none';
    if (heroMark) heroMark.style.opacity = 1;
  }

  /* idle float + pointer tilt on the mark (schwebend & interaktiv) */
  if (!reduce) {
    gsap.to(heroMark, { y: -12, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 });
    var hero = document.querySelector('.hero');
    if (window.matchMedia('(pointer: fine)').matches) {
      var qx = gsap.quickTo(heroMark, 'rotationY', { duration: 0.7, ease: 'power2.out' });
      var qy = gsap.quickTo(heroMark, 'rotationX', { duration: 0.7, ease: 'power2.out' });
      var qtx = gsap.quickTo(heroMark, 'x', { duration: 0.9, ease: 'power2.out' });
      gsap.set(heroMark, { transformPerspective: 700 });
      hero.addEventListener('mousemove', function (e) {
        var nx = (e.clientX / window.innerWidth) * 2 - 1;
        var ny = (e.clientY / window.innerHeight) * 2 - 1;
        qx(nx * 16); qy(ny * -12); qtx(nx * 14);
      });
      hero.addEventListener('mouseleave', function () { qx(0); qy(0); qtx(0); });
      heroMark.style.cursor = 'pointer';
      heroMark.addEventListener('click', function () { if (heroLetters.length) rollOnce(heroLetters); });
    }
    // periodic idle re-roll like NAU (every ~9s)
    if (heroLetters.length) {
      setInterval(function () {
        if (document.visibilityState === 'visible' && window.scrollY < window.innerHeight * 0.6) rollOnce(heroLetters);
      }, 9000);
    }
    // hero parallax out on scroll
    gsap.to('.hero-inner', {
      y: -70, opacity: 0.25, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero-video', {
      scale: 1.12, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  /* live clock — a watch dealer's homepage should tell the time */
  var clock = document.getElementById('heroClock');
  function tick() {
    var now = new Date();
    clock.textContent = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' FRA';
  }
  if (clock) { tick(); setInterval(tick, 1000); }

  /* ---------- flagship ---------- */
  var flag = HV.byId(window.FLAGSHIP_ID);
  if (flag) {
    document.getElementById('flagshipName').textContent = flag.brand + ' ' + flag.name;
    document.getElementById('flagshipDesc').textContent =
      'Max Büssers „horologisches Konzeptlabor“ baut rund 400 Uhren im Jahr — diese hier trägt ihre fliegende Unruh sichtbar über dem eisblauen Zifferblatt. Full Set von 2024, Zustand wie neu, sofort im Showroom zu besichtigen.';
    document.getElementById('flagshipMeta').innerHTML =
      '<span class="spec">Titan · 44 mm</span>' +
      '<span class="spec">Ref. ' + flag.ref + '</span>' +
      '<span class="spec">' + (flag.fullset || 'Full Set') + '</span>' +
      '<span class="spec num">' + HV.fmtEUR(flag.price) + '</span>';
    document.getElementById('flagshipLink').href = 'produkt.html?id=' + flag.id;
  }

  /* ---------- new-in rail ---------- */
  var rail = document.getElementById('newinRail');
  var newest = (window.PRODUCTS || [])
    .filter(function (p) { return p.status !== 'sold' && p.id !== window.FLAGSHIP_ID; })
    .slice(0, 8);
  rail.innerHTML = newest.map(HV.renderCard).join('');

  /* drag-scroll for rails */
  document.querySelectorAll('.rail-wrap, .quote-rail-wrap').forEach(function (wrapEl) {
    var down = false, startX = 0, startScroll = 0, moved = false;
    wrapEl.addEventListener('pointerdown', function (e) {
      down = true; moved = false; startX = e.clientX; startScroll = wrapEl.scrollLeft;
      wrapEl.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      wrapEl.scrollLeft = startScroll - dx;
    });
    window.addEventListener('pointerup', function () {
      down = false; wrapEl.classList.remove('is-dragging');
    });
    wrapEl.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  });

  /* ---------- testimonials ---------- */
  var qRail = document.getElementById('quoteRail');
  qRail.innerHTML = (window.TESTIMONIALS || []).map(function (t) {
    return '<figure class="quote-card">' +
      '<span class="stars" aria-hidden="true">„</span>' +
      '<blockquote>' + t.text + '</blockquote>' +
      '<figcaption class="q-foot">' +
        '<span class="q-thumb"><img src="' + t.img + '" alt="' + t.watch + '" loading="lazy"></span>' +
        '<span class="q-meta">' +
          '<span class="q-name">' + t.name + '</span>' +
          '<span class="q-date">Gekauft im ' + t.date + '</span>' +
          '<span class="q-watch">' + t.watch + '</span>' +
        '</span>' +
      '</figcaption>' +
    '</figure>';
  }).join('');
  var qWrap = document.querySelector('.quote-rail-wrap');
  function qStep(dir) {
    var card = qRail.querySelector('.quote-card');
    var w = card ? card.getBoundingClientRect().width + 24 : 400;
    qWrap.scrollBy({ left: dir * w, behavior: 'smooth' });
  }
  document.querySelector('[data-q-prev]').addEventListener('click', function () { qStep(-1); });
  document.querySelector('[data-q-next]').addEventListener('click', function () { qStep(1); });

  /* ---------- FAQ accordion ---------- */
  var acc = document.getElementById('faqAcc');
  acc.innerHTML = (window.FAQ || []).map(function (f, i) {
    return '<div class="acc-item">' +
      '<button class="acc-btn" aria-expanded="false" data-acc="' + i + '">' +
        '<span class="acc-q">' + f.q + '</span><span class="acc-icon">+</span>' +
      '</button>' +
      '<div class="acc-body"><p class="acc-a">' + f.a + '</p></div>' +
    '</div>';
  }).join('');
  acc.addEventListener('click', function (e) {
    var btn = e.target.closest('.acc-btn');
    if (!btn) return;
    var item = btn.parentElement;
    var body = item.querySelector('.acc-body');
    var isOpen = item.classList.contains('is-open');
    acc.querySelectorAll('.acc-item.is-open').forEach(function (other) {
      other.classList.remove('is-open');
      other.querySelector('.acc-body').style.maxHeight = '0px';
      other.querySelector('.acc-btn').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('is-open');
      body.style.maxHeight = body.scrollHeight + 'px';
      btn.setAttribute('aria-expanded', 'true');
    }
  });

  /* ---------- links from SITE ---------- */
  document.getElementById('faqWhatsapp').href = window.SITE.whatsapp;
  document.getElementById('igLink').href = window.SITE.instagram;
  document.getElementById('igIdLink').href = window.SITE.instagram;
  document.getElementById('scTiktok').href = window.SITE.tiktok;
  document.getElementById('scChannel').href = window.SITE.whatsappChannel;
  var yt = document.getElementById('scYoutube');
  if (window.SITE.youtube) { yt.hidden = false; yt.href = window.SITE.youtube; }

  /* ---------- instagram tiles ---------- */
  var tiles = ['assets/img/ig-1.jpg', 'assets/products/p444/0.jpg', 'assets/products/p413/0.jpg', 'assets/products/p457/0.jpg'];
  document.getElementById('igGrid').innerHTML = tiles.map(function (src) {
    return '<a class="ig-tile" href="' + window.SITE.instagram + '" target="_blank" rel="noopener">' +
      '<img src="' + src + '" alt="Hahn & Vo auf Instagram" loading="lazy"></a>';
  }).join('');

  /* re-init motion for injected content */
  if (HV.initMotion) HV.initMotion(document.getElementById('newinRail'));
})();
