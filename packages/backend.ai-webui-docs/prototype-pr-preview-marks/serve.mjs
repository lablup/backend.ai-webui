#!/usr/bin/env node
// PROTOTYPE (FR-3882) — throwaway static server.
//   /head/...  → dist/proto-head (the PR build, with marks injected)
//   /base/...  → dist/proto-base (the base-branch build; serves the "old" images/pages)
// The overlay assets are served straight from this directory so edits show on reload.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(here, '..');
const ROOTS = { head: path.join(docsRoot, 'dist/proto-head'), base: path.join(docsRoot, 'dist/proto-base') };
const PORT = Number(process.env.PORT || 4174);
const START = '/head/next/en/vfolder.html?variant=A';
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };

http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let p = decodeURIComponent(url.pathname);
  if (p === '/' || p === '/head' || p === '/head/') { res.writeHead(302, { Location: START }); return res.end(); }
  if (p === '/head/assets/bai-pr-preview.js') p = null, res.setHeader('Cache-Control', 'no-store'), serve(path.join(here, 'overlay.js'));
  else if (p === '/head/assets/bai-pr-preview.css') p = null, res.setHeader('Cache-Control', 'no-store'), serve(path.join(here, 'overlay.css'));
  if (p === null) return;
  const m = p.match(/^\/(head|base)\/(.*)$/);
  if (!m) { res.writeHead(404); return res.end('not found'); }
  let file = path.join(ROOTS[m[1]], m[2]);
  if (!file.startsWith(ROOTS[m[1]])) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  serve(file);

  function serve(file) {
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end('not found: ' + file); }
    res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  }
}).listen(PORT, () => {
  console.log(`docs PR preview prototype → http://localhost:${PORT}${START}`);
  console.log('variants: ?variant=A (highlighter) · B (gutter bar) · C (track changes); ← → to cycle, [ ] to step through changes');
});
