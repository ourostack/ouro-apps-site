// Product clips, as on ouroboros.bot (WorkshopVideo.astro): only the poster
// loads until a clip is on screen, then it plays muted and looped. Under
// reduced motion, with Save-Data, or without JS, the poster stays. Once a clip
// plays, a visible Pause/Play button appears (WCAG 2.2.2). Only the clip for
// the active theme is visible, and a hidden clip never intersects, so it never
// loads.
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
