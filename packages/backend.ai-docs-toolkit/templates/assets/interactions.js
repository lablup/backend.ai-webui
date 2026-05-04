/* docs-toolkit interactions (FR-2726 Phase 4).
 *
 * Three small UX behaviors live here so the page only ships one extra
 * script tag. All vanilla DOM, no framework, no network access.
 *
 *   1. Theme toggle    — flips data-theme between "light" and "dark",
 *                        persisted in localStorage. The pre-paint
 *                        bootstrap that prevents FOUC lives inline in
 *                        <head>; this script wires the visible toggle
 *                        button and reflects state changes.
 *   2. Mobile drawer   — slides the sider in from the left when the
 *                        topbar's hamburger button is clicked. Esc /
 *                        scrim click closes.
 *   3. Search palette  — overlays the search input + results in a
 *                        modal-style palette. Cmd-K / Ctrl-K / `/`
 *                        opens it; Esc / scrim click / result click
 *                        closes. Search.js still owns the actual
 *                        indexing & rendering — the palette just
 *                        wraps the existing #search-input element.
 *
 * Per-page JS budget (≤ 25 KB minified) — this script is < 4 KB
 * unminified.
 */
(function () {
  if (typeof document === "undefined") return;

  // The BAI topbar may be absent on legacy F3 pages; topbar-dependent
  // wiring below is conditional so it no-ops cleanly. The global
  // keyboard shortcuts at the bottom of this file always register so
  // Cmd-K still works on pages that ship just the palette overlay.
  var topbar = document.querySelector(".bai-topbar");

  // ── Theme toggle ────────────────────────────────────────────────
  // The pre-paint bootstrap in <head> already set data-theme; here we
  // wire the visible button so the user can flip it. The button mounts
  // late (after the page renders) so the icon swap happens after the
  // initial paint without any visible flicker.
  var themeBtn = topbar ? topbar.querySelector("[data-theme-toggle]") : null;
  if (themeBtn) {
    var setTheme = function (theme) {
      var html = document.documentElement;
      if (theme === "dark") {
        html.setAttribute("data-theme", "dark");
      } else {
        html.setAttribute("data-theme", "light");
      }
      try {
        localStorage.setItem("docs-theme", theme);
      } catch (_) {}
      themeBtn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    };

    themeBtn.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      setTheme(current === "dark" ? "light" : "dark");
    });

    // Initial aria-pressed state reflects what the bootstrap chose.
    var initial = document.documentElement.getAttribute("data-theme");
    themeBtn.setAttribute(
      "aria-pressed",
      initial === "dark" ? "true" : "false",
    );
  }

  // ── Mobile drawer ───────────────────────────────────────────────
  // The topbar's menu button toggles a body class that the CSS hooks
  // into. Phase 4 ships the body-class wiring; per-viewport visual
  // behavior (the slide animation) lives in styles-web.ts.
  var menuBtn = topbar ? topbar.querySelector(".bai-topbar__menu") : null;
  var sider = document.querySelector(".doc-sidebar");
  var scrim = null;

  function ensureScrim() {
    if (scrim) return scrim;
    scrim = document.createElement("div");
    scrim.className = "bai-scrim";
    scrim.setAttribute("aria-hidden", "true");
    scrim.addEventListener("click", closeDrawer);
    document.body.appendChild(scrim);
    return scrim;
  }

  function openDrawer() {
    if (!sider) return;
    document.body.classList.add("bai-drawer-open");
    ensureScrim();
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
  }

  function closeDrawer() {
    document.body.classList.remove("bai-drawer-open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  }

  if (menuBtn && sider) {
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.addEventListener("click", function () {
      if (document.body.classList.contains("bai-drawer-open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  // ── Search palette ──────────────────────────────────────────────
  // The palette wraps #search-input + #search-results in a body-class-
  // controlled overlay. Search.js continues to handle indexing and
  // result rendering; we just toggle visibility.
  var palette = document.querySelector("[data-search-palette]");
  var paletteScrim = palette ? palette.querySelector(".bai-palette__scrim") : null;
  var paletteInput = document.getElementById("search-input");
  var triggers = document.querySelectorAll("[data-search-trigger]");

  function openPalette() {
    if (!palette) return;
    document.body.classList.add("bai-palette-open");
    palette.removeAttribute("hidden");
    palette.setAttribute("aria-hidden", "false");
    if (paletteInput) {
      // Defer focus until after the panel is visible so iOS Safari
      // honors the keyboard-show request.
      window.setTimeout(function () {
        paletteInput.focus();
        paletteInput.select && paletteInput.select();
      }, 16);
    }
  }

  function closePalette() {
    if (!palette) return;
    document.body.classList.remove("bai-palette-open");
    palette.setAttribute("aria-hidden", "true");
    palette.setAttribute("hidden", "");
    if (paletteInput) paletteInput.blur();
  }

  if (palette && paletteInput) {
    if (triggers.length) {
      Array.prototype.forEach.call(triggers, function (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          openPalette();
        });
      });
    }
    if (paletteScrim) {
      paletteScrim.addEventListener("click", openClickOnScrim);
    }

    // Click on a result inside the palette body should close the
    // palette (the link still navigates afterward).
    palette.addEventListener("click", function (e) {
      var t = e.target;
      while (t && t !== palette) {
        if (
          t.tagName === "A" &&
          (t.classList.contains("search-result-item") ||
            (t.parentNode &&
              t.parentNode.classList &&
              t.parentNode.classList.contains("search-results")))
        ) {
          closePalette();
          return;
        }
        t = t.parentNode;
      }
    });
  }

  function openClickOnScrim(e) {
    if (e.target === paletteScrim) closePalette();
  }

  // ── Global keyboard shortcuts ───────────────────────────────────
  // Cmd-K / Ctrl-K / `/` opens the palette (when not typing in another
  // input). Esc closes the palette and the drawer. We intentionally
  // run this even when neither overlay is mounted so the script is
  // resilient to partially-built pages.
  document.addEventListener("keydown", function (e) {
    var key = e.key;
    var isCmdK =
      (e.metaKey || e.ctrlKey) && (key === "k" || key === "K");
    var isSlash = key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey;
    var inField =
      document.activeElement &&
      (document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.isContentEditable);

    if (isCmdK || (isSlash && !inField)) {
      e.preventDefault();
      openPalette();
      return;
    }
    if (key === "Escape") {
      if (document.body.classList.contains("bai-palette-open")) {
        closePalette();
        return;
      }
      if (document.body.classList.contains("bai-drawer-open")) {
        closeDrawer();
        return;
      }
    }
  });
})();
