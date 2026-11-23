#!/usr/bin/env node
// Decide whether a PR needs an ADR preview, and list the ADRs it added,
// changed or removed (the `changes.json` the ADR viewer reads).
//
// Usage:
//   node adr-changes.mjs --base origin/main --head HEAD
//
// Prints `{ adr, reason, diffMode, changes }` as JSON on stdout.

import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const ARCHITECTURE = {
  en: "docs/ARCHITECTURE.md",
  ko: "docs/ARCHITECTURE.ko.md",
};
export const ADR_DIFF_PATHS = ["docs/adr", ARCHITECTURE.en, ARCHITECTURE.ko];

const ADR_FILE_RE = /^docs\/adr\/(\d{4})-[A-Za-z0-9._-]+?(\.ko)?\.md$/;

const isContent = (file) =>
  ADR_FILE_RE.test(file) || Object.values(ARCHITECTURE).includes(file);

// Like the docs preview: a change to the pipeline itself gets a preview, so the
// workflow change is reviewable on the PR that makes it.
const isBuildInput = (file) =>
  file === "docs/index.html" ||
  file === ".github/workflows/pr-preview.yml" ||
  file.startsWith(".github/scripts/pr-preview/");

export function classify(files) {
  const content = files.some((f) => f && isContent(f));
  const buildInput = files.some((f) => f && isBuildInput(f));
  const reason = buildInput
    ? content
      ? "mixed"
      : "viewer"
    : content
      ? "content"
      : "none";
  return { adr: content || buildInput, reason };
}

export const adrFile = (path) => {
  const m = ADR_FILE_RE.exec(path ?? "");
  return m ? { id: m[1], lang: m[2] ? "ko" : "en" } : null;
};

// `git diff --name-status -z -M`: `M\0path\0`, `R087\0old\0new\0`.
export function parseNameStatus(raw) {
  const parts = raw.split("\0");
  const entries = [];
  for (let i = 0; i < parts.length;) {
    const code = parts[i++];
    if (!code) continue;
    const letter = code[0];
    if (letter === "R" || letter === "C") {
      entries.push({ status: letter, oldPath: parts[i], path: parts[i + 1] });
      i += 2;
    } else {
      entries.push({ status: letter, path: parts[i] });
      i += 1;
    }
  }
  return entries;
}

export const rel = (path) => path.replace(/^docs\//, "");

export const stripTitle = (markdown) => {
  const h1 = /^#\s+(.+?)\s*#*\s*$/m.exec(markdown ?? "");
  return h1 ? h1[1].replace(/^\d{4}\s*[—–-]\s*/, "").trim() : "";
};

// `read(side, path)` returns a file's text at "head" or "base", or null.
export function buildManifest({
  entries,
  headFiles,
  read,
  base,
  head,
  baseSha,
  headSha,
}) {
  const adrs = new Map();
  const slot = (id) => {
    if (!adrs.has(id)) adrs.set(id, { id, files: {} });
    return adrs.get(id).files;
  };
  const architecture = { en: "unchanged", ko: "unchanged" };
  const archLang = (path) =>
    Object.keys(ARCHITECTURE).find((lang) => ARCHITECTURE[lang] === path);

  for (const entry of entries) {
    const { status, path, oldPath } = entry;
    const to = adrFile(path);
    const from = oldPath ? adrFile(oldPath) : null;

    if (status === "R" || status === "C") {
      const renamed = status === "R" && from;
      if (to) {
        slot(to.id)[to.lang] = renamed
          ? { path: rel(path), status: "renamed", basePath: rel(oldPath) }
          : { path: rel(path), status: "added" };
      } else if (renamed) {
        slot(from.id)[from.lang] = { path: rel(oldPath), status: "removed" };
      }
      if (archLang(path)) architecture[archLang(path)] = "added";
      if (status === "R" && archLang(oldPath)) {
        architecture[archLang(oldPath)] = "removed";
      }
      continue;
    }

    const fileStatus =
      status === "A" ? "added" : status === "D" ? "removed" : "modified";
    if (to) slot(to.id)[to.lang] = { path: rel(path), status: fileStatus };
    const arch = archLang(path);
    if (arch) architecture[arch] = fileStatus;
  }

  for (const file of headFiles) {
    const parsed = adrFile(file);
    if (!parsed || !adrs.has(parsed.id)) continue;
    const files = adrs.get(parsed.id).files;
    if (!files[parsed.lang]) {
      files[parsed.lang] = { path: rel(file), status: "unchanged" };
    }
  }

  const list = [...adrs.values()]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(({ id, files }) => {
      const present = Object.values(files);
      const all = (s) => present.every((f) => f.status === s);
      const status = all("added")
        ? "added"
        : all("removed")
          ? "removed"
          : "modified";
      const titleFile = files.en ?? files.ko;
      const title = stripTitle(
        read(
          titleFile.status === "removed" ? "base" : "head",
          `docs/${titleFile.path}`,
        ),
      );
      const ordered = {};
      for (const lang of ["en", "ko"])
        if (files[lang]) ordered[lang] = files[lang];
      return { id, status, title, files: ordered };
    });

  return { base, head, baseSha, headSha, adrs: list, architecture };
}

const git = (args, opts = {}) =>
  execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
  });

const tryGit = (args) => {
  try {
    return git(args).trim();
  } catch {
    return null;
  }
};

// The merge base, deepening a shallow clone once; the base tip when there is
// still none, reported as `two-dot`.
export function resolveBase(base, head) {
  let sha = tryGit(["merge-base", base, head]);
  const branch = base.startsWith("origin/") ? base.slice(7) : null;
  if (
    !sha &&
    branch &&
    tryGit(["rev-parse", "--is-shallow-repository"]) === "true"
  ) {
    tryGit([
      "fetch",
      "--deepen=200",
      "origin",
      `+refs/heads/${branch}:refs/remotes/origin/${branch}`,
    ]);
    sha = tryGit(["merge-base", base, head]);
  }
  if (sha) return { sha, diffMode: "three-dot" };
  return {
    sha: git(["rev-parse", `${base}^{commit}`]).trim(),
    diffMode: "two-dot",
  };
}

export const showFile = (sha, path, encoding = "utf8") => {
  try {
    return git(["show", `${sha}:${path}`], { encoding });
  } catch {
    return null;
  }
};

export function computeChanges({ base, head, headRef }) {
  const { sha: baseSha, diffMode } = resolveBase(base, head);
  const headSha = git(["rev-parse", `${head}^{commit}`]).trim();
  const files = git(["diff", "--name-only", baseSha, headSha])
    .split("\n")
    .filter(Boolean);
  const entries = parseNameStatus(
    git([
      "diff",
      "--name-status",
      "-z",
      "-M",
      baseSha,
      headSha,
      "--",
      ...ADR_DIFF_PATHS,
    ]),
  );
  const headFiles = git([
    "ls-tree",
    "-r",
    "--name-only",
    headSha,
    "--",
    "docs/adr",
  ])
    .split("\n")
    .filter(Boolean);
  const changes = buildManifest({
    entries,
    headFiles,
    read: (side, path) => showFile(side === "base" ? baseSha : headSha, path),
    base: base.replace(/^origin\//, ""),
    head: headRef || head,
    baseSha,
    headSha,
  });
  return { ...classify(files), diffMode, changes, headFiles };
}

export const getArg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
};

function main() {
  const result = computeChanges({
    base: getArg("base") ?? "origin/main",
    head: getArg("head") ?? "HEAD",
  });
  console.log(JSON.stringify(result));
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
