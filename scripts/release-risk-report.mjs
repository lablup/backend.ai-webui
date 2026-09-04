#!/usr/bin/env node
// @ts-check
/**
 * release-risk-report.mjs — build a QA checklist for a release range.
 *
 * Read-only. Reads git history plus the tree at --to; writes only when --out is
 * given. Every check below maps to a rule this repo already enforces elsewhere,
 * so a finding is always actionable rather than advisory.
 *
 *   R1  UI change with no e2e change            -> needs a manual pass
 *   R2  new manager feature gate                -> needs a two-manager pass
 *   R3  i18n keys added but not translated      -> ships raw keys / English
 *   R4  destructive-flow file touched           -> re-verify the typed confirm
 *   R5  user-visible feat with no manual change -> docs gap
 *
 * Usage:
 *   node scripts/release-risk-report.mjs --from v26.8.1 [--to HEAD] [--out FILE] [--json]
 */

import { execFileSync } from 'node:child_process';
import { realpathSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const REC = '\x1e';
const FIELD = '\x1f';

/** Conventional-commit types that put user-visible behaviour into a release. */
const USER_FACING_TYPES = new Set(['feat', 'fix', 'style']);

/** Files whose names mark an irreversible flow (see rules/destructive-confirmation.md). */
const DESTRUCTIVE_NAME =
  /(Delete|DeleteForever|Purge|Terminate|Destroy|Revoke)/;

/** Each store is a flat directory of per-language files beside its own en.json. */
const LOCALE_STORES = [
  { dir: 'resources/i18n', source: 'resources/i18n/en.json' },
  {
    dir: 'packages/backend.ai-ui/src/locale',
    source: 'packages/backend.ai-ui/src/locale/en.json',
  },
];
// locale/astryx is deliberately absent: it is a translation-only overlay with no
// en.json source, so "keys added to the English source" is undefined there.

const PLACEHOLDER = '__NOT_TRANSLATED__';

function git(args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
}

/** A missing path at a ref is expected (files come and go); stay quiet about it. */
function gitOrNull(args) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

export function parseArgs(argv) {
  const out = { to: 'HEAD', json: false, out: null, from: null };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--from') out.from = argv[++i];
    else if (a === '--to') out.to = argv[++i];
    else if (a === '--out') out.out = argv[++i];
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') out.help = true;
    else throw new Error(`unknown argument: ${a}`);
  }
  return out;
}

/**
 * `--from` has no default on purpose. No release tag is an ancestor of main here
 * (they live on the release branches), so an inferred base would silently report
 * a whole release when the caller meant their branch.
 */
function usage() {
  const latestTag =
    gitOrNull(['tag', '--sort=-creatordate'])?.split('\n')[0]?.trim() ||
    '<tag>';
  return [
    'Usage: node scripts/release-risk-report.mjs --from <ref> [--to <ref>] [--out <file>] [--json]',
    '',
    '  --from <ref>  required; --to defaults to HEAD',
    '',
    'No default is inferred for --from — pick the one that matches the question:',
    `  what is queued for the next release   --from ${latestTag}`,
    `  what a shipped release contained      --from <previous tag> --to ${latestTag}`,
    '  what my branch adds                   --from origin/main',
  ].join('\n');
}

/**
 * Where `to` forked from `from`. Diffing `from..to` directly would also report
 * what `from` changed since — harmless between release tags, wrong for a branch.
 */
function mergeBase(from, to) {
  return gitOrNull(['merge-base', from, to])?.trim() || from;
}

/** True when `to` forked before `from`, i.e. `from` moved on without it. */
function forkedEarly(from, base) {
  const resolved = gitOrNull(['rev-parse', `${from}^{commit}`])?.trim();
  return Boolean(resolved && base && resolved !== base);
}

/** One record per non-merge commit in from..to, with its changed files. */
function readCommits(from, to) {
  const raw = git([
    'log',
    '--no-merges',
    `--format=%H${FIELD}%s${FIELD}%b${REC}`,
    `${from}..${to}`,
  ]);
  return raw
    .split(REC)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [sha, subject, body = ''] = chunk.split(FIELD);
      const files = git(['show', '--pretty=format:', '--name-only', sha])
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      const pr = subject.match(/\(#(\d+)\)\s*$/)?.[1] ?? null;
      const typeMatch = subject.match(/^(\w+)(?:\(([^)]*)\))?:/);
      return {
        sha,
        subject,
        pr,
        type: typeMatch?.[1] ?? null,
        scope: typeMatch?.[2] ?? null,
        fr: (subject + body).match(/FR-\d+/)?.[0] ?? null,
        files,
      };
    });
}

