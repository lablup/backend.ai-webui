/**
 * Web stylesheet generator (FR-2726 — Backend.AI design system).
 *
 * Phase 1 replaces the legacy Infima palette with Backend.AI design
 * tokens (orange `#FF7A00` primary, teal `#00BD9B` success, IBM Plex
 * Sans KR + JetBrains Mono typography), adds a `[data-theme="dark"]`
 * surface, and threads through consumer-tunable branding (primary
 * color override). The legacy `--ifm-*` variable names are kept as
 * aliases that resolve to BAI tokens, so every existing class rule in
 * this file (and any external consumer) keeps working untouched —
 * subsequent phases will introduce new components that consume the
 * `--bai-*` tokens directly.
 */

import {
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_PRIMARY_COLOR_ACTIVE,
  DEFAULT_PRIMARY_COLOR_HOVER,
  DEFAULT_PRIMARY_COLOR_SOFT,
  validateCssColor,
} from "./config.js";

const CJK_LANGS = new Set(["ko", "ja", "zh", "zh-CN", "zh-TW"]);

/**
 * Subset of `ResolvedBrandingConfig` consumed by the stylesheet. The
 * generator validates each value before interpolating into the emitted
 * CSS (FR-2726).
 */
export interface StyleBrandingTokens {
  primaryColor?: string;
  primaryColorHover?: string;
  primaryColorActive?: string;
  primaryColorSoft?: string;
}

