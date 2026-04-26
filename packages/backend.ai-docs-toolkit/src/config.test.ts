/**
 * Unit tests for config.ts (FR-2726).
 *
 * Run: pnpm --filter backend.ai-docs-toolkit test
 *      (which executes `tsx --test src/config.test.ts`)
 *
 * Coverage:
 *   - validateCssColor: hex / rgb / hsl / name + injection-vector rejection.
 *   - resolveBranding: defaults, overrides, logoDark fallback, subLabel
 *     normalization (string vs map vs missing), invalid color rejection.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "path";
import {
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_PRIMARY_COLOR_ACTIVE,
  DEFAULT_PRIMARY_COLOR_HOVER,
  DEFAULT_PRIMARY_COLOR_SOFT,
  resolveBranding,
  validateCssColor,
} from "./config.js";

describe("validateCssColor", () => {
  it("accepts hex 3/6/8 digit forms", () => {
    assert.equal(validateCssColor("#fff", "x"), "#fff");
    assert.equal(validateCssColor("#FF7A00", "x"), "#FF7A00");
    assert.equal(validateCssColor("#11223344", "x"), "#11223344");
  });

  it("accepts rgb / rgba / hsl / hsla", () => {
    assert.equal(
      validateCssColor("rgb(255, 122, 0)", "x"),
      "rgb(255, 122, 0)",
    );
    assert.equal(
      validateCssColor("rgba(255, 122, 0, 0.5)", "x"),
      "rgba(255, 122, 0, 0.5)",
    );
    assert.equal(validateCssColor("hsl(20, 100%, 50%)", "x"), "hsl(20, 100%, 50%)");
  });

  it("accepts named CSS colors", () => {
    assert.equal(validateCssColor("orange", "x"), "orange");
    assert.equal(validateCssColor("transparent", "x"), "transparent");
  });

  it("trims surrounding whitespace", () => {
    assert.equal(validateCssColor("  #FF7A00  ", "x"), "#FF7A00");
  });

  it("rejects empty / whitespace-only values", () => {
    assert.throws(() => validateCssColor("", "branding.primaryColor"), /empty/);
    assert.throws(() => validateCssColor("   ", "branding.primaryColor"), /empty/);
  });

  it("rejects CSS-injection vectors (semicolons, braces, comment delim)", () => {
    // The classic break-out attempt: terminate the declaration and inject.
    assert.throws(
      () => validateCssColor("red; background: url(evil)", "branding.primaryColor"),
      /forbidden characters/,
    );
    assert.throws(
      () => validateCssColor("red} body { background: black", "branding.primaryColor"),
      /forbidden characters/,
    );
    assert.throws(
      () => validateCssColor("red /* comment */", "branding.primaryColor"),
      /forbidden characters/,
    );
    assert.throws(
      () => validateCssColor("red\nbackground: black", "branding.primaryColor"),
      /forbidden characters/,
    );
  });

  it("rejects strings that don't match a known CSS color form", () => {
    assert.throws(
      () => validateCssColor("not-a-color", "x"),
      /invalid CSS color/,
    );
    assert.throws(() => validateCssColor("#zzz", "x"), /invalid CSS color/);
    assert.throws(
      () => validateCssColor("rgb(", "x"),
      /invalid CSS color/,
    );
  });
});

describe("resolveBranding", () => {
  const projectRoot = path.resolve("/tmp/fake-project-root");

  it("returns BAI defaults when raw config is undefined", () => {
    const result = resolveBranding(undefined, projectRoot);
    assert.equal(result.primaryColor, DEFAULT_PRIMARY_COLOR);
    assert.equal(result.primaryColorHover, DEFAULT_PRIMARY_COLOR_HOVER);
    assert.equal(result.primaryColorActive, DEFAULT_PRIMARY_COLOR_ACTIVE);
    assert.equal(result.primaryColorSoft, DEFAULT_PRIMARY_COLOR_SOFT);
    assert.equal(result.logoLight, null);
    assert.equal(result.logoDark, null);
    assert.deepEqual(result.subLabel, {});
  });

  it("applies brand color overrides verbatim", () => {
    const result = resolveBranding(
      {
        primaryColor: "#123456",
        primaryColorHover: "#234567",
        primaryColorActive: "#345678",
        primaryColorSoft: "rgba(0, 0, 0, 0.1)",
      },
      projectRoot,
    );
    assert.equal(result.primaryColor, "#123456");
    assert.equal(result.primaryColorHover, "#234567");
    assert.equal(result.primaryColorActive, "#345678");
    assert.equal(result.primaryColorSoft, "rgba(0, 0, 0, 0.1)");
  });

  it("rejects an invalid brand color with a clear error", () => {
    assert.throws(
      () =>
        resolveBranding(
          { primaryColor: "red; background: url(evil)" },
          projectRoot,
        ),
      /branding\.primaryColor.+forbidden/,
    );
  });

  it("resolves logo paths relative to projectRoot", () => {
    const result = resolveBranding(
      { logoLight: "manifest/light.svg", logoDark: "manifest/dark.svg" },
      projectRoot,
    );
    assert.equal(
      result.logoLight,
      path.resolve(projectRoot, "manifest/light.svg"),
    );
    assert.equal(
      result.logoDark,
      path.resolve(projectRoot, "manifest/dark.svg"),
    );
  });

  it("falls back logoDark to logoLight when only logoLight is set", () => {
    const result = resolveBranding(
      { logoLight: "manifest/light.svg" },
      projectRoot,
    );
    assert.equal(
      result.logoLight,
      path.resolve(projectRoot, "manifest/light.svg"),
    );
    assert.equal(result.logoDark, result.logoLight);
  });

  it("normalizes a string subLabel into a default-keyed map", () => {
    const result = resolveBranding({ subLabel: "Manual" }, projectRoot);
    assert.deepEqual(result.subLabel, { default: "Manual" });
  });

  it("preserves a per-language subLabel map", () => {
    const result = resolveBranding(
      {
        subLabel: { en: "Manual", ko: "매뉴얼", default: "Docs" },
      },
      projectRoot,
    );
    assert.deepEqual(result.subLabel, {
      en: "Manual",
      ko: "매뉴얼",
      default: "Docs",
    });
  });
});
