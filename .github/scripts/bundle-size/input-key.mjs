#!/usr/bin/env node
// Input key per bundle target at the head and the merge base, plus the cache
// keys and the comparison plan (ADR 0039).
//
// Usage: node input-key.mjs [--head <commit>] [--base <commit>] [--output plan.json]
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, realpathSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { TARGETS, TOOLCHAIN_PATHS } from "./targets.mjs";

const git = (args, cwd) =>
  execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();

const objectId = (commit, path, cwd) => {
  try {
    return git(["rev-parse", "--verify", "--quiet", `${commit}:${path}`], cwd);
  } catch {
    return "missing";
  }
};

const sha256 = (lines) =>
  createHash("sha256").update(lines.join("\n")).digest("hex");

export const inputKey = (id, inputs, commit, cwd) =>
  sha256([id, ...inputs.map((path) => objectId(commit, path, cwd))]);

export const toolchainHash = (commit, cwd, paths = TOOLCHAIN_PATHS) =>
  sha256(paths.map((path) => objectId(commit, path, cwd)));

export function plan({
  head = "HEAD",
  base,
  cwd,
  targets = TARGETS,
  toolchainPaths = TOOLCHAIN_PATHS,
} = {}) {
  const headCommit = git(["rev-parse", `${head}^{commit}`], cwd);
  const toolchain = toolchainHash(headCommit, cwd, toolchainPaths);
  const cacheKey = (id, key) => `bundle-size-${toolchain}-${id}-${key}`;
  const headOnly = (target) => {
    const headKey = inputKey(target.id, target.inputs, headCommit, cwd);
    return {
      id: target.id,
      headKey,
      headCacheKey: cacheKey(target.id, headKey),
    };
  };

  if (!base) {
    return {
      head: headCommit,
      base: null,
      toolchain,
      toolchainChanged: false,
      targets: targets.map((target) => {
        const entry = headOnly(target);
        return {
          ...entry,
          baseKey: null,
          compared: false,
          baseCacheKey: null,
          restoreKey: entry.headCacheKey,
        };
      }),
    };
  }

  const baseCommit = git(["rev-parse", `${base}^{commit}`], cwd);
  const toolchainChanged =
    toolchainHash(baseCommit, cwd, toolchainPaths) !== toolchain;
  const entries = targets.map((target) => {
    const entry = headOnly(target);
    const baseKey = inputKey(target.id, target.inputs, baseCommit, cwd);
    const compared = toolchainChanged || entry.headKey !== baseKey;
    const baseCacheKey = cacheKey(target.id, baseKey);
    return {
      ...entry,
      baseKey,
      compared,
      baseCacheKey,
      restoreKey:
        compared && baseCacheKey !== entry.headCacheKey ? baseCacheKey : "",
    };
  });
  return {
    head: headCommit,
    base: baseCommit,
    toolchain,
    toolchainChanged,
    targets: entries,
  };
}

if (
  process.argv[1] &&
  existsSync(process.argv[1]) &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href
) {
  const args = process.argv.slice(2);
  const flag = (name) => {
    const i = args.indexOf(`--${name}`);
    return i === -1 ? undefined : args[i + 1];
  };
  const json = JSON.stringify(
    plan({ head: flag("head") ?? "HEAD", base: flag("base") }),
  );
  if (flag("output")) writeFileSync(flag("output"), `${json}\n`);
  console.log(json);
}
