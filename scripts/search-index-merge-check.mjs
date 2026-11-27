#!/usr/bin/env node
/**
 * husky post-merge / post-rewrite: after `scripts/merge-search-index.mjs`
 * resolved searchIndex.json provisionally, regenerate the index into a temp
 * file and say whether the committed one needs `pnpm run search-index`.
 *
 * Never touches the working tree and never fails: `gh stack` rebases branch
 * by branch, and a dirty tree or a non-zero hook would stop the next one.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PENDING_FILE,
  STATE_DIR_NAME,
  appendLog,
} from "./merge-search-index.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = "react/src/generated/searchIndex.json";
const EXTRACTOR = "react/scripts/build-search-index.mjs";

const git = (...args) =>
  spawnSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 26 });

function main() {
  const gitDir = git("rev-parse", "--absolute-git-dir");
  if (gitDir.status !== 0) return;
  const dir = path.join(gitDir.stdout.trim(), STATE_DIR_NAME);
  const pending = path.join(dir, PENDING_FILE);
  if (!fs.existsSync(pending)) return;
  fs.rmSync(pending, { force: true });

  const branch = git("rev-parse", "--abbrev-ref", "HEAD").stdout.trim();
  const hint = `search-index: on ${branch}, run \`pnpm run search-index\` and commit ${INDEX}`;

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "search-index-check-"));
  try {
    const out = path.join(tmp, "searchIndex.json");
    const build = spawnSync(process.execPath, [EXTRACTOR, "--out", out], {
      cwd: ROOT,
      encoding: "utf8",
    });
    if (build.status !== 0 || !fs.existsSync(out)) {
      appendLog(dir, "check-failed", INDEX);
      console.warn(
        `search-index: could not regenerate the index to check the merged one.\n${hint}`,
      );
      return;
    }
    const committed = git("show", `HEAD:${INDEX}`);
    if (
      committed.status === 0 &&
      committed.stdout === fs.readFileSync(out, "utf8")
    ) {
      appendLog(dir, "fresh", INDEX);
      return;
    }
    appendLog(dir, "flagged-stale", INDEX);
    console.warn(
      "search-index: the merged index differs from a fresh build of the merged source.\n" +
        hint,
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

try {
  main();
} catch (e) {
  console.warn(`search-index: post-merge check skipped (${e.message})`);
}
