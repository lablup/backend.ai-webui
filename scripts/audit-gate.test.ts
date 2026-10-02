// @ts-nocheck
import {
  collectFindings,
  evaluate,
  isValidDate,
  mergeFindings,
} from "./audit-gate.mjs";

const report = (advisories) => ({ advisories, metadata: {} });
const adv = (id, module_name, severity, paths) => ({
  id: 1,
  github_advisory_id: id,
  module_name,
  severity,
  title: `${module_name} issue`,
  url: `https://github.com/advisories/${id}`,
  findings: [{ version: "1.0.0", paths }],
});

describe("collectFindings", () => {
  it("keeps high/critical only and merges paths of the same advisory", () => {
    const findings = collectFindings(
      report({
        1: adv("GHSA-a", "pkg", "high", ["react>pkg"]),
        2: adv("GHSA-a", "pkg", "high", ["react>x>pkg"]),
        3: adv("GHSA-b", "pkg", "moderate", ["react>pkg"]),
        4: adv("GHSA-c", "other", "critical", [".>other"]),
      }),
    );
    expect(findings.map((f) => f.id)).toEqual(["GHSA-a", "GHSA-c"]);
    expect([...findings[0].paths]).toEqual(["react>pkg", "react>x>pkg"]);
  });

  it("keeps transitive advisories rooted in a shipped root entry", () => {
    const findings = collectFindings(
      report({
        1: adv("GHSA-e", "electron", "high", [".>electron"]),
        2: adv("GHSA-p", "path-to-regexp", "high", [
          ".>express>path-to-regexp",
          ".>webpack-dev-server>express>path-to-regexp",
        ]),
        3: adv("GHSA-t", "tar", "critical", [".>tar"]),
        4: adv("GHSA-x", "x", "high", [".>expressive>x"]),
      }),
      { rootEntries: ["electron", "express"] },
    );
    expect(findings.map((f) => f.package)).toEqual([
      "electron",
      "path-to-regexp",
    ]);
    expect([...findings[1].paths]).toEqual([".>express>path-to-regexp"]);
  });

  it("merges findings of the same advisory across reports", () => {
    const a = collectFindings(
      report({ 1: adv("GHSA-a", "p", "high", ["react>p"]) }),
    );
    const b = collectFindings(
      report({ 1: adv("GHSA-a", "p", "high", [".>express>p"]) }),
    );
    const merged = mergeFindings(a, b);
    expect(merged).toHaveLength(1);
    expect([...merged[0].paths]).toEqual(["react>p", ".>express>p"]);
  });

  it("throws on output that is not an audit report", () => {
    expect(() => collectFindings({ error: "ENOTFOUND" })).toThrow(
      /unexpected pnpm audit output/,
    );
  });
});

describe("evaluate", () => {
  const lintOnly = adv("GHSA-l", "brace-expansion", "high", [
    "packages__eslint-config-bai>eslint>minimatch>brace-expansion",
  ]);
  const scoped = {
    id: "GHSA-l",
    package: "brace-expansion",
    importers: ["packages/eslint-config-bai"],
    reason: "lint only",
  };

  it("passes an allowlisted finding and fails an unlisted one", () => {
    const findings = collectFindings(
      report({
        1: lintOnly,
        2: adv("GHSA-x", "undici", "high", ["react>undici"]),
      }),
    );
    const r = evaluate(findings, { entries: [scoped] }, "2026-10-02");
    expect(r.allowed).toHaveLength(1);
    expect(r.blocking.map((f) => f.id)).toEqual(["GHSA-x"]);
    expect(r.errors).toEqual([]);
  });

  it("does not let an importer-scoped entry cover a shipped path", () => {
    const shippedToo = adv("GHSA-l", "brace-expansion", "high", [
      "packages__eslint-config-bai>eslint>minimatch>brace-expansion",
      "react>minimatch>brace-expansion",
    ]);
    const r = evaluate(
      collectFindings(report({ 1: shippedToo })),
      { entries: [scoped] },
      "2026-10-02",
    );
    expect(r.blocking).toHaveLength(1);
    expect(r.stale).toEqual([scoped]);
  });

  it("fails on an expired entry even while it still matches", () => {
    const r = evaluate(
      collectFindings(report({ 1: lintOnly })),
      { entries: [{ ...scoped, expires: "2026-10-01" }] },
      "2026-10-02",
    );
    expect(r.blocking).toEqual([]);
    expect(r.errors[0]).toMatch(/expired on 2026-10-01/);
  });

  it("accepts an entry on its expiry day", () => {
    const r = evaluate(
      collectFindings(report({ 1: lintOnly })),
      { entries: [{ ...scoped, expires: "2026-10-02" }] },
      "2026-10-02",
    );
    expect(r.errors).toEqual([]);
  });

  it.each(["2026-99-99", "2026-02-30", "2026-13-01", "26-10-31", ""])(
    "fails on an invalid expires %j instead of extending the exception",
    (expires) => {
      const r = evaluate(
        collectFindings(report({ 1: lintOnly })),
        { entries: [{ ...scoped, expires }] },
        "2026-10-02",
      );
      expect(r.errors[0]).toMatch(/invalid expires/);
    },
  );
});

describe("isValidDate", () => {
  it("accepts real dates, including leap days", () => {
    expect(isValidDate("2026-10-31")).toBe(true);
    expect(isValidDate("2028-02-29")).toBe(true);
    expect(isValidDate("2026-02-29")).toBe(false);
  });
});
