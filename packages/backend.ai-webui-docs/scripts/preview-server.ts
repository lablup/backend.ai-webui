import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';
import { processMarkdownFiles } from './markdown-processor.js';
import { buildFullDocument } from './html-builder.js';
import { renderPdf } from './pdf-renderer.js';
import { loadTheme } from './theme.js';
import { buildThemeInfoChapter } from './sample-content.js';
import { processCatalogMarkdownForPdf } from './markdown-processor.js';
import { getDocVersion } from './version.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(DOCS_ROOT, 'src');
const CONFIG_PATH = path.join(SRC_DIR, 'book.config.yaml');
const DIST_DIR = path.join(DOCS_ROOT, 'dist');

interface BookConfig {
  title: string;
  description: string;
  languages: string[];
  navigation: Record<string, Array<{ title: string; path: string }>>;
}

type PreviewMode = 'catalog' | 'document' | 'sample';

const MODE_LABELS: Record<PreviewMode, string> = {
  catalog: 'Style Catalog (theme reference + sample elements)',
  sample: 'Sample content (fast)',
  document: 'Full document (real markdown)',
};

function parseArgs(argv: string[]): { lang: string; theme: string; port: number; mode: PreviewMode } {
  let lang = 'en';
  let theme = 'default';
  let port = 3456;
  let mode: PreviewMode = 'sample';
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--lang' && argv[i + 1]) { lang = argv[i + 1]; i++; }
    if (argv[i] === '--theme' && argv[i + 1]) { theme = argv[i + 1]; i++; }
    if (argv[i] === '--port' && argv[i + 1]) { port = parseInt(argv[i + 1], 10); i++; }
    if (argv[i] === '--mode' && argv[i + 1]) { mode = argv[i + 1] as PreviewMode; i++; }
  }
  return { lang, theme, port, mode };
}

/**
 * Build the PDF viewer page that embeds the actual PDF.
 * On reload signal, the PDF <object> src is cache-busted to show updated PDF.
 */
