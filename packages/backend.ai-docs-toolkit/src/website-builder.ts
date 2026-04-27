/**
 * Multi-page HTML builder for static website generation.
 * Generates individual HTML pages from processed chapters with sidebar navigation.
 *
 * F3 layout (this file owns the page template):
 *
 *   <body>
 *     <div class="doc-page">                    ← CSS grid: sidebar | main | rail
 *       <aside class="doc-sidebar">             ← collapsible category groups
 *       <main class="doc-main">
 *         <header class="page-header-bar">      ← language switcher (F1) + future
 *         <nav class="breadcrumb">              ← Home › Category › Title (F3)
 *         <section class="chapter">             ← markdown body
 *         <div class="page-footer">             ← edit-this-page + prev/next
 *       <aside class="doc-toc">                 ← right-rail "On this page" (F3)
 *
 * The right-rail TOC and breadcrumb together replace the legacy
 * sidebar-embedded H2 list.
 */

import type { Chapter } from "./markdown-processor.js";
import type { NavGroup, NavItem } from "./book-config.js";
import type { ResolvedBrandingConfig, ResolvedDocConfig } from "./config.js";
import {
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_PRIMARY_COLOR_HOVER,
  DEFAULT_PRIMARY_COLOR_SOFT,
  WEBSITE_LABELS,
} from "./config.js";
import { escapeHtml } from "./markdown-extensions.js";
import {
  RESERVED_HOME_SLUG,
  slugFromNavPath,
  slugify,
} from "./markdown-processor.js";
import {
  buildJsonLd,
  buildOgTags,
  buildTwitterCard,
  extractDescription,
  joinBaseUrl,
} from "./seo.js";

export interface WebPageContext {
  /** Current chapter to render */
  chapter: Chapter;
  /** All chapters for sidebar navigation */
  allChapters: Chapter[];
  /** Index of current chapter in allChapters */
  currentIndex: number;
  /** Document metadata */
  metadata: WebsiteMetadata;
  /** Resolved toolkit config */
  config: ResolvedDocConfig;
  /** Navigation entry path for current chapter (e.g. "vfolder/vfolder.md") */
  navPath?: string;
  /** Last modified date string for this page (pre-formatted) */
  lastUpdated?: string;
  /** Hashed asset filenames keyed by logical name (e.g. "styles.css" → "styles.deadbeef.css"). */
  assets: PageAssets;
  /**
   * Per-language switcher links for this exact chapter. Always contains one
   * entry per language declared in `book.config.yaml` (including the current
   * language). Languages where the chapter is missing are still listed but
   * marked `available: false`.
   */
  peers: LanguagePeer[];
  /**
   * F3 grouped navigation for the current language. Always present — even
   * legacy flat configs are wrapped in a single anonymous-category group
   * by the loader. Sidebar render walks this directly so groups stay in
   * authored order.
   */
  navGroups: NavGroup[];
  /**
   * F3 category for the current chapter (the group that contains it).
   * Empty string when the page falls into the synthetic uncategorized
   * group (legacy flat configs) — breadcrumb omits the middle segment in
   * that case.
   */
  category: string;
  /**
   * Versioned-docs context (F6). Optional — only set when the build is
   * running in versioned mode (`versions` declared in config). Drives
   * the header version selector and the "is this the latest?" hint
   * the page metadata bar can show.
   */
  versionContext?: PageVersionContext;
  /**
   * SEO metadata context (F2). Optional — when omitted, only the base
   * `<head>` tags (title, viewport, stylesheet, favicons) are emitted.
   * When supplied, F2's per-page tags (description, OG, Twitter,
   * canonical, JSON-LD) are added to the head block. The website
   * generator builds this from `og` config + page-relative paths +
   * lastModified date.
   */
  seo?: PageSeoContext;
}

/**
 * Per-page SEO context. Built once per (version, lang, slug) by the
 * website generator and threaded through to the head builder. All
 * URL fields are RELATIVE to the website output root (`dist/web/`)
 * unless explicitly absolute. The head builder converts to absolute
 * with `og.baseUrl` only when emitting the OG / canonical tags.
 */
export interface PageSeoContext {
  /**
   * Public deploy URL, e.g. `https://docs.backend.ai`. When `undefined`,
   * the head builder omits the canonical tag and `og:url`, and the
   * sitemap-emitter step is skipped at the generator level.
   */
  baseUrl?: string;
  /** `og:site_name` / JSON-LD publisher name. Defaults to doc title. */
  siteName?: string;
  /**
   * Path to this page relative to the website output root, e.g.
   * `en/quickstart.html` (flat) or `25.16/en/quickstart.html` (versioned).
   * Used to compute `og:url`.
   */
  pagePath: string;
  /**
   * Path to the canonical URL relative to the website output root.
   * In versioned mode, points at the same slug under the latest
   * version (per F6's `canonicalPathFor`). In flat mode, equals
   * `pagePath`.
   */
  canonicalPath: string;
  /**
   * Default OG image path relative to the website output root, e.g.
   * `assets/og-default.png`. When `undefined` (Playwright unavailable
   * and no override), the `og:image` and `twitter:image` tags are
   * dropped.
   */
  ogImageRelUrl?: string;
  /** ISO-8601 last-modified timestamp for JSON-LD `dateModified`. */
  lastModifiedIso?: string;
  /** Publisher / author for JSON-LD. Falls back to `pdfMetadata.author`. */
  publisher?: string;
}

export interface WebsiteMetadata {
  title: string;
  version: string;
  lang: string;
  /**
   * All languages declared in `book.config.yaml`. Used to emit
   * `<link rel="alternate" hreflang="…">` tags and to render the language
   * switcher control in the page header (F1).
   */
  availableLanguages: string[];
}

/**
 * One entry in the per-page language switcher. The `href` is page-relative
 * (`../<peerLang>/<slug>.html`) so the link works for any deployment path.
 * `available: false` indicates the chapter is not present in the peer
 * language and the link falls back to that language's index page; the
 * switcher uses this signal to render a disabled state.
 */
export interface LanguagePeer {
  lang: string;
  label: string;
  href: string;
  available: boolean;
}

/**
 * Per-page version context. Built by the website generator from the
 * loaded `LoadedVersions` and the slug being rendered.
 */
export interface PageVersionContext {
  /** Current minor label, e.g. "25.16". */
  current: string;
  /** Full ordered list of minor labels for the dropdown. */
  allLabels: string[];
  /** Label of the entry marked `latest: true`. */
  latest: string;
  /**
   * For each version label, indicates whether the current page slug
   * exists there. Used to decide between "navigate to same slug" and
   * "fall back to that version's index". Built once per (lang, slug)
   * by the generator and reused across pages with that slug.
   */
  slugAvailability: Record<string, boolean>;
  /** Current page slug. Used by the inline switcher script for navigation. */
  slug: string;
  /**
   * Path depth from the current page back to the website output root.
   * For a page at `<dist>/web/<version>/<lang>/<slug>.html` this is 3
   * (`../../../`). Drives the relative-URL math the inline script uses
   * when navigating across versions.
   */
  rootDepth: number;
  /**
   * Optional GitHub release tag for the current version (FR-2731). When
   * present, downstream renderers may use it to build a PDF download
   * URL like `https://github.com/<org>/<repo>/releases/download/<pdfTag>/<asset>`.
   * `undefined` means "no PDF card" — renderers MUST suppress the card
   * entirely rather than coercing to an empty href. This sub-task wires
   * the value through; the actual UI rendering is implemented in a
   * follow-up sub-task.
   */
  pdfTag?: string;
}

/**
 * Resolved per-page asset filenames (already content-hashed by the
 * website generator). Pages live under `<lang>/foo.html` and reference
 * shared assets via `../assets/...`; site-root files (favicon,
 * apple-touch-icon, manifest) live at `dist/web/` and use `../`.
 */
export interface PageAssets {
  /** Hashed `styles.css` filename, e.g. `styles.deadbeef.css`. Required. */
  styles: string;
  /** Hashed `search.js` filename, e.g. `search.cafef00d.js`. Required. */
  search: string;
  /** Hashed `code-copy.js` filename. Optional — added by F4. */
  codeCopy?: string;
  /** Hashed `toc-scrollspy.js` filename. Optional — added by F3. */
  tocScrollspy?: string;
  /**
   * Hashed `version-banner.js` filename (FR-2723). Optional — only
   * present when the build runs in versioned mode. Powers both the
   * "view latest version" banner (per-session dismissal) and the
   * "not in selected version" inline notice (sessionStorage flag set
   * by the version-switcher script).
   */
  versionBanner?: string;
  /**
   * Hashed `interactions.js` filename (FR-2726 Phase 4). Optional —
   * only present when the toolkit ships the template asset. Bundles
   * the theme toggle, mobile drawer, and search palette interactions
   * in a single script for per-page JS budget tightness.
   */
  interactions?: string;
  /** Site-root favicon filename, e.g. `favicon.ico`. */
  favicon?: string;
  /** Site-root apple-touch-icon filename, e.g. `apple-touch-icon.png`. */
  appleTouchIcon?: string;
  /** Site-root web app manifest filename, e.g. `site.webmanifest`. */
  webmanifest?: string;
  /**
   * Hashed light-theme brand logo filename (FR-2726 Phase 2). Optional —
   * present only when the consumer configured `branding.logoLight` in
   * `docs-toolkit.config.yaml`. Topbar omits the `<img>` and renders a
   * text fallback when both light and dark are absent.
   */
  brandLogoLight?: string;
  /**
   * Hashed dark-theme brand logo filename (FR-2726 Phase 2). Optional —
   * falls back to `brandLogoLight` when only light is configured. The
   * topbar uses `<picture>` + `prefers-color-scheme: dark` to swap.
   */
  brandLogoDark?: string;
}

/**
 * Build sidebar HTML for a multi-page website.
 *
 * F3 — categories render as `<details>` drawers (CSS-only, no runtime JS).
 * The active page's category is `<details open>` so it shows on first load;
 * other categories are collapsed by default. The synthetic anonymous group
 * (legacy flat input) renders as a flat list with no drawer wrapper, so a
 * config that hasn't migrated to grouped form looks identical to F1.
 */
