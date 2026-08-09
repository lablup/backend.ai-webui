#!/usr/bin/env node
/**
 * Undeclared `var()` token gate (P19) — antd → Astryx migration.
 *
 * A `var(--name)` whose custom property is never declared fails SILENTLY:
 *   - with a fallback (`var(--radius-md, 6px)`) the literal wins forever —
 *     the token never participates in theming;
 *   - without a fallback the whole declaration is invalid at
 *     computed-value time — the property falls back to inherit/initial.
 * Neither case produces a compiler, lint, or runtime error. The declared set
 * is not guessable (e.g. Astryx's text ramp is primary/secondary/disabled/
 * accent plus named hues — there is no `--color-text-tertiary` and no
 * `--color-text-error`; the semantic error token is the solid
 * `--color-error`).
 *
 * This gate cross-checks every `var(--…)` USED in app source against the
 * set of custom properties DECLARED by:
 *   1. @astryxdesign/core (dist/astryx.css + src/reset.css)
 *   2. @astryxdesign/theme-neutral (dist/theme.css)
 *   3. the built brand theme (react/src/astryx-theme/built/*.css)
 *   4. the scanned source itself (CSS `--x: …` declarations and
 *      JS/TSX object keys `'--x': …`, including inline setProperty maps)
 *
 * Dynamic constructions (`var(--token-${…}`) cannot be verified statically
 * and are reported separately.
 *
 * Usage:
 *   node scripts/migration-gates/astryx-token-gate.mjs [--json] [--strict]
 *     [--scan-root <dir>]... [--declared-css <file>]...
 *
 * `--scan-root` / `--declared-css` replace the defaults entirely (used by
 * the vitest suite to prove detection against fixture files).
 * Informational by default (exit 0); `--strict` exits 1 on any undeclared
 * usage.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export const DEFAULT_SCAN_ROOTS = [
  "react/src",
  "react/theme-probe",
  "packages/backend.ai-ui/src",
];

export const DEFAULT_DECLARED_CSS = [
  "react/node_modules/@astryxdesign/core/dist/astryx.css",
  "react/node_modules/@astryxdesign/core/src/reset.css",
  "react/node_modules/@astryxdesign/theme-neutral/dist/theme.css",
  "react/src/astryx-theme/built/backendai-default-built.css",
];

const SCAN_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|css|scss|less|html)$/;
// `tests` alongside `__tests__`/`__generated__`: harness directories are not
// shipping surface (to-astryx final-B — kept identical across the three gates).
const EXCLUDE_DIR = new Set([
  "node_modules",
  "__generated__",
  "__tests__",
  "tests",
]);

/** Custom-property declarations in CSS text: `--name: value`. */
export function parseDeclaredCss(text) {
  const names = new Set();
  const re = /(?:^|[{;\s'"(])(--[a-zA-Z0-9_-]+)\s*:/g;
  let m;
  while ((m = re.exec(text)) !== null) names.add(m[1]);
  return names;
}

/**
 * Custom-property declarations authored in JS/TSX:
 *   - quoted object keys: `'--x': value` (style objects, stylex vars maps)
 *   - setProperty('--x', …)
 */
export function parseDeclaredJs(text) {
  const names = new Set();
  const patterns = [
    /['"](--[a-zA-Z0-9_-]+)['"]\s*:/g,
    /setProperty\(\s*['"](--[a-zA-Z0-9_-]+)['"]/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text)) !== null) names.add(m[1]);
  }
  return names;
}

/**
 * Blank out JS/TS comments (block comments and full-line `//` / docblock `*`
 * lines) while preserving line structure, so prose mentioning `var(--x)`
 * doesn't count as a usage. Deliberately does NOT strip trailing `//` after
 * code (URL-in-string hazard) — full-line comments cover the observed
 * false positives.
 */
export function stripJsComments(text) {
  const blanked = text.replace(/\/\*[\s\S]*?\*\//g, (m) =>
    m.replace(/[^\n]/g, " "),
  );
  return blanked
    .split("\n")
    .map((line) => (/^\s*(\/\/|\*)/.test(line) ? "" : line))
    .join("\n");
}

/**
 * `var()` usages in any source text. Returns
 *   { usages: [{name, line, fallback}], dynamic: [{line, snippet}] }.
 *
 * Every `var(--name` occurrence counts as a usage — including vars nested
 * inside another var's fallback (`var(--a, var(--b, 8px))` yields BOTH
 * `--a` and `--b`), since an undeclared nested name is exactly the P19
 * silent-failure pattern. `fallback` is the balanced fallback expression
 * when present, else null — a fallback makes the failure EXTRA silent (the
 * literal wins forever).
 */
export function parseUsages(text, { comments = "keep" } = {}) {
  const scanned = comments === "strip-js" ? stripJsComments(text) : text;
  const usages = [];
  const dynamic = [];
  const lines = scanned.split("\n");
  const nameRe = /var\(\s*(--[a-zA-Z0-9_-]+)\s*([,)])?/g;
  const dynamicRe = /var\(\s*(?:--[a-zA-Z0-9_-]*)?(?:\$\{|['"]\s*\+)/;
  lines.forEach((lineText, i) => {
    let m;
    while ((m = nameRe.exec(lineText)) !== null) {
      // A name spliced by a template literal (`var(--token-${…}`) is not a
      // complete static name — the dynamic bucket reports it instead.
      const nameEnd = m.index + m[0].indexOf(m[1]) + m[1].length;
      if (lineText[nameEnd] === "$") continue;
      let fallback = null;
      if (m[2] === ",") {
        // Balanced-paren scan from just after the comma to the var()'s
        // closing paren, so nested var() fallbacks come out whole.
        let depth = 1;
        let j = m.index + m[0].length;
        const start = j;
        while (j < lineText.length && depth > 0) {
          if (lineText[j] === "(") depth++;
          else if (lineText[j] === ")") depth--;
          if (depth > 0) j++;
        }
        fallback = lineText.slice(start, j).trim();
      }
      usages.push({ name: m[1], line: i + 1, fallback });
    }
    if (dynamicRe.test(lineText)) {
      dynamic.push({ line: i + 1, snippet: lineText.trim().slice(0, 160) });
    }
  });
  return { usages, dynamic };
}

function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (!EXCLUDE_DIR.has(e.name)) walk(join(dir, e.name), out);
    } else if (SCAN_EXT.test(e.name)) {
      out.push(join(dir, e.name));
    }
  }
  return out;
}

/** Nearest declared names for a typo/near-miss hint (cheap prefix scoring). */
function suggest(name, declared) {
  const score = (a, b) => {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return i;
  };
  return [...declared]
    .map((d) => ({ d, s: score(name, d) }))
    .filter(({ s }) => s >= 8) // beyond the shared '--color-'-ish prefix
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map(({ d }) => d);
}

export const DEFAULT_ALLOWLIST =
  "scripts/migration-gates/token-gate.allowlist.json";

function loadAllowlist(repoRoot, allowlistPath) {
  if (!allowlistPath) return { prefixes: [], names: new Set() };
  const abs = resolve(repoRoot, allowlistPath);
  if (!existsSync(abs)) return { prefixes: [], names: new Set() };
  try {
    const raw = JSON.parse(readFileSync(abs, "utf8"));
    return {
      prefixes: (raw.prefixes ?? []).map((p) => p.prefix),
      names: new Set((raw.names ?? []).map((n) => n.name ?? n)),
    };
  } catch {
    return { prefixes: [], names: new Set() };
  }
}

/**
 * Run the gate.
 * @returns {{declaredCount: number, usedCount: number,
 *            undeclared: [{name, file, line, fallback, suggestions}],
 *            allowlisted: [{name, file, line, fallback}],
 *            dynamic: [{file, line, snippet}]}}
 */
export function runTokenGate({
  repoRoot = REPO_ROOT,
  scanRoots = DEFAULT_SCAN_ROOTS,
  declaredCss = DEFAULT_DECLARED_CSS,
  allowlist = DEFAULT_ALLOWLIST,
} = {}) {
  const allow = loadAllowlist(repoRoot, allowlist);
  const declared = new Set();
  const missingDeclaredSources = [];
  for (const cssPath of declaredCss) {
    const abs = resolve(repoRoot, cssPath);
    if (!existsSync(abs)) {
      missingDeclaredSources.push(cssPath);
      continue;
    }
    for (const name of parseDeclaredCss(readFileSync(abs, "utf8"))) {
      declared.add(name);
    }
  }

  // Collect scan files, then self-declarations BEFORE checking usages —
  // an app-declared property (e.g. a --general-* var set via setProperty or
  // a style object) is a legitimate declaration.
  const files = [];
  for (const root of scanRoots) {
    const abs = resolve(repoRoot, root);
    if (existsSync(abs)) walk(abs, files);
  }
  const sources = new Map();
  for (const file of files) {
    try {
      sources.set(file, readFileSync(file, "utf8"));
    } catch {
      /* ignore */
    }
  }
  for (const [file, text] of sources) {
    const parse = file.endsWith(".css") ? parseDeclaredCss : parseDeclaredJs;
    for (const name of parse(text)) declared.add(name);
  }

  const undeclared = [];
  const allowlisted = [];
  const dynamic = [];
  let usedCount = 0;
  const rel = (f) => relative(repoRoot, f).split(sep).join("/");
  const isAllowed = (name) =>
    allow.names.has(name) || allow.prefixes.some((p) => name.startsWith(p));
  for (const [file, text] of sources) {
    if (!text.includes("var(")) continue;
    const isCssLike = /\.(css|scss|less|html)$/.test(file);
    const { usages, dynamic: dyn } = parseUsages(text, {
      comments: isCssLike ? "keep" : "strip-js",
    });
    usedCount += usages.length;
    for (const u of usages) {
      if (declared.has(u.name)) continue;
      if (isAllowed(u.name)) {
        allowlisted.push({ ...u, file: rel(file) });
      } else {
        undeclared.push({
          ...u,
          file: rel(file),
          suggestions: suggest(u.name, declared),
        });
      }
    }
    for (const d of dyn) dynamic.push({ ...d, file: rel(file) });
  }

  return {
    declaredCount: declared.size,
    usedCount,
    undeclared,
    allowlisted,
    dynamic,
    missingDeclaredSources,
  };
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const strict = args.includes("--strict");
  const scanRoots = [];
  const declaredCss = [];
  let allowlist = DEFAULT_ALLOWLIST;
  let repoRoot = REPO_ROOT;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--scan-root" && args[i + 1]) scanRoots.push(args[++i]);
    if (args[i] === "--declared-css" && args[i + 1])
      declaredCss.push(args[++i]);
    if (args[i] === "--allowlist" && args[i + 1]) allowlist = args[++i];
    if (args[i] === "--no-allowlist") allowlist = null;
    if (args[i] === "--repo-root" && args[i + 1]) repoRoot = args[++i];
  }

  const result = runTokenGate({
    repoRoot,
    ...(scanRoots.length > 0 ? { scanRoots } : {}),
    ...(declaredCss.length > 0 ? { declaredCss } : {}),
    allowlist,
  });

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("=== undeclared var() token gate (P19) ===");
    console.log(
      `declared custom properties: ${result.declaredCount}  |  ` +
        `var() usages checked: ${result.usedCount}  |  ` +
        `undeclared: ${result.undeclared.length}  |  ` +
        `allowlisted hooks: ${result.allowlisted.length}  |  ` +
        `dynamic (unverifiable): ${result.dynamic.length}`,
    );
    for (const src of result.missingDeclaredSources) {
      console.log(`  (declared-source missing, skipped: ${src})`);
    }
    for (const u of result.undeclared) {
      const silent = u.fallback
        ? `fallback '${u.fallback}' wins forever`
        : "declaration invalid -> inherit/initial";
      console.log(`\n  ${u.file}:${u.line}  var(${u.name})  [${silent}]`);
      if (u.suggestions.length > 0) {
        console.log(`    did you mean: ${u.suggestions.join(", ")}`);
      }
    }
    if (result.dynamic.length > 0) {
      console.log("\n--- dynamic var() constructions (verify manually) ---");
      for (const d of result.dynamic) {
        console.log(`  ${d.file}:${d.line}: ${d.snippet}`);
      }
    }
  }

  if (strict && result.undeclared.length > 0) process.exit(1);
}
