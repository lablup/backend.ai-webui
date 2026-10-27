#!/usr/bin/env node
/**
 * Rewrite `@astryxdesign/*` import specifiers to their `@lablup/ui-common`
 * mirrors (ADR 0009, section 1).
 *
 *   node scripts/ui-common-codemod.mjs          # rewrite, print counts per row
 *   node scripts/ui-common-codemod.mjs --check  # rewrite nothing, exit 1 if any remain
 *
 * Idempotent: re-run it after a rebase brings in new `@astryxdesign/*` imports.
 * Only quoted specifiers ('…' / "…") are rewritten; backtick references in
 * comments name upstream source paths and stay. The ADR's exempt files and
 * the `Dialog` subpath (excluded from the mirror) are left alone.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROOTS = [
  "react/src",
  "packages/backend.ai-ui/src",
  "packages/backend.ai-ui/.storybook",
];
const EXT = /\.(ts|tsx|mts|js|jsx|mjs|css)$/;
const SKIP_DIR = new Set(["node_modules", "__generated__", "dist"]);
const EXEMPT = [
  /^react\/src\/astryx-theme\/built\//,
  /\.doc\.ts$/,
  /^packages\/backend\.ai-ui\/src\/astryx-docs\//,
  /^packages\/backend\.ai-ui\/src\/astryx-theme-augmentations\.d\.ts$/,
];
/** Core subpaths ui-common does not mirror; their files keep the core import. */
const EXCLUDED_CORE = new Set(["Dialog"]);

const ucExports = new Set(
  Object.keys(
    JSON.parse(
      readFileSync(
        createRequire(join(ROOT, "react/package.json")).resolve(
          "@lablup/ui-common/package.json",
        ),
        "utf8",
      ),
    ).exports,
  ),
);
const mirrored = (sub) =>
  ucExports.has(`./${sub}`) ||
  (/^locales\/[^/]+\.json$/.test(sub) && ucExports.has("./locales/*.json"));

// One row per line of the ADR's mapping table, most specific first.
const ROWS = [
  ["CSS core/reset.css", /^@astryxdesign\/core\/reset\.css$/, () => "@lablup/ui-common/reset.css"],
  ["CSS core/astryx.css", /^@astryxdesign\/core\/astryx\.css$/, () => "@lablup/ui-common/astryx.css"],
  ["CSS lab/lab.css", /^@astryxdesign\/lab\/lab\.css$/, () => "@lablup/ui-common/lab/lab.css"],
  ["CSS theme-neutral/theme.css", /^@astryxdesign\/theme-neutral\/theme\.css$/, () => "@lablup/ui-common/theme/neutral/theme.css"],
  ["core/theme/tokens.stylex", /^@astryxdesign\/core\/theme\/tokens\.stylex$/, () => "@lablup/ui-common/theme/tokens.stylex"],
  ["core/locales/<file>.json", /^@astryxdesign\/core\/(locales\/[^/]+\.json)$/, (m) => `@lablup/ui-common/${m[1]}`],
  ["lab", /^@astryxdesign\/lab$/, () => "@lablup/ui-common/lab"],
  ["theme-neutral", /^@astryxdesign\/theme-neutral(\/built)?$/, (m) => `@lablup/ui-common/theme/neutral${m[1] ?? ""}`],
  ["core/<X>", /^@astryxdesign\/core\/(.+)$/, (m) => `@lablup/ui-common/${m[1]}`],
  ["core (root)", /^@astryxdesign\/core$/, () => "@lablup/ui-common"],
];

const SPEC = /(['"])(@astryxdesign\/[^'"\s]+)\1/g;

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (EXT.test(entry.name)) yield full;
  }
}

const check = process.argv.includes("--check");
const counts = Object.fromEntries(ROWS.map(([name]) => [name, 0]));
const left = [];
let filesChanged = 0;

for (const root of ROOTS) {
  for (const file of walk(join(ROOT, root))) {
    const rel = relative(ROOT, file);
    if (EXEMPT.some((re) => re.test(rel))) continue;
    const text = readFileSync(file, "utf8");
    const next = text.replace(SPEC, (whole, quote, spec) => {
      for (const [name, re, to] of ROWS) {
        const m = spec.match(re);
        if (!m) continue;
        const sub = spec.replace(/^@astryxdesign\/core\/?/, "");
        if (name === "core/<X>" && (EXCLUDED_CORE.has(sub.split("/")[0]) || !mirrored(sub))) {
          left.push(`${rel}: ${spec}`);
          return whole;
        }
        counts[name] += 1;
        return `${quote}${to(m)}${quote}`;
      }
      left.push(`${rel}: ${spec}`);
      return whole;
    });
    if (next !== text) {
      filesChanged += 1;
      if (!check) writeFileSync(file, next);
    }
  }
}

const total = Object.values(counts).reduce((a, b) => a + b, 0);
console.log(`${check ? "would rewrite" : "rewrote"} ${total} specifier(s) in ${filesChanged} file(s)`);
for (const [name, n] of Object.entries(counts)) console.log(`  ${String(n).padStart(5)}  ${name}`);
if (left.length) {
  console.log(`left as @astryxdesign/* (${left.length}):`);
  for (const line of left) console.log(`  ${line}`);
}
process.exit(check && total > 0 ? 1 : 0);
