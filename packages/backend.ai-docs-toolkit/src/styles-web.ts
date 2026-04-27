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

/* Bump specificity past the generic .bai-iconbtn { display: inline-flex }
   rule below so the menu button stays hidden on desktop. Without the
   parent qualifier both selectors share specificity (0,1,0) and the
   later iconbtn rule wins, leaving the desktop topbar with a visible
   hamburger that opens the drawer-scrim on click. */
.bai-topbar .bai-topbar__menu {
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

/* Brand logo swap (FR-2726 Phase 4). Both light and dark variants are
   in the DOM; CSS hides whichever doesn't match the active data-theme.
   :root:not([data-theme="dark"]) covers both the unset case (light is
   default) and the explicit data-theme="light" case. */
:root:not([data-theme="dark"]) .bai-brand-logo--dark { display: none; }
[data-theme="dark"] .bai-brand-logo--light { display: none; }
[data-theme="dark"] .bai-brand-logo--dark { display: block; }

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

/* Topbar search trigger label (Phase 4) — replaces the inline input.
   Visually mimics the input field so the bar still reads as a search
   surface, but the click opens the palette overlay. */
.bai-topbar__search-label {
  flex: 1;
  text-align: left;
  color: var(--bai-text-3);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Theme toggle (Phase 4). Shows the destination icon — the moon when
   light mode is active, the sun when dark mode is active. */
.bai-theme-icon {
  display: none;
}
:root:not([data-theme="dark"]) .bai-theme-icon--dark {
  display: inline;
}
[data-theme="dark"] .bai-theme-icon--light {
  display: inline;
}

/* Search palette (Phase 4 — FR-2726). The palette is a body-class-
   controlled modal: when body has bai-palette-open, the .bai-palette
   element is shown; otherwise it stays hidden. The scrim covers the
   full viewport; the panel is centered horizontally with a fixed top
   offset (~14vh) so the field lands near the user's gaze. Inside the
   panel, #search-input is restyled to match the palette look-and-feel;
   #search-results renders the existing search.js dropdown, repositioned
   to flow inside the panel instead of floating absolutely. */
.bai-palette {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 14vh;
  pointer-events: none;
}

.bai-palette[hidden] {
  display: none;
}

body.bai-palette-open .bai-palette {
  pointer-events: auto;
}

.bai-palette__scrim {
  position: absolute;
  inset: 0;
  background: rgba(20, 20, 20, 0.45);
  backdrop-filter: blur(4px);
}
[data-theme="dark"] .bai-palette__scrim {
  background: rgba(0, 0, 0, 0.6);
}

.bai-palette__panel {
  position: relative;
  width: 600px;
  max-width: 92vw;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: var(--bai-bg);
  border: 1px solid var(--bai-border);
  border-radius: var(--bai-radius-lg);
  box-shadow: var(--bai-shadow-lg);
  overflow: hidden;
  animation: bai-palette-in 180ms ease-out;
}

@keyframes bai-palette-in {
  from {
    transform: translateY(-12px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.bai-palette__searchrow {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--bai-border);
}

.bai-palette__searchrow > svg {
  color: var(--bai-text-3);
  flex-shrink: 0;
}

.bai-palette__panel #search-input {
  flex: 1;
  border: 0;
  background: transparent;
  font: inherit;
  font-family: var(--bai-font-sans);
  font-size: 15.5px;
  color: var(--bai-text);
  outline: 0;
  padding: 0;
}

.bai-palette__panel #search-input::placeholder {
  color: var(--bai-text-3);
}

.bai-palette__close-hint {
  font-family: var(--bai-font-mono);
  font-size: 10.5px;
  background: var(--bai-bg-muted);
  border: 1px solid var(--bai-border);
  border-bottom-width: 2px;
  padding: 1px 6px;
  border-radius: 4px;
  color: var(--bai-text-3);
  flex-shrink: 0;
}

/* When the search-results dropdown lives inside the palette panel,
   override its absolute positioning so it scrolls inline with the
   panel body instead of floating relative to the viewport. */
.bai-palette__panel #search-results {
  position: static;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
  max-height: none;
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
}

.bai-palette__panel #search-results .search-result-item {
  padding: 10px 18px;
  border-bottom: 1px solid var(--bai-border-soft);
}

.bai-palette__panel #search-results .search-result-item:last-child {
  border-bottom: 0;
}

.bai-palette__panel #search-results .search-result-item:hover,
.bai-palette__panel #search-results .search-result-item:focus {
  background: var(--bai-bg-muted);
  outline: 0;
}

.bai-palette__panel #search-results .search-result-title {
  color: var(--bai-text);
  font-size: 14px;
}

