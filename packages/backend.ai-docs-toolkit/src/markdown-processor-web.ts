/**
 * Markdown processor for web preview with extended syntax support.
 * Supports: admonitions, code block titles, line highlighting, details/summary.
 */

import fs from 'fs';
import path from 'path';
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
  getFigureLabel,
  parseImageSizeHint,
} from './markdown-extensions.js';
import type { ResolvedDocConfig } from './config.js';

export type { Chapter, Heading };

interface NavEntry {
  title: string;
  path: string;
}

// ── Anchor resolution types ────────────────────────────────────

export interface AnchorEntry {
  /** Chapter slug that owns this anchor */
  chapterSlug: string;
  /** Nav path of the source file (e.g., "vfolder/vfolder.md") */
  filePath: string;
  /** Source: heading-derived or explicit <a id> tag */
  source: 'heading' | 'explicit';
  /** The final ID as it appears in the rendered HTML */
  resolvedId: string;
}

export interface AnchorRegistry {
  /** Maps raw anchor ID (as written in markdown) to its entries */
  anchors: Map<string, AnchorEntry[]>;
  /** Set of all resolved IDs for quick "already resolved?" checks */
  resolvedIds: Set<string>;
}

export interface LinkDiagnostic {
  type: 'broken-link' | 'duplicate-anchor' | 'ambiguous-link';
  anchorId: string;
  sourceFile: string;
  message: string;
}

/**
 * Rewrite image paths for web preview.
 * Resolves relative image paths from the md file's directory to absolute URL paths
 * that the preview server can serve.
 */
function rewriteImagePathsForWeb(
  markdown: string,
  mdFilePath: string,
  lang: string,
  srcDir: string,
): string {
  const mdDir = path.dirname(mdFilePath);
  const langDir = path.resolve(srcDir, lang);
  return markdown.replace(
    /!\[([^\]]*)\]\(([^)]+\.(?:png|jpe?g|gif|svg|webp))\)/gi,
    (match, alt, imgPath) => {
      // Skip already-absolute URLs
      if (/^(?:https?|file):\/\//.test(imgPath)) return match;

      // Treat leading-slash paths as already web-absolute
      if (imgPath.startsWith('/')) return match;

      // Resolve relative to the md file's directory
      const resolved = path.resolve(mdDir, imgPath);

      // Ensure the resolved path is within the language directory
      if (!resolved.startsWith(langDir + path.sep)) return match;

      // Make path relative to lang dir and convert to a URL path
      const relToLang = path.relative(langDir, resolved);
      const webPath = '/' + relToLang.split(path.sep).join('/');
      return `![${alt}](${webPath})`;
    },
  );
}

/**
 * Fix legacy malformed cross-reference links where HTML tags leaked into href.
 * This handles a narrow edge case from RST-to-Markdown migration.
 */
function fixMalformedCrossReferences(html: string, chapterSlug: string): string {
  return html.replace(
    /href="#([^"]*)<([^>]+)>[^"]*"/g,
    (_, _text, anchor) => `href="#${chapterSlug}-${slugify(anchor)}"`,
  );
}

// ── Anchor resolution functions ────────────────────────────────

interface RenderedChapter {
  chapter: Chapter;
  filePath: string;
}

/**
 * Build a global anchor registry from rendered chapters.
 * Uses actual heading IDs from the Marked renderer (guarantees ID accuracy)
 * and extracts explicit <a id="..."> anchors from rendered HTML.
 */
function buildAnchorRegistryFromRendered(
  rendered: RenderedChapter[],
): AnchorRegistry {
  const anchors = new Map<string, AnchorEntry[]>();
  const resolvedIds = new Set<string>();

  const addEntry = (rawId: string, entry: AnchorEntry) => {
    const existing = anchors.get(rawId) ?? [];
    existing.push(entry);
    anchors.set(rawId, existing);
    resolvedIds.add(entry.resolvedId);
  };

  for (const { chapter, filePath } of rendered) {
    // Register headings using IDs from the Marked renderer (already accurate)
    for (const heading of chapter.headings) {
      resolvedIds.add(heading.id);

      // Derive the raw slug by stripping the chapter-slug prefix
      const prefix = chapter.slug + '-';
      const rawSlug = heading.id.startsWith(prefix)
        ? heading.id.slice(prefix.length)
        : heading.id;

      addEntry(rawSlug, {
        chapterSlug: chapter.slug,
        filePath,
        source: 'heading',
        resolvedId: heading.id,
      });
    }

    // Extract explicit <a ... id="..."> anchors from rendered HTML
    const explicitRegex = /<a\s+[^>]*?\bid="([^"]+)"[^>]*>/g;
    let match;
    while ((match = explicitRegex.exec(chapter.htmlContent)) !== null) {
      const anchorId = match[1];
      // Skip heading IDs (already registered above)
      if (resolvedIds.has(anchorId)) continue;

      addEntry(anchorId, {
        chapterSlug: chapter.slug,
        filePath,
        source: 'explicit',
        resolvedId: anchorId,
      });
      resolvedIds.add(anchorId);
    }
  }

  return { anchors, resolvedIds };
}

