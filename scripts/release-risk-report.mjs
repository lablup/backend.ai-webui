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

// Non-runtime corners of the BUI package; everything else under src/ ships.
const BUI_NON_RUNTIME =
  /^packages\/backend\.ai-ui\/src\/(__test__|tests|astryx-docs|locale)\//;

export function classify(files) {
  const ui = files.filter(
    (f) =>
      !isGenerated(f) &&
      !isTestLike(f) &&
      (/^react\/src\/.*\.tsx?$/.test(f) ||
        (/^packages\/backend\.ai-ui\/src\/.*\.tsx?$/.test(f) &&
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
  const files = listed
    .split('\n')
    .filter(
      (f) =>
        /\.(tsx?|jsx?)$/.test(f) &&
        !isGenerated(f) &&
        roots.some((r) => f.startsWith(`${r}/`)),
    );
  for (const f of files) {
    const src = gitOrNull(['show', `${ref}:${f}`]);
    if (src) for (const flag of extractSupportsUsages(src)) used.add(flag);
  }
  return used;
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
  const { from, to, base, commits, risks, featureMatrix, undeclared, i18n } =
    report;
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
  L.push(`| R2 new manager feature gate | ${featureMatrix.length} |`);
  L.push(`| R3 locale files with untranslated new keys | ${i18n.length} |`);
  L.push(`| R4 destructive flow touched | ${risks.destructive.length} |`);
  L.push(
    `| R5 user-visible feat with no manual change | ${risks.noDocs.length} |`,
  );
  L.push('');

  if (featureMatrix.length) {
    L.push('## R2 — Manager version matrix');
    L.push('');
    L.push(
      'These gates are new in this range. Exercise each one against a manager that **meets** the version and one that does **not** — on the older manager the feature must be hidden, never broken.',
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

  // R4 by content: a changed UI file hosting the typed-confirm contract is a
  // destructive-flow touch even when its name carries no action word.
  const contractCache = new Map();
  const hostsContract = (f) => {
    if (!contractCache.has(f)) {
      const src = gitOrNull(['show', `${args.to}:${f}`]);
      contractCache.set(f, Boolean(src && hasDestructiveContract(src)));
    }
    return contractCache.get(f);
  };
  for (const c of commits) {
    c.classified.destructive.push(
      ...c.classified.ui.filter(
        (f) => !c.classified.destructive.includes(f) && hostsContract(f),
      ),
    );
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

  const base = mergeBase(args.from, args.to);
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