export function generateWebStyles(
  lang?: string,
  branding?: StyleBrandingTokens,
): string {
  const isCjk = lang ? CJK_LANGS.has(lang) : false;

  // Validate every interpolated color so a misconfigured value cannot
  // break out of the surrounding declaration and inject CSS rules.
  const safe = (
    value: string | undefined,
    field: string,
    fallback: string,
  ): string => (value ? validateCssColor(value, field) : fallback);
  const primary = safe(
    branding?.primaryColor,
    "branding.primaryColor",
    DEFAULT_PRIMARY_COLOR,
  );
  const primaryHover = safe(
    branding?.primaryColorHover,
    "branding.primaryColorHover",
    DEFAULT_PRIMARY_COLOR_HOVER,
  );
  const primaryActive = safe(
    branding?.primaryColorActive,
    "branding.primaryColorActive",
    DEFAULT_PRIMARY_COLOR_ACTIVE,
  );
  const primarySoft = safe(
    branding?.primaryColorSoft,
    "branding.primaryColorSoft",
    DEFAULT_PRIMARY_COLOR_SOFT,
  );

  return `
/* Backend.AI Web UI Manual — Phase 1 (FR-2726)
   Typography from Google Fonts. The @import is the first declaration
   so the loader fires before any text renders. CJK fallback chain is
   kept for offline/airgapped builds where Google Fonts may be blocked. */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');

/* ==========================================================================
   Backend.AI Design Tokens (Phase 1 — FR-2726)
   --------------------------------------------------------------------------
   The \`--bai-*\` tokens are the source of truth. The \`--ifm-*\` aliases
   below map them onto the Infima variable names so all legacy rules in
   this file (and any external consumer that still references
   \`--ifm-*\`) keep working unchanged.
   ========================================================================== */
:root {
  /* Brand */
  --bai-primary: ${primary};
  --bai-primary-hover: ${primaryHover};
  --bai-primary-active: ${primaryActive};
  --bai-primary-soft: ${primarySoft};

  /* Semantic */
  --bai-success: #00BD9B;
  --bai-warning: #FFBF00;
  --bai-danger: #BB1F1F;
  --bai-info: #2A99B8;

  /* Typography */
  --bai-font-sans: 'IBM Plex Sans KR', 'IBM Plex Sans', system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", "Noto Sans KR", "Noto Sans CJK KR", "Noto Sans JP", "Noto Sans CJK JP", "Noto Sans TC", "Noto Sans CJK TC", "Noto Sans Thai", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --bai-font-heading: 'IBM Plex Sans KR', 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  --bai-font-mono: 'JetBrains Mono', 'IBM Plex Mono', SFMono-Regular, Menlo, Consolas, "Liberation Mono", "Courier New", ui-monospace, monospace;
  --bai-type-scale: 1;

  /* Neutral surface */
  --bai-bg: #FFFFFF;
  --bai-bg-muted: #FAFAFA;
  --bai-bg-subtle: #F5F5F5;
  --bai-bg-sider: #FCFCFC;
  --bai-border: #E8E8E8;
  --bai-border-soft: #F0F0F0;
  --bai-text: #141414;
  --bai-text-2: #595959;
  --bai-text-3: #8C8C8C;
  --bai-text-4: #BFBFBF;

  /* Elevation + shape */
  --bai-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --bai-shadow-md: 0 4px 14px rgba(0, 0, 0, 0.07);
  --bai-shadow-lg: 0 18px 48px rgba(0, 0, 0, 0.18);
  --bai-radius-sm: 4px;
  --bai-radius: 8px;
  --bai-radius-lg: 12px;

  /* ── Infima aliases (legacy) ──────────────────────────────── */
  --ifm-color-primary: var(--bai-primary);
  --ifm-color-primary-dark: var(--bai-primary-active);
  --ifm-color-primary-light: var(--bai-primary-hover);
  --ifm-color-primary-lighter: var(--bai-primary-hover);
  --ifm-color-primary-lightest: var(--bai-primary-soft);
  --ifm-color-primary-darkest: #B34A00;
  --ifm-color-primary-darker: var(--bai-primary-active);

  --ifm-color-success: var(--bai-success);
  --ifm-color-success-light: #1FCEAD;
  --ifm-color-success-dark: #009C80;

  --ifm-color-info: var(--bai-info);
  --ifm-color-info-light: #4FB1CC;
  --ifm-color-info-dark: #1F7E97;

  --ifm-color-warning: var(--bai-warning);
  --ifm-color-warning-light: #FFD747;
  --ifm-color-warning-dark: #B88A00;

  --ifm-color-danger: var(--bai-danger);
  --ifm-color-danger-light: #DC3535;
  --ifm-color-danger-dark: #8E1717;

  --ifm-color-secondary: var(--bai-bg-subtle);
  --ifm-color-emphasis-0: var(--bai-bg);
  --ifm-color-emphasis-100: var(--bai-bg-muted);
  --ifm-color-emphasis-200: var(--bai-border-soft);
  --ifm-color-emphasis-300: var(--bai-border);
  --ifm-color-emphasis-400: #DCDCDC;
  --ifm-color-emphasis-500: var(--bai-text-4);
  --ifm-color-emphasis-600: var(--bai-text-3);
  --ifm-color-emphasis-700: var(--bai-text-2);
  --ifm-color-emphasis-800: #424242;
  --ifm-color-emphasis-900: var(--bai-text);
  --ifm-color-emphasis-1000: #000;

  --ifm-font-family-base: var(--bai-font-sans);
  --ifm-font-family-monospace: var(--bai-font-mono);

  --ifm-font-size-base: 100%;
  --ifm-font-weight-light: 300;
  --ifm-font-weight-normal: 400;
  --ifm-font-weight-semibold: 500;
  --ifm-font-weight-bold: 700;

  --ifm-line-height-base: 1.65;
  --ifm-global-spacing: 1rem;
  --ifm-spacing-vertical: var(--ifm-global-spacing);
  --ifm-spacing-horizontal: var(--ifm-global-spacing);

  --ifm-heading-font-weight: 700;
  --ifm-heading-line-height: 1.25;
  --ifm-heading-margin-top: 0;
  --ifm-heading-margin-bottom: var(--ifm-spacing-vertical);
  --ifm-h1-font-size: 2rem;
  --ifm-h2-font-size: 1.5rem;
  --ifm-h3-font-size: 1.25rem;
  --ifm-h4-font-size: 1rem;
  --ifm-h5-font-size: 0.875rem;
  --ifm-h6-font-size: 0.85rem;

  --ifm-code-font-size: 90%;
  --ifm-code-background: #f6f7f8;
  --ifm-code-border-radius: 0.25rem;
  --ifm-code-padding-vertical: 0.1rem;
  --ifm-code-padding-horizontal: 0.35rem;

  --ifm-pre-background: #f6f7f8;
  --ifm-pre-border-radius: 0.4rem;
  --ifm-pre-padding: 1rem;
  --ifm-pre-line-height: 1.45;

  --ifm-table-cell-padding: 0.75rem;
  --ifm-table-border-width: 1px;
  --ifm-table-border-color: var(--ifm-color-emphasis-300);
  --ifm-table-stripe-background: var(--ifm-color-emphasis-100);
  --ifm-table-head-background: inherit;
  --ifm-table-head-font-weight: 700;

  --ifm-blockquote-border-left-width: 2px;
  --ifm-blockquote-border-color: var(--ifm-color-emphasis-300);
  --ifm-blockquote-padding-horizontal: 1rem;
  --ifm-blockquote-color: var(--ifm-color-emphasis-800);

  --ifm-hr-border-color: var(--ifm-color-emphasis-200);
  --ifm-hr-border-width: 1px;

  --ifm-link-color: var(--ifm-color-primary);
  --ifm-link-hover-color: var(--ifm-color-primary-dark);

  --ifm-alert-border-width: 0;
  --ifm-alert-border-left-width: 5px;
  --ifm-alert-border-radius: 0.4rem;
  --ifm-alert-padding-vertical: 1rem;
  --ifm-alert-padding-horizontal: 1.2rem;

  /* Layout (FR-2726 Phase 2) */
  --bai-topbar-h: 56px;
  --bai-sider-w: 280px;
  --bai-toc-w: 240px;
  --bai-content-max: 820px;
  --bai-gutter: 32px;

  /* Legacy aliases used by F3 grid rules (resolve to BAI tokens). */
  --doc-sidebar-width: var(--bai-sider-w);
  --doc-toc-width: var(--bai-toc-w);
}

/* ==========================================================================
   Dark mode (Phase 1 surface — toggle UI ships in Phase 4)
   --------------------------------------------------------------------------
   Two opt-in routes:
     1. \`<html data-theme="dark">\` — explicit override (set by Phase 4
        toggle persisted in localStorage).
     2. \`prefers-color-scheme: dark\` — passive default. The toggle, when
        it lands, will write a sentinel \`data-theme\` value to opt out.
   The selector below covers both without giving the OS preference
   priority over an explicit user choice.
   ========================================================================== */
[data-theme="dark"] {
  --bai-bg: #0E0E10;
  --bai-bg-muted: #141417;
  --bai-bg-subtle: #1A1A1F;
  --bai-bg-sider: #111114;
  --bai-border: #2A2A30;
  --bai-border-soft: #1F1F25;
  --bai-text: #F0F0F0;
  --bai-text-2: #B5B5BD;
  --bai-text-3: #7E7E89;
  --bai-text-4: #4F4F58;
  --bai-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
  --bai-shadow-md: 0 4px 14px rgba(0, 0, 0, 0.45);
  --bai-shadow-lg: 0 18px 48px rgba(0, 0, 0, 0.6);
  /* Dark-mode soft fill is derived from the resolved primary via
     color-mix() so the tint stays in sync when consumers override
     branding.primaryColor. Browsers without color-mix() simply
     keep the light-mode --bai-primary-soft value (still readable). */
  --bai-primary-soft: color-mix(in srgb, var(--bai-primary) 12%, transparent);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --bai-bg: #0E0E10;
    --bai-bg-muted: #141417;
    --bai-bg-subtle: #1A1A1F;
    --bai-bg-sider: #111114;
    --bai-border: #2A2A30;
    --bai-border-soft: #1F1F25;
    --bai-text: #F0F0F0;
    --bai-text-2: #B5B5BD;
    --bai-text-3: #7E7E89;
    --bai-text-4: #4F4F58;
    --bai-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
    --bai-shadow-md: 0 4px 14px rgba(0, 0, 0, 0.45);
    --bai-shadow-lg: 0 18px 48px rgba(0, 0, 0, 0.6);
    /* Same color-mix derivation as the explicit dark theme block. */
    --bai-primary-soft: color-mix(in srgb, var(--bai-primary) 12%, transparent);
  }
}

/* ==========================================================================
   Reset & Base
   ========================================================================== */
*, *::before, *::after {
  box-sizing: border-box;
}

html {
  font-size: var(--ifm-font-size-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  font-family: var(--bai-font-sans);
  font-size: 1rem;
  line-height: var(--ifm-line-height-base);
  color: var(--bai-text);
  background: var(--bai-bg);
  margin: 0;
  padding: 0;
  ${isCjk ? "word-break: keep-all;" : ""}
  overflow-wrap: break-word;
}

/* ==========================================================================
   Topbar (Phase 2 — FR-2726)
   --------------------------------------------------------------------------
   The topbar sits above the page grid as a sticky 56px strip with the
   brand on the left, a center search trigger (host for the existing
   search input until Phase 4 introduces a Cmd-K palette), and an
   actions cluster on the right (lang switcher, version selector, GitHub
   icon). The mobile menu icon and the search icon are hidden on
   desktop and revealed on narrower viewports — see the responsive
   block near the end of this file.
   ========================================================================== */
.bai-topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 14px;
  height: var(--bai-topbar-h);
  padding: 0 20px;
  background: var(--bai-bg);
  border-bottom: 1px solid var(--bai-border);
}

.bai-topbar__menu {
  display: none;
}

.bai-topbar__brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  color: var(--bai-text);
  text-decoration: none;
}

.bai-topbar__brand:hover {
  text-decoration: none;
  color: var(--bai-text);
}

.bai-brand-logo {
  height: 22px;
  width: auto;
  display: block;
}

.bai-brand-fallback {
  font-family: var(--bai-font-heading);
  font-weight: 600;
  font-size: 15px;
  color: var(--bai-text);
}

.bai-brand-divider {
  width: 1px;
  height: 18px;
  background: var(--bai-border);
}

.bai-brand-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--bai-text-3);
  letter-spacing: -0.005em;
}

.bai-brand-version {
  font-family: var(--bai-font-mono);
  font-size: 10.5px;
  color: var(--bai-text-3);
  background: var(--bai-bg-subtle);
  border: 1px solid var(--bai-border);
  padding: 2px 7px;
  border-radius: 999px;
  margin-left: 4px;
}

/* Topbar search — hosts \`#search-input\` (which the existing search.js
   binds to). When Phase 4 lands, this trigger becomes a Cmd-K-style
   button that opens a palette; until then the input stays inline so
   typing-to-search keeps working without any JS changes. */
.bai-topbar__search {
  flex: 1;
  max-width: 520px;
  margin: 0 auto;
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 36px;
  padding: 0 12px 0 14px;
  border: 1px solid var(--bai-border);
  border-radius: var(--bai-radius);
  background: var(--bai-bg-muted);
  color: var(--bai-text-3);
  font: inherit;
  font-size: 13px;
  cursor: text;
  transition: border-color 0.15s, background 0.15s;
}

.bai-topbar__search:hover,
.bai-topbar__search:focus-within {
  border-color: var(--bai-primary);
  background: var(--bai-bg);
}

.bai-topbar__search > svg {
  flex-shrink: 0;
  color: var(--bai-text-3);
}

.bai-topbar__search input {
  flex: 1;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 13px;
  color: var(--bai-text);
  outline: none;
  padding: 0;
  min-width: 0;
}

.bai-topbar__search input::placeholder {
  color: var(--bai-text-3);
}

.bai-kbd-group {
  display: inline-flex;
  gap: 3px;
  flex-shrink: 0;
}

.bai-topbar__search kbd,
.bai-kbd-group kbd {
  font-family: var(--bai-font-mono);
  font-size: 10.5px;
  background: var(--bai-bg);
  border: 1px solid var(--bai-border);
  border-bottom-width: 2px;
  padding: 1px 6px;
  border-radius: 4px;
  color: var(--bai-text-2);
  min-width: 18px;
  text-align: center;
  line-height: 1.4;
}

.bai-topbar .bai-topbar__searchicon {
  display: none;
}

.bai-topbar__actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  margin-left: auto;
}

.bai-iconbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  min-width: 32px;
  padding: 0 8px;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: var(--bai-text-2);
  border-radius: 6px;
  font: inherit;
  text-decoration: none;
}

.bai-iconbtn:hover {
  background: var(--bai-bg-subtle);
  color: var(--bai-text);
  text-decoration: none;
}

/* Search results dropdown anchored to the topbar search container. */
.bai-topbar__search .search-results {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--bai-bg);
  border: 1px solid var(--bai-border);
  border-radius: var(--bai-radius);
  box-shadow: var(--bai-shadow-md);
  max-height: 420px;
  overflow-y: auto;
  z-index: 60;
}

/* ==========================================================================
   Page Layout — F3 three-column grid (rebased on BAI tokens — Phase 2)
   --------------------------------------------------------------------------
   Desktop: [sidebar] [main, max ~820px] [right-rail TOC, fixed width].
   The topbar sits above this grid (sticky, 56px), so the sider/TOC are
   sticky relative to (100vh - topbar-height).
   ========================================================================== */
.doc-page {
  display: grid;
  grid-template-columns: var(--bai-sider-w) minmax(0, 1fr) var(--bai-toc-w);
  align-items: stretch;
  min-height: calc(100vh - var(--bai-topbar-h));
}

.doc-sidebar {
  position: sticky;
  top: var(--bai-topbar-h);
  height: calc(100vh - var(--bai-topbar-h));
  overflow-y: auto;
  border-right: 1px solid var(--bai-border);
  background: var(--bai-bg-sider);
  padding: 10px 8px 24px;
}

.doc-sidebar::-webkit-scrollbar {
  width: 8px;
}
.doc-sidebar::-webkit-scrollbar-thumb {
  background: var(--bai-border);
  border-radius: 4px;
}

/* Sidebar header (legacy F3) — Phase 2 hides it; the topbar carries the
   product brand and version pill now. The structural HTML stays so
   downstream consumers that haven't migrated still get a working page. */
.doc-sidebar-header {
  display: none;
}

/* Search input — Phase 2 moves this into the topbar. The original
   .doc-search wrapper still exists in the DOM for backwards compat
   when consumers haven't run the new builder yet, so keep the legacy
   styling in place behind a guard. */
.doc-sidebar > .doc-search {
  padding: 8px 12px 12px;
  position: relative;
  border-bottom: 1px solid var(--bai-border-soft);
  margin-bottom: 6px;
}

.doc-sidebar > .doc-search input {
  width: 100%;
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  border: 1px solid var(--bai-border);
  border-radius: var(--bai-radius-sm);
  background: var(--bai-bg);
  outline: none;
  font-family: var(--bai-font-sans);
}

.doc-sidebar > .doc-search input:focus {
  border-color: var(--bai-primary);
  box-shadow: 0 0 0 2px var(--bai-primary-soft);
}

/* Generic search-results dropdown styling. The topbar's search container
   overrides positioning so the dropdown anchors to the input rather than
   to the legacy .doc-search wrapper. */
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bai-bg);
  border: 1px solid var(--bai-border);
  border-radius: var(--bai-radius);
  box-shadow: var(--bai-shadow-md);
  max-height: 420px;
  overflow-y: auto;
  z-index: 100;
}

.search-result-item {
  display: block;
  padding: 0.6rem 0.8rem;
  text-decoration: none;
  border-bottom: 1px solid var(--ifm-color-emphasis-100);
  transition: background 0.1s;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover,
.search-result-item:focus {
  background: var(--ifm-color-emphasis-100);
  text-decoration: none;
  outline: 2px solid var(--ifm-color-primary);
  outline-offset: -2px;
}

.search-result-title {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--ifm-color-primary);
  margin-bottom: 0.15rem;
}

.search-result-snippet {
  font-size: 0.75rem;
  color: var(--ifm-color-emphasis-600);
  line-height: 1.4;
}

.search-no-results {
  padding: 0.8rem;
  font-size: 0.85rem;
  color: var(--ifm-color-emphasis-600);
  text-align: center;
}

/* F3: sidebar nav. Two render modes share the same .doc-sidebar-nav
   ruleset:
     1. Grouped (default for F3) — wrapped in details.doc-sidebar-group
        with a summary header per category.
     2. Ungrouped (legacy flat config) — a single .doc-sidebar-nav directly
        under .doc-sidebar-groups, no details wrapper.
   The H2 sub-list inside the active sidebar entry is gone — that data lives
   in the right-rail TOC now. */
.doc-sidebar-groups {
  padding: 0;
  margin: 0;
}

.doc-sidebar-group {
  /* Override the global <details> rule so groups don't render the rounded
     bordered card style — they're navigation, not callouts. */
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
}

.doc-sidebar-group > summary,
.doc-sidebar-group__summary {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 6px;
  font-family: var(--bai-font-sans);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--bai-text-3);
  user-select: none;
  list-style: none;
  position: relative;
}

/* Category icon (Phase 2 — FR-2726). Sits at the start of the summary
   so it never collides with the disclosure caret on the right. */
.doc-sidebar-group__icon {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--bai-text-3);
}

/* Category label fills the available space; the icon is on its left
   and the count pill on its right. */
.doc-sidebar-group__label {
  flex: 1 1 auto;
  text-align: left;
}

/* Item count pill — the small monospace number on the right side of the
   category summary. Clearly delineated from text via the muted bg. */
.doc-sidebar-group__count {
  flex-shrink: 0;
  font-family: var(--bai-font-mono);
  font-weight: 400;
  font-size: 10.5px;
  letter-spacing: 0;
  color: var(--bai-text-4);
  background: var(--bai-bg-subtle);
  padding: 1px 6px;
  border-radius: 999px;
}

/* Hide the default disclosure triangle — we draw our own caret below. */
.doc-sidebar-group > summary::-webkit-details-marker {
  display: none;
}
.doc-sidebar-group > summary::marker {
  display: none;
  content: "";
}

.doc-sidebar-group > summary::after {
  content: "";
  width: 0.5rem;
  height: 0.5rem;
  border-right: 1.5px solid var(--bai-text-3);
  border-bottom: 1.5px solid var(--bai-text-3);
  transform: rotate(-45deg);
  transition: transform 120ms ease;
  flex-shrink: 0;
  margin-left: 4px;
  margin-top: -2px;
}

.doc-sidebar-group[open] > summary::after {
  transform: rotate(45deg);
  margin-top: -4px;
}

.doc-sidebar-group > summary:hover {
  background: var(--bai-bg-subtle);
  color: var(--bai-text-2);
}

.doc-sidebar-group[open] > summary {
  margin-bottom: 0.25rem;
}

.doc-sidebar-nav {
  list-style: none;
  padding: 0;
  margin: 2px 0 8px;
  position: relative;
}

/* Connector line between category and items — same visual idiom as the
   BAI sider in the main app. */
.doc-sidebar-nav--grouped::before {
  content: "";
  position: absolute;
  left: 19px;
  top: 4px;
  bottom: 4px;
  width: 1px;
  background: var(--bai-border-soft);
}

.doc-sidebar-nav > li {
  margin: 0;
}

.doc-sidebar-nav > li > a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 12px 7px 28px;
  border-radius: 6px;
  color: var(--bai-text-2);
  font-size: 13.5px;
  font-weight: 400;
  text-decoration: none;
  position: relative;
  margin: 1px 0;
  transition: background 0.15s, color 0.15s;
}

.doc-sidebar-nav--grouped > li > a {
  /* Reset: indentation + bullet are produced by ::before on the link. */
  padding-left: 28px;
}

.doc-sidebar-nav > li > a::before {
  content: "";
  position: absolute;
  left: 17px;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--bai-border);
  transition: background 0.15s, width 0.15s, height 0.15s;
}

.doc-sidebar-nav > li > a:hover {
  background: var(--bai-bg-subtle);
  color: var(--bai-text);
  text-decoration: none;
}

.doc-sidebar-nav > li > a:hover::before {
  background: var(--bai-text-3);
}

.doc-sidebar-nav > li > a.active {
  background: var(--bai-primary-soft);
  color: var(--bai-primary);
  font-weight: 500;
}

.doc-sidebar-nav > li > a.active::before {
  background: var(--bai-primary);
  width: 6px;
  height: 6px;
}

/* NEW badge (FR-2726). Rendered on the sidebar nav item to highlight
   recently added pages. The data attribute trick lets consumers set
   data-new="true" on a nav LI via book-config without changing HTML —
   Phase 2 ships the styling; per-page tagging arrives later. */
.doc-sidebar-nav .bai-badge {
  margin-left: auto;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 1px 6px;
  border-radius: 999px;
  font-family: var(--bai-font-sans);
}

.doc-sidebar-nav .bai-badge--new {
  background: rgba(0, 189, 155, 0.12);
  color: var(--bai-success);
}

.doc-main {
  min-width: 0;
  max-width: var(--bai-content-max);
  width: 100%;
  margin: 0 auto;
  padding: 28px var(--bai-gutter) 80px;
}

@media (min-width: 1181px) {
  /* When the right rail isn't shown we still cap the article width so
     prose doesn't stretch. The grid keeps the column flexible; this
     just bounds the inner content. */
  .doc-main {
    max-width: var(--bai-content-max);
  }
}

/* ==========================================================================
   Typography & Headings
   ========================================================================== */
h1, h2, h3, h4, h5, h6 {
  font-weight: var(--ifm-heading-font-weight);
  line-height: var(--ifm-heading-line-height);
  margin-top: var(--ifm-heading-margin-top);
  margin-bottom: var(--ifm-heading-margin-bottom);
}

h1 { font-size: var(--ifm-h1-font-size); }
h2 { font-size: var(--ifm-h2-font-size); margin-top: 2rem; }
h3 { font-size: var(--ifm-h3-font-size); margin-top: 1.5rem; }
h4 { font-size: var(--ifm-h4-font-size); margin-top: 1.25rem; }
h5 { font-size: var(--ifm-h5-font-size); }
h6 { font-size: var(--ifm-h6-font-size); }

/* Heading anchors */
h1 > a.hash-link,
h2 > a.hash-link,
h3 > a.hash-link,
h4 > a.hash-link {
  opacity: 0;
  transition: opacity 0.15s;
  text-decoration: none;
  margin-left: 0.5rem;
  color: var(--ifm-color-primary);
}

h1:hover > a.hash-link,
h2:hover > a.hash-link,
h3:hover > a.hash-link,
h4:hover > a.hash-link {
  opacity: 1;
}

p {
  margin: 0 0 var(--ifm-spacing-vertical);
}

/* ==========================================================================
   Links
   ========================================================================== */
a {
  color: var(--ifm-link-color);
  text-decoration: none;
  transition: color 0.15s;
}

a:hover {
  color: var(--ifm-link-hover-color);
  text-decoration: underline;
}

/* ==========================================================================
   Inline Code
   --------------------------------------------------------------------------
   BAI design uses primary-active (deep orange) for inline code so it
   reads as a navigable token, not a generic monospace background.
   The \`:not(pre) > code\` qualifier keeps Shiki's tokenized code blocks
   (which contain bare \`<code>\` inside \`<pre>\`) untouched.
   ========================================================================== */
code {
  font-family: var(--bai-font-mono);
  font-size: var(--ifm-code-font-size);
}

:not(pre) > code {
  background: var(--bai-bg-subtle);
  border: 1px solid var(--bai-border-soft);
  border-radius: var(--bai-radius-sm);
  padding: 1px 6px;
  color: var(--bai-primary-active);
  font-weight: 500;
}

[data-theme="dark"] :not(pre) > code {
  color: var(--bai-primary-hover);
}

/* ==========================================================================
   Code Blocks
   ========================================================================== */
pre {
  background: var(--ifm-pre-background);
  border-radius: var(--ifm-pre-border-radius);
  padding: var(--ifm-pre-padding);
  line-height: var(--ifm-pre-line-height);
  overflow-x: auto;
  margin: 0 0 var(--ifm-spacing-vertical);
}

pre code {
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
  border-radius: 0;
}

/* Code block with title */
.code-block-wrapper {
  margin: 0 0 var(--ifm-spacing-vertical);
  border-radius: var(--ifm-pre-border-radius);
  overflow: hidden;
  border: 1px solid var(--ifm-color-emphasis-300);
}

.code-block-title {
  background: var(--ifm-color-emphasis-200);
  padding: 0.5rem 1rem;
  font-family: var(--ifm-font-family-monospace);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ifm-color-emphasis-800);
  border-bottom: 1px solid var(--ifm-color-emphasis-300);
}

.code-block-wrapper pre {
  border-radius: 0;
  margin: 0;
}

/* Line highlighting */
.code-line {
  display: block;
  padding-left: 1rem;
  padding-right: 1rem;
  margin-left: -1rem;
  margin-right: -1rem;
}

.code-line.highlighted {
  background: rgba(53, 120, 229, 0.1);
  border-left: 3px solid var(--ifm-color-primary);
  padding-left: calc(1rem - 3px);
}

/* ==========================================================================
   F4 — Shiki tokenized code blocks + Copy button
   --------------------------------------------------------------------------
   Build-time syntax highlighting (Shiki) emits inline-styled <span> tokens
   inside <span class="line"> rows. We only need a few rules:
     - Keep Shiki's per-token color spans visible (don't over-style).
     - Wrap each <pre> with a positioning context so the Copy button can
       sit at the top-right corner.
     - Provide a hover-revealed Copy button with a transient "Copied!" state.
   ========================================================================== */
.shiki-host > code .line {
  /* Each token row Shiki emits. display:block makes line wrapping behave
     consistently — long lines wrap inside the line span instead of pushing
     the parent <pre> wider. */
  display: block;
}

/* Wrapper injected at runtime by code-copy.js. Provides the positioning
   context for the absolutely-positioned button. The wrapper is invisible
   itself — the <pre> inside keeps its frame styling. */
.doc-code-block-wrapper {
  position: relative;
  margin: 0 0 var(--ifm-spacing-vertical);
}

/* When inside a titled wrapper (already provides a frame), reset the
   bottom margin so the doc-code-block-wrapper doesn't double-space. */
.code-block-wrapper .doc-code-block-wrapper {
  margin: 0;
}

.doc-code-block-wrapper > pre {
  /* Reset margin on pre when wrapped — wrapper owns the bottom margin. */
  margin: 0;
}

.doc-code-copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  line-height: 1.2;
  font-family: var(--ifm-font-family-base);
  color: var(--ifm-color-emphasis-700);
  background: var(--ifm-color-emphasis-0);
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 0.25rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 120ms ease, color 120ms ease, border-color 120ms ease,
    background-color 120ms ease;
}

.doc-code-block-wrapper:hover .doc-code-copy-btn,
.doc-code-block-wrapper:focus-within .doc-code-copy-btn,
.doc-code-copy-btn:focus,
.doc-code-copy-btn:focus-visible {
  opacity: 1;
}

.doc-code-copy-btn:hover {
  color: var(--ifm-color-primary);
  border-color: var(--ifm-color-primary);
  background: var(--ifm-color-emphasis-100);
}

.doc-code-copy-btn[data-state="copied"] {
  color: var(--ifm-color-success-dark);
  border-color: var(--ifm-color-success);
  background: rgba(0, 164, 0, 0.08);
  opacity: 1;
}

.doc-code-copy-btn[data-state="failed"] {
  color: var(--ifm-color-danger-dark);
  border-color: var(--ifm-color-danger);
  background: rgba(250, 56, 62, 0.06);
  opacity: 1;
}

/* ==========================================================================
   Tables
   ========================================================================== */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--ifm-spacing-vertical);
  display: table;
  overflow: auto;
}

thead {
  background: var(--ifm-table-head-background);
}

th {
  font-weight: var(--ifm-table-head-font-weight);
  padding: var(--ifm-table-cell-padding);
  border-bottom: 2px solid var(--ifm-table-border-color);
  text-align: left;
}

td {
  padding: var(--ifm-table-cell-padding);
  border-bottom: var(--ifm-table-border-width) solid var(--ifm-table-border-color);
}

tbody tr:nth-child(even) {
  background: var(--ifm-table-stripe-background);
}

/* ==========================================================================
   Blockquotes
   ========================================================================== */
blockquote {
  margin: 0 0 var(--ifm-spacing-vertical);
  padding: 0 var(--ifm-blockquote-padding-horizontal);
  border-left: var(--ifm-blockquote-border-left-width) solid var(--ifm-blockquote-border-color);
  color: var(--ifm-blockquote-color);
}

blockquote > :last-child {
  margin-bottom: 0;
}

/* ==========================================================================
   Lists
   ========================================================================== */
ul, ol {
  margin: 0 0 var(--ifm-spacing-vertical);
  padding-left: 2rem;
}

li {
  margin-bottom: 0.25rem;
}

li > ul, li > ol {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

/* ==========================================================================
   Images
   ========================================================================== */
.doc-image {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1rem auto;
  border: 1px solid var(--ifm-color-emphasis-200);
  border-radius: var(--ifm-pre-border-radius);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* ==========================================================================
   Horizontal Rules
   ========================================================================== */
hr {
  border: none;
  border-top: var(--ifm-hr-border-width) solid var(--ifm-hr-border-color);
  margin: 1.5rem 0;
}

/* ==========================================================================
   Strong & Emphasis
   ========================================================================== */
strong {
  font-weight: var(--ifm-font-weight-bold);
}

/* ==========================================================================
   Admonitions
   ========================================================================== */
.admonition {
  margin-bottom: 1em;
  padding: var(--ifm-alert-padding-vertical) var(--ifm-alert-padding-horizontal);
  border: var(--ifm-alert-border-width) solid transparent;
  border-left-width: var(--ifm-alert-border-left-width);
  border-radius: var(--ifm-alert-border-radius);
}

.admonition-heading {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  margin-bottom: 0.3rem;
}

.admonition-heading .admonition-icon {
  display: inline-flex;
  margin-right: 0.4rem;
}

.admonition-heading .admonition-icon svg {
  width: 1.1rem;
  height: 1.1rem;
  fill: currentColor;
}

.admonition-content > :last-child {
  margin-bottom: 0;
}

/* Note */
.admonition-note {
  background: rgba(235, 237, 240, 0.3);
  border-left-color: var(--ifm-color-secondary);
}
.admonition-note .admonition-heading {
  color: var(--ifm-color-emphasis-700);
}

/* Tip */
.admonition-tip {
  background: rgba(0, 164, 0, 0.06);
  border-left-color: var(--ifm-color-success);
}
.admonition-tip .admonition-heading {
  color: var(--ifm-color-success-dark);
}

/* Info */
.admonition-info {
  background: rgba(84, 199, 236, 0.1);
  border-left-color: var(--ifm-color-info);
}
.admonition-info .admonition-heading {
  color: var(--ifm-color-info-dark);
}

/* Warning / Caution */
.admonition-warning,
.admonition-caution {
  background: rgba(255, 186, 0, 0.1);
  border-left-color: var(--ifm-color-warning);
}
.admonition-warning .admonition-heading,
.admonition-caution .admonition-heading {
  color: var(--ifm-color-warning-dark);
}

/* Danger */
.admonition-danger {
  background: rgba(250, 56, 62, 0.06);
  border-left-color: var(--ifm-color-danger);
}
.admonition-danger .admonition-heading {
  color: var(--ifm-color-danger-dark);
}

/* ==========================================================================
   Details / Summary
   ========================================================================== */
details {
  margin-bottom: 1em;
  padding: 0.75rem 1rem;
  background: var(--ifm-color-emphasis-100);
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: var(--ifm-pre-border-radius);
}

details > summary {
  cursor: pointer;
  font-weight: 600;
  padding: 0.25rem 0;
  user-select: none;
}

details > summary:hover {
  color: var(--ifm-color-primary);
}

details[open] > summary {
  margin-bottom: 0.75rem;
}

details > :last-child {
  margin-bottom: 0;
}

/* ==========================================================================
   Chapter Separator
   ========================================================================== */
.chapter {
  padding-bottom: 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--ifm-color-emphasis-200);
}

.chapter:last-child {
  border-bottom: none;
}

/* ==========================================================================
   Page Footer (website mode)
   ========================================================================== */
.page-footer {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--ifm-color-emphasis-200);
}

.page-metadata {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: var(--ifm-color-emphasis-600);
}

.page-metadata .edit-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--ifm-color-primary);
  text-decoration: none;
}

.page-metadata .edit-link:hover {
  text-decoration: underline;
}

.page-metadata .edit-link svg {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
}

.page-metadata .last-updated {
  color: var(--ifm-color-emphasis-600);
}

/* ==========================================================================
   In-page header bar (legacy F1 slot).
   --------------------------------------------------------------------------
   Phase 2 (FR-2726) moves the language switcher and version selector
   into the new sticky topbar. We keep the .page-header-bar / .lang-switcher
   classnames so older bundled HTML and external consumers still parse,
   but visually fold the bar away when there's nothing to render.
   ========================================================================== */
.page-header-bar {
  display: none;
}

.page-header-nav {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.lang-switcher {
  display: inline-flex;
  gap: 2px;
  border: 1px solid var(--bai-border);
  border-radius: 6px;
  padding: 2px;
  background: var(--bai-bg);
}

.lang-switcher__item {
  display: inline-block;
  padding: 4px 9px;
  font-size: 12px;
  line-height: 1.2;
  border-radius: 4px;
  color: var(--bai-text-2);
  text-decoration: none;
  transition: background-color 120ms ease, color 120ms ease;
}

.lang-switcher__item:hover,
.lang-switcher__item:focus {
  background: var(--bai-bg-subtle);
  color: var(--bai-text);
  text-decoration: none;
}

.lang-switcher__item--current {
  background: var(--bai-primary);
  color: #fff;
  cursor: default;
}

.lang-switcher__item--current:hover,
.lang-switcher__item--current:focus {
  background: var(--bai-primary-active);
  color: #fff;
}

.lang-switcher__item--unavailable {
  color: var(--bai-text-4);
}

.lang-switcher__item--unavailable:hover,
.lang-switcher__item--unavailable:focus {
  background: var(--bai-bg-subtle);
  color: var(--bai-text-3);
}

/* Pagination Navigation */
.pagination-nav {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.pagination-nav__link {
  display: block;
  flex: 1;
  padding: 1rem;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: var(--ifm-pre-border-radius);
  text-decoration: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.pagination-nav__link:hover {
  border-color: var(--ifm-color-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  text-decoration: none;
}

.pagination-nav__link--next {
  text-align: right;
}

.pagination-nav__sublabel {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--ifm-color-emphasis-600);
  margin-bottom: 0.25rem;
}

.pagination-nav__label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ifm-color-primary);
}

/* ==========================================================================
   Breadcrumb (F3)
   --------------------------------------------------------------------------
   Sits above the chapter content, below the page-header-bar. The "›"
   separators are CSS pseudo-elements so the structural HTML stays
   semantic (an ol of li segments) and translates cleanly.
   ========================================================================== */
.breadcrumb {
  margin: 0 0 18px 0;
  font-size: 12.5px;
  color: var(--bai-text-3);
}

.breadcrumb__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 8px;
  align-items: center;
}

.breadcrumb__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.breadcrumb__item + .breadcrumb__item::before {
  /* U+203A SINGLE RIGHT-POINTING ANGLE QUOTATION MARK — reads naturally
     across all four supported languages. */
  content: "›";
  color: var(--bai-text-4);
}

.breadcrumb__link {
  color: var(--bai-text-3);
  text-decoration: none;
  transition: color 0.12s;
}

.breadcrumb__link:hover {
  color: var(--bai-primary);
  text-decoration: none;
}

.breadcrumb__item--current {
  color: var(--bai-text);
  font-weight: 500;
}

.breadcrumb__item--category {
  color: var(--bai-text-3);
}

/* ==========================================================================
   Right-rail "On this page" TOC (F3 + FR-2726 Phase 2)
   --------------------------------------------------------------------------
   Sticky aside in the third grid column on desktop. IntersectionObserver
   scroll-spy adds .is-active to the link whose section is in view.
   ========================================================================== */
.doc-toc {
  position: sticky;
  top: var(--bai-topbar-h);
  align-self: start;
  height: calc(100vh - var(--bai-topbar-h));
  overflow-y: auto;
  padding: 28px 22px;
  font-size: 13px;
  background: var(--bai-bg);
  border-left: 1px solid var(--bai-border);
}

.doc-toc[data-empty="true"] .doc-toc__heading,
.doc-toc[data-empty="true"] .doc-toc__list {
  /* Hide the heading and list when there is nothing to spy on, but
     keep the aside in the grid (and the Get-help section visible) so
     the rail still looks intentional. */
  display: none;
}

.doc-toc__heading {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--bai-text-3);
  margin-bottom: 10px;
}

.doc-toc__list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  border-left: 1px solid var(--bai-border-soft);
}

.doc-toc__item {
  margin: 0;
}

.doc-toc__item--h3 {
  padding-left: 12px;
}

.doc-toc__link {
  display: block;
  padding: 4px 12px;
  margin-left: -1px;
  border-left: 2px solid transparent;
  color: var(--bai-text-3);
  text-decoration: none;
  line-height: 1.45;
  transition: color 120ms ease, border-color 120ms ease;
}

.doc-toc__link:hover {
  color: var(--bai-text);
  text-decoration: none;
}

.doc-toc__link.is-active {
  color: var(--bai-primary);
  border-left-color: var(--bai-primary);
  font-weight: 500;
  background: transparent;
}

/* Get help — small link cluster below the scroll-spy list. Phase 2
   surface; the list of links is built by the website builder from
   editBaseUrl + repoUrl. Empty when neither is configured. */
.doc-toc__divider {
  height: 1px;
  background: var(--bai-border-soft);
  margin: 18px 0;
}

.doc-toc__contrib {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 22px;
}

.doc-toc__contrib .doc-toc__heading {
  margin-bottom: 6px;
}

.doc-toc__link--external {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  font-size: 12.5px;
  color: var(--bai-text-2);
  border-left: 0;
  margin-left: 0;
}

.doc-toc__link--external > svg {
  flex-shrink: 0;
  color: var(--bai-text-3);
  transition: color 0.12s;
}

.doc-toc__link--external:hover {
  color: var(--bai-primary);
}

.doc-toc__link--external:hover > svg {
  color: var(--bai-primary);
}

/* ==========================================================================
   Responsive — FR-2726 Phase 2 breakpoints
   --------------------------------------------------------------------------
   - 1180px: drop the right-rail TOC. Article reclaims its width; TOC
     headings remain anchor-reachable from the table of contents in the
     page itself.
   -  880px: hide the topbar search bar AND the sidebar; replace search
     with the magnifier icon button. The icon click focuses #search-input
     in Phase 2 (works because the input is still inside the search
     container, just visually hidden until Phase 4 adds a real palette).

   Phase 2 intentionally keeps the topbar search bar visible at 1024px
   widths so users on tablet-class viewports (≤1180px) still have a
   working inline search. Phase 4 introduces the Cmd-K palette and can
   re-introduce a tighter breakpoint then.
   ========================================================================== */
@media (max-width: 1180px) {
  .doc-page {
    grid-template-columns: var(--bai-sider-w) minmax(0, 1fr);
  }
  .doc-toc {
    display: none;
  }
}

@media (max-width: 880px) {
  .bai-topbar .bai-topbar__search {
    display: none;
  }
  .bai-topbar .bai-topbar__searchicon {
    display: inline-flex;
    margin-left: auto;
  }
  .bai-topbar__actions {
    margin-left: 0;
  }
}

@media (max-width: 880px) {
  :root {
    --bai-sider-w: 0px;
  }
  .doc-page {
    grid-template-columns: minmax(0, 1fr);
  }
  .doc-sidebar {
    display: none;
  }
  .bai-topbar__menu {
    display: inline-flex;
  }
  .bai-topbar__brand {
    gap: 8px;
  }
  .bai-brand-divider,
  .bai-brand-sub,
  .bai-brand-version {
    display: none;
  }
  .doc-main {
    padding: 24px 16px 60px;
  }
  .pagination-nav {
    flex-direction: column;
  }
  .pagination-nav__link--next {
    text-align: left;
  }
  .page-metadata {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
`;
}

