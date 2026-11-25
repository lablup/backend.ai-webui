#!/usr/bin/env node
// Build and measure the bundle targets the plan calls for (ADR 0039).
//
// Usage: node run.mjs --plan plan.json [--cache-dir bundle-size-cache]
//          [--out-dir bundle-size] [--base-dir "$RUNNER_TEMP/bundle-base"]
import { execSync } from "node:child_process";
import {
  appendFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from "node:fs";
import { join } from "node:path";
import { measureTarget, writeMeasurement } from "./measure.mjs";
import { TARGETS } from "./targets.mjs";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const plan = JSON.parse(readFileSync(flag("plan"), "utf8"));
const cacheDir = flag("cache-dir", "bundle-size-cache");
const outDir = flag("out-dir", "bundle-size");
const baseDir = flag(
  "base-dir",
  join(process.env.RUNNER_TEMP ?? "/tmp", "bundle-base"),
);

mkdirSync(cacheDir, { recursive: true });
const cachePath = (key) => join(cacheDir, `${key}.json`);
const sh = (command, cwd) => {
  console.log(`$ ${command}${cwd ? ` (in ${cwd})` : ""}`);
  execSync(command, { cwd, stdio: "inherit" });
};

const saves = [];
const built = [];

function fromCache(key, side) {
  if (!existsSync(cachePath(key))) return false;
  const record = JSON.parse(readFileSync(cachePath(key), "utf8"));
  writeMeasurement({ ...record, side, source: "cache" }, outDir);
  return true;
}

function keep(record, key) {
  copyFileSync(writeMeasurement(record, outDir), cachePath(key));
  saves.push(key);
}

let installed = false;
function buildHead(target, entry) {
  if (!installed) {
    sh("pnpm install --frozen-lockfile");
    installed = true;
  }
  sh(target.build);
  built.push(target.id);
  const record = measureTarget({
    target,
    side: "head",
    dir: target.outDir,
    commit: plan.head,
  });
  if (plan.base) writeMeasurement(record, outDir);
  else keep(record, entry.headCacheKey);
  return record;
}

let baseReady;
function prepareBase() {
  if (baseReady === undefined) {
    try {
      sh(`git worktree add "${baseDir}" ${plan.base}`);
      sh("pnpm install --frozen-lockfile", baseDir);
      baseReady = null;
    } catch (error) {
      baseReady = `base setup failed: ${error.message.split("\n")[0]}`;
    }
  }
  return baseReady;
}

function buildBase(target, entry) {
  let error = prepareBase();
  if (!error) {
    try {
      sh(target.build, baseDir);
      keep(
        measureTarget({
          target,
          side: "base",
          dir: join(baseDir, target.outDir),
          commit: plan.base,
        }),
        entry.baseCacheKey,
      );
      return;
    } catch (e) {
      error = `base build failed: ${e.message.split("\n")[0]}`;
    }
  }
  writeMeasurement(
    measureTarget({ target, side: "base", commit: plan.base, error }),
    outDir,
  );
}

for (const entry of plan.targets) {
  const target = TARGETS.find((t) => t.id === entry.id);
  if (!plan.base) {
    if (!fromCache(entry.headCacheKey, "head")) buildHead(target, entry);
    continue;
  }
  if (!entry.compared) continue;
  const head = buildHead(target, entry);
  if (entry.baseCacheKey === entry.headCacheKey)
    writeMeasurement({ ...head, side: "base", source: "head" }, outDir);
  else if (!fromCache(entry.baseCacheKey, "base")) buildBase(target, entry);
}

const outputs = `saves=${JSON.stringify(saves)}\nbuilt=${JSON.stringify(built)}\n`;
if (process.env.GITHUB_OUTPUT)
  appendFileSync(process.env.GITHUB_OUTPUT, outputs);
console.log(outputs);
