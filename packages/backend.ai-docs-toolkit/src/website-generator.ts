/**
 * Website build orchestrator.
 * Reads markdown files, processes them into multi-page HTML, copies assets,
 * and writes output to the dist directory.
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { parse as parseYaml } from 'yaml';
import { processMarkdownFilesForWeb } from './markdown-processor-web.js';
import { slugify } from './markdown-processor.js';
import { buildWebPage, buildIndexPage } from './website-builder.js';
import type { WebsiteMetadata } from './website-builder.js';
import { generateWebStyles } from './styles-web.js';
import { getDocVersion } from './version.js';
import type { ResolvedDocConfig } from './config.js';

interface BookConfig {
  title: string;
  description: string;
  languages: string[];
  navigation: Record<string, Array<{ title: string; path: string }>>;
}

export interface GenerateWebsiteOptions {
  lang: string;
}

/** Locale format map for date display */
const DATE_LOCALES: Record<string, string> = {
  en: 'en-US',
  ko: 'ko-KR',
  ja: 'ja-JP',
  th: 'th-TH',
};

/**
 * Collect last-modified dates for a list of file paths using git log.
 * Falls back to fs.statSync mtime when git is unavailable.
 */
function collectLastModifiedDates(
  filePaths: string[],
  srcDir: string,
): Map<string, Date> {
  const dates = new Map<string, Date>();

  for (const filePath of filePaths) {
    const fullPath = path.resolve(srcDir, filePath);
    try {
      const gitDate = execFileSync(
        'git',
        ['log', '-1', '--format=%aI', '--', fullPath],
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
      ).trim();
      if (gitDate) {
        dates.set(filePath, new Date(gitDate));
        continue;
      }
    } catch {
      // git not available or file not tracked
    }

    // Fallback: file system mtime
    try {
      const stat = fs.statSync(fullPath);
      dates.set(filePath, stat.mtime);
    } catch {
      // file not found
    }
  }

  return dates;
}

/**
 * Format a date for display in the specified locale.
 */
function formatDate(date: Date, lang: string): string {
  const locale = DATE_LOCALES[lang] ?? 'en-US';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Rewrite server-absolute image paths to page-relative paths.
 * The web markdown processor produces paths like `/images/foo.png`.
 * For static pages at `{lang}/slug.html`, images at `{lang}/images/foo.png`,
 * we need `./images/foo.png`.
 */
function rewriteImagePathsForStaticSite(html: string): string {
  return html.replace(
    /(src|href)="\/([^"]+\.(?:png|jpe?g|gif|svg|webp))"/gi,
    (_match, attr, imgPath) => {
      return `${attr}="./${imgPath}"`;
    },
  );
}

/**
 * Generate a static website from documentation sources.
 */
export async function generateWebsite(
  config: ResolvedDocConfig,
  options?: Partial<GenerateWebsiteOptions>,
): Promise<void> {
  const configPath = path.join(config.srcDir, 'book.config.yaml');
  const bookConfig: BookConfig = parseYaml(
    fs.readFileSync(configPath, 'utf-8'),
  );

  const { display: version } = getDocVersion(
    config.versionSource,
    config.version,
  );
  const title = bookConfig.title;
  const availableLanguages = bookConfig.languages;
  const websiteOutDir = config.website?.outDir ?? 'web';

  const langArg = options?.lang ?? 'all';
  const languages =
    langArg === 'all' ? availableLanguages : [langArg];

  // Validate requested languages
  for (const lang of languages) {
    if (!availableLanguages.includes(lang)) {
      console.error(
        `Language "${lang}" not found in config. Available: ${availableLanguages.join(', ')}`,
      );
      process.exit(1);
    }
  }

  const productName = config.productName;
  console.log(`${productName} Website Generator`);
  console.log(`Title: ${title}`);
  console.log(`Version: ${version}`);
  console.log(`Languages: ${languages.join(', ')}`);
  console.log('');

  // Create shared assets directory and write CSS
  const distBase = path.join(config.distDir, websiteOutDir);
  const assetsDir = path.join(distBase, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });

  // Write a combined CSS for all languages (use 'en' as base, CJK handled per-page via lang attr)
  const cssContent = generateWebStyles();
  fs.writeFileSync(path.join(assetsDir, 'styles.css'), cssContent, 'utf-8');
  console.log(`Written: assets/styles.css`);

  for (const lang of languages) {
    const startTime = Date.now();
    console.log(`[${lang}] Building website...`);

    const navigation = bookConfig.navigation[lang];
    if (!navigation) {
      console.warn(`[${lang}] No navigation found, skipping`);
      continue;
    }

    // Create language output directory
    const langDir = path.join(distBase, lang);
    fs.mkdirSync(langDir, { recursive: true });

    // Process markdown files (multi-page mode)
    console.log(`[${lang}] Processing ${navigation.length} chapters...`);
    const chapters = await processMarkdownFilesForWeb(
      lang,
      navigation,
      config.srcDir,
      version,
      config,
      { multiPage: true },
    );

    const metadata: WebsiteMetadata = { title, version, lang };

    // Collect last-modified dates for all navigation files
    const navFilePaths = navigation.map((nav) => path.join(lang, nav.path));
    const lastModifiedDates = collectLastModifiedDates(navFilePaths, config.srcDir);

    // Generate individual HTML pages
    console.log(`[${lang}] Generating ${chapters.length} pages...`);
    for (let i = 0; i < chapters.length; i++) {
      const navEntry = navigation.find((n) => slugify(n.title) === chapters[i].slug);
      if (!navEntry) {
        console.warn(`[${lang}] No navigation entry found for chapter slug "${chapters[i].slug}"`);
      }
      const navFilePath = navEntry ? path.join(lang, navEntry.path) : undefined;
      const lastDate = navFilePath ? lastModifiedDates.get(navFilePath) : undefined;

      let pageHtml = buildWebPage({
        chapter: chapters[i],
        allChapters: chapters,
        currentIndex: i,
        metadata,
        config,
        navPath: navEntry?.path,
        lastUpdated: lastDate ? formatDate(lastDate, lang) : undefined,
      });

      // Fix image paths for static site
      pageHtml = rewriteImagePathsForStaticSite(pageHtml);

      const outputPath = path.join(langDir, `${chapters[i].slug}.html`);
      fs.writeFileSync(outputPath, pageHtml, 'utf-8');
    }

    // Generate index.html (redirect to first page, or placeholder if no chapters)
    const indexHtml =
      chapters.length === 0
        ? `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8" /><title>${title}</title></head>
<body><h1>${title}</h1><p>No documentation content was generated for this language.</p></body>
</html>`
        : buildIndexPage(chapters, metadata);
    fs.writeFileSync(path.join(langDir, 'index.html'), indexHtml, 'utf-8');

    // Copy images
    const srcImagesDir = path.join(config.srcDir, lang, 'images');
    const destImagesDir = path.join(langDir, 'images');
    if (fs.existsSync(srcImagesDir)) {
      fs.mkdirSync(destImagesDir, { recursive: true });
      const imageFiles = fs.readdirSync(srcImagesDir);
      let imageCount = 0;
      for (const file of imageFiles) {
        const srcPath = path.join(srcImagesDir, file);
        if (fs.statSync(srcPath).isFile()) {
          fs.copyFileSync(srcPath, path.join(destImagesDir, file));
          imageCount++;
        }
      }
      console.log(`[${lang}] Copied ${imageCount} images`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `[${lang}] Done: ${chapters.length} pages generated (${elapsed}s)`,
    );
    console.log('');
  }

  console.log(`Website generated at: ${distBase}`);
}
