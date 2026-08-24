#!/usr/bin/env node
// Work out what a PR changed inside `packages/backend.ai-ui`, and map each
// changed component onto the story entries that Storybook actually built for
// it. The mapping is read out of the built `index.json` rather than guessed, so
// a component whose stories live under a different title still resolves.
//
// Usage:
//   node analyze-pr.mjs --base origin/main --head HEAD \
//     --storybook-index <storybook-static/index.json> --output analysis.json

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const PKG_PREFIX = "packages/backend.ai-ui/";
const SRC_PREFIX = `${PKG_PREFIX}src/`;
const COMPONENT_PREFIX = `${SRC_PREFIX}components/`;

const getArg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
};

const base = getArg("base") ?? "origin/main";
const head = getArg("head") ?? "HEAD";
const indexPath = getArg("storybook-index");
const output = getArg("output") ?? "analysis.json";

const git = (args) =>
  execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

// A three-dot diff reports only what the PR branch changed, ignoring commits
// that landed on base meanwhile — that is the list we want. It needs a merge
// base, which a shallow clone may not have once base has advanced past the
// fetch window; deepen and retry before degrading. The two-dot fallback needs
// no merge base but compares two trees, so it can both over-report base churn
// and under-report a change that also exists on base. Callers get `diffMode` so
// the report can say when the list is approximate.
function changedFiles() {
  // `--name-status` so a newly ADDED component can be told apart from a
  // modified one; the report only flags missing stories for the former.
  const parse = (raw) =>
    raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [status, ...rest] = line.split("\t");
        // Renames are `R100\told\tnew` — the new path is what we care about.
        return { status: status[0], file: rest[rest.length - 1] };
      });

  const threeDot = () =>
    parse(git(["diff", "--name-status", `${base}...${head}`]));

  try {
    return { files: threeDot(), diffMode: "three-dot" };
  } catch {
    /* fall through to the deepen retry */
  }

  try {
    const bareBase = base.replace(/^origin\//, "");
    git([
      "fetch",
      "--deepen=200",
      "origin",
      `+refs/heads/${bareBase}:refs/remotes/origin/${bareBase}`,
    ]);
    return { files: threeDot(), diffMode: "three-dot" };
  } catch {
    /* fall through to the two-dot fallback */
  }

  try {
    return {
      files: parse(git(["diff", "--name-status", `${base}..${head}`])),
      diffMode: "two-dot",
    };
  } catch (error) {
    // A failed diff is not the same as "nothing changed" — publishing an empty
    // analysis here would look legitimate and silently drop the whole report.
    console.error(`::error::Could not diff ${base}..${head}: ${error.message}`);
    process.exit(1);
  }
}

const isGenerated = (file) => file.includes("/__generated__/");
const isStory = (file) => file.endsWith(".stories.tsx");
const isTest = (file) =>
  file.endsWith(".test.tsx") || file.endsWith(".test.ts");

/** `packages/backend.ai-ui/src/components/Foo.tsx` -> `./src/components/Foo.stories.tsx` */
const storyImportPathFor = (file) =>
  `./${file.slice(PKG_PREFIX.length).replace(/\.tsx$/, ".stories.tsx")}`;

/** `./src/components/Foo.stories.tsx` -> `packages/backend.ai-ui/src/components/Foo.stories.tsx` */
const repoPathForImport = (importPath) =>
  `${PKG_PREFIX}${importPath.replace(/^\.\//, "")}`;

function loadStoryEntries() {
  if (!indexPath || !existsSync(indexPath)) return [];
  const parsed = JSON.parse(readFileSync(indexPath, "utf8"));
  return Object.values(parsed.entries ?? {});
}

const { files, diffMode } = changedFiles();
const storyEntries = loadStoryEntries();
const entriesByImportPath = new Map();
for (const entry of storyEntries) {
  const list = entriesByImportPath.get(entry.importPath) ?? [];
  list.push(entry);
  entriesByImportPath.set(entry.importPath, list);
}

// One row per changed component source file. A changed `*.stories.tsx` with no
// matching component change gets its own row too, so a stories-only PR still
// links into the preview.
const rows = new Map();

const addRow = (componentFile) => {
  if (rows.has(componentFile)) return rows.get(componentFile);
  const storyImportPath = storyImportPathFor(componentFile);
  const entries = entriesByImportPath.get(storyImportPath) ?? [];
  // Prefer the autodocs page — it shows every story of the component on one
  // page, which is what a reviewer wants first. Fall back to the first story.
  const preferred = entries.find((e) => e.type === "docs") ?? entries[0];
  const row = {
    name: componentFile
      .split("/")
      .pop()
      .replace(/\.tsx$/, ""),
    file: componentFile,
    storyFile: entries.length > 0 ? repoPathForImport(storyImportPath) : null,
    hasStories: entries.length > 0,
    storyCount: entries.filter((e) => e.type === "story").length,
    deepLink: preferred ? `?path=/${preferred.type}/${preferred.id}` : null,
    sourceChanged: false,
    storiesChanged: false,
    isNew: false,
  };
  rows.set(componentFile, row);
  return row;
};

for (const { status, file } of files) {
  if (!file.startsWith(COMPONENT_PREFIX) || isGenerated(file) || isTest(file))
    continue;
  if (isStory(file)) {
    addRow(file.replace(/\.stories\.tsx$/, ".tsx")).storiesChanged = true;
  } else if (file.endsWith(".tsx")) {
    const row = addRow(file);
    row.sourceChanged = true;
    row.isNew = status === "A";
  }
}

const components = [...rows.values()].sort((a, b) =>
  a.name.localeCompare(b.name),
);

// Every changed package file already represented by a component row.
const accounted = new Set();
for (const row of rows.values()) {
  if (row.sourceChanged) accounted.add(row.file);
  if (row.storiesChanged)
    accounted.add(row.file.replace(/\.tsx$/, ".stories.tsx"));
}

const analysis = {
  diffMode,
  base,
  head,
  changedFileCount: files.length,
  packageFileCount: files.filter(({ file }) => file.startsWith(PKG_PREFIX))
    .length,
  // A locale-only or hook-only change still deploys a preview; the report says
  // so rather than pretending nothing happened.
  otherPackageFiles: files
    .map(({ file }) => file)
    .filter(
      (f) => f.startsWith(PKG_PREFIX) && !accounted.has(f) && !isGenerated(f),
    ),
  components,
  summary: {
    componentsChanged: components.filter((c) => c.sourceChanged).length,
    // Only NEW components are counted as a gap. Plenty of pre-existing
    // components — the Relay `fragments/` ones especially — have never had a
    // story, and nagging about them on every unrelated edit trains reviewers to
    // ignore the report.
    newWithoutStories: components.filter((c) => c.isNew && !c.hasStories)
      .length,
    totalStories: storyEntries.filter((e) => e.type === "story").length,
  },
};

writeFileSync(output, `${JSON.stringify(analysis, null, 2)}\n`);
console.log(
  `Analyzed ${files.length} changed files (${diffMode}); ` +
    `${analysis.summary.componentsChanged} BUI components changed, ` +
    `${analysis.summary.newWithoutStories} new one(s) without stories.`,
);