const isGenerated = (f) => f.includes('__generated__');
const isTestLike = (f) => /\.(test|spec|stories)\.[tj]sx?$/.test(f);
// BUI component doc stubs are CLI-only, never imported by the library.
const isDocStub = (f) => /\.doc\.ts$/.test(f);

// Non-runtime corners of the BUI package; everything else under src/ ships.
const BUI_NON_RUNTIME =
  /^packages\/backend\.ai-ui\/src\/(__test__|tests|astryx-docs|locale)\//;

// Runtime UI is not only TypeScript: components import co-located styles and
// assets directly, so a style-only commit is still a UI change.
const UI_EXT = /\.(tsx?|css|scss|svg|png)$/;

export function classify(files) {
  const ui = files.filter(
    (f) =>
      !isGenerated(f) &&
      !isTestLike(f) &&
      !isDocStub(f) &&
      UI_EXT.test(f) &&
      (f.startsWith('react/src/') ||
        (f.startsWith('packages/backend.ai-ui/src/') &&
          !BUI_NON_RUNTIME.test(f))),
  );
  return {
    ui,
    // Executable tests only: e2e/ also holds docs and plans (e.g. the
    // coverage report), and touching those is not test coverage.
    e2e: files.filter(
      (f) => f.startsWith('e2e/') && /\.(spec|test)\.[tj]sx?$/.test(f),
    ),
    docs: files.filter((f) => f.startsWith('packages/backend.ai-webui-docs/')),
    i18n: files.filter(
      (f) =>
        f.startsWith('resources/i18n/') ||
        f.startsWith('packages/backend.ai-ui/src/locale/'),
    ),
    destructive: ui.filter((f) => DESTRUCTIVE_NAME.test(f.split('/').pop())),
  };
}

/**
 * The typed-confirm contract of rules/destructive-confirmation.md. A file can
 * host an irreversible flow without carrying an action word in its name
 * (ProjectPage.tsx holds a purge), so R4 also checks changed UI files' content.
 */
export function hasDestructiveContract(src) {
  return /BAIDeleteConfirmModal|requireConfirmInput/.test(src);
}

/**
 * Whether a diff's CHANGED lines reach destructive-flow logic — the confirm
 * components/props or a destructive action call — as opposed to incidental
 * edits (styling, layout) inside a file that merely hosts such a flow.
 */
export function diffTouchesDestructiveFlow(diff) {
  const changed = diff
    .split('\n')
    .filter(
      (l) =>
        (l.startsWith('+') || l.startsWith('-')) &&
        !l.startsWith('+++') &&
        !l.startsWith('---'),
    );
  return changed.some((l) =>
    /BAIDeleteConfirmModal|requireConfirmInput|confirmText|BAIPopconfirm|delete|purge|terminate|destroy|revoke/i.test(
      l,
    ),
  );
}

/**
 * The feature area a UI file belongs to, from its basename's leading word
 * (wrapper/role prefixes stripped): BAIUserNodes -> User,
 * AdminDeploymentPresetTable -> Deployment, VFolderNodesV2 -> VFolder.
 * Coarse on purpose — it feeds a "which existing features changed the most"
 * ranking, not a taxonomy.
 */
export function areaOf(file) {
  const base = file
    .split('/')
    .pop()
    .replace(/\.[^.]+$/, '');
  const m = base.replace(/^(BAI|Admin|Legacy)+/, '').match(/^[A-Z]+[a-z0-9]*/);
  return m ? m[0] : null;
}

/**
 * Existing-feature churn, ranked: user-facing commits grouped by the areas
 * their UI files belong to. `feat` commits are excluded — new features get
 * their own digest section straight from the commit list.
 */
export function computeHotspots(commits) {
  const areas = new Map();
  for (const c of commits) {
    if (c.type === 'feat' || !USER_FACING_TYPES.has(c.type ?? '')) continue;
    const seen = new Set();
    for (const f of c.classified.ui) {
      const area = areaOf(f);
      if (!area || seen.has(area)) continue;
      seen.add(area);
      if (!areas.has(area)) areas.set(area, { commits: 0, prs: [] });
      const a = areas.get(area);
      a.commits += 1;
      if (c.pr && a.prs.length < 5) a.prs.push(c.pr);
    }
  }
  return [...areas.entries()]
    .map(([area, a]) => ({ area, ...a }))
    .sort((x, y) => y.commits - x.commits);
}

