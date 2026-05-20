/**
 * HTML document builder for web preview.
 * Builds a styled page layout with sidebar TOC and main content.
 */

import fs from 'fs';
import type { Chapter } from './markdown-processor.js';
import { generateWebStyles } from './styles-web.js';
import type { ResolvedDocConfig } from './config.js';

export interface WebDocMetadata {
  title: string;
  version: string;
  lang: string;
}

function buildPreviewTopbar(
  metadata: WebDocMetadata,
  config?: ResolvedDocConfig,
): string {
  // Read logo SVG from the filesystem and inline as a base64 data URI so
  // the preview server doesn't need a separate static-asset route.
  const readLogoB64 = (absPath: string | null): string | null => {
    if (!absPath) return null;
    try {
      return Buffer.from(fs.readFileSync(absPath, 'utf-8')).toString('base64');
    } catch {
      return null;
    }
  };

  const lightB64 = config ? readLogoB64(config.branding.logoLight) : null;
  const darkB64 = config ? readLogoB64(config.branding.logoDark) : null;

  let brandLogoHtml: string;
  if (lightB64) {
    const lightSrc = `data:image/svg+xml;base64,${lightB64}`;
    const alt = metadata.title;
    if (darkB64 && darkB64 !== lightB64) {
      const darkSrc = `data:image/svg+xml;base64,${darkB64}`;
      brandLogoHtml =
        `<img class="bai-brand-logo bai-brand-logo--light" src="${lightSrc}" alt="${alt}" />` +
        `<img class="bai-brand-logo bai-brand-logo--dark" src="${darkSrc}" alt="${alt}" />`;
    } else {
      brandLogoHtml = `<img class="bai-brand-logo" src="${lightSrc}" alt="${alt}" />`;
    }
  } else {
    brandLogoHtml = `<span class="bai-brand-fallback">${metadata.title}</span>`;
  }

  const subLabelMap = config?.branding.subLabel ?? {};
  const subLabel = subLabelMap[metadata.lang] ?? subLabelMap['default'] ?? '';
  const subLabelHtml = subLabel
    ? `<span class="bai-brand-divider" aria-hidden="true"></span><span class="bai-brand-sub">${subLabel}</span>`
    : '';

  const versionPillHtml = `<span class="bai-brand-version">${metadata.version}</span>`;

  const themeIconLight = `<svg class="bai-theme-icon bai-theme-icon--light" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>`;
  const themeIconDark = `<svg class="bai-theme-icon bai-theme-icon--dark" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>`;
  const themeToggleHtml = `<button class="bai-iconbtn" type="button" data-theme-toggle aria-label="Toggle dark mode">${themeIconLight}${themeIconDark}</button>`;

  return `<header class="bai-topbar" role="banner">
  <a class="bai-topbar__brand" href="#">
    ${brandLogoHtml}
    ${subLabelHtml}
    ${versionPillHtml}
  </a>
  <div class="bai-topbar__actions">
    ${themeToggleHtml}
  </div>
</header>`;
}

function buildSidebarHtml(
  chapters: Chapter[],
  metadata: WebDocMetadata,
  config?: ResolvedDocConfig,
): string {
  const languageLabels = config?.languageLabels ?? {
    en: 'English',
    ko: '한국어',
    ja: '日本語',
    th: 'ภาษาไทย',
  };
  const langLabel = languageLabels[metadata.lang] || metadata.lang;

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

  // FR-2768 made .doc-sidebar a fixed-height, overflow:hidden flex column
  // and delegated scrolling to an inner .doc-sidebar__scroll element (see
  // styles-web.ts). website-builder.ts emits that wrapper; this legacy
  // single-page preview builder must too, otherwise the nav overflows a
  // clipped container with no scrollport and the sidebar can't scroll.
  // .doc-sidebar-header is display:none in Phase 2, so leaving it outside
  // the scrollport mirrors the pinned version block in website-builder.ts.
  return `
<aside class="doc-sidebar">
  <div class="doc-sidebar-header">
    <h2>${metadata.title}</h2>
    <div class="doc-meta">${metadata.version} &middot; ${langLabel}</div>
  </div>
  <div class="doc-sidebar__scroll">
    <ul class="doc-sidebar-nav">
      ${navItems}
    </ul>
  </div>
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
  // Theme toggle — production uses interactions.js; preview uses this inline stub.
  const stored = localStorage.getItem('bai-theme');
  if (stored) document.documentElement.setAttribute('data-theme', stored);
  document.addEventListener('click', function(e) {
    if (e.target.closest('[data-theme-toggle]')) {
      const next = (document.documentElement.getAttribute('data-theme') || 'light') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('bai-theme', next);
    }
  });

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
  config?: ResolvedDocConfig,
): string {
  // FR-2726: forward consumer branding tokens to the preview stylesheet
  // so preview renders with the same accent palette as the production
  // build. Skipped silently when `config` is omitted.
  const styles = generateWebStyles(
    metadata.lang,
    config
      ? {
          primaryColor: config.branding.primaryColor,
          primaryColorHover: config.branding.primaryColorHover,
          primaryColorActive: config.branding.primaryColorActive,
          primaryColorSoft: config.branding.primaryColorSoft,
        }
      : undefined,
  );
  const topbar = buildPreviewTopbar(metadata, config);
  const sidebar = buildSidebarHtml(chapters, metadata, config);
  const content = buildContentHtml(chapters);
  const liveReload = buildLiveReloadScript();

  const languageLabels = config?.languageLabels ?? {
    en: 'English',
    ko: '한국어',
    ja: '日本語',
    th: 'ภาษาไทย',
  };

  return `<!DOCTYPE html>
<html lang="${metadata.lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${metadata.title} - ${languageLabels[metadata.lang] || metadata.lang}</title>
  <style>${styles}</style>
</head>
<body>
${topbar}
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
