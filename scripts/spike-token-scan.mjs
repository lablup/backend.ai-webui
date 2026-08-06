#!/usr/bin/env node
/**
 * spike-token-scan.mjs — extract the ACTUAL antd design-token usage surface.
 *
 * Scans react/src + packages/backend.ai-ui/src (excluding __generated__) for
 * `token.<name>` member accesses on the object returned by antd's
 * `theme.useToken()` and on the `token` param of antd-style `createStyles`.
 *
 * For every reference it classifies the *consumption context*, because a
 * CSS-var-backed shim returns `"var(--x)"` strings and those break:
 *   - arithmetic            token.marginXS * 2          -> NaN
 *   - unit-suffixed interp  `${token.paddingSM}px`      -> "var(--x)px" (invalid CSS)
 *   - hex-alpha concat      `${token.colorPrimary}20`   -> "var(--x)20" (invalid CSS)
 *   - numeric JS consumer   width={token.controlHeight} (charts/canvas/props typed number)
 * ...but are fine for:
 *   - style/css value       style={{ padding: token.paddingSM }}
 *   - bare interpolation    `${token.colorBorder}` inside a css`` rule
 *
 * Output: JSON on stdout (--json) or a human table.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const ROOTS = ["react/src", "packages/backend.ai-ui/src"];
const EXT = /\.(tsx?|jsx?)$/;

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === "__generated__" || e === "node_modules") continue;
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (EXT.test(e)) out.push(p);
  }
  return out;
}

const files = ROOTS.flatMap((r) => walk(join(ROOT, r)));

// ---------------------------------------------------------------- classifiers

const ARITH_BEFORE = /[*/%+-]\s*$/;
const ARITH_AFTER = /^\s*[*/%]|^\s*[+-]\s*(?:\d|token\.|[A-Za-z_$])/;
const UNIT_AFTER = /^(px|rem|em|%|vh|vw|ch|deg|s|ms)\b/;
const HEXALPHA_AFTER = /^[0-9a-fA-F]{2}\b/;
// numeric-typed JSX props / JS consumers commonly fed a token
const NUMERIC_CONSUMER =
  /(?:width|height|size|strokeWidth|radius|fontSize|top|bottom|left|right|x|y|r|dx|dy|cx|cy|thickness|barSize|gap|indent|itemSize|scrollY)\s*=\s*\{\s*$/;

// `token.colorPrimary.slice(1,3)` / `.replace(` etc. — assumes a literal hex/px string
const STROPS_AFTER = /^\s*\.\s*([A-Za-z_$][A-Za-z0-9_$]*)/;
// `generate(token.colorPrimary)` — passed straight into a JS function
const FNARG_BEFORE = /\b([A-Za-z_$][A-Za-z0-9_$]*)\s*\(\s*$/;
const FN_ALLOWLIST =
  /^(if|for|while|switch|return|typeof|Number|String|parseInt|parseFloat)$/;
// JSX attributes that end up as SVG presentation attributes / canvas values
const SVGATTR_BEFORE =
  /\b(stroke|fill|strokeColor|color|strokeWidth|dominantBaseline)\s*=\s*\{\s*$/;

const results = new Map(); // name -> {refs, files:Set, ctx:{...}, sites:[]}
const perFile = new Map();

function record(name, file, line, kind, snippet) {
  let r = results.get(name);
  if (!r) {
    r = {
      name,
      refs: 0,
      files: new Set(),
      ctx: {
        plain: 0,
        arith: 0,
        unit: 0,
        hexalpha: 0,
        numericProp: 0,
        strOps: 0,
        fnArg: 0,
        svgAttr: 0,
      },
      breakSites: [],
    };
    results.set(name, r);
  }
  r.refs++;
  r.files.add(file);
  r.ctx[kind]++;
  if (kind !== "plain") r.breakSites.push({ file, line, kind, snippet });
}

const summary = {
  filesScanned: files.length,
  useTokenFiles: 0,
  createStylesFiles: 0,
  bothFiles: 0,
};

const MEMBER = /\btoken\.([A-Za-z_$][A-Za-z0-9_$]*)/g;

for (const abs of files) {
  const src = readFileSync(abs, "utf8");
  if (!src.includes("token.")) continue;
  const rel = relative(ROOT, abs);

  const hasUseToken = /useToken\s*\(\s*\)/.test(src);
  const hasCreateStyles =
    /createStyles\s*\(\s*\(\s*\{[^}]*\btoken\b/.test(src) ||
    /createStyles\s*\(\s*\(\s*\{[^}]*\}\s*,/.test(src);
  if (hasUseToken) summary.useTokenFiles++;
  if (hasCreateStyles) summary.createStylesFiles++;
  if (hasUseToken && hasCreateStyles) summary.bothFiles++;
  if (!hasUseToken && !hasCreateStyles) continue; // some other `token.` (e.g. auth token)

  const lines = src.split("\n");
  let offset = 0;
  const lineStarts = lines.map((l) => {
    const s = offset;
    offset += l.length + 1;
    return s;
  });
  const lineOf = (idx) => {
    let lo = 0,
      hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= idx) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  };

  MEMBER.lastIndex = 0;
  let m;
  while ((m = MEMBER.exec(src))) {
    const name = m[1];
    // skip obvious non-design-token `token.` objects
    if (
      /^(access_token|refresh_token|value|type|length|toString|raw|slice|replace|split|trim|map|filter|includes|startsWith|id|name|key|label)$/.test(
        name,
      )
    )
      continue;
    const start = m.index;
    const end = start + m[0].length;
    const before = src.slice(Math.max(0, start - 60), start);
    const after = src.slice(end, end + 40);
    const ln = lineOf(start);
    const snippet = lines[ln].trim().slice(0, 120);

    let kind = "plain";
    // In a template literal? `${token.x}` -> look past the closing brace
    const closing = after.match(/^\s*\}/);
    const strop = after.match(STROPS_AFTER);
    const fnb = before.match(FNARG_BEFORE);
    if (strop && name !== "Layout") kind = "strOps";
    else if (ARITH_BEFORE.test(before) || ARITH_AFTER.test(after))
      kind = "arith";
    else if (closing) {
      const rest = after.slice(closing[0].length);
      if (UNIT_AFTER.test(rest)) kind = "unit";
      else if (HEXALPHA_AFTER.test(rest)) kind = "hexalpha";
    } else if (fnb && !FN_ALLOWLIST.test(fnb[1])) kind = "fnArg";
    else if (SVGATTR_BEFORE.test(before)) kind = "svgAttr";
    else if (NUMERIC_CONSUMER.test(before)) kind = "numericProp";

    record(name, rel, ln + 1, kind, snippet);
    const pf = perFile.get(rel) ?? { refs: 0, tokens: new Set() };
    pf.refs++;
    pf.tokens.add(name);
    perFile.set(rel, pf);
  }
}

const rows = [...results.values()].sort((a, b) => b.refs - a.refs);
const totals = rows.reduce(
  (acc, r) => {
    acc.refs += r.refs;
    for (const k of Object.keys(r.ctx)) acc[k] += r.ctx[k];
    return acc;
  },
  {
    refs: 0,
    plain: 0,
    arith: 0,
    unit: 0,
    hexalpha: 0,
    numericProp: 0,
    strOps: 0,
    fnArg: 0,
    svgAttr: 0,
  },
);

const payload = {
  summary: { ...summary, distinctTokens: rows.length, ...totals },
  tokens: rows.map((r) => ({
    name: r.name,
    refs: r.refs,
    files: r.files.size,
    ...r.ctx,
    breakSites: r.breakSites,
  })),
  perFile: [...perFile.entries()]
    .map(([f, v]) => ({ file: f, refs: v.refs, distinct: v.tokens.size }))
    .sort((a, b) => b.refs - a.refs),
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(payload, null, 2));
} else {
  console.log("=== summary ===");
  console.log(JSON.stringify(payload.summary, null, 2));
  console.log(
    "\n=== tokens (name  refs  files  plain arith unit hexalpha numProp) ===",
  );
  for (const t of payload.tokens) {
    console.log(
      `${t.name.padEnd(30)} ${String(t.refs).padStart(4)} ${String(t.files).padStart(4)}  ` +
        `${String(t.plain).padStart(4)} ${String(t.arith).padStart(4)} ` +
        `${String(t.unit).padStart(4)} ${String(t.hexalpha).padStart(4)} ${String(t.numericProp).padStart(4)}`,
    );
  }
}
