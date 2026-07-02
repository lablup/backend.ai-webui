#!/usr/bin/env node
// Bump the `pdfTag` of an existing archived-minor entry in
// `docs-toolkit.config.yaml` to a given release tag.
//
// Usage:  node scripts/set-version-pdftag.mjs v26.4.10
// Tests:  pnpm run test:scripts   (see set-version-pdftag.test.mjs)
//
// Why a line-surgical edit instead of a YAML round-trip: the config file
// carries ~40 lines of hand-written guidance comments in the `versions:`
// block. A full parse+restringify (even with a comment-preserving lib) can
// reflow those; here we only ever rewrite the single `pdfTag:` line of the
// matching entry, so every comment, key order, and quote style is untouched.
//
// The edit logic is a pure function (`bumpPdfTag`) so it is unit-testable
// against fixtures and the real config without touching the filesystem — the
// committed tests also guard the format coupling: if the config's line shape
// ever changes, a test fails loudly instead of the script silently no-op'ing.
//
// Scope (intentional): this ONLY bumps the `pdfTag` of a minor that ALREADY
// has a `versions:` entry — the exact drift that let 26.4 fall from
// v26.4.7 to v26.4.10 unnoticed. Introducing a brand-new minor (and moving
// `latest: true`) is a release-strategy decision and stays a manual edit
// (see RELEASE-RUNBOOK.md). When the released minor has no entry, this
// makes no change and says so — the caller then opens no PR.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

/**
 * Normalize a release tag and derive its MAJOR.MINOR.
 * Accepts `v26.4.10` or `26.4.10`. Throws on anything that is not a
 * vMAJOR.MINOR.PATCH tag. `pdfTag` is stored WITH the leading `v`.
 * @returns {{ tag: string, minor: string }}
 */
export function deriveMinor(rawTag) {
  if (!rawTag) throw new Error("missing release tag argument (e.g. v26.4.10)");
  const tag = rawTag.startsWith("v") ? rawTag : `v${rawTag}`;
  const match = tag.match(/^v(\d+\.\d+)\.\d+/);
  if (!match) {
    throw new Error(`tag '${rawTag}' is not a vMAJOR.MINOR.PATCH release tag`);
  }
  return { tag, minor: match[1] };
}

/**
 * Rewrite the `pdfTag:` line of the `versions:` entry whose `label:` matches
 * the tag's minor. Pure — takes and returns text, touches nothing else.
 *
 * `label:`/`pdfTag:` only occur inside `versions:` (the header comment's
 * example `pdfTag:` sits before `versions:` and is skipped by the gate).
 *
 * @returns {{ changed: boolean, matched: boolean, minor: string,
 *             previousTag: string|null, newTag: string, text: string }}
 */
export function bumpPdfTag(text, rawTag) {
  const { tag, minor } = deriveMinor(rawTag);
  const lines = text.split("\n");

  let inVersions = false;
  let currentLabel = null;
  let changed = false;
  let matched = false;
  let previousTag = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^versions:\s*$/.test(line)) {
      inVersions = true;
      continue;
    }
    if (!inVersions) continue;
    // A new top-level key ends the versions block.
    if (/^[A-Za-z]/.test(line)) {
      inVersions = false;
      continue;
    }

    const labelMatch = line.match(/^\s*-\s*label:\s*"([^"]+)"\s*$/);
    if (labelMatch) {
      currentLabel = labelMatch[1];
      continue;
    }

    if (currentLabel === minor) {
      const pdfTagMatch = line.match(/^(\s*)pdfTag:\s*"([^"]*)"\s*$/);
      if (pdfTagMatch) {
        matched = true;
        previousTag = pdfTagMatch[2];
        if (previousTag !== tag) {
          lines[i] = `${pdfTagMatch[1]}pdfTag: "${tag}"`;
          changed = true;
        }
        break;
      }
    }
  }

  return {
    changed,
    matched,
    minor,
    previousTag,
    newTag: tag,
    text: lines.join("\n"),
  };
}

// --- CLI ---------------------------------------------------------------
// Exit 0 on well-formed input (whether or not it changed the file — the
// caller detects a change via `git diff`); exit 1 only on a usage/IO error.
function main(argv) {
  const configPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "docs-toolkit.config.yaml",
  );
  let result;
  try {
    const original = readFileSync(configPath, "utf8");
    result = bumpPdfTag(original, argv[2]);
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    process.exit(1);
  }

  if (!result.matched) {
    console.log(
      `no-op: no versions entry with a pdfTag for minor ${result.minor} — ` +
        `a brand-new minor must be added to versions: manually (see RELEASE-RUNBOOK.md).`,
    );
    return;
  }
  if (!result.changed) {
    console.log(
      `no-op: pdfTag for ${result.minor} is already ${result.newTag}.`,
    );
    return;
  }
  writeFileSync(configPath, result.text);
  console.log(
    `updated: ${result.minor} pdfTag ${result.previousTag} -> ${result.newTag}`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv);
}
