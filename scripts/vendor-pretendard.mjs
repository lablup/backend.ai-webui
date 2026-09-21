#!/usr/bin/env node
/**
 * Vendors Pretendard Variable (unicode-range dynamic subsets) into
 * resources/fonts/pretendard/ so Hangul renders from a self-hosted face.
 *
 *   node scripts/vendor-pretendard.mjs [--version 1.3.9]
 *
 * Re-run to bump the version; the directory is rebuilt from scratch.
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const versionIdx = args.indexOf('--version');
const VERSION = versionIdx >= 0 ? args[versionIdx + 1] : '1.3.9';
const FAMILY = 'Pretendard';
const BASE = `https://cdn.jsdelivr.net/npm/pretendard@${VERSION}/dist/web/variable`;
const LICENSE_URL = `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v${VERSION}/LICENSE`;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'resources', 'fonts', 'pretendard');

async function fetchOk(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res;
}

const css = await (await fetchOk(`${BASE}/pretendardvariable-dynamic-subset.css`)).text();
const blocks = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
if (blocks.length === 0) throw new Error('No @font-face blocks found in the upstream CSS');

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const rules = [];
let bytes = 0;
for (const block of blocks) {
  const url = block.match(/url\(([^)]+)\)/)?.[1].replace(/^['"]|['"]$/g, '');
  if (!url) throw new Error(`No url() in block:\n${block}`);
  const file = path.basename(url);
  const buf = Buffer.from(await (await fetchOk(`${BASE}/${url.replace(/^\.\//, '')}`)).arrayBuffer());
  await writeFile(path.join(outDir, file), buf);
  bytes += buf.byteLength;
  rules.push(
    block
      .replace(/font-family:\s*'[^']*'/, `font-family: '${FAMILY}'`)
      .replace(/src:\s*url\([^)]+\)\s*format\([^)]*\)/, `src: url(./${file}) format('woff2')`)
      .replace(/\t/g, '  '),
  );
}

await writeFile(path.join(outDir, 'OFL.txt'), await (await fetchOk(LICENSE_URL)).text());
const header = [
  `/* ${FAMILY} Variable ${VERSION} — vendored by scripts/vendor-pretendard.mjs from`,
  ` * ${BASE}/pretendardvariable-dynamic-subset.css. Do not edit by hand.`,
  ` * SIL Open Font License 1.1 — see OFL.txt. */`,
  '',
].join('\n');
await writeFile(path.join(outDir, 'pretendard.css'), `${header}\n${rules.join('\n\n')}\n`);
console.log(`vendored ${rules.length} slices (${(bytes / 1024).toFixed(0)} KiB) into ${path.relative(root, outDir)}`);
