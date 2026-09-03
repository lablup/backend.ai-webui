/**
 * Detection proof for the P19 undeclared-var() token gate
 * (astryx-token-gate.mjs).
 *
 * The gate exists because an undeclared custom property inside `var()` fails
 * SILENTLY — no compiler, lint, or runtime error. These tests pin the gate
 * against the three real silent failures found and fixed during the Astryx
 * pilot's P19 sweep (all three had shipped through every other gate):
 *
 *   1. `var(--color-text-tertiary)`            — name does not exist in the
 *      Astryx ramp (primary/secondary/disabled/accent + named hues); the
 *      declaration went invalid -> browser-default scrollbar in every theme.
 *   2. `var(--color-text-error)`               — also nonexistent (the
 *      semantic error token is the solid `--color-error`); a danger action
 *      rendered in the inherited colour instead of red.
 *   3. `var(--color-background-primary, #fff)` — nonexistent name with a
 *      literal fallback; the fallback won forever, painting a WHITE body in
 *      dark mode. Every earlier dark screenshot was taken against it.
 *
 * Fixture-based tests prove the gate flags exactly these shapes; the
 * real-declared-set tests prove the names are genuinely absent from (and
 * their fixes present in) what @astryxdesign/core + theme-neutral + the
 * built brand theme actually declare.
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const {
  REPO_ROOT,
  DEFAULT_DECLARED_CSS,
  parseDeclaredCss,
  parseDeclaredJs,
  parseUsages,
  runTokenGate,
} = await import("./astryx-token-gate.mjs");

const GATE = resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "astryx-token-gate.mjs",
);

/** Build a fixture tree reproducing the three spike patterns + a clean use. */
const makeFixture = () => {
  const root = mkdtempSync(join(tmpdir(), "token-gate-"));
  // Minimal "declared" theme: what a correct theme actually provides.
  writeFileSync(
    join(root, "theme.css"),
    [
      ":root {",
      "  --color-text-primary: light-dark(#111, #eee);",
      "  --color-text-secondary: light-dark(#555, #aaa);",
      "  --color-error: #c8102e;",
      "  --color-background-surface: light-dark(#fff, #111);",
      "}",
    ].join("\n"),
  );
  // The scanned app source, reproducing spike patterns 1–3 verbatim.
  writeFileSync(
    join(root, "probe.css"),
    [
      "body {",
      "  /* pattern 3: undeclared name + literal fallback -> #fff wins forever",
      "     (painted a white body in dark mode) */",
      "  background: var(--color-background-primary, #fff);",
      "}",
      ".scroll {",
      "  /* pattern 1: undeclared, no fallback -> declaration invalid */",
      "  scrollbar-color: var(--color-text-tertiary) transparent;",
      "}",
      ".danger {",
      "  /* pattern 2: undeclared, no fallback -> inherited colour, not red */",
      "  color: var(--color-text-error);",
      "}",
      ".ok {",
      "  color: var(--color-text-primary);",
      "}",
    ].join("\n"),
  );
  return root;
};

describe("runTokenGate — spike-pattern detection (fixtures)", () => {
  let root: string;
  beforeAll(() => {
    root = makeFixture();
  });
  afterAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  const run = () =>
    runTokenGate({
      repoRoot: root,
      scanRoots: ["."],
      declaredCss: ["theme.css"],
      allowlist: null,
    });

  it("flags all three known silent-failure names, and only those", () => {
    const result = run();
    const names = result.undeclared.map((u: any) => u.name).sort();
    expect(names).toEqual([
      "--color-background-primary",
      "--color-text-error",
      "--color-text-tertiary",
    ]);
  });

  it("does not flag a declared token", () => {
    const result = run();
    const names = result.undeclared.map((u: any) => u.name);
    expect(names).not.toContain("--color-text-primary");
  });

  it("records the literal fallback that silently wins (pattern 3)", () => {
    const result = run();
    const bg = result.undeclared.find(
      (u: any) => u.name === "--color-background-primary",
    );
    expect(bg).toBeDefined();
    expect(bg.fallback).toBe("#fff");
    expect(bg.file).toBe("probe.css");
  });

  it("records the no-fallback (invalid-declaration) shape (patterns 1–2)", () => {
    const result = run();
    for (const name of ["--color-text-tertiary", "--color-text-error"]) {
      const hit = result.undeclared.find((u: any) => u.name === name);
      expect(hit).toBeDefined();
      expect(hit.fallback).toBeNull();
    }
  });

  it("suggests the real declared neighbours for the near-miss names", () => {
    const result = run();
    const tertiary = result.undeclared.find(
      (u: any) => u.name === "--color-text-tertiary",
    );
    // '--color-text-tertiary' shares the '--color-text-' family prefix with
    // the declared ramp — the hint a fixing session needs.
    expect(
      tertiary.suggestions.some((s: string) => s.startsWith("--color-text-")),
    ).toBe(true);
  });

  it("flags the same three names through the CLI (--json)", () => {
    const out = execFileSync(
      "node",
      [
        GATE,
        "--json",
        "--no-allowlist",
        "--repo-root",
        root,
        "--scan-root",
        ".",
        "--declared-css",
        "theme.css",
      ],
      { encoding: "utf8", env: process.env },
    );
    const parsed = JSON.parse(out);
    expect(
      parsed.undeclared.map((u: { name: string }) => u.name).sort(),
    ).toEqual([
      "--color-background-primary",
      "--color-text-error",
      "--color-text-tertiary",
    ]);
  });
});