.bai-palette__panel #search-results .search-result-snippet {
  color: var(--bai-text-3);
  font-size: 12px;
}

/* Mobile drawer scrim (Phase 4). Created lazily by interactions.js
   and added to the body when the user opens the drawer. Re-uses the
   palette scrim look so the visual language stays consistent. */
.bai-scrim {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(20, 20, 20, 0.45);
  backdrop-filter: blur(4px);
  display: none;
}

[data-theme="dark"] .bai-scrim {
  background: rgba(0, 0, 0, 0.6);
}

body.bai-drawer-open .bai-scrim {
  display: block;
}

/* When the drawer is open at narrow viewports, slide the sider in
   from the left as a fixed-position overlay. Desktop layout is
   unaffected — the @media query below scopes the override to
   ≤ 880px so the sider's regular sticky behavior is preserved. */
@media (max-width: 880px) {
  body.bai-drawer-open .doc-sidebar {
    display: block;
    position: fixed;
    top: var(--bai-topbar-h);
    left: 0;
    width: 280px;
    max-width: 86vw;
    height: calc(100vh - var(--bai-topbar-h));
    z-index: 101;
    background: var(--bai-bg-sider);
    border-right: 1px solid var(--bai-border);
    box-shadow: var(--bai-shadow-lg);
    overflow-y: auto;
    animation: bai-drawer-in 200ms ease-out;
  }
}

@keyframes bai-drawer-in {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
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

/* FR-2733: version switcher block at the top of the sidebar (above the
   nav groups). Renders only in versioned-docs mode; non-versioned builds
   skip the wrapper entirely. The select itself mirrors the
   .lang-switcher__select chrome (30px, 1px BAI border, transparent
   background, BAI primary on hover, native chevron via SVG background
   image, BAI primary focus outline) so the two site-level controls feel
   like a coordinated pair. */
.doc-sidebar-version {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 18px 12px;
  border-bottom: 1px solid var(--bai-border);
}
.doc-sidebar-version__label {
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--bai-text-2);
}
.doc-sidebar-version .version-switcher {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 28px 0 10px;
  border: 1px solid var(--bai-border);
  border-radius: 6px;
  background: transparent;
  /* Hard-coded #595959 stroke matches --bai-text-2 in light mode; dark
     mode fades a little but stays legible. CSS vars don't resolve
     inside url() so an inline SVG is the only option without shipping
     a separate asset. */
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23595959' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 12px;
  font-size: 12px;
  color: var(--bai-text);
  cursor: pointer;
  transition: border-color 120ms ease;
}
.doc-sidebar-version .version-switcher:hover {
  border-color: var(--bai-primary);
}
.doc-sidebar-version .version-switcher:focus,
.doc-sidebar-version .version-switcher:focus-visible {
  outline: 2px solid var(--bai-primary);
  outline-offset: 1px;
}
[data-theme="dark"] .doc-sidebar-version .version-switcher {
  /* Dark-mode native popup: tell the browser to render the dropdown
     panel itself in dark too (matches lang-switcher__select). */
  color-scheme: dark;
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
   Typography & Headings (FR-2726 Phase 3)
   --------------------------------------------------------------------------
   The chapter H1 is the page title; the H2/H3 hierarchy carries the
   in-page outline reflected by the right-rail TOC. BAI sizes:
     - H1: 40px / 600 — generous, slightly tightened letter-spacing
     - H2: 26px / 600 — separated by a soft top border (acts as section
       divider so consecutive sections feel grouped without an ::after
       horizontal rule cluttering the column)
     - H3: 18px / 600 — minor section with a small positive bottom
       margin (8px) so the following paragraph stays close to the
       heading without overlapping it
   The first H2 in a chapter has no top border (it would visually clash
   with the leading paragraph spacing).
   ========================================================================== */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--bai-font-heading);
  font-weight: 600;
  line-height: 1.25;
  margin-top: 0;
  margin-bottom: 0.6em;
  color: var(--bai-text);
}

.chapter h1,
h1 {
  font-size: calc(40px * var(--bai-type-scale));
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 0 0 14px;
}

.chapter h2,
h2 {
  font-size: calc(26px * var(--bai-type-scale));
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 44px 0 4px;
  padding-top: 8px;
  border-top: 1px solid var(--bai-border-soft);
  scroll-margin-top: calc(var(--bai-topbar-h) + 24px);
}

.chapter h2:first-of-type,
h2:first-of-type {
  border-top: 0;
  padding-top: 0;
  margin-top: 24px;
}

.chapter h3,
h3 {
  font-size: calc(18px * var(--bai-type-scale));
  font-weight: 600;
  /* The original prototype used a negative bottom margin to pull the
     following paragraph up, but in our markdown output the next
     element has its own top margin so the negative value caused
     visible overlap. Use a small positive bottom margin instead. */
  margin: 28px 0 8px;
  scroll-margin-top: calc(var(--bai-topbar-h) + 24px);
}

