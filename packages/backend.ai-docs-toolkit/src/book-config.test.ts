import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { loadBookConfig, normalizeTitle } from "./book-config.js";

function withSrcDir(yaml: string, fn: (dir: string) => void): void {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "book-config-"));
  try {
    fs.writeFileSync(path.join(dir, "book.config.yaml"), yaml, "utf8");
    fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("normalizeTitle — collapses runs of whitespace into a single space", () => {
  assert.equal(normalizeTitle("Hello\n\n  World"), "Hello World");
  assert.equal(normalizeTitle("  spaced  out  "), "spaced out");
  assert.equal(normalizeTitle("single"), "single");
});

test("normalizeTitle — is idempotent", () => {
  const once = normalizeTitle("Multi\nLine\nTitle");
  assert.equal(normalizeTitle(once), once);
});

test("loadBookConfig — accepts the legacy flat navigation form", () => {
  withSrcDir(
    `
id: x
title: |
  Flat
  Title
languages: [en]
navigation:
  en:
    - { title: Quickstart, path: quickstart.md }
    - { title: Overview,   path: overview.md }
`,
    (dir) => {
      const cfg = loadBookConfig(dir);
      assert.equal(cfg.title, "Flat Title");
      assert.equal(cfg.titleMultiline, "Flat\nTitle");
      assert.deepEqual(cfg.navigation.en, [
        { title: "Quickstart", path: "quickstart.md" },
        { title: "Overview", path: "overview.md" },
      ]);
      // Flat input is wrapped in a single anonymous group with category "".
      assert.equal(cfg.navigationGroups.en.length, 1);
      assert.equal(cfg.navigationGroups.en[0].category, "");
      assert.equal(cfg.navigationGroups.en[0].items.length, 2);
    },
  );
});

test("loadBookConfig — accepts the F3 grouped navigation form", () => {
  withSrcDir(
    `
id: x
title: Grouped Title
languages: [en]
navigation:
  en:
    - category: Getting Started
      items:
        - { title: Quickstart, path: quickstart.md }
    - category: Reference
      items:
        - { title: API, path: api.md }
        - { title: Glossary, path: glossary.md }
`,
    (dir) => {
      const cfg = loadBookConfig(dir);
      assert.equal(cfg.navigationGroups.en.length, 2);
      assert.equal(cfg.navigationGroups.en[0].category, "Getting Started");
      assert.equal(cfg.navigationGroups.en[1].category, "Reference");
      assert.equal(cfg.navigationGroups.en[1].items.length, 2);
      // The flat list preserves group ordering.
      assert.deepEqual(
        cfg.navigation.en.map((it) => it.title),
        ["Quickstart", "API", "Glossary"],
      );
    },
  );
});

test("loadBookConfig — drops grouped entries with empty `category` (no crash)", () => {
  withSrcDir(
    `
id: x
title: T
languages: [en]
navigation:
  en:
    - category: ""
      items:
        - { title: Orphan, path: orphan.md }
    - category: Real
      items:
        - { title: Real, path: real.md }
`,
    (dir) => {
      const cfg = loadBookConfig(dir);
      assert.equal(cfg.navigationGroups.en.length, 1);
      assert.equal(cfg.navigationGroups.en[0].category, "Real");
      assert.deepEqual(
        cfg.navigation.en.map((it) => it.title),
        ["Real"],
      );
    },
  );
});

test("loadBookConfig — drops malformed flat entries missing title/path", () => {
  withSrcDir(
    `
id: x
title: T
languages: [en]
navigation:
  en:
    - { title: Good, path: good.md }
    - { title: NoPath }
`,
    (dir) => {
      const cfg = loadBookConfig(dir);
      assert.deepEqual(
        cfg.navigation.en.map((it) => it.title),
        ["Good"],
      );
    },
  );
});

test("loadBookConfig — supports per-language differing forms (en grouped, ko flat)", () => {
  withSrcDir(
    `
id: x
title: T
languages: [en, ko]
navigation:
  en:
    - category: Getting Started
      items:
        - { title: Quickstart, path: quickstart.md }
  ko:
    - { title: 빠른 시작, path: quickstart.md }
`,
    (dir) => {
      const cfg = loadBookConfig(dir);
      assert.equal(cfg.navigationGroups.en[0].category, "Getting Started");
      assert.equal(cfg.navigationGroups.ko[0].category, "");
      assert.equal(cfg.navigationGroups.ko[0].items[0].title, "빠른 시작");
    },
  );
});

test("loadBookConfig — empty/missing navigation is tolerated", () => {
  withSrcDir(
    `
id: x
title: T
languages: [en]
`,
    (dir) => {
      const cfg = loadBookConfig(dir);
      assert.deepEqual(cfg.navigation, {});
      assert.deepEqual(cfg.navigationGroups, {});
    },
  );
});