/**
 * Generate CSS for multi-page static website.
 * Unlike generateWebStyles(lang), this produces a single stylesheet
 * suitable for all languages by using :lang() selectors for CJK-specific rules.
 *
 * `branding` is forwarded to the underlying token block so consumers can
 * override the brand primary color (FR-2726). Other branding fields
 * (logos, sub-label) flow through HTML — not CSS — and are consumed by
 * the website builder in later phases.
 */
export function generateWebsiteStyles(branding?: StyleBrandingTokens): string {
  // Base styles without any language-specific conditional
  const baseStyles = generateWebStyles(undefined, branding);

  // Generate :lang() selectors for CJK word-break from CJK_LANGS
  const cjkSelectors = Array.from(CJK_LANGS)
    .sort()
    .map((code) => `:lang(${code}) body`)
    .join(",\n");

  return (
    baseStyles +
    `

/* ==========================================================================
   Page header bar (F1 language switcher + F6 version switcher live here)
   ========================================================================== */
.page-header-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--ifm-color-emphasis-200);
  background: var(--ifm-color-emphasis-0);
  font-size: 0.875rem;
}
.page-header-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.version-switcher-label {
  color: var(--ifm-color-emphasis-700);
  font-weight: 500;
}
.version-switcher {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  background: var(--ifm-color-emphasis-0);
  color: var(--ifm-color-emphasis-900);
  font: inherit;
  cursor: pointer;
}
.version-switcher:hover {
  border-color: var(--ifm-color-primary);
}

/* ==========================================================================
   Version-mismatch UX (FR-2723)
   - .docs-banner.docs-banner--view-latest: shown on every non-latest
     version page, dismissible per-session.
   - .docs-notice.docs-notice--not-in-version: shown after the version
     switcher falls back to the index because the slug doesn't exist
     in the target version.
   ========================================================================== */
.docs-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--ifm-color-warning-dark);
  background: var(--ifm-color-warning-light);
  color: var(--ifm-color-emphasis-1000);
  font-size: 0.875rem;
}
.docs-banner[hidden] { display: none; }
.docs-banner__body {
  flex: 1 1 auto;
}
.docs-banner__link {
  color: var(--ifm-color-primary-darker);
  font-weight: 600;
  text-decoration: underline;
}
.docs-banner__link:hover {
  color: var(--ifm-color-primary-darkest);
}
.docs-banner__dismiss {
  flex: 0 0 auto;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--ifm-color-emphasis-800);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  border-radius: 4px;
}
.docs-banner__dismiss:hover {
  background: rgba(0, 0, 0, 0.08);
  color: var(--ifm-color-emphasis-1000);
}
.docs-notice {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1.5rem 0;
  padding: 0.75rem 1rem;
  border: 1px solid var(--ifm-color-info-dark);
  border-left: 4px solid var(--ifm-color-info-dark);
  border-radius: var(--ifm-pre-border-radius);
  background: rgba(84, 199, 236, 0.12);
  color: var(--ifm-color-emphasis-1000);
  font-size: 0.875rem;
}
.docs-notice[hidden] { display: none; }
.docs-notice__body {
  flex: 1 1 auto;
}
.docs-notice__dismiss {
  flex: 0 0 auto;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--ifm-color-emphasis-800);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  border-radius: 4px;
}
.docs-notice__dismiss:hover {
  background: rgba(0, 0, 0, 0.08);
  color: var(--ifm-color-emphasis-1000);
}

/* ==========================================================================
   CJK Language Rules (via :lang() selectors for shared stylesheet)
   ========================================================================== */
${cjkSelectors} {
  word-break: keep-all;
}
`
  );
}
