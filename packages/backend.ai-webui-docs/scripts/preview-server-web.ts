/**
 * HTML Preview Server - renders markdown as styled HTML directly in the browser (no PDF).
 * Supports admonitions, code block titles/highlighting, details/summary.
 * Live-reload on file changes.
 */

import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';
import { processMarkdownFilesForWeb, processCatalogMarkdownForWeb } from './markdown-processor-web.js';
import { buildWebDocument } from './html-builder-web.js';
import { getDocVersion } from './version.js';
// getCatalogMarkdown is dynamically imported in catalog mode for hot-reload support

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

function parseArgs(argv: string[]): { lang: string; port: number; mode: 'document' | 'catalog' } {
  let lang = 'en';
  let port = 3457;
  let mode: 'document' | 'catalog' = 'document';
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--lang' && argv[i + 1]) { lang = argv[i + 1]; i++; }
    if (argv[i] === '--port' && argv[i + 1]) { port = parseInt(argv[i + 1], 10); i++; }
    if (argv[i] === '--mode' && argv[i + 1]) { mode = argv[i + 1] as 'document' | 'catalog'; i++; }
  }
  return { lang, port, mode };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const config: BookConfig = parseYaml(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  const { display: version } = getDocVersion();
  const isCatalog = args.mode === 'catalog';
  const title = isCatalog ? 'Style Catalog' : config.title;

  if (!isCatalog) {
    const navigation = config.navigation[args.lang];
    if (!navigation) {
      console.error(`No navigation found for language: ${args.lang}`);
      console.error(`Available: ${Object.keys(config.navigation).join(', ')}`);
      process.exit(1);
    }
  }

  let currentEtag = Date.now().toString(36);
  let cachedHtml = '';

  async function generateHtml(): Promise<string> {
    const start = Date.now();

    let chapters;
    if (isCatalog) {
      // Dynamic import with cache-busting to pick up file changes at runtime
      const cacheBuster = `?t=${Date.now()}`;
      const { getCatalogMarkdown } = await import(`./sample-content-markdown.js${cacheBuster}`);
      chapters = await processCatalogMarkdownForWeb(getCatalogMarkdown());
    } else {
      const navigation = config.navigation[args.lang];
      chapters = await processMarkdownFilesForWeb(args.lang, navigation, SRC_DIR, version);
    }

    const html = buildWebDocument(chapters, { title, version, lang: args.lang });
    const elapsed = Date.now() - start;
    console.log(`  HTML generated in ${elapsed}ms (${chapters.length} ${isCatalog ? 'sections' : 'chapters'})`);
    return html;
  }

  // Initial build
  console.log(`  Generating initial HTML (${isCatalog ? 'catalog' : 'document'} mode)...`);
  cachedHtml = await generateHtml();

  // Debounced rebuild
  const debounceMs = 300;
  let rebuildTimer: ReturnType<typeof setTimeout> | null = null;

  function scheduleRebuild(changedFile: string) {
    if (rebuildTimer) clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(async () => {
      rebuildTimer = null;
      console.log(`  File changed: ${path.relative(DOCS_ROOT, changedFile)}`);
      try {
        cachedHtml = await generateHtml();
        currentEtag = Date.now().toString(36);
      } catch (err) {
        console.error('  Rebuild failed:', err);
      }
    }, debounceMs);
  }

  // Watch source files (catalog mode watches the catalog source, document mode watches markdown)
  // Watch directory (not file) to survive inode changes from editors on macOS
  if (isCatalog) {
    const scriptsDir = __dirname;
    const targetFile = 'sample-content-markdown.ts';
    fs.watch(scriptsDir, (_event, filename) => {
      const name = filename?.toString();
      if (name === targetFile) {
        scheduleRebuild(path.join(scriptsDir, targetFile));
      }
    });
  } else {
    const srcLangDir = path.join(SRC_DIR, args.lang);
    if (fs.existsSync(srcLangDir)) {
      fs.watch(srcLangDir, { recursive: true }, (_event, filename) => {
        const name = filename?.toString();
        if (name && (name.endsWith('.md') || name.endsWith('.yaml'))) {
          scheduleRebuild(path.join(srcLangDir, name));
        }
      });
    }
  }

  // Watch config
  fs.watch(CONFIG_PATH, () => { scheduleRebuild(CONFIG_PATH); });

  // MIME types for static files
  const MIME_TYPES: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
  };

  // HTTP server
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://localhost:${args.port}`);

    // Live-reload polling endpoint
    if (url.pathname === '/__reload') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
      res.end(JSON.stringify({ etag: currentEtag }));
      return;
    }

    // Serve main HTML page
    if (url.pathname === '/' || url.pathname === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(cachedHtml);
      return;
    }

    // Serve static image files from src/{lang}/
    const safePath = path.normalize(url.pathname).replace(/^\/+/, '');
    const baseDir = path.resolve(SRC_DIR, args.lang);
    const resolved = path.resolve(baseDir, safePath);
    if (
      safePath &&
      resolved.startsWith(baseDir + path.sep) &&
      fs.existsSync(resolved) &&
      fs.statSync(resolved).isFile()
    ) {
      const ext = path.extname(resolved).toLowerCase();
      const mimeType = MIME_TYPES[ext];
      if (mimeType) {
        res.writeHead(200, { 'Content-Type': mimeType, 'Cache-Control': 'max-age=60' });
        fs.createReadStream(resolved).pipe(res);
        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });

  server.listen(args.port, () => {
    console.log('');
    console.log(`  Backend.AI Docs - HTML Preview [${isCatalog ? 'CATALOG' : 'DOCUMENT'}]`);
    if (!isCatalog) {
      console.log(`  Language:  ${args.lang}`);
    }
    console.log(`  URL:       http://localhost:${args.port}`);
    console.log('');
    if (isCatalog) {
      console.log('  Editing scripts/sample-content-markdown.ts will auto-reload the page.');
    } else {
      console.log(`  Editing src/${args.lang}/**/*.md will auto-reload the page.`);
    }
    console.log('  Press Ctrl+C to stop.');
    console.log('');
  });
}

main().catch((err) => {
  console.error('HTML preview server failed:', err);
  process.exit(1);
});