function buildWebsiteSidebar(
  chapters: Chapter[],
  currentIndex: number,
  metadata: WebsiteMetadata,
  config: ResolvedDocConfig,
  navGroups: NavGroup[],
  versionSwitcherHtml: string = "",
): string {
  const langLabel = config.languageLabels[metadata.lang] || metadata.lang;

  // Build a map of nav.path -> index in `chapters` so we can render the
  // group's items in `book.config.yaml` order while still highlighting the
  // active one (which is identified by index, not by path/title).
  const indexByPath = new Map<string, number>();
  // The chapter index sequence matches the flattened nav order produced by
  // `loadBookConfig`, but path may not be on the Chapter (it's derived
  // from nav). Walk navGroups + a mirror counter so we know each item's
  // global index.
  let counter = 0;
  for (const group of navGroups) {
    for (const item of group.items) {
      indexByPath.set(item.path, counter);
      counter++;
    }
  }

  const renderItem = (item: NavItem, globalIndex: number): string => {
    const num = globalIndex + 1;
    const chapter = chapters[globalIndex];
    if (!chapter) {
      // Defensive fallback: chapter array length and nav length should
      // always match because both are derived from the same flattened
      // navigation. If they don't, render a plain text entry rather than
      // throwing — keeps the build alive while the mismatch is debugged.
      return `<li><span>${num}. ${escapeHtml(item.title)}</span></li>`;
    }
    const isActive = globalIndex === currentIndex;
    const href = `./${chapter.slug}.html`;
    const activeClass = isActive ? ' class="active" aria-current="page"' : "";
    return `<li><a href="${href}"${activeClass}>${num}. ${escapeHtml(chapter.title)}</a></li>`;
  };

  const renderGroup = (group: NavGroup, isAnonymous: boolean): string => {
    const itemsHtml = group.items
      .map((item) => renderItem(item, indexByPath.get(item.path) ?? -1))
      .join("\n");

    if (isAnonymous) {
      // Legacy flat config — no `<details>` drawer, just a flat list.
      return `<ul class="doc-sidebar-nav">${itemsHtml}</ul>`;
    }

    const containsActive = group.items.some(
      (item) => indexByPath.get(item.path) === currentIndex,
    );
    const openAttr = containsActive ? " open" : "";
    const groupSlug = slugify(group.category) || "group";
    // Phase 2 (FR-2726): each summary now carries a leading icon + a
    // trailing count pill matching the BAI sider pattern. FR-2737:
    // pass the whole group so the icon helper can key off the first
    // item's path (language-stable) instead of the localized label.
    const iconSvg = sidebarCategoryIconSvg(group);
    const itemCount = group.items.length;
    return `<details class="doc-sidebar-group"${openAttr}>
  <summary class="doc-sidebar-group__summary">
    <span class="doc-sidebar-group__icon" aria-hidden="true">${iconSvg}</span>
    <span class="doc-sidebar-group__label">${escapeHtml(group.category)}</span>
    <span class="doc-sidebar-group__count" aria-label="${itemCount} pages">${itemCount}</span>
  </summary>
  <ul class="doc-sidebar-nav doc-sidebar-nav--grouped" data-group="${escapeHtml(groupSlug)}">
    ${itemsHtml}
  </ul>
</details>`;
  };

  const isLegacyFlat = navGroups.length === 1 && navGroups[0].category === "";
  const groupsHtml = navGroups
    .map((g) => renderGroup(g, isLegacyFlat))
    .join("\n");

  // Phase 2 (FR-2726): the brand block, version pill, and search input now
  // live in the topbar. The legacy sidebar header / search input are
  // intentionally omitted from the new output — keeping the language label
  // unused here is fine; \`langLabel\` is referenced earlier in this file
  // for the legacy code path.
  void langLabel;

  // FR-2733: when versioned-mode is on, render a `.doc-sidebar-version`
  // block at the very top of the aside (above the nav groups). The block
  // wraps the same `<select.version-switcher>` that used to live in the
  // topbar, paired with a small uppercase localized "VERSION" label so
  // its purpose is clear without inheriting the topbar's tight chrome.
  // When `versionSwitcherHtml` is empty (non-versioned build), nothing
  // is rendered and the sidebar opens directly with the nav.
  const labels = WEBSITE_LABELS[metadata.lang] ?? WEBSITE_LABELS.en;
  const versionLabel = labels.versionLabel ?? "Version";
  const versionBlockHtml = versionSwitcherHtml
    ? `  <div class="doc-sidebar-version">
    <span class="doc-sidebar-version__label">${escapeHtml(versionLabel)}</span>
    ${versionSwitcherHtml}
  </div>
`
    : "";

  return `
<aside class="doc-sidebar">
${versionBlockHtml}  <nav class="doc-sidebar-groups" aria-label="Documentation navigation">
    ${groupsHtml}
  </nav>
</aside>`;
}

/**
 * Inline SVG icon for a sidebar category header.
 *
 * Originally (FR-2726 Phase 2) the mapping keyed off the localized
 * category label and only matched English. That meant the Korean /
 * Japanese / Thai sidebars all collapsed to the generic "stack" icon
 * for every category — visually identical drawers with no per-topic
 * cue.
 *
 * FR-2737 fixes that by deriving the icon from the FIRST item's
 * navigation path instead of the localized label. Paths in
 * `book.config.yaml` are identical across every language (only titles
 * are translated), so the same group resolves to the same icon in
 * every language. The English label match is kept as a soft fallback
 * for projects that re-order their nav so a non-Backend.AI first
 * item shows up under a familiar English category name.
 */
function sidebarCategoryIconSvg(group: NavGroup): string {
  // 1) Language-stable path lookup. The slug of the group's first item
  //    uniquely identifies the canonical Backend.AI WebUI category
  //    even after the label is translated. Matches the on-disk
  //    filename convention (`<topic>.md` or `<topic>/<topic>.md`).
  //    Defensive guard: a synthetic empty group would make the path
  //    empty, which `slugFromNavPath` would reject. Fall through to
  //    the label / stack-icon fallbacks below in that case rather
  //    than crashing the build.
  const firstPath = group.items[0]?.path;
  const firstSlug = firstPath ? slugFromNavPath(firstPath) : "";
  const slugIcon: Record<string, string> = {
    quickstart: ICON_ROCKET, // Getting Started
    session_page: ICON_BOX, // Workloads
    vfolder: ICON_FOLDER, // Storage & Data
    user_settings: ICON_SETTINGS, // Administration
    trouble_shooting: ICON_BOOK, // Reference
  };
  if (slugIcon[firstSlug]) return slugIcon[firstSlug];

  // 2) Fallback: English category-label lookup. Useful for downstream
  //    consumers that build their own nav groups with the canonical
  //    English headings but a different first item, and for legacy
  //    book configs that haven't been re-keyed yet.
  const labelKey = group.category.trim().toLowerCase();
  const labelIcon: Record<string, string> = {
    "getting started": ICON_ROCKET,
    workloads: ICON_BOX,
    "storage & data": ICON_FOLDER,
    "storage and data": ICON_FOLDER,
    administration: ICON_SETTINGS,
    reference: ICON_BOOK,
  };
  if (labelIcon[labelKey]) return labelIcon[labelKey];

  // 3) Last resort: generic "stack of pages" so every category still
  //    gets some visual anchor.
  return ICON_STACK;
}

/**
 * Lucide `languages` icon — used to signal the purpose of the topbar
 * language switcher (FR-2737). Inline SVG, currentColor stroke so it
 * inherits the surrounding text color in both light and dark themes.
 * Source: https://lucide.dev/icons/languages
 */
const LUCIDE_LANGUAGES_ICON_SVG = `<svg class="lang-switcher__icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>`;

// Canonical Lucide `rocket` icon. Swapped in (FR-2737) for the
// hand-drawn placeholder, whose silhouette read as a horizontal blob
// at 14px. Source: https://lucide.dev/icons/rocket
const ICON_ROCKET = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`;
const ICON_BOX = `<svg width="14" height="14" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="m12 3 9 5v8l-9 5-9-5V8l9-5Z"/><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="m3 8 9 5 9-5M12 13v8"/></svg>`;
const ICON_FOLDER = `<svg width="14" height="14" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg>`;
const ICON_SETTINGS = `<svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>`;
const ICON_BOOK = `<svg width="14" height="14" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14ZM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>`;
const ICON_STACK = `<svg width="14" height="14" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="m12 3 9 5-9 5-9-5 9-5Z"/><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="m3 13 9 5 9-5"/></svg>`;

/**
 * Build the breadcrumb trail (F3): `Home › Category › Page Title`. When the
 * page belongs to the synthetic uncategorized group, the middle segment is
 * dropped — `Home › Page Title`. Each segment except the last is a link.
 *
 * "Home" links to the language's `index.html` (the per-language landing
 * page). It is intentionally not a cross-language site root link — the
 * language picker at `dist/web/index.html` is reachable via the language
 * switcher in the page header.
 */
function buildBreadcrumb(
  chapter: Chapter,
  category: string,
  lang: string,
): string {
  const labels = WEBSITE_LABELS[lang] ?? WEBSITE_LABELS.en;
  const homeLabel = labels.home ?? "Home";
  const segments: string[] = [
    `<li class="breadcrumb__item"><a class="breadcrumb__link" href="./index.html">${escapeHtml(homeLabel)}</a></li>`,
  ];
  if (category) {
    // Category is not a navigable destination on its own (no per-category
    // landing page), so render it as plain text rather than a stub link.
    segments.push(
      `<li class="breadcrumb__item breadcrumb__item--category">${escapeHtml(category)}</li>`,
    );
  }
  segments.push(
    `<li class="breadcrumb__item breadcrumb__item--current" aria-current="page">${escapeHtml(chapter.title)}</li>`,
  );
  return `<nav class="breadcrumb" aria-label="Breadcrumb">
  <ol class="breadcrumb__list">
    ${segments.join("\n    ")}
  </ol>
</nav>`;
}

/**
 * Build the right-rail "On this page" TOC (F3). Lists H2 + H3 only — H4+
 * are excluded to keep the rail short on long chapters. Anchors are the
 * heading IDs already produced by the markdown pipeline.
 *
 * The list is plain `<a>` links; the scroll-spy script (toc-scrollspy.js)
 * adds a `.is-active` class to the link whose section is currently in
 * view. When there are no H2 headings, the rail renders empty so the
 * layout grid column doesn't shift between pages.
 */
function buildRightRailToc(
  chapter: Chapter,
  lang: string,
  config: ResolvedDocConfig,
  navPath: string | undefined,
): string {
  const labels = WEBSITE_LABELS[lang] ?? WEBSITE_LABELS.en;
  const heading = labels.onThisPage ?? "On this page";
  const items = chapter.headings.filter((h) => h.level === 2 || h.level === 3);

  // Get-help section (FR-2726 Phase 2): edit-this-page + view-on-github.
  // Rendered below the scroll-spy list. Only emitted when at least one
  // link can be built, so the rail doesn't show an empty heading.
  const contribHtml = buildTocGetHelp(config, navPath, lang);

  const isEmpty = items.length === 0;
  const tocList = isEmpty
    ? `<ul class="doc-toc__list"></ul>`
    : `<ul class="doc-toc__list">
      ${items
        .map(
          (h) =>
            `<li class="doc-toc__item doc-toc__item--h${h.level}"><a class="doc-toc__link" href="#${encodeURIComponent(h.id)}" data-toc-target="${escapeHtml(h.id)}">${escapeHtml(h.text)}</a></li>`,
        )
        .join("\n      ")}
  </ul>`;

  const dataEmpty = isEmpty ? ' data-empty="true"' : "";
  // The divider only appears when both sections are present, so the rail
  // doesn't show a stray separator on TOC-less or help-less pages.
  const divider =
    !isEmpty && contribHtml ? `<div class="doc-toc__divider"></div>` : "";

  return `<aside class="doc-toc" aria-labelledby="doc-toc-heading"${dataEmpty}>
  <div class="doc-toc__heading" id="doc-toc-heading">${escapeHtml(heading)}</div>
  ${tocList}
  ${divider}
  ${contribHtml}
</aside>`;
}

/**
 * Build the "Get help" link cluster shown below the scroll-spy list in
 * the right rail (FR-2726 Phase 2). Pulls "Edit this page" from
 * `editBaseUrl + lang/navPath` and "View on GitHub" from `repoUrl`.
 * Returns an empty string when neither can be built.
 */
function buildTocGetHelp(
  config: ResolvedDocConfig,
  navPath: string | undefined,
  lang: string,
): string {
  const labels = WEBSITE_LABELS[lang] ?? WEBSITE_LABELS.en;
  const links: string[] = [];

  const editBaseUrl = config.website?.editBaseUrl;
  if (editBaseUrl && navPath) {
    const editUrl = `${editBaseUrl}/${lang}/${navPath}`;
    const editIcon = `<svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/></svg>`;
    links.push(
      `<a class="doc-toc__link doc-toc__link--external" href="${escapeHtml(editUrl)}" target="_blank" rel="noopener noreferrer">${editIcon}${escapeHtml(labels.editThisPage)}</a>`,
    );
  }

  const repoUrl = config.website?.repoUrl;
  if (repoUrl) {
    const githubIcon = `<svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18a10.95 10.95 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z"/></svg>`;
    // The link text is intentionally the literal product name "GitHub"
    // rather than a translatable label — "GitHub" is a proper noun
    // recognized in every supported language. If a translatable
    // alternative becomes desired (e.g. "View on GitHub"), introduce a
    // dedicated WEBSITE_LABELS key for it; do NOT reuse `editThisPage`.
    links.push(
      `<a class="doc-toc__link doc-toc__link--external" href="${escapeHtml(repoUrl)}" target="_blank" rel="noopener noreferrer">${githubIcon}GitHub</a>`,
    );
  }

  if (links.length === 0) return "";

  // The heading reuses the "On this page" typographic style but with a
  // dedicated id-less heading element so it doesn't conflict with the
  // scroll-spy aria-label.
  return `<div class="doc-toc__contrib">
    <div class="doc-toc__heading">${escapeHtml(getHelpLabel(lang))}</div>
    ${links.join("\n    ")}
  </div>`;
}

