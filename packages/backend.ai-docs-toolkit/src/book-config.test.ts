import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  loadBookConfig,
  normalizeTitle,
  resolveBookTitle,
} from "./book-config.js";

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

test("loadBookConfig — keeps title-less entries (FR-3277 frontmatter navTitle)", () => {
  withSrcDir(
    `
id: x
title: T
languages: [en]
navigation:
  en:
    - { title: Labeled, path: labeled.md }
    - { path: unlabeled.md }
`,
    (dir) => {
      const cfg = loadBookConfig(dir);
      assert.deepEqual(
        cfg.navigation.en.map((it) => ({ title: it.title, path: it.path })),
        [
          { title: "Labeled", path: "labeled.md" },
          { title: undefined, path: "unlabeled.md" },
        ],
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

// ── Per-language title ────────────────────────────────────────────

test("title — a plain string resolves identically for every language", () => {
  withSrcDir(
    ["title: Backend.AI WebUI User Guide", "languages: [en, ko]", "navigation: {}"].join("\n"),
    (dir) => {
      const cfg = loadBookConfig(dir);
      assert.equal(cfg.title, "Backend.AI WebUI User Guide");
      assert.equal(resolveBookTitle(cfg, "en").title, "Backend.AI WebUI User Guide");
      assert.equal(resolveBookTitle(cfg, "ko").title, "Backend.AI WebUI User Guide");
      // A language absent from the config still resolves, never undefined.
      assert.equal(resolveBookTitle(cfg, "xx").title, "Backend.AI WebUI User Guide");
    },
  );
});

test("title — a block scalar keeps its line breaks in titleMultiline", () => {
  withSrcDir(
    ["title: |", "  Backend.AI WebUI", "  User Guide", "languages: [en]", "navigation: {}"].join("\n"),
    (dir) => {
      const cfg = loadBookConfig(dir);
      assert.equal(cfg.title, "Backend.AI WebUI User Guide");
      assert.equal(cfg.titleMultiline, "Backend.AI WebUI\nUser Guide");
      assert.equal(
        resolveBookTitle(cfg, "en").titleMultiline,
        "Backend.AI WebUI\nUser Guide",
      );
    },
  );
});

test("title — a per-language map resolves each language to its own title", () => {
  withSrcDir(
    [
      "title:",
      '  default: "Backend.AI WebUI User Guide"',
      '  ko: "Backend.AI WebUI 사용자 가이드"',
      "languages: [en, ko]",
      "navigation: {}",
    ].join("\n"),
    (dir) => {
      const cfg = loadBookConfig(dir);
      assert.equal(resolveBookTitle(cfg, "ko").title, "Backend.AI WebUI 사용자 가이드");
      // No `en` key — falls back to `default`, not to the ko entry.
      assert.equal(resolveBookTitle(cfg, "en").title, "Backend.AI WebUI User Guide");
      // `title` remains the default for language-unaware callers.
      assert.equal(cfg.title, "Backend.AI WebUI User Guide");
    },
  );
});

test("title — a map without `default` falls back to its first entry", () => {
  withSrcDir(
    ["title:", '  ko: "한국어 제목"', "languages: [ko]", "navigation: {}"].join("\n"),
    (dir) => {
      const cfg = loadBookConfig(dir);
      assert.equal(cfg.title, "한국어 제목");
      assert.equal(resolveBookTitle(cfg, "ja").title, "한국어 제목");
    },
  );
});

test("title — per-language block scalars keep their line breaks", () => {
  withSrcDir(
    [
      "title:",
      "  default: |",
      "    Backend.AI WebUI",
      "    User Guide",
      "  ko: |",
      "    Backend.AI WebUI",
      "    사용자 가이드",
      "languages: [en, ko]",
      "navigation: {}",
    ].join("\n"),
    (dir) => {
      const cfg = loadBookConfig(dir);
      assert.equal(
        resolveBookTitle(cfg, "ko").titleMultiline,
        "Backend.AI WebUI\n사용자 가이드",
      );
      assert.equal(resolveBookTitle(cfg, "ko").title, "Backend.AI WebUI 사용자 가이드");
      assert.equal(
        resolveBookTitle(cfg, "en").titleMultiline,
        "Backend.AI WebUI\nUser Guide",
      );
    },
  );
});

test("title — a non-string map entry is dropped, not rendered", () => {
  withSrcDir(
    [
      "title:",
      '  default: "Good"',
      "  ko: 42",
      "languages: [en, ko]",
      "navigation: {}",
    ].join("\n"),
    (dir) => {
      const cfg = loadBookConfig(dir);
      assert.equal(resolveBookTitle(cfg, "ko").title, "Good");
    },
  );
});
