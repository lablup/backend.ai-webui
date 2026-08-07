#!/usr/bin/env node
/**
 * antd-icons-to-lucide.mjs — rewrite `@ant-design/icons` imports to
 * lucide-react (glyphs), the BUI iconShim (`Icon` / `CustomIconComponentProps`,
 * P16), or own-SVG BAI*Icon components (brand glyphs lucide 1.x dropped).
 *
 * Part of the antd->Astryx migration toolkit (to-astryx ticket 07; applied at
 * scale by ticket 12). Mapping source of truth:
 * scripts/codemods/antd-icons-to-lucide.map.json — 100% of the icon names
 * measured in this repo (97 glyphs + Icon + CustomIconComponentProps).
 *
 *   node scripts/codemods/antd-icons-to-lucide.mjs [--apply] [--only <substr>] [--list]
 *
 *   (no flags)   dry run — print what would be rewritten
 *   --apply      write the changes. Run
 *                `pnpm exec prettier --write <touched files>` afterwards —
 *                the sort-imports prettier plugin re-orders the rewritten
 *                import lines, and pre-commit format checks are strict.
 *   --only <s>   restrict to paths containing substring <s>
 *                (used to expand directory-by-directory, e.g. --only icons/)
 *   --list       also print every touched file
 *
 * What it does per file:
 *   1. `import Icon from '@ant-design/icons'`            -> iconShim (relative)
 *   2. `import { CustomIconComponentProps } from
 *      '@ant-design/icons/lib/components/Icon'`          -> iconShim (relative)
 *   3. `import { AOutlined, BFilled } from '@ant-design/icons'`
 *      -> `import { LucideA, LucideB } from 'lucide-react'` (+ separate
 *      `backend.ai-ui` import for own-SVG glyphs), then renames every
 *      identifier usage (word-boundary) in the file body.
 *   4. JSX sizing: antd icons render at 1em; lucide defaults to 24px. Every
 *      renamed JSX element gets `size="1em"` unless it already sets size
 *      (PILOT-DECISION: mechanical 1em keeps inline layout; Astryx-hosted
 *      call sites can drop it in ticket 12).
 *   5. `spin` prop (antd-only) -> `className="anticon-spin"` (keyframes ship
 *      with fix_antd.css and the iconShim's injected styles).
 *
 * What it flags instead of rewriting (manual attention for ticket 12):
 *   - `rotate` / `twoToneColor` props on converted glyphs (no lucide twin)
 *   - a target lucide name that already exists in the file from a non-lucide
 *     source (identifier collision — file is skipped, reported)
 *   - shim-needing imports outside packages/backend.ai-ui (the shim is not
 *     exported from the BUI barrel; none exist today)
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

const ROOT = process.cwd();
const APPLY = process.argv.includes('--apply');
const onlyIdx = process.argv.indexOf('--only');
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;

const MAP = JSON.parse(
  readFileSync(join(ROOT, 'scripts/codemods/antd-icons-to-lucide.map.json')),
);
const GLYPHS = MAP.glyphs;
const SHIM_ABS = join(ROOT, 'packages/backend.ai-ui/src/icons/iconShim');
const BUI_SRC = join(ROOT, 'packages/backend.ai-ui/src');
const SCAN_ROOTS = [join(ROOT, 'react/src'), BUI_SRC];

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === '__generated__' || e === 'node_modules') continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e) && !/\.test\.tsx?$/.test(e)) out.push(p);
  }
  return out;
}

function relSpecifier(fromFile, toAbs) {
  let rel = relative(dirname(fromFile), toAbs).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

const DEFAULT_ICON_RE =
  /import\s+Icon\s*(?:,\s*\{([^}]*)\})?\s*from\s*'@ant-design\/icons';?/g;
const CUSTOM_PROPS_RE =
  /import\s+(type\s+)?\{([^}]*)\}\s*from\s*'@ant-design\/icons\/lib\/components\/Icon';?/g;
const NAMED_RE = /import\s+(type\s+)?\{([^}]*)\}\s*from\s*'@ant-design\/icons';?/g;

let changed = 0;
const touched = [];
const skipped = [];
const flags = [];

for (const abs of SCAN_ROOTS.flatMap((r) => walk(r))) {
  if (ONLY && !abs.includes(ONLY)) continue;
  const src = readFileSync(abs, 'utf8');
  if (!src.includes('@ant-design/icons')) continue;
  const relPath = relative(ROOT, abs);
  const inBui = abs.startsWith(BUI_SRC);

  let next = src;
  let hit = false;
  const renames = []; // [antdName, lucideName]
  const buiImports = []; // own-SVG components to import from backend.ai-ui
  let fileSkipped = false;

  // -- named glyph imports from '@ant-design/icons' ------------------------
  next = next.replace(NAMED_RE, (full, typeKw, inner) => {
    const specs = inner
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const lucideNames = [];
    const passThrough = [];
    for (const spec of specs) {
      const name = spec.replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim();
      const g = GLYPHS[name];
      if (!g) {
        // Unknown name (should not happen — map covers 100%); keep and flag.
        passThrough.push(spec);
        flags.push(`${relPath}: unmapped icon name '${name}' left on antd`);
        continue;
      }
      if (spec.includes(' as ')) {
        // Aliased import: local identifier is already custom — flag, keep.
        passThrough.push(spec);
        flags.push(`${relPath}: aliased import '${spec}' needs manual rewrite`);
        continue;
      }
      if (g.ownSvg) {
        buiImports.push(g.component);
        renames.push([name, g.component]);
        continue;
      }
      // Collision guard: target identifier already bound in this file from a
      // non-lucide source (import or declaration) — skip the whole file.
      // Import bindings sit before `from`; declarations bind the name right
      // after the keyword. (A looser `[^;]*`-only form also matched string
      // literals like t('button.Info') — 11 of the 12 ticket-07 skips were
      // that false positive; tightened in ticket 12.)
      const already =
        new RegExp(`import[^;]*\\b${g.lucide}\\b[^;]*from`).test(src) ||
        new RegExp(`\\b(?:const|let|var|function)\\s+${g.lucide}\\b`).test(src);
      const fromLucide = new RegExp(
        `import[^;]*\\b${g.lucide}\\b[^;]*from\\s*'lucide-react'`,
      ).test(src);
      if (already && !fromLucide) {
        skipped.push(`${relPath}: identifier '${g.lucide}' already bound`);
        fileSkipped = true;
        return full;
      }
      if (!fromLucide) lucideNames.push(g.lucide);
      renames.push([name, g.lucide]);
    }
    if (fileSkipped) return full;
    hit = true;
    const parts = [];
    if (passThrough.length)
      parts.push(
        `import ${typeKw || ''}{ ${passThrough.join(', ')} } from '@ant-design/icons';`,
      );
    if (lucideNames.length)
      parts.push(`import { ${lucideNames.join(', ')} } from 'lucide-react';`);
    if (buiImports.length)
      parts.push(
        inBui
          ? buiImports
              .map(
                (c) =>
                  `import ${c} from '${relSpecifier(abs, join(BUI_SRC, 'icons', c))}';`,
              )
              .join('\n')
          : `import { ${buiImports.join(', ')} } from 'backend.ai-ui';`,
      );
    return parts.join('\n');
  });
  if (fileSkipped) continue;

  // -- default `Icon` (+ optional named tail) ------------------------------
  next = next.replace(DEFAULT_ICON_RE, (full, namedTail) => {
    if (!inBui) {
      flags.push(`${relPath}: default Icon import outside BUI — shim not reachable`);
      return full;
    }
    hit = true;
    const shimImport = `import Icon from '${relSpecifier(abs, SHIM_ABS)}';`;
    return namedTail
      ? `${shimImport}\nimport { ${namedTail.trim()} } from '@ant-design/icons';`
      : shimImport;
  });

  // -- CustomIconComponentProps subpath ------------------------------------
  next = next.replace(CUSTOM_PROPS_RE, (full, typeKw, inner) => {
    if (!inBui) {
      flags.push(`${relPath}: CustomIconComponentProps outside BUI — shim not reachable`);
      return full;
    }
    hit = true;
    return `import ${typeKw || ''}{ ${inner.trim()} } from '${relSpecifier(abs, SHIM_ABS)}';`;
  });

  // -- merge the two shim imports (import/no-duplicates is an error) -------
  if (inBui) {
    const shimSpec = relSpecifier(abs, SHIM_ABS);
    const esc = shimSpec.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const defaultShim = new RegExp(`import\\s+Icon\\s+from\\s+'${esc}';\\n?`);
    const namedShim = new RegExp(
      `import\\s+(type\\s+)?\\{\\s*([^}]*?)\\s*\\}\\s+from\\s+'${esc}';`,
    );
    if (defaultShim.test(next) && namedShim.test(next)) {
      next = next.replace(defaultShim, '');
      next = next.replace(
        namedShim,
        (_, __, inner) => `import Icon, { ${inner} } from '${shimSpec}';`,
      );
    }
  }

  // -- rename identifier usages -------------------------------------------
  for (const [from, to] of renames) {
    next = next.replace(new RegExp(`\\b${from}\\b`, 'g'), to);
  }

  // -- JSX post-passes on renamed elements ---------------------------------
  for (const [, to] of renames) {
    if (GLYPHS.GithubOutlined?.component === to || GLYPHS.GitlabOutlined?.component === to)
      continue; // own-SVG components size themselves like antd (1em)
    // spin -> className="anticon-spin"
    next = next.replace(
      new RegExp(`<${to}(\\s[^>]*?)?\\sspin(\\s|/|>)`, 'g'),
      (m, attrs = '', tail) => {
        if (/className=/.test(attrs)) {
          flags.push(`${relPath}: <${to} spin> already has className — merge by hand`);
          return m;
        }
        return `<${to}${attrs || ''} className="anticon-spin"${tail}`;
      },
    );
    // 1em sizing for inline parity with antd (skip if size already set)
    next = next.replace(
      new RegExp(`<${to}(\\s[^>]*?)?\\s*(/?)>`, 'g'),
      (m, attrs, selfClose) => {
        if (/\bsize=/.test(attrs || '')) return m;
        const kept = (attrs || '').replace(/\s+$/, '');
        return `<${to}${kept} size="1em"${selfClose ? ' /' : ''}>`;
      },
    );
    // props with no lucide destination — flag, keep for manual pass
    if (new RegExp(`<${to}[^>]*\\brotate\\b`).test(next))
      flags.push(`${relPath}: <${to}> uses rotate — no lucide twin, handle manually`);
    if (new RegExp(`<${to}[^>]*\\btwoToneColor\\b`).test(next))
      flags.push(`${relPath}: <${to}> uses twoToneColor — dropped semantics, handle manually`);
  }

  if (hit) {
    changed++;
    touched.push(relPath);
    if (APPLY) writeFileSync(abs, next);
  }
}

console.log(
  `${APPLY ? 'rewrote' : 'would rewrite'} ${changed} files` +
    (ONLY ? ` (filtered by --only ${ONLY})` : ''),
);
if (skipped.length)
  console.log(`skipped ${skipped.length} files (identifier collisions):\n  ` + skipped.join('\n  '));
if (flags.length)
  console.log(`flags for manual attention (${flags.length}):\n  ` + flags.join('\n  '));
if (process.argv.includes('--list')) touched.forEach((f) => console.log('  ' + f));
