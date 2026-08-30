import type { RepoContext } from '../repo-context.js';
import { loadBookConfig } from './docs-config.js';
import type { MarkdownHeading, ParsedMarkdown } from './markdown.js';
import { parseMarkdown, searchableText, sliceSection } from './markdown.js';
import { slugFromPath } from './slug.js';
import { existsSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** The language the index is built from. Recall never depends on `--lang`. */
export const INDEX_LANG = 'en';

/** Result unit: the deepest heading. h1 is the page container, h5+ is body. */
export const SECTION_LEVELS = [2, 3, 4];

export interface DocsPage {
  /** URL slug, e.g. `admin_menu`. */
  slug: string;
  /** Path relative to the docs `src/<lang>` root. */
  relativePath: string;
  /** Path relative to the repository root. */
  repoPath: string;
  title: string;
  parsed: ParsedMarkdown;
}

export interface DocsSection {
  page: DocsPage;
  heading: MarkdownHeading;
  /** Index into `page.parsed.headings`. */
  index: number;
  body: string;
  /** Lowercased prose of the section, for body-token matching. */
  haystack: string;
}

export function docsSrcDir(context: RepoContext): string {
  return join(context.docsDir, 'src');
}

/** Languages `book.config.yaml` publishes that have a `src/<lang>` tree. */
export function docsLanguages(context: RepoContext): string[] {
  const root = docsSrcDir(context);
  if (!existsSync(root)) return [];
  return loadBookConfig(context)
    .languages.filter((lang) => existsSync(join(root, lang)))
    .sort();
}

/**
 * The markdown files the site publishes for `lang`: the `navigation` entries
 * of `book.config.yaml`, in sidebar order. A file under `src/<lang>` that the
 * navigation does not list has no page on the deployed site.
 */
export function publishedMarkdownFiles(
  context: RepoContext,
  lang: string,
): string[] {
  const root = join(docsSrcDir(context), lang);
  const paths = loadBookConfig(context).navigation[lang] ?? [];
  const seen = new Set<string>();
  return paths
    .filter((path) => {
      if (seen.has(path)) return false;
      seen.add(path);
      return true;
    })
    .map((path) => join(root, path))
    .filter((absolute) => existsSync(absolute));
}

function readPage(
  context: RepoContext,
  lang: string,
  absolutePath: string,
): DocsPage {
  const langRoot = join(docsSrcDir(context), lang);
  const relativePath = relative(langRoot, absolutePath).split(sep).join('/');
  const slug = slugFromPath(relativePath);
  const parsed = parseMarkdown(readFileSync(absolutePath, 'utf8'), slug);
  return {
    slug,
    relativePath,
    repoPath: relative(context.repoRoot, absolutePath).split(sep).join('/'),
    title: parsed.headings.find((heading) => heading.level === 1)?.text ?? slug,
    parsed,
  };
}

/** Parsed live per query — there is no build step and no cached index. */
export function loadDocsPages(context: RepoContext, lang: string): DocsPage[] {
  if (!existsSync(join(docsSrcDir(context), lang))) return [];
  return publishedMarkdownFiles(context, lang).map((file) =>
    readPage(context, lang, file),
  );
}

export function loadDocsSections(pages: DocsPage[]): DocsSection[] {
  const sections: DocsSection[] = [];
  for (const page of pages) {
    page.parsed.headings.forEach((heading, index) => {
      if (!SECTION_LEVELS.includes(heading.level)) return;
      const { body } = sliceSection(page.parsed, index);
      sections.push({
        page,
        heading,
        index,
        body,
        haystack: searchableText(body).toLowerCase(),
      });
    });
  }
  return sections;
}

export interface LocalizedHeading {
  lang: string;
  title: string;
  anchor: string;
  repoPath: string;
  /** True when the target language had no counterpart and `en` was used. */
  fallback: boolean;
}

/** One page in one language, memoised across a single command run. */
export function loadDocsPage(
  context: RepoContext,
  lang: string,
  relativePath: string,
  cache: Map<string, DocsPage | null>,
): DocsPage | null {
  const key = `${lang}/${relativePath}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  const absolute = join(docsSrcDir(context), lang, relativePath);
  const page = existsSync(absolute) ? readPage(context, lang, absolute) : null;
  cache.set(key, page);
  return page;
}

/**
 * The 4 languages share one heading structure, so a hit maps to the target
 * language by heading index. Anchors stay in the target language's own script.
 */
export function localizeHeading(
  context: RepoContext,
  section: DocsSection,
  lang: string,
  cache: Map<string, DocsPage | null>,
): LocalizedHeading {
  const source: LocalizedHeading = {
    lang: INDEX_LANG,
    title: section.heading.text,
    anchor: section.heading.anchor,
    repoPath: section.page.repoPath,
    fallback: lang !== INDEX_LANG,
  };
  if (lang === INDEX_LANG) return { ...source, fallback: false };

  const page = loadDocsPage(context, lang, section.page.relativePath, cache);
  const heading = page?.parsed.headings[section.index];
  const parity =
    page?.parsed.headings.length === section.page.parsed.headings.length;
  if (!page || !heading || !parity || heading.level !== section.heading.level) {
    return source;
  }
  return {
    lang,
    title: heading.text,
    anchor: heading.anchor,
    repoPath: page.repoPath,
    fallback: false,
  };
}
