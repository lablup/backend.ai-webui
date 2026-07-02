// Unit tests for set-version-pdftag.mjs (run: `node --test scripts/`).
//
// These guard the script's deliberate coupling to the config's line format:
// if `docs-toolkit.config.yaml` is ever reformatted so the label/pdfTag
// lines no longer match, the "real config" test below fails loudly instead
// of the bump silently becoming a no-op.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { bumpPdfTag, deriveMinor } from "./set-version-pdftag.mjs";

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
