/**
 * backend.ai-docs-toolkit
 *
 * A reusable documentation toolkit for generating PDFs and web previews
 * from Markdown content. Supports multilingual documentation, admonitions,
 * code block titles/highlighting, CJK fonts, and configurable theming.
 */

// ── Config ──────────────────────────────────────────────────────
export type {
  DocConfig,
  AgentConfig,
  ToolkitConfig,
  ResolvedDocConfig,
} from './config.js';
export { resolveConfig, loadToolkitConfig } from './config.js';

// ── Theme ───────────────────────────────────────────────────────
export type { PdfTheme } from './theme.js';
export { defaultTheme, loadTheme } from './theme.js';

// ── Markdown Processing ─────────────────────────────────────────
export type { Chapter, Heading } from './markdown-processor.js';
export {
  processMarkdownFiles,
  processCatalogMarkdownForPdf,
  slugify,
  resolveMarkdownPath,
} from './markdown-processor.js';
export type {
  AnchorEntry,
  AnchorRegistry,
  LinkDiagnostic,
} from './markdown-processor-web.js';
export {
  processMarkdownFilesForWeb,
  processCatalogMarkdownForWeb,
} from './markdown-processor-web.js';

// ── Markdown Extensions ─────────────────────────────────────────
export {
  processAdmonitions,
  processCodeBlockMeta,
  parseHighlightLines,
  escapeHtml,
  stripHtmlTags,
  getFigureLabel,
  parseImageSizeHint,
  getAdmonitionTitle,
  ADMONITION_TYPES,
  ADMONITION_ICONS,
  ADMONITION_TITLES,
} from './markdown-extensions.js';
export type { AdmonitionType } from './markdown-extensions.js';

// ── HTML Builders ───────────────────────────────────────────────
export type { DocMetadata } from './html-builder.js';
export { buildFullDocument } from './html-builder.js';
export type { WebDocMetadata } from './html-builder-web.js';
export { buildWebDocument } from './html-builder-web.js';

// ── PDF Rendering ───────────────────────────────────────────────
export type { RenderOptions } from './pdf-renderer.js';
export { renderPdf } from './pdf-renderer.js';

// ── PDF Generation ──────────────────────────────────────────────
export { generatePdf } from './generate-pdf.js';
export type { GeneratePdfOptions } from './generate-pdf.js';

// ── Preview Servers ─────────────────────────────────────────────
export { startPreviewServer } from './preview-server.js';
export type { PreviewServerOptions } from './preview-server.js';
export { startHtmlPreviewServer } from './preview-server-web.js';
export type { HtmlPreviewOptions } from './preview-server-web.js';

// ── Styles ──────────────────────────────────────────────────────
export { generatePdfStyles } from './styles.js';
export { generateWebStyles } from './styles-web.js';

// ── Version ─────────────────────────────────────────────────────
export { getDocVersion } from './version.js';

// ── Sample Content ──────────────────────────────────────────────
export { buildThemeInfoChapter } from './sample-content.js';
export { getCatalogMarkdown } from './sample-content-markdown.js';
