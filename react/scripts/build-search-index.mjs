#!/usr/bin/env node
/**
 * Build-time search index for the global search palette (FR-3558).
 *
 * Routes are `React.lazy` chunks, so the palette cannot search rendered DOM —
 * it searches this index, derived from source. The index stores i18n KEYS, not
 * strings, so every locale is covered without re-indexing.
 *
 * Staleness is gated by `scripts/verify.sh`, which rebuilds and diffs the
 * committed artifact the same way it does for Relay — this script only writes.
 *
 *   node scripts/build-search-index.mjs            # write the index
 *   node scripts/build-search-index.mjs --verbose  # build + report
 *   node scripts/build-search-index.mjs --out FILE # write elsewhere (tests)
 *   node scripts/build-search-index.mjs --routes   # route candidates as JSON
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REACT_DIR = path.resolve(HERE, '..');
const ROOT = path.resolve(REACT_DIR, '..');
const SRC = path.join(REACT_DIR, 'src');
const ROUTES_FILE = path.join(SRC, 'routes.tsx');
const EN_JSON = path.join(ROOT, 'resources/i18n/en.json');
const OUT_FILE = path.join(SRC, 'generated/searchIndex.json');

const INDEX_VERSION = 1;
const GENERATED_FROM = 'react/src/routes.tsx';

/** Transitive walk depth. Infinity = follow every value import. */
const MAX_DEPTH = Infinity;

/**
 * A plain key on >= this many entries is shared vocabulary: it stops being
 * kept everywhere and is placed by ownership instead (see `keyPlacement`).
 * Structured keys (tab labels, setting titles/descriptions) are exempt.
 */
const NOISE_THRESHOLD = 10;

/**
 * An entry OWNS a key when it declares it within this many import hops of the
 * route component. Ownership — not the raw entry count — decides where a
 * shared key survives: chrome (`time.*`, `button.Cancel`) is owned by many
 * pages at once, while page vocabulary (`session.launcher.SharedMemory`) is
 * owned by one or two and merely leaks deep into the rest.
 */
const OWNER_DEPTH = 4;

/** Edges not followed: reaching them makes every page contain every page. */
const CUT_PATH_PREFIXES = ['react/src/components/MainLayout/'];
const CUT_PATH_EXACT = ['react/src/components/DefaultProviders.tsx'];

/** Never entered: BUI has its own i18next instance and its barrel is huge. */
const EXTERNAL_PREFIXES = ['packages/backend.ai-ui/'];
const SKIP_PATH_SUBSTR = ['__generated__'];
const SKIP_IMPORT_EXT =
  /\.(css|scss|sass|less|svg|png|jpe?g|gif|webp|graphql|json|md|txt|woff2?)$/;

/** Legacy flat URLs are redirect shims onto the canonical path — never indexed. */
const SHIM_COMPONENT_FILES = ['react/src/legacyRedirects.tsx'];

/** Route chrome: renders on the page, but its keys are not page content. */
const ROUTE_CHROME_COMPONENTS = [
  'react/src/components/BAIErrorBoundary.tsx',
  'react/src/components/ErrorBoundaryWithNullFallback.tsx',
  'react/src/components/StorageHostFetchErrorBoundary.tsx',
  'react/src/components/LocationStateBreadCrumb.tsx',
  'react/src/components/FlexActivityIndicator.tsx',
  'react/src/components/WebUINavigate.tsx',
];

const RESOLVE_EXTS = ['.tsx', '.ts', '.jsx', '.js'];

