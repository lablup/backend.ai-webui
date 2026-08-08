#!/usr/bin/env node
/**
 * antd-form-to-engine.mjs — repoint every `Form` import from antd onto the
 * self-hosted form engine (to-astryx ticket 34; engine in
 * packages/backend.ai-ui/src/form-engine, built in this ticket).
 *
 *   node scripts/codemods/antd-form-to-engine.mjs [--apply] [--only <substr>] [--list]
 *
 *   (no flags)   dry run — print what would be rewritten
 *   --apply      write the changes
 *   --only <s>   restrict to paths containing substring <s>
 *   --list       also print every touched file
 *
 * The engine is a DROP-IN: `Form.Item`, `Form.List`, `Form.ErrorList`,
 * `Form.Provider`, `Form.useForm`, `Form.useWatch`, `Form.useFormInstance` and
 * `Form.Item.useStatus` all exist with the same semantics (pinned by the 29
 * acceptance tests in react/src/form-engine/formEngineAcceptance.test.tsx), so
 * NOTHING but the import line changes. If this codemod ever produces a diff
 * outside an import statement, that is a bug in the codemod.
 *
 * Two scan roots, mirroring the ticket-11 App shim:
 *   - react/src              -> react/src/form-engine            (a re-export)
 *   - packages/backend.ai-ui -> .../src/form-engine              (the engine)
 * BUI cannot import `backend.ai-ui` from inside itself, hence the split.
 *
 * Sources rewritten:
 *   'antd'                 -> Form, FormInstance, FormItemProps, FormProps,
 *                             Rule, RuleObject, RuleRender, NamePath,
 *                             ValidateErrorEntity
 *   'antd/es/form'         -> RuleObject, RuleRender  (deep type import)
 *   'antd/lib/form'        -> FormListProps           (deep type import)
 *   'antd/lib'             -> the same names as 'antd' (antd's root alias)
 *   'antd/es/form/context' -> FormItemInputContext, NoStyleItemContext
 *                             (deep VALUE imports — the unstable coupling
 *                              answers/08 §3 flagged; it disappears here)
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

const ROOT = process.cwd();
const APPLY = process.argv.includes('--apply');
const onlyIdx = process.argv.indexOf('--only');
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;

const TARGETS = [
  { scanRoot: 'react/src', engineDir: 'react/src/form-engine' },
  {
    scanRoot: 'packages/backend.ai-ui/src',
    engineDir: 'packages/backend.ai-ui/src/form-engine',
  },
];

/** Which specifiers move, per source module. */
const MOVES = {
  antd: new Set([
    'Form',
    'FormInstance',
    'FormItemProps',
    'FormProps',
    'Rule',
    'RuleObject',
    'RuleRender',
    'NamePath',
    'ValidateErrorEntity',
  ]),
  'antd/es/form': new Set(['RuleObject', 'RuleRender', 'FormInstance', 'Rule']),
  'antd/lib/form': new Set(['FormListProps', 'FormInstance', 'RuleObject']),
  // `antd/lib` is antd's own root re-export; only the form names move, so
  // `GetRef` (used for Select refs) is left where it is.
  'antd/lib': new Set([
    'Form',
    'FormInstance',
    'FormItemProps',
    'FormProps',
    'Rule',
    'RuleObject',
    'RuleRender',
    'NamePath',
  ]),
  'antd/es/form/context': new Set(['FormItemInputContext', 'NoStyleItemContext']),
};

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === '__generated__' || entry === 'node_modules' || entry === 'form-engine')
      continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(entry)) out.push(p);
  }
  return out;
}

/**
 * Split one import statement's specifier list into the ones that move and the
 * ones that stay. `type` modifiers travel with their specifier; a statement-
 * level `import type` is re-applied to both halves.
 */
function splitSpecifiers(inner, moveSet) {
  const specs = inner
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const moving = [];
  const staying = [];
  for (const spec of specs) {
    // `type Foo`, `Foo as Bar`, `type Foo as Bar`
    const name = spec.replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim();
    (moveSet.has(name) ? moving : staying).push(spec);
  }
  return { moving, staying };
}

function enginePathFrom(absFile, engineDirAbs) {
  let rel = relative(dirname(absFile), engineDirAbs).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

const touched = [];
let changed = 0;
let split = 0;

for (const target of TARGETS) {
  const engineDirAbs = join(ROOT, target.engineDir);
  for (const abs of walk(join(ROOT, target.scanRoot))) {
    if (ONLY && !abs.includes(ONLY)) continue;
    const src = readFileSync(abs, 'utf8');
    let next = src;
    let hit = false;
    const enginePath = enginePathFrom(abs, engineDirAbs);

    for (const [source, moveSet] of Object.entries(MOVES)) {
      const re = new RegExp(
        `import\\s+(type\\s+)?\\{([^}]*)\\}\\s*from\\s*'${source.replace(/\//g, '\\/')}';?`,
        'g',
      );
      next = next.replace(re, (full, typeKeyword, inner) => {
        const { moving, staying } = splitSpecifiers(inner, moveSet);
        if (!moving.length) return full;
        hit = true;
        const prefix = typeKeyword ? 'import type' : 'import';
        const engineImport = `${prefix} { ${moving.join(', ')} } from '${enginePath}';`;
        if (!staying.length) return engineImport;
        split++;
        return `${prefix} { ${staying.join(', ')} } from '${source}';\n${engineImport}`;
      });
    }

    if (hit && next !== src) {
      changed++;
      touched.push(relative(ROOT, abs));
      if (APPLY) writeFileSync(abs, next);
    }
  }
}

console.log(
  `${APPLY ? 'rewrote' : 'would rewrite'} ${changed} files (${split} needed an import split)`,
);
if (process.argv.includes('--list')) touched.forEach((f) => console.log('  ' + f));
