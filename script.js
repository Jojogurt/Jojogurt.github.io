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

// Carousel UX — arrow clicks, disabled state at edges, mobile dot indicator.
// Sub-768px users have no arrows; without dots they can't tell how many
// screenshots there are or which one they're on. Active dot is the item
// most-centered in the track.
(function () {
  var wrapper = document.querySelector('.carousel-wrapper');
  if (!wrapper) return;
  var track = wrapper.querySelector('.carousel-track');
  if (!track) return;
  var leftBtn = wrapper.querySelector('.carousel-arrow--left');
  var rightBtn = wrapper.querySelector('.carousel-arrow--right');
  var items = track.querySelectorAll('.carousel-item');

  var scrollAmount = 260;
  if (leftBtn) leftBtn.addEventListener('click', function () {
    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });
  if (rightBtn) rightBtn.addEventListener('click', function () {
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  if (!items.length) return;

  // Build dot indicator row inside the wrapper so it sits beneath the track.
  var dotsRow = document.createElement('div');
  dotsRow.className = 'carousel-dots';
  dotsRow.setAttribute('role', 'tablist');
  dotsRow.setAttribute('aria-label', 'Screenshot navigation');
  items.forEach(function (item, i) {
    var d = document.createElement('button');
    d.type = 'button';
    d.className = 'carousel-dot';
    d.setAttribute('aria-label', 'Show screenshot ' + (i + 1));
    d.addEventListener('click', function () {
      item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
    dotsRow.appendChild(d);
  });
  wrapper.appendChild(dotsRow);
  var dots = dotsRow.querySelectorAll('.carousel-dot');

  var ticking = false;
  function update() {
    ticking = false;
    var rect = track.getBoundingClientRect();
    var center = rect.left + rect.width / 2;
    var closest = 0, closestDist = Infinity;
    items.forEach(function (item, i) {
      var r = item.getBoundingClientRect();
      var d = Math.abs(r.left + r.width / 2 - center);
      if (d < closestDist) { closestDist = d; closest = i; }
    });
    dots.forEach(function (d, i) { d.classList.toggle('active', i === closest); });

    if (leftBtn) leftBtn.classList.toggle('disabled', track.scrollLeft < 4);
    if (rightBtn) rightBtn.classList.toggle('disabled',
      track.scrollLeft + track.clientWidth >= track.scrollWidth - 4);
  }

  track.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();

// Image error fallback — when a screenshot 404s, surface its alt text in
// the dark phone-mockup frame instead of leaving an empty black box.
// Also disables pointer events on the broken image so the lightbox
// click handler attached below doesn't open an empty modal for it.
(function () {
  document.querySelectorAll('.phone-mockup img').forEach(function (img) {
    img.addEventListener('error', function () {
      var parent = img.parentElement;
      if (!parent) return;
      img.style.display = 'none';
      img.style.pointerEvents = 'none';
      parent.dataset.fallback = img.alt || 'Screenshot unavailable';
    });
  });
})();

// Image lightbox — click a carousel screenshot to view it full-size.
// Locks the background via `inert` so Tab can't escape the dialog and
// screen readers don't read both layers at once.
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

  function lockBackground(locked) {
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el === overlay) return;
      if (locked) el.inert = true;
      else el.inert = false;
    });
  }

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
      lockBackground(true);
      closeBtn.focus();
    }
  }

  function close() {
    overlay.classList.remove('lightbox--open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lockBackground(false);
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