/**
 * Localized "Get help" heading. Uses a small built-in map; falls back
 * to English. Phase 2 doesn't add this to WEBSITE_LABELS to keep the
 * existing label bucket additive — Phase 3 may consolidate.
 */
function getHelpLabel(lang: string): string {
  const map: Record<string, string> = {
    en: "Get help",
    ko: "도움 받기",
    ja: "ヘルプ",
    th: "ขอความช่วยเหลือ",
  };
  return map[lang] ?? map.en;
}

/**
 * Build the main content HTML for a single chapter.
 */
function buildPageContent(chapter: Chapter): string {
  return `<section class="chapter" id="chapter-${chapter.slug}">
${chapter.htmlContent}
</section>`;
}

/**
 * Build Previous/Next navigation buttons (Docusaurus-style).
 */
function buildPaginationNav(
  allChapters: Chapter[],
  currentIndex: number,
  lang: string,
): string {
  const labels = WEBSITE_LABELS[lang] ?? WEBSITE_LABELS.en;
  const prev = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const next =
    currentIndex < allChapters.length - 1
      ? allChapters[currentIndex + 1]
      : null;

  const prevHtml = prev
    ? `<a class="pagination-nav__link pagination-nav__link--prev" href="./${prev.slug}.html">
        <div class="pagination-nav__sublabel">${labels.previous}</div>
        <div class="pagination-nav__label">&laquo; ${escapeHtml(prev.title)}</div>
      </a>`
    : "<span></span>";

  const nextHtml = next
    ? `<a class="pagination-nav__link pagination-nav__link--next" href="./${next.slug}.html">
        <div class="pagination-nav__sublabel">${labels.next}</div>
        <div class="pagination-nav__label">${escapeHtml(next.title)} &raquo;</div>
      </a>`
    : "<span></span>";

  return `<nav class="pagination-nav" aria-label="Docs pages">
  ${prevHtml}
  ${nextHtml}
</nav>`;
}

/**
 * Site-level article footer (FR-2726 Phase 3). Renders a small
 * `© {year} {company} · {productName}` line at the bottom of every
 * article. Operators can extend it with secondary links via
 * `website.footerLinks` (Phase 3+ extension); the toolkit does not
 * own those today, so we ship just the copyright line.
 */
function buildArticleFooter(config: ResolvedDocConfig): string {
  const year = new Date().getFullYear();
  const rawCompany = (config.company || "").trim();
  const rawTitle = (config.title || "").trim();
  const rawProductName = (config.productName || rawTitle).trim();

  const segments: string[] = [];
  if (rawCompany) segments.push(`&copy; ${year} ${escapeHtml(rawCompany)}`);
  // Drop the productName segment when it equals the company or title to
  // avoid duplicate footer text like "© 2026 Lablup Inc. · Lablup Inc.".
  // The match is case-sensitive to keep the rule cheap and predictable.
  if (
    rawProductName &&
    rawProductName !== rawCompany &&
    rawProductName !== rawTitle
  ) {
    segments.push(escapeHtml(rawProductName));
  }
  if (segments.length === 0) return "";
  return `<footer class="docfoot">
  <div>${segments.join(" &middot; ")}</div>
</footer>`;
}

const EDIT_ICON_SVG =
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>';

/**
 * Build the page metadata bar: edit link (left) + last updated date (right).
 */
function buildPageMetadata(context: WebPageContext): string {
  const { metadata, config, navPath, lastUpdated } = context;
  const labels = WEBSITE_LABELS[metadata.lang] ?? WEBSITE_LABELS.en;
  const editBaseUrl = config.website?.editBaseUrl;

  let editHtml = "";
  if (editBaseUrl && navPath) {
    const editUrl = `${editBaseUrl}/${metadata.lang}/${navPath}`;
    editHtml = `<a class="edit-link" href="${editUrl}" target="_blank" rel="noopener noreferrer">${EDIT_ICON_SVG} ${labels.editThisPage}</a>`;
  }

  let lastUpdatedHtml = "";
  if (lastUpdated) {
    lastUpdatedHtml = `<span class="last-updated">${labels.lastUpdated} ${lastUpdated}</span>`;
  }

  if (!editHtml && !lastUpdatedHtml) return "";

  return `<div class="page-metadata">
  ${editHtml}
  ${lastUpdatedHtml}
</div>`;
}

/**
 * Compute the `..` prefix that points from a chapter page back to the
 * website output root (`dist/web/`). Pages at `<lang>/foo.html` need
 * one `..`; pages at `<version>/<lang>/foo.html` (versioned mode) need
 * two. Used for stylesheet, search script, favicon, and root-relative
 * navigation URLs so the same builder works in both layouts.
 */
function rootPrefix(context: { versionContext?: PageVersionContext }): string {
  const depth = context.versionContext?.rootDepth ?? 2;
  // Each segment between the page and `dist/web/` adds one `../`.
  // Depth 2 = `<lang>/foo.html` → 1 hop up. Depth 3 = `<v>/<lang>/foo.html` → 2 hops.
  const hops = Math.max(0, depth - 1);
  return "../".repeat(hops);
}

/**
 * Build the `<head>` block: meta tags + stylesheet + favicon / apple-touch /
 * webmanifest. The search script is referenced separately from `<body>` end.
 *
 * F2 (SEO) extends this with description / OG / Twitter / canonical /
 * JSON-LD when `seo` is supplied. The order is:
 *   - charset / viewport / title / stylesheet (always)
 *   - favicon / apple-touch / webmanifest (when bundled)
 *   - description (always when chapter has any prose)
 *   - canonical (when seo.baseUrl is set)
 *   - OG tags (always; omits absolute-URL tags when seo.baseUrl is unset)
 *   - Twitter card (always)
 *   - JSON-LD TechArticle (always)
 *
 * F1 (NOT in this worktree) injects `<link rel="alternate" hreflang>`
 * tags. F2's contribution stays additive — the F1 + F2 reconciliation
 * is mechanical.
 */
function buildHeadAssetTags(
  metadata: WebsiteMetadata,
  langLabel: string,
  pageTitle: string,
  chapterHeadline: string,
  chapterHtml: string,
  assets: PageAssets,
  prefix: string,
  seo: PageSeoContext | undefined,
  peers: LanguagePeer[],
): string {
  const lines: string[] = [
    `<meta charset="utf-8" />`,
    `<meta name="viewport" content="width=device-width, initial-scale=1" />`,
    `<title>${pageTitle} - ${escapeHtml(langLabel)}</title>`,
    // FR-2726 Phase 4 anti-FOUC: set data-theme BEFORE the stylesheet
    // is evaluated so dark-mode users don't see a light flash.
    buildThemeBootstrapScript(),
    `<link rel="stylesheet" href="${prefix}assets/${escapeHtml(assets.styles)}" />`,
  ];

  if (assets.favicon) {
    lines.push(
      `<link rel="icon" href="${prefix}${escapeHtml(assets.favicon)}" sizes="any" />`,
    );
  }
  if (assets.appleTouchIcon) {
    lines.push(
      `<link rel="apple-touch-icon" href="${prefix}${escapeHtml(assets.appleTouchIcon)}" />`,
    );
  }
  if (assets.webmanifest) {
    lines.push(
      `<link rel="manifest" href="${prefix}${escapeHtml(assets.webmanifest)}" />`,
    );
  }

  // ── F2: SEO / sharing metadata ────────────────────────────────
  // Description is extracted from the chapter HTML's first paragraph;
  // when the chapter has no prose (e.g. a stub page), we fall back to
  // the title so social-share previews still get a useful blurb.
  const description =
    extractDescription(chapterHtml) || stripChapterTitle(chapterHeadline);

  if (description) {
    lines.push(
      `<meta name="description" content="${escapeHtml(description)}" />`,
    );
  }

  if (seo) {
    // Canonical: when baseUrl is set, point at the absolute URL of the
    // canonical page (latest version's same slug, per F6). When baseUrl
    // is unset, fall back to a relative canonical pointing at the page
    // itself — better than no canonical at all because it still tells
    // crawlers "this URL is canonical for itself" (vs. ?utm_… etc.).
    const canonicalAbs = joinBaseUrl(seo.baseUrl, seo.canonicalPath);
    if (canonicalAbs) {
      lines.push(`<link rel="canonical" href="${escapeHtml(canonicalAbs)}" />`);
    } else {
      // Relative canonical: from this page back to the canonical path.
      // In flat mode, canonicalPath === pagePath, so the relative ref
      // is just "./<basename>" — but the simpler form is the bare
      // basename, which the browser resolves against the document URL.
      // We use `prefix + canonicalPath` so versioned-mode canonical
      // works (canonical lives in the latest-version subdir, possibly
      // a sibling to the current page).
      lines.push(
        `<link rel="canonical" href="${prefix}${escapeHtml(seo.canonicalPath)}" />`,
      );
    }

    const pageUrlAbs = joinBaseUrl(seo.baseUrl, seo.pagePath);
    const ogImageAbs = seo.ogImageRelUrl
      ? (joinBaseUrl(seo.baseUrl, seo.ogImageRelUrl) ??
        `${prefix}${seo.ogImageRelUrl}`)
      : undefined;

    const ogTags = buildOgTags({
      title: chapterHeadline,
      description: description || undefined,
      imageUrl: ogImageAbs,
      pageUrl: pageUrlAbs,
      siteName: seo.siteName,
      locale: metadata.lang,
    });
    for (const tag of ogTags) lines.push(tag);

    const twitterTags = buildTwitterCard({
      title: chapterHeadline,
      description: description || undefined,
      imageUrl: ogImageAbs,
    });
    for (const tag of twitterTags) lines.push(tag);

    lines.push(
      buildJsonLd({
        headline: chapterHeadline,
        description: description || undefined,
        inLanguage: metadata.lang,
        dateModified: seo.lastModifiedIso,
        author: seo.publisher,
        publisher: seo.publisher,
        url: pageUrlAbs,
        imageUrl: ogImageAbs,
      }),
    );
  }

  // hreflang alternates (F1). One per peer language plus an `x-default`
  // pointing at English (when present) — search engines use `x-default` to
  // pick a target for users whose preferred language is not listed.
  for (const peer of peers) {
    lines.push(
      `<link rel="alternate" hreflang="${escapeHtml(peer.lang)}" href="${escapeHtml(peer.href)}" />`,
    );
  }
  const xDefault =
    peers.find((p) => p.lang === "en" && p.available) ??
    peers.find((p) => p.available) ??
    peers[0];
  if (xDefault) {
    lines.push(
      `<link rel="alternate" hreflang="x-default" href="${escapeHtml(xDefault.href)}" />`,
    );
  }

  return lines.join("\n  ");
}

/**
 * Trim a "Chapter Title - Doc Title" composite back to just the chapter
 * portion, used as a description fallback when no prose paragraph
 * exists. The composite shape is built one layer up (`pageTitle =
 * "<chapter> - <doc title>"`); F2's description fallback prefers the
 * chapter portion alone since the doc title is already in `<title>`.
 */
function stripChapterTitle(headline: string): string {
  return headline.replace(/\s+-\s+.*$/, "").trim();
}

/**
 * Build the deferred search-script tag. Localized strings are passed via
 * a data attribute on `#search-input`, so the script itself stays
 * language-agnostic and can be content-hashed once.
 */
function buildSearchScriptTag(assets: PageAssets, prefix: string): string {
  return `<script defer src="${prefix}assets/${escapeHtml(assets.search)}"></script>`;
}

/**
 * Build optional code-copy script tag (added by F4). No-op until F4 lands.
 */
function buildCodeCopyScriptTag(assets: PageAssets, prefix: string): string {
  if (!assets.codeCopy) return "";
  return `<script defer src="${prefix}assets/${escapeHtml(assets.codeCopy)}"></script>`;
}

/**
 * Build optional version-banner script tag (FR-2723). Only emitted when
 * the build is in versioned mode — the script handles BOTH the
 * "view latest version" banner dismissal AND the "not in selected
 * version" notice that fires after a fallback navigation.
 */
function buildVersionBannerScriptTag(
  assets: PageAssets,
  prefix: string,
): string {
  if (!assets.versionBanner) return "";
  return `<script defer src="${prefix}assets/${escapeHtml(assets.versionBanner)}"></script>`;
}

