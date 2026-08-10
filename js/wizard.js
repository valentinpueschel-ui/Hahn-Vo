/* HAHN & VO — generic one-question-at-a-time wizard (Typeform-style).
   Usage: HV.wizard(container, steps, opts)
   step = { label, q, hint, fields: [...], optional }
   field = { type: 'text'|'email'|'tel'|'textarea'|'select'|'radio'|'checks'|'uploads',
             key, label, placeholder, options: [..], slots: [{t,s}] } */
(function () {
  'use strict';
  var HV = (window.HV = window.HV || {});

  HV.wizard = function (container, steps, opts) {
    opts = opts || {};
    var state = opts.initial ? Object.assign({}, opts.initial) : {};
    var idx = 0;

    container.innerHTML =
      '<div class="wiz-progress"><i style="width:0%"></i></div>' +
      '<div class="wiz-body">' +
        '<span class="wiz-step-label" data-w-label></span>' +
        '<h3 class="wiz-q" data-w-q></h3>' +
        '<p class="wiz-hint" data-w-hint></p>' +
        '<div class="wiz-fields" data-w-fields></div>' +
        '<p class="wiz-error" data-w-error>Bitte füllen Sie dieses Feld aus.</p>' +
        '<div class="wiz-foot">' +
          '<button type="button" class="wiz-back" data-w-back>← Zurück</button>' +
          '<span class="wiz-enter-hint">Enter ↵ zum Fortfahren</span>' +
          '<button type="button" class="btn btn-solid" data-w-next>Weiter <span class="arr">→</span></button>' +
        '</div>' +
      '</div>';

    var elLabel = container.querySelector('[data-w-label]');
    var elQ = container.querySelector('[data-w-q]');
    var elHint = container.querySelector('[data-w-hint]');
    var elFields = container.querySelector('[data-w-fields]');
    var elErr = container.querySelector('[data-w-error]');
    var elBack = container.querySelector('[data-w-back]');
    var elNext = container.querySelector('[data-w-next]');
    var elBar = container.querySelector('.wiz-progress i');

    function fieldHtml(f) {
      var val = state[f.key] || '';
      switch (f.type) {
        case 'textarea':
          return '<div class="field"><label>' + (f.label || '') + '</label>' +
            '<textarea data-key="' + f.key + '" placeholder="' + (f.placeholder || '') + '">' + val + '</textarea></div>';
        case 'select':
          return '<div class="field"><label>' + (f.label || '') + '</label><select data-key="' + f.key + '">' +
            '<option value="">Bitte wählen …</option>' +
            f.options.map(function (o) { return '<option' + (val === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') +
            '</select></div>';
        case 'radio':
          return '<div class="chip-row">' + f.options.map(function (o) {
            var t = typeof o === 'string' ? o : o.t;
            var s = typeof o === 'string' ? '' : (o.s || '');
            return '<label class="chip"><input type="radio" name="' + f.key + '" value="' + t + '"' + (val === t ? ' checked' : '') + '>' +
              '<span class="chip-face"><span><span class="chip-title">' + t + '</span>' +
              (s ? '<div class="chip-sub">' + s + '</div>' : '') + '</span></span></label>';
          }).join('') + '</div>';
        case 'checks':
          var arr = state[f.key] || [];
          return '<div class="chip-row">' + f.options.map(function (o) {
            return '<label class="chip"><input type="checkbox" name="' + f.key + '" value="' + o + '"' + (arr.indexOf(o) !== -1 ? ' checked' : '') + '>' +
              '<span class="chip-face"><span class="chip-title">' + o + '</span></span></label>';
          }).join('') + '</div>';
        case 'uploads':
          return '<div class="upload-grid">' + f.slots.map(function (s, i) {
            return '<label class="upload-slot" data-slot="' + i + '">' +
              '<input type="file" accept="image/*" data-upload="' + f.key + ':' + i + '">' +
              '<span class="u-ic">↑</span><span><div class="u-t">' + s.t + '</div><div class="u-s">' + (s.s || 'JPG, PNG oder HEIC') + '</div></span>' +
            '</label>';
          }).join('') + '</div>';
        default:
          return '<div class="field"><label>' + (f.label || '') + '</label>' +
            '<input type="' + (f.type || 'text') + '" data-key="' + f.key + '" value="' + val + '" placeholder="' + (f.placeholder || '') + '">' +
            '</div>';
      }
    }

    function collect() {
      elFields.querySelectorAll('[data-key]').forEach(function (input) {
        state[input.dataset.key] = input.value.trim();
      });
      elFields.querySelectorAll('input[type="radio"]:checked').forEach(function (r) {
        state[r.name] = r.value;
      });
      var checkKeys = {};
      elFields.querySelectorAll('input[type="checkbox"]').forEach(function (c) { checkKeys[c.name] = true; });
      Object.keys(checkKeys).forEach(function (k) {
        state[k] = Array.prototype.map.call(
          elFields.querySelectorAll('input[name="' + k + '"]:checked'),
          function (c) { return c.value; });
      });
    }

    function valid(step) {
      if (step.optional) return true;
      return step.fields.every(function (f) {
        if (f.optional) return true;
        if (f.type === 'uploads') return true; /* demo: uploads optional */
        if (f.type === 'checks') return (state[f.key] || []).length > 0;
        var v = state[f.key];
        if (f.type === 'email') return /.+@.+\..+/.test(v || '');
        return v && v.length > 0;
      });
    }

    function show(i, dir) {
      idx = i;
      var step = steps[i];
      elBar.style.width = ((i) / steps.length * 100) + '%';
      elLabel.textContent = 'Schritt ' + (i + 1) + ' von ' + steps.length + (step.optional ? ' · optional' : '');
      elQ.textContent = step.q;
      elHint.textContent = step.hint || '';
      elHint.style.display = step.hint ? '' : 'none';
      elFields.innerHTML = step.fields.map(fieldHtml).join('');
      elErr.classList.remove('is-visible');
      elBack.style.visibility = i === 0 ? 'hidden' : 'visible';
      elNext.innerHTML = (i === steps.length - 1 ? (opts.submitLabel || 'Absenden') : 'Weiter') + ' <span class="arr">→</span>';
      if (window.gsap) {
        gsap.fromTo(elFields.parentElement,
          { opacity: 0, x: (dir || 1) * 34 },
          { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out' });
      }
      var first = elFields.querySelector('input:not([type=file]):not([type=radio]):not([type=checkbox]), textarea, select');
      if (first) setTimeout(function () { first.focus(); }, 350);
      /* upload slot feedback */
      elFields.querySelectorAll('input[type=file]').forEach(function (inp) {
        inp.addEventListener('change', function () {
          var slot = inp.closest('.upload-slot');
          slot.classList.add('has-file');
          slot.querySelector('.u-ic').textContent = '✓';
          if (inp.files[0]) slot.querySelector('.u-s').textContent = inp.files[0].name;
          state['_upload_' + inp.dataset.upload] = inp.files[0] ? inp.files[0].name : '';
        });
      });
    }

    function next() {
      collect();
      var step = steps[idx];
      if (!valid(step)) { elErr.classList.add('is-visible'); return; }
      elErr.classList.remove('is-visible');
      if (idx === steps.length - 1) { finish(); return; }
      show(idx + 1, 1);
    }
    function finish() {
      elBar.style.width = '100%';
      try {
        var log = JSON.parse(localStorage.getItem(opts.storageKey || 'hv_requests') || '[]');
        log.push({ at: new Date().toISOString(), data: state });
        localStorage.setItem(opts.storageKey || 'hv_requests', JSON.stringify(log));
      } catch (e) { /* private mode */ }
      container.querySelector('.wiz-body').innerHTML =
        '<div class="form-success">' +
          '<span class="micro" style="opacity:.7">' + (opts.successKicker || 'Anfrage eingegangen') + '</span>' +
          '<h3 style="font-size:1.5rem;font-weight:640;letter-spacing:-0.01em">' + (opts.successTitle || 'Vielen Dank!') + '</h3>' +
          '<p style="opacity:.85;line-height:1.65;max-width:52ch">' + (opts.successText || '') + '</p>' +
          '<div style="display:flex;gap:12px;margin-top:14px;flex-wrap:wrap">' +
            '<a class="btn btn-creme" href="shop.html">Kollektion ansehen</a>' +
            '<a class="btn btn-ghost-creme" href="' + window.SITE.whatsapp + '" target="_blank" rel="noopener">WhatsApp öffnen</a>' +
          '</div>' +
        '</div>';
      if (window.gsap) gsap.from(container.querySelector('.form-success'), { opacity: 0, y: 24, duration: 0.6, ease: 'power2.out' });
      if (opts.onFinish) opts.onFinish(state);
    }

    elNext.addEventListener('click', next);
    elBack.addEventListener('click', function () { if (idx > 0) { collect(); show(idx - 1, -1); } });
    container.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); next(); }
    });

    show(0, 1);
    return { state: state };
  };
})();
