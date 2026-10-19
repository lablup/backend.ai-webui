#!/usr/bin/env node
/**
 * Move the `@lablup/ui-common` / `@lablup/ui-common-cli` catalog pins together.
 *
 *   node scripts/ui-common-pin.mjs <dist-tag|version>  # canary, next, pr-78, 0.2.0-alpha.20
 *   node scripts/ui-common-pin.mjs local [dir]         # tarballs packed from a checkout
 *   node scripts/ui-common-pin.mjs --check             # exit 1 on a preview or local pin
 *   node scripts/ui-common-pin.mjs --check --allow-preview  # exit 1 on a local pin only
 *
 * A pin installs, runs `ui-common upgrade --from <old>` when the version moved
 * forward, and regenerates both UI-COMMON agent blocks. A `pr-<n>` preview or a
 * local pin is for verifying an unmerged ui-common change and must not reach
 * main; `--check` (CI, verify.sh) enforces that. pnpm refuses `file:` in a
 * catalog, so a local pin is an `overrides` block a registry pin removes.
 * Flow: .claude/skills/ui-common-change/SKILL.md.
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WORKSPACE = join(ROOT, "pnpm-workspace.yaml");
export const PACKAGES = ["@lablup/ui-common", "@lablup/ui-common-cli"];
const LOCAL_MARKER =
  "  # ui-common-pin local: a local ui-common build. Never commit this block.";

/** [start, end) of a top-level `key:` mapping's body. */
function section(text, key) {
  const head = new RegExp(`^${key}:\\n`, "m").exec(text);
  if (!head) return null;
  const start = head.index + head[0].length;
  const next = /^\S/m.exec(text.slice(start));
  return [start, next ? start + next.index : text.length];
}

function entryPattern(name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  return new RegExp(`^(  "${escaped}": )(.+)$`, "m");
}

function unquote(value) {
  return value.trim().replace(/^"(.*)"$/, "$1");
}

/** The two catalog pins in pnpm-workspace.yaml text. */
export function readPins(text) {
  const [start, end] = section(text, "catalog") ?? [0, 0];
  const body = text.slice(start, end);
  return PACKAGES.map((name) => {
    const match = entryPattern(name).exec(body);
    if (!match) {
      throw new Error(`pnpm-workspace.yaml: no catalog pin for ${name}`);
    }
    return unquote(match[2]);
  });
}

/** `specs` in PACKAGES order. */
export function writePins(text, specs) {
  const [start, end] = section(text, "catalog");
  const body = PACKAGES.reduce(
    (out, name, i) => out.replace(entryPattern(name), `$1${specs[i]}`),
    text.slice(start, end),
  );
  return text.slice(0, start) + body + text.slice(end);
}

/** The local-build overrides, or null when there are none. */
export function readLocal(text) {
  const range = section(text, "overrides");
  if (!range || !text.slice(...range).includes(LOCAL_MARKER)) return null;
  const body = text.slice(...range);
  return PACKAGES.map((name) =>
    unquote(entryPattern(name).exec(body)?.[2] ?? ""),
  );
}

/** Replace (specs) or remove (null) the local-build overrides. */
export function writeLocal(text, specs) {
  const patterns = PACKAGES.map((name) => entryPattern(name));
  let out = text;
  const range = section(out, "overrides");
  if (range) {
    const body = out
      .slice(...range)
      .split("\n")
      .filter(
        (line) => line !== LOCAL_MARKER && !patterns.some((p) => p.test(line)),
      )
      .join("\n");
    out = out.slice(0, range[0]) + body + out.slice(range[1]);
  }
  if (!specs) return out;
  const block = [
    LOCAL_MARKER,
    ...PACKAGES.map((name, i) => `  "${name}": "${specs[i]}"`),
  ].join("\n");
  const at = section(out, "overrides");
  if (!at) return `${out.trimEnd()}\n\noverrides:\n${block}\n`;
  return `${out.slice(0, at[0])}${block}\n${out.slice(at[0])}`;
}

// `0.2.0-alpha.19.pr-78-…` on a prerelease base, `0.2.1-pr-78-…` on a plain one.
const PREVIEW = /[.-]pr-(\d+)-\d{14}-[0-9a-f]+$/;

export function isExactVersion(spec) {
  return /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(spec);
}

export function isPreview(spec) {
  return PREVIEW.test(spec);
}

/** Why a pin must not merge, or null when it may. */
export function pinProblem(spec) {
  if (/^(file|link):/.test(spec)) {
    return `${spec} is a local build of a ui-common checkout`;
  }
  const preview = PREVIEW.exec(spec);
  if (preview) {
    return `${spec} is the preview of lablup/ui-common#${preview[1]}, which may not have merged`;
  }
  if (!isExactVersion(spec)) {
    return `${spec} is not an exact version`;
  }
  return null;
}

/** semver precedence, enough for ui-common's versions. */
export function compareVersions(a, b) {
  const split = (v) => {
    const [core, pre] = v.split(/-(.*)/s);
    return {
      core: core.split(".").map(Number),
      pre: pre ? pre.split(".") : [],
    };
  };
  const x = split(a);
  const y = split(b);
  for (let i = 0; i < 3; i++) {
    if (x.core[i] !== y.core[i]) return x.core[i] - y.core[i];
  }
  if (!x.pre.length || !y.pre.length) return y.pre.length - x.pre.length;
  for (let i = 0; i < Math.max(x.pre.length, y.pre.length); i++) {
    const p = x.pre[i];
    const q = y.pre[i];
    if (p === undefined) return -1;
    if (q === undefined) return 1;
    if (p === q) continue;
    const pn = /^\d+$/.test(p);
    const qn = /^\d+$/.test(q);
    if (pn && qn) return Number(p) - Number(q);
    if (pn !== qn) return pn ? -1 : 1;
    return p < q ? -1 : 1;
  }
  return 0;
}

