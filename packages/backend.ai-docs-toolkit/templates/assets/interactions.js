/* docs-toolkit interactions (FR-2726 Phase 4).
 *
 * Four small UX behaviors live here so the page only ships one extra
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
 *   3. Switcher listboxes (FR-3265) — upgrades the topbar language
 *                        switcher and sidebar version switcher from
 *                        browser-default dropdowns to design-applied
 *                        listboxes. The native <select> stays in the
 *                        DOM as the value store; navigation remains
 *                        owned by the selects' validated inline
 *                        handlers (see website-builder.ts).
 *   4. Search palette  — overlays the search input + results in a
 *                        modal-style palette. Cmd-K / Ctrl-K / `/`
 *                        opens it; Esc / scrim click / result click
 *                        closes. Search.js still owns the actual
 *                        indexing & rendering — the palette just
 *                        wraps the existing #search-input element.
 *
 * Per-page JS budget (≤ 25 KB minified) — this script is < 20 KB
 * unminified (roughly a third of that is comments).
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
    // A topbar listbox popup lives inside the topbar's stacking context
    // (z 50) and can never paint above the drawer scrim/panel (z 100/101
    // at root level), so it must not stay open behind them.
    closeAnyOpenListbox();
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

  // ── Switcher listboxes (FR-3265) ────────────────────────────────
  // Progressive enhancement over the two native <select> switchers
  // (topbar language, sidebar version), implementing the APG listbox
  // pattern. The select is hidden but stays in the DOM as the value
  // store: committing a choice sets select.value and dispatches a
  // bubbling 'change', so the existing validated inline handlers —
  // version switcher: availability probe, root-depth path math, the
  // __legacy__ new-tab (noopener) branch, and the not-in-version
  // notice flag; lang switcher: full-page navigation — keep firing
  // verbatim. NO navigation logic may be duplicated here (a unit test
  // pins this). Pages without a switcher (redirect stubs,
  // preview server, legacy F3) no-op via the null guards, keeping the
  // fully-working native control as the fallback.
  //
  // At most one listbox is open at a time; the open instance's closer is
  // tracked module-scoped so the drawer toggle can dismiss it (see the
  // stacking-context note in openDrawer/openList).
  var openListboxCloser = null;
  function closeAnyOpenListbox() {
    if (openListboxCloser) openListboxCloser();
  }

  function enhanceSelect(select, variant, wrapper) {
    if (!select || !wrapper) return;

    var listId = (select.id || "bai-select-" + variant) + "-listbox";
    var selectLabel = select.getAttribute("aria-label");
    var typeBuffer = "";
    var typeTimer = 0;
    var activeIndex = -1;

    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "bai-select__trigger bai-select__trigger--" + variant;
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", listId);
    if (selectLabel) trigger.setAttribute("aria-label", selectLabel);

    var list = document.createElement("div");
    list.className = "bai-select__list bai-select__list--" + variant;
    list.id = listId;
    list.setAttribute("role", "listbox");
    list.tabIndex = -1;
    list.hidden = true;
    if (selectLabel) list.setAttribute("aria-label", selectLabel);

    var items = [];
    Array.prototype.forEach.call(select.options, function (opt, i) {
      var item = document.createElement("div");
      item.className = "bai-select__option";
      item.id = listId + "-opt-" + i;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", "false");
      item.textContent = opt.textContent;
      // Carry per-option attributes over: lang (language names are
      // written in their own script) and the unavailable-page title.
      var optLang = opt.getAttribute("lang");
      if (optLang) item.setAttribute("lang", optLang);
      if (opt.title) item.title = opt.title;
      list.appendChild(item);
      items.push(item);
    });

    // Fold the committed option into the trigger's aria-label for BOTH
    // variants ("Version switcher: v26.7.0" / "Language switcher:
    // English") so screen readers announce the current value in the
    // closed state, like the native <select> used to. aria-label wins
    // over textContent in the accessible-name computation, so the
    // version variant — which ALSO renders the value as visible pill
    // text — would otherwise announce just the static "Version
    // switcher" and drop the value. The lang trigger is a transparent
    // overlay under the existing SVG icon and carries no visible text.
    // Read from the select AFTER dispatch too — the __legacy__ inline
    // handler resets select.value synchronously.
    function syncTriggerLabel() {
      var opt = select.options[select.selectedIndex];
      var label = opt ? opt.textContent : "";
      if (selectLabel) {
        trigger.setAttribute(
          "aria-label",
          label ? selectLabel + ": " + label : selectLabel,
        );
      } else if (label) {
        trigger.setAttribute("aria-label", label);
      }
      if (variant === "version") trigger.textContent = label;
    }

    function setActive(i) {
      if (items[activeIndex]) items[activeIndex].classList.remove("is-active");
      activeIndex = i;
      var item = items[i];
      if (!item) return;
      item.classList.add("is-active");
      list.setAttribute("aria-activedescendant", item.id);
      if (item.scrollIntoView) item.scrollIntoView({ block: "nearest" });
    }

    function onOutsidePointer(e) {
      if (!wrapper.contains(e.target)) closeList(false);
    }

    function openList() {
      if (!list.hidden) return;
      // On mobile a topbar popup renders inside the topbar's stacking
      // context (z 50), which can never paint above the drawer scrim /
      // panel (z 100/101 at root level) — so close the drawer first.
      // Skip when the switcher itself lives inside the drawer (sidebar
      // version switcher): closing would hide the popup we just opened.
      if (!sider || !sider.contains(wrapper)) closeDrawer();
      closeAnyOpenListbox();
      openListboxCloser = function () {
        closeList(false);
      };
      // aria-selected mirrors the select's committed value, computed
      // on every open. __legacy__ is never select.value (the inline
      // handler resets it to current), so it never shows as selected
      // and stays re-pickable.
      for (var i = 0; i < items.length; i++) {
        items[i].setAttribute(
          "aria-selected",
          i === select.selectedIndex ? "true" : "false",
        );
      }
      list.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      setActive(select.selectedIndex >= 0 ? select.selectedIndex : 0);
      list.focus();
      // Capture phase so a click swallowed by stopPropagation elsewhere
      // still closes the popup.
      document.addEventListener("pointerdown", onOutsidePointer, true);
    }

    function closeList(refocus) {
      if (list.hidden) return;
      openListboxCloser = null;
      list.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      list.removeAttribute("aria-activedescendant");
      if (items[activeIndex]) items[activeIndex].classList.remove("is-active");
      activeIndex = -1;
      typeBuffer = "";
      document.removeEventListener("pointerdown", onOutsidePointer, true);
      if (refocus) trigger.focus();
    }

    function commit(i) {
      var opt = select.options[i];
      if (opt) {
        // Re-picking the committed value is close-only (native selects
        // don't fire change then either). __legacy__ always differs
        // from select.value, so it always dispatches.
        if (opt.value !== select.value) {
          select.value = opt.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
        syncTriggerLabel();
      }
      closeList(true);
    }

    trigger.addEventListener("click", function () {
      if (list.hidden) {
        openList();
      } else {
        closeList(true);
      }
    });

    trigger.addEventListener("keydown", function (e) {
      // Enter/Space already activate the button (click). Arrows open
      // the list per the APG pattern.
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        openList();
      }
    });

    list.addEventListener("keydown", function (e) {
      var key = e.key;
      if (key === "Escape") {
        // Stop propagation so the document-level Escape handler at the
        // bottom of this file doesn't also close the drawer behind the
        // popup in the same keypress.
        e.stopPropagation();
        e.preventDefault();
        closeList(true);
        return;
      }
      if (key === "Enter" || key === " ") {
        e.preventDefault();
        if (activeIndex >= 0) commit(activeIndex);
        return;
      }
      if (key === "ArrowDown") {
        e.preventDefault();
        setActive(Math.min(items.length - 1, activeIndex + 1));
        return;
      }
      if (key === "ArrowUp") {
        e.preventDefault();
        setActive(Math.max(0, activeIndex - 1));
        return;
      }
      if (key === "Home") {
        e.preventDefault();
        setActive(0);
        return;
      }
      if (key === "End") {
        e.preventDefault();
        setActive(items.length - 1);
        return;
      }
      if (key === "Tab") {
        // APG popup pattern: refocus the trigger, then let the default
        // Tab action run so focus moves to the control adjacent to the
        // trigger (not from <body>, where it lands if we just hide the
        // focused list).
        closeList(true);
        return;
      }
      // Type-ahead: printable keys accumulate for ~500ms; jump to the
      // first label matching the buffer as a case-insensitive prefix,
      // searching forward from the active option and wrapping.
      if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Stop propagation so printable keys that double as global
        // shortcuts (`/` opens the search palette) type-ahead here
        // instead of triggering the document-level handler.
        e.stopPropagation();
        e.preventDefault();
        typeBuffer += key.toLowerCase();
        if (typeTimer) window.clearTimeout(typeTimer);
        typeTimer = window.setTimeout(function () {
          typeBuffer = "";
        }, 500);
        // A repeated single char cycles through matches; a growing
        // buffer keeps refining from the current active option.
        var start =
          typeBuffer.length === 1 ? activeIndex + 1 : Math.max(0, activeIndex);
        for (var j = 0; j < items.length; j++) {
          var idx = (start + j) % items.length;
          var label = (items[idx].textContent || "").toLowerCase();
          if (label.indexOf(typeBuffer) === 0) {
            setActive(idx);
            break;
          }
        }
      }
    });

    list.addEventListener("click", function (e) {
      var t = e.target;
      while (t && t !== list) {
        if (t.getAttribute && t.getAttribute("role") === "option") {
          commit(items.indexOf(t));
          return;
        }
        t = t.parentNode;
      }
    });

    wrapper.addEventListener("focusout", function (e) {
      // Close when focus leaves the switcher entirely (e.g. Tab out).
      if (!e.relatedTarget || !wrapper.contains(e.relatedTarget)) {
        closeList(false);
      }
    });

    // Hide the native select only once the replacement is fully wired;
    // it remains in the DOM as the value store / change-event target.
    select.classList.add("bai-select--enhanced");
    select.setAttribute("aria-hidden", "true");
    select.tabIndex = -1;
    select.parentNode.insertBefore(trigger, select.nextSibling);
    wrapper.appendChild(list);
    syncTriggerLabel();
  }

  var langSelect = document.querySelector(".lang-switcher__select");
  enhanceSelect(
    langSelect,
    "lang",
    langSelect ? langSelect.closest(".lang-switcher") : null,
  );
  var versionSelect = document.getElementById("version-switcher");
  enhanceSelect(
    versionSelect,
    "version",
    versionSelect ? versionSelect.closest(".doc-sidebar-version") : null,
  );

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

    // Skip keys another handler already claimed (e.g. listbox type-ahead).
    if ((isCmdK || (isSlash && !inField)) && !e.defaultPrevented) {
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
