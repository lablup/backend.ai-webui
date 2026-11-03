#!/usr/bin/env node
/**
 * Copy a web build without its source maps (#10820).
 *
 * Usage: node scripts/strip-sourcemaps.mjs <build-dir> <out-dir>
 *
 * Leaves out *.js.map / *.css.map and any other map-shaped *.map file, removes
 * the trailing sourceMappingURL comments of JS/CSS files, then fails if an
 * inline `data:` map is still in comment position.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_MAP_FILE = /\.(?:[cm]?js|css)\.map$/i;
const SCRIPT_OR_STYLE = /\.(?:[cm]?js|css)$/i;
const INLINE_MAP_SCAN = /\.(?:[cm]?js|css|html?)$/i;
const MAP_COMMENT_START = /^(?:\/\/|\/\*)[#@][ \t]*sourceMappingURL=/;
const MAP_URL = /^[^\s'"`]*$/;
// A comment start after code or at a line start; a quoted string does not match.
const INLINE_MAP = /(?:^|[;})\s])(?:\/\/|\/\*)[#@][ \t]*sourceMappingURL=data:/m;

// Where the trailing sourceMappingURL comment of `text` starts, or -1.
// String scanning instead of one regex, which backtracks exponentially here.
function trailingMapCommentStart(text) {
  if (text.endsWith('*/')) {
    const start = text.lastIndexOf('/*');
    const comment = text.slice(start);
    return start >= 0 &&
      comment.indexOf('*/') === comment.length - 2 &&
      MAP_COMMENT_START.test(comment)
      ? start
      : -1;
  }
  const lineStart = text.lastIndexOf('\n') + 1;
  const line = text.slice(lineStart);
  const url = line.lastIndexOf('sourceMappingURL=');
  if (url < 0 || !MAP_URL.test(line.slice(url + 'sourceMappingURL='.length))) {
    return -1;
  }
  let start = url;
  while (start > 0 && (line[start - 1] === ' ' || line[start - 1] === '\t')) {
    start--;
  }
  start -= 3;
  return start >= 0 && MAP_COMMENT_START.test(line.slice(start))
    ? lineStart + start
    : -1;
}

// Only the run of comments at the very end of a file — the place bundlers put
// them — so a string that merely contains the text is left alone.
export function stripTrailingSourceMapComments(text) {
  if (!text.includes('sourceMappingURL')) return { text, removed: 0 };
  let rest = text.trimEnd();
  let removed = 0;
  for (let start; (start = trailingMapCommentStart(rest)) >= 0; removed++) {
    rest = rest.slice(0, start).trimEnd();
  }
  return removed > 0 ? { text: `${rest}\n`, removed } : { text, removed };
}

function isMapShaped(file) {
  try {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    return typeof json?.mappings === 'string' && Array.isArray(json?.sources);
  } catch {
    return false;
  }
}

function isSourceMap(file) {
  if (!/\.map$/i.test(file) || !fs.lstatSync(file).isFile()) return false;
  return SOURCE_MAP_FILE.test(file) || isMapShaped(file);
}

export function stripSourceMaps(srcDir, outDir) {
  const stats = { skippedMaps: 0, strippedFiles: 0, removedComments: 0 };
  const problems = [];
  fs.cpSync(srcDir, outDir, {
    recursive: true,
    preserveTimestamps: true,
    verbatimSymlinks: true,
    filter: (src) => {
      if (!isSourceMap(src)) return true;
      stats.skippedMaps++;
      return false;
    },
  });
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      if (!entry.isFile() || !INLINE_MAP_SCAN.test(entry.name)) continue;
      const bytes = fs.readFileSync(file);
      if (!bytes.includes('sourceMappingURL')) continue;
      let text = bytes.toString('utf8');
      if (SCRIPT_OR_STYLE.test(entry.name)) {
        const result = stripTrailingSourceMapComments(text);
        if (result.removed > 0) {
          const { atime, mtime } = fs.statSync(file);
          fs.writeFileSync(file, result.text);
          fs.utimesSync(file, atime, mtime);
          stats.strippedFiles++;
          stats.removedComments += result.removed;
          text = result.text;
        }
      }
      if (INLINE_MAP.test(text)) {
        problems.push(`inline source map: ${path.relative(outDir, file)}`);
      }
    }
  };
  walk(outDir);
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
    `strip-sourcemaps: ${stats.skippedMaps} maps left out, ${stats.removedComments} comments removed from ${stats.strippedFiles} files`,
  );
}
