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

  function makeButton(labels) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "doc-code-copy-btn";
    btn.setAttribute("aria-label", labels.copy);
    btn.setAttribute("data-state", "idle");
    btn.textContent = labels.copy;
    return btn;
  }

  function flash(btn, label, state, restore, labels) {
    btn.textContent = label;
    btn.setAttribute("data-state", state);
    btn.setAttribute("aria-label", label);
    if (btn.__resetTimer) clearTimeout(btn.__resetTimer);
    btn.__resetTimer = setTimeout(function () {
      btn.textContent = restore;
      btn.setAttribute("data-state", "idle");
      btn.setAttribute("aria-label", labels.copy);
    }, 1500);
  }

  function attach(pre, labels) {
    if (pre.__copyAttached) return;
    pre.__copyAttached = true;

    /* Wrap the <pre> so the absolutely-positioned button sits in the same
     * stacking context. Skip if a wrapper already exists (idempotent). */
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

    var btn = makeButton(labels);
    wrapper.appendChild(btn);

    btn.addEventListener("click", function () {
      var text = extractCode(pre);
      copyText(text).then(
        function () {
          flash(btn, labels.copied, "copied", labels.copy, labels);
        },
        function () {
          flash(btn, labels.failed, "failed", labels.copy, labels);
        },
      );
    });
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