function readFeatureVersionMap(ref) {
  const src = gitOrNull([
    'show',
    `${ref}:packages/backend.ai-client/src/client.ts`,
  ]);
  return src ? parseFeatureVersionMap(src) : new Map();
}

/**
 * Map every feature flag declared in client.ts to the version guard it sits
 * under, by walking `_updateSupportList` and tracking the enclosing condition.
 */
export function parseFeatureVersionMap(src) {
  const lines = src.split('\n');
  // The definition, not the call site in supports() that precedes it.
  const start = lines.findIndex((l) =>
    /^\s*(?:private\s+|public\s+)?_updateSupportList\s*\([^)]*\)\s*\{/.test(l),
  );
  if (start === -1) return new Map();

  const map = new Map();
  /** Guards currently in scope, innermost last. blockDepth = depth inside the block. */
  const guards = [];
  /** A guard whose opening brace prettier moved to a later line. */
  let pendingGuard = null;
  let depth = 0;
  let entered = false;

  for (let i = start; i < lines.length; i += 1) {
    const line = lines[i];
    const opens = (line.match(/\{/g) ?? []).length;
    const closes = (line.match(/\}/g) ?? []).length;
    const depthBefore = depth;

    const decl = readFeatureDeclaration(lines, i);
    if (decl) {
      const active = guards.filter((g) => g.blockDepth <= depthBefore);
      map.set(decl.key, {
        version: active.length ? active[active.length - 1].version : null,
        value: decl.value === 'true',
      });
    }

    // Accepts a single version or an array; an array's first entry is the
    // primary manager line and stands for the guard.
    const guard = line.match(
      /is(?:Manager|API)VersionCompatibleWith\(\s*\[?\s*'([^']+)'/,
    );
    if (guard) {
      if (opens > 0)
        guards.push({ version: guard[1], blockDepth: depthBefore + 1 });
      else pendingGuard = guard[1];
    } else if (pendingGuard && opens > 0) {
      guards.push({ version: pendingGuard, blockDepth: depthBefore + 1 });
      pendingGuard = null;
    }

    depth = depthBefore + opens - closes;
    if (!entered && depth > 0) entered = true;
    while (guards.length && guards[guards.length - 1].blockDepth > depth)
      guards.pop();
    if (entered && depth <= 0) break;
  }
  return map;
}

/**
 * Read one `_features[…] = true|false` anchored at line i. Prettier splits
 * long declarations three ways — key on its own line inside the brackets,
 * value on the line after `=` — so match against a small joined window
 * rather than the single line.
 */
function readFeatureDeclaration(lines, i) {
  if (!lines[i].includes('_features[')) return null;
  const window = lines.slice(i, i + 5).join(' ');
  const m = window.match(/_features\[\s*'([^']+)'\s*\]\s*=\s*(true|false)/);
  return m ? { key: m[1], value: m[2] } : null;
}

/** Feature flags whose declaration line was ADDED between from and to. */
function newFeatureFlags(from, to) {
  const diff = gitOrNull([
    'diff',
    '--unified=0',
    `${from}..${to}`,
    '--',
    'packages/backend.ai-client/src/client.ts',
  ]);
  if (!diff) return [];
  return extractAddedFeatureFlags(diff);
}

/**
 * Added `_features[…] = true`, in any of the shapes prettier emits — single
 * line, value wrapped, or key wrapped inside the brackets. Joins consecutive
 * ADDED lines only, so a declaration edited half-in-place (context lines
 * between the added ones) is out of scope for this heuristic.
 */
export function extractAddedFeatureFlags(diff) {
  const lines = diff
    .split('\n')
    .filter((l) => l.startsWith('+') && !l.startsWith('+++'))
    .map((l) => l.slice(1));
  const added = new Set();
  for (let i = 0; i < lines.length; i += 1) {
    if (!lines[i].includes('_features[')) continue;
    const window = lines.slice(i, i + 5).join(' ');
    const m = window.match(/_features\[\s*'([^']+)'\s*\]\s*=\s*(true|false)/);
    if (m && m[2] === 'true') added.add(m[1]);
  }
  return [...added];
}

