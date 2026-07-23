/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * In dev mode, prefix the browser tab title with the Portless app name
 * (e.g. the FR issue number or a session name) that `scripts/dev.mjs` injects
 * as `VITE_DEV_SERVER_NAME`, so multiple dev-server tabs opened in one browser
 * are distinguishable.
 *
 * Guarded by `import.meta.env.DEV`: in production builds the branch is
 * dead-code-eliminated and the static `Backend.AI` title from `index.html` is
 * preserved. Mirrors the `VITE_THEME_HEADER_COLOR` dev-only env pattern in
 * `customThemeConfig.ts`.
 *
 * Prefixes the *existing* `document.title` (rather than hard-coding the base)
 * so it never drifts from `index.html`, and is idempotent — re-invoking it
 * (e.g. on HMR) does not double-prefix.
 */
export const applyDevServerTitle = () => {
  if (import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_NAME) {
    const prefix = `[${import.meta.env.VITE_DEV_SERVER_NAME}] `;
    if (!document.title.startsWith(prefix)) {
      document.title = `${prefix}${document.title}`;
    }
  }
};
