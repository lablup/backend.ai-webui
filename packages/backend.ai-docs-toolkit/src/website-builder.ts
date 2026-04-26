/**
 * Multi-page HTML builder for static website generation.
 * Generates individual HTML pages from processed chapters with sidebar navigation.
 */

import type { Chapter } from "./markdown-processor.js";
import type { ResolvedDocConfig } from "./config.js";
import { WEBSITE_LABELS } from "./config.js";
import { escapeHtml } from "./markdown-extensions.js";

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
   * Versioned-docs context (F6). Optional — only set when the build is
   * running in versioned mode (`versions` declared in config). Drives
   * the header version selector and the "is this the latest?" hint
   * the page metadata bar can show.
   */
  versionContext?: PageVersionContext;
}

export interface WebsiteMetadata {
  title: string;
  version: string;
  lang: string;
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
  /** Site-root favicon filename, e.g. `favicon.ico`. */
  favicon?: string;
  /** Site-root apple-touch-icon filename, e.g. `apple-touch-icon.png`. */
  appleTouchIcon?: string;
  /** Site-root web app manifest filename, e.g. `site.webmanifest`. */
  webmanifest?: string;
}

/**
 * Build sidebar HTML for a multi-page website.
 * Current page is highlighted, subsections shown only for active page.
 */
function buildWebsiteSidebar(
  chapters: Chapter[],
  currentIndex: number,
  metadata: WebsiteMetadata,
  config: ResolvedDocConfig,
): string {
  const langLabel = config.languageLabels[metadata.lang] || metadata.lang;

  const navItems = chapters
    .map((chapter, index) => {
      const num = index + 1;
      const isActive = index === currentIndex;
      const href = `./${chapter.slug}.html`;
      const activeClass = isActive ? ' class="active"' : "";

      let subsectionHtml = "";
      if (isActive) {
        const subsections = chapter.headings.filter((h) => h.level === 2);
        if (subsections.length > 0) {
          const subItems = subsections
            .map(
              (h) =>
                `<li><a href="#${encodeURIComponent(h.id)}">${escapeHtml(h.text)}</a></li>`,
            )
            .join("\n");
          subsectionHtml = `<ul class="toc-subsections">${subItems}</ul>`;
        }
      }

      return `<li><a href="${href}"${activeClass}>${num}. ${escapeHtml(chapter.title)}</a>${subsectionHtml}</li>`;
    })
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
  <ul class="doc-sidebar-nav">
    ${navItems}
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
 */
function buildHeadAssetTags(
  metadata: WebsiteMetadata,
  langLabel: string,
  pageTitle: string,
  assets: PageAssets,
  prefix: string,
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

  // Suppress unused-variable warning under strict TS — `metadata` is reserved
  // for future per-language `<head>` extensions (e.g., hreflang) but not used yet.
  void metadata;

  return lines.join("\n  ");
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
 * Build a complete HTML page for a single chapter in the static website.
 */
export function buildWebPage(context: WebPageContext): string {
  const { chapter, allChapters, currentIndex, metadata, config, assets } =
    context;

  const prefix = rootPrefix(context);

  const sidebar = buildWebsiteSidebar(
    allChapters,
    currentIndex,
    metadata,
    config,
  );
  const content = buildPageContent(chapter);
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
    assets,
    prefix,
  );
  const headerBar = buildPageHeaderBar(context);
  const searchScript = buildSearchScriptTag(assets, prefix);
  const codeCopyScript = buildCodeCopyScriptTag(assets, prefix);

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
    ${content}
    <div class="page-footer">
      ${metadataBar}
      ${pagination}
    </div>
  </main>
</div>
${searchScript}
${codeCopyScript}
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
