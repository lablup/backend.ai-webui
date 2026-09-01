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

test("buildWebDocument — wraps sidebar nav inside .doc-sidebar__scroll (FR-2768 regression guard)", () => {
  // FR-2768 made .doc-sidebar a fixed-height, overflow:hidden flex column and
  // delegated scrolling to an inner .doc-sidebar__scroll element. If the nav
  // is not wrapped in that element, the sidebar can't scroll on overflow.
  const html = buildWebDocument(sampleChapters, meta);

  const sidebarMatch = html.match(/<aside class="doc-sidebar">[\s\S]*?<\/aside>/);
  assert.ok(sidebarMatch, ".doc-sidebar aside not found");
  const sidebarHtml = sidebarMatch[0];

  const scrollIdx = sidebarHtml.indexOf('class="doc-sidebar__scroll"');
  const navIdx = sidebarHtml.indexOf('class="doc-sidebar-nav"');
  assert.notStrictEqual(scrollIdx, -1, ".doc-sidebar__scroll wrapper missing from sidebar");
  assert.notStrictEqual(navIdx, -1, ".doc-sidebar-nav missing from sidebar");
  assert.ok(
    scrollIdx < navIdx,
    ".doc-sidebar-nav must be nested inside the .doc-sidebar__scroll wrapper",
  );
});
