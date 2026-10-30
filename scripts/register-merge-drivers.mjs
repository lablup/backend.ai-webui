#!/usr/bin/env node
/**
 * Registers the merge drivers this repository defines (run from `prepare`).
 * git keeps drivers in config, not in the tree, so a `merge=<name>` line in
 * .gitattributes does nothing until this has run. Never fails the install.
 *
 *   node scripts/register-merge-drivers.mjs           # register
 *   node scripts/register-merge-drivers.mjs --check   # list unregistered ones
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const DRIVERS = {
  "search-index": {
    name: "searchIndex.json structural merge (ADR 0003)",
    driver: "node scripts/merge-search-index.mjs %O %A %B %P",
  },
};

const git = (...args) =>
  spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });

/** Driver names `.gitattributes` declares with `merge=<name>`. */
export function declaredDrivers(gitattributes) {
  const names = new Set();
  for (const line of gitattributes.split("\n")) {
    if (line.trimStart().startsWith("#")) continue;
    for (const m of line.matchAll(/(?:^|\s)merge=([^\s]+)/g)) names.add(m[1]);
  }
  // `binary`, `text` and `union` are git's built-in drivers.
  for (const builtin of ["binary", "text", "union"]) names.delete(builtin);
  return [...names].sort();
}

function register() {
  if (git("rev-parse", "--is-inside-work-tree").stdout.trim() !== "true")
    return;
  for (const [id, { name, driver }] of Object.entries(DRIVERS)) {
    git("config", `merge.${id}.name`, name);
    git("config", `merge.${id}.driver`, driver);
  }
}

function check() {
  const attrs = fs.readFileSync(path.join(ROOT, ".gitattributes"), "utf8");
  const missing = declaredDrivers(attrs).filter(
    (id) => git("config", "--get", `merge.${id}.driver`).status !== 0,
  );
  if (!missing.length) {
    console.log("every merge driver in .gitattributes is registered");
    return;
  }
  for (const id of missing)
    console.log(
      `merge=${id}: declared in .gitattributes, no merge.${id}.driver in git config` +
        (DRIVERS[id]
          ? " — run `pnpm install`"
          : " — not in DRIVERS, so `prepare` never registers it"),
    );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    if (process.argv.includes("--check")) check();
    else register();
  } catch (e) {
    console.warn(`register-merge-drivers: skipped (${e.message})`);
  }
}