/** Every supports('x') literal used in the app at ref. */
function usedFeatureFlags(ref) {
  const roots = [
    'react/src',
    'packages/backend.ai-ui/src',
    'src',
    'packages/backend.ai-client/src',
  ];
  const used = new Set();
  const listed = gitOrNull(['ls-tree', '-r', '--name-only', ref]);
  if (!listed) return used;
  const files = listed.split('\n').filter(
    (f) =>
      /\.(tsx?|jsx?)$/.test(f) &&
      !isGenerated(f) &&
      // Runtime code only: a supports() inside a test, story, doc stub, or
      // docs dir must not mark a gate as live in the app.
      !isTestLike(f) &&
      !isDocStub(f) &&
      !BUI_NON_RUNTIME.test(f) &&
      roots.some((r) => f.startsWith(`${r}/`)),
  );
  for (const f of files) {
    const src = gitOrNull(['show', `${ref}:${f}`]);
    if (src) for (const flag of extractSupportsUsages(src)) used.add(flag);
  }
  return used;
}

/**
 * Fields and enum values ADDED to schema.graphql in the diff, each with the
 * manager version its docstring declares ("Added in X.Y.Z") and the block it
 * belongs to. Tracks the enclosing type/input/interface/enum from both context
 * and added lines, so a field added to an existing type is attributed too.
 */
export function extractAddedSchemaFields(diff) {
  const out = [];
  let block = null;
  let pendingVersion = null;
  for (const raw of diff.split('\n')) {
    const tag = raw[0];
    if (tag === '-' || raw.startsWith('+++') || raw.startsWith('---')) continue;
    const line = tag === '+' || tag === ' ' ? raw.slice(1) : raw;

    const blockDecl = line.match(
      /^\s*(?:extend\s+)?(type|input|interface|enum)\s+(\w+)/,
    );
    if (blockDecl) {
      // A brand-new type's own "Added in" docstring precedes its declaration;
      // its fields inherit that version unless they declare their own.
      block = {
        kind: blockDecl[1],
        name: blockDecl[2],
        version: tag === '+' ? pendingVersion : null,
      };
      pendingVersion = null;
      continue;
    }
    if (tag !== '+') continue;

    const ver = line.match(/Added in (\d+\.\d+(?:\.\d+)?)/);
    if (ver) pendingVersion = ver[1];

    if (!block) continue;
    if (block.kind === 'enum') {
      const v = line.match(/^\s{2,}([A-Z][A-Z0-9_]*)\s*$/);
      if (v) {
        out.push({
          parent: block.name,
          parentKind: block.kind,
          field: v[1],
          version: pendingVersion ?? block.version,
          kind: 'enum',
        });
        pendingVersion = null;
      }
    } else {
      const f = line.match(/^\s{2,}([a-z]\w*)\s*[(:]/);
      if (f) {
        out.push({
          parent: block.name,
          parentKind: block.kind,
          field: f[1],
          version: pendingVersion ?? block.version,
          kind: 'field',
        });
        pendingVersion = null;
      }
    }
  }
  return out;
}

/** The graphql`…` template contents of a source file, joined. */
export function extractGraphqlTags(src) {
  return [...src.matchAll(/graphql`([^`]*)`/g)].map((m) => m[1]).join('\n');
}

const GUARD_RE = /supports\(|isManagerVersionCompatibleWith/;

/**
 * The convention under test (data/client-directives.graphql): a query field
 * that entered the schema at a manager version carries `@since(version:)` /
 * `@sinceMultiple` on its usage, so older managers never receive it. A usage
 * line without it — in a file with no supports()/isManagerVersionCompatibleWith
 * guard either — is a gap. Only gaps are reported: a correctly annotated field
 * needs no QA callout (FR-3673 was exactly an ungated enum value breaking the
 * Sessions tab on older managers).
 */
function schemaGatingGaps(from, to) {
  const diff = gitOrNull([
    'diff',
    `${from}..${to}`,
    '--',
    'data/schema.graphql',
  ]);
  if (!diff) return { gaps: [] };
  const added = extractAddedSchemaFields(diff);
  if (!added.length) return { gaps: [] };

  const schemaText = gitOrNull(['show', `${to}:data/schema.graphql`]) ?? '';

  const roots = ['react/src', 'packages/backend.ai-ui/src'];
  const listed = gitOrNull(['ls-tree', '-r', '--name-only', to]) ?? '';
  const files = listed
    .split('\n')
    .filter(
      (f) =>
        /\.(tsx?)$/.test(f) &&
        !isGenerated(f) &&
        !isTestLike(f) &&
        !isDocStub(f) &&
        !BUI_NON_RUNTIME.test(f) &&
        roots.some((r) => f.startsWith(`${r}/`)),
    );

  // One pass over the tree: cache each file's graphql-tag text, full text,
  // and whether it carries any version guard.
  const sources = [];
  for (const f of files) {
    const src = gitOrNull(['show', `${to}:${f}`]);
    if (!src || !src.includes('graphql`')) continue;
    sources.push({
      file: f,
      text: src,
      tagLines: extractGraphqlTags(src).split('\n'),
      guarded: GUARD_RE.test(src),
    });
  }

  const typeFields = parseSchemaTypeFields(schemaText);

  const gaps = [];
  const seen = new Set();
  for (const entry of added) {
    const key = `${entry.parent}.${entry.field}`;
    if (seen.has(key)) continue;
    seen.add(key);
    // An enum value reaches the manager as a plain string literal (status
    // filters); @since cannot annotate it, so only a file guard can gate it.
    const asLiteral = new RegExp(`['"]${entry.field}['"]`);
    const inputRef = new RegExp(`\\b${entry.parent}\\b`);
    const ungated = [];
    for (const s of sources) {
      let hit = false;
      if (entry.kind === 'enum') {
        hit = asLiteral.test(s.text) && !s.guarded;
      } else if (entry.parentKind === 'input') {
        // Input-object fields are sent as JS values, not selected — @since
        // cannot apply. Referencing the input type alone is not usage; the
        // file must also construct the field itself (`field:` object key).
        const buildsKey = new RegExp(`\\b${entry.field}\\s*:`).test(s.text);
        hit =
          s.tagLines.some((l) => inputRef.test(l)) && buildsKey && !s.guarded;
      } else {
        const uses = findSelectionUses(
          s.tagLines,
          entry.field,
          entry.parent,
          typeFields,
        );
        // The convention for query fields is @since at the usage (or a gated
        // ancestor). A supports() call elsewhere in the file guards ITS
        // operation, not every query the file holds, so it does not excuse an
        // unannotated selection (ProjectPage.tsx was the counterexample).
        hit = uses.some((u) => !u.annotated);
      }
      if (hit) ungated.push(s.file);
    }
    if (ungated.length) gaps.push({ ...entry, key, ungated });
  }
  return { gaps };
}

