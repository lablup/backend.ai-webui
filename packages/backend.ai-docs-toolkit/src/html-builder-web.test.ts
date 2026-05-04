import { test } from "node:test";
import assert from "node:assert/strict";

import { buildWebDocument, type WebDocMetadata } from "./html-builder-web.js";
import type { Chapter } from "./markdown-processor.js";

const sampleChapters: Chapter[] = [
  {
    title: "Quickstart",
    slug: "quickstart",
    htmlContent: '<h2 id="welcome">Welcome</h2><p>Hello from quickstart.</p>',
    headings: [{ text: "Welcome", level: 2, id: "welcome" } as Chapter["headings"][number]],
  },
  {
    title: "Features",
    slug: "features",
    htmlContent: "<p>Body text for features.</p>",
    headings: [],
  },
];

const meta: WebDocMetadata = {
  title: "Toolkit Example",
  version: "0.1.0",
  lang: "en",
};

test("buildWebDocument — emits a complete HTML document with DOCTYPE", () => {
  const html = buildWebDocument(sampleChapters, meta);
  assert.match(html, /^<!DOCTYPE html>/);
  assert.ok(html.includes("</html>"));
});

test("buildWebDocument — sets <html lang=…> from metadata", () => {
  const html = buildWebDocument(sampleChapters, { ...meta, lang: "ko" });
  assert.match(html, /<html[^>]*\blang="ko"/);
});

test("buildWebDocument — embeds the document title", () => {
  const html = buildWebDocument(sampleChapters, meta);
  assert.ok(html.includes("Toolkit Example"));
});

test("buildWebDocument — includes every chapter's html content in the body", () => {
  const html = buildWebDocument(sampleChapters, meta);
  for (const ch of sampleChapters) {
    assert.ok(html.includes(ch.htmlContent), `chapter "${ch.slug}" missing from output`);
  }
});

test("buildWebDocument — surfaces chapter slugs (used by sidebar links)", () => {
  const html = buildWebDocument(sampleChapters, meta);
  assert.ok(html.includes("quickstart"));
  assert.ok(html.includes("features"));
});

test("buildWebDocument — works without config (preview-mode default branding)", () => {
  // Smoke: no `config` argument should not throw and should still produce output.
  const html = buildWebDocument(sampleChapters, meta);
  assert.ok(html.length > 0);
});
