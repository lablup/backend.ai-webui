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
 * Returns the title unchanged outside dev, and is idempotent — re-prefixing an
 * already-prefixed title is a no-op.
 */
export const withDevServerTitlePrefix = (title: string): string => {
  if (!import.meta.env.DEV || !import.meta.env.VITE_DEV_SERVER_NAME) {
    return title;
  }
  const prefix = `[${import.meta.env.VITE_DEV_SERVER_NAME}] `;
  return title.startsWith(prefix) ? title : `${prefix}${title}`;
};

/**
 * Applies the dev prefix to the *existing* `document.title` (rather than
 * hard-coding the base) so it never drifts from `index.html`. Route-driven
 * titles go through `withDevServerTitlePrefix` in `RouteDocumentTitle`
 * instead, which keeps the prefix across navigations.
 */
export const applyDevServerTitle = () => {
  const next = withDevServerTitlePrefix(document.title);
  if (next !== document.title) {
    document.title = next;
  }
};