/**
 * Detect duplicate anchors across different chapters and record diagnostics.
 */
function detectDuplicateAnchors(
  registry: AnchorRegistry,
  diagnostics: LinkDiagnostic[],
): void {
  for (const [anchorId, entries] of registry.anchors) {
    const chaptersWithExplicit = [
      ...new Set(
        entries.filter((e) => e.source === 'explicit').map((e) => e.filePath),
      ),
    ];
    if (chaptersWithExplicit.length > 1) {
      diagnostics.push({
        type: 'duplicate-anchor',
        anchorId,
        sourceFile: chaptersWithExplicit.join(', '),
        message: `Duplicate explicit anchor <a id="${anchorId}"> in: ${chaptersWithExplicit.join(', ')}`,
      });
    }
  }
}

/**
 * Rewrite fragment-only links (#anchor) using the global anchor registry.
 *
 * Resolution order for each href="#anchorId":
 * 1. If anchorId is already a resolved ID (e.g., chapter-prefixed heading ID) → skip
 * 2. Look up anchorId in registry
 * 3. Prefer entries in the current chapter (same-page priority)
 * 4. For cross-chapter links:
 *    - single-page mode: rewrite to #resolvedId
 *    - multi-page mode: rewrite to ./targetChapter.html#resolvedId
 */
function rewriteCrossPageLinks(
  html: string,
  currentChapterSlug: string,
  registry: AnchorRegistry,
  diagnostics: LinkDiagnostic[],
  sourceFile: string,
  multiPage: boolean = false,
): string {
  const reportedAnchors = new Set<string>();
  return html.replace(/href="#([^"]+)"/g, (fullMatch, anchorId: string) => {
    // Already a resolved ID (e.g., heading hash-links from the renderer) → skip
    if (registry.resolvedIds.has(anchorId)) {
      return fullMatch;
    }

    const entries = registry.anchors.get(anchorId);
    if (!entries || entries.length === 0) {
      if (!reportedAnchors.has(anchorId)) {
        reportedAnchors.add(anchorId);
        diagnostics.push({
          type: 'broken-link',
          anchorId,
          sourceFile,
          message: `No matching anchor found for #${anchorId}`,
        });
      }
      return fullMatch;
    }

    // Prefer entries in the current chapter (same-page priority)
    const sameChapter = entries.filter(
      (e) => e.chapterSlug === currentChapterSlug,
    );
    if (sameChapter.length > 0) {
      // Explicit anchors keep their raw ID which already works in-page
      const explicit = sameChapter.find((e) => e.source === 'explicit');
      if (explicit) return fullMatch;
      // Heading-only: rewrite to chapter-prefixed resolved ID
      return `href="#${sameChapter[0].resolvedId}"`;
    }

    // Cross-chapter link — resolve target first so diagnostic is accurate
    const targetExplicit = entries.find((e) => e.source === 'explicit');
    const target = targetExplicit ?? entries[0];

    const uniqueChapters = [...new Set(entries.map((e) => e.chapterSlug))];
    if (uniqueChapters.length > 1 && !reportedAnchors.has(anchorId)) {
      reportedAnchors.add(anchorId);
      diagnostics.push({
        type: 'ambiguous-link',
        anchorId,
        sourceFile,
        message: `Ambiguous link #${anchorId} found in chapters: ${uniqueChapters.join(', ')}. Resolved to: ${target.chapterSlug}`,
      });
    }

    if (multiPage) {
      return `href="./${target.chapterSlug}.html#${target.resolvedId}"`;
    }

    // Single-page mode: explicit <a id> tags are all in one page, link works as-is
    if (target.source === 'explicit') {
      return fullMatch;
    }
    return `href="#${target.resolvedId}"`;
  });
}

/**
 * Log anchor resolution diagnostics to the console.
 */
function reportLinkDiagnostics(diagnostics: LinkDiagnostic[]): void {
  const broken = diagnostics.filter((d) => d.type === 'broken-link');
  const duplicates = diagnostics.filter((d) => d.type === 'duplicate-anchor');
  const ambiguous = diagnostics.filter((d) => d.type === 'ambiguous-link');

  if (duplicates.length > 0) {
    console.warn(`\n⚠ Duplicate anchors (${duplicates.length}):`);
    for (const d of duplicates) {
      console.warn(`  ${d.message}`);
    }
  }
  if (broken.length > 0) {
    console.warn(`\n⚠ Broken links (${broken.length}):`);
    for (const d of broken) {
      console.warn(`  [${d.sourceFile}] #${d.anchorId}`);
    }
  }
  if (ambiguous.length > 0) {
    console.log(`\nℹ Ambiguous links (${ambiguous.length}):`);
    for (const d of ambiguous) {
      console.log(`  [${d.sourceFile}] ${d.message}`);
    }
  }
}

