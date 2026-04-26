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

  --doc-sidebar-width: 260px;
  /* F3: right-rail "On this page" TOC width. Coexists with sidebar (260px)
     and main column (~720-960px) on a desktop CSS grid. */
  --doc-toc-width: 220px;
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
   Page Layout — F3 three-column grid
   --------------------------------------------------------------------------
   Desktop: [sidebar] [main, max ~960px] [right-rail TOC, fixed width].
   The grid lets the right-rail size predictably and lets the main column
   fill any spare width. Below 1100px the right-rail collapses (see the
   responsive section near the end of this file).
   ========================================================================== */
.doc-page {
  display: grid;
  grid-template-columns: var(--doc-sidebar-width) minmax(0, 1fr) var(--doc-toc-width);
  min-height: 100vh;
}

.doc-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  border-right: 1px solid var(--ifm-color-emphasis-200);
  background: var(--ifm-color-emphasis-0);
  padding: 1rem 0;
}

.doc-sidebar-header {
  padding: 0.5rem 1rem 1rem;
  border-bottom: 1px solid var(--ifm-color-emphasis-200);
  margin-bottom: 0.5rem;
}

.doc-sidebar-header h2 {
  font-size: 1.1rem;
  margin: 0 0 0.25rem 0;
  font-weight: 700;
  color: var(--ifm-color-emphasis-900);
}

.doc-sidebar-header .doc-meta {
  font-size: 0.8rem;
  color: var(--ifm-color-emphasis-600);
}

/* Search */
.doc-search {
  padding: 0.5rem 1rem;
  position: relative;
}

.doc-search input {
  width: 100%;
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: var(--ifm-pre-border-radius);
  background: var(--ifm-color-emphasis-0);
  outline: none;
  font-family: var(--ifm-font-family-base);
}

.doc-search input:focus {
  border-color: var(--ifm-color-primary);
  box-shadow: 0 0 0 2px rgba(53, 120, 229, 0.15);
}

.search-results {
  position: absolute;
  top: 100%;
  left: 1rem;
  right: 1rem;
  background: var(--ifm-color-emphasis-0);
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: var(--ifm-pre-border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  max-height: 400px;
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
  display: block;
  padding: 0.55rem 1rem 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ifm-color-emphasis-700);
  user-select: none;
  list-style: none;
  position: relative;
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
  position: absolute;
  right: 1rem;
  top: 50%;
  width: 0.5rem;
  height: 0.5rem;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: translateY(-65%) rotate(-45deg);
  transition: transform 120ms ease;
}

.doc-sidebar-group[open] > summary::after {
  transform: translateY(-30%) rotate(45deg);
}

.doc-sidebar-group > summary:hover {
  color: var(--ifm-color-primary);
}

.doc-sidebar-group[open] > summary {
  margin-bottom: 0.25rem;
}

.doc-sidebar-nav {
  list-style: none;
  padding: 0;
  margin: 0 0 0.5rem 0;
}

.doc-sidebar-nav > li {
  margin: 0;
}

.doc-sidebar-nav > li > a {
  display: block;
  padding: 0.4rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ifm-color-emphasis-800);
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.doc-sidebar-nav--grouped > li > a {
  /* Slightly indented so items visually nest under the category header. */
  padding-left: 1.5rem;
}

.doc-sidebar-nav > li > a:hover {
  background: var(--ifm-color-emphasis-100);
  color: var(--ifm-color-primary);
}

.doc-sidebar-nav > li > a.active {
  border-left-color: var(--ifm-color-primary);
  color: var(--ifm-color-primary);
  background: rgba(53, 120, 229, 0.06);
}

.doc-main {
  min-width: 0;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 2.5rem;
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
   Page Header Bar (website mode) — F1: language switcher slot.
   F4 (Copy button toggle) and F6 (version selector) will hang off the same
   <nav class="page-header-nav"> region.
   ========================================================================== */
.page-header-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--ifm-color-emphasis-200);
}

