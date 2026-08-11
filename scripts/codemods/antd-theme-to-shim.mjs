#!/usr/bin/env node
/**
 * antd-theme-to-shim.mjs — rewrite `import { theme } from 'antd'` to the
 * Astryx-backed theme shim. Scans both react/src (shim entry:
 * react/src/theme-shim, a re-export) and packages/backend.ai-ui/src (shim
 * core: packages/backend.ai-ui/src/theme-shim) — see TARGETS below.
 *
 * Part of the antd->Astryx migration toolkit (to-astryx ticket 03; applied at
 * scale by the Phase 1 mechanical-bucket tickets). Measured on the ticket-06
 * spike: one pass rewrote 218 files with zero hand edits and zero tsc errors.
 *
 *   node scripts/codemods/antd-theme-to-shim.mjs [--apply] [--only <substr>] [--list]
 *
 *   (no flags)   dry run — print what would be rewritten
 *   --apply      write the changes
 *   --only <s>   restrict to paths containing substring <s>
 *                (used to expand page-by-page, e.g. --only LoginFormPanel)
 *   --list       also print every touched file
 *
 * Handles the two import shapes found in the repo:
 *   import { theme } from 'antd';                 -> single rewrite
 *   import { Button, theme, type X } from 'antd'; -> split into two imports
 *
 * Files using antd's theme-ALGORITHM surface (theme.darkAlgorithm /
 * defaultAlgorithm / compactAlgorithm / getDesignToken) are token PRODUCERS
 * (the ConfigProvider layer), not consumers — they are skipped and reported;
 * they belong to the ConfigProvider-replacement ticket.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

const ROOT = process.cwd();
const APPLY = process.argv.includes('--apply');
const onlyIdx = process.argv.indexOf('--only');
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;

/**
 * Each scan root pairs with the shim directory its files should import.
 * - react/src files import react/src/theme-shim (a re-export of the BUI core
 *   since ticket 10).
 * - BUI files import the shim core directly (BUI is a separate workspace
 *   package; a `backend.ai-ui` self-import would be circular).
 */
const TARGETS = [
  { scanRoot: 'react/src', shimDir: 'react/src/theme-shim' },
  {
    scanRoot: 'packages/backend.ai-ui/src',
    shimDir: 'packages/backend.ai-ui/src/theme-shim',
  },
];

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === '__generated__' || e === 'node_modules' || e === 'theme-shim')
      continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e) && !/\.test\.tsx?$/.test(e)) out.push(p);
  }
  return out;
}

const IMPORT_RE = /import\s*\{([^}]*)\}\s*from\s*'antd';?/g;

const skippedProviders = [];
let changed = 0;
let split = 0;
const touched = [];

for (const target of TARGETS) {
  const shimDir = join(ROOT, target.shimDir);
  for (const abs of walk(join(ROOT, target.scanRoot))) {
    if (ONLY && !abs.includes(ONLY)) continue;
    const src = readFileSync(abs, 'utf8');
    if (!/\btheme\b/.test(src)) continue;
    if (
      /\btheme\.(darkAlgorithm|defaultAlgorithm|compactAlgorithm|getDesignToken)\b/.test(
        src,
      )
    ) {
      skippedProviders.push(relative(ROOT, abs));
      continue;
    }

    let hit = false;
    const next = src.replace(IMPORT_RE, (full, inner) => {
      const specs = inner
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const themeIdx = specs.findIndex((s) => s === 'theme');
      if (themeIdx === -1) return full;
      hit = true;
      const rest = specs.filter((_, i) => i !== themeIdx);
      let rel = relative(dirname(abs), shimDir).replace(/\\/g, '/');
      if (!rel.startsWith('.')) rel = './' + rel;
      const shimImport = `import { theme } from '${rel}';`;
      if (rest.length === 0) return shimImport;
      split++;
      return `import { ${rest.join(', ')} } from 'antd';\n${shimImport}`;
    });

    if (hit) {
      changed++;
      touched.push(relative(ROOT, abs));
      if (APPLY) writeFileSync(abs, next);
    }
  }
}

console.log(
  `${APPLY ? 'rewrote' : 'would rewrite'} ${changed} files (${split} needed an import split)`,
);
if (skippedProviders.length)
  console.log(
    `skipped ${skippedProviders.length} theme-ALGORITHM files (ConfigProvider layer):\n  ` +
      skippedProviders.join('\n  '),
  );
if (process.argv.includes('--list'))
  touched.forEach((f) => console.log('  ' + f));