h4 { font-size: var(--ifm-h4-font-size); margin-top: 1.25rem; }
h5 { font-size: var(--ifm-h5-font-size); }
h6 { font-size: var(--ifm-h6-font-size); }

/* The BAI prototype rendered the first paragraph after H1 as a
   "lede" summary (larger, muted, capped to 68ch). Our docs don't
   consistently structure the first paragraph as a summary, so the
   distinct style + right-side gap read as a defect. The first
   paragraph now matches the rest of the body. */

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

/* Code block with title (FR-2726 Phase 3 — BAI dark code block).
   The wrapper provides the dark frame; the title bar shows a language
   pill (orange chip on the left), the filename (centered/left), and
   the always-visible copy button on the right. Shiki tokens still
   render inside the <pre> using their inline styles; the dark wrapper
   means even light-themed Shiki output reads on a dark surface as the
   <pre> background is dark via the wrapper. */
.code-block-wrapper {
  margin: 0 0 var(--ifm-spacing-vertical);
  border-radius: var(--bai-radius);
  overflow: hidden;
  border: 1px solid var(--bai-border);
  background: #0E0E10;
  font-family: var(--bai-font-mono);
  font-size: 12.5px;
}

.code-block-title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #1A1A1F;
  border-bottom: 1px solid #2A2A30;
  color: #B5B5BD;
  font-family: var(--bai-font-mono);
  font-size: 11.5px;
  font-weight: 500;
}

.code-block-wrapper pre {
  border-radius: 0;
  margin: 0;
  background: #0E0E10 !important;
  color: #E0E0E5;
  padding: 16px 18px;
  line-height: 1.7;
  overflow-x: auto;
}

/* Shiki emits inline-styled <span> tokens inside <pre>. We let those
   inline colors come through (they're already designed for dark bg
   when the consumer keeps the default github-dark theme). When the
   consumer overrides to a light theme, the wrapper background is
   still dark — the tokens will still be readable, just not optimal.
   That's a known trade-off for the BAI design (always-dark code). */
