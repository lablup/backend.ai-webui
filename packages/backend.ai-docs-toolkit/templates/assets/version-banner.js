/* docs-toolkit version-mismatch UX (FR-2723; banner non-dismissible per FR-2758).
 *
 * Wires up two pieces of UI:
 *
 *   1. Sticky version banner — always-on notice rendered above the doc
 *      grid on non-latest pages. The banner has no close button (FR-2758);
 *      this script's only responsibility for it is keeping the
 *      --bai-banner-h CSS variable in sync with the banner's actual
 *      rendered height so heading scroll-margin-top stays correct as
 *      the layout reflows (narrow viewports wrap the title onto two
 *      lines, etc.). Without that variable, anchor jumps land the
 *      heading underneath the sticky banner — the bug user feedback
 *      called out.
 *
 *   2. "Not in selected version" notice — injected hidden on every
 *      versioned page. The version-switcher inline script sets a
 *      sessionStorage flag right before navigating to a fallback index;
 *      this script reads that flag, fills in `{version}`, and reveals
 *      the notice. Dismissal also clears the flag so a refresh doesn't
 *      re-show the notice on an already-acknowledged page.
 *
 * Air-gap safe: no fetches, no CDN, no external dependencies. State
 * lives only in sessionStorage so it never persists across browser
 * sessions.
 */
(function () {
  var NOTICE_FLAG_KEY = "docs.notice.notInVersion";

  // ── Banner height -> --bai-banner-h CSS variable ──────────────────
  // The banner is `position: sticky; top: var(--bai-topbar-h)`, which
  // means anchor scroll targets must include the banner's height in
  // their scroll-margin-top to land below the sticky strip. We mirror
  // the banner's offsetHeight onto the document root and re-measure on
  // resize because the title wraps differently across viewport widths
  // and across languages (Korean / Japanese in particular run longer).
  function syncBannerHeight() {
    var banner = document.querySelector(".docs-banner--view-latest");
    var h = 0;
    if (banner && !banner.hidden) {
      // offsetHeight rounds to integer pixels, which is what scroll-
      // margin-top consumes. getBoundingClientRect().height would be
      // a touch more accurate on fractional layouts but the int round
      // is well within the 24px headroom the heading rule already adds.
      h = banner.offsetHeight;
    }
    document.documentElement.style.setProperty("--bai-banner-h", h + "px");
  }

  function watchBanner() {
    syncBannerHeight();
    // Catch viewport reflows (mobile rotation, browser resize) so the
    // CSS variable stays accurate as the banner rewraps.
    window.addEventListener("resize", syncBannerHeight, { passive: true });
  }

  // ── "Not in selected version" inline notice ───────────────────────
  function setupNotice() {
    var notice = document.querySelector(".docs-notice--not-in-version");
    if (!notice) return;

    var raw = null;
    try {
      raw = sessionStorage.getItem(NOTICE_FLAG_KEY);
    } catch (_) {
      // Best effort.
    }
    if (!raw) {
      notice.hidden = true;
      return;
    }

    // Flag payload is `<targetVersion>::<originSlug>`. Only the version
    // is shown to the user; the slug is kept for diagnostics.
    var parts = raw.split("::");
    var targetVersion = parts[0] || "";
    var currentVersion = notice.getAttribute("data-current-version") || "";

    // Only show the notice if we're actually viewing the target version.
    // Defends against stale flags after the user navigates away from the
    // index page (e.g. clicks into a real chapter, then back via the
    // browser).
    if (!targetVersion || targetVersion !== currentVersion) {
      notice.hidden = true;
      try {
        sessionStorage.removeItem(NOTICE_FLAG_KEY);
      } catch (_) {
        // Best effort.
      }
      return;
    }

    var template = notice.getAttribute("data-message-template") || "";
    var body = notice.querySelector(".docs-notice__body");
    if (body && template) {
      body.textContent = template.replace(/\{version\}/g, targetVersion);
    }
    notice.hidden = false;

    // Clear the flag once we've consumed it so a manual reload doesn't
    // re-show the notice on a page where the user has already seen it.
    try {
      sessionStorage.removeItem(NOTICE_FLAG_KEY);
    } catch (_) {
      // Best effort.
    }

    var dismissBtn = notice.querySelector(".docs-notice__dismiss");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", function () {
        notice.hidden = true;
      });
    }
  }

  function init() {
    watchBanner();
    setupNotice();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
