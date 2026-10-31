(function () {
  var d = document.documentElement;

  if (!("animate" in Element.prototype)) return;

  try {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  } catch (e) {}

  d.setAttribute("data-entry", "pending");

  window.__entryGuard = setTimeout(function () {
    d.removeAttribute("data-entry");
  }, 4000);
})();