#!/usr/bin/env node
/* Measure JSX props actually passed to a component across the repo (multi-line aware). */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const name = process.argv[2];
if (!name) {
  console.error('usage: w2d-props.mjs <ComponentName>');
  process.exit(1);
}
const files = execSync(
  `grep -rl "<${name}" react/src packages/backend.ai-ui/src --include=*.tsx --include=*.ts || true`,
  { encoding: 'utf8' },
)
  .split('\n')
  .filter(Boolean);

const counts = new Map();
const sites = [];
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const re = new RegExp(`<${name}(?![A-Za-z0-9_])`, 'g');
  let m;
  while ((m = re.exec(src))) {
    // find the end of the opening tag, respecting braces/strings roughly
    let i = m.index + m[0].length;
    let depth = 0;
    let out = '';
    while (i < src.length) {
      const c = src[i];
      if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (depth === 0 && c === '>') break;
      out += c;
      i++;
    }
    sites.push({ file: f, attrs: out });
    // top-level attribute names
    let d = 0;
    let token = '';
    const seen = [];
    for (let k = 0; k < out.length; k++) {
      const c = out[k];
      if (c === '{') d++;
      if (c === '}') d--;
      if (d === 0) {
        if (/[A-Za-z0-9_$:.-]/.test(c)) token += c;
        else {
          if (token) seen.push(token);
          token = '';
        }
      } else token = '';
    }
    if (token) seen.push(token);
    // an attr name is a token followed by '=' or standing alone
    const attrRe = /(^|\s)([A-Za-z][A-Za-z0-9_$:.-]*)(?=(=|\s|$))/g;
    let a;
    const flat = out.replace(/\{[^]*?\}/g, '{}');
    while ((a = attrRe.exec(flat))) {
      counts.set(a[2], (counts.get(a[2]) || 0) + 1);
    }
  }
}
console.log(`${name}: ${sites.length} call sites in ${files.length} files`);
console.log(
  [...counts.entries()]
    .sort((x, y) => y[1] - x[1])
    .map(([k, v]) => `  ${v}\t${k}`)
    .join('\n'),
);
if (process.argv[3] === '--sites') {
  for (const s of sites) console.log(`--- ${s.file}\n<${name}${s.attrs}>`);
}
