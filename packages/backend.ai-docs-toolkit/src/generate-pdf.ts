import fs from 'fs';
import path from 'path';
import { parse as parseYaml } from 'yaml';
import { processMarkdownFiles } from './markdown-processor.js';
import { buildFullDocument } from './html-builder.js';
import { renderPdf } from './pdf-renderer.js';
import { loadTheme } from './theme.js';
import { getDocVersion } from './version.js';
import type { ResolvedDocConfig } from './config.js';

interface BookConfig {
  title: string;
  description: string;
  languages: string[];
  navigation: Record<string, Array<{ title: string; path: string }>>;
}

export interface GeneratePdfOptions {
  lang: string;
  theme: string;
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

  const configPath = path.join(config.srcDir, 'book.config.yaml');
  const bookConfig: BookConfig = parseYaml(
    fs.readFileSync(configPath, 'utf-8'),
  );

  const theme = loadTheme(args.theme ?? 'default');
  const { display: version, filename: versionForFilename } = getDocVersion(
    config.versionSource,
    config.version,
  );
  const title = bookConfig.title;
  const availableLanguages = bookConfig.languages;

  const langArg = args.lang ?? 'all';
  const languages =
    langArg === 'all' ? availableLanguages : [langArg];

  // Validate requested language
  for (const lang of languages) {
    if (!availableLanguages.includes(lang)) {
      console.error(
        `Language "${lang}" not found in config. Available: ${availableLanguages.join(', ')}`,
      );
      process.exit(1);
    }
  }

  const productName = config.productName;
  console.log(`${productName} PDF Generator`);
  console.log(`Title: ${title}`);
  console.log(`Version: ${version}`);
  console.log(`Theme: ${theme.name}`);
  console.log(`Languages: ${languages.join(', ')}`);
  console.log('');

  for (const lang of languages) {
    const startTime = Date.now();
    console.log(`[${lang}] Generating PDF...`);

    const navigation = bookConfig.navigation[lang];
    if (!navigation) {
      console.warn(`[${lang}] No navigation found, skipping`);
      continue;
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
      { title, version, lang },
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
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const fileSize = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(1);
    console.log(
      `[${lang}] Done: ${outputPath} (${fileSize} MB, ${elapsed}s)`,
    );
    console.log('');
  }

  console.log('PDF generation complete!');
}
