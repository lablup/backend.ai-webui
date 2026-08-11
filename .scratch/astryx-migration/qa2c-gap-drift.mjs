/**
 * qa2-c gap-drift audit.
 *
 * `BAIFlex gap="lg"` resolves through the antd/shim size ladder (lg = 24px).
 * Astryx `HStack/VStack/Stack gap={N}` resolves through `--spacing-N`, which
 * is N*4px. The two ladders are NOT ordinally aligned, so a conversion that
 * mapped by rung position instead of by pixel value silently shifts spacing.
 *
 * This script extracts, per file, the ordered list of resolved gap pixels in
 * `origin/main` and in the working tree, and reports files whose sequences
 * differ.
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

// BAIFlex named gap -> px (antd size ladder; see theme-shim/mapping.ts).
const BAIFLEX_GAP_PX = {
  xxs: 4,
  xs: 8,
  sm: 12,
  ms: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const STACK_TAGS = new Set(['HStack', 'VStack', 'Stack']);
const FLEX_TAGS = new Set(['BAIFlex']);

/** Collect `{tag, gap}` pairs by walking opening tags and their attributes. */
function collect(src) {
  const out = [];
  const tagRe = /<(BAIFlex|HStack|VStack|Stack)\b/g;
  let m;
  while ((m = tagRe.exec(src))) {
    const tag = m[1];
    // Scan forward to the end of the opening tag, tracking brace depth so
    // `style={{...}}` and expression attrs don't terminate it early.
    let i = tagRe.lastIndex;
    let depth = 0;
    let end = -1;
    while (i < src.length) {
      const c = src[i];
      if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === '>' && depth === 0) {
        end = i;
        break;
      }
      i++;
    }
    if (end < 0) continue;
    const attrs = src.slice(tagRe.lastIndex, end);
    const g =
      /\bgap=\{?['"]([a-z]+)['"]\}?/.exec(attrs) ??
      /\bgap=\{([0-9.]+)\}/.exec(attrs) ??
      /\bgap=\{\[/.exec(attrs);
    let px;
    if (!g) {
      px = 0; // no gap prop -> flex default 0 for both libraries
    } else if (g[1] === undefined) {
      px = 'ARRAY';
    } else if (/^[0-9.]+$/.test(g[1])) {
      const n = parseFloat(g[1]);
      px = FLEX_TAGS.has(tag) ? n : n * 4; // BAIFlex number = px; Stack = step
    } else {
      px = STACK_TAGS.has(tag) ? `NAMED(${g[1]})` : (BAIFLEX_GAP_PX[g[1]] ?? `?${g[1]}`);
    }
    out.push(px);
  }
  return out;
}

const files = execSync(
  "git diff --name-only origin/main...HEAD -- react/src packages/backend.ai-ui/src | grep -v __generated__ | grep -E '\\.tsx?$'",
  { encoding: 'utf8', maxBuffer: 1 << 28 },
)
  .split('\n')
  .filter(Boolean);

let flagged = 0;
for (const f of files) {
  let oldSrc;
  try {
    oldSrc = execSync(`git show origin/main:${f}`, {
      encoding: 'utf8',
      maxBuffer: 1 << 28,
    });
  } catch {
    continue; // new file, nothing to compare
  }
  if (!existsSync(f)) continue;
  const newSrc = readFileSync(f, 'utf8');
  const a = collect(oldSrc);
  const b = collect(newSrc);
  // Compare as multisets: reordering is a refactor, value change is drift.
  const key = (arr) => JSON.stringify(arr.slice().sort());
  if (key(a) === key(b)) continue;
  // Report the pixel histogram delta only.
  const hist = (arr) =>
    arr.reduce((acc, v) => ((acc[v] = (acc[v] ?? 0) + 1), acc), {});
  const ha = hist(a);
  const hb = hist(b);
  const keys = [...new Set([...Object.keys(ha), ...Object.keys(hb)])].sort();
  const delta = keys
    .filter((k) => (ha[k] ?? 0) !== (hb[k] ?? 0))
    .map((k) => `${k}px: ${ha[k] ?? 0} -> ${hb[k] ?? 0}`);
  if (!delta.length) continue;
  flagged++;
  console.log(`###### ${f}`);
  console.log('   ' + delta.join('\n   '));
}
console.log(`\n=== ${flagged} files with gap-histogram drift (of ${files.length}) ===`);
