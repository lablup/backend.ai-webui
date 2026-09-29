#!/usr/bin/env node
/**
 * Single Astryx core gate (ADR 0009, FR-4059, FR-4098).
 *
 * `@astryxdesign/core` must resolve to ONE copy: `react/`, BUI, ui-common and
 * lab all have to share its React contexts (theme, i18n, layers). A second
 * copy renders and type-checks fine and only shows up as components that
 * ignore the provider. Until FR-4098 the bare-name `patchedDependencies` key
 * tripped the install on a second core; with the Astryx patches gone (their
 * fixes ship as ui-common forks) this gate reads `pnpm-lock.yaml` instead.
 *
 * Fails when a package below has more than one `packages:` entry (a second
 * version) or more than one `snapshots:` entry (the same version resolved
 * against different peers, which pnpm installs as a separate directory), or
 * when the one version differs from the `pnpm-workspace.yaml` catalog pin.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);

/** Packages that must be installed exactly once. */
export const SINGLE_COPY = ["@astryxdesign/core", "@astryxdesign/lab"];

const unquote = (s) => s.trim().replace(/^['"]|['"]$/g, "");

/**
 * Keys of the lockfile's `packages:` and `snapshots:` sections, from every
 * YAML document in the file. Keys are the 2-space-indented lines of a section.
 */
export const readLockfileKeys = (text) => {
  const keys = { packages: [], snapshots: [] };
  let section = null;
  for (const line of text.split("\n")) {
    if (/^\S/.test(line)) {
      const top = line.match(/^([a-zA-Z]+):\s*$/);
      section = top && top[1] in keys ? top[1] : null;
      continue;
    }
    if (section === null) continue;
    const key = line.match(/^ {2}(\S.*?):(\s|$)/);
    if (key) keys[section].push(unquote(key[1]));
  }
  return keys;
};

/** `@scope/name@1.2.3(peer@…)…` → `1.2.3(peer@…)…` when the name matches. */
const versionOf = (key, name) =>
  key.startsWith(`${name}@`) ? key.slice(name.length + 1) : null;

/** The catalog pin for `name` in `pnpm-workspace.yaml`, or null. */
export const readCatalogPin = (workspaceText, name) => {
  let inCatalog = false;
  for (const line of workspaceText.split("\n")) {
    if (/^\S/.test(line)) {
      inCatalog = /^catalog:\s*$/.test(line);
      continue;
    }
    if (!inCatalog) continue;
    const m = line.match(/^ {2}(['"]?[^'":]+['"]?):\s*(\S+)/);
    if (m && unquote(m[1]) === name) return unquote(m[2]);
  }
  return null;
};

export const runSingleCoreGate = ({
  lockfileText,
  workspaceText,
  names = SINGLE_COPY,
}) => {
  const failures = [];
  const { packages, snapshots } = readLockfileKeys(lockfileText);
  for (const name of names) {
    const versions = packages
      .map((k) => versionOf(k, name))
      .filter((v) => v !== null);
    const resolutions = snapshots
      .map((k) => versionOf(k, name))
      .filter((v) => v !== null);
    if (versions.length === 0) {
      failures.push(`${name}: not in pnpm-lock.yaml \`packages:\`.`);
      continue;
    }
    if (versions.length > 1) {
      failures.push(
        `${name}: ${versions.length} versions installed (${versions.join(", ")}). ` +
          "Move the catalog pin and @lablup/ui-common together (ADR 0009).",
      );
    }
    if (resolutions.length > 1) {
      failures.push(
        `${name}: ${resolutions.length} copies installed, resolved against ` +
          `different peers:\n    ${resolutions.join("\n    ")}`,
      );
    }
    const pin = readCatalogPin(workspaceText, name);
    if (pin !== null && versions.length === 1 && versions[0] !== pin) {
      failures.push(
        `${name}: lockfile has ${versions[0]} but the catalog pins ${pin}.`,
      );
    }
  }
  return { failures };
};

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const lockPath = resolve(REPO_ROOT, "pnpm-lock.yaml");
  const workspacePath = resolve(REPO_ROOT, "pnpm-workspace.yaml");
  if (!existsSync(lockPath) || !existsSync(workspacePath)) {
    console.error("pnpm-lock.yaml or pnpm-workspace.yaml not found.");
    process.exit(1);
  }
  const { failures } = runSingleCoreGate({
    lockfileText: readFileSync(lockPath, "utf8"),
    workspaceText: readFileSync(workspacePath, "utf8"),
  });
  if (failures.length > 0) {
    for (const f of failures) console.error(`✖ ${f}`);
    process.exit(1);
  }
  console.log(`one copy each: ${SINGLE_COPY.join(", ")}`);
}