.code-block-wrapper pre code {
  color: inherit;
  background: transparent;
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

/* Wrapper injected at runtime by code-copy.js around every <pre> on the
   page (titled OR untitled). FR-2726 Phase 3 makes this the canonical
   BAI dark code frame so untitled fenced blocks (the common case) get
   the dark surface too — not just blocks that opt in via title=.
   The titled wrapper (.code-block-wrapper above) already paints the
   dark frame; when both wrappers are present, the inner one is
   transparent so the title bar's frame wins. */
.doc-code-block-wrapper {
  position: relative;
  margin: 0 0 var(--ifm-spacing-vertical);
  border-radius: var(--bai-radius);
  overflow: hidden;
  border: 1px solid var(--bai-border);
  background: #0E0E10;
  font-family: var(--bai-font-mono);
  font-size: 12.5px;
}

/* When inside a titled wrapper (already provides a frame), reset the
   bottom margin so the doc-code-block-wrapper doesn't double-space. */
.code-block-wrapper .doc-code-block-wrapper {
  margin: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.doc-code-block-wrapper > pre {
  /* Reset margin on pre when wrapped — wrapper owns the bottom margin.
     Force the dark surface on the <pre> too; Shiki doesn't emit an inline
     style on the <pre> root (only on token spans), so a plain CSS rule
     wins. The !important guards against any future Shiki version that
     does inline-style the root. */
  margin: 0;
  background: #0E0E10 !important;
  color: #E0E0E5;
  padding: 16px 18px;
  line-height: 1.7;
  overflow-x: auto;
}

/* Tokens are inline-styled by Shiki for the configured lightTheme.
   Operators who keep github-light end up with light token colors on
   our dark frame, which doesn't read. The two paths forward:
     1. Set code.lightTheme to a dark-friendly theme (github-dark,
        vitesse-dark, etc.) in docs-toolkit.config.yaml.
     2. Wait for the F4 dual-theme follow-up that pairs Shiki's
        themes: { light, dark } emitter with our [data-theme] hook.
   Until either is configured, we leave token colors untouched so the
   build doesn't fight Shiki's output. */

/* Copy button (FR-2726 Phase 3 — BAI dark code block).
   The button is always visible (no hover-reveal) so users can always
   see the copy affordance, matching the BAI design prototype. When
   the code block has a title bar, the button sits inside the bar; when
   it doesn't, it floats at the top-right of the dark frame. */
.doc-code-copy-btn {
  position: absolute;
  top: 6px;
  right: 8px;
  padding: 3px 9px;
  font-size: 11px;
  line-height: 1.2;
  font-family: var(--bai-font-sans);
  color: #B5B5BD;
  background: transparent;
  border: 1px solid #2A2A30;
  border-radius: 4px;
  cursor: pointer;
  opacity: 1;
  transition: color 120ms ease, border-color 120ms ease,
    background-color 120ms ease;
}

/* When inside a title bar, anchor to the bar's right edge instead of
   floating absolute. The copy script puts the button at the top-right
   of the wrapper; the title bar already renders at the top, so the
   absolute position lands on the bar visually. */
.code-block-wrapper .doc-code-copy-btn {
  top: 6px;
  right: 8px;
}

.doc-code-copy-btn:hover {
  color: var(--bai-primary);
  border-color: var(--bai-primary);
  background: transparent;
}

.doc-code-copy-btn[data-state="copied"] {
  color: var(--bai-success);
  border-color: var(--bai-success);
  background: transparent;
}

.doc-code-copy-btn[data-state="failed"] {
  color: var(--bai-danger);
  border-color: var(--bai-danger);
  background: transparent;
}

/* Language pill (FR-2726 Phase 3). Surfaced when the consumer wraps
   their code block in <div class="code-block-wrapper"> with a
   <span class="code-block-lang">bash</span> sibling — the markdown
   pipeline does not auto-emit this today, but the styles are in place
   so a future enhancement can flip it on. */
.code-block-lang {
  display: inline-flex;
  align-items: center;
  background: var(--bai-primary);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.code-block-title-text {
  flex: 1;
  min-width: 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

/* ==========================================================================
   Tables (FR-2726 Phase 3 — BAI bordered card style)
   --------------------------------------------------------------------------
   Tables size to their content (width: max-content) and are capped at
   the article column (max-width: 100%). Narrow tables stay compact
   instead of padding empty space on the right; wide tables hit
   max-width: 100% and become horizontally scrollable via
   overflow-x: auto so the column structure stays readable. The 1px
   border + radius wrap the block so the BAI card framing is preserved.
   ========================================================================== */
table {
  /* Sizing: tables are width-of-content (max-content) but capped to
     the article column (max-width: 100%). This way:
       - Narrow tables (e.g. 3 short cols) stay compact instead of
         padding empty space on the right.
       - Wide tables overflow the column and become horizontally
         scrollable thanks to overflow-x: auto.
     We intentionally drop the previously-set min-width: 100% rule
     (which forced narrow tables to span the column) because it
     produced 400+ px of dead space inside narrow tables. */
  display: block;
  width: max-content;
  max-width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--ifm-spacing-vertical);
  font-size: 13.5px;
  border: 1px solid var(--bai-border);
  border-radius: var(--bai-radius);
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

thead {
  background: var(--bai-bg-muted);
}

th {
  font-weight: 600;
  padding: 10px 14px;
  border-bottom: 1px solid var(--bai-border);
  text-align: left;
  color: var(--bai-text);
  font-size: 12.5px;
  letter-spacing: 0.02em;
}

td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--bai-border-soft);
  color: var(--bai-text);
}

tbody tr:last-child td {
  border-bottom: 0;
}

tbody tr:hover {
  background: var(--bai-bg-muted);
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
   Images (FR-2726 Phase 3 — BAI figure styling)
   --------------------------------------------------------------------------
   The doc-image wrapper acts as a clean BAI-style figure: 1px border,
   12px radius, soft shadow. Captions (when produced by the markdown
   pipeline as <figcaption>) sit centered below the image. Stat cards
   and other content components opt into the BAI palette via the
   .bai-stat-grid / .bai-stat-card classes below.
   ========================================================================== */
.doc-image {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1.25rem auto;
  border: 1px solid var(--bai-border);
  border-radius: var(--bai-radius-lg);
  box-shadow: var(--bai-shadow-sm);
  background: var(--bai-bg);
}

figure {
  /* Figure owns the outer vertical rhythm only. The image is
     centered horizontally by the figure .doc-image rule below
     (margin: 0 auto), and the caption is centered by figcaption's
     own text-align rule — so this block intentionally avoids
     setting text-align (which would only catch stray inline
     content and could surprise authors). */
  margin: 1.25rem 0;
}

figure .doc-image {
  /* Override .doc-image's default block centering only on the
     vertical axis (figure owns the outer top/bottom margin); keep
     auto on the horizontal axis so narrow images stay centered
     instead of left-aligning to the figure's edge. */
  margin: 0 auto;
}

figcaption {
  text-align: center;
  font-size: 12.5px;
  color: var(--bai-text-3);
  padding: 12px;
}

/* Stat-card grid (opt-in HTML). Authors who need a quick numeric
   scoreboard can write:
     <div class="bai-stat-grid">
       <div class="bai-stat-card">
         <div class="bai-stat-card__label">Sessions</div>
         <div class="bai-stat-card__value">3<span class="bai-stat-card__unit">active</span></div>
         <div class="bai-stat-card__hint">Optional context line</div>
       </div>
     </div>
   The Phase 3 styles match the BAI prototype's scoreboard idiom. */
.bai-stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 16px 0;
}

.bai-stat-card {
  background: var(--bai-bg);
  border: 1px solid var(--bai-border);
  border-radius: var(--bai-radius);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bai-stat-card__label {
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--bai-text-3);
  font-weight: 500;
}

.bai-stat-card__value {
  font-family: var(--bai-font-heading);
  font-size: 30px;
  font-weight: 600;
  line-height: 1.05;
  color: var(--bai-primary);
  letter-spacing: -0.02em;
}

.bai-stat-card__unit {
  font-size: 12px;
  color: var(--bai-text-3);
  margin-left: 6px;
  font-weight: 400;
}

.bai-stat-card__hint {
  font-size: 11.5px;
  color: var(--bai-text-3);
  margin-top: 2px;
}

@media (max-width: 880px) {
  .bai-stat-grid {
    grid-template-columns: 1fr;
  }
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
   Admonitions (FR-2726 Phase 3 — BAI semantic colors + 3px border)
   --------------------------------------------------------------------------
   Five severity levels share a 3px left border + soft tinted bg + colored
   icon/title. The card-bg derives from the semantic color at 6-8% alpha
   so the callout is recognizable in both light and dark themes (the
   alpha tint adapts naturally to the page background).
   ========================================================================== */
.admonition {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  margin-bottom: 1em;
  padding: 14px 16px;
  border: 1px solid var(--bai-border);
  border-left-width: 3px;
  border-radius: var(--bai-radius);
  background: var(--bai-bg-muted);
}

.admonition-heading {
  grid-column: 2;
  display: flex;
  align-items: center;
  font-family: var(--bai-font-heading);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin: 0 0 4px;
}

.admonition-heading .admonition-icon {
  /* Icon sits in the first grid column (outside the heading) so the
     admonition's title and body wrap together in the second column.
     We pin it via a pseudo-element-style position trick: the .admonition
     grid places the .admonition-content-wrap in column 2, but icons
     in legacy markup are rendered as a child of .admonition-heading.
     Move them to column 1 by giving them position:absolute relative to
     the admonition. */
  display: none; /* hidden in heading; we render it via ::before below */
}

.admonition::before {
  content: "";
  grid-row: 1 / span 2;
  grid-column: 1;
  width: 22px;
  height: 22px;
  margin-top: 1px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.admonition-content {
  grid-column: 2;
}

.admonition-content > :last-child {
  margin-bottom: 0;
}

.admonition-content > p {
  margin: 0 0 0.5em;
  font-size: 14px;
  color: var(--bai-text-2);
}

.admonition-content > p:last-child {
  margin-bottom: 0;
}

/* Inline-SVG icon per severity (data: URI keeps the icon in CSS so no
   extra HTTP request and no per-page HTML expansion). All icons use
   currentColor; tinting per severity is done via a CSS color hack —
   we set the icon as a mask and color the surface, ensuring the icon
   inherits from the admonition's accent color. */
.admonition-note,
.admonition-info {
  border-left-color: var(--bai-info);
  background: rgba(42, 153, 184, 0.06);
}
.admonition-note .admonition-heading,
.admonition-info .admonition-heading {
  color: var(--bai-info);
}
.admonition-note::before,
.admonition-info::before {
  background-color: var(--bai-info);
  -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="black" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="8" stroke="black" stroke-width="2.4" stroke-linecap="round"/><line x1="12" y1="11" x2="12" y2="17" stroke="black" stroke-width="2" stroke-linecap="round"/></svg>') center/contain no-repeat;
  mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="black" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="8" stroke="black" stroke-width="2.4" stroke-linecap="round"/><line x1="12" y1="11" x2="12" y2="17" stroke="black" stroke-width="2" stroke-linecap="round"/></svg>') center/contain no-repeat;
}

.admonition-tip {
  border-left-color: var(--bai-success);
  background: rgba(0, 189, 155, 0.07);
}
.admonition-tip .admonition-heading {
  color: var(--bai-success);
}
.admonition-tip::before {
  background-color: var(--bai-success);
  -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.74V17h8v-2.26A7 7 0 0 0 12 2Z"/></svg>') center/contain no-repeat;
  mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.74V17h8v-2.26A7 7 0 0 0 12 2Z"/></svg>') center/contain no-repeat;
}

.admonition-warning,
.admonition-caution {
  border-left-color: var(--bai-warning);
  background: rgba(255, 191, 0, 0.08);
}
.admonition-warning .admonition-heading,
.admonition-caution .admonition-heading {
  color: #B88A00;
}
.admonition-warning::before,
.admonition-caution::before {
  background-color: #B88A00;
  -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13" stroke="black" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="17" x2="12" y2="17" stroke="black" stroke-width="2.4" stroke-linecap="round"/></svg>') center/contain no-repeat;
  mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13" stroke="black" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="17" x2="12" y2="17" stroke="black" stroke-width="2.4" stroke-linecap="round"/></svg>') center/contain no-repeat;
}

.admonition-danger {
  border-left-color: var(--bai-danger);
  background: rgba(187, 31, 31, 0.06);
}
.admonition-danger .admonition-heading {
  color: var(--bai-danger);
}
.admonition-danger::before {
  background-color: var(--bai-danger);
  -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="black" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="black" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke="black" stroke-width="2" stroke-linecap="round"/></svg>') center/contain no-repeat;
  mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="black" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="black" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke="black" stroke-width="2" stroke-linecap="round"/></svg>') center/contain no-repeat;
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
   Page Footer (website mode — FR-2726 Phase 3)
   --------------------------------------------------------------------------
   The page-footer wraps the meta bar (last-updated only — Edit-this-page
   moved to the right rail Get-help cluster) and the prev/next pager.
   The site-level docfoot (copyright + secondary links) sits below the
   pager when emitted by the page builder.
   ========================================================================== */
.page-footer {
  margin-top: 60px;
  padding-top: 0;
  border-top: 0;
}

.page-metadata {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 0 0 18px;
  font-size: 12.5px;
  color: var(--bai-text-3);
}

.page-metadata .edit-link {
  /* The right-rail Get-help section now owns the edit-this-page link;
     keep the legacy class hidden in the meta bar so existing builds
     don't double-render it. The CSS rule is preserved for any consumer
     who chose to inline the edit link. */
  display: none;
}

.page-metadata .last-updated {
  color: var(--bai-text-3);
}

/* Site-level article footer (FR-2726 Phase 3). Rendered at the bottom
   of every page below the pager. Single line of muted text plus an
   optional cluster of secondary links (privacy / terms / license)
   driven by website.footerLinks (when configured). */
.docfoot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 60px;
  padding-top: 22px;
  border-top: 1px solid var(--bai-border-soft);
  font-size: 12px;
  color: var(--bai-text-3);
  flex-wrap: wrap;
  gap: 8px;
}

.docfoot__links {
  display: inline-flex;
  gap: 14px;
}

.docfoot a {
  color: var(--bai-text-3);
  text-decoration: none;
}

.docfoot a:hover {
  color: var(--bai-primary);
  text-decoration: none;
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

/* Lang switcher (FR-2737 — icon-only variant).
   Renders as a single Lucide languages icon button. The native <select>
   is sized to cover the icon and made fully transparent, so clicking
   the icon opens the OS-native option list — keyboard support, screen
   reader support, and per-platform dropdown chrome all come "for free"
   from the underlying <select>. The icon is the only thing the user
   sees; selected language is communicated via the <select>'s
   aria-label, the option list, and the chosen-option attribute. */
.lang-switcher {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  color: var(--bai-text-2);
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}

.lang-switcher:hover,
.lang-switcher:focus-within {
  background: var(--bai-primary-soft);
  color: var(--bai-primary);
}

.lang-switcher__icon {
  width: 18px;
  height: 18px;
  color: inherit;
  pointer-events: none;
}

.lang-switcher__select {
  /* Cover the entire button surface so any click on the icon (or the
     surrounding hit-area) opens the native dropdown. Opacity 0 hides
     the native chrome — including the platform chevron — without
     hiding the control from the accessibility tree. */
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: transparent;
  font: inherit;
  opacity: 0;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  /* Native popup positioning honors direction. font-size 16px
     prevents iOS Safari from auto-zooming when the user opens the
     option list. */
  font-size: 16px;
}

.lang-switcher__select:focus-visible + .lang-switcher__icon,
.lang-switcher:focus-within .lang-switcher__icon {
  color: var(--bai-primary);
}

.lang-switcher:focus-within {
  outline: 2px solid var(--bai-primary);
  outline-offset: 2px;
}

[data-theme="dark"] .lang-switcher__select {
  /* Dark-mode native popup: tell the browser to render the dropdown
     panel itself in dark too (Chrome / Safari / Firefox honor this). */
  color-scheme: dark;
}

/* Legacy classnames retained for older bundled HTML in the wild
   (pre-FR-2728 pill row). These rules still apply real styling
   (padding / font / colors / current-state background) so the
   pill-row variant continues to render correctly, just without
   the new BAI select chrome. */
.lang-switcher__item {
  display: inline-block;
  padding: 4px 9px;
  font-size: 12px;
  line-height: 1.2;
  border-radius: 4px;
  color: var(--bai-text-2);
  text-decoration: none;
}

.lang-switcher__item--current {
  background: var(--bai-primary);
  color: #fff;
}

/* ==========================================================================
   Home page (FR-2737)
   ==========================================================================
   The home page reuses the doc layout chrome (topbar, sidebar, footer,
   search palette) but its <main> body is structured differently — a
   hero block, a two-column intro, and a category-card grid that
   doubles as a topical index. The .doc-main--home opt-in widens the
   content column slightly and removes the chapter top padding so the
   hero can breathe.
   ========================================================================== */
/*
 * The home page does not emit a right-rail .doc-toc (it has no
 * headings to scroll-spy), so the default .doc-page 3-column grid
 * (sidebar + main + TOC) leaves an empty 240px column on the right
 * and main sits flush against the sidebar — making the hero look
 * left-shifted on wide viewports. The .doc-page--home modifier is
 * already emitted on the home page outer div; collapse the grid to
 * two columns there and center the (max-width 960px) main inside
 * the post-sidebar region.
 */
.doc-page--home {
  grid-template-columns: var(--bai-sider-w) minmax(0, 1fr);
}

.doc-main--home {
  padding-top: 56px;
  max-width: 960px;
}

.home-article {
  display: flex;
  flex-direction: column;
  gap: 56px;
}

.home-hero {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--bai-border);
}

.home-hero__eyebrow {
  margin: 0;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--bai-primary);
}

.home-hero__title {
  margin: 0;
  font-size: 34px;
  line-height: 1.2;
  letter-spacing: -0.01em;
  font-weight: 700;
  color: var(--bai-text);
}

.home-hero__lede {
  margin: 0;
  font-size: 16px;
  line-height: 1.65;
  color: var(--bai-text-2);
}

.home-hero__cta-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.home-hero__hint {
  margin: 0;
  font-size: 13px;
  color: var(--bai-text-3);
}

.home-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid transparent;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease, transform 120ms ease;
}

.home-cta__arrow {
  transition: transform 120ms ease;
}

.home-cta--primary {
  background: var(--bai-primary);
  color: #fff;
}

.home-cta--primary:hover {
  background: var(--bai-primary-hover);
  color: #fff;
}

.home-cta--primary:hover .home-cta__arrow {
  transform: translateX(2px);
}

.home-cta--secondary {
  background: transparent;
  color: var(--bai-text);
  border-color: var(--bai-border);
}

.home-cta--secondary:hover {
  border-color: var(--bai-primary);
  color: var(--bai-primary);
}

.home-section {
  display: grid;
  gap: 12px;
}

.home-section__title {
  margin: 0;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 700;
  color: var(--bai-text);
}

.home-section__body {
  margin: 0;
  font-size: 15px;
  line-height: 1.65;
  color: var(--bai-text-2);
}

.home-section--intro {
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

@media (max-width: 720px) {
  .home-section--intro {
    grid-template-columns: 1fr;
  }
}

.home-section__col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.home-browse__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.home-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px 18px 16px;
  border: 1px solid var(--bai-border);
  border-radius: 10px;
  background: var(--bai-bg);
  color: var(--bai-text);
  text-decoration: none;
  transition: border-color 120ms ease, background 120ms ease, transform 120ms ease;
}

.home-card:hover {
  border-color: var(--bai-primary);
  background: var(--bai-primary-soft);
  transform: translateY(-1px);
}

.home-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.home-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--bai-primary-soft);
  color: var(--bai-primary);
}

