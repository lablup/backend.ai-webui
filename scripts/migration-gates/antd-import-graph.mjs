#!/usr/bin/env node
/**
 * antd import-graph gate (P15) — antd → Astryx migration.
 *
 * A per-file grep for `from 'antd'` understates the antd residue by one hop:
 * a component with zero direct antd imports still renders antd if anything in
 * its import graph does (typically through a `backend.ai-ui` named import).
 * During the pilot, two renders were reported "antd-free" for three phases
 * this way. This gate closes that hole: **a file counts as antd-free only
 * when its entire transitive import graph is antd-free.**
 *
 * What it does:
 *   1. Collects every production source file under the scan roots
 *      (react/src, packages/backend.ai-ui/src, packages/backend.ai-client/src
 *      by default; tests/stories/__generated__ excluded — they don't ship).
 *   2. Parses import/export-from/require/dynamic-import specifiers.
 *   3. Marks files whose specifiers hit the antd family directly:
 *        antd, antd-style, @ant-design/*, rc-*, @rc-component/*
 *   4. Resolves relative imports and the workspace aliases
 *      (`backend.ai-ui`, `backend.ai-client` → their src trees, mirroring
 *      react/tsconfig.json `paths`) and propagates taint over the graph.
 *
 * Usage:
 *   node scripts/migration-gates/antd-import-graph.mjs [--json] [--strict]
 *     [--list tainted|clean|direct] [--root <dir>]...
 *
 * Default is informational: prints a report and exits 0. `--strict` exits 1
 * when any file is antd-reachable (the final-gate condition, part of
 * scripts/antd-zero-gate.sh part (c)).
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const DEFAULT_ROOTS = [
  "react/src",
  "packages/backend.ai-ui/src",
  "packages/backend.ai-client/src",
];

const SOURCE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const EXCLUDE_DIR = new Set(["node_modules", "__generated__", "__tests__"]);
// Non-shipping files: unit tests, stories, spec helpers.
const EXCLUDE_FILE = /\.(test|spec|stories)\.[tj]sx?$/;

/** antd-family bare specifier check (same scope as antd-zero-gate.sh). */
export function isAntdSpecifier(spec) {
  return (
    spec === "antd" ||
    spec.startsWith("antd/") ||
    spec === "antd-style" ||
    spec.startsWith("antd-style/") ||
    spec.startsWith("@ant-design/") ||
    spec === "rc-util" ||
    spec.startsWith("rc-") ||
    spec.startsWith("@rc-component/")
  );
}

/** Pull every static/dynamic import specifier out of a source file. */
export function parseSpecifiers(source) {
  const specs = new Set();
  const patterns = [
    // import x from 'y' / import 'y' / import type {..} from 'y'
    /\bimport\s+(?:[^'"]*?\bfrom\s+)?['"]([^'"]+)['"]/g,
    // export ... from 'y'
    /\bexport\s+[^'"]*?\bfrom\s+['"]([^'"]+)['"]/g,
    // dynamic import('y') / require('y')
    /\b(?:import|require)\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(source)) !== null) specs.add(m[1]);
  }
  return [...specs];
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
    } else if (SOURCE_EXT.test(e.name) && !EXCLUDE_FILE.test(e.name)) {
      out.push(join(dir, e.name));
    }
  }
  return out;
}

const RESOLVE_SUFFIXES = [
  "",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  "/index.ts",
  "/index.tsx",
  "/index.js",
];

function resolveWithSuffixes(base) {
  for (const suf of RESOLVE_SUFFIXES) {
    const candidate = base + suf;
    if (existsSync(candidate)) {
      try {
        if (statSync(candidate).isFile()) return candidate;
      } catch {
        /* ignore */
      }
    }
  }
  return null;
}

/**
 * Resolve an import specifier to an absolute repo file, or null when it is
 * external (a bare package that is not a workspace alias).
 * Mirrors react/tsconfig.json `paths`.
 */
