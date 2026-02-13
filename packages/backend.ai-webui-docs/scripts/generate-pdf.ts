import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';
import { processMarkdownFiles } from './markdown-processor.js';
import { buildFullDocument } from './html-builder.js';
import { renderPdf } from './pdf-renderer.js';
import { loadTheme } from './theme.js';
import { getDocVersion } from './version.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(DOCS_ROOT, 'src');
const CONFIG_PATH = path.join(SRC_DIR, 'book.config.yaml');

interface BookConfig {
  title: string;
  description: string;
  languages: string[];
  navigation: Record<string, Array<{ title: string; path: string }>>;
}

function parseArgs(argv: string[]): { lang: string; theme: string } {
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

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const config: BookConfig = parseYaml(
    fs.readFileSync(CONFIG_PATH, 'utf-8'),
  );

  const theme = loadTheme(args.theme);
  const { display: version, filename: versionForFilename } = getDocVersion();
  const title = config.title;
  const availableLanguages = config.languages;

  const languages =
    args.lang === 'all' ? availableLanguages : [args.lang];

  // Validate requested language
  for (const lang of languages) {
    if (!availableLanguages.includes(lang)) {
      console.error(
        `Language "${lang}" not found in config. Available: ${availableLanguages.join(', ')}`,
      );
      process.exit(1);
    }
  }

  console.log(`Backend.AI WebUI Docs PDF Generator`);
  console.log(`Title: ${title}`);
  console.log(`Version: ${version}`);
  console.log(`Theme: ${theme.name}`);
  console.log(`Languages: ${languages.join(', ')}`);
  console.log('');

  for (const lang of languages) {
    const startTime = Date.now();
    console.log(`[${lang}] Generating PDF...`);

    const navigation = config.navigation[lang];
    if (!navigation) {
      console.warn(`[${lang}] No navigation found, skipping`);
      continue;
    }

    // Process markdown files
    console.log(`[${lang}] Processing ${navigation.length} chapters...`);
    const chapters = await processMarkdownFiles(
      lang,
      navigation,
      SRC_DIR,
      version,
    );

    // Build single unified HTML document
    console.log(`[${lang}] Building HTML...`);
    const html = buildFullDocument(
      chapters,
      { title, version, lang },
      DOCS_ROOT,
      theme,
    );

    // Render PDF
    const outputPath = path.join(
      DOCS_ROOT,
      'dist',
      `Backend.AI_WebUI_User_Guide_${versionForFilename}_${lang}.pdf`,
    );

    console.log(`[${lang}] Rendering PDF...`);
    await renderPdf({
      html,
      outputPath,
      title,
      version,
      lang,
      theme,
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

main().catch((err) => {
  console.error('PDF generation failed:', err);
  process.exit(1);
});
