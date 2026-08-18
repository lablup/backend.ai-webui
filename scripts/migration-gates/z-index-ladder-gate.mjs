#!/usr/bin/env node
/**
 * z-index ladder mirror gate (FR-3578 T10).
 *
 * `packages/backend.ai-ui/src/styles/zIndexLadder.ts` is the one declaration of
 * every full-window stacking layer; `zIndexLadder.css` and the repo-root
 * `index.html` critical <style> (parsed before any JS runs) HAND-MIRROR it
 * because they cannot import it.
 *
 * Drift fails SILENTLY — a login screen painting under an opaque boot curtain,
 * with no compiler, lint or test error. A vitest assertion cannot guard it:
 * `.github/workflows/vitest.yml` triggers only on `react/src/**`,
 * `packages/backend.ai-ui/src/**`, `scripts/**` and `src/**`, so a PR touching
 * ONLY `index.html` runs zero test jobs. This gate runs from `scripts/verify.sh`
 * whatever changed.
 *
 * Also pinned: `@astryxdesign/lab`'s non-modal `Drawer` / `BottomSheet` base of
 * 1000 — the one off-ladder value the ladder must not collide with, since
 * `loginSideHelp` (1060) straddles it.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export const LADDER_TS = "packages/backend.ai-ui/src/styles/zIndexLadder.ts";
export const LADDER_CSS = "packages/backend.ai-ui/src/styles/zIndexLadder.css";
export const INDEX_HTML = "index.html";
export const LAB_CSS = "react/node_modules/@astryxdesign/lab/dist/lab.css";
export const LAB_DRAWER_JS =
  "react/node_modules/@astryxdesign/lab/dist/Drawer/Drawer.js";
/** `NON_MODAL_BASE_Z` in lab's Drawer, and the `z-index` its CSS emits. */
export const LAB_NON_MODAL_BASE_Z = 1000;

