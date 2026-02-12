import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { Marked } from 'marked';

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '') // remove angle bracket tags like <anchor>
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // keep Unicode letters/numbers for CJK support
    .replace(/\s+/g, '-') // spaces to dashes
    .replace(/-+/g, '-') // collapse dashes
    .replace(/^-|-$/g, ''); // trim dashes
}

function resolveMarkdownPath(
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
    /!\[([^\]]*)\]\(images\/([^)]+)\)/g,
    (_, alt, filename) => {
      // Images are always in src/{lang}/images/
      const absPath = path.join(srcDir, lang, 'images', filename);
      if (fs.existsSync(absPath)) {
        return `![${alt}](${pathToFileURL(absPath).toString()})`;
      }
      // Try relative to the md file's directory
      const relPath = path.join(mdDir, 'images', filename);
      if (fs.existsSync(relPath)) {
        return `![${alt}](${pathToFileURL(relPath).toString()})`;
      }
      // Keep original if not found
      return `![${alt}](images/${filename})`;
    },
  );
}

/**
 * Strip RST grid table borders (+------+------+) and clean up
 * so that marked can parse the pipe rows as markdown tables.
 */
function normalizeRstTables(markdown: string): string {
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
function substituteTemplateVars(
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
function convertIndentedNotes(markdown: string): string {
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
function deduplicateH1(markdown: string): string {
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

    // Pre-processing pipeline
    markdown = deduplicateH1(markdown);
    markdown = substituteTemplateVars(markdown, version);
    markdown = rewriteImagePaths(markdown, lang, srcDir, mdPath);
    markdown = normalizeRstTables(markdown);
    markdown = convertIndentedNotes(markdown);

    // Track headings for TOC
    const headings: Heading[] = [];

    // Configure marked with custom renderer
    // marked@12 uses positional args: heading(text, level, raw), image(href, title, text)
    const marked = new Marked();
    const renderer = {
      heading(text: string, level: number, _raw: string): string {
        // text may contain HTML tags from inline parsing, strip for slug/toc
        const plainText = text.replace(/<[^>]+>/g, '');
        const id = `${chapterSlug}-${slugify(plainText)}`;
        headings.push({ level, text: plainText, id });
        return `<h${level} id="${id}">${text}</h${level}>\n`;
      },
      image(href: string, title: string | null, text: string): string {
        const titleAttr = title ? ` title="${title}"` : '';
        return `<img src="${href}" alt="${text || ''}" class="doc-image"${titleAttr} />\n`;
      },
    };

    marked.use({ renderer });

    let htmlContent = await marked.parse(markdown);

    // Post-processing: fix cross-reference links
    htmlContent = processCrossReferences(htmlContent, chapterSlug);

    chapters.push({
      title: nav.title,
      slug: chapterSlug,
      htmlContent,
      headings,
    });
  }

  return chapters;
}
