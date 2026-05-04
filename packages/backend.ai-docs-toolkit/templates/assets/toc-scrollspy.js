/**
 * Right-rail "On this page" TOC scroll-spy (F3; refined for fast-scroll
 * accuracy in FR-2758).
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
 *   2. An IntersectionObserver tracks all of them at once. The active
 *      heading is the LAST observed entry whose top has crossed the
 *      "spy line" 25% from the viewport top — this matches the user's
 *      reading position better than picking the topmost intersecting
 *      heading.
 *   3. On hash navigation (clicking a TOC link) we bypass the observer
 *      briefly so the active state matches the click immediately, even
 *      before the scroll settles.
 *   4. FR-2758: a passive `scroll` listener (rAF-throttled) reconciles
 *      the active state from the actual heading positions on every frame
 *      while scrolling. The IntersectionObserver alone misses entries
 *      during very fast scrolls (entries are batched and may report a
 *      mid-flight state), and the scrollspy was visibly off when users
 *      flicked through long pages. Polling positions on rAF closes the
 *      gap without measurable cost — getBoundingClientRect on a few
 *      dozen headings is sub-millisecond on commodity hardware.
 *
 * Size budget: target ≤ 1.5 KB minified.
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

    // The "active" heading is the last one whose top edge has crossed the
    // spy line (25% from the viewport top). This matches what the reader
    // is actively looking at, regardless of scroll velocity.
    function pickActiveByPosition() {
      var spyLine = window.innerHeight * 0.25;
      var current = null;
      for (var k = 0; k < headings.length; k++) {
        var rect = headings[k].getBoundingClientRect();
        if (rect.top - spyLine <= 0) {
          current = headings[k].id;
        } else {
          break;
        }
      }
      // If we haven't passed the first heading yet (top of page), highlight it
      // anyway so the rail shows SOMETHING active rather than going blank.
      if (!current && headings.length > 0) {
        current = headings[0].id;
      }
      if (current) setActive(linkByTarget[current]);
    }

    // visible[id] = true while the heading is intersecting the spy band.
    // The IntersectionObserver still helps for the slow-scroll / paused
    // case (when the user lands inside a section between hash jumps) but
    // the rAF scroll loop below is the source of truth during motion.
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
        // When at least one heading is in the spy band, prefer the deepest
        // one (last in document order). Otherwise fall back to position.
        var inBand = null;
        for (var j = 0; j < headings.length; j++) {
          if (visible[headings[j].id]) inBand = headings[j].id;
        }
        if (inBand) {
          setActive(linkByTarget[inBand]);
        } else {
          pickActiveByPosition();
        }
      },
      {
        // Spy line: a single horizontal line at 25% viewport height.
        // The rootMargin shrinks the observation root by 25% from the top
        // and 75% from the bottom, leaving a zero-height detection zone
        // — an entry "intersects" only while its bounding box is crossing
        // that line. Picking the deepest crossed heading on each callback
        // keeps the active state aligned with what the reader is most
        // likely looking at, without coupling it to scroll velocity.
        rootMargin: "-25% 0px -75% 0px",
        threshold: 0,
      },
    );

    for (var n = 0; n < headings.length; n++) observer.observe(headings[n]);

    // rAF-throttled scroll listener. The IntersectionObserver entries can
    // arrive out of phase with the actual viewport during fast scrolls
    // (the entries are queued and batched), causing the visible "active"
    // item to lag a section behind. Re-checking heading positions on every
    // animation frame while the user scrolls keeps the highlight glued to
    // the section currently under the spy line.
    var scrollScheduled = false;
    function onScroll() {
      if (scrollScheduled) return;
      scrollScheduled = true;
      window.requestAnimationFrame(function () {
        scrollScheduled = false;
        pickActiveByPosition();
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    // Run once on load so the rail isn't empty before the first scroll.
    pickActiveByPosition();

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
