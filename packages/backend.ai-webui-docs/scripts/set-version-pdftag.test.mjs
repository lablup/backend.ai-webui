// Unit tests for set-version-pdftag.mjs (`pnpm run test:scripts`). The
// "real config" test guards the line-format coupling: if the config is
// reformatted so label/pdfTag no longer match, it fails loudly.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  bumpPdfTag,
  deriveMinor,
  isNewerMinor,
  syncVersionEntry,
} from "./set-version-pdftag.mjs";

// Two archived minors + next, so we can assert the edit targets ONLY the
// intended entry (the real config currently has a single archived minor).
const FIXTURE = `versions:
  - label: "next"
    source:
      kind: workspace
  - label: "26.5"
    source:
      kind: archive-branch
      ref: docs-archive/26.5
    latest: true
    pdfTag: "v26.5.0"
  - label: "26.4"
    source:
      kind: archive-branch
      ref: docs-archive/26.4
    pdfTag: "v26.4.10"

productName: "x"
`;

test("bumps only the targeted minor's pdfTag", () => {
  const r = bumpPdfTag(FIXTURE, "v26.4.12");
  assert.equal(r.matched, true);
  assert.equal(r.changed, true);
  assert.equal(r.previousTag, "v26.4.10");
  // 26.4 updated ...
  assert.match(r.text, /label: "26.4"[\s\S]*?pdfTag: "v26.4.12"/);
  // ... and 26.5 left untouched.
  assert.match(r.text, /pdfTag: "v26.5.0"/);
  assert.doesNotMatch(r.text, /pdfTag: "v26.4.10"/);
  // Exactly one line differs from the input.
  const diff = FIXTURE.split("\n").filter(
    (l, i) => l !== r.text.split("\n")[i],
  );
  assert.equal(diff.length, 1);
});

test("no-op when the tag is already current", () => {
  const r = bumpPdfTag(FIXTURE, "v26.4.10");
  assert.equal(r.matched, true);
  assert.equal(r.changed, false);
  assert.equal(r.text, FIXTURE);
});

test("no-op for a brand-new minor (no entry)", () => {
  const r = bumpPdfTag(FIXTURE, "v26.9.0");
  assert.equal(r.matched, false);
  assert.equal(r.changed, false);
  assert.equal(r.text, FIXTURE);
});

test("derives minor across tag shapes", () => {
  assert.equal(deriveMinor("v26.5.0").minor, "26.5");
  assert.equal(deriveMinor("v25.15.3").minor, "25.15");
  assert.equal(deriveMinor("26.4.7").minor, "26.4");
  assert.equal(deriveMinor("v26.5.0-rc.1").minor, "26.5");
});

test("throws on a tag that is not vMAJOR.MINOR.PATCH", () => {
  assert.throws(() => deriveMinor("26.4"), /not a vMAJOR\.MINOR\.PATCH/);
  assert.throws(() => deriveMinor(""), /missing release tag/);
});

test("real config: current-tag bump is a matched no-op (guards format coupling)", () => {
  const real = readFileSync(
    resolve(
      dirname(fileURLToPath(import.meta.url)),
      "..",
      "docs-toolkit.config.yaml",
    ),
    "utf8",
  );
  // The live config pins 26.4 at v26.4.10; matching it proves the parser
  // still recognizes the real line format.
  const r = bumpPdfTag(real, "v26.4.10");
  assert.equal(r.matched, true);
  assert.equal(r.changed, false);
});

// --- isNewerMinor (component-wise numeric, NOT string) ---

test("isNewerMinor compares numerically", () => {
  assert.equal(isNewerMinor("26.10", "26.7"), true); // 10 > 7 numerically
  assert.equal(isNewerMinor("26.7", "26.10"), false);
  assert.equal(isNewerMinor("27.0", "26.9"), true);
  assert.equal(isNewerMinor("26.4", "26.4"), false); // equal is not newer
  assert.equal(isNewerMinor("26.3", "26.5"), false);
  assert.equal(isNewerMinor("next", "26.5"), false); // non-numeric never wins
});

