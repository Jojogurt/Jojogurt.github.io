// Screenshot carousels (iPhone / iPad tabs, prev/next, dots). No dependencies.
// Without JS every carousel stays visible and scrolls natively with scroll-snap.
(function () {
  document.documentElement.classList.add("has-js");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function init(box) {
    var track = box.querySelector(".shots-track");
    var slides = Array.prototype.slice.call(track.querySelectorAll(".shot"));
    var prev = box.querySelector(".prev");
    var next = box.querySelector(".next");
    var dotsBox = box.querySelector(".shots-dots");
    var dots = slides.map(function (s, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.tabIndex = -1;
      b.addEventListener("click", function () { go(i); });
      dotsBox.appendChild(b);
      return b;
    });

    function index() {
      var mid = track.scrollLeft + track.clientWidth / 2, best = 0, d = Infinity;
      slides.forEach(function (s, i) {
        var dist = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
        if (dist < d) { d = dist; best = i; }
      });
      return best;
    }
    function go(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      var s = slides[i];
      track.scrollTo({ left: s.offsetLeft + s.offsetWidth / 2 - track.clientWidth / 2, behavior: reduce ? "auto" : "smooth" });
    }
    var raf = 0;
    function update() {
      raf = 0;
      var i = index();
      dots.forEach(function (b, n) { if (n === i) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === slides.length - 1;
    }
    track.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    if (prev) prev.addEventListener("click", function () { go(index() - 1); });
    if (next) next.addEventListener("click", function () { go(index() + 1); });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index() - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); go(index() + 1); }
    });
    update();
    box._update = update;
  }

  Array.prototype.forEach.call(document.querySelectorAll(".shots"), init);

  Array.prototype.forEach.call(document.querySelectorAll(".shots-wrap"), function (wrap) {
    var tabs = wrap.querySelector(".shots-tabs");
    var btns = Array.prototype.slice.call(tabs.querySelectorAll("button"));
    var panels = Array.prototype.slice.call(wrap.querySelectorAll(".shots-panel"));
    function show(dev) {
      btns.forEach(function (b) { b.setAttribute("aria-selected", b.dataset.device === dev ? "true" : "false"); });
      panels.forEach(function (p) {
        p.hidden = p.dataset.device !== dev;
        if (!p.hidden) { var s = p.querySelector(".shots"); if (s && s._update) s._update(); }
      });
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { show(b.dataset.device); }); });
    tabs.hidden = false;
    show("iphone");
  });
})();