// Inline SVG icons for the version banner (FR-2733 redesign). Kept as
// constants here — not in styles-web.ts — because they live in the page
// markup, not the stylesheet. The icons are theme-agnostic (use
// `currentColor`) so the per-variant CSS rule that sets `color` on
// `.docs-banner__icon` is the single source of truth for tinting.
const BANNER_ICON_SVG_OUTDATED =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';

// Triangle warning icon for the preview variant — same warning semantic
// as outdated, just tinted with BAI primary instead of yellow. Matches
// the design's `warn` glyph (simple triangle with a center bang).
const BANNER_ICON_SVG_PREVIEW =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3 2 21h20L12 3Z"/><path d="M12 10v4M12 17h.01"/></svg>';

/**
 * Build the version-mismatch banner (FR-2723; redesigned in FR-2733) —
 * shown on every NON-latest version page. Two visual variants share the
 * same DOM scaffolding and the same dismiss script:
 *
 *   - `preview` (when `current === "next"`): purple/lavender treatment,
 *     sparkle icon, copy framed as "unreleased docs".
 *   - `outdated` (any other non-latest minor): warn-yellow treatment,
 *     triangle-alert icon, copy framed as "older version".
 *
 * The dismissal state is enforced client-side by `version-banner.js`
 * via per-(currentVersion, latestVersion) sessionStorage keys. The
 * `docs-banner--view-latest` class is preserved on both variants so the
 * existing dismiss script keeps working without touching JS — the new
 * variant classes are additive and only drive the visual treatment.
 *
 * The banner is rendered visible by default; the script flips it to
 * `hidden` synchronously on DOMContentLoaded if a sessionStorage flag
 * exists. We accept a brief flash on slow first paint over the
 * alternative of starting hidden + showing on missing flag, because
 * the latter would suppress the banner entirely if JS is disabled.
 *
 * Returns an empty string when no version context is present (flat
 * mode) or when the current page IS the latest version.
 */
function buildVersionBanner(context: WebPageContext): string {
  const ver = context.versionContext;
  if (!ver) return "";
  if (ver.current === ver.latest) return "";

  const labels = WEBSITE_LABELS[context.metadata.lang] ?? WEBSITE_LABELS.en;
  // Build the link target: same slug in latest if available, else the
  // latest version's index page. We mirror the version-switcher's
  // fallback rule so the banner never points at a 404.
  const hops = Math.max(0, ver.rootDepth - 1);
  const prefix = "../".repeat(hops);
  const targetExists = ver.slugAvailability[ver.latest] === true;
  const href = targetExists
    ? `${prefix}${ver.latest}/${context.metadata.lang}/${ver.slug}.html`
    : `${prefix}${ver.latest}/${context.metadata.lang}/index.html`;

  // Variant selection:
  //   `next` is the unreleased preview channel → preview variant.
  //   Everything else that hits this function is, by definition, an older
  //   release minor (the early-return above filters out `current === latest`).
  const variant: "preview" | "outdated" =
    ver.current === "next" ? "preview" : "outdated";

  const titleTemplate =
    variant === "preview"
      ? labels.bannerPreviewTitle
      : labels.bannerOutdatedTitle;
  const bodyTemplate =
    variant === "preview"
      ? labels.bannerPreviewBody
      : labels.bannerOutdatedBody;

  const title = titleTemplate.replace(/\{version\}/g, ver.current);
  const linkLabel = labels.bannerViewLatestLink.replace(
    /\{latestVersion\}/g,
    ver.latest,
  );
  // Splice the localized {link} placeholder with an inline anchor. Each
  // surrounding piece is HTML-escaped before concat so a malicious locale
  // override can't break out of the body span.
  const [bodyPre = "", bodyPost = ""] = bodyTemplate.split("{link}");
  const bodyHtml = `${escapeHtml(bodyPre)}<a class="docs-banner__link" href="${escapeHtml(href)}">${escapeHtml(linkLabel)}</a>${escapeHtml(bodyPost)}`;

  const dismissLabel = labels.bannerDismiss;
  const iconSvg =
    variant === "preview" ? BANNER_ICON_SVG_PREVIEW : BANNER_ICON_SVG_OUTDATED;
  const variantClass = `docs-banner--${variant}`;

  return `<div class="docs-banner docs-banner--view-latest ${variantClass}" role="status" data-current-version="${escapeHtml(ver.current)}" data-latest-version="${escapeHtml(ver.latest)}">
  <span class="docs-banner__icon" aria-hidden="true">${iconSvg}</span>
  <div class="docs-banner__body">
    <span class="docs-banner__title">${escapeHtml(title)}</span>
    <span class="docs-banner__desc">${bodyHtml}</span>
  </div>
  <button type="button" class="docs-banner__dismiss" aria-label="${escapeHtml(dismissLabel)}" title="${escapeHtml(dismissLabel)}">&times;</button>
</div>`;
}

/**
 * Build the "Not in selected version" notice (FR-2723) — injected
 * hidden on every page and revealed by `version-banner.js` only when
 * the user arrived here via a version-switcher fallback (sessionStorage
 * flag set by the inline switcher script).
 *
 * The notice's body text is filled in client-side by reading
 * `data-message-template` and substituting `{version}` with the value
 * from the sessionStorage flag — so the same hidden markup works for
 * any (target version, slug) the user came from.
 *
 * Returns empty string in flat mode (no version context).
 */
function buildVersionNotice(context: WebPageContext): string {
  const ver = context.versionContext;
  if (!ver) return "";
  const labels = WEBSITE_LABELS[context.metadata.lang] ?? WEBSITE_LABELS.en;
  const messageTemplate = labels.noticeNotInVersion;
  const dismissLabel = labels.bannerDismiss;
  return `<div class="docs-notice docs-notice--not-in-version" role="status" hidden data-current-version="${escapeHtml(ver.current)}" data-message-template="${escapeHtml(messageTemplate)}">
  <span class="docs-notice__body"></span>
  <button type="button" class="docs-notice__dismiss" aria-label="${escapeHtml(dismissLabel)}" title="${escapeHtml(dismissLabel)}">&times;</button>
</div>`;
}

/**
 * Build the page-header bar. F1 (sibling stack arm) introduces the
 * language switcher in this same `<header class="page-header-bar">`
 * structure; F6 contributes the version selector. When F1 lands the
 * two contributions live side-by-side as siblings inside `page-header-nav`.
 *
 * In F6's worktree (which doesn't yet have F1), this header carries the
 * version selector on its own. The CSS class names are stable so the
 * eventual F1 + F6 reconciliation is a small CSS adjustment, not a
 * structural conflict.
 *
 * Returns an empty string when no header content is present (no version
 * selector, no language switcher) so we don't emit a stray `<header />`.
 */
function buildPageHeaderBar(context: WebPageContext): string {
  // FR-2733: the legacy `.page-header-bar` used to host the version
  // selector, but the redesigned UX puts it in the sidebar instead.
  // No other content lives here today (F1's lang switcher long since
  // moved into the BAI topbar) so the bar emits nothing. The function
  // is retained as a structural anchor for future header surfaces.
  void context;
  return "";
}

/**
 * Build the version selector dropdown for versioned-docs mode.
 *
 * The dropdown lists every minor label (never patches — that
 * invariant is enforced at config-load time in `versions.ts`). On
 * change, an inline script navigates to the same slug in the target
 * version when the slug exists there; otherwise it falls back to the
 * target version's index page (no 404).
 *
 * The data needed by the inline script is passed via `data-` attributes
 * on the `<select>` so the script body itself stays small and language-
 * agnostic. Total inline JS stays around 1.3 KB (including FR-2733's
 * legacy-URL branch); safely under the 25 KB total per-page JS cap.
 */
function buildVersionSwitcher(context: WebPageContext): string {
  const ver = context.versionContext;
  if (!ver) return "";
  // Build availability JSON: { "25.16": true, "25.10": false, ... }.
  // The script reads this to decide between same-slug and index-fallback.
  const availabilityJson = JSON.stringify(ver.slugAvailability);
  const optionsHtml = ver.allLabels
    .map((label) => {
      const selected = label === ver.current ? " selected" : "";
      const isLatest = label === ver.latest ? " (latest)" : "";
      return `<option value="${escapeHtml(label)}"${selected}>${escapeHtml(label)}${isLatest}</option>`;
    })
    .join("");
  // FR-2733: append a "Previous versions" entry at the bottom of the
  // dropdown when `legacyDocsUrl` is configured. The option's value is a
  // sentinel (`__legacy__`) that the inline handler uses to branch into
  // a `window.open(url, '_blank', 'noopener,noreferrer')` instead of a
  // version-switch navigation. When the URL is unset, no entry, no
  // separator, no empty option — the dropdown renders identical to its
  // pre-FR-2733 shape.
  //
  // The `__legacy__` sentinel cannot collide with a real version label:
  // toolkit-side validation in `versions.ts` (`MINOR_LABEL = /^[0-9]+\.[0-9]+$/`)
  // restricts `versions[].label` to `MAJOR.MINOR` digits-and-dot only, so
  // an underscore-flanked literal is structurally impossible.
  const legacyDocsUrl = context.config.legacyDocsUrl;
  const labels = WEBSITE_LABELS[context.metadata.lang] ?? WEBSITE_LABELS.en;
  const previousVersionsLabel = labels.previousVersions ?? "Previous versions";
  const legacyOptionHtml = legacyDocsUrl
    ? `<option value="__legacy__">${escapeHtml(previousVersionsLabel)}</option>`
    : "";
  const legacyDataAttr = legacyDocsUrl
    ? ` data-legacy-url="${escapeHtml(legacyDocsUrl)}"`
    : "";
  // The handler is inlined to avoid a separate hashed asset for ~30 LoC.
  // It is idempotent and language-agnostic: the only state it touches is
  // `window.location.assign(...)` after a probe of the availability map,
  // plus a single `sessionStorage.setItem` when the slug is missing in the
  // target version (FR-2723: "Not in selected version" notice).
  //
  // The sessionStorage flag uses the same key as `templates/assets/
  // version-banner.js` (`docs.notice.notInVersion`); payload format is
  // `<targetVersion>::<originSlug>` so the notice script can verify it
  // landed on the right destination before showing the message.
  //
  // FR-2733: when the user picks the sentinel `__legacy__` option, the
  // handler reads the legacy hostname from `data-legacy-url` and opens
  // it in a new tab via `window.open(..., '_blank', 'noopener,noreferrer')`
  // — the `rel` keywords are required to prevent reverse-tabnabbing
  // attacks on the legacy origin. The `<select>` is reset to `current`
  // afterwards so re-picking the same item still fires `change`.
  const inlineScript = `(function(){
  var sel = document.currentScript && document.currentScript.previousElementSibling;
  if (!sel || sel.tagName !== 'SELECT') return;
  sel.addEventListener('change', function(e) {
    var target = e.target.value;
    if (!target) return;
    var current = sel.dataset.current;
    if (target === '__legacy__') {
      var legacy = sel.dataset.legacyUrl;
      if (legacy) window.open(legacy, '_blank', 'noopener,noreferrer');
      sel.value = current;
      return;
    }
    if (target === current) return;
    var lang = sel.dataset.lang;
    var slug = sel.dataset.slug;
    var rootDepth = parseInt(sel.dataset.rootDepth, 10) || 2;
    var availability = {};
    try { availability = JSON.parse(sel.dataset.availability || '{}'); } catch (_) {}
    var hops = Math.max(0, rootDepth - 1);
    var prefix = '';
    for (var i = 0; i < hops; i++) { prefix += '../'; }
    var hasSlug = availability[target] === true;
    if (!hasSlug) {
      try {
        sessionStorage.setItem('docs.notice.notInVersion', target + '::' + slug);
      } catch (_) {}
    }
    var dest = hasSlug
      ? prefix + target + '/' + lang + '/' + slug + '.html'
      : prefix + target + '/' + lang + '/index.html';
    window.location.assign(dest);
  });
})();`;
  // FR-2733: the legacy `<label class="version-switcher-label">Version</label>`
  // that used to live inline next to the select is dropped here. The
  // sidebar variant (`.doc-sidebar-version`) emits its own uppercase,
  // localized "VERSION" label above the select; rendering both would
  // duplicate the affordance and break the new visual rhythm.
  return `<select
      id="version-switcher"
      class="version-switcher"
      data-current="${escapeHtml(ver.current)}"
      data-lang="${escapeHtml(context.metadata.lang)}"
      data-slug="${escapeHtml(ver.slug)}"
      data-root-depth="${ver.rootDepth}"
      data-availability="${escapeHtml(availabilityJson)}"${legacyDataAttr}
    >${optionsHtml}${legacyOptionHtml}</select>
    <script>${inlineScript}</script>`;
}