/** i18n key literals. */
const KEY_RE = /(?:^|[^A-Za-z0-9_$])t\(\s*(['"`])([^'"`$\n]+?)\1/g;
const TRANS_RE = /i18nKey\s*=\s*(?:\{\s*)?(['"`])([^'"`$\n]+?)\1/g;
/** `t('key', 'Fallback text')` — i18next renders the default, so it is not missing. */
const KEY_WITH_DEFAULT_RE =
  /(?:^|[^A-Za-z0-9_$])t\(\s*(['"`])([^'"`$\n]+?)\1\s*,\s*['"`]/g;
/** Dynamic keys — recorded for the report, never emitted. */
const DYN_KEY_RE = /(?:^|[^A-Za-z0-9_$])t\(\s*`([^`\n]*\$\{[^`\n]*)`/g;

/** URL params that behave like a page-level tab strip (FR-3267 patterns A-i/A-ii). */
const TAB_PARAMS = ['tab'];
const TAB_LIKE_PARAMS = ['type', 'statusCategory', 'mode'];

/** A one-entry tab strip is the page itself — never a separate hit. */
const MIN_TAB_KEYS = 2;

/**
 * Route params the palette can fill in itself. Everything else parametrised
 * addresses a data entity (`:deploymentId`, `:artifactId`) and is not a hit.
 */
const SCOPE_PARAMS = ['projectName'];

/**
 * `VFolderNodeListPage` declares `statusCategory` as `parseAsString` with the
 * labels built by `_.map` over an object — no enum to read statically, while
 * its two admin twins use enum parsers and are detected normally.
 */
const TAB_OVERRIDES = {
  '/project/:projectName/data': [
    { param: 'statusCategory', key: 'active', labelKey: 'data.Active' },
    {
      param: 'statusCategory',
      key: 'deleted',
      labelKey: 'data.folders.TrashBin',
    },
  ],
};

// ---------------------------------------------------------------------------
// config integrity: every hardcoded path above must still exist, or the rule it
// encodes has silently stopped applying (a rename would otherwise pass unnoticed).
// ---------------------------------------------------------------------------
function assertConfiguredPaths() {
  const groups = [
    ['ROUTES_FILE', [path.relative(ROOT, ROUTES_FILE)]],
    ['EN_JSON', [path.relative(ROOT, EN_JSON)]],
    ['CUT_PATH_PREFIXES', CUT_PATH_PREFIXES],
    ['CUT_PATH_EXACT', CUT_PATH_EXACT],
    ['EXTERNAL_PREFIXES', EXTERNAL_PREFIXES],
    ['SHIM_COMPONENT_FILES', SHIM_COMPONENT_FILES],
    ['ROUTE_CHROME_COMPONENTS', ROUTE_CHROME_COMPONENTS],
  ];
  const missing = [];
  for (const [label, paths] of groups)
    for (const p of paths)
      if (!fs.existsSync(path.join(ROOT, p))) missing.push(`${label}: ${p}`);
  if (missing.length)
    throw new Error(
      'build-search-index.mjs is configured with path(s) that no longer exist ' +
        '(renamed or deleted). Update the CONFIG block:\n  ' +
        missing.join('\n  '),
    );
}
assertConfiguredPaths();

// ---------------------------------------------------------------------------
// workspace deps (zero new dependencies)
// ---------------------------------------------------------------------------
const require_ = createRequire(path.join(REACT_DIR, 'package.json'));
const ts = require_('typescript');
const { transformWithEsbuild } = await import(require_.resolve('vite'));

const rel = (f) => path.relative(ROOT, f);
const byString = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// ---------------------------------------------------------------------------
// module resolution
// ---------------------------------------------------------------------------
function resolveFile(base) {
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
  for (const e of RESOLVE_EXTS) if (fs.existsSync(base + e)) return base + e;
  for (const e of RESOLVE_EXTS) {
    const p = path.join(base, 'index' + e);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/** Relative specifiers and the two workspace tsconfig aliases; the rest is external. */
function resolveSpec(spec, fromFile) {
  if (SKIP_IMPORT_EXT.test(spec)) return null;
  if (spec.startsWith('.')) {
    return resolveFile(path.resolve(path.dirname(fromFile), spec));
  }
  if (spec === 'backend.ai-ui')
    return path.join(ROOT, 'packages/backend.ai-ui/src/index.ts');
  if (spec.startsWith('backend.ai-ui/'))
    return resolveFile(
      path.join(
        ROOT,
        'packages/backend.ai-ui/src',
        spec.slice('backend.ai-ui/'.length),
      ),
    );
  if (spec === 'backend.ai-client')
    return path.join(ROOT, 'packages/backend.ai-client/src/index.ts');
  if (spec.startsWith('backend.ai-client/'))
    return resolveFile(
      path.join(
        ROOT,
        'packages/backend.ai-client/src',
        spec.slice('backend.ai-client/'.length),
      ),
    );
  return null;
}

const isExternal = (f) => {
  const r = rel(f);
  if (EXTERNAL_PREFIXES.some((p) => r.startsWith(p))) return true;
  if (SKIP_PATH_SUBSTR.some((s) => r.includes(s))) return true;
  return false;
};

// ---------------------------------------------------------------------------
// per-file analysis: value imports + i18n keys + structured surfaces
// ---------------------------------------------------------------------------
const fileCache = new Map();
const sfCache = new Map();
let transformMs = 0;

function sourceFileOf(file, src) {
  if (sfCache.has(file)) return sfCache.get(file);
  const sf = ts.createSourceFile(
    file,
    src,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TSX,
  );
  sfCache.set(file, sf);
  return sf;
}

async function analyzeFile(file) {
  if (fileCache.has(file)) return fileCache.get(file);
  const src = fs.readFileSync(file, 'utf8');

  // Value imports only: esbuild drops type-only imports and unused bindings,
  // which is exactly the graph Vite bundles.
  const t0 = Date.now();
  let code = src;
  try {
    ({ code } = await transformWithEsbuild(src, file, {
      loader: file.endsWith('x') ? 'tsx' : 'ts',
      jsx: 'automatic',
      sourcemap: false,
      target: 'esnext',
    }));
  } catch {
    /* keep raw source; this file's import list is approximate */
  }
  transformMs += Date.now() - t0;

  const deps = new Set();
  try {
    for (const im of ts.preProcessFile(code, true, true).importedFiles) {
      const r = resolveSpec(im.fileName, file);
      if (r && !isExternal(r)) deps.add(r);
    }
  } catch {
    /* ignore unscannable output */
  }

  const keys = new Set();
  let m;
  KEY_RE.lastIndex = 0;
  while ((m = KEY_RE.exec(src))) keys.add(m[2]);
  TRANS_RE.lastIndex = 0;
  while ((m = TRANS_RE.exec(src))) keys.add(m[2]);
  const dynamic = new Set();
  DYN_KEY_RE.lastIndex = 0;
  while ((m = DYN_KEY_RE.exec(src))) dynamic.add(m[1]);
  const defaulted = new Set();
  KEY_WITH_DEFAULT_RE.lastIndex = 0;
  while ((m = KEY_WITH_DEFAULT_RE.exec(src))) defaulted.add(m[2]);

  const rec = {
    file,
    deps: [...deps].sort(byString),
    keys: [...keys].sort(byString),
    dynamic: [...dynamic].sort(byString),
    defaulted: [...defaulted].sort(byString),
    ...structuredSurfaces(file, src),
  };
  fileCache.set(file, rec);
  return rec;
}

// ---------------------------------------------------------------------------
// TS AST helpers
// ---------------------------------------------------------------------------
const textOfString = (n) =>
  n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n))
    ? n.text
    : null;

/** `t('x')` / `t("x")` / t(`x`) -> 'x' */
function tCallKey(node) {
  if (!node || !ts.isCallExpression(node)) return null;
  const e = node.expression;
  const name = ts.isIdentifier(e)
    ? e.text
    : ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.name)
      ? e.name.text
      : null;
  if (name !== 't') return null;
  return textOfString(node.arguments[0]);
}

/** Every `t('…')` key in a subtree — a `description` may be a JSX fragment. */
function collectTKeys(node) {
  const out = new Set();
  const visit = (n) => {
    const k = tCallKey(n);
    if (k) out.add(k);
    ts.forEachChild(n, visit);
  };
  if (node) visit(node);
  return [...out].sort(byString);
}

const propOf = (obj, name) => {
  if (!obj || !ts.isObjectLiteralExpression(obj)) return null;
  for (const p of obj.properties) {
    if (!ts.isPropertyAssignment(p)) continue;
    const k = ts.isIdentifier(p.name)
      ? p.name.text
      : ts.isStringLiteral(p.name)
        ? p.name.text
        : null;
    if (k === name) return p.initializer;
  }
  return null;
};

/** Unwrap `filterOutEmpty([...])`, `_.compact([...])`, `[...].filter(...)`. */
function asArrayLiteral(node) {
  let n = node;
  for (let i = 0; i < 4 && n; i++) {
    if (ts.isArrayLiteralExpression(n)) return n;
    if (ts.isCallExpression(n)) {
      const arg = n.arguments[0];
      if (arg) {
        n = arg;
        continue;
      }
      if (ts.isPropertyAccessExpression(n.expression)) {
        n = n.expression.expression;
        continue;
      }
    }
    if (ts.isAsExpression(n) || ts.isParenthesizedExpression(n)) {
      n = n.expression;
      continue;
    }
    return null;
  }
  return null;
}

/** Elements of an array literal, seeing through `cond && {…}`, ternaries, spreads. */
function objectElements(arr) {
  const out = [];
  if (!arr) return out;
  const push = (n) => {
    let x = n;
    while (x && (ts.isParenthesizedExpression(x) || ts.isAsExpression(x)))
      x = x.expression;
    if (!x) return;
    // Only `cond && {…}` contributes its right side; any other binary operator
    // (`??`, `||`, `+`) would make the left operand vanish silently.
    if (ts.isBinaryExpression(x)) {
      if (x.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken)
        push(x.right);
      return;
    }
    if (ts.isConditionalExpression(x)) {
      push(x.whenTrue);
      push(x.whenFalse);
      return;
    }
    if (ts.isSpreadElement(x)) {
      const inner = asArrayLiteral(x.expression);
      if (inner) for (const e of inner.elements) push(e);
      return;
    }
    if (ts.isObjectLiteralExpression(x)) out.push(x);
  };
  for (const e of arr.elements) push(e);
  return out;
}

// ---------------------------------------------------------------------------
// structured surfaces: tabs + setting items
// ---------------------------------------------------------------------------
function structuredSurfaces(file, src) {
  const tabs = [];
  const settings = [];
  let sf;
  try {
    sf = sourceFileOf(file, src);
  } catch {
    return { tabs, settings };
  }

  /** tab key -> labelKey, from `tabList`/`items` arrays of `{ key, label: t('…') }`. */
  const labelByKey = new Map();
  /** param name -> Set(tab keys) */
  const byParam = new Map();
  const rawSettings = [];

  const visit = (node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const fn = node.expression.text;
      if (fn === 'parseAsStringLiteral' || fn === 'parseAsStringEnum') {
        const arr = resolveArrayArg(sf, node.arguments[0]);
        const param = paramNameOfParser(node, src);
        if (arr && param) {
          if (!byParam.has(param)) byParam.set(param, new Set());
          for (const el of arr.elements) {
            const v = textOfString(el);
            if (v) byParam.get(param).add(v);
          }
        }
      }
    }

    // Tab strips spell the identifier `key` (BAITabs) or `value` (radio strips).
    if (ts.isArrayLiteralExpression(node)) {
      const objs = objectElements(node);
      const keyProp = (o) => propOf(o, 'key') ?? propOf(o, 'value');
      if (objs.length && objs.every((o) => keyProp(o) && propOf(o, 'label'))) {
        for (const o of objs) {
          const k = textOfString(keyProp(o));
          const lk = tCallKey(propOf(o, 'label'));
          if (k && lk) labelByKey.set(k, lk);
        }
      }
    }

    // SettingGroup: { 'data-testid', title: t(), settingItems: [...] }
    if (ts.isObjectLiteralExpression(node)) {
      const itemsNode = propOf(node, 'settingItems');
      if (itemsNode) {
        const groupTitle = tCallKey(propOf(node, 'title'));
        const groupId = textOfString(propOf(node, 'data-testid'));
        for (const item of objectElements(asArrayLiteral(itemsNode))) {
          const titleKey = tCallKey(propOf(item, 'title'));
          if (!titleKey) continue;
          rawSettings.push({
            key: titleKey,
            groupKey: groupTitle,
            groupId,
            testId: textOfString(propOf(item, 'data-testid')),
            descriptionKeys: collectTKeys(propOf(item, 'description')),
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  for (const [param, keys] of [...byParam.entries()].sort((a, b) =>
    byString(a[0], b[0]),
  )) {
    if (keys.size < MIN_TAB_KEYS) continue; // inert single-tab strip
    for (const k of [...keys].sort(byString)) {
      tabs.push({
        param,
        key: k,
        labelKey: labelByKey.get(k) ?? null,
        primary: TAB_PARAMS.includes(param),
      });
    }
  }

  const settingTab = settingTabKeyOf(sf, byParam.get('tab'));
  for (const s of rawSettings) settings.push({ ...s, tab: settingTab });

  return { tabs, settings };
}

/**
 * The `?tab=` key whose branch renders `<SettingList>` — `{currentTab ===
 * 'general' && <SettingList …>}` on the Preferences page. Null when the page
 * has no tab strip (the three single-tab setting pages).
 */
function settingTabKeyOf(sf, tabKeys) {
  if (!tabKeys || tabKeys.size < MIN_TAB_KEYS) return null;
  let found = null;
  const rendersSettingList = (node) => {
    let hit = false;
    const scan = (n) => {
      if (hit) return;
      const tag =
        ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)
          ? n.tagName
          : null;
      if (tag && ts.isIdentifier(tag) && tag.text === 'SettingList') hit = true;
      else ts.forEachChild(n, scan);
    };
    scan(node);
    return hit;
  };
  const visit = (node) => {
    if (found) return;
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken &&
      ts.isBinaryExpression(node.left) &&
      node.left.operatorToken.kind ===
        ts.SyntaxKind.EqualsEqualsEqualsToken &&
      rendersSettingList(node.right)
    ) {
      const k =
        textOfString(node.left.right) ?? textOfString(node.left.left);
      if (k && tabKeys.has(k)) found = k;
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

/**
 * Which URL param a nuqs enum parser is bound to. Covers `useQueryState('tab',
 * parser)`, `useQueryStates({ tab: parser })` and `useTabQuerySnapshot(parser)`,
 * inline or through one module-level const.
 */
function paramNameOfParser(call, src) {
  const ALL = [...TAB_PARAMS, ...TAB_LIKE_PARAMS];

  let n = call.parent;
  for (let i = 0; i < 4 && n; i++) {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression)) {
      if (n.expression.text === 'useQueryState') {
        const p = textOfString(n.arguments[0]);
        return p && ALL.includes(p) ? p : null;
      }
    }
    if (ts.isPropertyAssignment(n) && ts.isIdentifier(n.name)) {
      const p = n.name.text;
      return ALL.includes(p) ? p : null;
    }
    n = n.parent;
  }

  const owner = findParserOwnerName(call);
  if (!owner) return null;
  if (new RegExp(`useTabQuerySnapshot\\(\\s*${owner}\\b`).test(src)) return 'tab';
  for (const p of ALL) {
    if (new RegExp(`\\b${p}\\s*:\\s*${owner}\\b`).test(src)) return p;
    if (
      new RegExp(`useQueryState\\(\\s*['"]${p}['"]\\s*,\\s*${owner}\\b`).test(src)
    )
      return p;
  }
  return null;
}

/** The array argument of a parser call, through one level of const indirection. */
function resolveArrayArg(sf, arg) {
  let n = arg;
  while (n && (ts.isAsExpression(n) || ts.isParenthesizedExpression(n)))
    n = n.expression;
  if (!n) return null;
  if (ts.isArrayLiteralExpression(n)) return n;
  if (ts.isIdentifier(n)) {
    let found = null;
    const scan = (x) => {
      if (
        ts.isVariableDeclaration(x) &&
        ts.isIdentifier(x.name) &&
        x.name.text === n.text &&
        x.initializer
      ) {
        let init = x.initializer;
        while (
          init &&
          (ts.isAsExpression(init) || ts.isParenthesizedExpression(init))
        )
          init = init.expression;
        if (ts.isArrayLiteralExpression(init)) found = init;
      }
      ts.forEachChild(x, scan);
    };
    scan(sf);
    return found;
  }
  return null;
}

function findParserOwnerName(call) {
  let n = call.parent;
  for (let i = 0; i < 5 && n; i++) {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) return n.name.text;
    n = n.parent;
  }
  return null;
}

// ---------------------------------------------------------------------------
// routes.tsx -> route entries
// ---------------------------------------------------------------------------
/**
 * Every route object carrying `handle` metadata and a rendered component, with
 * the absolute path assembled from ancestors. Skipped candidates keep a
 * `skipReason` so the test and the report can show what was dropped and why.
 */
export function parseRoutes() {
  const src = fs.readFileSync(ROUTES_FILE, 'utf8');
  const sf = ts.createSourceFile(
    ROUTES_FILE,
    src,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TSX,
  );

  /** local identifier -> resolved file (lazy chunks + static imports) */
  const compFile = new Map();
  /** array variable name -> ArrayLiteralExpression */
  const arrayVars = new Map();

  const topVisit = (node) => {
    if (ts.isImportDeclaration(node) && node.importClause) {
      const r = resolveSpec(node.moduleSpecifier.text, ROUTES_FILE);
      if (r && !isExternal(r)) {
        const c = node.importClause;
        if (c.name) compFile.set(c.name.text, r);
        if (c.namedBindings && ts.isNamedImports(c.namedBindings)) {
          for (const el of c.namedBindings.elements) compFile.set(el.name.text, r);
        }
      }
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const init = node.initializer;
      const lazySpec = lazyImportSpec(init);
      if (lazySpec) {
        const r = resolveSpec(lazySpec, ROUTES_FILE);
        if (r) compFile.set(node.name.text, r);
      }
      const arr = ts.isArrayLiteralExpression(init)
        ? init
        : ts.isAsExpression(init) && ts.isArrayLiteralExpression(init.expression)
          ? init.expression
          : null;
      if (arr) arrayVars.set(node.name.text, arr);
    }
    ts.forEachChild(node, topVisit);
  };
  topVisit(sf);

  const candidates = [];
  const seenPaths = new Set();

  const joinPath = (parent, seg) => {
    if (!seg) return parent;
    if (seg.startsWith('/')) return seg;
    return (parent === '/' ? '' : parent) + '/' + seg;
  };

  const walkArray = (arr, parentPath, inheritedHandle) => {
    for (const obj of objectElements(arr)) {
      const seg = textOfString(propOf(obj, 'path'));
      const isIndex = !!propOf(obj, 'index');
      const full = joinPath(parentPath, seg);
      // `chat/:id?` renders without the param, so the page IS reachable — index
      // it at the bare path. Children still nest under the declared one.
      const indexed = stripOptionalParams(full);

      const handleNode = propOf(obj, 'handle');
      const handle = { ...inheritedHandle };
      if (handleNode && ts.isObjectLiteralExpression(handleNode)) {
        for (const name of ['scope', 'menuKey', 'labelKey', 'title']) {
          const v = textOfString(propOf(handleNode, name));
          if (v) handle[name] = v;
        }
      }

      const elNode = propOf(obj, 'element') ?? propOf(obj, 'Component');
      const comps = elNode ? collectComponents(elNode, compFile) : [];

      if (handle.menuKey || handle.labelKey || handle.title) {
        const isShim =
          comps.length > 0 && comps.every((c) => SHIM_COMPONENT_FILES.includes(rel(c)));
        const skipReason = !comps.length
          ? 'no-component'
          : isShim
            ? 'redirect-shim'
            : indexed.includes('*')
              ? 'splat'
              : hasEntityParam(indexed)
                ? 'parametrised'
                : seenPaths.has(indexed)
                  ? 'duplicate-path'
                  : null;
        if (!skipReason) seenPaths.add(indexed);
        candidates.push({
          menuKey: handle.menuKey ?? deriveMenuKey(indexed),
          scope: handle.scope ?? null,
          path: indexed,
          menuKeySource: handle.menuKey ? 'handle' : 'path',
          labelKey: handle.labelKey ?? handle.title ?? null,
          isIndex,
          components: comps,
          skipReason,
        });
      }

      const childrenNode = propOf(obj, 'children');
      let childArr = null;
      if (childrenNode) {
        if (ts.isArrayLiteralExpression(childrenNode)) childArr = childrenNode;
        else if (ts.isIdentifier(childrenNode)) childArr = arrayVars.get(childrenNode.text);
      }
      if (childArr) walkArray(childArr, full, handle);
    }
  };

  const rootArr = arrayVars.get('routes');
  if (!rootArr) throw new Error('routes.tsx: `routes` array not found');
  walkArray(rootArr, '', {});

  candidates.sort((a, b) => byString(a.path, b.path));
  return candidates;
}

/** Optional params are droppable, so they never make a path unaddressable. */
const stripOptionalParams = (fullPath) =>
  fullPath
    .split('/')
    .filter((s) => !(s.startsWith(':') && s.endsWith('?')))
    .join('/') || '/';

const hasEntityParam = (fullPath) =>
  fullPath
    .split('/')
    .some((s) => s.startsWith(':') && !SCOPE_PARAMS.includes(s.slice(1)));

/** `useCurrentMenuKey()` falls back to the first meaningful path segment. */
function deriveMenuKey(fullPath) {
  const segs = fullPath.split('/').filter(Boolean);
  while (
    segs.length &&
    (segs[0] === 'project' || segs[0].startsWith(':') || segs[0] === 'admin')
  )
    segs.shift();
  return segs[0] ?? null;
}

function lazyImportSpec(init) {
  if (!ts.isCallExpression(init)) return null;
  const e = init.expression;
  const name = ts.isIdentifier(e)
    ? e.text
    : ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.name)
      ? e.name.text
      : null;
  if (name !== 'lazy') return null;
  let spec = null;
  const find = (n) => {
    if (
      ts.isCallExpression(n) &&
      n.expression.kind === ts.SyntaxKind.ImportKeyword &&
      n.arguments[0]
    ) {
      const s = textOfString(n.arguments[0]);
      if (s) spec = s;
    }
    ts.forEachChild(n, find);
  };
  find(init);
  return spec;
}

/**
 * Locally-defined components a route renders. Only JSX tag names count — a hook
 * or helper called in the route's inline component is not a page.
 */
function collectComponents(node, compFile) {
  const out = new Set();
  const add = (name) => {
    const f = compFile.get(name);
    if (f && !isExternal(f) && !ROUTE_CHROME_COMPONENTS.includes(rel(f))) out.add(f);
  };
  if (ts.isIdentifier(node)) add(node.text);
  const visit = (n) => {
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      const tag = n.tagName;
      if (ts.isIdentifier(tag)) add(tag.text);
      else if (ts.isPropertyAccessExpression(tag) && ts.isIdentifier(tag.expression))
        add(tag.expression.text);
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return [...out].sort(byString);
}

// ---------------------------------------------------------------------------
// graph walk
// ---------------------------------------------------------------------------
function makeIsCut(routeEntryFiles) {
  return (target, roots) => {
    if (roots.has(target)) return false;
    if (routeEntryFiles.has(target)) return true;
    const r = rel(target);
    if (CUT_PATH_PREFIXES.some((p) => r.startsWith(p))) return true;
    if (CUT_PATH_EXACT.includes(r)) return true;
    return false;
  };
}

async function walkEntry(entry, isCut) {
  const roots = new Set(entry.components);
  const depth = new Map();
  const queue = [];
  for (const r of [...roots].sort(byString)) {
    depth.set(r, 0);
    queue.push(r);
  }
  while (queue.length) {
    const f = queue.shift();
    const d = depth.get(f);
    if (d >= MAX_DEPTH) continue;
    const rec = await analyzeFile(f);
    for (const dep of rec.deps) {
      if (isCut(dep, roots)) continue;
      if (!depth.has(dep)) {
        depth.set(dep, d + 1);
        queue.push(dep);
      }
    }
  }
  return depth;
}

// ---------------------------------------------------------------------------
// index build
// ---------------------------------------------------------------------------
export async function buildEntries() {
  const routes = parseRoutes().filter((r) => !r.skipReason);

  const indexedPaths = new Set(routes.map((r) => r.path));
  const staleOverrides = Object.keys(TAB_OVERRIDES).filter(
    (p) => !indexedPaths.has(p),
  );
  if (staleOverrides.length)
    throw new Error(
      'TAB_OVERRIDES keys no longer match an indexed route (renamed or now ' +
        'skipped). Update build-search-index.mjs:\n  ' +
        staleOverrides.join('\n  '),
    );

  const routeEntryFiles = new Set(routes.flatMap((e) => e.components));
  const isCut = makeIsCut(routeEntryFiles);

  const built = [];
  for (const e of routes) {
    const depth = await walkEntry(e, isCut);
    const files = [...depth.keys()].sort(byString);

    /** key -> shallowest owner (ties broken by path sort) */
    const keyMap = new Map();
    const tabs = [];
    const settings = [];
    const dynamicKeys = new Set();

    for (const f of files) {
      const rec = await analyzeFile(f);
      const d = depth.get(f);
      for (const k of rec.keys) {
        const prev = keyMap.get(k);
        if (!prev || d < prev.depth || (d === prev.depth && rel(f) < prev.ownerFile))
          keyMap.set(k, { depth: d, ownerFile: rel(f) });
      }
      for (const dk of rec.dynamic) dynamicKeys.add(dk);
      for (const t of rec.tabs) tabs.push({ ...t, depth: d });
      for (const s of rec.settings) settings.push({ ...s, depth: d });
    }

    built.push({
      menuKey: e.menuKey,
      scope: e.scope,
      path: e.path,
      labelKey: e.labelKey,
      component: e.components.map(rel),
      tabs: applyTabOverrides(e.path, dedupeTabs(tabs)),
      settings: dedupeSettings(settings),
      keyMap,
      dynamicKeys: [...dynamicKeys].sort(byString),
    });
  }
  return built;
}

function dedupeTabs(tabs) {
  const m = new Map();
  for (const t of tabs) {
    const id = `${t.param}=${t.key}`;
    const prev = m.get(id);
    if (!prev || t.depth < prev.depth) m.set(id, t);
  }
  return [...m.values()].sort((a, b) =>
    byString(`${a.param}=${a.key}`, `${b.param}=${b.key}`),
  );
}

/** Keyed by key+group: the same title can legitimately appear in two groups. */
function dedupeSettings(settings) {
  const m = new Map();
  for (const s of settings) {
    const id = `${s.groupId ?? s.groupKey ?? ''} ${s.key}`;
    const prev = m.get(id);
    if (!prev || s.depth < prev.depth) m.set(id, s);
  }
  return [...m.values()].sort(
    (a, b) =>
      byString(a.key, b.key) || byString(a.groupId ?? '', b.groupId ?? ''),
  );
}

function applyTabOverrides(routePath, tabs) {
  const extra = TAB_OVERRIDES[routePath];
  if (!extra) return tabs;
  const m = new Map(tabs.map((t) => [`${t.param}=${t.key}`, t]));
  for (const t of extra)
    m.set(`${t.param}=${t.key}`, { ...t, primary: TAB_PARAMS.includes(t.param) });
  return [...m.values()].sort((a, b) =>
    byString(`${a.param}=${a.key}`, `${b.param}=${b.key}`),
  );
}

/**
 * Which entries each plain key survives on.
 *
 * A key below NOISE_THRESHOLD entries is page vocabulary by definition and is
 * kept wherever it appears. Above it, the raw count says nothing — deep
 * transitive imports put `session.launcher.SharedMemory` on 19 entries just as
 * surely as `button.Cancel` — so placement is decided by OWNERSHIP instead:
 *
 *   owners(k) = entries declaring k within OWNER_DEPTH hops of the route
 *   - owned by >= NOISE_THRESHOLD entries -> chrome; dropped everywhere
 *   - otherwise                           -> kept on its owners only
 *   - owned by nobody                     -> kept where it is shallowest
 */
function keyPlacement(built) {
  const depthsPerKey = new Map();
  for (const e of built)
    for (const [k, v] of e.keyMap) {
      let m = depthsPerKey.get(k);
      if (!m) depthsPerKey.set(k, (m = new Map()));
      m.set(e.path, v.depth);
    }

  const placement = new Map();
  for (const [k, depths] of depthsPerKey) {
    const owners = [...depths].filter(([, d]) => d <= OWNER_DEPTH);
    if (owners.length >= NOISE_THRESHOLD) {
      placement.set(k, new Set());
      continue;
    }
    if (depths.size < NOISE_THRESHOLD) {
      placement.set(k, new Set(depths.keys()));
      continue;
    }
    const min = Math.min(...depths.values());
    const kept = owners.length
      ? owners
      : [...depths].filter(([, d]) => d === min);
    placement.set(
      k,
      new Set(kept.map(([p]) => p)),
    );
  }
  return placement;
}

/**
 * The shipped shape. Tab labels, setting titles and setting descriptions are
 * carried by their structured hit, so they never repeat in `keys`; shared plain
 * keys are placed by `keyPlacement`.
 */
export function toIndex(built) {
  const placement = keyPlacement(built);
  const entries = built.map((e) => {
    const structured = new Set();
    for (const t of e.tabs) if (t.labelKey) structured.add(t.labelKey);
    for (const s of e.settings) {
      structured.add(s.key);
      if (s.groupKey) structured.add(s.groupKey);
      for (const d of s.descriptionKeys) structured.add(d);
    }
    return {
      menuKey: e.menuKey,
      scope: e.scope,
      path: e.path,
      labelKey: e.labelKey,
      tabs: e.tabs.map((t) => ({
        param: t.param,
        key: t.key,
        ...(t.labelKey ? { labelKey: t.labelKey } : {}),
      })),
      settings: e.settings.map((s) => ({
        key: s.key,
        ...(s.tab ? { tab: s.tab } : {}),
        ...(s.groupKey ? { groupKey: s.groupKey } : {}),
        ...(s.groupId ? { groupId: s.groupId } : {}),
        ...(s.testId ? { testId: s.testId } : {}),
        descriptionKeys: s.descriptionKeys,
      })),
      keys: [...e.keyMap.keys()]
        .filter(
          (k) =>
            !structured.has(k) &&
            k !== e.labelKey &&
            placement.get(k).has(e.path),
        )
        .sort(byString),
    };
  });
  return { version: INDEX_VERSION, generatedFrom: GENERATED_FROM, entries };
}

export const serialize = (index) => JSON.stringify(index, null, 2) + '\n';

// ---------------------------------------------------------------------------
// i18n key hygiene
// ---------------------------------------------------------------------------
function missingFromEnJson(index) {
  const en = JSON.parse(fs.readFileSync(EN_JSON, 'utf8'));
  const has = (k) => {
    let cur = en;
    for (const seg of k.split('.')) {
      if (cur && typeof cur === 'object' && seg in cur) cur = cur[seg];
      else return false;
    }
    return typeof cur === 'string';
  };
  const all = new Set();
  for (const e of index.entries) {
    if (e.labelKey) all.add(e.labelKey);
    for (const t of e.tabs) if (t.labelKey) all.add(t.labelKey);
    for (const s of e.settings) {
      all.add(s.key);
      if (s.groupKey) all.add(s.groupKey);
      for (const d of s.descriptionKeys) all.add(d);
    }
    for (const k of e.keys) all.add(k);
  }
  // `t('key', 'Fallback')` renders the fallback, so its absence is not a bug.
  const defaulted = new Set();
  for (const rec of fileCache.values())
    for (const k of rec.defaulted) defaulted.add(k);
  return [...all].filter((k) => !has(k) && !defaulted.has(k)).sort(byString);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function reportOn(built, index) {
  const placement = keyPlacement(built);
  const chrome = [...placement.values()].filter((on) => on.size === 0).length;
  const distinct = new Set(index.entries.flatMap((e) => e.keys));
  const componentOf = new Map(built.map((e) => [e.path, e.component]));
  const tabPages = index.entries.filter((e) => e.tabs.some((t) => t.param === 'tab'));
  const tabKeys = index.entries.reduce(
    (a, e) => a + e.tabs.filter((t) => t.param === 'tab').length,
    0,
  );
  const settingPages = index.entries.filter((e) => e.settings.length);
  const settingItems = index.entries.reduce((a, e) => a + e.settings.length, 0);

  console.log(`entries              ${index.entries.length}`);
  console.log(`files analysed       ${fileCache.size}`);
  console.log(
    `distinct body keys   ${distinct.size} ` +
      `(chrome dropped: ${chrome}, owner-depth ${OWNER_DEPTH})`,
  );
  console.log(`?tab= pages / keys   ${tabPages.length} / ${tabKeys}`);
  console.log(`setting pages/items  ${settingPages.length} / ${settingItems}`);
  console.log(
    `dynamic keys (unemitted) ${new Set(built.flatMap((e) => e.dynamicKeys)).size}`,
  );
  console.log('');
  console.log('menuKey'.padEnd(26) + 'path'.padEnd(44) + 'keys'.padStart(6) + 'tab'.padStart(5) + 'set'.padStart(5));
  for (const e of index.entries) {
    console.log(
      String(e.menuKey ?? '—').padEnd(26) +
        e.path.slice(0, 43).padEnd(44) +
        String(e.keys.length).padStart(6) +
        String(e.tabs.length).padStart(5) +
        String(e.settings.length).padStart(5),
    );
    // Rendered files are debugging context, not shipped index content.
    for (const c of componentOf.get(e.path) ?? []) console.log(`  ↳ ${c}`);
  }
  const skipped = parseRoutes().filter((r) => r.skipReason);
  console.log('');
  console.log(`skipped routes (${skipped.length}):`);
  for (const r of skipped) console.log(`  ${r.skipReason.padEnd(14)} ${r.path}`);
}

async function main(argv) {
  const t0 = Date.now();
  const outArg = argv.indexOf('--out');
  const outFile = outArg >= 0 ? path.resolve(argv[outArg + 1]) : OUT_FILE;

  // Route candidates only, including what was skipped and why (used by tests).
  if (argv.includes('--routes')) {
    console.log(JSON.stringify(parseRoutes(), null, 2));
    return 0;
  }

  const built = await buildEntries();
  const index = toIndex(built);
  const text = serialize(index);

  const missing = missingFromEnJson(index);
  if (missing.length)
    console.warn(
      `warning: ${missing.length} indexed key(s) absent from resources/i18n/en.json: ` +
        missing.slice(0, 10).join(', ') +
        (missing.length > 10 ? ', …' : ''),
    );

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, text);
  console.log(
    `${rel(outFile)}: ${index.entries.length} entries, ` +
      `${Buffer.byteLength(text)} B, ${Date.now() - t0} ms`,
  );
  if (argv.includes('--verbose')) reportOn(built, index);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
