#!/usr/bin/env node
// Minimal static file server for the example's built `dist/web/` site.
// Used by the Playwright config in this directory to boot a hermetic
// HTTP server during `test:e2e`. Why a tiny handwritten server instead
// of `serve` / `http-server`: zero new devDeps, predictable behavior
// (always serves dist/web, no auto index/redirect surprises that
// would mask redirect bugs we want the tests to catch).

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const ROOT = path.resolve(process.cwd(), "dist/web");
const PORT = Number(process.env.PORT) || 4567;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

if (!fs.existsSync(ROOT)) {
  console.error(
    `static-server: dist/web/ does not exist at ${ROOT}. ` +
      `Run \`pnpm build:web\` first.`,
  );
  process.exit(1);
}

http
  .createServer((req, res) => {
    const u = url.parse(req.url ?? "/");
    // 1. Decode percent-encoding safely. Malformed sequences (e.g. `%E0`)
    //    would otherwise throw and crash the server.
    let pathname;
    try {
      pathname = decodeURIComponent(u.pathname ?? "/");
    } catch {
      res.writeHead(400);
      res.end("bad request");
      return;
    }
    // 2. Resolve the path and verify it is INSIDE ROOT. A simple
    //    `startsWith(ROOT)` check is bypassable when ROOT has a sibling
    //    directory whose name shares a prefix (e.g. ROOT="/srv/web" and
    //    /srv/web2/secret); use `path.relative` to detect any `..`
    //    backtrack.
    const resolved = path.resolve(ROOT, "." + pathname);
    const relFromRoot = path.relative(ROOT, resolved);
    if (
      relFromRoot.startsWith("..") ||
      path.isAbsolute(relFromRoot)
    ) {
      res.writeHead(403);
      res.end("forbidden");
      return;
    }
    fs.stat(resolved, (err, stat) => {
      if (err) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      // 3. If the path is a directory, fall through to its index.html.
      //    `stat` the final path BEFORE writing 200 headers — otherwise
      //    a missing/unreadable index.html produces an `error` event
      //    after headers were already sent (ERR_HTTP_HEADERS_SENT).
      const finalPath = stat.isDirectory()
        ? path.join(resolved, "index.html")
        : resolved;
      fs.stat(finalPath, (finalErr) => {
        if (finalErr) {
          res.writeHead(404);
          res.end("not found");
          return;
        }
        const mime =
          MIME[path.extname(finalPath).toLowerCase()] ??
          "application/octet-stream";
        res.writeHead(200, {
          "Content-Type": mime,
          "Cache-Control": "no-cache",
        });
        fs.createReadStream(finalPath).pipe(res);
      });
    });
  })
  .listen(PORT, () => {
    console.log(`static-server: serving ${ROOT} on http://localhost:${PORT}`);
  });
