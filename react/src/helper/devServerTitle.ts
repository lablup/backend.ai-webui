/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * The tab-title prefix naming the Portless app (`VITE_DEV_SERVER_NAME`, set by
 * `scripts/dev.mjs`), so several dev-server tabs stay distinguishable. Empty
 * in production builds.
 */
export const devServerTitlePrefix = (): string =>
  import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_NAME
    ? `[${import.meta.env.VITE_DEV_SERVER_NAME}] `
    : '';
