/**
 * HTML document builder for web preview.
 * Builds a styled page layout with sidebar TOC and main content.
 */

import type { Chapter } from './markdown-processor.js';
import { generateWebStyles } from './styles-web.js';

export interface WebDocMetadata {
  title: string;
  version: string;
  lang: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  th: 'ภาษาไทย',
};

function buildSidebarHtml(chapters: Chapter[], metadata: WebDocMetadata): string {
  const langLabel = LANGUAGE_LABELS[metadata.lang] || metadata.lang;

  const navItems = chapters
    .map((chapter, index) => {
      const num = index + 1;
      const anchorId = chapter.headings[0]?.id || `chapter-${chapter.slug}`;

      const subsections = chapter.headings.filter((h) => h.level === 2);
      let subsectionHtml = '';
      if (subsections.length > 0) {
        const subItems = subsections
          .map((h) => `<li><a href="#${h.id}">${h.text}</a></li>`)
          .join('\n');
        subsectionHtml = `<ul class="toc-subsections">${subItems}</ul>`;
      }

      return `<li><a href="#${anchorId}">${num}. ${chapter.title}</a>${subsectionHtml}</li>`;
    })
    .join('\n');

  return `
<aside class="doc-sidebar">
  <div class="doc-sidebar-header">
    <h2>${metadata.title}</h2>
    <div class="doc-meta">${metadata.version} &middot; ${langLabel}</div>
  </div>
  <ul class="doc-sidebar-nav">
    ${navItems}
  </ul>
</aside>`;
}

function buildContentHtml(chapters: Chapter[]): string {
  return chapters
    .map(
      (chapter) =>
        `<section class="chapter" id="chapter-${chapter.slug}">\n` +
        `${chapter.htmlContent}\n</section>`,
    )
    .join('\n');
}

function buildLiveReloadScript(): string {
  return `
<script>
(function() {
  let lastEtag = '';
  async function poll() {
    try {
      const res = await fetch('/__reload');
      const data = await res.json();
      if (lastEtag && lastEtag !== data.etag) {
        location.reload();
      }
      lastEtag = data.etag;
    } catch {}
    setTimeout(poll, 500);
  }
  poll();

  // Active sidebar link tracking
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          document.querySelectorAll('.doc-sidebar-nav a').forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
          break;
        }
      }
    },
    { rootMargin: '-10% 0px -80% 0px' }
  );
  document.querySelectorAll('h1[id], h2[id]').forEach(h => observer.observe(h));
})();
</script>`;
}

export function buildWebDocument(
  chapters: Chapter[],
  metadata: WebDocMetadata,
): string {
  const styles = generateWebStyles(metadata.lang);
  const sidebar = buildSidebarHtml(chapters, metadata);
  const content = buildContentHtml(chapters);
  const liveReload = buildLiveReloadScript();

  return `<!DOCTYPE html>
<html lang="${metadata.lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${metadata.title} - ${LANGUAGE_LABELS[metadata.lang] || metadata.lang}</title>
  <style>${styles}</style>
</head>
<body>
<div class="doc-page">
  ${sidebar}
  <main class="doc-main">
    ${content}
  </main>
</div>
${liveReload}
</body>
</html>`;
}
