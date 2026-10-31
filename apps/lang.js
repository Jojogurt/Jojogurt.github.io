// Language switcher for /apps/ pages: one URL, language in the hash (#pl).
// Blocks are id="lang-pl", so #pl is not a scroll target; #lang-pl is the no-JS :target fallback.
// No cookies or storage; falls back to the browser language, then English.
(function () {
  var blocks = Array.prototype.slice.call(document.querySelectorAll(".lang-block[id]"));
  if (!blocks.length) return;
  var codes = blocks.map(function (b) { return b.id.replace(/^lang-/, ""); });
  var select = document.querySelector(".lang-select");

  function match(tag) {
    if (!tag) return null;
    tag = tag.toLowerCase();
    var i, c;
    for (i = 0; i < codes.length; i++) if (codes[i].toLowerCase() === tag) return codes[i];
    if (/^zh-(hant|tw|hk|mo)/.test(tag)) return codes.indexOf("zh-Hant") >= 0 ? "zh-Hant" : null;
    if (/^es-(mx|419|us|ar|co|cl|pe)/.test(tag) && codes.indexOf("es-MX") >= 0) return "es-MX";
    var base = tag.split("-")[0];
    if (base === "no" || base === "nn") base = "nb";
    if (base === "pt") return codes.indexOf("pt-BR") >= 0 ? "pt-BR" : null;
    if (base === "zh") return null;
    for (i = 0; i < codes.length; i++) {
      c = codes[i].toLowerCase();
      if (c === base || c.split("-")[0] === base) return codes[i];
    }
    return null;
  }

  function fromBrowser() {
    var list = navigator.languages || [navigator.language];
    for (var i = 0; i < list.length; i++) {
      var m = match(list[i]);
      if (m) return m;
    }
    return "en";
  }

  function apply(code) {
    blocks.forEach(function (b) { b.hidden = b.id !== "lang-" + code; });
    var active = document.getElementById("lang-" + code);
    document.documentElement.lang = code;
    if (active.dataset.title) document.title = active.dataset.title;
    if (select) select.value = code;
    document.querySelectorAll("a.keep-lang").forEach(function (a) {
      a.setAttribute("href", a.getAttribute("href").split("#")[0] + "#" + code);
    });
    document.querySelectorAll("[data-l10n]").forEach(function (el) {
      var map = JSON.parse(el.dataset.l10n);
      el.textContent = map[code] || map.en;
    });
  }

  function current() {
    var h = decodeURIComponent(location.hash.slice(1)).replace(/^lang-/, "");
    return codes.indexOf(h) >= 0 ? h : fromBrowser();
  }

  if (select) {
    select.hidden = false;
    select.addEventListener("change", function () { location.hash = select.value; });
  }
  window.addEventListener("hashchange", function () { apply(current()); });
  apply(current());
})();