.home-card__icon svg {
  width: 16px;
  height: 16px;
}

.home-card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--bai-text);
}

.home-card__count {
  margin: 0;
  font-size: 12.5px;
  color: var(--bai-text-3);
}

/* Pagination Navigation (FR-2726 Phase 3 — BAI pager card style) */
.pagination-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 60px;
}

.pagination-nav__link {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 18px;
  border: 1px solid var(--bai-border);
  border-radius: var(--bai-radius);
  background: var(--bai-bg);
  color: var(--bai-text);
  text-decoration: none;
  transition: border-color 0.15s, background 0.15s;
}

.pagination-nav__link:hover {
  border-color: var(--bai-primary);
  background: var(--bai-bg-muted);
  text-decoration: none;
  color: var(--bai-text);
}

.pagination-nav__link--next {
  text-align: right;
  align-items: flex-end;
}

.pagination-nav__sublabel {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: var(--bai-text-3);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.pagination-nav__label {
  font-family: var(--bai-font-heading);
  font-size: 16px;
  font-weight: 600;
  color: var(--bai-text);
  margin: 0;
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
  /* Match the desktop hide rule's specificity so the responsive show
     actually wins (FR-2728 follow-up). */
  .bai-topbar .bai-topbar__menu {
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
  /* The pager is a CSS grid (Phase 3); collapse to a single column on
     narrow viewports — flex-direction has no effect on a grid. */
  .pagination-nav {
    grid-template-columns: 1fr;
  }
  .pagination-nav__link--next {
    text-align: left;
    align-items: flex-start;
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
   Version-mismatch UX (FR-2723; redesigned in FR-2733)

   Two visual variants share the same DOM scaffolding and dismiss script:
   - .docs-banner--outdated: warn-yellow, triangle-alert icon. Shown on
     older release minors.
   - .docs-banner--preview: BAI primary (orange) soft tint, sparkle icon.
     Shown on the unreleased "next" channel.

   The legacy .docs-banner--view-latest modifier is preserved on every
   variant so templates/assets/version-banner.js (which selects on that
   class) keeps working without changes.

   Notice block (.docs-notice--not-in-version) sits below the banner and
   is shown after a version-switcher fallback navigation. It carries its
   own neutral palette and is not part of the banner-variant family.
   ========================================================================== */
.docs-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 22px;
  border-bottom: 1px solid var(--bai-border);
  position: sticky;
  top: var(--bai-topbar-h);
  z-index: 40;
  font-size: 13px;
  line-height: 1.5;
}
.docs-banner[hidden] { display: none; }

/* Variant treatments. Higher specificity (.docs-banner.docs-banner--*)
   wins over the base .docs-banner background/border, so order in the
   stylesheet does not matter. */
.docs-banner.docs-banner--outdated {
  background: #FFF6D6;
  border-bottom-color: rgba(255, 191, 0, 0.4);
  color: #6B5300;
}
.docs-banner.docs-banner--preview {
  background: var(--bai-primary-soft, #FFF4E5);
  border-bottom-color: rgba(255, 122, 0, 0.4);
  color: #8A4200;
}
[data-theme="dark"] .docs-banner.docs-banner--outdated {
  background: #3A2F0E;
  border-bottom-color: rgba(255, 191, 0, 0.4);
  color: #FFD877;
}
[data-theme="dark"] .docs-banner.docs-banner--preview {
  background: #3D2410;
  border-bottom-color: rgba(255, 122, 0, 0.4);
  color: #FFC388;
}

.docs-banner__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.docs-banner.docs-banner--outdated .docs-banner__icon { color: #B88A00; }
.docs-banner.docs-banner--preview  .docs-banner__icon { color: var(--bai-primary); }

.docs-banner__body {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.docs-banner__title { font-weight: 600; }
.docs-banner__desc { font-weight: 400; opacity: 0.9; }

.docs-banner__link {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-thickness: 1px;
  font-weight: 500;
}
.docs-banner__link:hover {
  text-decoration-thickness: 2px;
}

.docs-banner__dismiss {
  flex: 0 0 auto;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  border-radius: 4px;
  opacity: 0.7;
}
.docs-banner__dismiss:hover {
  background: rgba(0, 0, 0, 0.08);
  opacity: 1;
}
[data-theme="dark"] .docs-banner__dismiss:hover {
  background: rgba(255, 255, 255, 0.10);
}

@media (max-width: 640px) {
  .docs-banner { padding: 10px 16px; font-size: 12.5px; }
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
   Per-version PDF download card (FR-2732)
   --------------------------------------------------------------------------
   The card is rendered ONLY on the per-language landing page
   (\`<version>/<lang>/index.html\`) when \`versions[].pdfTag\` is set.
   The landing page is intentionally stylesheet-free in the no-tag
   baseline (byte-equivalence with the legacy meta-refresh stub), so
   the card ships its own inline copy of these rules. The class
   definitions are mirrored here so consumers who want to extend the
   card (e.g., add it to the topbar in a future phase) can rely on the
   shared stylesheet.
   ========================================================================== */
.pdf-download-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--bai-border);
  border-radius: var(--bai-radius);
  background: var(--bai-primary-soft);
  color: var(--bai-text);
  text-decoration: none;
  font-weight: 500;
}
.pdf-download-card:hover {
  border-color: var(--bai-primary);
  color: var(--bai-primary);
}
.pdf-download-card:focus-visible {
  outline: 2px solid var(--bai-primary);
  outline-offset: 2px;
}
.pdf-download-card__icon {
  display: inline-flex;
  color: var(--bai-primary);
}
.pdf-download-card__label {
  flex: 1 1 auto;
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
