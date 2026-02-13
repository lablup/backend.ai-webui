import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Marked } from 'marked';
import {
  processAdmonitions,
  processCodeBlockMeta,
  parseHighlightLines,
  escapeHtml as escapeHtmlExt,
  stripHtmlTags,
  getFigureLabel,
  parseImageSizeHint,
} from './markdown-extensions.js';

/**
 * Read image dimensions from a PNG or JPEG file header.
 * Returns { width, height } or null if unable to read.
 */
function getImageDimensions(filePath: string): { width: number; height: number } | null {
  try {
    const buf = Buffer.alloc(32);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buf, 0, 32, 0);
    fs.closeSync(fd);

    // PNG: bytes 16-20 contain width, 20-24 contain height in IHDR chunk
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }

    // JPEG: scan for SOF marker
    const fullBuf = fs.readFileSync(filePath);
    if (fullBuf[0] === 0xff && fullBuf[1] === 0xd8) {
      let offset = 2;
      while (offset < fullBuf.length - 9) {
        if (fullBuf[offset] !== 0xff) { offset++; continue; }
        const marker = fullBuf[offset + 1];
        if (
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf)
        ) {
          return {
            width: fullBuf.readUInt16BE(offset + 7),
            height: fullBuf.readUInt16BE(offset + 5),
          };
        }
        const segLen = fullBuf.readUInt16BE(offset + 2);
        offset += 2 + segLen;
      }
    }
  } catch {
    // Ignore errors — fall through to return null
  }
  return null;
}

/**
 * Scale factor: treat source images as captured at 2x (retina).
 * A 1920px screenshot will render as 960px in HTML, which is still
 * wider than the ~643px content area, so max-width:100% caps it.
 * But a 400px icon will render as 200px — no longer filling the width.
 */
const IMAGE_SCALE_FACTOR = 0.5;

/**
 * Resolve a file:// URL or src path back to a local filesystem path.
 * Returns null if not a local file or path doesn't exist.
 */
function resolveImageFilePath(src: string): string | null {
  try {
    if (src.startsWith('file://')) {
      return fileURLToPath(src);
    }
  } catch {
    // Ignore
  }
  return null;
}

export interface Heading {
  level: number;
  text: string;
  id: string;
}

export interface Chapter {
  title: string;
  slug: string;
  htmlContent: string;
  headings: Heading[];
}

interface NavEntry {
  title: string;
  path: string;
}

/**
 * Fallback mapping for non-ASCII paths in book.config.yaml
 * that don't match actual filesystem directory names.
 */
const PATH_FALLBACKS: Record<string, string> = {
  // Korean
  '일반.md': 'user_settings/user_settings.md',
  '어드민_menu/어드민_menu.md': 'admin_menu/admin_menu.md',
  // Japanese
  'ユーザー_settings/ユーザー_settings.md': 'user_settings/user_settings.md',
  '管理者_menu/管理者_menu.md': 'admin_menu/admin_menu.md',
  // Thai
  'ผู้ใช้_settings/ผู้ใช้_settings.md': 'user_settings/user_settings.md',
  'ผู้ดูแลระบบ_menu/ผู้ดูแลระบบ_menu.md': 'admin_menu/admin_menu.md',
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '') // remove angle bracket tags like <anchor>
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // keep Unicode letters/numbers for CJK support
    .replace(/\s+/g, '-') // spaces to dashes
    .replace(/-+/g, '-') // collapse dashes
    .replace(/^-|-$/g, ''); // trim dashes
}

export function resolveMarkdownPath(
  lang: string,
  configPath: string,
  srcDir: string,
): string {
  const primaryPath = path.join(srcDir, lang, configPath);
  if (fs.existsSync(primaryPath)) return primaryPath;

  const fallback = PATH_FALLBACKS[configPath];
  if (fallback) {
    const fallbackPath = path.join(srcDir, lang, fallback);
    if (fs.existsSync(fallbackPath)) return fallbackPath;
  }

  throw new Error(
    `Markdown file not found: ${configPath} (lang: ${lang}). ` +
      `Tried: ${primaryPath}` +
      (fallback ? ` and ${path.join(srcDir, lang, fallback)}` : ''),
  );
}

