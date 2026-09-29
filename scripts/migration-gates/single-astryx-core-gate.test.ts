/**
 * Detection proof for the single Astryx core gate
 * (single-astryx-core-gate.mjs): a second version, and the same version
 * resolved against different peers, each fail; the real lockfile passes.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const { REPO_ROOT, readCatalogPin, readLockfileKeys, runSingleCoreGate } =
  await import("./single-astryx-core-gate.mjs");

const PEERS = "(@stylexjs/stylex@0.19.0)(react@19.2.8)";

const workspace = [
  "packages:",
  "  - react",
  "",
  "catalog:",
  "  # pins",
  '  "@astryxdesign/core": 0.6.2',
  '  "@astryxdesign/lab": 0.6.2-canary.c9fb1ad',
  "",
  "overrides:",
  '  "@astryxdesign/core": 9.9.9',
].join("\n");

const lockfile = ({
  core = ["0.6.2"],
  coreSnapshots = [`0.6.2${PEERS}`],
}: {
  core?: string[];
  coreSnapshots?: string[];
} = {}) =>
  [
    "---",
    "lockfileVersion: '9.0'",
    "",
    "importers:",
    "",
    "  .:",
    "    dependencies:",
    "      '@astryxdesign/core':",
    "        specifier: 'catalog:'",
    "",
    "packages:",
    "",
    ...core.map((v) => `  '@astryxdesign/core@${v}':\n    resolution: {}`),
    "  '@astryxdesign/lab@0.6.2-canary.c9fb1ad':",
    "    resolution: {}",
    "",
    "snapshots:",
    "",
    ...coreSnapshots.map((v) => `  '@astryxdesign/core@${v}':\n    dependencies: {}`),
    `  '@astryxdesign/lab@0.6.2-canary.c9fb1ad${PEERS}': {}`,
    "",
    "time:",
    "",
    "  '@astryxdesign/core@0.1.0': '2026-01-01T00:00:00.000Z'",
  ].join("\n");

describe("single-astryx-core-gate", () => {
  it("reads section keys and ignores other sections", () => {
    const keys = readLockfileKeys(lockfile());
    expect(keys.packages).toEqual([
      "@astryxdesign/core@0.6.2",
      "@astryxdesign/lab@0.6.2-canary.c9fb1ad",
    ]);
    expect(keys.snapshots).toHaveLength(2);
  });

  it("reads the catalog pin, not an override", () => {
    expect(readCatalogPin(workspace, "@astryxdesign/core")).toBe("0.6.2");
  });

  it("passes one version resolved once", () => {
    expect(
      runSingleCoreGate({ lockfileText: lockfile(), workspaceText: workspace })
        .failures,
    ).toEqual([]);
  });

  it("fails a second core version", () => {
    const { failures } = runSingleCoreGate({
      lockfileText: lockfile({
        core: ["0.6.2", "0.7.0"],
        coreSnapshots: [`0.6.2${PEERS}`, `0.7.0${PEERS}`],
      }),
      workspaceText: workspace,
    });
    expect(failures.join("\n")).toMatch(/2 versions installed/);
    expect(failures.join("\n")).toMatch(/2 copies installed/);
  });

  it("fails the same version resolved against different peers", () => {
    const { failures } = runSingleCoreGate({
      lockfileText: lockfile({
        coreSnapshots: [`0.6.2${PEERS}`, "0.6.2(react@19.2.8)"],
      }),
      workspaceText: workspace,
    });
    expect(failures).toHaveLength(1);
    expect(failures[0]).toMatch(/2 copies installed/);
  });

  it("fails a version that drifted from the catalog pin", () => {
    const { failures } = runSingleCoreGate({
      lockfileText: lockfile({
        core: ["0.6.3"],
        coreSnapshots: [`0.6.3${PEERS}`],
      }),
      workspaceText: workspace,
    });
    expect(failures).toEqual([
      "@astryxdesign/core: lockfile has 0.6.3 but the catalog pins 0.6.2.",
    ]);
  });

  it("passes on the committed lockfile", () => {
    const { failures } = runSingleCoreGate({
      lockfileText: readFileSync(resolve(REPO_ROOT, "pnpm-lock.yaml"), "utf8"),
      workspaceText: readFileSync(
        resolve(REPO_ROOT, "pnpm-workspace.yaml"),
        "utf8",
      ),
    });
    expect(failures).toEqual([]);
  });
});
