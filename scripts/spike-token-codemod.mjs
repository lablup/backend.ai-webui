#!/usr/bin/env node
/**
 * spike-token-codemod.mjs — rewrite `import { theme } from 'antd'` to the shim.
 *
 *   node scripts/spike-token-codemod.mjs [--apply] [--only <substr>]
 *
 * Handles the two import shapes found in the repo:
 *   import { theme } from 'antd';                 -> single rewrite
 *   import { Button, theme, type X } from 'antd'; -> split into two imports
 *
 * `--only` restricts the rewrite to paths containing a substring (used to apply
 * the shim to a single page subtree).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";

const ROOT = process.cwd();
const APPLY = process.argv.includes("--apply");
const onlyIdx = process.argv.indexOf("--only");
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;
const SHIM_DIR = join(ROOT, "react/src/theme-shim");

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === "__generated__" || e === "node_modules" || e === "theme-shim")
      continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e)) out.push(p);
  }
  return out;
}

const IMPORT_RE = /import\s*\{([^}]*)\}\s*from\s*'antd';?/g;

const skippedProviders = [];
let changed = 0;
let split = 0;
const touched = [];

for (const abs of walk(join(ROOT, "react/src"))) {
  if (ONLY && !abs.includes(ONLY)) continue;
  let src = readFileSync(abs, "utf8");
  if (!/\btheme\b/.test(src)) continue;
  // antd's `theme` namespace also carries the ALGORITHM surface
  // (darkAlgorithm / defaultAlgorithm / getDesignToken). Those belong to the
  // ConfigProvider layer, not the token-consumer layer — leave them on antd.
  if (
    /\btheme\.(darkAlgorithm|defaultAlgorithm|compactAlgorithm|getDesignToken)\b/.test(
      src,
    )
  ) {
    skippedProviders.push(relative(ROOT, abs));
    continue;
  }

  let hit = false;
  const next = src.replace(IMPORT_RE, (full, inner) => {
    const specs = inner
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const themeIdx = specs.findIndex((s) => s === "theme");
    if (themeIdx === -1) return full;
    hit = true;
    const rest = specs.filter((_, i) => i !== themeIdx);
    let rel = relative(dirname(abs), SHIM_DIR).replace(/\\/g, "/");
    if (!rel.startsWith(".")) rel = "./" + rel;
    const shimImport = `import { theme } from '${rel}';`;
    if (rest.length === 0) return shimImport;
    split++;
    return `import { ${rest.join(", ")} } from 'antd';\n${shimImport}`;
  });

  if (hit) {
    changed++;
    touched.push(relative(ROOT, abs));
    if (APPLY) writeFileSync(abs, next);
  }
}

console.log(
  `${APPLY ? "rewrote" : "would rewrite"} ${changed} files (${split} needed an import split)`,
);
if (skippedProviders.length)
  console.log(
    `skipped ${skippedProviders.length} theme-ALGORITHM files (ConfigProvider layer):\n  ` +
      skippedProviders.join("\n  "),
  );
if (process.argv.includes("--list"))
  touched.forEach((f) => console.log("  " + f));
