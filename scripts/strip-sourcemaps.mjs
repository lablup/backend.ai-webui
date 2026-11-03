#!/usr/bin/env node
/**
 * Copy a web build without its source maps (#10820).
 *
 * Usage: node scripts/strip-sourcemaps.mjs <build-dir> <out-dir>
 *
 * Skips *.js.map / *.mjs.map / *.cjs.map / *.css.map, removes the trailing
 * sourceMappingURL comments of JS/CSS files, then fails if a source map is
 * still reachable: an inline `data:` map or a map-shaped file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_MAP_FILE = /\.(?:[cm]?js|css)\.map$/i;
const SCRIPT_OR_STYLE = /\.(?:[cm]?js|css)$/i;
const INLINE_MAP_SCAN = /\.(?:[cm]?js|css|html?)$/i;
// Only the run of comments at the very end of a file — the place bundlers put
// them — so a string that merely contains the text is left alone.
const TRAILING_MAP_COMMENTS =
  /(?:\s*(?:\/\/[#@][ \t]*sourceMappingURL=[^\n]*|\/\*[#@][ \t]*sourceMappingURL=[\s\S]*?\*\/))+\s*$/;
const INLINE_MAP = /sourceMappingURL=data:/;

export function stripTrailingSourceMapComments(text) {
  if (!text.includes('sourceMappingURL')) return text;
  return text.replace(TRAILING_MAP_COMMENTS, '\n');
}

function isMapShaped(file) {
  try {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    return typeof json?.mappings === 'string' && Array.isArray(json?.sources);
  } catch {
    return false;
  }
}

export function stripSourceMaps(srcDir, outDir) {
  const stats = { skippedMaps: 0, stripped: 0, files: 0 };
  const problems = [];
  const walk = (src, out) => {
    fs.mkdirSync(out, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const from = path.join(src, entry.name);
      const to = path.join(out, entry.name);
      if (entry.isDirectory()) {
        walk(from, to);
        continue;
      }
      if (SOURCE_MAP_FILE.test(entry.name)) {
        stats.skippedMaps++;
        continue;
      }
      stats.files++;
      if (!SCRIPT_OR_STYLE.test(entry.name)) {
        fs.copyFileSync(from, to);
      } else {
        const text = fs.readFileSync(from, 'utf8');
        const stripped = stripTrailingSourceMapComments(text);
        if (stripped !== text) stats.stripped++;
        fs.writeFileSync(to, stripped);
      }
      if (INLINE_MAP_SCAN.test(entry.name)) {
        if (INLINE_MAP.test(fs.readFileSync(to, 'utf8'))) {
          problems.push(`inline source map: ${path.relative(outDir, to)}`);
        }
      } else if (/\.map$/i.test(entry.name) && isMapShaped(to)) {
        problems.push(`source map file: ${path.relative(outDir, to)}`);
      }
    }
  };
  walk(srcDir, outDir);
  return { stats, problems };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [srcDir, outDir] = process.argv.slice(2);
  if (!srcDir || !outDir) {
    console.error('usage: node scripts/strip-sourcemaps.mjs <build-dir> <out-dir>');
    process.exit(64);
  }
  if (!fs.existsSync(srcDir)) {
    console.error(`strip-sourcemaps: ${srcDir} does not exist`);
    process.exit(1);
  }
  if (fs.existsSync(outDir)) {
    console.error(`strip-sourcemaps: ${outDir} already exists`);
    process.exit(1);
  }
  const { stats, problems } = stripSourceMaps(srcDir, outDir);
  if (problems.length > 0) {
    console.error(`strip-sourcemaps: source maps remain in ${outDir}:`);
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log(
    `strip-sourcemaps: ${stats.files} files, ${stats.skippedMaps} maps skipped, ${stats.stripped} comments removed`,
  );
}