export function resolveSpecifier(spec, fromFile, repoRoot = REPO_ROOT) {
  if (spec.startsWith(".")) {
    return resolveWithSuffixes(resolve(dirname(fromFile), spec));
  }
  const ALIASES = [
    ["backend.ai-ui", "packages/backend.ai-ui/src"],
    ["backend.ai-client", "packages/backend.ai-client/src"],
  ];
  for (const [alias, target] of ALIASES) {
    if (spec === alias) {
      return resolveWithSuffixes(join(repoRoot, target, "index"));
    }
    if (spec.startsWith(alias + "/")) {
      // `backend.ai-ui/dist/locale/*` maps back into src/locale/* (tsconfig).
      const rest = spec
        .slice(alias.length + 1)
        .replace(/^dist\/locale\//, "locale/");
      return resolveWithSuffixes(join(repoRoot, target, rest));
    }
  }
  return null; // external package
}

/**
 * Build the import graph and classify every file.
 * @returns {{files: Map<string, {specs: string[], direct: string[]}>,
 *            status: Map<string, 'direct'|'transitive'|'clean'>,
 *            hubs: Map<string, number>}}
 */
export function analyzeGraph({
  roots = DEFAULT_ROOTS,
  repoRoot = REPO_ROOT,
} = {}) {
  const files = new Map();
  for (const root of roots) {
    const abs = resolve(repoRoot, root);
    if (!existsSync(abs)) continue;
    for (const file of walk(abs, [])) {
      let source = "";
      try {
        source = readFileSync(file, "utf8");
      } catch {
        continue;
      }
      const specs = parseSpecifiers(source);
      files.set(file, {
        specs,
        direct: specs.filter(isAntdSpecifier),
      });
    }
  }

  // Edges: file -> resolved internal imports (only files inside the scan set).
  const edges = new Map();
  for (const [file, info] of files) {
    const targets = [];
    for (const spec of info.specs) {
      const resolved = resolveSpecifier(spec, file, repoRoot);
      if (resolved && files.has(resolved)) targets.push(resolved);
    }
    edges.set(file, targets);
  }

  // Taint propagation: BFS from directly-tainted files along REVERSE edges.
  const reverse = new Map();
  for (const [file, targets] of edges) {
    for (const t of targets) {
      if (!reverse.has(t)) reverse.set(t, []);
      reverse.get(t).push(file);
    }
  }

  const status = new Map();
  const queue = [];
  for (const [file, info] of files) {
    if (info.direct.length > 0) {
      status.set(file, "direct");
      queue.push(file);
    }
  }
  while (queue.length > 0) {
    const cur = queue.shift();
    for (const dependent of reverse.get(cur) ?? []) {
      if (!status.has(dependent)) {
        status.set(dependent, "transitive");
        queue.push(dependent);
      }
    }
  }
  for (const file of files.keys()) {
    if (!status.has(file)) status.set(file, "clean");
  }

  // Hubs: tainted files ranked by how many files they taint (reverse-reach).
  const hubs = new Map();
  for (const [file, st] of status) {
    if (st !== "direct") continue;
    const seen = new Set([file]);
    const q = [file];
    while (q.length > 0) {
      for (const dep of reverse.get(q.shift()) ?? []) {
        if (!seen.has(dep)) {
          seen.add(dep);
          q.push(dep);
        }
      }
    }
    hubs.set(file, seen.size - 1);
  }

  return { files, status, edges, hubs };
}

export function summarize(analysis, repoRoot = REPO_ROOT) {
  const rel = (f) => relative(repoRoot, f).split(sep).join("/");
  const byStatus = { direct: [], transitive: [], clean: [] };
  for (const [file, st] of analysis.status) byStatus[st].push(rel(file));
  for (const list of Object.values(byStatus)) list.sort();
  const hubs = [...analysis.hubs.entries()]
    .map(([file, reach]) => ({ file: rel(file), taints: reach }))
    .sort((a, b) => b.taints - a.taints);
  return {
    total: analysis.files.size,
    direct: byStatus.direct.length,
    transitive: byStatus.transitive.length,
    clean: byStatus.clean.length,
    byStatus,
    hubs,
  };
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const strict = args.includes("--strict");
  const listIdx = args.indexOf("--list");
  const list = listIdx >= 0 ? args[listIdx + 1] : null;
  const roots = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--root" && args[i + 1]) roots.push(args[++i]);
  }

  const analysis = analyzeGraph(roots.length > 0 ? { roots } : {});
  const summary = summarize(analysis);

  if (json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log("=== antd import-graph gate (P15) ===");
    console.log(
      `files: ${summary.total}  |  direct antd: ${summary.direct}  |  ` +
        `transitively antd-reachable: ${summary.transitive}  |  ` +
        `antd-free: ${summary.clean} (${((summary.clean / Math.max(summary.total, 1)) * 100).toFixed(1)}%)`,
    );
    console.log("");
    console.log(
      "Top taint hubs (direct-antd files ranked by files they taint):",
    );
    for (const hub of summary.hubs.slice(0, 15)) {
      console.log(`  ${String(hub.taints).padStart(5)}  ${hub.file}`);
    }
    if (list && summary.byStatus[list]) {
      console.log("");
      console.log(`--- ${list} files (${summary.byStatus[list].length}) ---`);
      for (const f of summary.byStatus[list]) console.log(`  ${f}`);
    }
  }

  const tainted = summary.direct + summary.transitive;
  if (strict && tainted > 0) {
    console.error(
      `\nSTRICT: ${tainted} file(s) are antd-reachable through their import graph.`,
    );
    process.exit(1);
  }
}
