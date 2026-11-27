#!/usr/bin/env node
// Boot-path budget for the production build.
//
//   node scripts/bundle-budget.mjs [--build react/build] [--json]
//
// Reads `index.html`, takes the module script it loads plus every chunk that
// script statically imports (transitively) or the page modulepreloads, and
// fails (exit 1) when those eager chunks together exceed BUDGET_BYTES
// (minified, before gzip), or when any chunk exceeds the service-worker
// precache limit, which would break the release build.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, posix, resolve } from "node:path";
import { gzipSync } from "node:zlib";

// Measured 2026-10-29 on Vite 8: 2.18 MB of eager JS in 133 chunks (entry
// 0.37 MB); the 2026-10-22 budget kept the same ~30% headroom over a 1.9 MB
// entry. Raise this only with a chunk report showing why
// (`VITE_CHUNK_REPORT=<file> vite build`, react/vite-plugins/chunk-report.ts).
export const BUDGET_BYTES = 2.8 * 1024 * 1024;
// `maximumFileSizeToCacheInBytes` in react/vite.config.ts.
export const PRECACHE_LIMIT_BYTES = 5 * 1024 * 1024;

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const buildDir = resolve(flag("--build", "react/build"));
const json = args.includes("--json");

const STATIC_IMPORT =
  /(?:^|[;}\s])(?:import|export)\s*(?:[\w$*{}\s,]+?\s*from\s*)?["'](\.{1,2}\/[^"']+\.js)["']/g;

function eagerChunks(dir, html) {
  const entry = html.match(
    /<script[^>]+type="module"[^>]+src="\/?(assets\/[^"]+\.js)"/,
  )?.[1];
  if (!entry) throw new Error(`no module script in ${join(dir, "index.html")}`);
  const preloads = [
    ...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="\/?([^"]+\.js)"/g),
  ].map((m) => m[1]);
  const seen = new Set();
  const queue = [entry, ...preloads];
  while (queue.length > 0) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    if (!existsSync(join(dir, file))) throw new Error(`missing chunk ${file}`);
    seen.add(file);
    const code = readFileSync(join(dir, file), "utf8");
    for (const [, spec] of code.matchAll(STATIC_IMPORT)) {
      queue.push(posix.normalize(posix.join(posix.dirname(file), spec)));
    }
  }
  return { entry, files: [...seen] };
}

export function measure(dir) {
  const html = readFileSync(join(dir, "index.html"), "utf8");
  const { entry, files } = eagerChunks(dir, html);
  const eager = files.map((file) => {
    const code = readFileSync(join(dir, file));
    return { file, bytes: code.length, gzipBytes: gzipSync(code).length };
  });
  const assets = join(dir, "assets");
  const chunks = readdirSync(assets)
    .filter((f) => f.endsWith(".js"))
    .map((f) => ({
      file: `assets/${f}`,
      bytes: statSync(join(assets, f)).size,
    }))
    .sort((a, b) => b.bytes - a.bytes);
  return {
    entry,
    entryBytes: eager.find((c) => c.file === entry).bytes,
    eagerBytes: eager.reduce((s, c) => s + c.bytes, 0),
    eagerGzipBytes: eager.reduce((s, c) => s + c.gzipBytes, 0),
    eagerChunkCount: eager.length,
    budget: BUDGET_BYTES,
    totalJsBytes: chunks.reduce((s, c) => s + c.bytes, 0),
    chunkCount: chunks.length,
    overPrecacheLimit: chunks.filter((c) => c.bytes > PRECACHE_LIMIT_BYTES),
    largestEager: eager.sort((a, b) => b.bytes - a.bytes).slice(0, 10),
  };
}

const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;
const result = measure(buildDir);
const over =
  result.eagerBytes > result.budget || result.overPrecacheLimit.length > 0;
if (json) {
  console.log(JSON.stringify({ ...result, over }, null, 2));
} else {
  console.log(
    `eager JS ${mb(result.eagerBytes)} (gzip ${mb(result.eagerGzipBytes)}) in ${result.eagerChunkCount} chunks, budget ${mb(result.budget)} — ${result.eagerBytes > result.budget ? "OVER" : "ok"}`,
  );
  console.log(`entry ${result.entry}: ${mb(result.entryBytes)}`);
  for (const c of result.overPrecacheLimit)
    console.log(
      `OVER the ${mb(PRECACHE_LIMIT_BYTES)} precache limit: ${c.file} ${mb(c.bytes)}`,
    );
  console.log(
    `total JS ${mb(result.totalJsBytes)} in ${result.chunkCount} chunks; largest eager:`,
  );
  for (const c of result.largestEager)
    console.log(`  ${mb(c.bytes).padStart(9)}  ${c.file}`);
}
process.exit(over ? 1 : 0);
