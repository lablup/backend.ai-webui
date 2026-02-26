/**
 * Website Preview Server - serves the multi-page static website with live-reload.
 * Rebuilds pages on file changes and serves the generated files from disk.
 */

import fs from 'fs';
import http from 'http';
import path from 'path';
import { parse as parseYaml } from 'yaml';
import { generateWebsite } from './website-generator.js';
import type { ResolvedDocConfig } from './config.js';

interface BookConfig {
  title: string;
  description: string;
  languages: string[];
  navigation: Record<string, Array<{ title: string; path: string }>>;
}

export interface WebsitePreviewOptions {
  lang: string;
  port: number;
}

function parseArgs(argv: string[]): WebsitePreviewOptions {
  let lang = 'en';
  let port = 3458;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--lang' && argv[i + 1]) { lang = argv[i + 1]; i++; }
    if (argv[i] === '--port' && argv[i + 1]) { port = parseInt(argv[i + 1], 10); i++; }
  }
  return { lang, port };
}

/** MIME types for static files */
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

/**
 * Start a development server for the multi-page website with live-reload.
 * Performs an initial build, watches for changes, rebuilds, and serves files.
 */
export async function startWebsitePreviewServer(
  config: ResolvedDocConfig,
  options?: Partial<WebsitePreviewOptions>,
): Promise<void> {
  const args = { ...parseArgs(process.argv.slice(2)), ...options };

  const configPath = path.join(config.srcDir, 'book.config.yaml');
  const bookConfig: BookConfig = parseYaml(fs.readFileSync(configPath, 'utf-8'));

  const navigation = bookConfig.navigation[args.lang];
  if (!navigation) {
    console.error(`No navigation found for language: ${args.lang}`);
    console.error(`Available: ${Object.keys(bookConfig.navigation).join(', ')}`);
    process.exit(1);
  }

  const websiteOutDir = config.website?.outDir ?? 'web';
  const distBase = path.join(config.distDir, websiteOutDir);

  let currentEtag = Date.now().toString(36);

  // Initial build
  console.log(`  Building website (${args.lang})...`);
  await generateWebsite(config, { lang: args.lang });

  // Serialized rebuild: prevents concurrent builds and unhandled promise rejections
  const debounceMs = 500;
  let rebuildTimer: ReturnType<typeof setTimeout> | null = null;
  let currentBuild: Promise<void> | null = null;
  let pendingRebuild = false;

  function runSerializedBuild(changedFile: string) {
    if (currentBuild) {
      pendingRebuild = true;
      return;
    }

    pendingRebuild = false;
    currentBuild = (async () => {
      console.log(`  File changed: ${path.relative(config.projectRoot, changedFile)}`);
      try {
        await generateWebsite(config, { lang: args.lang });
        currentEtag = Date.now().toString(36);
        console.log('  Rebuild complete.');
      } catch (err) {
        console.error('  Rebuild failed:', err);
      } finally {
        currentBuild = null;
        if (pendingRebuild) {
          runSerializedBuild(changedFile);
        }
      }
    })();
  }

  function scheduleRebuild(changedFile: string) {
    if (rebuildTimer) clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(() => {
      rebuildTimer = null;
      runSerializedBuild(changedFile);
    }, debounceMs);
  }

  // Watch source files
  const srcLangDir = path.join(config.srcDir, args.lang);
  if (fs.existsSync(srcLangDir)) {
    fs.watch(srcLangDir, { recursive: true }, (_event, filename) => {
      const name = filename?.toString();
      if (name && (name.endsWith('.md') || name.endsWith('.yaml'))) {
        scheduleRebuild(path.join(srcLangDir, name));
      }
    });
  }

  // Watch config
  fs.watch(configPath, () => { scheduleRebuild(configPath); });

  // Inject live-reload script into HTML responses
  const RELOAD_SCRIPT = `<script>
(function(){
  var etag='';
  setInterval(function(){
    fetch('/__reload').then(function(r){return r.json()}).then(function(d){
      if(etag&&d.etag!==etag)location.reload();
      etag=d.etag;
    }).catch(function(){});
  },1000);
})();
</script>`;

  // HTTP server
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://localhost:${args.port}`);

    // Live-reload polling endpoint
    if (url.pathname === '/__reload') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
      res.end(JSON.stringify({ etag: currentEtag }));
      return;
    }

    // Resolve file path from URL
    let filePath: string;
    if (url.pathname === '/' || url.pathname === `/${args.lang}`) {
      // Redirect root to language directory so relative URLs in index.html resolve correctly
      res.writeHead(302, { Location: `/${args.lang}/` });
      res.end();
      return;
    } else if (url.pathname === `/${args.lang}/`) {
      // Serve language index
      filePath = path.join(distBase, args.lang, 'index.html');
    } else {
      // Normalize: remove leading slash
      const safePath = path.normalize(url.pathname).replace(/^\/+/, '');
      filePath = path.resolve(distBase, safePath);
    }

    // Security: ensure file is within distBase
    if (!filePath.startsWith(distBase + path.sep) && filePath !== distBase) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    // Check if file exists
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      // Try with .html extension
      if (!filePath.endsWith('.html') && fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] ?? 'application/octet-stream';

    // For HTML files, inject live-reload script
    if (ext === '.html') {
      let html = fs.readFileSync(filePath, 'utf-8');
      html = html.replace('</body>', `${RELOAD_SCRIPT}\n</body>`);
      res.writeHead(200, { 'Content-Type': mimeType, 'Cache-Control': 'no-cache' });
      res.end(html);
      return;
    }

    // Serve static files with error handling to prevent process crash
    res.writeHead(200, { 'Content-Type': mimeType, 'Cache-Control': 'max-age=5' });
    const stream = fs.createReadStream(filePath);
    stream.on('error', (err) => {
      console.error(`  Stream error for ${filePath}:`, err.message);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
      }
      res.end('Internal server error');
    });
    stream.pipe(res);
  });

  server.listen(args.port, () => {
    const productName = config.productName;
    console.log('');
    console.log(`  ${productName} - Website Preview`);
    console.log(`  Language:  ${args.lang}`);
    console.log(`  URL:       http://localhost:${args.port}`);
    console.log('');
    console.log(`  Editing src/${args.lang}/**/*.md will auto-reload the page.`);
    console.log('  Press Ctrl+C to stop.');
    console.log('');
  });
}
