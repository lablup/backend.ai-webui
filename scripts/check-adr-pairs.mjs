#!/usr/bin/env node
// check-adr-pairs.mjs — every ADR and docs/ARCHITECTURE.md exist as an English
// file plus a Korean `.ko.md` companion that matches its shape (ADR 0018).
// With a base ref (VERIFY_BASE or the merge-base with main), a branch that
// changes an English file must change its `.ko.md` too.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ADR_DIR = "docs/adr";

const pairs = [["docs/ARCHITECTURE.md", "docs/ARCHITECTURE.ko.md"]];
const problems = [];

const names = fs.readdirSync(path.join(ROOT, ADR_DIR)).filter((n) => n.endsWith(".md"));
for (const name of names) {
  if (!/^\d{4}-/.test(name)) continue;
  if (name.endsWith(".ko.md")) {
    const en = name.replace(/\.ko\.md$/, ".md");
    if (!names.includes(en)) problems.push(`${ADR_DIR}/${name}: no English file ${en}`);
    continue;
  }
  pairs.push([`${ADR_DIR}/${name}`, `${ADR_DIR}/${name.replace(/\.md$/, ".ko.md")}`]);
}

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const count = (text, re) => (text.match(re) ?? []).length;

for (const [en, ko] of pairs) {
  if (!fs.existsSync(path.join(ROOT, ko))) {
    problems.push(`${en}: missing Korean companion ${ko}`);
    continue;
  }
  const a = read(en);
  const b = read(ko);
  const titleA = a.split("\n", 1)[0];
  const titleB = b.split("\n", 1)[0];
  if (en.startsWith(ADR_DIR) && titleA !== titleB) {
    problems.push(`${ko}: title "${titleB}" differs from "${titleA}"`);
  }
  for (const [label, re] of [
    ["### subsections", /^### /gm],
    ["mermaid blocks", /^```mermaid/gm],
  ]) {
    if (count(a, re) !== count(b, re)) {
      problems.push(`${ko}: ${count(b, re)} ${label}, ${en} has ${count(a, re)}`);
    }
  }
}

const git = (...args) =>
  execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
let base = "";
for (const candidate of [process.env.VERIFY_BASE, "origin/main", "main"]) {
  if (!candidate) continue;
  try {
    base = candidate === process.env.VERIFY_BASE ? git("rev-parse", "--verify", `${candidate}^{commit}`) : git("merge-base", "HEAD", candidate);
    break;
  } catch {
    // try the next candidate
  }
}
if (base) {
  const changed = new Set(git("diff", "--name-only", base, "--", "docs").split("\n").filter(Boolean));
  // A Korean-only change (a translation fix, a new companion) is fine.
  for (const [en, ko] of pairs) {
    if (changed.has(en) && !changed.has(ko)) {
      problems.push(`${en} changed on this branch but ${ko} did not`);
    }
  }
} else {
  console.log(">> no base ref — pair-update check skipped");
}

if (problems.length) {
  for (const p of problems) console.log(`ADR pair: ${p}`);
  process.exit(1);
}
console.log(`>> ${pairs.length} English/Korean pairs checked`);