/**
 * Build a custom Marked renderer for web preview.
 * Handles headings with anchor links, images with doc-image class,
 * and code blocks with title/line-highlighting support.
 */
function buildWebRenderer(
  chapterSlug: string,
  headings: Heading[],
  options?: { chapterIndex?: number; lang?: string; figureLabels?: Record<string, string> },
) {
  let imgCounter = 0;
  const chapterIndex = options?.chapterIndex ?? 0;
  const figureLabel = getFigureLabel(options?.lang, options?.figureLabels);

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
      const { cleanAlt, sizeHint } = parseImageSizeHint(text || '');

      let styleAttr = '';
      if (sizeHint && sizeHint !== 'auto') {
        styleAttr = ` style="width:${sizeHint}"`;
      }

      if (chapterIndex > 0) {
        imgCounter++;
        const figNum = `${figureLabel} ${chapterIndex}.${imgCounter}`;
        const caption = cleanAlt
          ? `<figcaption>${figNum} &mdash; ${escapeHtml(cleanAlt)}</figcaption>`
          : `<figcaption>${figNum}</figcaption>`;
        return `<figure class="doc-figure"><img src="${href}" alt="${cleanAlt}" class="doc-image"${titleAttr}${styleAttr} />${caption}</figure>\n`;
      }

      return `<img src="${href}" alt="${cleanAlt}" class="doc-image"${titleAttr}${styleAttr} />\n`;
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

export interface WebProcessingOptions {
  /** Enable multi-page link resolution (default: false) */
  multiPage?: boolean;
}

export async function processMarkdownFilesForWeb(
  lang: string,
  navigation: NavEntry[],
  srcDir: string,
  version: string,
  config?: ResolvedDocConfig,
  options?: WebProcessingOptions,
): Promise<Chapter[]> {
  const diagnostics: LinkDiagnostic[] = [];
  let chapterIndex = 0;

  const pathFallbacks = config?.pathFallbacks ?? {};
  const admonitionTitles = config?.admonitionTitles;
  const figureLabels = config?.figureLabels;

  // ── Pass 1: Render all chapters to HTML ──────────────────────
  const rendered: RenderedChapter[] = [];

  for (const nav of navigation) {
    let mdPath: string;
    try {
      mdPath = resolveMarkdownPath(lang, nav.path, srcDir, pathFallbacks);
    } catch {
      console.warn(`Skipping missing file: ${nav.path} (${lang})`);
      continue;
    }

    chapterIndex++;
    let markdown = fs.readFileSync(mdPath, 'utf-8');
    const chapterSlug = slugify(nav.title);

    // Pre-processing pipeline (reused from PDF processor)
    markdown = deduplicateH1(markdown);
    markdown = substituteTemplateVars(markdown, version);
    markdown = rewriteImagePathsForWeb(markdown, mdPath, lang, srcDir);
    markdown = normalizeRstTables(markdown);
    markdown = convertIndentedNotes(markdown);

    // Extended syntax pre-processing
    markdown = processAdmonitions(markdown, lang, admonitionTitles);
    markdown = processCodeBlockMeta(markdown);

    const headings: Heading[] = [];
    const marked = new Marked();
    marked.use({ renderer: buildWebRenderer(chapterSlug, headings, { chapterIndex, lang, figureLabels }) });

    const htmlContent = await marked.parse(markdown);

    rendered.push({
      chapter: { title: nav.title, slug: chapterSlug, htmlContent, headings },
      filePath: nav.path,
    });
  }

  // ── Build anchor registry from rendered HTML (accurate IDs) ──
  const registry = buildAnchorRegistryFromRendered(rendered);
  detectDuplicateAnchors(registry, diagnostics);

  // ── Pass 2: Rewrite cross-page links using the registry ──────
  const multiPage = options?.multiPage ?? false;
  for (const { chapter, filePath } of rendered) {
    chapter.htmlContent = fixMalformedCrossReferences(
      chapter.htmlContent,
      chapter.slug,
    );
    chapter.htmlContent = rewriteCrossPageLinks(
      chapter.htmlContent,
      chapter.slug,
      registry,
      diagnostics,
      filePath,
      multiPage,
    );
  }

  // ── Report diagnostics ───────────────────────────────────────
  if (diagnostics.length > 0) {
    reportLinkDiagnostics(diagnostics);
  }

  return rendered.map((r) => r.chapter);
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
