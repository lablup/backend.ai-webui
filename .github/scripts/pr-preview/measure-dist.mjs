#!/usr/bin/env node
// Measure the built `backend.ai-ui` bundle: raw + gzip bytes per top-level dist
// entry. Run once for the PR head and once for the merge base; the PR comment
// renders the delta between the two reports.
//
// Usage: node measure-dist.mjs --dist <dir> --output <file.json>

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const getArg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
};

const distDir = getArg("dist");
const output = getArg("output");
if (!distDir || !output) {
  console.error("usage: measure-dist.mjs --dist <dir> --output <file.json>");
  process.exit(1);
}

// Only top-level emitted JS. Source maps and .d.ts do not ship to consumers,
// and the per-locale chunks are noise next to the main bundle.
const entries = readdirSync(distDir)
  .filter((name) => name.endsWith(".js"))
  .map((name) => {
    const buf = readFileSync(join(distDir, name));
    return {
      file: name,
      bytes: statSync(join(distDir, name)).size,
      gzipBytes: gzipSync(buf, { level: 9 }).length,
      hash: createHash("sha256").update(buf).digest("hex").slice(0, 12),
    };
  })
  .sort((a, b) => b.bytes - a.bytes);

writeFileSync(output, `${JSON.stringify({ entries }, null, 2)}\n`);
console.log(`Measured ${entries.length} dist entries -> ${output}`);
