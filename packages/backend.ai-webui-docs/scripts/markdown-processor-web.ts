/**
 * Markdown processor for web preview with extended syntax support.
 * Supports: admonitions, code block titles, line highlighting, details/summary.
 */

import fs from 'fs';
import { Marked } from 'marked';
import {
  slugify,
  deduplicateH1,
  substituteTemplateVars,
  normalizeRstTables,
  convertIndentedNotes,
  resolveMarkdownPath,
} from './markdown-processor.js';
import type { Chapter, Heading } from './markdown-processor.js';
import {
  processAdmonitions,
  processCodeBlockMeta,
  parseHighlightLines,
  escapeHtml,
  stripHtmlTags,
} from './markdown-extensions.js';

export type { Chapter, Heading };

interface NavEntry {
  title: string;
  path: string;
}

/**
 * Rewrite image paths for web preview.
 * Converts relative `images/` paths to `/images/{filename}` URLs served by the preview server.
 */
function rewriteImagePathsForWeb(markdown: string): string {
  return markdown.replace(
    /!\[([^\]]*)\]\(images\/([^)]+)\)/g,
    (_, alt, filename) => `![${alt}](/images/${filename})`,
  );
}

/**
 * Process cross-reference links for web preview.
 */
function processCrossReferencesWeb(html: string, chapterSlug: string): string {
  return html.replace(
    /href="#([^"]*)<([^>]+)>[^"]*"/g,
    (_, _text, anchor) => `href="#${chapterSlug}-${slugify(anchor)}"`,
  );
}

/**
 * Build a custom Marked renderer for web preview.
 * Handles headings with anchor links, images with doc-image class,
 * and code blocks with title/line-highlighting support.
 */
function buildWebRenderer(chapterSlug: string, headings: Heading[]) {
  return {
    heading(text: string, level: number, _raw: string): string {
      const plainText = stripHtmlTags(text);
      const id = `${chapterSlug}-${slugify(plainText)}`;
      headings.push({ level, text: plainText, id });
      const escapedPlainText = escapeHtml(plainText);
      return `<h${level} id="${id}">${text}<a class="hash-link" href="#${id}" aria-label="Direct link to ${escapedPlainText}">#</a></h${level}>\n`;
    },
    image(href: string, title: string | null, text: string): string {
      const titleAttr = title ? ` title="${title}"` : '';
      return `<img src="${href}" alt="${text || ''}" class="doc-image"${titleAttr} />\n`;
    },
    code(code: string, infostring: string | undefined): string {
      const info = infostring || '';
      const langMatch = info.match(/^(\w+)/);
      const titleMatch = info.match(/data-title="([^"]*)"/);
      const highlightMatch = info.match(/data-highlight="([^"]*)"/);

      const lang = langMatch?.[1] || '';
      const title = titleMatch?.[1] || '';
      const highlightSpec = highlightMatch?.[1] || '';
      const highlightLines = parseHighlightLines(highlightSpec);

      let codeHtml: string;
      if (highlightLines.size > 0) {
        const lines = code.split('\n');
        codeHtml = lines
          .map((line, idx) => {
            const lineNum = idx + 1;
            const cls = highlightLines.has(lineNum)
              ? 'code-line highlighted'
              : 'code-line';
            return `<span class="${cls}">${escapeHtml(line)}</span>`;
          })
          .join('\n');
      } else {
        codeHtml = escapeHtml(code);
      }

      const langClass = lang ? ` class="language-${lang}"` : '';
      const preBlock = `<pre><code${langClass}>${codeHtml}</code></pre>`;

      if (title) {
        return `<div class="code-block-wrapper"><div class="code-block-title">${escapeHtml(title)}</div>${preBlock}</div>\n`;
      }

      return preBlock + '\n';
    },
  };
}

export async function processMarkdownFilesForWeb(
  lang: string,
  navigation: NavEntry[],
  srcDir: string,
  version: string,
): Promise<Chapter[]> {
  const chapters: Chapter[] = [];

  for (const nav of navigation) {
    let mdPath: string;
    try {
      mdPath = resolveMarkdownPath(lang, nav.path, srcDir);
    } catch {
      console.warn(`Skipping missing file: ${nav.path} (${lang})`);
      continue;
    }

    let markdown = fs.readFileSync(mdPath, 'utf-8');
    const chapterSlug = slugify(nav.title);

    // Pre-processing pipeline (reused from PDF processor)
    markdown = deduplicateH1(markdown);
    markdown = substituteTemplateVars(markdown, version);
    markdown = rewriteImagePathsForWeb(markdown);
    markdown = normalizeRstTables(markdown);
    markdown = convertIndentedNotes(markdown);

    // Extended syntax pre-processing
    markdown = processAdmonitions(markdown);
    markdown = processCodeBlockMeta(markdown);

    const headings: Heading[] = [];
    const marked = new Marked();
    marked.use({ renderer: buildWebRenderer(chapterSlug, headings) });

    let htmlContent = await marked.parse(markdown);
    htmlContent = processCrossReferencesWeb(htmlContent, chapterSlug);

    chapters.push({
      title: nav.title,
      slug: chapterSlug,
      htmlContent,
      headings,
    });
  }

  return chapters;
}

/**
 * Process in-memory catalog markdown entries (not from files).
 * Used for the style catalog mode to render sample markdown through the full pipeline.
 */
export async function processCatalogMarkdownForWeb(
  entries: Array<{ title: string; markdown: string }>,
): Promise<Chapter[]> {
  const chapters: Chapter[] = [];

  for (const entry of entries) {
    let markdown = entry.markdown;
    const chapterSlug = slugify(entry.title);

    // Extended syntax pre-processing
    markdown = processAdmonitions(markdown);
    markdown = processCodeBlockMeta(markdown);

    const headings: Heading[] = [];
    const marked = new Marked();
    marked.use({ renderer: buildWebRenderer(chapterSlug, headings) });

    const htmlContent = await marked.parse(markdown);

    chapters.push({
      title: entry.title,
      slug: chapterSlug,
      htmlContent,
      headings,
    });
  }

  return chapters;
}
