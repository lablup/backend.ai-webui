/* docs-toolkit version-mismatch UX (FR-2723).
 *
 * Two pieces of UI live here:
 *
 *   1. "View latest version" banner — injected by website-builder.ts on
 *      every NON-latest version page. Hides itself when the user clicks
 *      the dismiss button (per-session via `sessionStorage`). Has no
 *      runtime API call: the destination URL and label substitutions
 *      come from `data-` attributes on the banner element.
 *
 *   2. "Not in selected version" notice — injected hidden on EVERY
 *      versioned page (so the destination index pages all carry it).
 *      The version-switcher inline script in website-builder.ts sets a
 *      sessionStorage flag right before navigating to a fallback index;
 *      this script reads that flag on load, fills in `{version}`, and
 *      reveals the notice. Dismissal also clears the flag so refresh
 *      doesn't re-show it.
 *
 * Both pieces are language-agnostic at runtime: localized strings come
 * from `data-message-template` attributes (set at build time from
 * WEBSITE_LABELS) so this script can be content-hashed once and reused
 * across every language × every version.
 *
 * Air-gap safe: no fetches, no CDN, no external dependencies. Total
 * code budget ~1-2 KB minified. State lives only in sessionStorage so
 * it never persists across browser sessions (per FR-2723 spec).
 */
(function () {
  var BANNER_DISMISS_KEY = "docs.banner.viewLatestDismissed";
  var NOTICE_FLAG_KEY = "docs.notice.notInVersion";

  // ── "View latest version" banner ──────────────────────────────────
  function setupBanner() {
    var banner = document.querySelector(".docs-banner--view-latest");
    if (!banner) return;

    // Per-session dismissal: keyed by version pair so a dismissal on
    // 25.16 doesn't suppress the banner when navigating to 25.10.
    var current = banner.getAttribute("data-current-version") || "";
    var latest = banner.getAttribute("data-latest-version") || "";
    var dismissKey = BANNER_DISMISS_KEY + ":" + current + ":" + latest;

    var dismissed = false;
    try {
      dismissed = sessionStorage.getItem(dismissKey) === "1";
    } catch (_) {
      // sessionStorage unavailable (private mode, etc.) — show the banner anyway.
    }
    if (dismissed) {
      banner.hidden = true;
      return;
    }
    banner.hidden = false;

    var dismissBtn = banner.querySelector(".docs-banner__dismiss");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", function () {
        banner.hidden = true;
        try {
          sessionStorage.setItem(dismissKey, "1");
        } catch (_) {
          // Best effort.
        }
      });
    }
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setupBanner();
      setupNotice();
    });
  } else {
    setupBanner();
    setupNotice();
  }
})();
