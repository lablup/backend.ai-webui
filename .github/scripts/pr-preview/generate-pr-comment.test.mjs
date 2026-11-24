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
  adrUrl: "https://lablup.github.io/backend.ai-webui/pr/9541/adr/",
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

const ADR_CHANGES = {
  base: "main",
  head: "feat/gh-1-adr",
  baseSha: "a".repeat(40),
  headSha: "b".repeat(40),
  adrs: [
    {
      id: "0003",
      status: "removed",
      title: "Old decision",
      files: {
        en: { path: "adr/0003-old.md", status: "removed" },
        ko: { path: "adr/0003-old.ko.md", status: "removed" },
      },
    },
    {
      id: "0012",
      status: "modified",
      title: "Changed decision",
      files: {
        en: {
          path: "adr/0012-new-name.md",
          status: "renamed",
          basePath: "adr/0012-old-name.md",
        },
        ko: { path: "adr/0012-new-name.ko.md", status: "unchanged" },
      },
    },
    {
      id: "0031",
      status: "added",
      title: "New decision",
      files: {
        en: { path: "adr/0031-new.md", status: "added" },
        ko: { path: "adr/0031-new.ko.md", status: "added" },
      },
    },
    {
      id: "0040",
      status: "modified",
      title: "Korean only edit",
      files: { ko: { path: "adr/0040-k.ko.md", status: "modified" } },
    },
  ],
  architecture: { en: "modified", ko: "unchanged" },
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

test("an ADR-only PR renders the ADR section with diff links", () => {
  const body = render([
    ["meta", "pr-meta.json", META],
    ["adr", "changes.json", ADR_CHANGES],
  ]);
  const url = "https://lablup.github.io/backend.ai-webui/pr/9541/adr/";
  assert.match(body, /### 📐 ADR Preview/);
  assert.doesNotMatch(body, /Storybook|Docs Preview/);
  assert.ok(body.includes(`href="${url}"`));
  assert.ok(
    body.includes(
      `| [0003 — Old decision](${url}#/0003?view=diff&lang=en) | \`REMOVED\` | \`en\` (removed), \`ko\` (removed) |`,
    ),
  );
  assert.ok(
    body.includes(
      `| [0012 — Changed decision](${url}#/0012?view=diff&lang=en) | changed | \`en\` (renamed) |`,
    ),
  );
  assert.ok(
    body.includes(
      `| [0031 — New decision](${url}#/0031?lang=en) | \`NEW\` | \`en\` (added), \`ko\` (added) |`,
    ),
  );
  assert.ok(
    body.includes(`(${url}#/0040?view=diff&lang=ko) | changed | \`ko\` |`),
  );
  assert.match(
    body,
    /The ADR index \(`docs\/ARCHITECTURE\*\.md`\) changed: `en` modified\./,
  );
  assert.ok(body.includes(`>ADRs</a> · `));
});

test("a ko-only edit links to the ko document", () => {
  const body = render([
    ["meta", "pr-meta.json", META],
    [
      "adr",
      "changes.json",
      {
        ...ADR_CHANGES,
        adrs: [
          {
            id: "0002",
            status: "modified",
            title: "Second",
            files: {
              en: { path: "adr/0002-s.md", status: "unchanged" },
              ko: { path: "adr/0002-s.ko.md", status: "modified" },
            },
          },
        ],
      },
    ],
  ]);
  const url = "https://lablup.github.io/backend.ai-webui/pr/9541/adr/";
  assert.ok(
    body.includes(
      `| [0002 — Second](${url}#/0002?view=diff&lang=ko) | changed | \`ko\` |`,
    ),
  );
});

test("an ADR preview with no ADR change says so", () => {
  const body = render([
    ["meta", "pr-meta.json", META],
    [
      "adr",
      "changes.json",
      {
        ...ADR_CHANGES,
        adrs: [],
        architecture: { en: "unchanged", ko: "unchanged" },
      },
    ],
  ]);
  assert.match(body, /no ADR change to mark \(viewer or pipeline change\)/);
  assert.doesNotMatch(body, /\| ADR \|/);
});

test("ADR ids that could reach a URL are dropped, and titles escaped", () => {
  const body = render([
    ["meta", "pr-meta.json", META],
    [
      "adr",
      "changes.json",
      {
        ...ADR_CHANGES,
        adrs: [
          { id: "../x", status: "added", title: "evil", files: {} },
          {
            id: "0007",
            status: "<b>",
            title: "T [a](b) <img src=x> | p",
            files: { en: { path: "adr/0007-t.md", status: "<script>" } },
          },
        ],
      },
    ],
  ]);
  assert.doesNotMatch(body, /\.\.\/x|evil|<img|<script>|<b>/i);
  assert.match(body, /0007 — T \\\[a\\\]\(b\) &lt;img src=x&gt; \\\| p/);
  assert.match(body, /\| changed \| — \|/);
});

test("all three inputs render all sections in order", () => {
  const body = render([
    ["meta", "pr-meta.json", META],
    ["analysis", "analysis.json", ANALYSIS],
    ["docs", "docs-manifest.json", DOCS_MANIFEST],
    ["adr", "changes.json", ADR_CHANGES],
  ]);
  const order = [
    "### 📚 Storybook Preview",
    "### 📖 Docs Preview",
    "### 📐 ADR Preview",
  ].map((h) => body.indexOf(h));
  assert.ok(order.every((i, n) => i >= 0 && (n === 0 || i > order[n - 1])));
});
