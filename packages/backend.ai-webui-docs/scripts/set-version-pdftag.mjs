#!/usr/bin/env node
// Sync a released minor into the `versions:` list of
// `docs-toolkit.config.yaml` on a stable release.
//
//   node scripts/set-version-pdftag.mjs v26.7.0   # CLI
//   pnpm run test:scripts                          # tests
//
// Two cases, both comment-preserving (line edits, no YAML round-trip so the
// block's ~40 lines of guidance comments survive):
//
//   1. The minor ALREADY has an entry (a later patch on an existing line):
//      bump that entry's single `pdfTag:` line. `latest:` is never touched.
//   2. The minor has NO entry yet (a brand-new minor): insert a new
//      `archive-branch` entry immediately below the `next` entry, and promote
//      it to `latest: true` ONLY IF it is newer than the current latest minor
//      (an older-minor backfill is added without moving `latest:`). This
//      mirrors RELEASE-RUNBOOK.md step 3, now automated (FR-3246 follow-up).
//
// The new entry points at `docs-archive/<minor>`, the orphan branch that
// `docs-archive-orphan-branch.yml` seeds on the same release. Adding the
// entry as a PR (never a direct commit) keeps merge as the human gate.

import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
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
 * Compare two `MAJOR.MINOR` labels numerically (component-wise, NOT string
 * order — so "26.10" > "26.7"). Returns true when `a` is strictly newer
 * than `b`. The `next` label (non-numeric) is never newer than anything.
 */
export function isNewerMinor(a, b) {
  const parse = (s) => s.split(".").map((n) => Number.parseInt(n, 10));
  const av = parse(a);
  const bv = parse(b);
  if (av.some(Number.isNaN) || bv.some(Number.isNaN)) return false;
  for (let i = 0; i < Math.max(av.length, bv.length); i++) {
    const x = av[i] ?? 0;
    const y = bv[i] ?? 0;
    if (x !== y) return x > y;
  }
  return false;
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

/**
 * Parse the `versions:` block into a flat list of entries. Each entry records
 * its label, the line range it spans (`[start, end)`, end exclusive), whether
 * it carries `latest: true`, and that line's index (for removal). A blank
 * line or a column-0 line (top-level key or comment) ends the block.
 */
function parseVersionEntries(lines) {
  const entries = [];
  let inVersions = false;
  let current = null;

  const closeCurrent = (endIdx) => {
    if (current) {
      current.end = endIdx;
      entries.push(current);
      current = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inVersions) {
      if (/^versions:\s*$/.test(line)) inVersions = true;
      continue;
    }
    // The block ends at the first column-0 non-space line (top-level key or
    // a `# comment` starting a following section).
    if (/^\S/.test(line)) {
      closeCurrent(i);
      inVersions = false;
      continue;
    }

    const labelMatch = line.match(/^(\s*)-\s*label:\s*"([^"]+)"\s*$/);
    if (labelMatch) {
      closeCurrent(i);
      current = {
        label: labelMatch[2],
        indent: labelMatch[1],
        start: i,
        end: lines.length,
        hasLatest: false,
        latestLineIdx: -1,
      };
      continue;
    }
    if (current && /^\s*latest:\s*true\s*$/.test(line)) {
      current.hasLatest = true;
      current.latestLineIdx = i;
    }
  }
  closeCurrent(lines.length);
  return entries;
}

/**
 * Ensure the released minor is represented in `versions:`.
 *
 *   - Existing entry  → delegate to `bumpPdfTag` (action `bumped` / `noop`).
 *   - Missing entry   → insert a new `archive-branch` entry below `next`,
 *                       promoting it to `latest` iff it is newer than the
 *                       current latest (action `added`).
 *
 * Pure — returns `{ action, changed, minor, tag, promoted, previousLatest,
 * text }`. `action` is one of `added` | `bumped` | `noop`.
 */
export function syncVersionEntry(text, rawTag) {
  const { tag, minor } = deriveMinor(rawTag);
  const lines = text.split("\n");
  const entries = parseVersionEntries(lines);

  const existing = entries.find((e) => e.label === minor);
  if (existing) {
    const bumped = bumpPdfTag(text, rawTag);
    return {
      action: bumped.changed ? "bumped" : "noop",
      changed: bumped.changed,
      minor,
      tag,
      promoted: false,
      previousLatest: entries.find((e) => e.hasLatest)?.label ?? null,
      text: bumped.text,
    };
  }

  // Brand-new minor: build the entry and insert it below `next`.
  const nextEntry = entries.find((e) => e.label === "next");
  const insertAt = nextEntry ? nextEntry.end : lines.length;
  const currentLatest = entries.find((e) => e.hasLatest) ?? null;
  const promoted = currentLatest
    ? isNewerMinor(minor, currentLatest.label)
    : true;

  const ind = nextEntry ? nextEntry.indent : "  ";
  const newEntry = [
    `${ind}- label: "${minor}"`,
    `${ind}  source:`,
    `${ind}    kind: archive-branch`,
    `${ind}    ref: docs-archive/${minor}`,
    ...(promoted ? [`${ind}  latest: true`] : []),
    `${ind}  pdfTag: "${tag}"`,
  ];
  // Only strip the old `latest:` line when the new minor actually wins it.
  const removeLatestIdx =
    promoted && currentLatest ? currentLatest.latestLineIdx : -1;

  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (i === insertAt) out.push(...newEntry);
    if (i === removeLatestIdx) continue;
    out.push(lines[i]);
  }
  if (insertAt >= lines.length) out.push(...newEntry);

  return {
    action: "added",
    changed: true,
    minor,
    tag,
    promoted,
    previousLatest: currentLatest?.label ?? null,
    text: out.join("\n"),
  };
}

// CLI: exit 0 whether or not the file changed (caller detects via `git
// diff`); exit 1 only on a usage/IO error. Emits `action`/`minor`/`tag`/
// `promoted` to $GITHUB_OUTPUT when present so the workflow can word the PR.
function main(argv) {
  const configPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "docs-toolkit.config.yaml",
  );
  let result;
  try {
    const original = readFileSync(configPath, "utf8");
    result = syncVersionEntry(original, argv[2]);
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    process.exit(1);
  }

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `action=${result.action}\nminor=${result.minor}\ntag=${result.tag}\n` +
        `promoted=${result.promoted}\n`,
    );
  }

  if (result.action === "added") {
    writeFileSync(configPath, result.text);
    console.log(
      result.promoted
        ? `added: ${result.minor} (${result.tag}) as new latest ` +
            `(was ${result.previousLatest ?? "none"}).`
        : `added: ${result.minor} (${result.tag}) as an archived minor ` +
            `(latest stays ${result.previousLatest ?? "unchanged"}).`,
    );
    return;
  }
  if (result.action === "bumped") {
    writeFileSync(configPath, result.text);
    console.log(`updated: ${result.minor} pdfTag -> ${result.tag}`);
    return;
  }
  console.log(`no-op: ${result.minor} already at ${result.tag}.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv);
}
