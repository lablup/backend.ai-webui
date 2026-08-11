#!/usr/bin/env node
/**
 * `.ant-*` selector gate (P6/P17) — antd → Astryx migration.
 *
 * Styles and tests that target antd's generated class names (`.ant-btn`,
 * `.ant-modal-content`, …) are hidden couplings to antd's DOM: when a
 * component is migrated to Astryx those rules KEEP COMPILING and silently
 * stop applying — nothing fails until a screenshot is compared. This gate
 * makes the coupling visible so each migration slice deletes or replaces the
 * dead rules it un-anchors.
 *
 * Sections:
 *   - app source   (react/src, packages/backend.ai-ui/src): createStyles /
 *                  css template literals / .css files targeting .ant-*
 *   - e2e          (e2e/): Playwright selectors bound to antd DOM — these
 *                  must move to data-* selectors before their surface
 *                  migrates
 *
 * Usage:
 *   node scripts/migration-gates/ant-selector-gate.mjs [--json] [--strict]
 *     [--counts]
 *
 * Informational by default (exit 0); `--strict` exits 1 on any hit.
 * `--counts` prints per-file counts instead of every line (CI summaries).
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const SECTIONS = [
  {
    name: "app source",
    roots: ["react/src", "packages/backend.ai-ui/src"],
  },
  {
    name: "e2e",
    roots: ["e2e"],
  },
];

const SCAN_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|css|scss|less)$/;
// `tests` alongside `__tests__`/`__generated__`: harness directories are not
// shipping surface (to-astryx final-B — kept identical across the three gates).
const EXCLUDE_DIR = new Set([
  "node_modules",
  "__generated__",
  "__tests__",
  "tests",
]);
// antd's own class prefix at a CSS-selector boundary. The letter anchor
// avoids matching a bare trailing ".ant-" in prose.
const PATTERN = /\.ant-[a-zA-Z]/;

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

export function scanSection(roots, repoRoot = REPO_ROOT) {
  const findings = [];
  for (const root of roots) {
    const abs = resolve(repoRoot, root);
    if (!existsSync(abs)) continue;
    for (const file of walk(abs, [])) {
      let source;
      try {
        source = readFileSync(file, "utf8");
      } catch {
        continue;
      }
      if (!PATTERN.test(source)) continue;
      const rel = relative(repoRoot, file).split(sep).join("/");
      source.split("\n").forEach((line, i) => {
        if (PATTERN.test(line)) {
          findings.push({
            file: rel,
            line: i + 1,
            snippet: line.trim().slice(0, 160),
          });
        }
      });
    }
  }
  return findings;
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const strict = args.includes("--strict");
  const counts = args.includes("--counts");

  const result = {};
  let total = 0;
  for (const section of SECTIONS) {
    const findings = scanSection(section.roots);
    result[section.name] = findings;
    total += findings.length;
  }

  if (json) {
    console.log(JSON.stringify({ total, sections: result }, null, 2));
  } else {
    console.log("=== .ant-* selector gate (P6/P17) ===");
    for (const [name, findings] of Object.entries(result)) {
      const byFile = new Map();
      for (const f of findings) {
        byFile.set(f.file, (byFile.get(f.file) ?? 0) + 1);
      }
      console.log(
        `\n--- ${name}: ${findings.length} reference(s) in ${byFile.size} file(s) ---`,
      );
      if (counts) {
        const top = [...byFile.entries()].sort((a, b) => b[1] - a[1]);
        for (const [file, n] of top.slice(0, 20)) {
          console.log(`  ${String(n).padStart(5)}  ${file}`);
        }
        if (top.length > 20) console.log(`  … ${top.length - 20} more file(s)`);
      } else {
        for (const f of findings) {
          console.log(`  ${f.file}:${f.line}: ${f.snippet}`);
        }
      }
    }
    console.log(`\ntotal: ${total} .ant-* reference(s)`);
  }

  if (strict && total > 0) process.exit(1);
}
