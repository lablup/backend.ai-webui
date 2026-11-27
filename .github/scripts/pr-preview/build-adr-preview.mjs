#!/usr/bin/env node
// Assemble the ADR viewer's per-PR preview: the head viewer and ADR files, the
// base copies of every changed ADR, and `changes.json`. Reads git objects only,
// so it works from any checkout whatever its working tree holds.
//
// Usage:
//   node build-adr-preview.mjs --base origin/main --head HEAD --head-ref <branch> --out <dir>

import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

import {
  ARCHITECTURE,
  computeChanges,
  getArg,
  rel,
  showFile,
} from "./adr-changes.mjs";

const SAFE_ADR_PATH = /^adr\/[A-Za-z0-9._-]+\.md$/;
const META_RE = /<meta\s+name="adr-ref"\s+content="[^"]*"\s*\/?>/;

export const escapeAttr = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

export function fillAdrRef(html, ref) {
  if (!META_RE.test(html)) {
    throw new Error(
      'docs/index.html has no <meta name="adr-ref" content="" />',
    );
  }
  return html.replace(
    META_RE,
    () => `<meta name="adr-ref" content="${escapeAttr(ref)}" />`,
  );
}

export function buildAdrPreview({ base, head, headRef, out }) {
  if (existsSync(out) && readdirSync(out).length > 0) {
    throw new Error(`${out} is not empty`);
  }
  const { changes, headFiles } = computeChanges({ base, head, headRef });
  const write = (relPath, data) => {
    const target = join(out, relPath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, data);
  };
  const copy = (sha, docsPath, relPath) => {
    const data = showFile(sha, `docs/${docsPath}`, "buffer");
    if (data === null) return false;
    write(relPath, data);
    return true;
  };

  const html = showFile(changes.headSha, "docs/index.html");
  if (html === null) throw new Error("docs/index.html is missing at head");
  write("index.html", fillAdrRef(html, changes.head));

  const headAdrs = headFiles.map(rel).filter((p) => SAFE_ADR_PATH.test(p));
  for (const p of headAdrs) copy(changes.headSha, p, p);
  for (const p of Object.values(ARCHITECTURE)) {
    const name = rel(p);
    copy(changes.headSha, name, name);
    copy(changes.baseSha, name, `base/${name}`);
  }

  for (const adr of changes.adrs) {
    for (const file of Object.values(adr.files)) {
      if (!["modified", "removed", "renamed"].includes(file.status)) continue;
      const basePath = file.basePath ?? file.path;
      if (!SAFE_ADR_PATH.test(basePath)) continue;
      copy(changes.baseSha, basePath, `base/${basePath}`);
    }
  }

  write("changes.json", `${JSON.stringify(changes, null, 2)}\n`);
  return changes;
}

function main() {
  const out = getArg("out");
  const headRef = getArg("head-ref");
  if (!out || !headRef) {
    console.error(
      "usage: build-adr-preview.mjs --base <ref> --head <ref> --head-ref <branch> --out <dir>",
    );
    process.exit(2);
  }
  const changes = buildAdrPreview({
    base: getArg("base") ?? "origin/main",
    head: getArg("head") ?? "HEAD",
    headRef,
    out,
  });
  console.log(
    `ADR preview in ${out}: ${changes.adrs.length} changed ADR(s) · ` +
      `base ${changes.baseSha.slice(0, 7)} · head ${changes.headSha.slice(0, 7)}`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
