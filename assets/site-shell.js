// The shared header's two buttons, matching ouroboros.bot's Nav.astro:
// the theme toggle (remembered per site) and the phone menu.

// The meadow above the footer is lazy, but a browser's own lazy margin is short
// enough that a quick scroll met an empty band. Once the page has loaded, fetch
// it, so it is there long before anyone reaches the foot (taste r4).
(function () {
  function wake() {
    Array.prototype.forEach.call(document.querySelectorAll('.story-meadow img[loading="lazy"]'), function (img) { img.loading = 'eager'; });
  }
  if (document.readyState === 'complete') wake(); else window.addEventListener('load', wake, { once: true });
})();

// Copy buttons, as on ouroboros.bot (Layout.astro): <button data-copy-target="id">
// copies that element's text. Without the Clipboard API, select the text so the
// visitor can copy it.
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('[data-copy-target]'), function (button) {
    button.addEventListener('click', function () {
      var target = document.getElementById(button.getAttribute('data-copy-target'));
      var label = button.querySelector('[data-copy-label]') || button;
      if (!target) return;
      var original = label.textContent;
      function done(text) {
        label.textContent = text;
        setTimeout(function () { label.textContent = original; }, 1600);
      }
      function select() {
        var range = document.createRange();
        range.selectNodeContents(target);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        done('Selected, now copy it');
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(target.textContent).then(function () { done('Copied'); }, select);
      } else {
        select();
      }
    });
  });
})();

(function () {
  var root = document.documentElement;
  var toggle = document.querySelector('.theme-toggle');
  function current() {
    return root.dataset.theme || (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }
  function label() {
    if (toggle) toggle.setAttribute('aria-label', current() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  if (toggle) {
    label();
    toggle.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
      label();
    });
  }

  // The phone menu: a full panel under the bar. The toggle (a hamburger that
  // turns into an X) opens and closes it; a link, Escape or a tap on the
  // panel outside its links closes it. While it is open the page behind does
  // not scroll and cannot take focus; closing hands focus back to the toggle.
  var menuButton = document.querySelector('.menu-toggle');
  var menu = document.getElementById('menu');
  if (!menuButton || !menu) return;
  function isOpen() { return menu.classList.contains('is-open'); }
  // While the menu is open, everything it covers is inert, so Tab walks the
  // menu's own links and the bar's two buttons, never the page hidden behind
  // the panel (taste review r4). The home mark beside the buttons goes inert
  // too, so the keyboard stays inside the menu.
  function behind() {
    var els = Array.prototype.filter.call(document.body.children, function (el) {
      return !el.contains(menu) && el.tagName !== 'SCRIPT';
    });
    var header = menu.parentElement;
    if (header) Array.prototype.forEach.call(header.querySelectorAll('.brand, .nav'), function (el) { els.push(el); });
    return els;
  }
  function setOpen(open, refocus) {
    behind().forEach(function (el) { if (open) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
    menu.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    // Lock the body only, as ouroboros.bot does. Hiding overflow on <html> too
    // resets the viewport's scroll, so the sticky bar (and the X in it) jumped
    // off the top of the screen when the menu opened after scrolling.
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open && refocus) menuButton.focus();
  }
  menuButton.addEventListener('click', function () { setOpen(!isOpen(), true); });
  menu.addEventListener('click', function (event) {
    if (event.target.closest && event.target.closest('a')) { setOpen(false, false); return; }
    if (event.target === menu) setOpen(false, true);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isOpen()) setOpen(false, true);
  });
  document.addEventListener('click', function (event) {
    if (isOpen() && !menu.contains(event.target) && !menuButton.contains(event.target)) setOpen(false, true);
  });
  // A swipe closes it too (taste review r17, 2026-11-07: no swipe did). The
  // panel drops from the bar, so a swipe down the panel or back up toward
  // the bar closes it. The panel follows the finger, closes past a short
  // threshold (or on a quick flick), and springs back under it. When the
  // links outrun the screen and the panel scrolls, a swipe that would scroll
  // it scrolls it instead. Under reduced motion nothing follows the finger
  // and it closes at once. ouroboros.bot's Nav.astro has the same gesture;
  // scripts/menu-swipe.mjs drives it with touch events.
  (function swipeToClose() {
    var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    var THRESHOLD = 64, FLICK = 0.5, SLOP = 10;
    var start = null, dy = 0, dragging = false;
    function reset(animate) {
      menu.style.transition = animate && !reduce.matches ? 'transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1.2)' : '';
      menu.style.transform = '';
      if (animate) setTimeout(function () { menu.style.transition = ''; }, 300);
    }
    function close() {
      if (reduce.matches) { reset(false); setOpen(false, true); return; }
      menu.style.transition = 'transform 0.2s ease-in';
      menu.style.transform = 'translateY(' + (dy > 0 ? '100%' : '-100%') + ')';
      setTimeout(function () { setOpen(false, true); reset(false); }, 200);
    }
    menu.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { start = null; return; }
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
      dy = 0; dragging = false;
    }, { passive: true });
    menu.addEventListener('touchmove', function (e) {
      if (!start) return;
      var mx = e.touches[0].clientX - start.x, my = e.touches[0].clientY - start.y;
      if (!dragging) {
        if (Math.abs(my) < SLOP || Math.abs(mx) > Math.abs(my)) return;
        // A swipe the panel can scroll with is a scroll, not a close.
        var canUp = menu.scrollTop > 0, canDown = menu.scrollTop + menu.clientHeight < menu.scrollHeight - 1;
        if ((my > 0 && canUp) || (my < 0 && canDown)) { start = null; return; }
        dragging = true;
      }
      e.preventDefault();
      dy = my;
      if (!reduce.matches) {
        menu.style.transition = '';
        menu.style.transform = 'translateY(' + dy + 'px)';
      }
    }, { passive: false });
    menu.addEventListener('touchend', function () {
      if (!start) return;
      var fast = Math.abs(dy) / Math.max(1, Date.now() - start.t) > FLICK && Math.abs(dy) > 24;
      var was = dragging;
      start = null; dragging = false;
      if (!was) return;
      if (Math.abs(dy) >= THRESHOLD || fast) close();
      else reset(true);
    });
    menu.addEventListener('touchcancel', function () { if (start) { start = null; dragging = false; reset(true); } });
  })();
  // Widening past the phone layout hides the menu, so never leave the page locked.
  if (window.matchMedia) {
    var wide = window.matchMedia('(min-width: 1024px)');
    var onWide = function (e) { if (e.matches && isOpen()) setOpen(false, false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
  }
})();
