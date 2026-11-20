// @ts-nocheck
import {
  findExeEntries,
  packageManagerDocument,
} from "./check-pm-lockfile.mjs";

// Trimmed from what pnpm 12.4.0 (canonical) and pnpm 11.19.0 (with @pnpm/exe)
// write for `packageManager: pnpm@12.4.0`.
const canonical = `---
lockfileVersion: '9.0'

importers:

  .:
    configDependencies: {}
    packageManagerDependencies:
      pnpm:
        specifier: 12.4.0
        version: 12.4.0

packages:

  '@pnpm/exe.darwin-arm64@12.4.0':
    resolution: {integrity: sha512-x}

  pnpm@12.4.0:
    resolution: {integrity: sha512-y}

snapshots:

  '@pnpm/exe.darwin-arm64@12.4.0':
    optional: true

  pnpm@12.4.0:
    optionalDependencies:
      '@pnpm/exe.darwin-arm64': 12.4.0

---
lockfileVersion: '9.0'

importers:

  .:
    devDependencies:
      '@pnpm/exe':
        specifier: 12.4.0
        version: 12.4.0
`;

const withExe = canonical
  .replace(
    "    packageManagerDependencies:\n",
    "    packageManagerDependencies:\n      '@pnpm/exe':\n        specifier: 12.4.0\n        version: 12.4.0\n",
  )
  .replace(
    "  pnpm@12.4.0:\n    resolution",
    "  '@pnpm/exe@12.4.0':\n    resolution: {integrity: sha512-z}\n\n  pnpm@12.4.0:\n    resolution",
  );

describe("packageManagerDocument", () => {
  it("returns the first YAML document only", () => {
    const doc = packageManagerDocument(canonical);
    expect(doc).toContain("packageManagerDependencies");
    expect(doc).not.toContain("devDependencies");
  });

  it("returns null for a lockfile without a package-manager document", () => {
    expect(packageManagerDocument("lockfileVersion: '9.0'\n")).toBeNull();
  });
});

describe("findExeEntries", () => {
  it("accepts the canonical document, its @pnpm/exe.<platform> packages and later documents", () => {
    expect(findExeEntries(canonical)).toEqual([]);
  });

  it("reports the @pnpm/exe importer entry and package", () => {
    expect(findExeEntries(withExe)).toEqual([
      "'@pnpm/exe':",
      "'@pnpm/exe@12.4.0':",
    ]);
  });
});
