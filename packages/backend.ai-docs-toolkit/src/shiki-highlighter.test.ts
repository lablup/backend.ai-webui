import { test } from "node:test";
import assert from "node:assert/strict";

import {
  highlight,
  getHighlightCacheStats,
  _resetForTests,
} from "./shiki-highlighter.js";

// Each `_resetForTests()` clears both the lazy highlighter and the
// tokenization cache so the hit-counter is observable per test.

test("highlight — tokenizes a known language and emits Shiki line spans", async () => {
  _resetForTests();
  const out = await highlight({
    code: 'const greeting = "hi";',
    lang: "ts",
    theme: "github-light",
  });
  assert.equal(out.highlighted, true);
  assert.equal(out.resolvedLang, "ts");
  // Shiki's `codeToHtml` output rows are class="line" spans.
  assert.match(out.innerHtml, /class="line"/);
});

test("highlight — falls back to plaintext for an unknown language (still works, no throw)", async () => {
  _resetForTests();
  const out = await highlight({
    code: "anything goes here",
    lang: "definitely-not-a-real-language",
    theme: "github-light",
  });
  // Resolved lang is plaintext; Shiki renders without coloring.
  assert.equal(out.resolvedLang, "plaintext");
  assert.equal(out.highlighted, false);
});

test("highlight — caches identical (theme, lang, code) calls (cache size does not grow on second call)", async () => {
  _resetForTests();
  const opts = { code: "x = 1", lang: "py", theme: "github-light" };
  await highlight(opts);
  const before = getHighlightCacheStats();
  await highlight(opts);
  const after = getHighlightCacheStats();
  // `hits` is not granularly tracked (documented in shiki-highlighter.ts);
  // we instead assert size stays flat — the second call must not create
  // a new entry.
  assert.equal(after.size, before.size);
  assert.ok(after.size >= 1);
});

test("highlight — different code produces a new cache entry (no false sharing)", async () => {
  _resetForTests();
  await highlight({ code: "a", lang: "ts", theme: "github-light" });
  const before = getHighlightCacheStats();
  await highlight({ code: "b", lang: "ts", theme: "github-light" });
  const after = getHighlightCacheStats();
  assert.equal(after.size, before.size + 1);
});

test("highlight — falls back to a default theme when an unknown theme is given", async (t) => {
  _resetForTests();
  // Unknown themes are documented to fall back to `github-light` with a warning.
  t.mock.method(console, "warn", () => {});
  const out = await highlight({
    code: "let x = 1;",
    lang: "ts",
    theme: "definitely-not-a-real-theme",
  });
  assert.equal(out.highlighted, true);
});
