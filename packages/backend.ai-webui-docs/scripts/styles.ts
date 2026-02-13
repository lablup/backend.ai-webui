import type { PdfTheme } from './theme.js';
import { defaultTheme } from './theme.js';

const CJK_LANGS = new Set(['ko', 'ja', 'zh', 'zh-CN', 'zh-TW']);

export function generatePdfStyles(theme: PdfTheme, lang?: string): string {
  const isCjk = lang ? CJK_LANGS.has(lang) : false;
  return `
/* ==========================================================================
   Base
   ========================================================================== */
@page {
  size: A4;
  margin: 25mm 20mm 20mm 20mm;
}

* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans",
    "Noto Sans KR", "Noto Sans JP", "Noto Sans Thai",
    Helvetica, Arial, sans-serif;
  font-size: ${theme.baseFontSize};
  line-height: 1.6;
  color: ${theme.textPrimary};
  margin: 0;
  padding: 0;
  text-align: justify;
  ${isCjk ? 'word-break: keep-all;' : '-webkit-hyphens: auto; hyphens: auto;'}
  overflow-wrap: break-word;
}

/* ==========================================================================
   Cover Page
   ========================================================================== */
.cover-page {
  page-break-after: always;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 60px 40px;
}

.cover-logo {
  margin-bottom: 80px;
}

.cover-logo svg {
  width: ${theme.coverLogoWidth};
  height: auto;
}

.cover-title {
  font-size: ${theme.coverTitleSize};
  font-weight: 700;
  color: ${theme.textPrimary};
  margin: 0 0 16px 0;
  letter-spacing: -0.5px;
  border: none;
  padding: 0;
}

.cover-subtitle {
  font-size: ${theme.coverSubtitleSize};
  color: ${theme.textSecondary};
  margin: 0 0 60px 0;
  font-weight: 400;
}

.cover-meta {
  color: ${theme.textTertiary};
  font-size: ${theme.baseFontSize};
  line-height: 2;
}

.cover-meta .version {
  font-size: 16pt;
  color: #444;
  font-weight: 600;
  margin-bottom: 8px;
}

.cover-meta .company {
  font-size: 12pt;
  color: ${theme.textSecondary};
}

.cover-meta .date,
.cover-meta .lang {
  font-size: ${theme.baseFontSize};
  color: #999;
}

.cover-divider {
  width: 80px;
  height: 3px;
  background: ${theme.brandColor};
  margin: 40px auto;
  border: none;
}

/* ==========================================================================
   Table of Contents
   ========================================================================== */
.toc-section {
  page-break-after: always;
}

.toc-heading {
  font-size: ${theme.tocHeadingSize};
  margin-bottom: 30px;
  border-bottom: 2px solid ${theme.brandColor};
  padding-bottom: 10px;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-chapter {
  margin-bottom: 4px;
}

.toc-chapter > a {
  font-size: ${theme.baseFontSize};
  font-weight: 600;
  color: ${theme.textPrimary};
  text-decoration: none;
  display: flex;
  align-items: baseline;
  padding: 4px 0;
  border-bottom: 0.5px solid #eee;
}

.toc-chapter > a .toc-text {
  flex-shrink: 0;
  margin-right: 4px;
}

.toc-chapter > a .toc-pagenum {
  flex-shrink: 0;
  margin-left: auto;
  text-align: right;
  min-width: 30px;
  color: ${theme.textSecondary};
  font-weight: 400;
}

.toc-sections {
  list-style: none;
  padding-left: 24px;
  margin: 2px 0 4px 0;
}

.toc-sections li {
  margin-bottom: 1px;
}

.toc-sections li a {
  font-size: 10pt;
  font-weight: 400;
  color: #555;
  text-decoration: none;
  display: flex;
  align-items: baseline;
  padding: 1px 0;
}

.toc-sections li a .toc-text {
  flex-shrink: 0;
  margin-right: 4px;
}

.toc-sections li a .toc-pagenum {
  flex-shrink: 0;
  margin-left: auto;
  text-align: right;
  min-width: 30px;
  color: ${theme.textTertiary};
}

/* ==========================================================================
   Chapter Content
   ========================================================================== */
.chapter {
  page-break-before: always;
}

/* Book-like chapter title area — occupies ~1/3 of the top of the page before content starts */
.chapter-title-page {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 200px;
  padding: 40px 0 32px 0;
  margin-bottom: 24px;
  border-bottom: 1px solid ${theme.borderColor};
  /* No page-break-after: content flows directly below the title */
}

.chapter-number {
  font-size: 12pt;
  font-weight: 400;
  color: ${theme.textTertiary};
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.chapter-title-text {
  font-size: 24pt;
  font-weight: 700;
  color: ${theme.textPrimary};
  line-height: 1.2;
  margin-bottom: 16px;
}

.chapter-title-divider {
  width: 60px;
  height: 3px;
  background: ${theme.brandColor};
}

h1 {
  font-size: ${theme.headingH1Size};
  font-weight: 700;
  color: ${theme.textPrimary};
  margin-top: 0;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid ${theme.brandColor};
}

/* H1 already displayed on the chapter title page — hidden in content area
   but kept in DOM for PDF named destinations */
h1.chapter-h1-hidden {
  font-size: 0;
  line-height: 0;
  height: 0;
  margin: 0;
  padding: 0;
  border: none;
  overflow: hidden;
}

h2 {
  font-size: ${theme.headingH2Size};
  font-weight: 600;
  color: #2a2a2a;
  margin-top: 32px;
  margin-bottom: 14px;
  page-break-after: avoid;
}

h3 {
  font-size: ${theme.headingH3Size};
  font-weight: 600;
  color: #3a3a3a;
  margin-top: 24px;
  margin-bottom: 10px;
  page-break-after: avoid;
}

h4 {
  font-size: ${theme.headingH4Size};
  font-weight: 600;
  color: #444;
  margin-top: 18px;
  margin-bottom: 8px;
  page-break-after: avoid;
}

p {
  margin: 8px 0;
  orphans: 3;
  widows: 3;
}

/* ==========================================================================
   Images – figure with caption and shadow
   ========================================================================== */
.doc-figure {
  margin: 16px 0;
  padding: 0;
  page-break-inside: avoid;
  text-align: center;
}

.doc-figure figcaption {
  font-size: 9pt;
  color: ${theme.textSecondary};
  margin-top: 6px;
  font-style: italic;
  line-height: 1.4;
}

.doc-image-wrap {
  margin: 12px 0;
  page-break-inside: avoid;
  overflow: visible;
  text-align: center;
}

.doc-image {
  max-width: 100%;
  height: auto;
  display: inline-block;
  border-radius: 4px;
  border: 0.5px solid #d0d0d0;
}

/* ==========================================================================
   Tables
   ========================================================================== */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: ${theme.tableFontSize};
  page-break-inside: auto;
}

thead {
  display: table-header-group;
}

tr {
  page-break-inside: avoid;
}

th {
  background-color: ${theme.tableHeaderBg};
  font-weight: 600;
  text-align: left;
  padding: 8px 10px;
  border: 0.5px solid ${theme.tableBorder};
}

td {
  padding: 6px 10px;
  border: 0.5px solid ${theme.tableBorder};
  vertical-align: top;
}

/* ==========================================================================
   Code
   ========================================================================== */
code {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: ${theme.codeFontSize};
  background-color: ${theme.codeBackground};
  padding: 1px 5px;
  border-radius: 3px;
  border: 0.5px solid ${theme.codeBorder};
}

pre {
  background-color: ${theme.codeBackground};
  padding: 12px;
  border-radius: 4px;
  border: 0.5px solid ${theme.codeBorder};
  font-size: ${theme.codeFontSize};
  line-height: 1.5;
  page-break-inside: avoid;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: break-word;
}

pre code {
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: break-word;
}

/* ==========================================================================
   Lists
   ========================================================================== */
ul, ol {
  margin: 8px 0;
  padding-left: 24px;
}

li {
  margin-bottom: 4px;
}

li > ul,
li > ol {
  margin-top: 4px;
  margin-bottom: 4px;
}

/* ==========================================================================
   Blockquotes (Notes)
   ========================================================================== */
blockquote {
  margin: 14px 0;
  padding: 10px 16px;
  border-left: 3px solid ${theme.blockquoteBorderColor};
  background-color: ${theme.blockquoteBg};
  font-size: ${theme.blockquoteFontSize};
  color: #555;
  page-break-inside: avoid;
}

blockquote p {
  margin: 4px 0;
}

/* ==========================================================================
   Links
   ========================================================================== */
a {
  color: ${theme.linkColor};
  text-decoration: none;
}

a[href^="#"] {
  color: ${theme.linkColor};
}

/* ==========================================================================
   Horizontal Rules
   ========================================================================== */
hr {
  border: none;
  border-top: 1px solid ${theme.borderColor};
  margin: 24px 0;
}

/* ==========================================================================
   Strong / Emphasis
   ========================================================================== */
strong {
  font-weight: 600;
}

em {
  font-style: italic;
}

/* ==========================================================================
   Admonitions
   ========================================================================== */
.admonition {
  margin: 14px 0;
  padding: 12px 16px;
  border-left: 4px solid;
  border-radius: 0 4px 4px 0;
  page-break-inside: avoid;
}

.admonition-heading {
  font-weight: 700;
  font-size: 0.85em;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.admonition-icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
}

.admonition-icon svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
}

.admonition-content p:first-child { margin-top: 0; }
.admonition-content p:last-child { margin-bottom: 0; }

.admonition-note    { border-color: #54c7ec; background: #f0faff; color: ${theme.textPrimary}; }
.admonition-note    .admonition-heading { color: #1fa4d4; }
.admonition-tip     { border-color: #00a400; background: #f0fff0; color: ${theme.textPrimary}; }
.admonition-tip     .admonition-heading { color: #008a00; }
.admonition-info    { border-color: #54c7ec; background: #f0faff; color: ${theme.textPrimary}; }
.admonition-info    .admonition-heading { color: #1fa4d4; }
.admonition-warning { border-color: #ffba00; background: #fffbf0; color: ${theme.textPrimary}; }
.admonition-warning .admonition-heading { color: #d49e00; }
.admonition-caution { border-color: #ffba00; background: #fffbf0; color: ${theme.textPrimary}; }
.admonition-caution .admonition-heading { color: #d49e00; }
.admonition-danger  { border-color: #fa383e; background: #fff5f5; color: ${theme.textPrimary}; }
.admonition-danger  .admonition-heading { color: #e8232a; }

/* ==========================================================================
   Code Block Title & Line Highlighting
   ========================================================================== */
.code-block-wrapper {
  margin: 12px 0;
  border-radius: 4px;
  border: 0.5px solid ${theme.codeBorder};
  overflow: hidden;
  page-break-inside: avoid;
}

.code-block-title {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: ${theme.codeFontSize};
  background: #e8e8e8;
  padding: 6px 12px;
  font-weight: 600;
  border-bottom: 0.5px solid ${theme.codeBorder};
}

.code-block-wrapper pre {
  margin: 0;
  border: none;
  border-radius: 0;
}

.code-line {
  display: block;
}

.code-line.highlighted {
  background: rgba(53, 120, 229, 0.1);
  border-left: 3px solid #3578e5;
  margin-left: -12px;
  padding-left: 9px;
}

/* ==========================================================================
   Details / Summary
   ========================================================================== */
details {
  margin: 12px 0;
  border: 1px solid ${theme.borderColor};
  border-radius: 4px;
  padding: 0;
  page-break-inside: avoid;
}

details summary {
  font-weight: 600;
  cursor: pointer;
  padding: 10px 14px;
  background: #f8f9fa;
  border-radius: 4px 4px 0 0;
}

details[open] summary {
  border-bottom: 1px solid ${theme.borderColor};
}

details > *:not(summary) {
  padding: 0 14px;
}

/* ==========================================================================
   Print
   ========================================================================== */
@media print {
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;
}

/** Pre-built styles using the default theme (backward compatibility). */
export const pdfStyles = generatePdfStyles(defaultTheme);