function rewriteImagePaths(
  markdown: string,
  lang: string,
  srcDir: string,
  mdFilePath: string,
): string {
  const mdDir = path.dirname(mdFilePath);
  return markdown.replace(
    /!\[([^\]]*)\]\(([^)]+\.(?:png|jpe?g|gif|svg|webp))\)/gi,
    (match, alt, imgPath) => {
      // Skip already-absolute URLs (http://, https://, file://)
      if (/^(?:https?|file):\/\//.test(imgPath)) return match;

      // Resolve relative to the md file's directory
      const resolved = path.resolve(mdDir, imgPath);
      if (fs.existsSync(resolved)) {
        return `![${alt}](${pathToFileURL(resolved).toString()})`;
      }
      // Fallback: try src/{lang}/images/ with just the filename
      const filename = path.basename(imgPath);
      const langImagesPath = path.join(srcDir, lang, 'images', filename);
      if (fs.existsSync(langImagesPath)) {
        return `![${alt}](${pathToFileURL(langImagesPath).toString()})`;
      }
      // Keep original if not found
      return match;
    },
  );
}

/**
 * Strip RST grid table borders (+------+------+) and clean up
 * so that marked can parse the pipe rows as markdown tables.
 */
export function normalizeRstTables(markdown: string): string {
  const lines = markdown.split('\n');
  const result: string[] = [];
  let inRstTable = false;
  let headerInserted = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Detect RST table border: +----+----+ or +=====+=====+
    if (/^\+[-=+]+\+$/.test(line.trim())) {
      if (!inRstTable) {
        inRstTable = true;
        headerInserted = false;
      }
      // Check if this is a header separator (uses = instead of -)
      if (/^\+[=+]+\+$/.test(line.trim()) && !headerInserted) {
        // Insert a markdown header separator after the first pipe row
        const prevLine = result[result.length - 1];
        if (prevLine && prevLine.trim().startsWith('|')) {
          const cols = prevLine.split('|').filter((c) => c.length > 0);
          result.push('|' + cols.map((c) => '---').join('|') + '|');
          headerInserted = true;
        }
      }
      // Skip the border line itself
      continue;
    }

    if (inRstTable && line.trim() === '') {
      inRstTable = false;
      headerInserted = false;
    }

    // For RST table pipe rows, ensure they end with |
    if (inRstTable && line.trim().startsWith('|')) {
      let cleaned = line.trim();
      if (!cleaned.endsWith('|')) {
        cleaned += '|';
      }
      result.push(cleaned);

      // If this is the first row and we haven't inserted a header separator yet
      if (!headerInserted) {
        // Header separator will be inserted when we encounter the border line
      }
    } else {
      result.push(line);
    }
  }

  return result.join('\n');
}

/**
 * Replace Sphinx template variables used in disclaimer.md
 */
export function substituteTemplateVars(
  markdown: string,
  version: string,
): string {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return (
    markdown
      // |year|, |version|, |version_date|, |date| — with optional spaces
      .replace(/\|\s*year\s*\|/g, year)
      .replace(/\|\s*version\s*\|/g, version)
      .replace(/\|\s*version_date\s*\|/g, `${year}.${month}.${day}`)
      .replace(/\|\s*date\s*\|/g, `${year}/${month}/${day}`)
      // Remove RST-style escape sequences (\ followed by space)
      .replace(/\\\s/g, ' ')
  );
}

/**
 * Convert 3-space indented note blocks into markdown blockquotes.
 * Must distinguish from list continuations and code blocks.
 */
export function convertIndentedNotes(markdown: string): string {
  const lines = markdown.split('\n');
  const result: string[] = [];
  let inList = false;
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track fenced code blocks
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      result.push(line);
      continue;
    }
    if (inCodeBlock) {
      result.push(line);
      continue;
    }

    // Track list context
    if (/^[\s]*[-*+]\s/.test(line) || /^[\s]*\d+\.\s/.test(line)) {
      inList = true;
    } else if (line.trim() === '') {
      // Blank line may end list context (check next line)
      const nextLine = lines[i + 1];
      if (
        nextLine &&
        !/^[\s]*[-*+]\s/.test(nextLine) &&
        !/^[\s]*\d+\.\s/.test(nextLine) &&
        !/^\s{3,}/.test(nextLine)
      ) {
        inList = false;
      }
    }

    // Check for 3-space indented text that's NOT in a list context
    if (/^ {3}\S/.test(line) && !inList) {
      result.push('> ' + line.trim());
    } else if (/^ {3}\s/.test(line) && !inList && result.length > 0 && result[result.length - 1].startsWith('> ')) {
      // Continuation of a note block
      result.push('> ' + line.trim());
    } else {
      result.push(line);
    }
  }

  return result.join('\n');
}

