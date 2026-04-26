/**
 * Right-rail "On this page" TOC scroll-spy (F3).
 *
 * Tracks which heading section is currently in view and toggles
 * `.is-active` on the matching `.doc-toc__link`. Pure DOM + native
 * IntersectionObserver — no library, no fetch, no eval. Air-gapped safe.
 *
 * The script is content-hashed by the generator's asset pipeline; it ships
 * once per build and is referenced from every page that has a TOC. Pages
 * without TOC entries render `data-empty="true"` on the rail; the script
 * still runs (cheaply) but finds no targets and exits.
 *
 * Strategy:
 *   1. Resolve every `.doc-toc__link` and look up its target heading by
 *      `data-toc-target` (the heading's `id`).
 *   2. Single IntersectionObserver tracks all of them at once. The active
 *      heading is the LAST observed entry whose top has crossed the
 *      "spy line" 25% from the viewport top — this matches the user's
 *      reading position better than picking the topmost intersecting
 *      heading.
 *   3. On hash navigation (clicking a TOC link) we bypass the observer
 *      briefly so the active state matches the click immediately, even
 *      before the scroll settles.
 *
 * Size budget: target ≤ 1 KB minified.
 */
(function () {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (!("IntersectionObserver" in window)) return;

  function init() {
    var toc = document.querySelector(".doc-toc");
    if (!toc) return;
    var links = toc.querySelectorAll(".doc-toc__link");
    if (!links.length) return;

    var linkByTarget = Object.create(null);
    var headings = [];
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var targetId = link.getAttribute("data-toc-target");
      if (!targetId) continue;
      var heading = document.getElementById(targetId);
      if (!heading) continue;
      linkByTarget[targetId] = link;
      headings.push(heading);
    }
    if (!headings.length) return;

    var activeLink = null;
    function setActive(link) {
      if (link === activeLink) return;
      if (activeLink) activeLink.classList.remove("is-active");
      activeLink = link;
      if (link) link.classList.add("is-active");
    }

    // visible[id] = true while the heading is intersecting the spy band.
    // We pick the topmost visible heading on each callback firing.
    var visible = Object.create(null);

    var observer = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          var id = entry.target.id;
          if (!id) continue;
          if (entry.isIntersecting) visible[id] = true;
          else delete visible[id];
        }
        // Walk headings in document order, pick the last intersecting one
        // before the first non-intersecting heading below the spy band.
        // This makes the active state track the section the user is most
        // likely reading, not the section that just scrolled out at the top.
        var current = null;
        for (var j = 0; j < headings.length; j++) {
          if (visible[headings[j].id]) current = headings[j].id;
        }
        // Fallback: when nothing is in the spy band (e.g. between two
        // sections), pick the last heading whose top is above the spy line.
        if (!current) {
          var spyLine = window.innerHeight * 0.25;
          for (var k = 0; k < headings.length; k++) {
            var rect = headings[k].getBoundingClientRect();
            if (rect.top <= spyLine) current = headings[k].id;
          }
        }
        if (current) setActive(linkByTarget[current]);
      },
      {
        // Spy band: top 25% to 75% of the viewport. Headings entering this
        // band are considered "currently being read".
        rootMargin: "-25% 0px -75% 0px",
        threshold: 0,
      },
    );

    for (var n = 0; n < headings.length; n++) observer.observe(headings[n]);

    // Sync immediately on link click — the observer can lag behind on
    // hash navigation because the smooth-scroll animation hasn't started
    // crossing thresholds yet. This keeps the active state responsive.
    toc.addEventListener("click", function (e) {
      var t = e.target;
      while (t && t !== toc) {
        if (t.classList && t.classList.contains("doc-toc__link")) {
          setActive(t);
          return;
        }
        t = t.parentNode;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
