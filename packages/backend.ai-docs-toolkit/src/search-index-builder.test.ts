import { test } from "node:test";
import assert from "node:assert/strict";

import { tokenize, buildSearchIndex } from "./search-index-builder.js";
import type { Chapter } from "./markdown-processor.js";

test("tokenize — splits Latin text on whitespace and punctuation, lowercased, ≥ 2 chars", () => {
  const tokens = tokenize("Hello, World! Building docs.", "en");
  assert.deepEqual(tokens.sort(), ["building", "docs", "hello", "world"].sort());
});

test("tokenize — drops 1-char Latin tokens", () => {
  const tokens = tokenize("a bigger word", "en");
  assert.ok(!tokens.includes("a"));
  assert.ok(tokens.includes("bigger"));
  assert.ok(tokens.includes("word"));
});

test("tokenize — produces character bigrams for Korean (CJK) text", () => {
  const tokens = tokenize("빠른 시작", "ko");
  // Bigrams for "빠른" → "빠른"; for "시작" → "시작".
  assert.ok(tokens.includes("빠른"));
  assert.ok(tokens.includes("시작"));
});

test("tokenize — produces character bigrams for Thai text", () => {
  const tokens = tokenize("สวัสดี", "th");
  // At least one bigram pair from the input characters.
  assert.ok(tokens.length > 0);
  assert.ok(tokens.every((t) => t.length === 2));
});

test("buildSearchIndex — produces one document per chapter", () => {
  const chapters: Chapter[] = [
    {
      title: "Quickstart",
      slug: "quickstart",
      htmlContent: "<p>Welcome to docs.</p>",
      headings: [{ text: "Welcome", level: 2, id: "welcome" } as Chapter["headings"][number]],
    },
    {
      title: "Features",
      slug: "features",
      htmlContent: "<p>Admonitions, code blocks.</p>",
      headings: [],
    },
  ];
  const index = buildSearchIndex(chapters, "en");
  assert.equal(index.documents.length, 2);
  assert.equal(index.documents[0].slug, "quickstart");
  assert.equal(index.documents[1].url, "./features.html");
  assert.equal(index.lang, "en");
});

test("buildSearchIndex — index references documents by their array index", () => {
  const chapters: Chapter[] = [
    {
      title: "Hello world from chapter one",
      slug: "ch1",
      htmlContent: "<p>Hello world from chapter one body content.</p>",
      headings: [],
    },
  ];
  const index = buildSearchIndex(chapters, "en");
  // Tokens from title + body must map to doc 0.
  assert.ok(index.index["hello"]);
  assert.equal(index.index["hello"][0].doc, 0);
});

test("buildSearchIndex — accumulates frequency across title + headings + body", () => {
  const chapters: Chapter[] = [
    {
      title: "Build",
      slug: "x",
      htmlContent: "<p>Build the build by building.</p>",
      headings: [{ text: "Build", level: 2, id: "build" } as Chapter["headings"][number]],
    },
  ];
  const index = buildSearchIndex(chapters, "en");
  // "build" appears in title, heading, AND body — frequency is non-trivial.
  assert.ok(index.index["build"]);
  assert.ok(index.index["build"][0].freq >= 3);
});
