import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';
import { processMarkdownFiles } from './markdown-processor.js';
import { buildFullDocument } from './html-builder.js';
import { renderPdf } from './pdf-renderer.js';
import { loadTheme } from './theme.js';
import { buildSampleChapters, buildCatalogChapters } from './sample-content.js';
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
    .pdf-container {
      flex: 1;
      display: flex;
      justify-content: center;
      overflow: hidden;
    }
    .pdf-container object,
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
    <span class="info">${MODE_LABELS[mode]}</span>
    <span class="status" id="status">Ready</span>
  </div>
  <div class="pdf-container">
    <object id="pdf-viewer" data="/preview.pdf" type="application/pdf">
      <iframe id="pdf-fallback" src="/preview.pdf"></iframe>
    </object>
  </div>
  <script>
  (function() {
    let lastEtag = '';
    const statusEl = document.getElementById('status');
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
          const viewer = document.getElementById('pdf-viewer');
          const fallback = document.getElementById('pdf-fallback');
          const newSrc = '/preview.pdf?t=' + Date.now();
          if (viewer) viewer.data = newSrc;
          if (fallback) fallback.src = newSrc;
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
    if (args.mode === 'catalog') {
      // Catalog mode: theme reference + sample elements
      const chapters = buildCatalogChapters(theme);
      html = buildFullDocument(chapters, { title, version, lang: args.lang }, DOCS_ROOT, theme);
    } else if (args.mode === 'sample') {
      // Sample mode: sample elements only (no theme reference chapter)
      const chapters = buildSampleChapters();
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
        if (filename && (filename.endsWith('.md') || filename.endsWith('.yaml'))) {
          scheduleRebuild(path.join(srcLangDir, filename));
        }
      });
      console.log(`  Watching: src/${args.lang}/**/*.md`);
    }
  }

  // Always watch config
  fs.watch(CONFIG_PATH, () => { scheduleRebuild(CONFIG_PATH); });

  // Watch theme directory for changes
  const themesDir = path.join(DOCS_ROOT, 'themes');
  if (fs.existsSync(themesDir)) {
    fs.watch(themesDir, { recursive: true }, (_event, filename) => {
      if (filename) scheduleRebuild(path.join(themesDir, filename));
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
      console.log(`  All modes generate real PDF via Playwright (identical to production).`);
    }
    console.log(`  Editing scripts/*.ts requires server restart.`);
    console.log('');
    console.log(`  Press Ctrl+C to stop.`);
  });
}

main().catch((err) => {
  console.error('Preview server failed:', err);
  process.exit(1);
});
