// Scroll animations via IntersectionObserver
(function () {
  var selector = '.animate-on-scroll, .section-title, .carousel-item, .store-badge';

  if (!('IntersectionObserver' in window)) {
    window.__observeAnimated = function () {
      document.querySelectorAll(selector).forEach(function (t) { t.classList.add('visible'); });
    };
    window.__observeAnimated();
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  window.__observeAnimated = function () {
    document.querySelectorAll(selector).forEach(function (t) {
      if (!t.classList.contains('visible')) observer.observe(t);
    });
  };
  window.__observeAnimated();
})();

// Scroll-snap release: once user scrolls past features, disable mandatory snap
// so download + footer are freely reachable. Re-enable when scrolling back up.
(function () {
  var html = document.documentElement;
  var features = document.querySelector('.features');
  if (!features) return;

  // Only activate on game subpages where snap is enabled via CSS media query
  var isGamePage = document.body.classList.contains('game-cosmic-path') ||
                   document.body.classList.contains('game-memo-maze');
  if (!isGamePage) return;

  var ticking = false;

  function update() {
    ticking = false;
    // Release snap as soon as the user nudges below features' top edge.
    // Tiny offset so sitting exactly on the features snap point keeps snap on.
    var threshold = features.offsetTop + 30;
    if (window.scrollY > threshold) {
      html.classList.add('snap-released');
    } else {
      html.classList.remove('snap-released');
    }
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', update, { passive: true });
  update();
})();

// Vertical wheel over the carousel jumps to the next/previous <section> entirely.
// Fine-grained scrollBy fights mandatory snap and feels laggy, so we make one decisive hop.
(function () {
  var track = document.querySelector('.carousel-track');
  if (!track) return;

  var locked = false;

  track.addEventListener('wheel', function (e) {
    // Leave horizontal wheel alone — that's carousel navigation
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault();
    if (locked) return;

    var section = track.closest('section');
    if (!section) return;

    var dir = e.deltaY > 0 ? 'next' : 'prev';
    var target = dir === 'next' ? section.nextElementSibling : section.previousElementSibling;
    while (target && target.tagName !== 'SECTION') {
      target = dir === 'next' ? target.nextElementSibling : target.previousElementSibling;
    }
    if (!target) return;

    locked = true;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(function () { locked = false; }, 700);
  }, { passive: false });
})();

// Carousel arrows
(function () {
  var track = document.querySelector('.carousel-track');
  var leftBtn = document.querySelector('.carousel-arrow--left');
  var rightBtn = document.querySelector('.carousel-arrow--right');
  if (!track || !leftBtn || !rightBtn) return;

  var scrollAmount = 260;

  leftBtn.addEventListener('click', function () {
    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  rightBtn.addEventListener('click', function () {
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
})();
