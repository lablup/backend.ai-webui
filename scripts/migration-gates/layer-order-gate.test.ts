/**
 * Detection proof for the cascade-layer order gate (layer-order-gate.mjs).
 *
 * Each fixture reproduces one way the FR-3532 divergence comes back: the
 * statement missing, the four copies disagreeing, or one of them parsed after
 * a stylesheet that already registered a layer name. All three render fine and
 * report nothing — the only visible symptom is Astryx's defaults outranking the
 * brand theme, which is why the gate exists.
 */
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const {
  APP_CSS,
  BUI_CSS,
  INDEX_HTML,
  STORYBOOK_CSS,
  parseLayerOrder,
  runLayerOrderGate,
} = await import("./layer-order-gate.mjs");

const ORDER =
  "reset, theme, base, astryx-base, astryx-theme, components, utilities";

const html = (statement: string) =>
  [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="UTF-8">',
    statement,
    '  <link rel="stylesheet" href="resources/webui.css">',
    "  <!-- REACT_BUNDLE_INJECTING FOR DEV-->",
    "</head>",
    "<body></body>",
    "</html>",
  ].join("\n");

const css = (statement: string) =>
  [
    "/* header comment with @layer prose in it */",
    statement,
    ".x { color: red; }",
  ].join("\n");

/** A repo tree with the four mirrors, each overridable. */
const makeFixture = (files: Record<string, string> = {}) => {
  const root = mkdtempSync(join(tmpdir(), "layer-order-gate-"));
  const defaults = {
    [INDEX_HTML]: html(`  <style>@layer ${ORDER};</style>`),
    [APP_CSS]: css(`@layer ${ORDER};`),
    [BUI_CSS]: css(`@layer ${ORDER};`),
    [STORYBOOK_CSS]: css(`@layer ${ORDER};`),
  };
  for (const [rel, content] of Object.entries({ ...defaults, ...files })) {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content);
  }
  return root;
};

describe("parseLayerOrder", () => {
  it("reads the layer names and where the statement starts", () => {
    const parsed = parseLayerOrder(`.a{}\n@layer ${ORDER};`);
    expect(parsed?.names).toEqual([
      "reset",
      "theme",
      "base",
      "astryx-base",
      "astryx-theme",
      "components",
      "utilities",
    ]);
    expect(parsed?.index).toBe(5);
  });

  it("ignores a single-name @layer block, which declares no order", () => {
    expect(
      parseLayerOrder("@layer components { .a { color: red } }"),
    ).toBeNull();
  });
});

describe("runLayerOrderGate", () => {
  const roots: string[] = [];
  const gate = (files?: Record<string, string>) => {
    const root = makeFixture(files);
    roots.push(root);
    return runLayerOrderGate({ repoRoot: root });
  };
  afterAll(() => {
    for (const root of roots) rmSync(root, { recursive: true, force: true });
  });

  it("passes when all four mirrors agree and are placed first", () => {
    expect(gate().failures).toEqual([]);
  });

  it("flags a mirror whose order diverges", () => {
    const { failures } = gate({
      [BUI_CSS]: css("@layer reset, theme, base, astryx-theme, astryx-base;"),
    });
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain(BUI_CSS);
  });

  it("flags the Storybook mirror when its order diverges", () => {
    const { failures } = gate({
      [STORYBOOK_CSS]: css("@layer reset, theme, base, astryx-theme;"),
    });
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain(STORYBOOK_CSS);
  });

  it("flags a missing statement", () => {
    const { failures } = gate({ [INDEX_HTML]: html("  <style>.a{}</style>") });
    expect(failures[0]).toContain("no `@layer a, b, …;` order statement");
  });

  it("flags index.html declaring it after a stylesheet link", () => {
    const withLateStatement = html("")
      .replace('  <link rel="stylesheet" href="resources/webui.css">\n', "")
      .replace(
        "  <!-- REACT_BUNDLE_INJECTING FOR DEV-->",
        `  <link rel="stylesheet" href="resources/webui.css">\n  <style>@layer ${ORDER};</style>\n  <!-- REACT_BUNDLE_INJECTING FOR DEV-->`,
      );
    const { failures } = gate({ [INDEX_HTML]: withLateStatement });
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('after the first <link rel="stylesheet">');
  });

  it("flags a CSS mirror where a rule precedes the statement", () => {
    const { failures } = gate({
      [APP_CSS]: `@layer components { .a { color: red } }\n@layer ${ORDER};`,
    });
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("not the first rule");
  });
});

describe("the repository's own mirrors", () => {
  it("declare one identical order, each parsed before any layered rule", () => {
    const { failures, names } = runLayerOrderGate();
    expect(failures).toEqual([]);
    expect(names?.indexOf("astryx-theme")).toBeGreaterThan(
      names?.indexOf("astryx-base") ?? -1,
    );
  });
});
