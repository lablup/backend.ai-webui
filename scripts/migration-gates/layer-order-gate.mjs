#!/usr/bin/env node
/**
 * Cascade-layer order gate (FR-3532).
 *
 * `@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;`
 * fixes layer precedence by FIRST APPEARANCE — a later statement can append
 * names but never reorder ones already seen. So the statement has to be parsed
 * before any layered rule, and the four places that declare it must agree.
 *
 * The repo-root `index.html` copy is the one that actually decides it for the
 * app: it is static markup, so it precedes every stylesheet the bundle
 * contributes (a <link> Vite injects before </head> in a build, a runtime
 * <style> in dev). The three CSS copies cover the consumers that never load
 * that document — Storybook boots from `.storybook/astryx.css`, and
 * `backend.ai-ui/styles.css` is consumed standalone.
 *
 * Drift and misplacement both fail SILENTLY — the page renders, with Astryx's
 * defaults quietly outranking the brand theme, which is exactly the dev/build
 * divergence FR-3532 reported. Nothing else catches it: the statement is valid
 * CSS wherever it sits, and `.github/workflows/vitest.yml` does not even
 * trigger on an `index.html`-only PR. This gate runs from `scripts/verify.sh`
 * whatever changed.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export const INDEX_HTML = "index.html";
export const APP_CSS = "react/src/index.css";
export const BUI_CSS = "packages/backend.ai-ui/src/styles/backend.ai-ui.css";
export const STORYBOOK_CSS = "packages/backend.ai-ui/.storybook/astryx.css";

/** Every file that must declare the identical order. */
export const MIRRORS = [INDEX_HTML, APP_CSS, BUI_CSS, STORYBOOK_CSS];

/**
 * Names whose relative order is the bug. Agreeing on a WRONG order is exactly
 * as broken as diverging, so the mirror comparison alone does not cover it.
 */
export const REQUIRED_ORDER = [
  "reset",
  "theme",
  "base",
  "astryx-base",
  "astryx-theme",
  "components",
  "utilities",
];

const LAYER_STATEMENT_RE =
  /@layer\s+([a-zA-Z][\w-]*(?:\s*,\s*[a-zA-Z][\w-]*)+)\s*;/;

/** `/* … *\/` comments, so "first rule" is not confused by a doc header. */
export const stripCssComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "");

/**
 * Blank out `<!-- … -->` bodies, keeping length so the index comparisons below
 * stay comparable with the raw text. A statement quoted in a comment declares
 * nothing, and neither does a commented-out `<link>`.
 */
export const blankHtmlComments = (text) =>
  text.replace(/<!--[\s\S]*?-->/g, (match) => " ".repeat(match.length));

/**
 * The layer-order statement in a CSS or HTML text.
 * @returns {{names: string[], index: number} | null}
 */
export function parseLayerOrder(text) {
  const match = LAYER_STATEMENT_RE.exec(text);
  if (!match) return null;
  return {
    names: match[1].split(",").map((name) => name.trim()),
    index: match.index,
  };
}

/**
 * @returns {{failures: string[], names: string[]|null}}
 */
