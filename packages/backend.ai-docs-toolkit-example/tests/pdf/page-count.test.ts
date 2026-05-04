import { test } from "node:test";
import assert from "node:assert/strict";

import { loadBaseline, loadPdf } from "./_helpers.js";

const BASELINE = loadBaseline();
const TOLERANCE = 0.2; // ±20% — wide enough to absorb routine content edits.

for (const lang of ["en", "ko"] as const) {
  test(`PDF[${lang}] — page count is non-zero`, async () => {
    const doc = await loadPdf(lang);
    assert.ok(doc.getPageCount() > 0, `expected >0 pages, got ${doc.getPageCount()}`);
  });

  test(`PDF[${lang}] — page count is within ±20% of recorded baseline`, async () => {
    const doc = await loadPdf(lang);
    const actual = doc.getPageCount();
    const baseline = BASELINE[lang];
    const lower = Math.floor(baseline * (1 - TOLERANCE));
    const upper = Math.ceil(baseline * (1 + TOLERANCE));
    assert.ok(
      actual >= lower && actual <= upper,
      `pages=${actual} out of band [${lower}, ${upper}] (baseline=${baseline}). ` +
        `If this drift is intentional, edit tests/pdf/baseline.json to the new value.`,
    );
  });
}