/**
 * Build the right-rail TOC scroll-spy script tag (F3). The script uses
 * IntersectionObserver to track which heading section is currently in
 * view, then toggles the matching `.doc-toc__link` to `.is-active`.
 * Skipped when there is no TOC (chapter has no H2 headings) — in that
 * case the rail is rendered empty and the script is a no-op anyway.
 */
function buildTocScrollspyScriptTag(
  assets: PageAssets,
  prefix: string,
): string {
  if (!assets.tocScrollspy) return "";
  return `<script defer src="${prefix}assets/${escapeHtml(assets.tocScrollspy)}"></script>`;
}

/**
 * Build the interactions.js script tag (FR-2726 Phase 4). Receives
 * `prefix` so the script URL stays correct under versioned-mode page
 * paths (e.g. `<version>/<lang>/page.html` needs `../../assets/...`).
 * The Phase 4 topbar is search-trigger-only and the palette starts
 * hidden, so an absent interactions asset would leave the search UI
 * inaccessible — the caller MUST verify the asset is present (see
 * `buildWebPage`).
 */
function buildInteractionsScriptTag(
  assets: PageAssets,
  prefix: string,
): string {
  if (!assets.interactions) return "";
  return `<script defer src="${prefix}assets/${escapeHtml(assets.interactions)}"></script>`;
}

/**
 * Inline `<head>` bootstrap that sets `data-theme` on <html> before
 * the page paints (FR-2726 Phase 4 — anti-FOUC). Reads `docs-theme`
 * from localStorage; falls back to `prefers-color-scheme: dark` for
 * users who never explicitly toggled. Total payload < 300 bytes.
 *
 * Returns a `<script>` tag — emitted from `buildHeadAssetTags` so it
 * runs before any render-blocking stylesheet evaluation.
 */
function buildThemeBootstrapScript(): string {
  const body = `(function(){try{var t=localStorage.getItem('docs-theme');if(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){t='dark';}if(t){document.documentElement.setAttribute('data-theme',t);}}catch(_){ }})();`;
  return `<script>${body}</script>`;
}

/**
 * Augment every `<img …>` tag with `loading="lazy"`, `decoding="async"`, and
 * (when supplied) `width`/`height` attributes from `dimensions`. Any pre-
 * existing attributes on the tag are preserved. Tags that already declare
 * `loading=` / `decoding=` / `width=` / `height=` are left untouched.
 *
 * `dimensions` keys are page-relative URLs as they appear in the rendered
 * HTML (after rewriteImagePathsForStaticSite has converted `/images/x.png`
 * → `./images/x.png`).
 */
export function applyImageAttributes(
  html: string,
  dimensions: Map<string, { width: number; height: number }>,
): string {
  return html.replace(/<img\b([^>]*?)\s*\/?>/gi, (full, rawAttrs: string) => {
    const attrs = rawAttrs;
    const additions: string[] = [];
    if (!/\bloading\s*=/.test(attrs)) additions.push('loading="lazy"');
    if (!/\bdecoding\s*=/.test(attrs)) additions.push('decoding="async"');

    if (!/\bwidth\s*=/.test(attrs) && !/\bheight\s*=/.test(attrs)) {
      const srcMatch = attrs.match(/\bsrc\s*=\s*"([^"]+)"/i);
      if (srcMatch) {
        const dims = dimensions.get(srcMatch[1]);
        if (dims) {
          additions.push(`width="${dims.width}"`);
          additions.push(`height="${dims.height}"`);
        }
      }
    }

    if (additions.length === 0) return full;
    const trimmed = attrs.replace(/\s+$/, "");
    return `<img${trimmed} ${additions.join(" ")} />`;
  });
}

/**
 * Build the BAI topbar (FR-2726 Phase 2).
 *
 * The topbar is a sticky 56px strip above the page grid. It carries the
 * brand block (logo + sub-label + version pill), an inline search input
 * (which the existing search.js script binds to via #search-input), and
 * an actions cluster on the right (lang switcher, version selector,
 * GitHub icon).
 *
 * The lang switcher and version selector were previously rendered inside
 * the in-page `.page-header-bar`. Phase 2 relocates them into the topbar
 * so site-level controls live above the page chrome and the article
 * column starts cleanly with breadcrumbs + content.
 *
 * Layout:
 *   [menu] [brand|sub|version]   [search ............]   [lang][version][github]
 *
 * The mobile menu icon and the search-as-icon button are hidden on
 * desktop and revealed at narrow viewports via the responsive CSS.
 */
function buildBaiTopbar(
  context: WebPageContext,
  peers: LanguagePeer[],
  prefix: string,
): string {
  const { metadata, config, assets } = context;
  const labels = WEBSITE_LABELS[metadata.lang] ?? WEBSITE_LABELS.en;

  // Brand block (FR-2726 Phase 4): emit BOTH light and dark logos as
  // `<img>` elements and let CSS hide the one that doesn't match the
  // active `data-theme`. The earlier `<picture>` + `prefers-color-scheme`
  // approach only honored the OS preference and ignored the manual
  // theme toggle, so users who flipped to dark mode kept seeing the
  // light logo.
  const lightSrc = assets.brandLogoLight
    ? `${prefix}assets/${escapeHtml(assets.brandLogoLight)}`
    : "";
  const darkSrc = assets.brandLogoDark
    ? `${prefix}assets/${escapeHtml(assets.brandLogoDark)}`
    : lightSrc;

  let brandLogoHtml: string;
  if (lightSrc) {
    const altText = escapeHtml(metadata.title);
    if (darkSrc && darkSrc !== lightSrc) {
      brandLogoHtml =
        `<img class="bai-brand-logo bai-brand-logo--light" src="${lightSrc}" alt="${altText}" />` +
        `<img class="bai-brand-logo bai-brand-logo--dark" src="${darkSrc}" alt="${altText}" />`;
    } else {
      brandLogoHtml = `<img class="bai-brand-logo" src="${lightSrc}" alt="${altText}" />`;
    }
  } else {
    brandLogoHtml = `<span class="bai-brand-fallback">${escapeHtml(metadata.title)}</span>`;
  }

  // Sub-label: per-language map → fallback to `default` → fallback to "".
  const subLabelMap = config.branding.subLabel;
  const subLabel = subLabelMap[metadata.lang] ?? subLabelMap.default ?? "";

  const subLabelHtml = subLabel
    ? `<span class="bai-brand-divider" aria-hidden="true"></span><span class="bai-brand-sub">${escapeHtml(subLabel)}</span>`
    : "";

  const versionPillHtml = `<span class="bai-brand-version">${escapeHtml(metadata.version)}</span>`;

  // Search input (existing search.js binds via #search-input). Placeholder
  // and noResults message localized via WEBSITE_LABELS.
  const placeholderAttr = escapeHtml(labels.searchPlaceholder);
  const noResultsAttr = escapeHtml(labels.noResults);
  const searchIconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m21 21-5.5-5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  const searchIconLargeSvg = `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m21 21-5.5-5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

  // Phase 4 (FR-2726): the topbar exposes a button trigger that opens
  // a Cmd-K-style palette. The actual <input id="search-input"> + the
  // results list live inside the palette overlay (rendered in the
  // body further down) so search.js continues to work unchanged.
  const searchHtml = `<button class="bai-topbar__search" type="button" data-search-trigger aria-label="${placeholderAttr}">
    ${searchIconSvg}
    <span class="bai-topbar__search-label">${placeholderAttr}</span>
    <span class="bai-kbd-group" aria-hidden="true"><kbd>⌘</kbd><kbd>K</kbd></span>
  </button>
  <button class="bai-iconbtn bai-topbar__searchicon" type="button" data-search-trigger aria-label="${placeholderAttr}">${searchIconLargeSvg}</button>`;
  // The placeholder + no-results attributes are forwarded to the
  // input via its data-* set inside the palette markup below, so the
  // localization passes through to search.js.
  void noResultsAttr;

  // Lang switcher (FR-2737 — icon-only variant).
  //
  // The visible affordance is a single Lucide `languages` icon. A
  // transparent native `<select>` is layered on top of the icon, so
  // clicking the icon opens the OS-native option list — every browser
  // and platform (incl. mobile) renders this dropdown using its own
  // accessible UI. We don't reinvent the menu in JS: keyboard support,
  // screen-reader announcements, and touch-friendly option pickers all
  // come "for free" from the native control.
  //
  // Pages where the chapter is missing in a peer language still get an
  // option, but its value is that language's `index.html` so the click
  // never lands on a 404.
  const langOptions = peers
    .map((peer) => {
      const isCurrent = peer.lang === metadata.lang;
      const titleAttr = peer.available
        ? ""
        : ' title="Page is not available in this language; jumps to that language\'s index."';
      return `<option value="${escapeHtml(peer.href)}" lang="${escapeHtml(peer.lang)}"${isCurrent ? " selected" : ""}${titleAttr}>${escapeHtml(peer.label)}</option>`;
    })
    .join("");
  // The switcher uses an inline `onchange` navigate so it works
  // self-contained — including on pages that don't ship
  // interactions.js (e.g. the language-picker root). Native <select>
  // requires JavaScript to fire `change`; consumers who need a true
  // no-JS fallback can layer a `<noscript>` block of plain anchor
  // links above this widget.
  //
  // The <select> is rendered BEFORE the icon so the icon paints on
  // top of it (later DOM order = higher in the natural stacking
  // context). Both elements share the wrapping <label>, which means
  // a click on the icon still focuses the select via the implicit
  // label association.
  const langSwitcherHtml = `<label class="lang-switcher" aria-label="Language switcher">
    <select class="lang-switcher__select" aria-label="Language switcher" onchange="if(this.value)window.location.assign(this.value)">${langOptions}</select>
    ${LUCIDE_LANGUAGES_ICON_SVG}
  </label>`;

  // FR-2733: the version selector used to render here in the topbar
  // actions, but the redesigned UX places it at the top of the sidebar
  // (`.doc-sidebar-version`) so it sits next to the navigation it
  // controls. The switcher HTML is built once in `buildWebPage` and
  // threaded into `buildWebsiteSidebar`; the topbar leaves the slot
  // empty rather than emitting a duplicate.

  // GitHub link — derived from website.repoUrl. When unset, the icon is
  // omitted so we don't ship a dead link.
  const repoUrl = config.website?.repoUrl;
  const githubIconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18a10.95 10.95 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z"/></svg>`;
  const githubLinkHtml = repoUrl
    ? `<a class="bai-iconbtn" href="${escapeHtml(repoUrl)}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">${githubIconSvg}</a>`
    : "";

  // Theme toggle (Phase 4 — FR-2726). Sun/moon icon both rendered;
  // CSS hides the inactive one based on data-theme. The aria-pressed
  // state is updated by interactions.js when the user clicks.
  const themeIconLight = `<svg class="bai-theme-icon bai-theme-icon--light" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>`;
  const themeIconDark = `<svg class="bai-theme-icon bai-theme-icon--dark" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>`;
  const themeToggleHtml = `<button class="bai-iconbtn" type="button" data-theme-toggle aria-label="Toggle dark mode">${themeIconLight}${themeIconDark}</button>`;

  // Mobile menu icon (Phase 2 emits the surface; Phase 4 wires the
  // drawer toggle).
  const menuIconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

  return `<header class="bai-topbar" role="banner">
  <button class="bai-iconbtn bai-topbar__menu" type="button" aria-label="Toggle navigation">${menuIconSvg}</button>
  <a class="bai-topbar__brand" href="./index.html">
    ${brandLogoHtml}
    ${subLabelHtml}
    ${versionPillHtml}
  </a>
  ${searchHtml}
  <div class="bai-topbar__actions">
    ${langSwitcherHtml}
    ${themeToggleHtml}
    ${githubLinkHtml}
  </div>
</header>`;
}