// --- syncVersionEntry: add a brand-new minor ---

test("adds a newer minor below `next` and moves latest to it", () => {
  const r = syncVersionEntry(FIXTURE, "v26.7.0");
  assert.equal(r.action, "added");
  assert.equal(r.changed, true);
  assert.equal(r.promoted, true);
  assert.equal(r.previousLatest, "26.5");
  // New entry exists with the archive-branch ref and the release pdfTag.
  assert.match(
    r.text,
    /- label: "26\.7"\n\s+source:\n\s+kind: archive-branch\n\s+ref: docs-archive\/26\.7\n\s+latest: true\n\s+pdfTag: "v26\.7\.0"/,
  );
  // Inserted immediately below `next`, above the previous latest 26.5.
  assert.match(
    r.text,
    /label: "next"[\s\S]*label: "26\.7"[\s\S]*label: "26\.5"/,
  );
  // Old latest stripped: exactly one `latest: true` line remains.
  assert.equal(r.text.match(/^\s+latest: true$/gm).length, 1);
  // 26.5 entry no longer carries latest (its pdfTag is untouched though).
  assert.doesNotMatch(r.text, /label: "26\.5"\n\s+source:[\s\S]*?latest: true/);
});

test("backfills an older minor without touching latest", () => {
  const r = syncVersionEntry(FIXTURE, "v26.3.0");
  assert.equal(r.action, "added");
  assert.equal(r.promoted, false);
  assert.equal(r.previousLatest, "26.5");
  // Added below `next`, but NO latest on the new entry.
  assert.match(
    r.text,
    /- label: "26\.3"\n\s+source:\n\s+kind: archive-branch\n\s+ref: docs-archive\/26\.3\n\s+pdfTag: "v26\.3\.0"/,
  );
  assert.doesNotMatch(
    r.text,
    /- label: "26\.3"[\s\S]*?latest: true[\s\S]*?pdfTag: "v26\.3\.0"/,
  );
  // Latest is still 26.5 — exactly one latest line, on 26.5.
  assert.equal(r.text.match(/^\s+latest: true$/gm).length, 1);
  assert.match(r.text, /label: "26\.5"[\s\S]*?latest: true/);
});

test("existing minor: bumps pdfTag only, latest untouched", () => {
  const r = syncVersionEntry(FIXTURE, "v26.4.12");
  assert.equal(r.action, "bumped");
  assert.equal(r.changed, true);
  assert.equal(r.promoted, false);
  assert.match(r.text, /label: "26\.4"[\s\S]*?pdfTag: "v26\.4\.12"/);
  // Latest still on 26.5, still exactly one.
  assert.equal(r.text.match(/^\s+latest: true$/gm).length, 1);
  assert.match(r.text, /label: "26\.5"[\s\S]*?latest: true/);
});

test("idempotent: re-running the same add is a no-op the second time", () => {
  const added = syncVersionEntry(FIXTURE, "v26.7.0");
  const again = syncVersionEntry(added.text, "v26.7.0");
  assert.equal(again.action, "noop");
  assert.equal(again.changed, false);
  assert.equal(again.text, added.text);
});

test("real config: adding a brand-new minor inserts below next and promotes", () => {
  const real = readFileSync(
    resolve(
      dirname(fileURLToPath(import.meta.url)),
      "..",
      "docs-toolkit.config.yaml",
    ),
    "utf8",
  );
  const r = syncVersionEntry(real, "v26.99.0");
  assert.equal(r.action, "added");
  assert.equal(r.promoted, true);
  // Still exactly one latest line after the move.
  assert.equal(r.text.match(/^\s+latest: true$/gm).length, 1);
  // The new entry sits directly under `next`.
  assert.match(r.text, /label: "next"[\s\S]*?label: "26\.99"/);
});
