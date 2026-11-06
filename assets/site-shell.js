// The shared header's two buttons, matching ouroboros.bot's Nav.astro:
// the theme toggle (remembered per site) and the phone menu.
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
  // not scroll; closing hands focus back to the toggle.
  var menuButton = document.querySelector('.menu-toggle');
  var menu = document.getElementById('menu');
  if (!menuButton || !menu) return;
  function isOpen() { return menu.classList.contains('is-open'); }
  function setOpen(open, refocus) {
    menu.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    // Lock the body only, as ouroboros.bot does. Hiding overflow on <html> too
    // resets the viewport's scroll, so the sticky bar (and the X in it) jumped
    // off the top of the screen when the menu opened after scrolling.
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open && refocus) menuButton.focus();
  }
  menuButton.addEventListener('click', function () { setOpen(!isOpen(), false); });
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
  // Widening past the phone layout hides the menu, so never leave the page locked.
  if (window.matchMedia) {
    var wide = window.matchMedia('(min-width: 1024px)');
    var onWide = function (e) { if (e.matches && isOpen()) setOpen(false, false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
  }
})();
