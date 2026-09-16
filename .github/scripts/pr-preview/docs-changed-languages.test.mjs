import assert from "node:assert/strict";
import { test } from "node:test";

import { classify } from "./docs-changed-languages.mjs";

const DOCS = "packages/backend.ai-webui-docs";

test("a PR outside the manual and the toolkit needs no preview", () => {
  assert.deepEqual(classify(["react/src/pages/SessionListPage.tsx"]), {
    docs: false,
    languages: [],
    reason: "none",
  });
});

test("content changes select their own languages", () => {
  const result = classify([
    `${DOCS}/src/ko/session/session_list.md`,
    `${DOCS}/src/en/session/session_list.md`,
    `${DOCS}/src/en/images/session_list.png`,
  ]);
  assert.deepEqual(result, {
    docs: true,
    languages: ["en", "ko"],
    reason: "content",
  });
});

test("a toolkit change builds en even with no content change", () => {
  const result = classify([
    "packages/backend.ai-docs-toolkit/src/styles-web.ts",
  ]);
  assert.deepEqual(result, {
    docs: true,
    languages: ["en"],
    reason: "toolkit",
  });
});

test("build inputs inside the docs package also mean en", () => {
  for (const file of [
    `${DOCS}/src/book.config.yaml`,
    `${DOCS}/docs-toolkit.config.yaml`,
    `${DOCS}/scripts/check-nav-titles.mjs`,
    `${DOCS}/assets/logo.svg`,
    ".github/workflows/pr-preview.yml",
    ".github/scripts/pr-preview/build-docs-preview.sh",
  ]) {
    assert.deepEqual(
      classify([file]),
      { docs: true, languages: ["en"], reason: "toolkit" },
      file,
    );
  }
});

test("content plus a build input is mixed, and en is added", () => {
  const result = classify([
    `${DOCS}/src/ko/session/session_list.md`,
    `${DOCS}/src/book.config.yaml`,
  ]);
  assert.deepEqual(result, {
    docs: true,
    languages: ["en", "ko"],
    reason: "mixed",
  });
});

test("non-source files in the docs package do not trigger a build", () => {
  const result = classify([
    `${DOCS}/README.md`,
    `${DOCS}/terminology.json`,
    `${DOCS}/src/en`,
  ]);
  assert.deepEqual(result, { docs: false, languages: [], reason: "none" });
});

test("a directory under src/ that is not a language code is ignored", () => {
  const result = classify([`${DOCS}/src/drafts/whatever.md`]);
  assert.deepEqual(result, { docs: false, languages: [], reason: "none" });
});

test("a regional language code is accepted", () => {
  const result = classify([`${DOCS}/src/pt-br/session/session_list.md`]);
  assert.deepEqual(result, {
    docs: true,
    languages: ["pt-br"],
    reason: "content",
  });
});
