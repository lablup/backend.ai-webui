#!/usr/bin/env node
/**
 * antd-app-to-shim.mjs — rewrite `import { App } from 'antd'` to the
 * Astryx-backed App.useApp() shim (to-astryx ticket 11; shim built in
 * ticket 04, core moved to packages/backend.ai-ui/src/app-shim in this
 * ticket). Scans both react/src (shim entry: react/src/app-shim, a
 * re-export) and packages/backend.ai-ui/src (shim core) — see TARGETS.
 *
 *   node scripts/codemods/antd-app-to-shim.mjs [--apply] [--only <substr>] [--list]
 *
 *   (no flags)   dry run — print what would be rewritten
 *   --apply      write the changes
 *   --only <s>   restrict to paths containing substring <s>
 *   --list       also print every touched file
 *
 * Handles the two import shapes found in the repo:
 *   import { App } from 'antd';                 -> single rewrite
 *   import { App, Form, type X } from 'antd';   -> split into two imports
 *
 * Skipped and reported (translation frontier — must keep antd's App):
 *   - files that RENDER an antd `<App>` element (nested antd context
 *     providers for not-yet-converted subtrees: DefaultProviders,
 *     MainLayout, LoginView's SignupModal wrapper)
 *   - files using the `AppProps` type (provider-layer config plumbing)
 *   - files reading `.notification` off the app object — the notification
 *     leg is deliberately NOT part of the shim (it is isolated in
 *     useBAINotification.tsx and migrates on its own ticket; answers/07 §2)
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

const ROOT = process.cwd();
const APPLY = process.argv.includes('--apply');
const onlyIdx = process.argv.indexOf('--only');
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;

/**
 * Each scan root pairs with the shim directory its files should import.
 * - react/src files import react/src/app-shim (a re-export of the BUI core).
 * - BUI files import the shim core directly (BUI is a separate workspace
 *   package; a `backend.ai-ui` self-import would be circular).
 */
const TARGETS = [
  { scanRoot: 'react/src', shimDir: 'react/src/app-shim' },
  {
    scanRoot: 'packages/backend.ai-ui/src',
    shimDir: 'packages/backend.ai-ui/src/app-shim',
  },
];

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === '__generated__' || e === 'node_modules' || e === 'app-shim')
      continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e) && !/\.test\.tsx?$/.test(e)) out.push(p);
  }
  return out;
}

const IMPORT_RE = /import\s*\{([^}]*)\}\s*from\s*'antd';?/g;

const skippedFrontier = [];
let changed = 0;
let split = 0;
const touched = [];

for (const target of TARGETS) {
  const shimDir = join(ROOT, target.shimDir);
  for (const abs of walk(join(ROOT, target.scanRoot))) {
    if (ONLY && !abs.includes(ONLY)) continue;
    const src = readFileSync(abs, 'utf8');
    if (!/\bApp\b/.test(src)) continue;

    // Frontier detection — see header comment.
    if (
      /<App[\s>/]/.test(src) ||
      /\bAppProps\b/.test(src) ||
      /\bapp\.notification\b/.test(src)
    ) {
      // Only report files that actually import App from antd.
      if (/import\s*\{[^}]*\bApp\b[^}]*\}\s*from\s*'antd'/.test(src))
        skippedFrontier.push(relative(ROOT, abs));
      continue;
    }

    let hit = false;
    const next = src.replace(IMPORT_RE, (full, inner) => {
      const specs = inner
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const appIdx = specs.findIndex((s) => s === 'App');
      if (appIdx === -1) return full;
      hit = true;
      const rest = specs.filter((_, i) => i !== appIdx);
      let rel = relative(dirname(abs), shimDir).replace(/\\/g, '/');
      if (!rel.startsWith('.')) rel = './' + rel;
      const shimImport = `import { App } from '${rel}';`;
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
if (skippedFrontier.length)
  console.log(
    `skipped ${skippedFrontier.length} frontier files (nested antd <App> / AppProps / notification leg):\n  ` +
      skippedFrontier.join('\n  '),
  );
if (process.argv.includes('--list'))
  touched.forEach((f) => console.log('  ' + f));
