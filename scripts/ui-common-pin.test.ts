import {
  compareVersions,
  isExactVersion,
  isPreview,
  pinProblem,
  readLocal,
  readPins,
  writeLocal,
  writePins,
} from "./ui-common-pin.mjs";

const WORKSPACE = `catalog:
  "@astryxdesign/lab": 0.7.0-canary.97a0d31
  "@lablup/ui-common": 0.2.0-alpha.19
  "@lablup/ui-common-cli": 0.2.0-alpha.19
  "@babel/core": ^7.29.7
`;

describe("readPins / writePins", () => {
  it("reads and moves both pins, leaving the rest", () => {
    expect(readPins(WORKSPACE)).toEqual(["0.2.0-alpha.19", "0.2.0-alpha.19"]);
    const canary = "0.2.0-alpha.19.canary-20261019094312-2ba8853ab";
    const next = writePins(WORKSPACE, [canary, canary]);
    expect(readPins(next)).toEqual([canary, canary]);
    expect(next).toContain('"@astryxdesign/lab": 0.7.0-canary.97a0d31');
  });
});

describe("readLocal / writeLocal", () => {
  const withOverrides = `${WORKSPACE}
overrides:
  tar-fs@2: 2.1.4

allowBuilds:
  core-js: true
`;

  it("adds the local overrides under overrides: and removes them again", () => {
    const local = writeLocal(withOverrides, [
      "file:/tmp/a.tgz",
      "file:/tmp/b.tgz",
    ]);
    expect(readLocal(local)).toEqual(["file:/tmp/a.tgz", "file:/tmp/b.tgz"]);
    expect(readPins(local)).toEqual(["0.2.0-alpha.19", "0.2.0-alpha.19"]);
    expect(local).toContain(
      '  "@lablup/ui-common-cli": "file:/tmp/b.tgz"\n  tar-fs@2',
    );
    expect(writeLocal(local, null)).toBe(withOverrides);
    expect(readLocal(withOverrides)).toBeNull();
  });
});

describe("pinProblem", () => {
  it("lets releases and canaries merge", () => {
    expect(pinProblem("0.2.0-alpha.19")).toBeNull();
    expect(
      pinProblem("0.2.0-alpha.19.canary-20261019094312-2ba8853ab"),
    ).toBeNull();
  });

  it("refuses previews, local builds and ranges", () => {
    expect(pinProblem("0.2.0-alpha.19.pr-78-20261019094312-2ba8853ab")).toMatch(
      /lablup\/ui-common#78/,
    );
    expect(pinProblem("file:/tmp/lablup-ui-common-0.2.0-alpha.19.tgz")).toMatch(
      /local/,
    );
    expect(pinProblem("^0.2.0-alpha.19")).toMatch(/not an exact version/);
  });

  it("recognises a preview on a plain base too", () => {
    const spec = "0.2.1-pr-78-20261019100754-612c52626";
    expect(isPreview(spec)).toBe(true);
    expect(pinProblem(spec)).toMatch(/lablup\/ui-common#78/);
    expect(isPreview("0.2.1-canary-20261019100754-612c52626")).toBe(false);
  });

  it("treats a preview as an exact version an upgrade can start from", () => {
    const preview = "0.2.0-alpha.19.pr-78-20261019100754-612c52626";
    expect(isExactVersion(preview)).toBe(true);
    expect(isExactVersion("file:/tmp/a.tgz")).toBe(false);
    expect(
      compareVersions("0.2.0-alpha.20.pr-78-20261020000000-abc", preview),
    ).toBeGreaterThan(0);
  });
});

describe("compareVersions", () => {
  it("orders canaries and previews between releases", () => {
    const canary = "0.2.0-alpha.19.canary-20261019094312-2ba8853ab";
    expect(compareVersions(canary, "0.2.0-alpha.19")).toBeGreaterThan(0);
    expect(compareVersions(canary, "0.2.0-alpha.20")).toBeLessThan(0);
    expect(compareVersions("0.2.0-alpha.10", "0.2.0-alpha.9")).toBeGreaterThan(
      0,
    );
    expect(compareVersions("0.2.0", "0.2.0-alpha.20")).toBeGreaterThan(0);
    expect(compareVersions("0.2.0-alpha.19", "0.2.0-alpha.19")).toBe(0);
  });
});
