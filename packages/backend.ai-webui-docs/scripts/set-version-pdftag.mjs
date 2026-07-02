#!/usr/bin/env node
// Bump the `pdfTag` of an existing archived-minor `versions:` entry in
// `docs-toolkit.config.yaml`.
//
//   node scripts/set-version-pdftag.mjs v26.4.10   # CLI
//   pnpm run test:scripts                          # tests
//
// Rewrites only the matching entry's single `pdfTag:` line (no YAML
// round-trip) to preserve the block's ~40 lines of guidance comments.
// Only bumps a minor that already has an entry — adding a new minor and
// moving `latest:` is a manual release decision (see RELEASE-RUNBOOK.md).

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

/**
 * Normalize `v26.4.10` or `26.4.10` to `{ tag: "v26.4.10", minor: "26.4" }`.
 * Throws on anything that is not a vMAJOR.MINOR.PATCH tag.
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
 * the tag's minor. Pure — returns the new text plus what happened. The
 * `versions:` gate skips the example `pdfTag:` in the header comment.
 * @returns {{ changed, matched, minor, previousTag, newTag, text }}
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

// CLI: exit 0 whether or not the file changed (caller detects via `git
// diff`); exit 1 only on a usage/IO error.
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
