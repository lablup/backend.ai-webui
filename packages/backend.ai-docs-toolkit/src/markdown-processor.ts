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
import type { ResolvedDocConfig } from './config.js';

/**
 * Read image dimensions from a PNG or JPEG file header.
 */
function getImageDimensions(filePath: string): { width: number; height: number } | null {
  try {
    const buf = Buffer.alloc(32);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buf, 0, 32, 0);
    fs.closeSync(fd);

    // PNG
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }

    // JPEG
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
    // fall through
  }
  return null;
}

const IMAGE_SCALE_FACTOR = 0.5;

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

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function resolveMarkdownPath(
  lang: string,
  configPath: string,
  srcDir: string,
  pathFallbacks: Record<string, string> = {},
): string {
  const primaryPath = path.join(srcDir, lang, configPath);
  if (fs.existsSync(primaryPath)) return primaryPath;

  const fallback = pathFallbacks[configPath];
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
      if (/^(?:https?|file):\/\//.test(imgPath)) return match;

      const resolved = path.resolve(mdDir, imgPath);
      if (fs.existsSync(resolved)) {
        return `![${alt}](${pathToFileURL(resolved).toString()})`;
      }
      const filename = path.basename(imgPath);
      const langImagesPath = path.join(srcDir, lang, 'images', filename);
      if (fs.existsSync(langImagesPath)) {
        return `![${alt}](${pathToFileURL(langImagesPath).toString()})`;
      }
      return match;
    },
  );
}

export function normalizeRstTables(markdown: string): string {
  const lines = markdown.split('\n');
  const result: string[] = [];
  let inRstTable = false;
  let headerInserted = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\+[-=+]+\+$/.test(line.trim())) {
      if (!inRstTable) {
        inRstTable = true;
        headerInserted = false;
      }
      if (/^\+[=+]+\+$/.test(line.trim()) && !headerInserted) {
        const prevLine = result[result.length - 1];
        if (prevLine && prevLine.trim().startsWith('|')) {
          const cols = prevLine.split('|').filter((c) => c.length > 0);
          result.push('|' + cols.map(() => '---').join('|') + '|');
          headerInserted = true;
        }
      }
      continue;
    }

    if (inRstTable && line.trim() === '') {
      inRstTable = false;
      headerInserted = false;
    }

    if (inRstTable && line.trim().startsWith('|')) {
      let cleaned = line.trim();
      if (!cleaned.endsWith('|')) {
        cleaned += '|';
      }
      result.push(cleaned);
    } else {
      result.push(line);
    }
  }

  return result.join('\n');
}

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
      .replace(/\|\s*year\s*\|/g, year)
      .replace(/\|\s*version\s*\|/g, version)
      .replace(/\|\s*version_date\s*\|/g, `${year}.${month}.${day}`)
      .replace(/\|\s*date\s*\|/g, `${year}/${month}/${day}`)
      .replace(/\\\s/g, ' ')
  );
}

export function convertIndentedNotes(markdown: string): string {
  const lines = markdown.split('\n');
  const result: string[] = [];
  let inList = false;
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      result.push(line);
      continue;
    }
    if (inCodeBlock) {
      result.push(line);
      continue;
    }

    if (/^[\s]*[-*+]\s/.test(line) || /^[\s]*\d+\.\s/.test(line)) {
      inList = true;
    } else if (line.trim() === '') {
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

    if (/^ {3}\S/.test(line) && !inList) {
      result.push('> ' + line.trim());
    } else if (/^ {3}\s/.test(line) && !inList && result.length > 0 && result[result.length - 1].startsWith('> ')) {
      result.push('> ' + line.trim());
    } else {
      result.push(line);
    }
  }

  return result.join('\n');
}

function processCrossReferences(
  html: string,
  chapterSlug: string,
): string {
  return html.replace(
    /href="#([^"]*)<([^>]+)>[^"]*"/g,
    (_, _text, anchor) => `href="#${chapterSlug}-${slugify(anchor)}"`,
  );
}

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
  config?: ResolvedDocConfig,
): Promise<Chapter[]> {
  const chapters: Chapter[] = [];
  const pathFallbacks = config?.pathFallbacks ?? {};
  const admonitionTitles = config?.admonitionTitles;
  const figureLabels = config?.figureLabels;

  let chapterIndex = 0;

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

    // Pre-processing pipeline
    markdown = deduplicateH1(markdown);
    markdown = substituteTemplateVars(markdown, version);
    markdown = rewriteImagePaths(markdown, lang, srcDir, mdPath);
    markdown = normalizeRstTables(markdown);
    markdown = convertIndentedNotes(markdown);

    // Extended syntax pre-processing
    markdown = processAdmonitions(markdown, lang, admonitionTitles);
    markdown = processCodeBlockMeta(markdown);

    // Track headings for TOC
    const headings: Heading[] = [];
    let h2Counter = 0;
    let imgCounter = 0;
    const currentChapterNum = chapterIndex;
    const figureLabel = getFigureLabel(lang, figureLabels);
    let h1Title: string | null = null;

    const marked = new Marked();
    const renderer = {
      heading(text: string, level: number, _raw: string): string {
        const plainText = stripHtmlTags(text);
        const id = `${chapterSlug}-${slugify(plainText)}`;

        if (level === 1) {
          if (h1Title === null) {
            h1Title = plainText;
          }
          const numberedPlainText = `${currentChapterNum}. ${plainText}`;
          headings.push({ level, text: numberedPlainText, id });
          return `<h1 id="${id}" class="chapter-h1-hidden">${currentChapterNum}. ${text}</h1>\n`;
        }

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
        const { cleanAlt, sizeHint } = parseImageSizeHint(text || '');

        let styleAttr = '';
        if (sizeHint) {
          if (sizeHint === 'auto') {
            styleAttr = '';
          } else {
            styleAttr = ` style="width:${sizeHint}"`;
          }
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
    htmlContent = processCrossReferences(htmlContent, chapterSlug);

    chapters.push({
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
 */
export async function processCatalogMarkdownForPdf(
  entries: Array<{ title: string; markdown: string }>,
): Promise<Chapter[]> {
  const chapters: Chapter[] = [];

  for (const entry of entries) {
    let markdown = entry.markdown;
    const chapterSlug = slugify(entry.title);

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