/**
 * Process cross-reference links: [text <anchor>](#text <anchor>) → #chapterSlug-slugified-id
 * The heading IDs are prefixed with chapterSlug, so cross-references must match.
 */
function processCrossReferences(
  html: string,
  chapterSlug: string,
): string {
  // Match href="#text <anchor>" patterns
  return html.replace(
    /href="#([^"]*)<([^>]+)>[^"]*"/g,
    (_, _text, anchor) => `href="#${chapterSlug}-${slugify(anchor)}"`,
  );
}

/**
 * Remove duplicate H1 headings if a chapter has multiple H1s.
 * Keep only the first one.
 */
export function deduplicateH1(markdown: string): string {
  let foundFirst = false;
  const lines = markdown.split('\n');
  const result: string[] = [];

  for (const line of lines) {
    if (/^# /.test(line)) {
      if (!foundFirst) {
        foundFirst = true;
        result.push(line);
      }
      // Skip subsequent H1s
    } else {
      result.push(line);
    }
  }

  return result.join('\n');
}

export async function processMarkdownFiles(
  lang: string,
  navigation: NavEntry[],
  srcDir: string,
  version: string,
): Promise<Chapter[]> {
  const chapters: Chapter[] = [];

  let chapterIndex = 0;

  for (const nav of navigation) {
    let mdPath: string;
    try {
      mdPath = resolveMarkdownPath(lang, nav.path, srcDir);
    } catch {
      console.warn(`Skipping missing file: ${nav.path} (${lang})`);
      continue;
    }

    chapterIndex++;
    let markdown = fs.readFileSync(mdPath, 'utf-8');
    const chapterSlug = slugify(nav.title);

    // Pre-processing pipeline
    markdown = deduplicateH1(markdown);
    markdown = substituteTemplateVars(markdown, version);
    markdown = rewriteImagePaths(markdown, lang, srcDir, mdPath);
    markdown = normalizeRstTables(markdown);
    markdown = convertIndentedNotes(markdown);

    // Extended syntax pre-processing
    markdown = processAdmonitions(markdown, lang);
    markdown = processCodeBlockMeta(markdown);

    // Track headings for TOC
    const headings: Heading[] = [];
    let h2Counter = 0;
    let imgCounter = 0;
    const currentChapterNum = chapterIndex;
    const figureLabel = getFigureLabel(lang);
    // Capture H1 text to use as chapter.title (localized title)
    let h1Title: string | null = null;

    // Configure marked with custom renderer
    // marked@12 uses positional args: heading(text, level, raw), image(href, title, text)
    const marked = new Marked();
    const renderer = {
      heading(text: string, level: number, _raw: string): string {
        // text may contain HTML tags from inline parsing, strip for slug/toc
        const plainText = stripHtmlTags(text);
        const id = `${chapterSlug}-${slugify(plainText)}`;

        if (level === 1) {
          // Capture the first H1 text as chapter title
          if (h1Title === null) {
            h1Title = plainText;
          }
          // H1 is visually hidden since it's already shown on the chapter title page.
          // The h1 tag is kept for PDF named destinations and footer section labels.
          const numberedPlainText = `${currentChapterNum}. ${plainText}`;
          headings.push({ level, text: numberedPlainText, id });
          return `<h1 id="${id}" class="chapter-h1-hidden">${currentChapterNum}. ${text}</h1>\n`;
        }

        // Add numbering: H2 gets chapter.section number
        let numberedText = text;
        let numberedPlainText = plainText;
        if (level === 2) {
          h2Counter++;
          numberedText = `${currentChapterNum}.${h2Counter} ${text}`;
          numberedPlainText = `${currentChapterNum}.${h2Counter} ${plainText}`;
        }

        headings.push({ level, text: numberedPlainText, id });
        return `<h${level} id="${id}">${numberedText}</h${level}>\n`;
      },
      image(href: string, title: string | null, text: string): string {
        const titleAttr = title ? ` title="${title}"` : '';
        // Parse size hint from alt text (e.g. "alt =40%", "alt =300px")
        const { cleanAlt, sizeHint } = parseImageSizeHint(text || '');

        let styleAttr = '';
        if (sizeHint) {
          // Explicit size hint overrides auto-scaling
          if (sizeHint === 'auto') {
            styleAttr = ''; // Use natural CSS sizing
          } else {
            styleAttr = ` style="width:${sizeHint}"`;
          }
        } else {
          // Default: read image dimensions and scale down for print
          const localPath = resolveImageFilePath(href);
          if (localPath) {
            const dims = getImageDimensions(localPath);
            if (dims) {
              const scaledWidth = Math.round(dims.width * IMAGE_SCALE_FACTOR);
              styleAttr = ` style="width:${scaledWidth}px"`;
            }
          }
        }

        imgCounter++;
        const figNum = `${figureLabel} ${currentChapterNum}.${imgCounter}`;
        const caption = cleanAlt
          ? `<figcaption>${figNum} &mdash; ${escapeHtmlExt(cleanAlt)}</figcaption>`
          : `<figcaption>${figNum}</figcaption>`;

        return `<figure class="doc-figure"><img src="${href}" alt="${cleanAlt}" class="doc-image"${titleAttr}${styleAttr} />${caption}</figure>\n`;
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
              return `<span class="${cls}">${escapeHtmlExt(line)}</span>`;
            })
            .join('\n');
        } else {
          codeHtml = escapeHtmlExt(code);
        }

        const langClass = lang ? ` class="language-${lang}"` : '';
        const preBlock = `<pre><code${langClass}>${codeHtml}</code></pre>`;

        if (title) {
          return `<div class="code-block-wrapper"><div class="code-block-title">${escapeHtmlExt(title)}</div>${preBlock}</div>\n`;
        }

        return preBlock + '\n';
      },
    };

    marked.use({ renderer });

    let htmlContent = await marked.parse(markdown);

    // Post-processing: fix cross-reference links
    htmlContent = processCrossReferences(htmlContent, chapterSlug);

    chapters.push({
      // Use H1 text as chapter title (localized), fall back to nav.title
      title: h1Title || nav.title,
      slug: chapterSlug,
      htmlContent,
      headings,
    });
  }

  return chapters;
}

