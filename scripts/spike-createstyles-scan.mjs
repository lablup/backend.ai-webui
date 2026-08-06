#!/usr/bin/env node
/**
 * spike-createstyles-scan.mjs — what does antd-style's `createStyles` actually
 * use its injected `token` param for?
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const ROOTS = ["react/src", "packages/backend.ai-ui/src"];

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === "__generated__" || e === "node_modules") continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e)) out.push(p);
  }
  return out;
}

const files = ROOTS.flatMap((r) => walk(join(ROOT, r)));
const stats = {
  antdStyleFiles: 0,
  createStylesFiles: 0,
  withTokenParam: 0,
  cssOnly: 0,
  otherAntdStyleImports: new Map(),
  tokenRefsInCss: 0,
  tokenRefsInterpolatedWithUnit: 0,
  tokenNames: new Map(),
};

for (const abs of files) {
  const src = readFileSync(abs, "utf8");
  if (!/from 'antd-style'/.test(src)) continue;
  stats.antdStyleFiles++;
  const rel = relative(ROOT, abs);

  const imp = src.match(/import\s*\{([^}]*)\}\s*from\s*'antd-style'/);
  if (imp) {
    for (const sp of imp[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)) {
      if (sp === "createStyles") continue;
      stats.otherAntdStyleImports.set(
        sp,
        (stats.otherAntdStyleImports.get(sp) ?? 0) + 1,
      );
    }
  }

  if (!/createStyles\s*\(/.test(src)) continue;
  stats.createStylesFiles++;
  const hasToken = /createStyles\s*\(\s*\(\s*\{[^}]*\btoken\b/.test(src);
  if (hasToken) stats.withTokenParam++;
  else stats.cssOnly++;

  // every `${token.x}` inside the createStyles body
  const body = src.slice(src.indexOf("createStyles"));
  for (const m of body.matchAll(
    /\$\{\s*token\.([A-Za-z0-9_$]+)[^}]*\}([A-Za-z%]*)/g,
  )) {
    stats.tokenRefsInCss++;
    if (m[2]) stats.tokenRefsInterpolatedWithUnit++;
    stats.tokenNames.set(m[1], (stats.tokenNames.get(m[1]) ?? 0) + 1);
  }
}

console.log("antd-style importing files          :", stats.antdStyleFiles);
console.log("  ... that call createStyles        :", stats.createStylesFiles);
console.log("      with a `token` callback param :", stats.withTokenParam);
console.log("      css-only (no token)           :", stats.cssOnly);
console.log("`${token.x}` refs inside css``      :", stats.tokenRefsInCss);
console.log(
  "  ... immediately followed by a unit:",
  stats.tokenRefsInterpolatedWithUnit,
);
console.log(
  "\nother antd-style imports in use:\n  " +
    [...stats.otherAntdStyleImports.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} (${v})`)
      .join("\n  "),
);
console.log(
  "\ntop tokens used inside createStyles:\n  " +
    [...stats.tokenNames.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([k, v]) => `${k} (${v})`)
      .join(", "),
);
