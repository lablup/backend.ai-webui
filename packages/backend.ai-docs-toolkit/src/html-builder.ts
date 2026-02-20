import fs from 'fs';
import type { Chapter } from './markdown-processor.js';
import type { PdfTheme } from './theme.js';
import { defaultTheme } from './theme.js';
import { generatePdfStyles } from './styles.js';
import type { ResolvedDocConfig } from './config.js';

export interface DocMetadata {
  title: string;
  version: string;
  lang: string;
}

function getFormattedDate(lang: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.toLocaleString(
    lang === 'th'
      ? 'th-TH'
      : lang === 'ja'
        ? 'ja-JP'
        : lang === 'ko'
          ? 'ko-KR'
          : 'en-US',
    { month: 'long' },
  );
  return `${month} ${year}`;
}

function buildCoverHtml(
  metadata: DocMetadata,
  logoSvg: string,
  config: ResolvedDocConfig,
): string {
  const langLabel = config.languageLabels[metadata.lang] || metadata.lang;
  const strings = config.localizedStrings[metadata.lang] || config.localizedStrings['en'];
  const date = getFormattedDate(metadata.lang);

  return `
<section class="cover-page" id="cover-page">
  <div class="cover-logo">
    ${logoSvg}
  </div>
  <h1 class="cover-title">${metadata.title}</h1>
  <p class="cover-subtitle">${strings?.userGuide ?? 'User Guide'}</p>
  <hr class="cover-divider" />
  <div class="cover-meta">
    <p class="version">${metadata.version}</p>
    <p class="company">${config.company}</p>
    <p class="date">${date}</p>
    <p class="lang">${langLabel}</p>
  </div>
</section>
`;
}

function buildTocHtml(chapters: Chapter[], lang: string, config: ResolvedDocConfig): string {
  const strings = config.localizedStrings[lang] || config.localizedStrings['en'];
  const tocItems = chapters
    .map((chapter, index) => {
      const num = index + 1;
      const anchorId = chapter.headings[0]?.id || `chapter-${chapter.slug}`;
      const chapterLink = `<a href="#${anchorId}"><span class="toc-text">${num}. ${chapter.title}</span><span class="toc-pagenum" data-toc-target="${anchorId}"></span></a>`;

      const subsections = chapter.headings.filter((h) => h.level === 2);
      let subsectionHtml = '';
      if (subsections.length > 0) {
        const subItems = subsections
          .map(
            (h) =>
              `<li><a href="#${h.id}"><span class="toc-text">${h.text}</span><span class="toc-pagenum" data-toc-target="${h.id}"></span></a></li>`,
          )
          .join('\n');
        subsectionHtml = `\n<ol class="toc-sections">\n${subItems}\n</ol>`;
      }

      return `<li class="toc-chapter">${chapterLink}${subsectionHtml}</li>`;
    })
    .join('\n');

  return `
<section class="toc-section" id="toc-section">
  <h1 class="toc-heading">${strings?.tableOfContents ?? 'Table of Contents'}</h1>
  <ol class="toc-list">
    ${tocItems}
  </ol>
</section>
`;
}

function buildContentHtml(chapters: Chapter[]): string {
  return chapters
    .map(
      (chapter, index) => {
        const chapterNum = index + 1;
        const chapterTitle = chapter.title;
        return (
          `<section class="chapter" id="chapter-${chapter.slug}" data-chapter-num="${chapterNum}" data-chapter-title="${chapterTitle}">\n` +
          `<a id="${chapter.slug}"></a>\n` +
          `<div class="chapter-title-page">\n` +
          `  <div class="chapter-number">Chapter ${chapterNum}</div>\n` +
          `  <div class="chapter-title-text">${chapterTitle}</div>\n` +
          `  <div class="chapter-title-divider"></div>\n` +
          `</div>\n` +
          `${chapter.htmlContent}\n</section>`
        );
      },
    )
    .join('\n');
}

/**
 * Build a single unified HTML document containing cover, TOC, and all content.
 */
export function buildFullDocument(
  chapters: Chapter[],
  metadata: DocMetadata,
  config: ResolvedDocConfig,
  theme: PdfTheme = defaultTheme,
): string {
  let logoSvg: string;
  if (config.logoPath && fs.existsSync(config.logoPath)) {
    logoSvg = fs.readFileSync(config.logoPath, 'utf-8');
  } else {
    logoSvg = config.logoFallbackHtml;
  }

  const coverHtml = buildCoverHtml(metadata, logoSvg, config);
  const tocHtml = buildTocHtml(chapters, metadata.lang, config);
  const contentHtml = buildContentHtml(chapters);
  const styles = generatePdfStyles(theme, metadata.lang);

  return `<!DOCTYPE html>
<html lang="${metadata.lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${metadata.title} (${metadata.lang})</title>
  <style>${styles}</style>
</head>
<body>
${coverHtml}
${tocHtml}
${contentHtml}
</body>
</html>`;
}
