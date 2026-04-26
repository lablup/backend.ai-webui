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
import type { ResolvedDocConfig } from "./config.js";
import { WEBSITE_LABELS } from "./config.js";
import { escapeHtml } from "./markdown-extensions.js";
import { slugify } from "./markdown-processor.js";
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
  /** Site-root favicon filename, e.g. `favicon.ico`. */
  favicon?: string;
  /** Site-root apple-touch-icon filename, e.g. `apple-touch-icon.png`. */
  appleTouchIcon?: string;
  /** Site-root web app manifest filename, e.g. `site.webmanifest`. */
  webmanifest?: string;
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
    return `<details class="doc-sidebar-group"${openAttr}>
  <summary class="doc-sidebar-group__summary">${escapeHtml(group.category)}</summary>
  <ul class="doc-sidebar-nav doc-sidebar-nav--grouped" data-group="${escapeHtml(groupSlug)}">
    ${itemsHtml}
  </ul>
</details>`;
  };

  const isLegacyFlat =
    navGroups.length === 1 && navGroups[0].category === "";
  const groupsHtml = navGroups
    .map((g) => renderGroup(g, isLegacyFlat))
    .join("\n");

  const searchLabels = WEBSITE_LABELS[metadata.lang] ?? WEBSITE_LABELS.en;
  const placeholderAttr = escapeHtml(searchLabels.searchPlaceholder);
  const noResultsAttr = escapeHtml(searchLabels.noResults);

  return `
<aside class="doc-sidebar">
  <div class="doc-sidebar-header">
    <h2>${escapeHtml(metadata.title)}</h2>
    <div class="doc-meta">${escapeHtml(metadata.version)} &middot; ${escapeHtml(langLabel)}</div>
  </div>
  <div class="doc-search">
    <input type="text" id="search-input" placeholder="${placeholderAttr}" data-no-results="${noResultsAttr}" autocomplete="off" />
    <div id="search-results" class="search-results" hidden></div>
  </div>
  <nav class="doc-sidebar-groups" aria-label="Documentation navigation">
    ${groupsHtml}
  </nav>
</aside>`;
}

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
function buildBreadcrumb(chapter: Chapter, category: string, lang: string): string {
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
function buildRightRailToc(chapter: Chapter, lang: string): string {
  const labels = WEBSITE_LABELS[lang] ?? WEBSITE_LABELS.en;
  const heading = labels.onThisPage ?? "On this page";
  const items = chapter.headings.filter(
    (h) => h.level === 2 || h.level === 3,
  );
  if (items.length === 0) {
    // Render the aside container even when empty so the grid column has a
    // stable layout; CSS hides the heading when the list is empty.
    return `<aside class="doc-toc" aria-labelledby="doc-toc-heading" data-empty="true">
  <div class="doc-toc__heading" id="doc-toc-heading">${escapeHtml(heading)}</div>
  <ul class="doc-toc__list"></ul>
</aside>`;
  }
  const listItems = items
    .map(
      (h) =>
        `<li class="doc-toc__item doc-toc__item--h${h.level}"><a class="doc-toc__link" href="#${encodeURIComponent(h.id)}" data-toc-target="${escapeHtml(h.id)}">${escapeHtml(h.text)}</a></li>`,
    )
    .join("\n      ");
  return `<aside class="doc-toc" aria-labelledby="doc-toc-heading">
  <div class="doc-toc__heading" id="doc-toc-heading">${escapeHtml(heading)}</div>
  <ul class="doc-toc__list">
      ${listItems}
  </ul>
</aside>`;
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
  const versionSwitcher = buildVersionSwitcher(context);
  if (!versionSwitcher) {
    // Nothing to render in the header today. F1 will fill this in with
    // a language switcher; F6 leaves the scaffold absent until then so
    // we don't ship empty markup.
    return "";
  }
  return `<header class="page-header-bar">
  <nav class="page-header-nav" aria-label="Documentation navigation">
    ${versionSwitcher}
  </nav>
</header>`;
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
 * agnostic. Total inline JS budget < 1 KB; safely under the 25 KB total
 * per-page JS cap.
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
  // The handler is inlined to avoid a separate hashed asset for ~30 LoC.
  // It is idempotent and language-agnostic: the only state it touches is
  // `window.location.assign(...)` after a probe of the availability map.
  const inlineScript = `(function(){
  var sel = document.currentScript && document.currentScript.previousElementSibling;
  if (!sel || sel.tagName !== 'SELECT') return;
  sel.addEventListener('change', function(e) {
    var target = e.target.value;
    if (!target) return;
    var current = sel.dataset.current;
    if (target === current) return;
    var lang = sel.dataset.lang;
    var slug = sel.dataset.slug;
    var rootDepth = parseInt(sel.dataset.rootDepth, 10) || 2;
    var availability = {};
    try { availability = JSON.parse(sel.dataset.availability || '{}'); } catch (_) {}
    var hops = Math.max(0, rootDepth - 1);
    var prefix = '';
    for (var i = 0; i < hops; i++) { prefix += '../'; }
    var dest = availability[target]
      ? prefix + target + '/' + lang + '/' + slug + '.html'
      : prefix + target + '/' + lang + '/index.html';
    window.location.assign(dest);
  });
})();`;
  return `<label class="version-switcher-label" for="version-switcher">Version</label>
    <select
      id="version-switcher"
      class="version-switcher"
      data-current="${escapeHtml(ver.current)}"
      data-lang="${escapeHtml(context.metadata.lang)}"
      data-slug="${escapeHtml(ver.slug)}"
      data-root-depth="${ver.rootDepth}"
      data-availability="${escapeHtml(availabilityJson)}"
    >${optionsHtml}</select>
    <script>${inlineScript}</script>`;
}

/**
 * Build the right-rail TOC scroll-spy script tag (F3). The script uses
 * IntersectionObserver to track which heading section is currently in
 * view, then toggles the matching `.doc-toc__link` to `.is-active`.
 * Skipped when there is no TOC (chapter has no H2 headings) — in that
 * case the rail is rendered empty and the script is a no-op anyway.
 */
function buildTocScrollspyScriptTag(assets: PageAssets): string {
  if (!assets.tocScrollspy) return "";
  return `<script defer src="../assets/${escapeHtml(assets.tocScrollspy)}"></script>`;
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

  const sidebar = buildWebsiteSidebar(
    allChapters,
    currentIndex,
    metadata,
    config,
    navGroups,
  );
  const pageHeader = buildPageHeader(metadata, peers);
  const breadcrumb = buildBreadcrumb(chapter, category, metadata.lang);
  const innerContent = buildPageContent(chapter);
  const rightRailToc = buildRightRailToc(chapter, metadata.lang);
  const metadataBar = buildPageMetadata(context);
  const pagination = buildPaginationNav(
    allChapters,
    currentIndex,
    metadata.lang,
  );
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
  const headerBar = buildPageHeaderBar(context);
  const searchScript = buildSearchScriptTag(assets, prefix);
  const codeCopyScript = buildCodeCopyScriptTag(assets, prefix);
  const tocScrollspyScript = buildTocScrollspyScriptTag(assets);

  return `<!DOCTYPE html>
<html lang="${escapeHtml(metadata.lang)}">
<head>
  ${headTags}
</head>
<body>
${headerBar}
<div class="doc-page">
  ${sidebar}
  <main class="doc-main">
    ${pageHeader}
    ${breadcrumb}
    ${innerContent}
    <div class="page-footer">
      ${metadataBar}
      ${pagination}
    </div>
  </main>
  ${rightRailToc}
</div>
${searchScript}
${codeCopyScript}
${tocScrollspyScript}
</body>
</html>`;
}

/**
 * Build an index.html that redirects to the first page.
 */
export function buildIndexPage(
  chapters: Chapter[],
  metadata: WebsiteMetadata,
): string {
  const firstSlug = chapters[0]?.slug ?? "index";
  return `<!DOCTYPE html>
<html lang="${escapeHtml(metadata.lang)}">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0; url=./${firstSlug}.html" />
  <title>${escapeHtml(metadata.title)}</title>
</head>
<body>
  <p>Redirecting to <a href="./${firstSlug}.html">${escapeHtml(metadata.title)}</a>...</p>
</body>
</html>`;
}

/**
 * Build the site-root `dist/web/index.html` language picker page.
 *
 * The picker renders a static list of language choices so users without
 * JavaScript can still navigate. With JavaScript enabled, an inline
 * (≤ 1 KB) script consults — in order — `localStorage.lang` (sticky user
 * choice from a previous visit), `navigator.language[s]` (browser
 * preference), and finally the explicit `fallback` language. The chosen
 * language's landing page is loaded via `location.replace` so the picker
 * does not enter the back-button history.
 *
 * Loop-safety: the redirect ONLY fires from this exact page (`pathname`
 * ends with `/` or `/index.html`). Per-language pages never redirect, and
 * `localStorage.lang` is set only on an explicit user click — so the
 * picker can never be reached and immediately bounced away again in a
 * cycle. Falls back to `fallback` (typically `"en"`) when no signal is
 * available.
 */
export interface LanguagePickerPageOptions {
  title: string;
  productName: string;
  languages: Array<{ lang: string; label: string }>;
  fallback: string;
}

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

export function buildLanguagePickerPage(
  opts: LanguagePickerPageOptions,
): string {
  const { title, productName, languages, fallback } = opts;
  const safeTitle = escapeHtml(title);
  const safeProduct = escapeHtml(productName);
  const langCodes = languages.map((l) => l.lang);
  const langCodesJson = safeJsonForScript(langCodes);
  const fallbackJson = safeJsonForScript(fallback);

  const items = languages
    .map(
      (l) =>
        `      <li><a class="lang-pick" data-lang="${escapeHtml(l.lang)}" hreflang="${escapeHtml(l.lang)}" lang="${escapeHtml(l.lang)}" href="./${escapeHtml(l.lang)}/index.html">${escapeHtml(l.label)}</a></li>`,
    )
    .join("\n");

  // The script is intentionally tiny and CSP-friendly. No fetch, no CDN,
  // no eval. It runs once on first load of `/` (or `/index.html`).
  const script = `(function(){
  var SUPPORTED=${langCodesJson};
  var FALLBACK=${fallbackJson};
  function pick(){
    try{
      var ls=window.localStorage&&window.localStorage.getItem("lang");
      if(ls&&SUPPORTED.indexOf(ls)>=0)return ls;
    }catch(e){}
    var navs=[];
    if(navigator.languages&&navigator.languages.length){
      for(var i=0;i<navigator.languages.length;i++)navs.push(navigator.languages[i]);
    }
    if(navigator.language)navs.push(navigator.language);
    for(var j=0;j<navs.length;j++){
      var tag=String(navs[j]||"").toLowerCase();
      // Try full tag, then primary subtag (e.g. "ko-kr" -> "ko").
      if(SUPPORTED.indexOf(tag)>=0)return tag;
      var primary=tag.split("-")[0];
      if(SUPPORTED.indexOf(primary)>=0)return primary;
    }
    return FALLBACK;
  }
  // Loop-safety guard: only redirect from the picker page itself, never
  // from inside a language subtree. The picker script is only included in
  // the root index.html, but this check makes the safety property visible
  // and survives accidental re-inclusion (e.g. via templating mistakes).
  var p=(window.location.pathname||"").toLowerCase();
  var atRoot=/(?:^|\\/)(?:index\\.html)?$/.test(p);
  var inLangDir=false;
  for(var k=0;k<SUPPORTED.length;k++){
    if(p.indexOf("/"+SUPPORTED[k]+"/")>=0){inLangDir=true;break;}
  }
  if(!atRoot||inLangDir)return;
  var target=pick();
  if(SUPPORTED.indexOf(target)<0)target=FALLBACK;
  window.location.replace("./"+target+"/index.html");
})();
// Persist explicit user choice from the visible picker.
document.addEventListener("click",function(e){
  var t=e.target;
  while(t&&t!==document){
    if(t.tagName==="A"&&t.classList&&t.classList.contains("lang-pick")){
      try{window.localStorage.setItem("lang",t.getAttribute("data-lang"));}catch(err){}
      return;
    }
    t=t.parentNode;
  }
});`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <meta name="robots" content="noindex" />
  <style>
    body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;margin:0;background:#fff;color:#1c1e21;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:2rem;}
    .lp-card{max-width:30rem;width:100%;border:1px solid #ebedf0;border-radius:.5rem;padding:2rem;box-shadow:0 1px 3px rgba(0,0,0,.05);}
    .lp-title{margin:0 0 .25rem 0;font-size:1.5rem;}
    .lp-product{margin:0 0 1.5rem 0;color:#606770;font-size:.875rem;}
    .lp-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.5rem;}
    .lp-list a{display:block;padding:.75rem 1rem;border:1px solid #ebedf0;border-radius:.4rem;color:#3578e5;text-decoration:none;font-weight:500;}
    .lp-list a:hover,.lp-list a:focus{background:#f5f6f7;border-color:#dadde1;}
  </style>
</head>
<body>
  <main class="lp-card">
    <h1 class="lp-title">${safeTitle}</h1>
    <p class="lp-product">${safeProduct}</p>
    <ul class="lp-list">
${items}
    </ul>
  </main>
  <script>${script}</script>
</body>
</html>`;
}