/**
 * type -> Map(field -> bare return type), for every type/interface block in
 * the schema. The bare name strips list/non-null wrappers and directives.
 */
export function parseSchemaTypeFields(schemaText) {
  const map = new Map();
  let current = null;
  let pendingField = null;
  for (const line of schemaText.split('\n')) {
    const block = line.match(/^(?:extend\s+)?(?:type|interface)\s+(\w+)/);
    if (block) {
      current = block[1];
      if (!map.has(current)) map.set(current, new Map());
      continue;
    }
    if (/^\S/.test(line) && line.trim() && !line.startsWith('{')) {
      if (/^}/.test(line)) current = null;
      continue;
    }
    if (!current) continue;
    // Inside a multiline signature the argument lines also look like fields —
    // only the closing `): ReturnType` matters until it arrives.
    if (pendingField) {
      const close = line.match(/^\s*\)\s*:\s*(\S+)/);
      if (close) {
        map.get(current).set(pendingField, close[1].replace(/[[\]!]/g, ''));
        pendingField = null;
      }
      continue;
    }
    const open = line.match(/^\s{2,}([a-z]\w*)\s*\(\s*$/);
    if (open) {
      pendingField = open[1];
      continue;
    }
    const f = line.match(/^\s{2,}([a-z]\w*)\s*(?:\([^)]*\))?\s*:\s*(\S+)/);
    if (f) map.get(current).set(f[1], f[2].replace(/[[\]!]/g, ''));
  }
  return map;
}

/**
 * Occurrences of `field` whose selection block RESOLVES to `parent`, walking
 * the indentation-derived ancestor chain from the nearest `on Type` root down
 * through the schema's field types. Strict: a chain that cannot be resolved is
 * not attributed (no guess, no false positive). A use counts as annotated when
 * the field line OR any ancestor selection carries @since — a gated ancestor
 * strips the whole subtree.
 */
