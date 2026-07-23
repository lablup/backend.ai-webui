import type { Chapter } from './markdown-processor.js';
import { processCatalogMarkdownForPdf } from './markdown-processor.js';
import type { PdfTheme } from './theme.js';
import { resolveHeaderFooter } from './theme.js';
import { getCatalogMarkdown } from './sample-content-markdown.js';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Build a "Theme Reference" chapter that shows all theme variable values
 * and header/footer template source code. This renders using the same
 * PDF styles as production, so you see exactly how it looks in print.
 */
export function buildThemeInfoChapter(theme: PdfTheme): Chapter {
  const { headerHtml, footerHtml } = resolveHeaderFooter(theme, 'Backend.AI WebUI');

  const colorVars = [
    ['brandColor', theme.brandColor],
    ['textPrimary', theme.textPrimary],
    ['textSecondary', theme.textSecondary],
    ['textTertiary', theme.textTertiary],
    ['linkColor', theme.linkColor],
    ['borderColor', theme.borderColor],
    ['codeBackground', theme.codeBackground],
    ['codeBorder', theme.codeBorder],
    ['tableHeaderBg', theme.tableHeaderBg],
    ['tableBorder', theme.tableBorder],
    ['blockquoteBg', theme.blockquoteBg],
    ['blockquoteBorderColor', theme.blockquoteBorderColor],
  ] as const;

  const sizeVars = [
    ['baseFontSize', theme.baseFontSize],
    ['headingH1Size', theme.headingH1Size],
    ['headingH2Size', theme.headingH2Size],
    ['headingH3Size', theme.headingH3Size],
    ['headingH4Size', theme.headingH4Size],
    ['codeFontSize', theme.codeFontSize],
    ['tableFontSize', theme.tableFontSize],
    ['blockquoteFontSize', theme.blockquoteFontSize],
    ['tocHeadingSize', theme.tocHeadingSize],
    ['coverTitleSize', theme.coverTitleSize],
    ['coverSubtitleSize', theme.coverSubtitleSize],
    ['coverLogoWidth', theme.coverLogoWidth],
  ] as const;

  const colorRows = colorVars
    .map(
      ([name, value]) =>
        `<tr><td><code>${name}</code></td><td><span style="display:inline-block;width:14px;height:14px;background:${value};border:1px solid #ccc;border-radius:2px;vertical-align:middle;margin-right:6px;"></span> <code>${value}</code></td></tr>`,
    )
    .join('\n');

  const sizeRows = sizeVars
    .map(([name, value]) => `<tr><td><code>${name}</code></td><td><code>${value}</code></td></tr>`)
    .join('\n');

  return {
    title: 'Theme Reference',
    slug: 'theme-reference',
    headings: [
      { level: 1, text: 'Theme Reference', id: 'theme-reference' },
      { level: 2, text: 'Color Variables', id: 'theme-colors' },
      { level: 2, text: 'Size Variables', id: 'theme-sizes' },
      { level: 2, text: 'Header / Footer Templates', id: 'theme-header-footer' },
    ],
    htmlContent: `
<h1 id="theme-reference">Theme Reference: ${theme.name}</h1>
<p>This section shows all theme variables and their current values. The PDF you are viewing is rendered using these exact settings.</p>

<h2 id="theme-colors">Color Variables</h2>
<table>
  <thead><tr><th>Variable</th><th>Value</th></tr></thead>
  <tbody>${colorRows}</tbody>
</table>

<h2 id="theme-sizes">Size Variables</h2>
<table>
  <thead><tr><th>Variable</th><th>Value</th></tr></thead>
  <tbody>${sizeRows}</tbody>
</table>

<h2 id="theme-header-footer">Header / Footer Templates</h2>
<p>These templates are rendered by Playwright's <code>displayHeaderFooter</code>. Only inline styles work. Available CSS classes: <code>.date</code>, <code>.title</code>, <code>.url</code>, <code>.pageNumber</code>, <code>.totalPages</code>.</p>
<h3>Header Template</h3>
<pre><code>${escapeHtml(headerHtml.trim())}</code></pre>
<h3>Footer Template</h3>
<pre><code>${escapeHtml(footerHtml.trim())}</code></pre>
`,
  };
}

/**
 * Build sample chapters by processing shared markdown through the PDF pipeline.
 * The markdown source is shared with the web preview for consistency.
 */
export async function buildSampleChapters(): Promise<Chapter[]> {
  const markdownEntries = getCatalogMarkdown();
  return processCatalogMarkdownForPdf(markdownEntries);
}

/**
 * Build catalog chapters: theme reference + all sample elements.
 * When rendered through renderPdf, produces a PDF that shows
 * all styling elements exactly as they appear in production.
 */
export async function buildCatalogChapters(theme: PdfTheme): Promise<Chapter[]> {
  const sampleChapters = await buildSampleChapters();
  return [buildThemeInfoChapter(theme), ...sampleChapters];
}
