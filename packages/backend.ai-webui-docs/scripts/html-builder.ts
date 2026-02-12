import fs from 'fs';
import path from 'path';
import type { Chapter } from './markdown-processor.js';
import type { PdfTheme } from './theme.js';
import { defaultTheme } from './theme.js';
import { generatePdfStyles } from './styles.js';

export interface DocMetadata {
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

const LOCALIZED_STRINGS: Record<string, { userGuide: string; tableOfContents: string }> = {
  en: { userGuide: 'User Guide', tableOfContents: 'Table of Contents' },
  ko: { userGuide: '사용자 가이드', tableOfContents: '목차' },
  ja: { userGuide: 'ユーザーガイド', tableOfContents: '目次' },
  th: { userGuide: 'คู่มือผู้ใช้', tableOfContents: 'สารบัญ' },
};

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

function buildCoverHtml(metadata: DocMetadata, logoSvg: string): string {
  const langLabel = LANGUAGE_LABELS[metadata.lang] || metadata.lang;
  const strings = LOCALIZED_STRINGS[metadata.lang] || LOCALIZED_STRINGS.en;
  const date = getFormattedDate(metadata.lang);

  return `
<section class="cover-page" id="cover-page">
  <div class="cover-logo">
    ${logoSvg}
  </div>
  <h1 class="cover-title">${metadata.title}</h1>
  <p class="cover-subtitle">${strings.userGuide}</p>
  <hr class="cover-divider" />
  <div class="cover-meta">
    <p class="version">${metadata.version}</p>
    <p class="company">Lablup Inc.</p>
    <p class="date">${date}</p>
    <p class="lang">${langLabel}</p>
  </div>
</section>
`;
}

function buildTocHtml(chapters: Chapter[], lang: string): string {
  const strings = LOCALIZED_STRINGS[lang] || LOCALIZED_STRINGS.en;
  const tocItems = chapters
    .map((chapter, index) => {
      const num = index + 1;
      const anchorId = chapter.headings[0]?.id || `chapter-${chapter.slug}`;
      const chapterLink = `<a href="#${anchorId}"><span class="toc-text">${num}. ${chapter.title}</span><span class="toc-pagenum" data-toc-target="${anchorId}"></span></a>`;

      // Get H2-level subsections
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
  <h1 class="toc-heading">${strings.tableOfContents}</h1>
  <ol class="toc-list">
    ${tocItems}
  </ol>
</section>
`;
}

function buildContentHtml(chapters: Chapter[]): string {
  return chapters
    .map(
      (chapter) =>
        `<section class="chapter" id="chapter-${chapter.slug}">\n` +
        `<a id="${chapter.slug}"></a>\n` +
        `${chapter.htmlContent}\n</section>`,
    )
    .join('\n');
}

/**
 * Build a single unified HTML document containing cover, TOC, and all content.
 * This ensures internal links work and page numbering is consistent.
 */
export function buildFullDocument(
  chapters: Chapter[],
  metadata: DocMetadata,
  docsRoot: string,
  theme: PdfTheme = defaultTheme,
): string {
  const logoPath = path.resolve(
    docsRoot,
    '../../manifest/backend.ai-brand-simple.svg',
  );
  const logoSvg = fs.existsSync(logoPath)
    ? fs.readFileSync(logoPath, 'utf-8')
    : '<div style="font-size:48px;color:#ff9d00;font-weight:bold;">Backend.AI</div>';

  const coverHtml = buildCoverHtml(metadata, logoSvg);
  const tocHtml = buildTocHtml(chapters, metadata.lang);
  const contentHtml = buildContentHtml(chapters);
  const styles = generatePdfStyles(theme);

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