/** `appHeader` -> `--bai-z-app-header`. */
export const cssName = (key) =>
  `--bai-z-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

/**
 * Read as TEXT (plain node, TypeScript module), anchored on the `export const`
 * so the doc comment's markdown table above it cannot look like a declaration.
 * @returns {{layers: Record<string, number>|null, step: number|null}}
 */
export function parseLadderTs(text) {
  const start = text.indexOf("export const BAI_Z_INDEX = {");
  const end = start === -1 ? -1 : text.indexOf("}", start);
  const layers = {};
  if (start !== -1 && end !== -1) {
    for (const [, name, value] of text
      .slice(start, end)
      .matchAll(/([A-Za-z][\w]*)\s*:\s*(\d+)\s*,/g)) {
      layers[name] = Number(value);
    }
  }
  const step = text.match(
    /export const BAI_Z_INDEX_MODAL_LEVEL_STEP\s*=\s*(\d+)/,
  );
  return {
    layers: Object.keys(layers).length > 0 ? layers : null,
    step: step ? Number(step[1]) : null,
  };
}

/** `--bai-z-*: <int>;` declarations in any CSS or HTML text. */
export function parseDeclaredZ(text) {
  const out = {};
  for (const [, name, value] of text.matchAll(
    /(--bai-z-[a-z-]+)\s*:\s*(\d+)\s*;/g,
  )) {
    out[name] = Number(value);
  }
  return out;
}

/**
 * @returns {{failures: string[], skipped: string[], layerCount: number}}
 */
export function runZIndexLadderGate({ repoRoot = REPO_ROOT } = {}) {
  const failures = [];
  const skipped = [];
  const read = (rel) => {
    const abs = resolve(repoRoot, rel);
    return existsSync(abs) ? readFileSync(abs, "utf8") : null;
  };

  const tsText = read(LADDER_TS);
  const cssText = read(LADDER_CSS);
  const htmlText = read(INDEX_HTML);
  for (const [rel, text] of [
    [LADDER_TS, tsText],
    [LADDER_CSS, cssText],
    [INDEX_HTML, htmlText],
  ]) {
    if (text === null) failures.push(`missing file: ${rel}`);
  }
  if (failures.length > 0) return { failures, skipped, layerCount: 0 };

  const { layers, step } = parseLadderTs(tsText);
  if (layers === null) {
    failures.push(
      `${LADDER_TS}: could not read the \`export const BAI_Z_INDEX = { … }\`` +
        " object — did the declaration move or change shape?",
    );
    return { failures, skipped, layerCount: 0 };
  }
  if (step === null) {
    failures.push(
      `${LADDER_TS}: \`export const BAI_Z_INDEX_MODAL_LEVEL_STEP\` not found.`,
    );
  }

  // 1. zIndexLadder.css mirrors every layer, plus the level step, and nothing
  //    else — an orphan `--bai-z-*` is a layer somebody deleted in TS only.
  const declared = parseDeclaredZ(cssText);
  for (const [key, value] of Object.entries(layers)) {
    const name = cssName(key);
    if (declared[name] === undefined) {
      failures.push(`${LADDER_CSS}: ${name} is not declared (${key} = ${value}).`);
    } else if (declared[name] !== value) {
      failures.push(
        `${LADDER_CSS}: ${name} is ${declared[name]}, but ` +
          `${LADDER_TS} declares ${key} = ${value}.`,
      );
    }
  }
  if (step !== null && declared["--bai-z-modal-level-step"] !== step) {
    failures.push(
      `${LADDER_CSS}: --bai-z-modal-level-step is ` +
        `${declared["--bai-z-modal-level-step"]}, but ${LADDER_TS} declares ` +
        `BAI_Z_INDEX_MODAL_LEVEL_STEP = ${step}.`,
    );
  }
  const expected = new Set([
    ...Object.keys(layers).map(cssName),
    "--bai-z-modal-level-step",
  ]);
  for (const name of Object.keys(declared)) {
    if (!expected.has(name)) {
      failures.push(`${LADDER_CSS}: ${name} has no counterpart in ${LADDER_TS}.`);
    }
  }

  // 2. index.html mirrors --bai-z-splash and still consumes it. A literal
  //    `z-index` back on `#splash` is the same drift by another route.
  const htmlSplash = parseDeclaredZ(htmlText)["--bai-z-splash"];
  if (htmlSplash === undefined) {
    failures.push(
      `${INDEX_HTML}: --bai-z-splash is not declared in the critical <style>.`,
    );
  } else if (htmlSplash !== layers.splash) {
    failures.push(
      `${INDEX_HTML}: --bai-z-splash is ${htmlSplash}, but ${LADDER_TS} ` +
        `declares splash = ${layers.splash}. The boot curtain and the modal ` +
        "band would no longer agree — fix the mirror, not the ladder.",
    );
  }
  if (!/z-index:\s*var\(--bai-z-splash\)/.test(htmlText)) {
    failures.push(
      `${INDEX_HTML}: \`#splash\` no longer reads ` +
        "`z-index: var(--bai-z-splash)`.",
    );
  }

  // 3. lab's non-modal overlay base — off the ladder, and the value
  //    `loginSideHelp` straddles.
  const labCss = read(LAB_CSS);
  const drawerJs = read(LAB_DRAWER_JS);
  if (labCss === null || drawerJs === null) {
    skipped.push(
      `@astryxdesign/lab not installed — skipped the ${LAB_NON_MODAL_BASE_Z} ` +
        "non-modal overlay base check.",
    );
  } else {
    if (!new RegExp(`z-index:\\s*${LAB_NON_MODAL_BASE_Z}\\b`).test(labCss)) {
      failures.push(
        `${LAB_CSS}: no \`z-index:${LAB_NON_MODAL_BASE_Z}\` rule. lab's ` +
          "non-modal overlay base moved; re-check that no ladder layer " +
          "collides with the new one.",
      );
    }
    if (
      !new RegExp(
        `NON_MODAL_BASE_Z\\s*=\\s*${LAB_NON_MODAL_BASE_Z}\\b`,
      ).test(drawerJs)
    ) {
      failures.push(
        `${LAB_DRAWER_JS}: \`NON_MODAL_BASE_Z\` is no longer ` +
          `${LAB_NON_MODAL_BASE_Z}. A non-modal lab Drawer now stacks ` +
          "somewhere else against this ladder.",
      );
    }
  }

  return { failures, skipped, layerCount: Object.keys(layers).length };
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
  const result = runZIndexLadderGate({ repoRoot });

  if (args.includes("--json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("=== z-index ladder mirror gate (FR-3578 T10) ===");
    console.log(
      `layers declared: ${result.layerCount}  |  ` +
        `mismatches: ${result.failures.length}`,
    );
    for (const note of result.skipped) console.log(`  (${note})`);
    for (const f of result.failures) console.log(`\n  ${f}`);
    if (result.failures.length > 0) {
      console.log(
        `\nThe ladder in ${LADDER_TS} is the source of truth; the mirrors` +
          " follow it.",
      );
    }
  }

  if (result.failures.length > 0) process.exit(1);
}