export function findSelectionUses(tagLines, field, parent, typeFields) {
  const uses = [];
  const selRe = new RegExp(`^\\s*${field}\\b`);
  for (let i = 0; i < tagLines.length; i += 1) {
    const line = tagLines[i];
    if (!selRe.test(line)) continue;

    // Ancestor chain, innermost first: every shallower block-opening line.
    const chain = [];
    let indent = line.match(/^\s*/)[0].length;
    for (let j = i - 1; j >= 0 && indent > 0; j -= 1) {
      const prev = tagLines[j];
      if (!prev.trim()) continue;
      const prevIndent = prev.match(/^\s*/)[0].length;
      if (prevIndent < indent && prev.includes('{')) {
        chain.push(prev);
        indent = prevIndent;
      }
    }
    chain.reverse(); // root first

    // Resolve the block's type from the outermost typed root downward: a
    // fragment/inline `on Type`, or an operation header (query/mutation).
    let cur = null;
    for (const anc of chain) {
      const onType = anc.match(/\bon\s+(\w+)/)?.[1];
      if (onType) {
        cur = onType;
        continue;
      }
      const op = anc.match(/^\s*(query|mutation|subscription)\b/)?.[1];
      if (op) {
        cur = op[0].toUpperCase() + op.slice(1);
        continue;
      }
      if (cur === null) continue; // above the first typed root (query header)
      const ownerField = anc.match(/^\s*(\w+)/)?.[1];
      cur = ownerField ? (typeFields.get(cur)?.get(ownerField) ?? null) : null;
      if (cur === null) break; // unresolvable — stay strict
    }
    if (cur !== parent) continue;

    const annotated =
      /@since/i.test(line) || chain.some((anc) => /@since/i.test(anc));
    uses.push({ line, annotated });
  }
  return uses;
}

/**
 * Prettier wraps long calls, so the literal may sit on its own line with a
 * trailing comma: supports(\n  'flag',\n).
 */
export function extractSupportsUsages(src) {
  return [...src.matchAll(/supports\(\s*'([a-zA-Z0-9._-]+)'\s*,?\s*\)/g)].map(
    (m) => m[1],
  );
}

export function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