.page-header-nav {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.lang-switcher {
  display: inline-flex;
  gap: 0.25rem;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 0.4rem;
  padding: 0.15rem;
  background: var(--ifm-color-emphasis-0);
}

.lang-switcher__item {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  line-height: 1.2;
  border-radius: 0.25rem;
  color: var(--ifm-color-emphasis-700);
  text-decoration: none;
  transition: background-color 120ms ease, color 120ms ease;
}

.lang-switcher__item:hover,
.lang-switcher__item:focus {
  background: var(--ifm-color-emphasis-100);
  color: var(--ifm-color-emphasis-900);
  text-decoration: none;
}

.lang-switcher__item--current {
  background: var(--ifm-color-primary);
  color: #fff;
  cursor: default;
}

.lang-switcher__item--current:hover,
.lang-switcher__item--current:focus {
  background: var(--ifm-color-primary-dark);
  color: #fff;
}

.lang-switcher__item--unavailable {
  color: var(--ifm-color-emphasis-500);
}

.lang-switcher__item--unavailable:hover,
.lang-switcher__item--unavailable:focus {
  background: var(--ifm-color-emphasis-100);
  color: var(--ifm-color-emphasis-700);
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
  margin: 0 0 1rem 0;
  font-size: 0.85rem;
  color: var(--ifm-color-emphasis-700);
}

.breadcrumb__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.5rem;
  align-items: center;
}

.breadcrumb__item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.breadcrumb__item + .breadcrumb__item::before {
  /* Note: NOT a > glyph (which would conflict with HTML escaping in some
     reading-mode tools). U+203A SINGLE RIGHT-POINTING ANGLE QUOTATION MARK
     reads naturally in all four supported languages. */
  content: "›";
  color: var(--ifm-color-emphasis-500);
}

.breadcrumb__link {
  color: var(--ifm-color-primary);
  text-decoration: none;
}

.breadcrumb__link:hover {
  text-decoration: underline;
}

.breadcrumb__item--current {
  color: var(--ifm-color-emphasis-900);
  font-weight: 600;
}

.breadcrumb__item--category {
  /* Category is non-navigable (no per-category landing page), so render as
     plain text rather than implying it's a link. */
  color: var(--ifm-color-emphasis-700);
}

/* ==========================================================================
   Right-rail "On this page" TOC (F3)
   --------------------------------------------------------------------------
   Sticky aside in the third grid column on desktop. IntersectionObserver
   scroll-spy adds .is-active to the link whose section is in view.
   ========================================================================== */
.doc-toc {
  position: sticky;
  top: 0;
  align-self: start;
  height: 100vh;
  overflow-y: auto;
  padding: 2rem 1rem 2rem 1.5rem;
  font-size: 0.85rem;
  border-left: 1px solid var(--ifm-color-emphasis-200);
}

.doc-toc[data-empty="true"] .doc-toc__heading,
.doc-toc[data-empty="true"] .doc-toc__list {
  /* Hide the heading when there is nothing to list. We still render the
     aside element (preserves grid column width) so layout does not shift
     between pages with and without TOC entries. */
  display: none;
}

.doc-toc__heading {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ifm-color-emphasis-700);
  margin-bottom: 0.75rem;
}

.doc-toc__list {
  list-style: none;
  padding: 0;
  margin: 0;
  border-left: 1px solid var(--ifm-color-emphasis-200);
}

.doc-toc__item {
  margin: 0;
}

.doc-toc__item--h3 {
  /* Sub-items rendered with extra left padding so the visual hierarchy
     mirrors the heading levels they reference. */
  padding-left: 0.75rem;
}

.doc-toc__link {
  display: block;
  padding: 0.25rem 0.75rem;
  margin-left: -1px;
  border-left: 2px solid transparent;
  color: var(--ifm-color-emphasis-700);
  text-decoration: none;
  line-height: 1.35;
  transition: color 120ms ease, border-color 120ms ease, background 120ms ease;
}

.doc-toc__link:hover {
  color: var(--ifm-color-primary);
  text-decoration: none;
}

.doc-toc__link.is-active {
  color: var(--ifm-color-primary);
  border-left-color: var(--ifm-color-primary);
  background: rgba(53, 120, 229, 0.06);
}

/* ==========================================================================
   Responsive
   --------------------------------------------------------------------------
   Two breakpoints:
     - 1100px: drop the right-rail TOC. Its content is still anchor-
       reachable from inline headings; on a narrow viewport the prose
       column needs the room more than the rail does. The rail HTML stays
       in place (we don't move it inline; that would require JS) — it just
       isn't displayed.
     - 768px: collapse the sidebar to a top strip and let the page flow
       in a single column.
   ========================================================================== */
@media (max-width: 1100px) {
  .doc-page {
    grid-template-columns: var(--doc-sidebar-width) minmax(0, 1fr);
  }
  .doc-toc {
    display: none;
  }
}

@media (max-width: 768px) {
  .doc-page {
    grid-template-columns: 1fr;
  }
  .doc-sidebar {
    position: static;
    width: 100%;
    height: auto;
    max-height: 40vh;
    border-right: none;
    border-bottom: 1px solid var(--ifm-color-emphasis-200);
  }
  .doc-main {
    padding: 1.5rem;
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
  .breadcrumb {
    font-size: 0.8rem;
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
