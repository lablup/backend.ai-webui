#!/usr/bin/env node
// Decide whether a PR needs a docs preview, and which languages to build.
//
// The workflow's event-level `paths:` filter is a union across every job it
// hosts, so each job has to re-ask the question against the PR's own diff.
//
// Usage:
//   node docs-changed-languages.mjs --base origin/main --head HEAD [--output docs-meta.json]
//   git diff --name-only origin/main...HEAD | node docs-changed-languages.mjs --stdin
//
// Prints `{ docs, languages, reason }` as JSON on stdout.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const DOCS_PKG = "packages/backend.ai-webui-docs/";
const DOCS_SRC = `${DOCS_PKG}src/`;
const TOOLKIT_PKG = "packages/backend.ai-docs-toolkit/";

// Same shape the comment generator accepts, so an unexpected directory under
// `src/` can never reach a URL: two letters plus an optional region suffix.
const LANG_RE = /^[a-z]{2}(-[a-z0-9]+)?$/;

// Files that change how EVERY page is built rather than what one language says.
// A PR touching one of these gets an `en` preview so the layout is reviewable.
const isBuildInput = (file) =>
  file.startsWith(TOOLKIT_PKG) ||
  file === `${DOCS_SRC}book.config.yaml` ||
  file === `${DOCS_PKG}docs-toolkit.config.yaml` ||
  file.startsWith(`${DOCS_PKG}scripts/`) ||
  file.startsWith(`${DOCS_PKG}assets/`) ||
  file === ".github/workflows/pr-preview.yml" ||
  file.startsWith(".github/scripts/pr-preview/");

const contentLanguage = (file) => {
  if (!file.startsWith(DOCS_SRC)) return null;
  const rest = file.slice(DOCS_SRC.length);
  const slash = rest.indexOf("/");
  if (slash === -1) return null;
  const lang = rest.slice(0, slash);
  return LANG_RE.test(lang) ? lang : null;
};

export function classify(files) {
  const languages = new Set();
  let buildInput = false;

  for (const file of files) {
    if (!file) continue;
    const lang = contentLanguage(file);
    if (lang) languages.add(lang);
    if (isBuildInput(file)) buildInput = true;
  }

  const content = languages.size > 0;
  if (buildInput) languages.add("en");

  const reason = buildInput
    ? content
      ? "mixed"
      : "toolkit"
    : content
      ? "content"
      : "none";

  return {
    docs: languages.size > 0,
    languages: [...languages].sort(),
    reason,
  };
}

const getArg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
};

function changedFiles(base, head) {
  const git = (args) =>
    execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
      .split("\n")
      .filter(Boolean);
  // Three dots first: it reports what the branch changed, ignoring commits that
  // landed on base meanwhile. It needs a merge base, which a shallow clone may
  // not have — the two-dot fallback compares the two trees instead.
  try {
    return git(["diff", "--name-only", `${base}...${head}`]);
  } catch {
    return git(["diff", "--name-only", base, head]);
  }
}

function main() {
  const files = process.argv.includes("--stdin")
    ? readFileSync(0, "utf8").split("\n")
    : changedFiles(getArg("base") ?? "origin/main", getArg("head") ?? "HEAD");

  const result = classify(files);
  const json = JSON.stringify(result);
  const output = getArg("output");
  if (output) writeFileSync(output, `${json}\n`);
  console.log(json);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