function buildPdfViewerPage(title: string, mode: PreviewMode): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>PDF Preview - ${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #525659;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .toolbar {
      height: 40px;
      background: #323639;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 16px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
      flex-shrink: 0;
    }
    .toolbar .title { color: #ccc; font-size: 13px; font-weight: 500; }
    .toolbar .badge {
      background: #ff9d00; color: #000; font-size: 10px; font-weight: 700;
      padding: 2px 8px; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .toolbar .spacer { flex: 1; }
    .toolbar .info { color: #888; font-size: 11px; }
    .toolbar .status { color: #4caf50; font-size: 11px; }
    .toolbar .status.building { color: #ff9d00; }
    .toolbar .page-nav {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #aaa;
      font-size: 12px;
    }
    .toolbar .page-nav input {
      width: 36px;
      background: #444;
      border: 1px solid #555;
      border-radius: 3px;
      color: #fff;
      font-size: 12px;
      text-align: center;
      padding: 2px 4px;
      outline: none;
    }
    .toolbar .page-nav input:focus { border-color: #ff9d00; }
    .pdf-container {
      flex: 1;
      display: flex;
      justify-content: center;
      overflow: hidden;
    }
    .pdf-container iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span class="badge">PDF Preview</span>
    <span class="title">${title}</span>
    <span class="spacer"></span>
    <span class="page-nav">
      Page <input id="page-input" type="number" min="1" value="1" />
    </span>
    <span class="info">${MODE_LABELS[mode]}</span>
    <span class="status" id="status">Ready</span>
  </div>
  <div class="pdf-container">
    <iframe id="pdf-frame" src="/preview.pdf#page=1"></iframe>
  </div>
  <script>
  (function() {
    let lastEtag = '';
    let currentPage = 1;
    const statusEl = document.getElementById('status');
    const pdfFrame = document.getElementById('pdf-frame');
    const pageInput = document.getElementById('page-input');

    // Restore page from sessionStorage
    const saved = sessionStorage.getItem('pdfPreviewPage');
    if (saved) {
      currentPage = parseInt(saved, 10) || 1;
      pageInput.value = currentPage;
      pdfFrame.src = '/preview.pdf#page=' + currentPage;
    }

    // Manual page navigation
    pageInput.addEventListener('change', function() {
      const p = parseInt(this.value, 10);
      if (p >= 1) {
        currentPage = p;
        sessionStorage.setItem('pdfPreviewPage', String(currentPage));
        pdfFrame.src = '/preview.pdf?t=' + Date.now() + '#page=' + currentPage;
      }
    });
    pageInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') this.blur();
    });

    async function poll() {
      try {
        const res = await fetch('/__reload');
        const data = await res.json();
        if (data.building) {
          statusEl.textContent = 'Rebuilding PDF...';
          statusEl.className = 'status building';
        } else if (lastEtag && lastEtag !== data.etag) {
          statusEl.textContent = 'Ready';
          statusEl.className = 'status';
          pdfFrame.src = '/preview.pdf?t=' + Date.now() + '#page=' + currentPage;
        } else {
          statusEl.textContent = 'Ready';
          statusEl.className = 'status';
        }
        lastEtag = data.etag;
      } catch {}
      setTimeout(poll, 500);
    }
    poll();
  })();
  </script>
</body>
</html>`;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const config: BookConfig = parseYaml(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  const { display: version } = getDocVersion();
  const theme = loadTheme(args.theme);
  const title = config.title;

  let currentEtag = Date.now().toString(36);
  let isBuilding = false;

  fs.mkdirSync(DIST_DIR, { recursive: true });
  const previewPdfPath = path.join(DIST_DIR, `preview_${args.mode}_${args.lang}.pdf`);

  /**
   * Generate preview PDF using the actual Playwright pipeline.
   * All modes produce a real PDF — identical rendering to production.
   */
  async function generatePreviewPdf(): Promise<void> {
    isBuilding = true;
    const start = Date.now();

    let html: string;
    if (args.mode === 'catalog' || args.mode === 'sample') {
      // Dynamic import with cache-busting to pick up file changes at runtime
      const cacheBuster = `?t=${Date.now()}`;
      const { getCatalogMarkdown } = await import(`./sample-content-markdown.js${cacheBuster}`);
      const sampleChapters = await processCatalogMarkdownForPdf(getCatalogMarkdown());
      const chapters = args.mode === 'catalog'
        ? [buildThemeInfoChapter(theme), ...sampleChapters]
        : sampleChapters;
      html = buildFullDocument(chapters, { title, version, lang: args.lang }, DOCS_ROOT, theme);
    } else {
      // Document mode: real markdown content
      const navigation = config.navigation[args.lang];
      if (!navigation) {
        console.error(`  No navigation found for language: ${args.lang}`);
        isBuilding = false;
        return;
      }
      const chapters = await processMarkdownFiles(args.lang, navigation, SRC_DIR, version);
      html = buildFullDocument(chapters, { title, version, lang: args.lang }, DOCS_ROOT, theme);
    }

    console.log('  Rendering PDF via Playwright...');
    await renderPdf({
      html,
      outputPath: previewPdfPath,
      title,
      version,
      lang: args.lang,
      theme,
    });

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const fileSize = (fs.statSync(previewPdfPath).size / 1024).toFixed(0);
    console.log(`  PDF generated in ${elapsed}s (${fileSize} KB)`);

    currentEtag = Date.now().toString(36);
    isBuilding = false;
  }

  // Initial build
  console.log(`  Generating initial preview PDF...`);
  console.log(`  Mode: ${MODE_LABELS[args.mode]}`);
  await generatePreviewPdf();

  // Serialized rebuild: prevents concurrent Playwright runs
  const debounceMs = 500;
  let rebuildTimer: ReturnType<typeof setTimeout> | null = null;
  let currentBuild: Promise<void> | null = null;
  let pendingRebuild = false;

  function runSerializedBuild() {
    if (currentBuild) {
      pendingRebuild = true;
      return;
    }

    pendingRebuild = false;
    currentBuild = (async () => {
      console.log(`  Rebuilding...`);
      try {
        await generatePreviewPdf();
      } catch (err) {
        console.error('  Rebuild failed:', err);
        isBuilding = false;
      } finally {
        currentBuild = null;
        if (pendingRebuild) {
          runSerializedBuild();
        }
      }
    })();
  }

  function scheduleRebuild(changedFile: string) {
    if (rebuildTimer) clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(() => {
      rebuildTimer = null;
      console.log(`  File changed: ${path.relative(DOCS_ROOT, changedFile)}`);
      pendingRebuild = true;
      runSerializedBuild();
    }, debounceMs);
  }

  // For document mode, watch markdown files
  if (args.mode === 'document') {
    const srcLangDir = path.join(SRC_DIR, args.lang);
    if (fs.existsSync(srcLangDir)) {
      fs.watch(srcLangDir, { recursive: true }, (_event, filename) => {
        const name = filename?.toString();
        if (name && (name.endsWith('.md') || name.endsWith('.yaml'))) {
          scheduleRebuild(path.join(srcLangDir, name));
        }
      });
      console.log(`  Watching: src/${args.lang}/**/*.md`);
    }
  }

  // For sample/catalog modes, watch the shared markdown source
  // Watch the directory (not the file) to survive inode changes from editors on macOS
  if (args.mode === 'sample' || args.mode === 'catalog') {
    const scriptsDir = __dirname;
    const targetFile = 'sample-content-markdown.ts';
    fs.watch(scriptsDir, (_event, filename) => {
      const name = filename?.toString();
      if (name === targetFile) {
        scheduleRebuild(path.join(scriptsDir, targetFile));
      }
    });
    console.log(`  Watching: scripts/${targetFile}`);
  }

  // Always watch config
  fs.watch(CONFIG_PATH, () => { scheduleRebuild(CONFIG_PATH); });

  // Watch theme directory for changes
  const themesDir = path.join(DOCS_ROOT, 'themes');
  if (fs.existsSync(themesDir)) {
    fs.watch(themesDir, { recursive: true }, (_event, filename) => {
      const name = filename?.toString();
      if (name) scheduleRebuild(path.join(themesDir, name));
    });
  }

  // HTTP server
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://localhost:${args.port}`);

    // Live-reload polling endpoint
    if (url.pathname === '/__reload') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
      res.end(JSON.stringify({ etag: currentEtag, building: isBuilding }));
      return;
    }

    // All modes: / serves viewer, /preview.pdf serves actual PDF
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const viewerHtml = buildPdfViewerPage(title, args.mode);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(viewerHtml);
      return;
    }

    if (url.pathname === '/preview.pdf') {
      if (fs.existsSync(previewPdfPath)) {
        const stat = fs.statSync(previewPdfPath);
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Length': stat.size,
          'Cache-Control': 'no-cache',
        });
        fs.createReadStream(previewPdfPath).pipe(res);
      } else {
        res.writeHead(503, { 'Content-Type': 'text/plain' });
        res.end('PDF is being generated...');
      }
      return;
    }

    // Serve static files (images) from src/{lang}/
    const safePath = path.normalize(url.pathname).replace(/^\/+/, '');
    const filePath = path.join(SRC_DIR, args.lang, safePath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
      };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });

  server.listen(args.port, () => {
    console.log('');
    console.log(`  Backend.AI Docs Preview Server`);
    console.log(`  Mode:      ${args.mode} — ${MODE_LABELS[args.mode]}`);
    console.log(`  Theme:     ${theme.name}`);
    console.log(`  Language:  ${args.lang}`);
    console.log(`  URL:       http://localhost:${args.port}`);
    console.log(`  PDF:       http://localhost:${args.port}/preview.pdf`);
    console.log('');
    if (args.mode === 'document') {
      console.log(`  Editing src/${args.lang}/**/*.md will regenerate the PDF.`);
    } else {
      console.log(`  Editing scripts/sample-content-markdown.ts will regenerate the PDF.`);
    }
    console.log('');
    console.log(`  Press Ctrl+C to stop.`);
  });
}

main().catch((err) => {
  console.error('Preview server failed:', err);
  process.exit(1);
});
