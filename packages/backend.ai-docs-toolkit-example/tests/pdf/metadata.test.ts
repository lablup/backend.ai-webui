import { test } from "node:test";
import assert from "node:assert/strict";

import { loadPdf } from "./_helpers.js";

// Values must match `pdfMetadata` in docs-toolkit.config.yaml.
const EXPECTED_AUTHOR = "Lablup Inc.";
const EXPECTED_SUBJECT = "docs-toolkit example/boilerplate project";
const EXPECTED_CREATOR = "docs-toolkit";

for (const lang of ["en", "ko"] as const) {
  test(`PDF[${lang}] — author matches docs-toolkit.config.yaml pdfMetadata`, async () => {
    const doc = await loadPdf(lang);
    assert.equal(doc.getAuthor(), EXPECTED_AUTHOR);
  });

  test(`PDF[${lang}] — subject matches docs-toolkit.config.yaml pdfMetadata`, async () => {
    const doc = await loadPdf(lang);
    assert.equal(doc.getSubject(), EXPECTED_SUBJECT);
  });

  test(`PDF[${lang}] — creator matches docs-toolkit.config.yaml pdfMetadata`, async () => {
    const doc = await loadPdf(lang);
    assert.equal(doc.getCreator(), EXPECTED_CREATOR);
  });

  test(`PDF[${lang}] — title is derived from pdfFilenameTemplate (Docs Toolkit Example v…)`, async () => {
    const doc = await loadPdf(lang);
    const title = doc.getTitle() ?? "";
    assert.match(title, /Docs Toolkit Example/);
    assert.ok(title.includes(`(${lang})`));
  });
}
