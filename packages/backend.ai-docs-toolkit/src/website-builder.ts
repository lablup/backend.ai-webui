/**
 * Multi-page HTML builder for static website generation.
 * Generates individual HTML pages from processed chapters with sidebar navigation.
 */

import type { Chapter } from './markdown-processor.js';
import type { ResolvedDocConfig } from './config.js';
import { escapeHtml } from './markdown-extensions.js';

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
}

export interface WebsiteMetadata {
  title: string;
  version: string;
  lang: string;
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
      const activeClass = isActive ? ' class="active"' : '';

      let subsectionHtml = '';
      if (isActive) {
        const subsections = chapter.headings.filter((h) => h.level === 2);
        if (subsections.length > 0) {
          const subItems = subsections
            .map((h) => `<li><a href="#${encodeURIComponent(h.id)}">${escapeHtml(h.text)}</a></li>`)
            .join('\n');
          subsectionHtml = `<ul class="toc-subsections">${subItems}</ul>`;
        }
      }

      return `<li><a href="${href}"${activeClass}>${num}. ${escapeHtml(chapter.title)}</a>${subsectionHtml}</li>`;
    })
    .join('\n');

  return `
<aside class="doc-sidebar">
  <div class="doc-sidebar-header">
    <h2>${escapeHtml(metadata.title)}</h2>
    <div class="doc-meta">${escapeHtml(metadata.version)} &middot; ${escapeHtml(langLabel)}</div>
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
 * Build a complete HTML page for a single chapter in the static website.
 */
export function buildWebPage(context: WebPageContext): string {
  const { chapter, allChapters, currentIndex, metadata, config } = context;

  const sidebar = buildWebsiteSidebar(allChapters, currentIndex, metadata, config);
  const content = buildPageContent(chapter);
  const langLabel = config.languageLabels[metadata.lang] || metadata.lang;
  const pageTitle = `${escapeHtml(chapter.title)} - ${escapeHtml(metadata.title)}`;

  return `<!DOCTYPE html>
<html lang="${escapeHtml(metadata.lang)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${pageTitle} - ${escapeHtml(langLabel)}</title>
  <link rel="stylesheet" href="../assets/styles.css" />
</head>
<body>
<div class="doc-page">
  ${sidebar}
  <main class="doc-main">
    ${content}
    <div class="page-footer"></div>
  </main>
</div>
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
  const firstSlug = chapters[0]?.slug ?? 'index';
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
