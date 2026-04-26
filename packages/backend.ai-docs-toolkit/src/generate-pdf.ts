import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { processMarkdownFiles } from './markdown-processor.js';
import { buildFullDocument } from './html-builder.js';
import { renderPdf } from './pdf-renderer.js';
import { loadTheme } from './theme.js';
import { getDocVersion } from './version.js';
import { loadBookConfig } from './book-config.js';
import type { ResolvedDocConfig } from './config.js';

export interface GeneratePdfOptions {
  lang: string;
  theme: string;
  chapters?: string[];
  note?: string;
  /**
   * Maximum number of languages to render concurrently.
   * Defaults to 2 (safe for GitHub-hosted ubuntu runners with 2 vCPU).
   * Override via the `BAI_DOCS_PDF_CONCURRENCY` env var.
   */
  concurrency?: number;
}

function parseArgs(argv: string[]): GeneratePdfOptions {
  let lang = 'all';
  let theme = 'default';
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--lang' && argv[i + 1]) {
      lang = argv[i + 1];
      i++;
    }
    if (argv[i] === '--theme' && argv[i + 1]) {
      theme = argv[i + 1];
      i++;
    }
  }
  return { lang, theme };
}

/**
 * Generate a PDF filename from the template.
 * Supports {title}, {version}, {lang} placeholders.
 */
function formatPdfFilename(
  template: string,
  vars: { title: string; version: string; lang: string },
): string {
  return template
    .replace(/\{title\}/g, vars.title.replace(/\s+/g, '_'))
    .replace(/\{version\}/g, vars.version)
    .replace(/\{lang\}/g, vars.lang);
}

