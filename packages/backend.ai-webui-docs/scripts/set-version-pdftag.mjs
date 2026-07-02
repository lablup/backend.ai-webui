#!/usr/bin/env node
// Bump the `pdfTag` of an existing archived-minor entry in
// `docs-toolkit.config.yaml` to a given release tag.
//
// Usage:  node scripts/set-version-pdftag.mjs v26.4.10
//
// Why a line-surgical edit instead of a YAML round-trip: the config file
// carries ~40 lines of hand-written guidance comments in the `versions:`
// block. A full parse+restringify (even with a comment-preserving lib) can
// reflow those; here we only ever rewrite the single `pdfTag:` line of the
// matching entry, so every comment, key order, and quote style is untouched.
//
// Scope (intentional): this ONLY bumps the `pdfTag` of a minor that ALREADY
// has a `versions:` entry — the exact drift that let 26.4 fall from
// v26.4.7 to v26.4.10 unnoticed. Introducing a brand-new minor (and moving
// `latest: true`) is a release-strategy decision and stays a manual edit
// (see RELEASE-RUNBOOK.md). When the released minor has no entry, this
// script makes no change and says so — the caller then opens no PR.
//
// Exit codes: 0 always on well-formed input (whether or not it changed the
// file — the caller detects a change via `git diff`); 1 only on a usage or
// I/O error.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(__dirname, "..", "docs-toolkit.config.yaml");

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

const rawTag = process.argv[2];
if (!rawTag) {
  fail("missing release tag argument (e.g. v26.4.10)");
}

// Normalize: accept `v26.4.10` or `26.4.10`; keep the tag verbatim for
// pdfTag (it is stored WITH the leading `v`, e.g. "v26.4.10").
const tag = rawTag.startsWith("v") ? rawTag : `v${rawTag}`;
const minorMatch = tag.match(/^v(\d+\.\d+)\.\d+/);
if (!minorMatch) {
  fail(`tag '${rawTag}' is not a vMAJOR.MINOR.PATCH release tag`);
}
const minor = minorMatch[1];

const original = readFileSync(CONFIG_PATH, "utf8");
const lines = original.split("\n");

// Walk the file tracking which `versions:` entry we are inside. Entries are
// `  - label: "<minor>"`; the target entry's `pdfTag:` line is the one we
// rewrite. `label:`/`pdfTag:` only appear inside `versions:` (the header
// comment's example `pdfTag:` sits before `versions:` and is skipped).
let inVersions = false;
let currentLabel = null;
let changed = false;
let matchedEntry = false;
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
      matchedEntry = true;
      previousTag = pdfTagMatch[2];
      if (previousTag !== tag) {
        lines[i] = `${pdfTagMatch[1]}pdfTag: "${tag}"`;
        changed = true;
      }
      break;
    }
  }
}

if (!matchedEntry) {
  console.log(
    `no-op: no versions entry with a pdfTag for minor ${minor} — ` +
      `a brand-new minor must be added to versions: manually (see RELEASE-RUNBOOK.md).`,
  );
  process.exit(0);
}

if (!changed) {
  console.log(`no-op: pdfTag for ${minor} is already ${tag}.`);
  process.exit(0);
}

writeFileSync(CONFIG_PATH, lines.join("\n"));
console.log(`updated: ${minor} pdfTag ${previousTag} -> ${tag}`);
process.exit(0);
