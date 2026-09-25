#!/usr/bin/env node
/**
 * Initial-load bundle budget (ADR 0009).
 *
 * Sums the gzip size of everything react/build/index.html loads before any
 * lazy import runs — the entry script, its static imports, and the entry CSS —
 * and compares it with scripts/bundle-budget.json.
 *
 *   node scripts/check-bundle-budget.mjs           # check (exit 1 over budget)
 *   node scripts/check-bundle-budget.mjs --update  # ratchet the budget down
 *
 * Run after `pnpm run build:react-only`.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = join(root, 'react/build');
const budgetPath = join(root, 'scripts/bundle-budget.json');

const html = readFileSync(join(buildDir, 'index.html'), 'utf8');
const initial = new Set();
for (const [, src] of html.matchAll(
  /<script[^>]*type="module"[^>]*src="\/?(assets\/[^"]+\.js)"/g,
)) {
  initial.add(src);
}
for (const [, href] of html.matchAll(
  /<link[^>]*rel="(?:stylesheet|modulepreload)"[^>]*href="\/?(assets\/[^"]+)"/g,
)) {
  initial.add(href);
}
if (![...initial].some((f) => f.endsWith('.js'))) {
  console.error('No entry script found in react/build/index.html.');
  process.exit(2);
}

// Static imports of the entry load before first render too; dynamic ones do not.
const queue = [...initial].filter((f) => f.endsWith('.js'));
while (queue.length) {
  const file = queue.pop();
  const code = readFileSync(join(buildDir, file), 'utf8');
  for (const [, spec] of code.matchAll(
    /(?:^|[;}\n])\s*import\s*(?:[^'"()]*?\bfrom\s*)?["']\.\/([^"']+\.js)["']/g,
  )) {
    const dep = join(dirname(file), spec);
    if (!initial.has(dep) && existsSync(join(buildDir, dep))) {
      initial.add(dep);
      queue.push(dep);
    }
  }
}

const rows = [...initial].sort().map((file) => {
  const buf = readFileSync(join(buildDir, file));
  return { file, raw: buf.length, gzip: gzipSync(buf, { level: 9 }).length };
});
const total = rows.reduce((sum, r) => sum + r.gzip, 0);
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

for (const r of rows) {
  console.log(`${kb(r.gzip).padStart(10)} gzip  ${kb(r.raw).padStart(10)} raw  ${r.file}`);
}

const budget = JSON.parse(readFileSync(budgetPath, 'utf8'));
const limit = budget.initialGzipBytes + budget.toleranceBytes;
console.log(
  `\ninitial load: ${kb(total)} gzip  (budget ${kb(budget.initialGzipBytes)} + tolerance ${kb(budget.toleranceBytes)})`,
);

if (process.argv.includes('--update')) {
  if (total < budget.initialGzipBytes) {
    budget.initialGzipBytes = total;
    writeFileSync(budgetPath, `${JSON.stringify(budget, null, 2)}\n`);
    console.log(`Budget lowered to ${kb(total)}.`);
  } else {
    console.log('Budget unchanged: --update only ever lowers it.');
  }
  process.exit(0);
}

if (total > limit) {
  console.error(
    `::error title=Bundle budget::Initial load is ${kb(total)} gzip, ${kb(total - budget.initialGzipBytes)} over the ${kb(budget.initialGzipBytes)} budget. ` +
      'Lazy-load what the first screen does not need, or raise scripts/bundle-budget.json in this PR with the reason.',
  );
  process.exit(1);
}
if (total < budget.initialGzipBytes - budget.toleranceBytes) {
  console.log(
    `::notice title=Bundle budget::${kb(budget.initialGzipBytes - total)} under budget — run with --update and commit to lock the gain in.`,
  );
}