function run(cmd, args, options = {}) {
  console.log(`$ ${cmd} ${args.join(" ")}`);
  return execFileSync(cmd, args, { cwd: ROOT, stdio: "inherit", ...options });
}

function npmView(spec) {
  try {
    const out = execFileSync("npm", ["view", spec, "version", "--json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    const value = out ? JSON.parse(out) : null;
    // A range can match several versions; a dist-tag or an exact version, one.
    return Array.isArray(value) ? value.at(-1) : value;
  } catch {
    return null;
  }
}

function resolveRegistry(target) {
  const version = npmView(`${PACKAGES[0]}@${target}`);
  if (!version) {
    throw new Error(
      `${PACKAGES[0]}@${target} is not published (dist-tag or version)`,
    );
  }
  if (!npmView(`${PACKAGES[1]}@${version}`)) {
    throw new Error(
      `${PACKAGES[1]}@${version} is not published; the two release together`,
    );
  }
  return [version, version];
}

/** The ui-common checkout next to this repository's main worktree. */
function defaultCheckout() {
  const common = execFileSync(
    "git",
    ["rev-parse", "--path-format=absolute", "--git-common-dir"],
    { cwd: ROOT, encoding: "utf8" },
  ).trim();
  return resolve(dirname(common), "..", "ui-common");
}

function packLocal(dir) {
  const checkout = resolve(dir ?? defaultCheckout());
  if (!existsSync(join(checkout, "packages/cli/package.json"))) {
    throw new Error(`${checkout} is not a ui-common checkout`);
  }
  const out = join(ROOT, "node_modules/.cache/ui-common-local");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  run("pnpm", ["run", "build"], { cwd: checkout });
  run("pnpm", ["pack", "--pack-destination", out], { cwd: checkout });
  run("pnpm", ["--filter", PACKAGES[1], "pack", "--pack-destination", out], {
    cwd: checkout,
  });
  const files = readdirSync(out);
  const lib = files.find((f) => /^lablup-ui-common-\d.*\.tgz$/.test(f));
  const cli = files.find((f) => /^lablup-ui-common-cli-.*\.tgz$/.test(f));
  if (!lib || !cli) {
    throw new Error(`packing ${checkout} produced ${files.join(", ")}`);
  }
  return [`file:${join(out, lib)}`, `file:${join(out, cli)}`];
}

/** `allowPreview`: a preview pin is reported, not failed (verify.sh, before the PR merges). */
function check(allowPreview) {
  const text = readFileSync(WORKSPACE, "utf8");
  const specs = readPins(text);
  const local = readLocal(text);
  const problems = [...specs, ...(local ?? [])]
    .map((spec, i) => [PACKAGES[i % 2], pinProblem(spec)])
    .filter(([, problem]) => problem);
  if (!problems.length) {
    console.log(`ui-common pins are released versions (${specs[0]}).`);
    return 0;
  }
  if (allowPreview && !local && specs.every(isPreview)) {
    console.log(
      `>> ${problems[0][1]}; CI fails this pin until it is a canary or a release.`,
    );
    return 0;
  }
  for (const [name, problem] of problems) console.error(`${name}: ${problem}.`);
  console.error(
    local
      ? "Run `pnpm run ui-common:pin pr-<N>` (the ui-common PR's preview) before committing."
      : "This pin verifies an unmerged ui-common change; it cannot merge. After the " +
          "ui-common PR merges, run `pnpm run ui-common:pin canary` (or a release) and push.",
  );
  return 1;
}

function pin(target, dir) {
  const before = readFileSync(WORKSPACE, "utf8");
  const [oldSpec] = readPins(before);
  if (target === "local") {
    const specs = packLocal(dir);
    writeFileSync(WORKSPACE, writeLocal(before, specs));
    console.log(`ui-common: ${oldSpec} overridden by ${specs[0]}`);
    run("pnpm", ["install"]);
  } else {
    const specs = resolveRegistry(target);
    writeFileSync(WORKSPACE, writeLocal(writePins(before, specs), null));
    console.log(`ui-common: ${oldSpec} → ${specs[0]}`);
    run("pnpm", ["install"]);
    if (isExactVersion(oldSpec) && compareVersions(specs[0], oldSpec) > 0) {
      // backend.ai-ui imports ui-common too; one run covers both sources.
      run("pnpm", [
        "--prefix",
        "./react",
        "exec",
        "ui-common",
        "upgrade",
        "--from",
        oldSpec,
        "src",
        "../packages/backend.ai-ui/src",
      ]);
      if (existsSync(join(ROOT, "react/ui-common-upgrade-report.md"))) {
        console.log(
          "Read react/ui-common-upgrade-report.md, then delete it before committing.",
        );
      }
    }
  }
  for (const file of ["../AGENTS.md", "AGENTS.md"]) {
    run("pnpm", ["exec", "ui-common", "agents", "--write", file], {
      cwd: join(ROOT, "react"),
    });
  }
  const after = readFileSync(WORKSPACE, "utf8");
  const problem = pinProblem((readLocal(after) ?? readPins(after))[0]);
  if (problem)
    console.log(`Note: ${problem}; this pin cannot merge (--check).`);
  return 0;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const [target, dir] = process.argv.slice(2);
  if (!target) {
    console.error(
      "Usage: node scripts/ui-common-pin.mjs <dist-tag|version> | local [dir] | --check",
    );
    process.exit(2);
  }
  try {
    process.exit(
      target === "--check"
        ? check(dir === "--allow-preview")
        : pin(target, dir),
    );
  } catch (error) {
    console.error(
      `ui-common-pin: ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  }
}