/**
 * Build the search palette overlay (FR-2726 Phase 4). Hidden until
 * `interactions.js` toggles `bai-palette-open` on the body. Hosts the
 * actual `<input id="search-input">` and `<div id="search-results">`
 * elements so search.js (which binds by id) keeps working unchanged.
 */
function buildSearchPalette(metadata: WebsiteMetadata): string {
  const labels = WEBSITE_LABELS[metadata.lang] ?? WEBSITE_LABELS.en;
  const placeholderAttr = escapeHtml(labels.searchPlaceholder);
  const noResultsAttr = escapeHtml(labels.noResults);
  const searchIconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m21 21-5.5-5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  // The `doc-search` class is intentional: search.js attaches a
  // document-level click handler that hides #search-results on any
  // click outside an ancestor with class `doc-search`. Without it,
  // clicks inside the palette panel (e.g. focusing the input) would
  // immediately collapse the result list.
  return `<div class="bai-palette" data-search-palette role="dialog" aria-modal="true" aria-label="${placeholderAttr}" hidden aria-hidden="true">
  <div class="bai-palette__scrim"></div>
  <div class="bai-palette__panel doc-search" role="search">
    <div class="bai-palette__searchrow">
      ${searchIconSvg}
      <input type="text" id="search-input" placeholder="${placeholderAttr}" data-no-results="${noResultsAttr}" autocomplete="off" />
      <kbd class="bai-palette__close-hint">esc</kbd>
    </div>
    <div id="search-results" class="search-results" hidden></div>
  </div>
</div>`;
}

/**
 * Build the in-page header bar. Currently hosts the language switcher (F1).
 * F4 (code-block copy) and F6 (version selector) will add additional
 * controls into the same `<header class="page-header-bar">`; the
 * `<nav class="page-header-nav">` slots them as siblings of the language
 * switcher so they can extend without reflowing the layout.
 *
 * F3 deliberately does NOT put the breadcrumb in this header bar — the
 * spec calls for a breadcrumb "above the chapter content", and keeping
 * the header reserved for site-level controls (lang switcher, future
 * version selector) avoids a tight coupling with F6's incoming UI.
 *
 * FR-2726 Phase 2 supersedes this for the website build — the language
 * switcher is now rendered inside the BAI topbar by `buildBaiTopbar`.
 * `buildPageHeader` is kept for any external consumer still building
 * pages from individual helpers.
 */
function buildPageHeader(
  metadata: WebsiteMetadata,
  peers: LanguagePeer[],
): string {
  const items = peers
    .map((peer) => {
      const isCurrent = peer.lang === metadata.lang;
      const ariaCurrent = isCurrent ? ' aria-current="true"' : "";
      const classes = [
        "lang-switcher__item",
        isCurrent ? "lang-switcher__item--current" : "",
        peer.available
          ? "lang-switcher__item--available"
          : "lang-switcher__item--unavailable",
      ]
        .filter(Boolean)
        .join(" ");
      const titleAttr = peer.available
        ? ""
        : ' title="This page is not available in this language; goes to that language\'s index instead."';
      return `<a class="${classes}" href="${escapeHtml(peer.href)}" hreflang="${escapeHtml(peer.lang)}" lang="${escapeHtml(peer.lang)}"${ariaCurrent}${titleAttr}>${escapeHtml(peer.label)}</a>`;
    })
    .join("");
  return `
<header class="page-header-bar">
  <nav class="page-header-nav" aria-label="Page header controls">
    <div class="lang-switcher" role="group" aria-label="Language switcher">
      ${items}
    </div>
  </nav>
</header>`;
}

/**
 * Build a complete HTML page for a single chapter in the static website.
 */
export function buildWebPage(context: WebPageContext): string {
  const {
    chapter,
    allChapters,
    currentIndex,
    metadata,
    config,
    assets,
    peers,
    navGroups,
    category,
  } = context;

  const prefix = rootPrefix(context);

  // FR-2733: build the version switcher once and thread it into the
  // sidebar. `buildVersionSwitcher` returns "" in non-versioned mode,
  // and `buildWebsiteSidebar` skips the wrapper block on empty input
  // so non-versioned builds render unchanged.
  const versionSwitcherHtml = buildVersionSwitcher(context);
  const sidebar = buildWebsiteSidebar(
    allChapters,
    currentIndex,
    metadata,
    config,
    navGroups,
    versionSwitcherHtml,
  );
  // Phase 2 (FR-2726): the topbar replaces the legacy in-page header
  // (lang switcher) and version-selector header. We omit pageHeader /
  // headerBar from the body output below; they're folded into the topbar.
  const topbar = buildBaiTopbar(context, peers, prefix);
  void buildPageHeader;
  const breadcrumb = buildBreadcrumb(chapter, category, metadata.lang);
  const innerContent = buildPageContent(chapter);
  const rightRailToc = buildRightRailToc(
    chapter,
    metadata.lang,
    config,
    context.navPath,
  );
  const metadataBar = buildPageMetadata(context);
  const pagination = buildPaginationNav(
    allChapters,
    currentIndex,
    metadata.lang,
  );
  const articleFooter = buildArticleFooter(config);
  const langLabel = config.languageLabels[metadata.lang] || metadata.lang;
  const pageTitle = `${escapeHtml(chapter.title)} - ${escapeHtml(metadata.title)}`;
  const headTags = buildHeadAssetTags(
    metadata,
    langLabel,
    pageTitle,
    chapter.title,
    chapter.htmlContent,
    assets,
    prefix,
    context.seo,
    context.peers,
  );
  // Phase 2 (FR-2726): the version-switcher header bar is folded into
  // the BAI topbar — `buildPageHeaderBar` is intentionally not invoked.
  void buildPageHeaderBar;
  const versionBanner = buildVersionBanner(context);
  const versionNotice = buildVersionNotice(context);
  // Phase 4 (FR-2726): search palette + interactions script tag.
  const searchPalette = buildSearchPalette(metadata);
  // Phase 4 (FR-2726): the topbar exposes only a trigger button while
  // the palette starts hidden — without interactions.js there is no
  // way to open it, so the search UI would be inaccessible. Refuse
  // to emit a page with broken search rather than silently degrade.
  if (!assets.interactions) {
    throw new Error(
      "FR-2726 Phase 4: missing required interactions asset. " +
        "Search UI requires interactions.js to open the search palette.",
    );
  }
  const interactionsScript = buildInteractionsScriptTag(assets, prefix);
  const searchScript = buildSearchScriptTag(assets, prefix);
  const codeCopyScript = buildCodeCopyScriptTag(assets, prefix);
  const tocScrollspyScript = buildTocScrollspyScriptTag(assets, prefix);
  const versionBannerScript = buildVersionBannerScriptTag(assets, prefix);

  // F4: data-* attributes on <body> carry the localized labels for the
  // code-copy script (which is content-hashed once across every language,
  // so the script itself stays language-agnostic).
  const labels = WEBSITE_LABELS[metadata.lang] ?? WEBSITE_LABELS.en;
  const copyDataAttrs = [
    `data-copy-label="${escapeHtml(labels.copy ?? "Copy")}"`,
    `data-copied-label="${escapeHtml(labels.copied ?? "Copied!")}"`,
    `data-copy-failed-label="${escapeHtml(labels.copyFailed ?? "Copy failed")}"`,
  ].join(" ");

  return `<!DOCTYPE html>
<html lang="${escapeHtml(metadata.lang)}">
<head>
  ${headTags}
</head>
<body ${copyDataAttrs}>
${topbar}
${versionBanner}
<div class="doc-page">
  ${sidebar}
  <main class="doc-main">
    ${versionNotice}
    ${breadcrumb}
    ${innerContent}
    <div class="page-footer">
      ${metadataBar}
      ${pagination}
    </div>
    ${articleFooter}
  </main>
  ${rightRailToc}
</div>
${searchPalette}
${searchScript}
${codeCopyScript}
${tocScrollspyScript}
${versionBannerScript}
${interactionsScript}
</body>
</html>`;
}

/**
 * Options accepted by `buildIndexPage` (FR-2732). All fields are optional —
 * when omitted, the function falls back to the legacy meta-refresh stub
 * exactly as before. The PDF card is rendered only when `pdfTag` is a
 * non-empty string; an unset / empty `pdfTag` produces byte-identical
 * output to the pre-FR-2732 baseline (no card markup, no extra bytes).
 *
 * Note: the production website build now uses `buildHomePage` for the
 * per-language landing — `buildIndexPage` is retained as a thin fallback
 * for languages with no chapters (an empty navigation is still a valid
 * `book.config.yaml` shape) and for external callers that have not
 * migrated to `buildHomePage`. See `website-generator.ts`.
 */
export interface IndexPageOptions {
  /**
   * GitHub Release tag for the current version (FR-2731 / FR-2732), e.g.
   * `"v26.4.7"`. When set, the per-language landing page renders a
   * "Download PDF (this version)" card whose anchor points at
   * `https://github.com/lablup/backend.ai-webui/releases/download/<pdfTag>/Backend.AI_WebUI_User_Guide_<pdfTag>_<lang>.pdf`.
   * The card is rendered ONLY on this landing page (`<lang>/index.html`),
   * never on inner content pages.
   */
  pdfTag?: string;
  /**
   * Resolved branding tokens (FR-2726) used to color the inline `<style>`
   * block of the PDF card landing. When omitted, the renderer falls back
   * to the BAI orange defaults from `config.ts` so a stand-alone caller
   * (e.g. unit tests) keeps producing the same output. White-label
   * deployments override `branding.primaryColor` etc. in
   * `docs-toolkit.config.yaml`; the website-generator threads the
   * resolved tokens through here so the card matches every other surface.
   */
  branding?: ResolvedBrandingConfig;
}

/**
 * GitHub Release CDN host for the WebUI repo. Hardcoded because the toolkit
 * is single-tenant for backend.ai-webui (the spec ties the URL shape to
 * this exact repo); a future generalization can make it config-driven.
 */
const PDF_RELEASE_BASE_URL =
  "https://github.com/lablup/backend.ai-webui/releases/download";

/**
 * Inline SVG download icon for the PDF card. Kept inline (not a hashed
 * asset) because the index.html landing page is intentionally
 * stylesheet-free in the no-`pdfTag` baseline — embedding the icon avoids
 * pulling in the full asset pipeline just for the card.
 */
const PDF_DOWNLOAD_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;

/**
 * Build the deterministic GitHub Release CDN URL for the current
 * (pdfTag, lang) pair. Kept as a small standalone helper so unit tests
 * can exercise URL construction independently of the larger render.
 *
 * `pdfTag` is regex-validated upstream (FR-2731: `^v\d+\.\d+\.\d+$`),
 * but `lang` originates from `book.config.yaml`'s `languages: string[]`
 * with no shape validation. We `encodeURIComponent` both segments as
 * defense-in-depth so a stray space or non-ASCII character cannot
 * produce a malformed URL.
 */
function buildPdfReleaseUrl(pdfTag: string, lang: string): string {
  const encodedTag = encodeURIComponent(pdfTag);
  const encodedLang = encodeURIComponent(lang);
  return `${PDF_RELEASE_BASE_URL}/${encodedTag}/Backend.AI_WebUI_User_Guide_${encodedTag}_${encodedLang}.pdf`;
}

/**
 * Build an `index.html` for a per-language landing page (FR-2732).
 *
 * Two output shapes:
 *   1. **No `pdfTag`** — emits a tiny meta-refresh stub that immediately
 *      redirects to the first chapter. Byte-equivalent to the pre-FR-2732
 *      baseline so versions like `next` (which carry no PDF) keep the
 *      exact same output. Required by the FR-2732 acceptance criteria.
 *   2. **`pdfTag` is set** — emits a real landing page with a "Download
 *      PDF (this version)" card linking to the GitHub Release CDN, plus
 *      a manual "continue to docs" link. The meta-refresh is dropped so
 *      the user actually has time to see and click the card. The card
 *      is language-aware: a single anchor for the page's current `<lang>`
 *      rather than one anchor per language (see FR-13 in the spec).
 *
 * The hardcoded asset filename pattern (`Backend.AI_WebUI_User_Guide_<tag>_<lang>.pdf`)
 * mirrors the per-language PDFs published by FR-2719's release workflow.
 * No HEAD-request validation at build time — a missing release surfaces
 * as a 404 on click, which the runbook (FR-2736) catches before the
 * release is announced.
 */
