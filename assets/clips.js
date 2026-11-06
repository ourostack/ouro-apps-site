// Product clips, as on ouroboros.bot (WorkshopVideo.astro): only the poster
// loads until a clip is on screen, then it plays muted and looped. Under
// reduced motion, with Save-Data, or without JS, the poster stays. Once a clip
// plays, a visible Pause/Play button appears (WCAG 2.2.2). Only the clip for
// the active theme is visible, and a hidden clip never intersects, so it never
// loads.
//
// Posters wait in data-poster until the storybook hero has landed, and only the
// shown theme's poster loads (a theme change loads the other), so a slow phone
// spends its first bytes on the arrival. Without JS, a <noscript> image shows it.
(function () {
  function showPosters() {
    document.querySelectorAll('video[data-poster]').forEach(function (video) {
      if (video.getClientRects().length) { video.poster = video.getAttribute('data-poster'); video.removeAttribute('data-poster'); }
    });
  }
  function arrived() {
    showPosters();
    new MutationObserver(showPosters).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if (window.matchMedia) { var mq = matchMedia('(prefers-color-scheme: dark)'); if (mq.addEventListener) mq.addEventListener('change', showPosters); }
  }
  var hero = document.querySelector('.story-hero img');
  if (!hero || hero.complete) arrived();
  else {
    var done = false;
    var once = function () { if (!done) { done = true; arrived(); } };
    hero.addEventListener('load', once); hero.addEventListener('error', once); setTimeout(once, 4000);
  }
})();
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData === true;
  if (reduce || saveData || !('IntersectionObserver' in window)) return;
  var paused = new WeakSet();
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var video = entry.target;
      if (entry.isIntersecting && !paused.has(video)) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      else video.pause();
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.clip-frame').forEach(function (frame) {
    var toggle = frame.querySelector('.clip-toggle');
    frame.querySelectorAll('video').forEach(function (video) {
      video.addEventListener('play', function () { toggle.hidden = false; toggle.textContent = 'Pause'; toggle.video = video; });
      video.addEventListener('pause', function () { if (toggle.video === video) toggle.textContent = 'Play'; });
      io.observe(video);
    });
    toggle.addEventListener('click', function () {
      var video = toggle.video;
      if (!video) return;
      if (video.paused) { paused.delete(video); video.play(); }
      else { paused.add(video); video.pause(); }
    });
  });
})();
