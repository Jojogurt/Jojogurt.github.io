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

// Image lightbox — click a carousel screenshot to view it full-size
(function () {
  var images = document.querySelectorAll('.phone-mockup img');
  if (!images.length) return;

  var overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML =
    '<button type="button" class="lightbox-nav lightbox-nav--prev" aria-label="Previous screenshot">‹</button>' +
    '<img class="lightbox-image" alt="">' +
    '<button type="button" class="lightbox-nav lightbox-nav--next" aria-label="Next screenshot">›</button>' +
    '<button type="button" class="lightbox-close" aria-label="Close">×</button>';
  document.body.appendChild(overlay);

  var lightboxImg = overlay.querySelector('.lightbox-image');
  var closeBtn = overlay.querySelector('.lightbox-close');
  var prevBtn = overlay.querySelector('.lightbox-nav--prev');
  var nextBtn = overlay.querySelector('.lightbox-nav--next');
  var current = -1;
  var items = Array.prototype.map.call(images, function (img) {
    return { src: img.src, alt: img.alt || '' };
  });
  var lastFocus = null;

  function show(index) {
    if (index < 0 || index >= items.length) return;
    current = index;
    lightboxImg.src = items[index].src;
    lightboxImg.alt = items[index].alt;
    if (!overlay.classList.contains('lightbox--open')) {
      lastFocus = document.activeElement;
      overlay.classList.add('lightbox--open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
  }

  function close() {
    overlay.classList.remove('lightbox--open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    setTimeout(function () {
      if (!overlay.classList.contains('lightbox--open')) lightboxImg.src = '';
    }, 300);
  }

  function step(delta) {
    var next = (current + delta + items.length) % items.length;
    show(next);
  }

  Array.prototype.forEach.call(images, function (img, i) {
    img.addEventListener('click', function () { show(i); });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
  nextBtn.addEventListener('click', function (e) { e.stopPropagation(); step(1); });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('lightbox--open')) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });
})();
