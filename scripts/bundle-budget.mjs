#!/usr/bin/env node
// Entry-chunk budget for the production build.
//
//   node scripts/bundle-budget.mjs [--build react/build] [--json]
//
// Reads `index.html`, finds the module script it loads, and fails (exit 1)
// when that chunk exceeds BUDGET_BYTES (minified, before gzip). The
// service-worker precache refuses files over 5 MiB, so a growing entry
// chunk breaks the release build; this gate reports it on the PR instead.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";

// Measured 2026-10-22 after the lazy-loading pass: the entry chunk was
// 1.9 MB (was 5.1 MB). Raise this only with a chunk report showing why
// (`VITE_CHUNK_REPORT=<file> vite build`, react/vite-plugins/chunk-report.ts).
export const BUDGET_BYTES = 2.5 * 1024 * 1024;

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const buildDir = resolve(flag("--build", "react/build"));
const json = args.includes("--json");

export function measure(dir) {
  const html = readFileSync(join(dir, "index.html"), "utf8");
  const m = html.match(
    /<script[^>]+type="module"[^>]+src="\/?(assets\/[^"]+\.js)"/,
  );
  if (!m) throw new Error(`no module script in ${join(dir, "index.html")}`);
  const entry = m[1];
  const code = readFileSync(join(dir, entry));
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
    bytes: code.length,
    gzipBytes: gzipSync(code).length,
    budget: BUDGET_BYTES,
    totalJsBytes: chunks.reduce((s, c) => s + c.bytes, 0),
    chunkCount: chunks.length,
    largest: chunks.slice(0, 10),
  };
}

const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;
const result = measure(buildDir);
const over = result.bytes > result.budget;
if (json) {
  console.log(JSON.stringify({ ...result, over }, null, 2));
} else {
  console.log(
    `entry ${result.entry}: ${mb(result.bytes)} (gzip ${mb(result.gzipBytes)}), budget ${mb(result.budget)} — ${over ? "OVER" : "ok"}`,
  );
  console.log(
    `total JS ${mb(result.totalJsBytes)} in ${result.chunkCount} chunks; largest:`,
  );
  for (const c of result.largest)
    console.log(`  ${mb(c.bytes).padStart(9)}  ${c.file}`);
}
process.exit(over ? 1 : 0);