/**
 * Process in-memory catalog markdown entries for PDF output.
 * Applies admonition/code-meta preprocessing, then renders through
 * the same Marked pipeline used for file-based markdown.
 */
export async function processCatalogMarkdownForPdf(
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
    const renderer = {
      heading(text: string, level: number, _raw: string): string {
        const plainText = stripHtmlTags(text);
        const id = `${chapterSlug}-${slugify(plainText)}`;
        headings.push({ level, text: plainText, id });
        return `<h${level} id="${id}">${text}</h${level}>\n`;
      },
      image(href: string, title: string | null, text: string): string {
        const titleAttr = title ? ` title="${title}"` : '';
        const { cleanAlt, sizeHint } = parseImageSizeHint(text || '');

        let styleAttr = '';
        if (sizeHint && sizeHint !== 'auto') {
          styleAttr = ` style="width:${sizeHint}"`;
        } else {
          const localPath = resolveImageFilePath(href);
          if (localPath) {
            const dims = getImageDimensions(localPath);
            if (dims) {
              const scaledWidth = Math.round(dims.width * IMAGE_SCALE_FACTOR);
              styleAttr = ` style="width:${scaledWidth}px"`;
            }
          }
        }
        return `<div class="doc-image-wrap"><img src="${href}" alt="${cleanAlt}" class="doc-image"${titleAttr}${styleAttr} /></div>\n`;
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
              return `<span class="${cls}">${escapeHtmlExt(line)}</span>`;
            })
            .join('\n');
        } else {
          codeHtml = escapeHtmlExt(code);
        }

        const langClass = lang ? ` class="language-${lang}"` : '';
        const preBlock = `<pre><code${langClass}>${codeHtml}</code></pre>`;

        if (title) {
          return `<div class="code-block-wrapper"><div class="code-block-title">${escapeHtmlExt(title)}</div>${preBlock}</div>\n`;
        }

        return preBlock + '\n';
      },
    };

    marked.use({ renderer });

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
