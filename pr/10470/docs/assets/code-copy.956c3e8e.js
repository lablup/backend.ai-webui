/* docs-toolkit code-block "Copy" button (F4).
 *
 * For every <pre> rendered by Shiki (marked with .doc-code-block, or any
 * <pre><code>) we inject a small button. Click → copy the raw code text to
 * the clipboard via navigator.clipboard.writeText, then flash a transient
 * "Copied!" label so the user gets feedback.
 *
 * Constraints:
 *   - No framework, no external dependencies — vanilla DOM only.
 *   - Air-gapped: navigator.clipboard is browser-native; no network access.
 *   - Localized labels are read from data-* attributes on the wrapper so the
 *     script itself stays language-agnostic and content-hashed once across
 *     every language.
 *   - Per-page JS budget (≤ 25 KB minified) — this script is < 2 KB
 *     unminified.
 */
(function () {
  if (typeof document === "undefined") return;

  function getLabels(root) {
    var labels = {
      copy: "Copy",
      copied: "Copied!",
      failed: "Copy failed",
    };
    if (!root) return labels;
    if (root.getAttribute("data-copy-label"))
      labels.copy = root.getAttribute("data-copy-label");
    if (root.getAttribute("data-copied-label"))
      labels.copied = root.getAttribute("data-copied-label");
    if (root.getAttribute("data-copy-failed-label"))
      labels.failed = root.getAttribute("data-copy-failed-label");
    return labels;
  }

  /* Extract the source text from a <pre><code> node. We prefer .textContent
   * over innerText so newlines are preserved exactly as authored. Shiki wraps
   * each token in <span style="color:..."> elements; .textContent collapses
   * those into a clean source string. */
  function extractCode(pre) {
    var code = pre.querySelector("code");
    var text = (code || pre).textContent || "";
    /* Strip a single trailing newline that some renderers emit so the
     * clipboard contents don't gain a blank tail line on every paste. */
    return text.replace(/\n$/, "");
  }

  function fallbackCopy(text) {
    /* navigator.clipboard requires a secure context (https / localhost).
     * The static docs site is normally served over https, but operators may
     * preview from a plain-http LAN host — fall back to a hidden textarea +
     * document.execCommand('copy') so the button still works there. */
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    var prevSelection = document.getSelection();
    var prevRange =
      prevSelection && prevSelection.rangeCount > 0
        ? prevSelection.getRangeAt(0)
        : null;
    ta.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (_e) {
      ok = false;
    }
    document.body.removeChild(ta);
    if (prevRange && prevSelection) {
      prevSelection.removeAllRanges();
      prevSelection.addRange(prevRange);
    }
    return ok
      ? Promise.resolve()
      : Promise.reject(new Error("execCommand failed"));
  }

  function copyText(text) {
    if (
      navigator &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      return navigator.clipboard.writeText(text);
    }
    return fallbackCopy(text);
  }

  /* SVG icons. Inline so no extra HTTP request and no font dependency.
   * The 16-unit viewBox keeps stroke weight crisp on high-DPI without
   * scaling artifacts; CSS sizes the rendered icon to 14×14 CSS px via
   * `.doc-code-copy-btn svg`. */
  var ICONS = {
    idle:
      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" ' +
      'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true">' +
      '<rect x="5" y="5" width="9" height="9" rx="1.5"/>' +
      '<path d="M3 11V3.5A1.5 1.5 0 0 1 4.5 2H11"/>' +
      "</svg>",
    copied:
      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" ' +
      'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true">' +
      '<path d="M3 8.5l3.2 3.2L13 5"/>' +
      "</svg>",
    failed:
      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" ' +
      'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true">' +
      '<path d="M4 4l8 8M12 4l-8 8"/>' +
      "</svg>",
  };

  function setIcon(btn, state) {
    btn.innerHTML = ICONS[state] || ICONS.idle;
  }

  function makeButton(labels) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "doc-code-copy-btn";
    btn.setAttribute("aria-label", labels.copy);
    btn.setAttribute("data-state", "idle");
    setIcon(btn, "idle");
    return btn;
  }

  function flash(btn, label, state, labels) {
    setIcon(btn, state);
    btn.setAttribute("data-state", state);
    btn.setAttribute("aria-label", label);
    if (btn.__resetTimer) clearTimeout(btn.__resetTimer);
    btn.__resetTimer = setTimeout(function () {
      setIcon(btn, "idle");
      btn.setAttribute("data-state", "idle");
      btn.setAttribute("aria-label", labels.copy);
    }, 1500);
  }

  function attach(pre, labels) {
    if (pre.__copyAttached) return;
    pre.__copyAttached = true;

    /* Decide where the copy button lives:
     *   1. Server-rendered titled wrapper (.code-block-wrapper with a
     *      .code-block-title bar) — append the button into the title bar
     *      so it sits inline at the bar's right edge (CSS drops the
     *      absolute positioning for this case).
     *   2. Bare <pre> — wrap with a fresh .doc-code-block-wrapper so the
     *      absolutely-positioned button has a stacking context, then
     *      append the button inside that wrapper.
     * Idempotent: a second pass over the same <pre> bails out via the
     *   pre.__copyAttached guard at the top of attach(). */
    var titledWrapper =
      pre.parentNode &&
      pre.parentNode.classList &&
      pre.parentNode.classList.contains("code-block-wrapper")
        ? pre.parentNode
        : null;

    var btn = makeButton(labels);

    if (titledWrapper) {
      var titleBar = titledWrapper.querySelector(".code-block-title");
      if (titleBar) {
        titleBar.appendChild(btn);
      } else {
        titledWrapper.appendChild(btn);
      }
    } else {
      var wrapper;
      if (
        pre.parentNode &&
        pre.parentNode.classList &&
        pre.parentNode.classList.contains("doc-code-block-wrapper")
      ) {
        wrapper = pre.parentNode;
      } else {
        wrapper = document.createElement("div");
        wrapper.className = "doc-code-block-wrapper";
        var parent = pre.parentNode;
        if (!parent) return;
        parent.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
      }
      wrapper.appendChild(btn);
    }

    btn.addEventListener("click", function () {
      var text = extractCode(pre);
      copyText(text).then(
        function () {
          flash(btn, labels.copied, "copied", labels);
        },
        function () {
          flash(btn, labels.failed, "failed", labels);
        },
      );
    });

    /* Force a permanent slim horizontal scrollbar on overflowing blocks.
     * Pure CSS can't do this in Safari: even with -webkit-appearance: none
     * on ::-webkit-scrollbar, Safari respects the macOS "Show scroll bars"
     * system setting and fades the bar out when idle, so users miss the
     * scroll affordance on long lines. The only spec-guaranteed way to
     * pin the bar is overflow: scroll — but applying it unconditionally
     * leaves a 8px gutter on every short non-overflowing block.
     *
     * Solution: detect real overflow per <pre> and toggle a class. CSS
     * upgrades the matching <pre> from overflow-x: auto to scroll, which
     * forces Safari (and any other overlay-default browser) to keep the
     * bar visible. ResizeObserver re-checks on container resize / sidebar
     * collapse / window resize / late font load. */
    function syncOverflow() {
      var overflows = pre.scrollWidth > pre.clientWidth + 1;
      pre.classList.toggle("has-x-overflow", overflows);
    }
    syncOverflow();
    if (typeof ResizeObserver !== "undefined") {
      try {
        new ResizeObserver(syncOverflow).observe(pre);
      } catch (_) {
        /* Defensive: a few embedded WebViews stub ResizeObserver. */
      }
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncOverflow).catch(function () {});
    }
    window.addEventListener("resize", syncOverflow, { passive: true });
  }

  function init() {
    var root =
      document.querySelector("[data-copy-label], [data-copied-label]") ||
      document.body;
    var labels = getLabels(root);
    /* Target every <pre> the markdown renderer produced. Shiki output uses
     * <pre class="shiki ..."><code>…</code></pre>; legacy non-highlighted
     * code blocks are plain <pre><code>. Both shapes match this query. */
    var pres = document.querySelectorAll("pre > code");
    for (var i = 0; i < pres.length; i++) {
      var pre = pres[i].parentNode;
      if (pre && pre.tagName && pre.tagName.toLowerCase() === "pre") {
        attach(pre, labels);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