export function buildIndexPage(
  chapters: Chapter[],
  metadata: WebsiteMetadata,
  options: IndexPageOptions = {},
): string {
  const firstSlug = chapters[0]?.slug ?? RESERVED_HOME_SLUG;
  const lang = escapeHtml(metadata.lang);
  const title = escapeHtml(metadata.title);
  const pdfTag = options.pdfTag;

  // No `pdfTag` → byte-identical legacy redirect stub. Do NOT touch this
  // path: FR-2732 acceptance requires zero diff for `next` and any other
  // version that does not declare a release tag.
  if (!pdfTag) {
    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0; url=./${firstSlug}.html" />
  <title>${title}</title>
</head>
<body>
  <p>Redirecting to <a href="./${firstSlug}.html">${title}</a>...</p>
</body>
</html>`;
  }

  // `pdfTag` is present — render the PDF card landing.
  //
  // The card label is localized via WEBSITE_LABELS; falling back to the
  // English copy keeps unknown locales rendering a usable card rather
  // than an empty surface.
  const labels = WEBSITE_LABELS[metadata.lang] ?? WEBSITE_LABELS.en;
  const downloadLabel = escapeHtml(
    labels.downloadPdfThisVersion ??
      WEBSITE_LABELS.en.downloadPdfThisVersion ??
      "Download PDF (this version)",
  );
  const pdfUrl = buildPdfReleaseUrl(pdfTag, metadata.lang);
  // The asset URL contains only `[A-Za-z0-9._-]` characters by
  // construction (pdfTag is regex-validated `^v\d+\.\d+\.\d+$`, lang is
  // an ISO language code), so escapeHtml is defensive but harmless.
  const safeHref = escapeHtml(pdfUrl);
  // Native filename derived from the URL — matches the GitHub release
  // asset name. Browsers honor `download` for same-origin and CORS-safe
  // cross-origin resources; GitHub Releases respond with
  // `Content-Disposition: attachment` regardless, so the link works
  // even if `download` is ignored.
  const downloadName = `Backend.AI_WebUI_User_Guide_${pdfTag}_${metadata.lang}.pdf`;
  const safeDownloadName = escapeHtml(downloadName);
  const continueLabel = escapeHtml(labels.next ?? "Next");

  // Brand tokens (FR-2726). When the caller doesn't pass `branding` we
  // fall back to the BAI orange defaults exported from `config.ts` so
  // standalone callers (unit tests, ad-hoc renders) keep producing the
  // same output, while white-label deployments that override
  // `branding.primaryColor` in `docs-toolkit.config.yaml` see the
  // override here too.
  const primary = options.branding?.primaryColor ?? DEFAULT_PRIMARY_COLOR;
  const primaryHover =
    options.branding?.primaryColorHover ?? DEFAULT_PRIMARY_COLOR_HOVER;
  const primarySoft =
    options.branding?.primaryColorSoft ?? DEFAULT_PRIMARY_COLOR_SOFT;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    /* The landing page is intentionally stylesheet-free in the
       no-pdfTag baseline; with the card we ship a self-contained
       inline block instead of pulling the full hashed stylesheet
       just for two surfaces. Colors mirror the FR-2726 design tokens
       so light- and dark-mode users see the same brand identity. */
    :root{
      --bai-bg:#FFFFFF;
      --bai-text:#141414;
      --bai-text-2:#595959;
      --bai-border:#E8E8E8;
      --bai-primary:${primary};
      --bai-primary-hover:${primaryHover};
      --bai-primary-soft:${primarySoft};
    }
    @media (prefers-color-scheme: dark){
      :root{
        --bai-bg:#0E0E10;
        --bai-text:#F0F0F0;
        --bai-text-2:#B5B5BD;
        --bai-border:#2A2A30;
      }
    }
    body{margin:0;padding:2rem;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:var(--bai-bg);color:var(--bai-text);display:flex;min-height:100vh;align-items:center;justify-content:center;}
    .pdf-landing{max-width:32rem;width:100%;}
    .pdf-landing__title{margin:0 0 1.5rem 0;font-size:1.5rem;font-weight:600;}
    .pdf-download-card{display:flex;align-items:center;gap:0.75rem;padding:1rem 1.25rem;border:1px solid var(--bai-border);border-radius:8px;background:var(--bai-primary-soft);color:var(--bai-text);text-decoration:none;font-weight:500;}
    .pdf-download-card:hover{border-color:var(--bai-primary);color:var(--bai-primary);}
    .pdf-download-card:focus-visible{outline:2px solid var(--bai-primary);outline-offset:2px;}
    .pdf-download-card__icon{display:inline-flex;color:var(--bai-primary);}
    .pdf-download-card__label{flex:1 1 auto;}
    .pdf-landing__continue{margin-top:1rem;font-size:0.875rem;color:var(--bai-text-2);}
    .pdf-landing__continue a{color:var(--bai-primary);text-decoration:none;}
    .pdf-landing__continue a:hover{text-decoration:underline;}
  </style>
</head>
<body>
  <main class="pdf-landing">
    <h1 class="pdf-landing__title">${title}</h1>
    <a class="pdf-download-card" href="${safeHref}" download="${safeDownloadName}">
      <span class="pdf-download-card__icon" aria-hidden="true">${PDF_DOWNLOAD_ICON_SVG}</span>
      <span class="pdf-download-card__label">${downloadLabel}</span>
    </a>
    <p class="pdf-landing__continue"><a href="./${firstSlug}.html">${continueLabel} →</a></p>
  </main>
</body>
</html>`;
}

/**
 * Per-language Home page (FR-2737).
 *
 * The home page is web-only — the PDF pipeline starts directly with
 * the first chapter and has no concept of a landing page. It serves
 * three purposes:
 *
 *   1. Give first-time visitors a real introduction to Backend.AI
 *      WebUI and to the manual itself, instead of bouncing them via
 *      a `<meta refresh>` redirect into a chapter that assumes prior
 *      context.
 *   2. Provide a stable destination for the topbar logo and the
 *      breadcrumb "Home" link in the *current* language. With this
 *      page in place, both controls now go somewhere meaningful
 *      rather than dropping the user one chapter into the manual.
 *   3. Surface the top-level category structure as a grid of cards,
 *      mirroring the sidebar's grouped nav. Each card jumps to the
 *      first chapter inside its group, so the home doubles as a
 *      browse-by-topic index.
 *
 * The page reuses every piece of chrome already used by chapter pages
 * (topbar, sidebar, version banner / notice, footer, search palette,
 * scripts) to keep visual continuity. Only the article body differs.
 */
export interface HomePageContext {
  metadata: WebsiteMetadata;
  config: ResolvedDocConfig;
  /** Sidebar nav groups for the current language. */
  navGroups: NavGroup[];
  /** All chapters for the current language (powers the sidebar). */
  allChapters: Chapter[];
  /** Resolved per-page asset filenames (already content-hashed). */
  assets: PageAssets;
  /** Per-language switcher links (always one entry per declared lang). */
  peers: LanguagePeer[];
  /**
   * Versioned-docs context, when running in versioned mode. Plumbed
   * through so the topbar / sidebar version selector and the
   * "you are viewing an older version" banner show on the home page
   * too — otherwise users can't read the version of the docs they're
   * looking at without first navigating into a chapter.
   */
  versionContext?: PageVersionContext;
  /** Per-page SEO context. Optional. */
  seo?: PageSeoContext;
}

/**
 * Resolve the slug of the first chapter listed in a category group.
 * Used to point the "Browse the manual" cards at a concrete first
 * page rather than an abstract "category landing" that does not
 * exist. Returns `undefined` for an empty group, in which case the
 * caller renders the card as plain text rather than a dead link.
 */
function firstChapterSlugInGroup(group: NavGroup): string | undefined {
  const first = group.items[0];
  if (!first) return undefined;
  // Reuse the shared `slugFromNavPath` helper (also used by the
  // markdown processor + website generator) so the sidebar card
  // targets and the on-disk chapter filenames cannot drift apart
  // — a duplicate local implementation here would silently diverge
  // the day someone tweaked the slug rules in markdown-processor.ts.
  return slugFromNavPath(first.path);
}

export function buildHomePage(context: HomePageContext): string {
  const {
    metadata,
    config,
    navGroups,
    allChapters,
    assets,
    peers,
    versionContext,
  } = context;

  const labels = WEBSITE_LABELS[metadata.lang] ?? WEBSITE_LABELS.en;
  const langLabel = config.languageLabels[metadata.lang] || metadata.lang;

  // The topbar + sidebar + banner / notice / version-switcher widgets
  // expect a `WebPageContext`. Wrap the home context in a minimal
  // synthetic chapter so we can reuse them verbatim — this keeps
  // every visual surface (logo, search, lang switcher, version
  // selector, theme toggle) identical to a chapter page.
  // The synthetic home chapter borrows the reserved `index` slug
  // because every downstream surface that consumes a chapter slug
  // (sidebar, version switcher, peer-link math) ultimately maps
  // back to `<lang>/<slug>.html`, and the home page is written to
  // `<lang>/index.html`. Real chapters cannot collide with this
  // value: `slugFromNavPath` is the only producer of chapter slugs,
  // and the website generator validates against `RESERVED_HOME_SLUG`
  // (see website-generator.ts) before any chapter is rendered, so
  // a `nav.path` like `index.md` aborts the build with a clear
  // error rather than silently overwriting the home output.
  const homeChapter: Chapter = {
    title: labels.home ?? "Home",
    slug: RESERVED_HOME_SLUG,
    htmlContent: "",
    headings: [],
  };
  const fakeWebContext: WebPageContext = {
    chapter: homeChapter,
    allChapters: [homeChapter, ...allChapters],
    // currentIndex of -1 marks "no active chapter" so the sidebar
    // doesn't highlight any item. `buildWebsiteSidebar` matches by
    // numeric equality, so any out-of-range value works; -1 is the
    // most explicit sentinel.
    currentIndex: -1,
    metadata,
    config,
    assets,
    peers,
    navGroups,
    category: "",
    versionContext,
    seo: context.seo,
  };

  const prefix = rootPrefix(fakeWebContext);
  const versionSwitcherHtml = buildVersionSwitcher(fakeWebContext);
  // Sidebar uses the real `allChapters` (not the synthetic one) so the
  // numbered list matches every chapter's standalone page.
  const sidebar = buildWebsiteSidebar(
    allChapters,
    -1,
    metadata,
    config,
    navGroups,
    versionSwitcherHtml,
  );
  const topbar = buildBaiTopbar(fakeWebContext, peers, prefix);
  const versionBanner = buildVersionBanner(fakeWebContext);
  const versionNotice = buildVersionNotice(fakeWebContext);
  const articleFooter = buildArticleFooter(config);
  const searchPalette = buildSearchPalette(metadata);

  if (!assets.interactions) {
    throw new Error(
      "FR-2726 Phase 4: missing required interactions asset. " +
        "Search UI requires interactions.js to open the search palette.",
    );
  }
  const interactionsScript = buildInteractionsScriptTag(assets, prefix);
  const searchScript = buildSearchScriptTag(assets, prefix);
  const versionBannerScript = buildVersionBannerScriptTag(assets, prefix);

  // Hero CTA target: the first chapter overall (typically Quickstart
  // in Backend.AI's nav). When the manual has no chapters at all
  // (empty nav), suppress the CTA rather than emit a dead link.
  const firstChapterSlug = allChapters[0]?.slug;
  const ctaQuickstart = firstChapterSlug
    ? `<a class="home-cta home-cta--primary" href="./${escapeHtml(firstChapterSlug)}.html">${escapeHtml(labels.homeQuickstartCta ?? "Get started")}<span class="home-cta__arrow" aria-hidden="true">&rarr;</span></a>`
    : "";

  const repoUrl = config.website?.repoUrl;
  const ctaGithub = repoUrl
    ? `<a class="home-cta home-cta--secondary" href="${escapeHtml(repoUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(labels.homeViewOnGitHub ?? "View source on GitHub")}</a>`
    : "";

  // Hero
  const heroHtml = `<section class="home-hero">
    <p class="home-hero__eyebrow">${escapeHtml(metadata.title)} &middot; ${escapeHtml(metadata.version)}</p>
    <h1 class="home-hero__title">${escapeHtml(labels.homeWelcome ?? "Welcome")}</h1>
    <p class="home-hero__lede">${escapeHtml(labels.homeIntro ?? "")}</p>
    <div class="home-hero__cta-row">
      ${ctaQuickstart}
      ${ctaGithub}
    </div>
    ${labels.homeQuickstartHint ? `<p class="home-hero__hint">${escapeHtml(labels.homeQuickstartHint)}</p>` : ""}
  </section>`;

  // Two intro sections — about the product, about the manual.
  const aboutHtml = `<section class="home-section home-section--intro">
    <div class="home-section__col">
      <h2 class="home-section__title">${escapeHtml(labels.homeAboutWebUI ?? "About")}</h2>
      <p class="home-section__body">${escapeHtml(labels.homeAboutWebUIBody ?? "")}</p>
    </div>
    <div class="home-section__col">
      <h2 class="home-section__title">${escapeHtml(labels.homeAboutDocs ?? "About this manual")}</h2>
      <p class="home-section__body">${escapeHtml(labels.homeAboutDocsBody ?? "")}</p>
    </div>
  </section>`;

  // Browse-by-category cards. Skip the synthetic anonymous group used
  // for legacy flat configs (`category === ""`) — there is nothing
  // useful to title that card with.
  const pagesSuffix = labels.homePagesSuffix ?? "pages";
  const categoryCardsHtml = navGroups
    .filter((g) => g.category)
    .map((group) => {
      const slug = firstChapterSlugInGroup(group);
      const iconSvg = sidebarCategoryIconSvg(group);
      const inner = `<span class="home-card__icon" aria-hidden="true">${iconSvg}</span>
        <h3 class="home-card__title">${escapeHtml(group.category)}</h3>
        <p class="home-card__count">${group.items.length} ${escapeHtml(pagesSuffix)}</p>`;
      if (slug) {
        return `<a class="home-card" href="./${escapeHtml(slug)}.html">${inner}</a>`;
      }
      return `<div class="home-card home-card--disabled">${inner}</div>`;
    })
    .join("\n      ");

  const browseHtml = categoryCardsHtml
    ? `<section class="home-section home-browse">
    <h2 class="home-section__title">${escapeHtml(labels.homeBrowse ?? "Browse")}</h2>
    <div class="home-browse__grid">
      ${categoryCardsHtml}
    </div>
  </section>`
    : "";

  // <head> tags. We pass an empty `chapterHtml` so the description
  // falls back to the home headline (the welcome line). We also
  // intentionally pass an empty `peers` for hreflang purposes only
  // when the metadata.availableLanguages list is empty — otherwise
  // the head builder emits one `<link rel=alternate>` per peer. The
  // peer hrefs use `../{lang}/index.html` which is already correct
  // for the home page.
  const pageTitle = escapeHtml(metadata.title);
  const headTags = buildHeadAssetTags(
    metadata,
    langLabel,
    pageTitle,
    labels.homeWelcome ?? metadata.title,
    `<p>${escapeHtml(labels.homeIntro ?? "")}</p>`,
    assets,
    prefix,
    context.seo,
    peers,
  );

  // Body data-* attrs for the code-copy script (it's content-hashed
  // language-agnostic so we keep emitting them — even though there
  // are no code blocks on the home, the script no-ops gracefully).
  const copyDataAttrs = [
    `data-copy-label="${escapeHtml(labels.copy ?? "Copy")}"`,
    `data-copied-label="${escapeHtml(labels.copied ?? "Copied!")}"`,
    `data-copy-failed-label="${escapeHtml(labels.copyFailed ?? "Copy failed")}"`,
  ].join(" ");

  return `<!DOCTYPE html>
<html lang="${escapeHtml(metadata.lang)}">
<head>
  ${headTags}
</head>
<body ${copyDataAttrs} data-page="home">
${topbar}
${versionBanner}
<div class="doc-page doc-page--home">
  ${sidebar}
  <main class="doc-main doc-main--home">
    ${versionNotice}
    <article class="home-article">
      ${heroHtml}
      ${aboutHtml}
      ${browseHtml}
    </article>
    ${articleFooter}
  </main>
</div>
${searchPalette}
${searchScript}
${versionBannerScript}
${interactionsScript}
</body>
</html>`;
}

/**
 * Build the site-root `dist/web/index.html` redirect page (FR-2753).
 *
 * Picks a language (`localStorage.lang` → `navigator.languages` →
 * `fallback`) and redirects via `location.replace` from a script in
 * `<head>` so no UI paints first. `<body>` carries only a `<noscript>`
 * fallback list. When `latestVersion` is set, the target and noscript
 * hrefs are prefixed with `./<latestVersion>/` to match the versioned
 * output layout (`dist/web/<version>/<lang>/...`); otherwise the flat
 * `./<lang>/index.html` shape is used.
 */
export interface RootRedirectIndexPageOptions {
  title: string;
  productName: string;
  languages: Array<{ lang: string; label: string }>;
  fallback: string;
  /**
   * When set, the redirect target and `<noscript>` hrefs are prefixed
   * with `./<latestVersion>/`. Used in versioned mode (FR-2729) where
   * pages live at `dist/web/<version>/<lang>/...`. Leave undefined for
   * flat-mode builds (FR-2710 F1 contract).
   */
  latestVersion?: string;
}

/** @deprecated Renamed to {@link RootRedirectIndexPageOptions}. */
export type LanguagePickerPageOptions = RootRedirectIndexPageOptions;

/**
 * Serialize a value to JSON safe for embedding inside an inline `<script>`.
 *
 * `JSON.stringify` alone is unsafe in HTML script context: a string containing
 * `</script>` would terminate the surrounding tag and let attacker-controlled
 * content execute as HTML. Even though the picker's input is operator-supplied
 * (`book.config.yaml` `languages`), defense-in-depth requires escaping the
 * known script-breakout sequences (`<`, `-->`, `--!>`, U+2028, U+2029) before
 * interpolating into a `<script>` block. Per the HTML5 spec, comments may end
 * with either `-->` or `--!>`, so both forms are escaped. The two comment-
 * closer forms use distinct literal replacements so each `>` is escaped via
 * a global string replace (CodeQL js/incomplete-sanitization).
 */
function safeJsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/--!>/g, "--!\\u003e")
    .replace(/-->/g, "--\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function buildRootRedirectIndexPage(
  opts: RootRedirectIndexPageOptions,
): string {
  const { title, productName, languages, fallback, latestVersion } = opts;
  if (languages.length === 0) {
    throw new Error(
      `buildRootRedirectIndexPage: \`languages\` must contain at least one entry`,
    );
  }
  const safeTitle = escapeHtml(title);
  const safeProduct = escapeHtml(productName);
  // BCP-47 tags are case-insensitive (`zh-CN` ≡ `zh-cn`). The redirect
  // script lowercases incoming `navigator.language[s]`, so we must also
  // lowercase the SUPPORTED list — otherwise an operator using
  // canonical casing in `book.config.yaml.languages` (e.g. `zh-CN`)
  // would never match a user's browser preference. URL hrefs preserve
  // the configured casing so on-disk directory names remain stable.
  const langCodes = languages.map((l) => l.lang.toLowerCase());
  const langCodesJson = safeJsonForScript(langCodes);
  const fallbackJson = safeJsonForScript(fallback.toLowerCase());
  const supportedHrefMapJson = safeJsonForScript(
    Object.fromEntries(languages.map((l) => [l.lang.toLowerCase(), l.lang])),
  );
  // The version prefix is interpolated into the URL the redirect script
  // builds. Require an alphanumeric first character so values like ".",
  // "..", or ".cache" can never produce a path-breakout target. The
  // upstream validator in `versions.ts` already enforces a stricter
  // shape; this is defense-in-depth for direct callers and tests.
  if (
    latestVersion !== undefined &&
    !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(latestVersion)
  ) {
    throw new Error(
      `buildRootRedirectIndexPage: invalid latestVersion ${JSON.stringify(latestVersion)}`,
    );
  }
  const versionPrefixJson = safeJsonForScript(
    latestVersion ? `${latestVersion}/` : "",
  );
  const versionHrefSegment = latestVersion
    ? `${escapeHtml(latestVersion)}/`
    : "";

  // <noscript> fallback links — used only by clients with JavaScript
  // disabled. The visible picker UI from the previous design has been
  // removed; on a JS-enabled client the redirect script (in <head>)
  // navigates away before <body> is parsed so this block never paints.
  const noscriptItems = languages
    .map(
      (l) =>
        `      <li><a hreflang="${escapeHtml(l.lang)}" lang="${escapeHtml(l.lang)}" href="./${versionHrefSegment}${escapeHtml(l.lang)}/index.html">${escapeHtml(l.label)}</a></li>`,
    )
    .join("\n");

  // The script is intentionally tiny and CSP-friendly. No fetch, no CDN,
  // no eval. It is placed at the top of <head> so it runs synchronously
  // before <body> parses — that is what eliminates the UI flash.
  // If a CSP is later added to the docs deploy, this block needs a
  // matching hash (or nonce) — it is the only inline script we ship.
  const script = `(function(){
  var SUPPORTED=${langCodesJson};
  var HREFS=${supportedHrefMapJson};
  var FALLBACK=${fallbackJson};
  var VERSION_PREFIX=${versionPrefixJson};
  function pick(){
    try{
      var ls=window.localStorage&&window.localStorage.getItem("lang");
      if(ls){
        var lsl=String(ls).toLowerCase();
        if(SUPPORTED.indexOf(lsl)>=0)return lsl;
      }
    }catch(e){}
    var navs=[];
    if(navigator.languages&&navigator.languages.length){
      for(var i=0;i<navigator.languages.length;i++)navs.push(navigator.languages[i]);
    }
    if(navigator.language)navs.push(navigator.language);
    for(var j=0;j<navs.length;j++){
      var tag=String(navs[j]||"").toLowerCase();
      if(SUPPORTED.indexOf(tag)>=0)return tag;
      var primary=tag.split("-")[0];
      if(SUPPORTED.indexOf(primary)>=0)return primary;
    }
    return FALLBACK;
  }
  // Loop-safety guard: only fire from the actual site root (\`/\` or
  // \`/index.html\`). Anything else — e.g. /26.3/ served by a hosting
  // 404 fallback that preserves the requested URL — must NOT trigger
  // the redirect, because \`location.replace("./...")\` would resolve
  // the relative target against the bogus URL and land the user on a
  // doubly-broken path.
  var p=window.location.pathname||"";
  if(!/^\\/?(?:index\\.html)?$/i.test(p))return;
  var picked=pick();
  // Map the matched (lower-cased) tag back to its original config
  // casing so the URL hits the actual on-disk directory name.
  var dir=Object.prototype.hasOwnProperty.call(HREFS,picked)?HREFS[picked]:HREFS[FALLBACK];
  window.location.replace("./"+VERSION_PREFIX+dir+"/index.html");
})();`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <meta name="robots" content="noindex" />
  <script>${script}</script>
</head>
<body>
  <noscript>
    <main style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;max-width:30rem;margin:4rem auto;padding:2rem;border:1px solid #ebedf0;border-radius:.5rem;">
      <h1 style="margin:0 0 .25rem 0;font-size:1.5rem;">${safeTitle}</h1>
      <p style="margin:0 0 1.5rem 0;color:#606770;font-size:.875rem;">${safeProduct}</p>
      <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.5rem;">
${noscriptItems}
      </ul>
    </main>
  </noscript>
</body>
</html>`;
}

/**
 * @deprecated Renamed to {@link buildRootRedirectIndexPage}. The page
 * is no longer a visible "language picker"; it is a redirect-only root
 * index. The alias is kept so external imports do not break in the
 * same release that introduces the rename.
 */
export const buildLanguagePickerPage = buildRootRedirectIndexPage;