function readJsonAt(ref, path) {
  const raw = gitOrNull(['show', `${ref}:${path}`]);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Non-recursive: a nested store (locale/astryx) is its own namespace, listed separately. */
function listLocaleFiles(ref, dir) {
  const listed = gitOrNull(['ls-tree', '--name-only', ref, `${dir}/`]);
  if (!listed) return [];
  return listed.split('\n').filter((f) => f.endsWith('.json'));
}

/** Keys added to the English source in the range that never reached a locale. */
function i18nGaps(from, to) {
  const findings = [];
  for (const store of LOCALE_STORES) {
    const before = readJsonAt(from, store.source);
    const after = readJsonAt(to, store.source);
    if (!after) continue;
    const beforeKeys = new Set(before ? Object.keys(flatten(before)) : []);
    const afterFlat = flatten(after);
    const addedKeys = Object.keys(afterFlat).filter((k) => !beforeKeys.has(k));
    if (addedKeys.length === 0) continue;

    for (const file of listLocaleFiles(to, store.dir)) {
      if (file === store.source) continue;
      const data = readJsonAt(to, file);
      if (!data) continue;
      const flat = flatten(data);
      const missing = addedKeys.filter((k) => !(k in flat));
      const placeholder = addedKeys.filter(
        (k) => typeof flat[k] === 'string' && flat[k].includes(PLACEHOLDER),
      );
      if (missing.length || placeholder.length)
        findings.push({
          file,
          addedCount: addedKeys.length,
          missing,
          placeholder,
        });
    }
  }
  return findings;
}

function renderMarkdown(report) {
  const {
    from,
    to,
    base,
    commits,
    risks,
    featureMatrix,
    gating,
    undeclared,
    i18n,
  } = report;
  const L = [];
  const link = (c) =>
    c.pr
      ? `[#${c.pr}](https://github.com/lablup/backend.ai-webui/pull/${c.pr})`
      : `\`${c.sha.slice(0, 8)}\``;

  L.push(`# Release risk report — \`${from}\` → \`${to}\``);
  L.push('');
  L.push(
    `${commits.length} commits. Every item below is a QA action, not a defect.`,
  );
  if (report.divergedFrom) {
    L.push('');
    L.push(
      `File comparisons use the merge base \`${base.slice(0, 8)}\`, so what \`${from}\` changed since the fork is not counted.`,
    );
  }
  L.push('');
  L.push('| Risk | Count |');
  L.push('| --- | --- |');
  L.push(`| R1 UI change with no e2e change | ${risks.noE2E.length} |`);
  L.push(
    `| R2 new schema field used without a version gate | ${gating.gaps.length} |`,
  );
  L.push(`| R2a new manager feature gate | ${featureMatrix.length} |`);
  L.push(`| R3 locale files with untranslated new keys | ${i18n.length} |`);
  L.push(`| R4 destructive flow touched | ${risks.destructive.length} |`);
  L.push(
    `| R5 user-visible feat with no manual change | ${risks.noDocs.length} |`,
  );
  L.push('');

  if (gating.gaps.length) {
    L.push('## R2 — New schema fields used without a version gate');
    L.push('');
    L.push(
      'These fields entered the schema in this range and at least one usage carries no `@since(version:)` annotation (data/client-directives.graphql) and no file-level `supports()` guard. Against a manager that predates the field, the query fails instead of the feature hiding — FR-3673 was this class. Correctly annotated usages are not listed.',
    );
    L.push('');
    L.push('| Field | Added in | Ungated use |');
    L.push('| --- | --- | --- |');
    for (const g of gating.gaps)
      L.push(
        `| \`${g.key}\`${g.kind === 'enum' ? ' (enum)' : ''} | ${g.version ? `\`${g.version}\`` : '_unannotated_'} | ${g.ungated.map((f) => `\`${f.split('/').pop()}\``).join(', ')} |`,
      );
    L.push('');
  }

  if (featureMatrix.length) {
    L.push('## R2a — New manager feature gates');
    L.push('');
    L.push(
      'Gates declared inside this range. Exercise each against a manager that **meets** the version and one that does **not** — on the older manager the feature must be hidden, never broken.',
    );
    L.push('');
    L.push('| Feature flag | Requires | Used in app |');
    L.push('| --- | --- | --- |');
    for (const f of featureMatrix)
      L.push(
        `| \`${f.flag}\` | ${f.version ? `\`${f.version}\`` : '_ungated_'} | ${f.used ? 'yes' : '**no — dead flag**'} |`,
      );
    L.push('');
  }

  if (undeclared.length) {
    L.push('## R2b — Flags used but never declared (always `false`)');
    L.push('');
    L.push(
      '`supports()` returns `false` for an unregistered key, so these features are silently off in every deployment.',
    );
    L.push('');
    for (const f of undeclared) L.push(`- \`${f}\``);
    L.push('');
  }

  const section = (title, note, items, render) => {
    if (!items.length) return;
    L.push(`## ${title}`);
    L.push('');
    L.push(note);
    L.push('');
    for (const it of items) L.push(render(it));
    L.push('');
  };

  section(
    'R1 — UI changed, no e2e changed',
    'Each of these needs a manual pass, or an e2e spec before the next release.',
    risks.noE2E,
    (c) =>
      `- [ ] ${link(c)} ${c.fr ? `(${c.fr}) ` : ''}${c.subject.replace(/\s*\(#\d+\)$/, '')}\n  - touched: ${c.classified.ui.slice(0, 4).join(', ')}${c.classified.ui.length > 4 ? ` +${c.classified.ui.length - 4}` : ''}`,
  );

  section(
    'R3 — New keys not translated',
    'Keys added to the English source in this range that never reached a locale. The UI falls back to the raw key or English.',
    i18n,
    (f) =>
      `- [ ] \`${f.file}\` — ${f.missing.length} missing, ${f.placeholder.length} placeholder (of ${f.addedCount} new keys)${
        f.missing.length
          ? `\n  - e.g. ${f.missing
              .slice(0, 3)
              .map((k) => `\`${k}\``)
              .join(', ')}`
          : ''
      }`,
  );

  section(
    'R4 — Destructive flow touched',
    'Re-verify the typed-confirmation gate (rules/destructive-confirmation.md): the danger button stays disabled until the exact name is typed.',
    risks.destructive,
    (c) =>
      `- [ ] ${link(c)} ${c.subject.replace(/\s*\(#\d+\)$/, '')}\n  - ${c.classified.destructive.join(', ')}`,
  );

  section(
    'R5 — User-visible feature with no manual change',
    'A `feat:` that changed the UI but not the user manual. Confirm the manual does not need it.',
    risks.noDocs,
    (c) => `- [ ] ${link(c)} ${c.subject.replace(/\s*\(#\d+\)$/, '')}`,
  );

  if (
    !risks.noE2E.length &&
    !gating.gaps.length &&
    !featureMatrix.length &&
    !undeclared.length &&
    !i18n.length &&
    !risks.destructive.length &&
    !risks.noDocs.length
  ) {
    L.push('No risk signals in this range.');
    L.push('');
  }
  return L.join('\n');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.from) {
    process.stdout.write(`${usage()}\n`);
    process.exit(args.help ? 0 : 2);
  }

  const commits = readCommits(args.from, args.to).map((c) => ({
    ...c,
    classified: classify(c.files),
  }));

  const base = mergeBase(args.from, args.to);

  // R4 by content: a changed UI file hosting the typed-confirm contract is a
  // destructive-flow touch even when its name carries no action word. Checked
  // at BOTH ends of the range — a commit that removes the contract (or the
  // file) is exactly the regression this signal exists to surface.
  const contractCache = new Map();
  const refHasContract = (ref, f) => {
    const key = `${ref}:${f}`;
    if (!contractCache.has(key)) {
      const src = gitOrNull(['show', key]);
      contractCache.set(key, Boolean(src && hasDestructiveContract(src)));
    }
    return contractCache.get(key);
  };
  const hostsContract = (f) =>
    refHasContract(args.to, f) || refHasContract(base, f);
  for (const c of commits) {
    c.classified.destructive.push(
      ...c.classified.ui.filter(
        (f) => !c.classified.destructive.includes(f) && hostsContract(f),
      ),
    );
    // Touching a file that hosts a flow is not the signal — CHANGING the flow
    // is. Only a diff whose changed lines reach the confirm logic counts.
    if (c.classified.destructive.length) {
      const diff = gitOrNull([
        'show',
        '--unified=0',
        '--pretty=format:',
        c.sha,
        '--',
        ...c.classified.destructive,
      ]);
      if (!diff || !diffTouchesDestructiveFlow(diff))
        c.classified.destructive = [];
    }
  }

  const userFacing = commits.filter(
    (c) => c.type && USER_FACING_TYPES.has(c.type),
  );

  const risks = {
    noE2E: userFacing.filter(
      (c) => c.classified.ui.length > 0 && c.classified.e2e.length === 0,
    ),
    destructive: commits.filter((c) => c.classified.destructive.length > 0),
    noDocs: commits.filter(
      (c) =>
        c.type === 'feat' &&
        c.classified.ui.length > 0 &&
        c.classified.docs.length === 0,
    ),
  };

  const versionMap = readFeatureVersionMap(args.to);
  const used = usedFeatureFlags(args.to);
  const featureMatrix = newFeatureFlags(base, args.to).map((flag) => ({
    flag,
    version: versionMap.get(flag)?.version ?? null,
    used: used.has(flag),
  }));
  const undeclared = [...used].filter((f) => !versionMap.has(f)).sort();

  const report = {
    from: args.from,
    to: args.to,
    base,
    divergedFrom: forkedEarly(args.from, base),
    commits,
    risks,
    featureMatrix,
    gating: schemaGatingGaps(base, args.to),
    hotspots: computeHotspots(commits),
    undeclared,
    i18n: i18nGaps(base, args.to),
  };

  const output = args.json
    ? JSON.stringify(
        {
          ...report,
          commits: commits.map(({ files, classified, ...rest }) => rest),
          // Keep the touched paths: a consumer rendering a digest needs to name
          // the destructive file, not just the PR.
          risks: Object.fromEntries(
            Object.entries(risks).map(([k, v]) => [
              k,
              v.map((c) => ({
                pr: c.pr,
                fr: c.fr,
                subject: c.subject,
                ui: c.classified.ui,
                destructive: c.classified.destructive,
              })),
            ]),
          ),
        },
        null,
        2,
      )
    : renderMarkdown(report);

  if (args.out) {
    writeFileSync(args.out, output.endsWith('\n') ? output : `${output}\n`);
    process.stdout.write(`wrote ${args.out}\n`);
  } else {
    process.stdout.write(`${output}\n`);
  }
}

// Importing this module (tests) must not run the CLI.
if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main();
