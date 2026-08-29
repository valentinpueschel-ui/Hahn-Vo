/* HAHN & VO — shared motion layer: Lenis + GSAP ScrollTrigger.
   Conventions:
     .reveal-line > span   — line rises out of overflow mask
     [data-reveal]         — fade/translate in (add data-delay for stagger)
     [data-clip]           — clip-path wipe downwards
     [data-parallax]       — subtle y drift (value = strength in px)
     [data-magnetic]       — magnetic hover pull
     .marquee-track        — infinite loop
     [data-counter]        — count up to number */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { document.documentElement.classList.add('no-motion'); return; }

  gsap.registerPlugin(ScrollTrigger);

  /* Lenis smooth scroll */
  var lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
  window.HV = window.HV || {};
  window.HV.lenis = lenis;

  function initScope(scope) {
    scope = scope || document;

    /* split .reveal-line content into masked spans if not already */
    scope.querySelectorAll('.reveal-line').forEach(function (el) {
      if (!el.querySelector(':scope > span')) {
        var span = document.createElement('span');
        while (el.firstChild) span.appendChild(el.firstChild);
        el.appendChild(span);
      }
    });

    scope.querySelectorAll('.reveal-line > span').forEach(function (span) {
      gsap.to(span, {
        y: 0, yPercent: 0, translateY: 0,
        transform: 'translateY(0%)',
        duration: 1.1, ease: 'power4.out',
        delay: parseFloat(span.parentElement.dataset.delay || 0),
        scrollTrigger: { trigger: span.parentElement, start: 'top 88%' },
      });
    });

    scope.querySelectorAll('[data-reveal]').forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1.0, ease: 'power3.out',
        delay: parseFloat(el.dataset.delay || 0),
        scrollTrigger: { trigger: el, start: 'top 90%' },
      });
    });

    scope.querySelectorAll('[data-clip]').forEach(function (el) {
      gsap.to(el, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'power4.inOut',
        delay: parseFloat(el.dataset.delay || 0),
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });

    scope.querySelectorAll('[data-parallax]').forEach(function (el) {
      var strength = parseFloat(el.dataset.parallax || 40);
      gsap.fromTo(el, { y: -strength }, {
        y: strength, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    /* Zähler: Die echte Zahl steht im HTML. Die Animation zählt nur hoch,
       wenn sie wirklich läuft — ohne Bewegung, ohne JS oder in einem
       Browser, der nicht auslöst, bleibt die richtige Zahl stehen. */
    scope.querySelectorAll('[data-counter]').forEach(function (el) {
      var target = parseFloat(el.dataset.counter);
      var obj = { v: target };
      /* Nur auf 0 setzen, wenn das Element noch unterhalb des Bildschirms liegt —
         sonst würde eine sichtbare Zahl kurz auf 0 springen. */
      if (el.getBoundingClientRect().top > window.innerHeight) { obj.v = 0; el.textContent = '0'; }
      var gestartet = false;
      function zaehlen() {
        if (gestartet) return;
        gestartet = true;
        gsap.to(obj, {
          v: target, duration: 1.6, ease: 'power2.out',
          onUpdate: function () { el.textContent = Math.round(obj.v).toLocaleString('de-DE'); },
        });
      }
      /* Auslöser ist die Sichtbarkeit, nicht das Scroll-Ereignis — eingebettete
         Browser (Instagram, Facebook) reichen Scroll-Ereignisse nicht immer
         durch, Sichtbarkeit melden sie alle. Ohne Beobachter: sofort zählen. */
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (eintraege) {
          if (eintraege.some(function (e) { return e.isIntersecting; })) { zaehlen(); io.disconnect(); }
        }, { threshold: 0.15 });
        io.observe(el);
      } else { zaehlen(); }
    });
  }
  window.HV.initMotion = initScope;
  initScope(document);

  /* marquee — seamless loop, speed-neutral; slows on hover so brand links are clickable */
  document.querySelectorAll('.marquee-track').forEach(function (track) {
    var clone = track.innerHTML;
    track.innerHTML = clone + '<span aria-hidden="true" style="display:contents">' + clone + '</span>';
    var tween = gsap.to(track, { xPercent: -50, duration: 34, ease: 'none', repeat: -1 });
    var parent = track.parentElement;
    parent.addEventListener('mouseenter', function () { gsap.to(tween, { timeScale: 0.15, duration: 0.5 }); });
    parent.addEventListener('mouseleave', function () { gsap.to(tween, { timeScale: 1, duration: 0.5 }); });
  });

  /* magnetic hover */
  var fine = window.matchMedia('(pointer: fine)').matches;
  if (fine) {
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      var strength = parseFloat(el.dataset.magnetic || 0.25);
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - r.left - r.width / 2) * strength,
          y: (e.clientY - r.top - r.height / 2) * strength,
          duration: 0.4, ease: 'power2.out',
        });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* refresh after everything (images) settles */
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
