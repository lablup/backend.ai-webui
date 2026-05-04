/**
 * Website Preview Server - serves the multi-page static website with live-reload.
 * Rebuilds pages on file changes and serves the generated files from disk.
 */

import fs from "fs";
import http from "http";
import path from "path";
import { generateWebsite } from "./website-generator.js";
import type { ResolvedDocConfig } from "./config.js";
import { loadBookConfig } from "./book-config.js";


export interface WebsitePreviewOptions {
  lang: string;
  port: number;
}

function parseArgs(argv: string[]): WebsitePreviewOptions {
  let lang = "en";
  let port = 3458;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--lang" && argv[i + 1]) {
      lang = argv[i + 1];
      i++;
    }
    if (argv[i] === "--port" && argv[i + 1]) {
      port = parseInt(argv[i + 1], 10);
      i++;
    }
  }
  return { lang, port };
}

/** MIME types for static files */
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
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

  const configPath = path.join(config.srcDir, "book.config.yaml");
  const bookConfig = loadBookConfig(config.srcDir);

  const navigation = bookConfig.navigation[args.lang];
  if (!navigation) {
    console.error(`No navigation found for language: ${args.lang}`);
    console.error(
      `Available: ${Object.keys(bookConfig.navigation).join(", ")}`,
    );
    process.exit(1);
  }

  const websiteOutDir = config.website?.outDir ?? "web";
  const distBase = path.join(config.distDir, websiteOutDir);

  let currentEtag = Date.now().toString(36);

  // Initial build
  console.log(`  Building website (${args.lang})...`);
  // Preview / dev mode keeps warning-only behavior; production build:web defaults to strict.
  await generateWebsite(config, { lang: args.lang, strict: false });

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
      console.log(
        `  File changed: ${path.relative(config.projectRoot, changedFile)}`,
      );
      try {
        // Preview / dev mode keeps warning-only behavior; production build:web defaults to strict.
        await generateWebsite(config, { lang: args.lang, strict: false });
        currentEtag = Date.now().toString(36);
        console.log("  Rebuild complete.");
      } catch (err) {
        console.error("  Rebuild failed:", err);
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
      if (name && (name.endsWith(".md") || name.endsWith(".yaml"))) {
        scheduleRebuild(path.join(srcLangDir, name));
      }
    });
  }

  // Watch config
  fs.watch(configPath, () => {
    scheduleRebuild(configPath);
  });

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
    const url = new URL(req.url || "/", `http://localhost:${args.port}`);

    // Live-reload polling endpoint
    if (url.pathname === "/__reload") {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      });
      res.end(JSON.stringify({ etag: currentEtag }));
      return;
    }

    // Resolve file path from URL.
    //
    // Two preview-only correctness fixes (FR-2728):
    //   1. Root (`/`) used to serve `<lang>/index.html` directly. That page
    //      contains a `<meta refresh url=./quickstart.html>` redirect,
    //      which the browser resolves *relative to its current URL* (`/`).
    //      The result was a request for `/quickstart.html`, which does
    //      not exist in `dist/web/` (the chapter is at `<lang>/quickstart.html`).
    //      Send a real HTTP 302 to `/<lang>/` instead so the browser's
    //      base URL is the language directory and downstream relative
    //      links resolve correctly. Also serve `dist/web/index.html`
    //      (the language picker) when the user reaches root via a
    //      language-agnostic entry point.
    //   2. Browsers percent-encode non-ASCII path segments (e.g. KO
    //      `헤더.html` -> `%ED%97%A4%EB%8D%94.html`). The server must
    //      decode before joining onto `distBase`, otherwise the
    //      filesystem lookup fails with 404 even though the file exists.
    //      Production static hosts (nginx, GH Pages, etc.) handle this
    //      transparently; this matches that behavior.
    let filePath: string;
    if (url.pathname === "/") {
      // Prefer the language picker at `dist/web/index.html` when it
      // exists (multi-lang build); otherwise fall back to a 302 to the
      // current language's directory so relative redirects in the
      // per-language `index.html` resolve correctly.
      const pickerPath = path.join(distBase, "index.html");
      if (fs.existsSync(pickerPath)) {
        filePath = pickerPath;
      } else {
        res.writeHead(302, { Location: `/${args.lang}/` });
        res.end();
        return;
      }
    } else if (url.pathname === `/${args.lang}`) {
      // Redirect `/<lang>` (no trailing slash) to `/<lang>/` so the
      // browser's base URL becomes the language directory and the
      // relative meta-refresh in `<lang>/index.html` resolves to
      // `/<lang>/<slug>.html` instead of `/<slug>.html`.
      res.writeHead(302, { Location: `/${args.lang}/` });
      res.end();
      return;
    } else if (url.pathname === `/${args.lang}/`) {
      filePath = path.join(distBase, args.lang, "index.html");
    } else {
      // Decode percent-encoded path segments (e.g. CJK filenames),
      // then strip any leading slash and normalize against distBase.
      let decoded: string;
      try {
        decoded = decodeURIComponent(url.pathname);
      } catch {
        // Malformed escape sequence — refuse rather than fall back to
        // the encoded form, which would let an attacker probe the FS.
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Bad request");
        return;
      }
      // NUL bytes (`\0`) survive `decodeURIComponent` (e.g. `%00`) and
      // crash Node's sync fs APIs, killing the preview server (DoS).
      // Reject explicitly and 400 instead of letting the request reach
      // the filesystem layer.
      if (decoded.includes("\0")) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Bad request");
        return;
      }
      const safePath = path.normalize(decoded).replace(/^\/+/, "");
      filePath = path.resolve(distBase, safePath);
    }

    // Security: ensure file is within distBase
    if (!filePath.startsWith(distBase + path.sep) && filePath !== distBase) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Forbidden");
      return;
    }

    // Check if file exists. Wrap the sync fs probes in try/catch as
    // defense-in-depth — even though the `\0` filter above blocks the
    // canonical NUL-crash path, any future code path that builds a
    // bad `filePath` shouldn't take down the preview server.
    try {
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        if (!filePath.endsWith(".html") && fs.existsSync(filePath + ".html")) {
          filePath = filePath + ".html";
        } else {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not found");
          return;
        }
      }
    } catch {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Bad request");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] ?? "application/octet-stream";

    // For HTML files, inject live-reload script
    if (ext === ".html") {
      let html = fs.readFileSync(filePath, "utf-8");
      html = html.replace("</body>", `${RELOAD_SCRIPT}\n</body>`);
      res.writeHead(200, {
        "Content-Type": mimeType,
        "Cache-Control": "no-cache",
      });
      res.end(html);
      return;
    }

    // Serve static files with error handling to prevent process crash
    res.writeHead(200, {
      "Content-Type": mimeType,
      "Cache-Control": "max-age=5",
    });
    const stream = fs.createReadStream(filePath);
    stream.on("error", (err) => {
      console.error(`  Stream error for ${filePath}:`, err.message);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/plain" });
      }
      res.end("Internal server error");
    });
    stream.pipe(res);
  });

  server.listen(args.port, () => {
    const productName = config.productName;
    console.log("");
    console.log(`  ${productName} - Website Preview`);
    console.log(`  Language:  ${args.lang}`);
    console.log(`  URL:       http://localhost:${args.port}`);
    console.log("");
    console.log(
      `  Editing src/${args.lang}/**/*.md will auto-reload the page.`,
    );
    console.log("  Press Ctrl+C to stop.");
    console.log("");
  });
}