export function runLayerOrderGate({ repoRoot = REPO_ROOT } = {}) {
  const failures = [];
  const read = (rel) => {
    const abs = resolve(repoRoot, rel);
    return existsSync(abs) ? readFileSync(abs, "utf8") : null;
  };

  const texts = new Map();
  for (const rel of MIRRORS) {
    const text = read(rel);
    if (text === null) failures.push(`missing file: ${rel}`);
    else texts.set(rel, text);
  }
  if (failures.length > 0) return { failures, names: null };

  // 1. Every mirror declares one, and they declare the SAME one.
  const declared = new Map();
  for (const rel of MIRRORS) {
    const parsed = parseLayerOrder(
      rel.endsWith(".css")
        ? stripCssComments(texts.get(rel))
        : stripCssComments(blankHtmlComments(texts.get(rel))),
    );
    if (parsed === null) {
      failures.push(
        `${rel}: no \`@layer a, b, …;\` order statement. Astryx's layer ` +
          "precedence would be decided by whichever sheet loads first.",
      );
    } else {
      declared.set(rel, parsed.names);
    }
  }
  if (declared.size < MIRRORS.length) return { failures, names: null };

  const reference = declared.get(INDEX_HTML);
  for (const rel of MIRRORS) {
    const names = declared.get(rel);
    if (names.join(", ") !== reference.join(", ")) {
      failures.push(
        `${rel} declares \`${names.join(", ")}\` but ${INDEX_HTML} declares ` +
          `\`${reference.join(", ")}\`. Divergent statements are not ` +
          "idempotent — the first one parsed silently wins.",
      );
    }
  }

  // 2. The agreed order must be the CORRECT one — every required name present,
  //    in the required relative order. `verify.sh` runs this module directly,
  //    so this cannot live only in the Vitest suite.
  const missing = REQUIRED_ORDER.filter((name) => !reference.includes(name));
  if (missing.length > 0) {
    failures.push(
      `the declared order omits ${missing.join(", ")}. Any layer name it does ` +
        "not list is registered by whichever sheet uses it first.",
    );
  } else {
    const positions = REQUIRED_ORDER.map((name) => reference.indexOf(name));
    const ascending = positions.every((at, i) => i === 0 || at > positions[i - 1]);
    if (!ascending) {
      failures.push(
        `the declared order is \`${reference.join(", ")}\`, which is not the ` +
          `required precedence \`${REQUIRED_ORDER.join(", ")}\`. Mirrors that ` +
          "agree on a wrong order reproduce the FR-3532 bug in every consumer.",
      );
    }
  }

  // 3. In index.html the statement must precede every stylesheet, including
  //    the bundle's (injected at the REACT_BUNDLE_INJECTING marker in a build,
  //    appended to <head> at runtime in dev).
  const html = texts.get(INDEX_HTML);
  const scannable = blankHtmlComments(html);
  const statementAt = parseLayerOrder(stripCssComments(scannable)).index;
  const firstSheetAt = scannable.search(/<link\b[^>]*rel=["']stylesheet["']/i);
  if (firstSheetAt !== -1 && statementAt > firstSheetAt) {
    failures.push(
      `${INDEX_HTML}: the @layer statement sits after the first ` +
        '<link rel="stylesheet">. Move it above every stylesheet in <head>.',
    );
  }
  const bundleAt = html.indexOf("<!-- REACT_BUNDLE_INJECTING FOR DEV-->");
  if (bundleAt !== -1 && statementAt > bundleAt) {
    failures.push(
      `${INDEX_HTML}: the @layer statement sits after the bundle injection ` +
        "marker, so the app's own layered CSS registers first.",
    );
  }

  // 4. …and it must be the first rule of the document's FIRST <style>. An
  //    inline block is a stylesheet too, so one above it registers names first.
  const firstStyle = /<style\b[^>]*>([\s\S]*?)<\/style>/i.exec(scannable);
  if (firstStyle) {
    const body = stripCssComments(firstStyle[1]).trimStart();
    const parsed = parseLayerOrder(body);
    if (parsed === null || parsed.index !== 0) {
      failures.push(
        `${INDEX_HTML}: the first inline <style> does not open with the ` +
          "@layer order statement — whatever it declares registers first.",
      );
    }
  }

  // 5. In each CSS mirror it must still be the FIRST rule of the file.
  for (const rel of MIRRORS.filter((rel) => rel.endsWith(".css"))) {
    const body = stripCssComments(texts.get(rel)).trimStart();
    if (parseLayerOrder(body).index !== 0) {
      failures.push(
        `${rel}: the @layer statement is not the first rule of the file — ` +
          "whatever precedes it may already have registered a layer name.",
      );
    }
  }

  return { failures, names: reference };
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const args = process.argv.slice(2);
  let repoRoot = REPO_ROOT;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--repo-root" && args[i + 1]) repoRoot = args[++i];
  }
  const result = runLayerOrderGate({ repoRoot });

  if (args.includes("--json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("=== cascade-layer order gate (FR-3532) ===");
    console.log(
      `order: ${result.names ? result.names.join(", ") : "(unreadable)"}  |  ` +
        `problems: ${result.failures.length}`,
    );
    for (const f of result.failures) console.log(`\n  ${f}`);
    if (result.failures.length > 0) {
      console.log(
        `\n${INDEX_HTML} is the statement that decides the document's layer` +
          " order; the CSS copies mirror it.",
      );
    }
  }

  if (result.failures.length > 0) process.exit(1);
}
