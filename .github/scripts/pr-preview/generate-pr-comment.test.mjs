import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(
  new URL("./generate-pr-comment.mjs", import.meta.url),
);

const META = {
  prNumber: "9541",
  shortHash: "a1b2c3d",
  storybookUrl: "https://lablup.github.io/backend.ai-webui/pr/9541/storybook/",
  docsUrl: "https://lablup.github.io/backend.ai-webui/pr/9541/docs/next/",
  runUrl: "https://github.com/lablup/backend.ai-webui/actions/runs/1",
};

const ANALYSIS = {
  base: "origin/main",
  diffMode: "three-dot",
  components: [
    {
      name: "BAIDeploymentTable",
      file: "packages/backend.ai-ui/src/components/BAIDeploymentTable.tsx",
      isNew: false,
      sourceChanged: true,
      storiesChanged: true,
      hasStories: true,
      storyCount: 4,
      deepLink: "?path=/story/components-baideploymenttable--default",
    },
  ],
  otherPackageFiles: ["packages/backend.ai-ui/src/index.ts"],
  summary: { newWithoutStories: 0 },
};

const DOCS_MANIFEST = {
  version: 1,
  channel: "next",
  label: "PR preview",
  generatedAt: "2026-09-08T00:00:00.000Z",
  languages: ["en", "ko"],
  langs: {
    en: {
      totals: {
        pages: 24,
        changes: 17,
        added: 12,
        modified: 4,
        removed: 1,
        images: 2,
        newPages: 1,
        deletedPages: 1,
      },
      pages: [
        {
          slug: "deployment",
          title: "Deployment",
          status: "modified",
          url: "next/en/deployment.html",
          sourcePath: "src/en/deployment/deployment.md",
          counts: { total: 6, added: 4, modified: 2, removed: 0, images: 1 },
          fingerprints: [],
        },
        {
          slug: "runtime_parameters",
          title: "Runtime Parameters",
          status: "new",
          url: "next/en/runtime_parameters.html",
          sourcePath: "src/en/runtime_parameters/runtime_parameters.md",
          counts: { total: 11, added: 8, modified: 2, removed: 0, images: 1 },
          fingerprints: [],
        },
        {
          slug: "legacy_wsproxy",
          title: "Legacy WSProxy",
          status: "deleted",
          url: "next/en/legacy_wsproxy.html",
          sourcePath: "src/en/legacy_wsproxy/legacy_wsproxy.md",
          counts: { total: 0, added: 0, modified: 0, removed: 1, images: 0 },
          fingerprints: [],
        },
      ],
    },
    ko: {
      totals: {
        pages: 24,
        changes: 5,
        added: 3,
        modified: 2,
        removed: 0,
        images: 0,
        newPages: 0,
        deletedPages: 0,
      },
      pages: [
        {
          slug: "deployment",
          title: "배포",
          status: "modified",
          url: "next/ko/deployment.html",
          sourcePath: "src/ko/deployment/deployment.md",
          counts: { total: 5, added: 3, modified: 2, removed: 0, images: 0 },
          fingerprints: [],
        },
      ],
    },
  },
};

const TOOLKIT_MANIFEST = {
  version: 1,
  channel: "next",
  label: "PR preview",
  generatedAt: "2026-09-08T00:00:00.000Z",
  languages: ["en"],
  langs: {
    en: {
      totals: {
        pages: 24,
        changes: 0,
        added: 0,
        modified: 0,
        removed: 0,
        images: 0,
        newPages: 0,
        deletedPages: 0,
      },
      pages: [],
    },
  },
};

const render = (files) => {
  const dir = mkdtempSync(join(tmpdir(), "pr-comment-"));
  const args = [SCRIPT];
  for (const [flag, name, value] of files) {
    const path = join(dir, name);
    writeFileSync(path, JSON.stringify(value));
    args.push(`--${flag}`, path);
  }
  return execFileSync("node", args, { encoding: "utf8" });
};

test("a docs-only PR renders the docs section and no Storybook data", () => {
  const body = render([
    ["meta", "pr-meta.json", META],
    ["docs", "docs-manifest.json", DOCS_MANIFEST],
    [
      "docs-meta",
      "docs-meta.json",
      { languages: ["en", "ko"], reason: "content" },
    ],
  ]);

  assert.match(body, /^## PR Analysis Report/);
  assert.match(body, /### 📖 Docs Preview/);
  assert.doesNotMatch(body, /Storybook/);
  assert.match(
    body,
    /\*\*English\*\* \(`en`\) — 3 changed page\(s\) · \+12 ~4 −1, 2 image\(s\)/,
  );
  assert.match(
    body,
    /\[Deployment\]\(https:\/\/lablup\.github\.io\/backend\.ai-webui\/pr\/9541\/docs\/next\/en\/deployment\.html#bai-change-1\)/,
  );
  assert.match(body, /\[Runtime Parameters\]\([^)]+\) `NEW`/);
  // A deleted page has nothing to open, so its title stays unlinked.
  assert.match(body, /\| Legacy WSProxy `DELETED` \|/);
  assert.doesNotMatch(body, /\[Legacy WSProxy\]/);
  assert.match(body, /\*\*한국어\*\* \(`ko`\)/);
});

test("a storybook-only PR renders unchanged, with no docs section", () => {
  const body = render([
    ["meta", "pr-meta.json", META],
    ["analysis", "analysis.json", ANALYSIS],
  ]);

  assert.match(body, /### 📚 Storybook Preview/);
  assert.match(body, /### 🧩 Changed Components/);
  assert.match(body, /### 📦 Bundle Size/);
  assert.match(body, /`BAIDeploymentTable`/);
  assert.doesNotMatch(body, /Docs Preview/);
});

test("a toolkit-only PR says what was built instead of listing pages", () => {
  const body = render([
    ["meta", "pr-meta.json", META],
    ["docs", "docs-manifest.json", TOOLKIT_MANIFEST],
    ["docs-meta", "docs-meta.json", { languages: ["en"], reason: "toolkit" }],
  ]);

  assert.match(body, /### 📖 Docs Preview/);
  assert.match(
    body,
    /Preview built for `en` — no content change to mark \(toolkit\/layout change\)\./,
  );
  assert.doesNotMatch(body, /\| Page \| Changes \|/);
});

test("manifest fields that could reach a URL are validated, and titles escaped", () => {
  const hostile = {
    ...TOOLKIT_MANIFEST,
    languages: ["en", "../../etc"],
    langs: {
      en: {
        totals: { added: 1 },
        pages: [
          {
            slug: "../../../evil",
            title: "Title [with](markdown) <img src=x> | pipe",
            status: "modified",
            counts: { added: 1 },
          },
        ],
      },
    },
  };
  const body = render([
    ["meta", "pr-meta.json", META],
    ["docs", "docs-manifest.json", hostile],
    ["docs-meta", "docs-meta.json", { languages: ["en"], reason: "content" }],
  ]);

  assert.doesNotMatch(body, /\.\.\//);
  assert.doesNotMatch(body, /<img/);
  assert.match(
    body,
    /Title \\\[with\\\]\(markdown\) &lt;img src=x&gt; \\\| pipe/,
  );
});

test("neither analysis nor docs is an error", () => {
  assert.throws(() => render([["meta", "pr-meta.json", META]]));
});
