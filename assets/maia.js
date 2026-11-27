/* MAIA motion layer: deep-space field (stars + digital rain with depth), scroll reveals, header state.
   Pauses with the page's "Pause motion" button; still frame for reduced motion. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFMAIA<>/{}[]=+*#';
  var HEX = { frontier: [161, 66, 244], copilot: [18, 181, 203], security: [66, 133, 244], white: [214, 226, 255] };

  function Space(host) {
    var canvas = host.querySelector('canvas'); if (!canvas) return null;
    var ctx = canvas.getContext('2d'); if (!ctx) return null;
    var mix = (host.getAttribute('data-palette') || 'security,frontier,copilot').split(',').map(function (k) { return HEX[k.trim()] || HEX.security; });
    var s = { host: host, canvas: canvas, ctx: ctx, w: 0, h: 0, stars: [], drops: [], mx: 0, my: 0, tx: 0, ty: 0, visible: true };
    function rnd(a, b) { return a + Math.random() * (b - a); }
    s.resize = function () {
      var r = host.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.w = r.width; s.h = r.height; canvas.width = Math.round(s.w * dpr); canvas.height = Math.round(s.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(s.w * s.h / 2600); s.stars = [];
      for (var i = 0; i < n; i++) s.stars.push({ x: Math.random() * s.w, y: Math.random() * s.h, z: Math.pow(Math.random(), 2.2) * .9 + .1, p: Math.random() * 6.28, sp: rnd(.4, 1.6) });
      var cols = Math.round(s.w / 17); s.drops = [];
      for (var j = 0; j < cols; j++) s.drops.push(newDrop(true));
    };
    function newDrop(anywhere) {
      var z = Math.pow(Math.random(), 1.6) * .85 + .15, size = 9 + z * 9;
      var len = Math.round(rnd(6, 22)), chars = [];
      for (var k = 0; k < len; k++) chars.push(GLYPHS[(Math.random() * GLYPHS.length) | 0]);
      return { x: Math.random() * s.w, y: anywhere ? rnd(-s.h, s.h) : rnd(-s.h * .6, -40), z: z, size: size, v: (18 + z * 60), chars: chars, c: mix[(Math.random() * mix.length) | 0] };
    }
    s.draw = function (t, dt) {
      var w = s.w, h = s.h; ctx.clearRect(0, 0, w, h);
      s.mx += (s.tx - s.mx) * .05; s.my += (s.ty - s.my) * .05;
      var scrollP = Math.min(1, Math.max(0, -host.getBoundingClientRect().top / Math.max(1, h)));
      /* stars: three depths, twinkle, parallax with pointer and scroll */
      for (var i = 0; i < s.stars.length; i++) {
        var st = s.stars[i], px = st.x + s.mx * st.z * 28, py = st.y + s.my * st.z * 18 - scrollP * st.z * 120;
        py = ((py % h) + h) % h;
        var a = (.25 + .75 * st.z) * (.55 + .45 * Math.sin(st.p + t * st.sp));
        ctx.globalAlpha = a; ctx.fillStyle = st.z > .75 ? '#ffffff' : '#B9C8FF';
        var r = st.z * 1.5; ctx.beginPath(); ctx.arc(px, py, r, 0, 6.283); ctx.fill();
        if (st.z > .9) { ctx.globalAlpha = a * .18; ctx.beginPath(); ctx.arc(px, py, r * 4, 0, 6.283); ctx.fill(); }
      }
      /* digital rain falling through depth: near streams are larger, faster and brighter */
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var j = 0; j < s.drops.length; j++) {
        var d = s.drops[j]; d.y += d.v * dt;
        if (Math.random() < .04) d.chars[(Math.random() * d.chars.length) | 0] = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        var x = d.x + s.mx * d.z * 40, base = d.y - scrollP * d.z * 200;
        ctx.font = '500 ' + d.size.toFixed(1) + "px 'JetBrains Mono', ui-monospace, monospace";
        for (var k = 0; k < d.chars.length; k++) {
          var y = base - k * d.size * 1.15; if (y < -20 || y > h + 20) continue;
          var fall = 1 - k / d.chars.length, al = fall * fall * (.16 + .62 * d.z);
          if (k === 0) { ctx.globalAlpha = Math.min(1, .35 + .6 * d.z); ctx.fillStyle = '#EAF0FF'; }
          else { ctx.globalAlpha = al; ctx.fillStyle = 'rgb(' + d.c[0] + ',' + d.c[1] + ',' + d.c[2] + ')'; }
          ctx.fillText(d.chars[k], x, y);
        }
        if (base - d.chars.length * d.size * 1.15 > h + 20) s.drops[j] = newDrop(false);
      }
      ctx.globalAlpha = 1;
    };
    host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); s.tx = (e.clientX - r.left) / r.width - .5; s.ty = (e.clientY - r.top) / r.height - .5; });
    host.addEventListener('pointerleave', function () { s.tx = 0; s.ty = 0; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { s.visible = es[0].isIntersecting; }).observe(host);
    return s;
  }

  function start() {
    var spaces = [].slice.call(document.querySelectorAll('.space-bg')).map(function (b) { var s = Space(b); return s; }).filter(Boolean);
    var btn = document.getElementById('motionBtn');
    var paused = function () { return btn && btn.getAttribute('aria-pressed') === 'true'; };
    if (btn && !btn.onclick) btn.addEventListener('click', function () { var p = !paused(); btn.setAttribute('aria-pressed', String(p)); btn.textContent = p ? 'Play motion' : 'Pause motion'; });
    function resize() { spaces.forEach(function (s) { s.resize(); s.draw(4, 0); }); }
    resize(); window.addEventListener('resize', resize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
    if (!reduce && spaces.length) {
      var last = performance.now(), t0 = last;
      (function frame(now) {
        var dt = Math.min(.05, (now - last) / 1000); last = now;
        if (!paused() && !document.hidden) spaces.forEach(function (s) { if (s.visible) s.draw((now - t0) / 1000, dt); });
        requestAnimationFrame(frame);
      })(last);
    }

    /* headline words rise in, one after another */
    [].slice.call(document.querySelectorAll('[data-words]')).forEach(function (el) {
      var i = 0;
      (function walk(node) {
        [].slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var sp = document.createElement('span'); sp.className = 'word' + (node.classList && node.classList.contains('grad-src') ? ' grad-text' : '');
              sp.style.setProperty('--d', (.08 + i++ * .07) + 's'); sp.textContent = part; frag.appendChild(sp);
            });
            node.replaceChild(frag, c);
          } else if (c.nodeType === 1) walk(c);
        });
      })(el);
    });

    /* scroll reveals */
    var items = [].slice.call(document.querySelectorAll('[data-reveal] > *, .rv-self'));
    items.forEach(function (el, i) { el.classList.add('rv'); el.style.setProperty('--d', (Array.prototype.indexOf.call(el.parentNode.children, el) % 6) * .08 + 's'); });
    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
      items.forEach(function (el) { io.observe(el); });
    } else items.forEach(function (el) { el.classList.add('in'); });

    var onScroll = function () { document.body.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