export async function generatePdf(
  config: ResolvedDocConfig,
  options?: Partial<GeneratePdfOptions>,
): Promise<void> {
  const args = options ?? parseArgs(process.argv.slice(2));

  // Single-line `title` is used for `<title>`, console output, filename
  // templates. The PDF cover renderer reads `titleMultiline` so the visual
  // line breaks the author intended (`title: |` block scalar) survive on
  // the cover page.
  const bookConfig = loadBookConfig(config.srcDir);

  const theme = loadTheme(args.theme ?? 'default');
  const { display: version, filename: versionForFilename } = getDocVersion(
    config.versionSource,
    config.version,
  );
  const title = bookConfig.title;
  const titleMultiline = bookConfig.titleMultiline;
  const availableLanguages = bookConfig.languages;

  const langArg = args.lang ?? 'all';
  const languages = langArg === 'all' ? availableLanguages : [langArg];

  // Validate requested language
  for (const lang of languages) {
    if (!availableLanguages.includes(lang)) {
      console.error(
        `Language "${lang}" not found in config. Available: ${availableLanguages.join(', ')}`,
      );
      process.exit(1);
    }
  }

  const envConcurrency = Number.parseInt(
    process.env.BAI_DOCS_PDF_CONCURRENCY ?? '',
    10,
  );
  const optionConcurrency = Number.isFinite(args.concurrency)
    ? args.concurrency
    : undefined;
  const concurrency = Math.max(
    1,
    optionConcurrency ?? (Number.isFinite(envConcurrency) ? envConcurrency : 2),
  );

  const productName = config.productName;
  console.log(`${productName} PDF Generator`);
  console.log(`Title: ${title}`);
  console.log(`Version: ${version}`);
  console.log(`Theme: ${theme.name}`);
  console.log(`Languages: ${languages.join(', ')}`);
  console.log(`Concurrency: ${concurrency}`);
  console.log('');

  // Launch a single Chromium instance shared across all language renders.
  // Each renderPdf call opens its own page on this browser, which avoids
  // paying the launch cost (~1–2s) per language.
  const sharedBrowser = await chromium.launch();

  const renderOne = async (lang: string): Promise<void> => {
    const startTime = Date.now();
    console.log(`[${lang}] Generating PDF...`);

    let navigation = bookConfig.navigation[lang];
    if (!navigation) {
      console.warn(`[${lang}] No navigation found, skipping`);
      return;
    }

    // Filter chapters if --chapters option is specified
    const chapterFilter = args.chapters?.filter((c) => c.length > 0);
    if (chapterFilter && chapterFilter.length > 0) {
      const filterSet = new Set(chapterFilter);
      const filtered = navigation.filter((nav) => {
        const noExt = nav.path.replace(/\.md$/, '');
        const segments = noExt.split('/');
        const pathStem = segments[segments.length - 1];
        const dirName = segments.length > 1 ? segments[segments.length - 2] : '';
        return (
          filterSet.has(nav.path) ||
          filterSet.has(pathStem) ||
          (dirName !== '' && filterSet.has(dirName))
        );
      });
      if (filtered.length === 0) {
        const available = navigation
          .map((n) => n.path.replace(/\.md$/, '').split('/').pop())
          .join(', ');
        console.error(
          `[${lang}] No chapters matched filter: ${chapterFilter.join(', ')}`,
        );
        console.error(
          `[${lang}] Chapter identifiers can be a full path (e.g. overview/overview.md), directory name, or filename.`,
        );
        console.error(`[${lang}] Available chapters: ${available}`);
        throw new Error(`No chapters matched filter for "${lang}"`);
      }
      navigation = filtered;
      console.log(
        `[${lang}] Filtered to ${navigation.length} chapter(s): ${navigation.map((n) => n.title).join(', ')}`,
      );
    }

    // Process markdown files
    console.log(`[${lang}] Processing ${navigation.length} chapters...`);
    const chapters = await processMarkdownFiles(
      lang,
      navigation,
      config.srcDir,
      version,
      config,
    );

    // Build single unified HTML document
    console.log(`[${lang}] Building HTML...`);
    const html = buildFullDocument(
      chapters,
      { title, titleMultiline, version, lang, note: args.note },
      config,
      theme,
    );

    // Render PDF
    const pdfFilename = formatPdfFilename(config.pdfFilenameTemplate, {
      title,
      version: versionForFilename,
      lang,
    });
    const outputPath = path.join(config.distDir, pdfFilename);

    console.log(`[${lang}] Rendering PDF...`);
    await renderPdf({
      html,
      outputPath,
      title,
      version,
      lang,
      theme,
      config,
      browser: sharedBrowser,
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const fileSize = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(1);
    console.log(
      `[${lang}] Done: ${outputPath} (${fileSize} MB, ${elapsed}s)`,
    );
    console.log('');
  };

  // Track per-language outcome so a single language failure (e.g. missing
  // CJK font on a runner) does not kill renders that have already started
  // or are still queued. The script exits non-zero only if *every*
  // requested language failed.
  const failures: Array<{ lang: string; error: Error }> = [];

  try {
    // Concurrency-limited fan-out: process up to `concurrency` languages at
    // a time. Each worker pulls the next language from a shared cursor.
    const queue = [...languages];
    const workers: Promise<void>[] = [];
    const workerCount = Math.min(concurrency, queue.length);
    for (let i = 0; i < workerCount; i++) {
      workers.push(
        (async () => {
          while (queue.length > 0) {
            const lang = queue.shift();
            if (!lang) break;
            try {
              await renderOne(lang);
            } catch (err) {
              const error = err instanceof Error ? err : new Error(String(err));
              console.error(`[${lang}] FAILED: ${error.message}`);
              failures.push({ lang, error });
            }
          }
        })(),
      );
    }
    await Promise.all(workers);
  } finally {
    await sharedBrowser.close();
  }

  if (failures.length > 0) {
    console.log('');
    console.log(`PDF generation finished with ${failures.length}/${languages.length} failures:`);
    for (const { lang, error } of failures) {
      console.log(`  - [${lang}] ${error.message}`);
    }
    if (failures.length === languages.length) {
      throw new Error('All requested languages failed to build');
    }
    console.log(
      `Continuing because ${languages.length - failures.length} language(s) succeeded.`,
    );
  } else {
    console.log('PDF generation complete!');
  }
}