describe("runTokenGate — parser edges", () => {
  it("checks names nested inside another var()'s fallback", () => {
    const { usages } = parseUsages(
      ".x { gap: var(--outer-gap, var(--inner-gap, 8px)); }",
    );
    expect(usages.map((u: any) => u.name)).toEqual([
      "--outer-gap",
      "--inner-gap",
    ]);
    expect(usages[0].fallback).toBe("var(--inner-gap, 8px)");
  });

  it("does not count var() mentions in JS comments as usages", () => {
    const text = [
      "// returns `var(--x)` strings",
      "/* var(--commented-out) */",
      "const s = 'var(--real-usage)';",
    ].join("\n");
    const { usages } = parseUsages(text, { comments: "strip-js" });
    expect(usages.map((u: any) => u.name)).toEqual(["--real-usage"]);
  });

  it("reports dynamic template-literal constructions separately", () => {
    const { usages, dynamic } = parseUsages(
      "el.style.setProperty(P, `var(--token-${name})`);",
    );
    expect(usages).toHaveLength(0);
    expect(dynamic).toHaveLength(1);
  });

  it("reads declarations from CSS text and JS object keys / setProperty", () => {
    expect([
      ...parseDeclaredCss(":root { --a-token: 1px; }\n.x{--b-token:red}"),
    ]).toEqual(["--a-token", "--b-token"]);
    expect([
      ...parseDeclaredJs(
        "const style = { '--hook-x': '1px' };\nel.style.setProperty('--hook-y', v);",
      ),
    ]).toEqual(["--hook-x", "--hook-y"]);
  });
});

// Prove the declared-set source of truth matches the pilot findings against
// the REAL Astryx CSS. Skipped when node_modules isn't installed (the vitest
// CI job installs the full workspace, so these run there).
const realCss = DEFAULT_DECLARED_CSS.map((p: string) => resolve(REPO_ROOT, p));
const realCssPresent = realCss.every((p: string) => existsSync(p));

describe.skipIf(!realCssPresent)(
  "declared set — real @astryxdesign css",
  () => {
    const declared = new Set<string>();
    beforeAll(() => {
      for (const p of realCss) {
        for (const name of parseDeclaredCss(readFileSync(p, "utf8"))) {
          declared.add(name as string);
        }
      }
    });

    it("the spike's broken names are genuinely absent", () => {
      // `--color-text-tertiary`, the spike's third broken name, is a declared
      // custom token of the brand theme since FR-3605, so it left this list.
      expect(declared.has("--color-text-error")).toBe(false);
      expect(declared.has("--color-background-primary")).toBe(false);
    });

    it("the brand theme declares the custom tokens the app reads", () => {
      expect(declared.has("--color-text-tertiary")).toBe(true);
      expect(declared.has("--color-info")).toBe(true);
    });

    it("the spike's fixes resolve to declared names", () => {
      // 40be82cd1 replaced the broken names with these declared ones.
      expect(declared.has("--color-text-secondary")).toBe(true);
      expect(declared.has("--color-error")).toBe(true);
      expect(declared.has("--color-background-surface")).toBe(true);
    });
  },
);
