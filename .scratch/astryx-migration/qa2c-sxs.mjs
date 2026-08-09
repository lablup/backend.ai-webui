/**
 * qa2-c side-by-side layout-container extraction.
 *
 * Prints, per file, every layout container opening tag with its gap/padding
 * resolved to pixels — legacy (origin/main) on the left, working tree on the
 * right — so a reviewer can align them by nesting order.
 *
 * Ladders:
 *   BAIFlex  gap="lg"  -> antd size ladder  (lg = 24px)
 *   Stack    gap={6}   -> --spacing-6       (6 * 4 = 24px)
 * They are NOT ordinally aligned; mapping by rung position shifts spacing.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const FLEX_PX = { xxs: 4, xs: 8, sm: 12, ms: 16, md: 20, lg: 24, xl: 32, xxl: 48 };
const TAGS = 'BAIFlex|HStack|VStack|Stack|Card|BAICard|LayoutContent|LayoutPanel|Grid';

function scan(src) {
  const out = [];
  const re = new RegExp(`<(${TAGS})(?=[\\s/>])`, 'g');
  let m;
  while ((m = re.exec(src))) {
    const tag = m[1];
    let i = re.lastIndex,
      depth = 0,
      end = -1;
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
    const attrs = src.slice(re.lastIndex, end).replace(/\s+/g, ' ').trim();
    const isStack = /^(HStack|VStack|Stack)$/.test(tag);

    const named = /\bgap=\{?['"]([a-z]+)['"]\}?/.exec(attrs);
    const num = /\bgap=\{([0-9.]+)\}/.exec(attrs);
    let gap = '-';
    if (named) gap = isStack ? `?${named[1]}` : `${FLEX_PX[named[1]] ?? '?'}px`;
    else if (num)
      gap = isStack ? `${parseFloat(num[1]) * 4}px` : `${num[1]}px`;
    else if (/\bgap=/.test(attrs)) gap = 'expr';

    const pnum = /\bpadding=\{([0-9.]+)\}/.exec(attrs);
    let pad = '';
    if (pnum) pad = ` pad=${parseFloat(pnum[1]) * 4}px`;
    else if (/\bpadding=/.test(attrs)) pad = ' pad=expr';

    const dir = /\bdirection="(\w+)"/.exec(attrs);
    const d = isStack
      ? tag === 'HStack'
        ? 'row'
        : tag === 'VStack'
          ? 'col'
          : (dir?.[1] ?? 'col')
      : (dir?.[1] ?? 'row');

    const line = src.slice(0, m.index).split('\n').length;
    out.push(`L${String(line).padStart(4)} <${tag}> ${d} gap=${gap}${pad}`);
  }
  return out;
}

const files = process.argv.slice(2);
for (const f of files) {
  let oldSrc;
  try {
    oldSrc = execSync(`git show origin/main:${f}`, {
      encoding: 'utf8',
      maxBuffer: 1 << 28,
    });
  } catch {
    console.log(`###### ${f}  (new file)`);
    continue;
  }
  const a = scan(oldSrc);
  const b = scan(readFileSync(f, 'utf8'));
  console.log(`###### ${f}`);
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const L = (a[i] ?? '').padEnd(46);
    const R = b[i] ?? '';
    const same =
      (a[i] ?? '').replace(/^L\s*\d+ /, '') ===
      (b[i] ?? '').replace(/^L\s*\d+ /, '');
    console.log(`  ${same ? ' ' : '!'} ${L} | ${R}`);
  }
  console.log();
}
