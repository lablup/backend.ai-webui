/**
 * Detection proof for the Astryx locale key-sync gate
 * (check-astryx-locale-sync.mjs, FR-3511).
 *
 * The gate exists because the `astryx` override channel fails SILENTLY in
 * three ways — a non-string value is dropped by `buildAstryxOverrides`, a key
 * upstream renamed can never match again, and mangled ICU throws only when the
 * one screen that formats it renders in the one language that has the typo.
 * None of them produce a compiler, lint or test error on their own.
 *
 * Fixture tests pin the gate against each shape; the real-repo tests assert
 * the shipped catalogs are actually clean and actually complete.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const {
  DEFAULT_LOCALE_DIR,
  DEFAULT_UPSTREAM_CATALOG,
  compareIcu,
  parseIcuArguments,
  runAstryxLocaleSync,
} = await import("./check-astryx-locale-sync.mjs");

const GATE = resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "check-astryx-locale-sync.mjs",
);

/** Upstream stand-in: the three key shapes that matter. */
const UPSTREAM = {
  "@astryx.table.noData": { defaultMessage: "No data" },
  "@astryx.pagination.count": {
    defaultMessage: "{from, number}–{to, number} of {total, number}",
  },
  "@astryx.powersearch.resultCount": {
    defaultMessage:
      "{count, number} {count, plural, one {result} other {results}}",
  },
};

/** Write a fixture tree and return { upstreamCatalog, localeDir }. */
const makeFixture = (bundles: Record<string, unknown>) => {
  const root = mkdtempSync(join(tmpdir(), "astryx-locale-sync-"));
  const localeDir = join(root, "locale");
  mkdirSync(localeDir);
  const upstreamCatalog = join(root, "upstream-en.json");
  writeFileSync(upstreamCatalog, JSON.stringify(UPSTREAM));
  for (const [lang, bundle] of Object.entries(bundles)) {
    writeFileSync(join(localeDir, `${lang}.json`), JSON.stringify(bundle));
  }
  return { root, upstreamCatalog, localeDir };
};

const run = (bundles: Record<string, unknown>, strict = false) => {
  const { root, upstreamCatalog, localeDir } = makeFixture(bundles);
  try {
    return runAstryxLocaleSync({ upstreamCatalog, localeDir, strict });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

const kinds = (result: { findings: Array<{ kind: string }> }) =>
  result.findings.map((f) => f.kind);

describe("ICU argument extraction", () => {
  it("finds simple, typed and plural arguments at every depth", () => {
    const args = parseIcuArguments(
      "{count, number} {count, plural, one {result for {q}} other {results}}",
    );
    expect([...args.keys()].sort()).toEqual(["count", "q"]);
    expect([...args.get("count")!.types].sort()).toEqual(["number", "plural"]);
    expect([...args.get("count")!.selectors].sort()).toEqual(["one", "other"]);
  });

  it("treats a lone apostrophe as a literal, not a quote", () => {
    // Real translations contain these — `l'élément`, `dell'elemento`.
    expect([...parseIcuArguments("l'élément {label}").keys()]).toEqual([
      "label",
    ]);
  });

  it("throws on an unbalanced brace", () => {
    expect(() => parseIcuArguments("Clear {label")).toThrow();
  });
});

describe("compareIcu", () => {
  const EN = "{count, number} {count, plural, one {result} other {results}}";

  it("accepts a plural-less language that keeps the number", () => {
    // ko/ja/zh/th/vi/id/ms have one plural category; dropping the plural
    // clause is correct, not drift.
    expect(compareIcu(EN, "결과 {count, number}개")).toEqual([]);
  });

  it("accepts a language with more plural categories than English", () => {
    expect(
      compareIcu(
        EN,
        "{count, number} {count, plural, one {результат} few {результата} many {результатов} other {результата}}",
      ),
    ).toEqual([]);
  });

  it("rejects a dropped placeholder", () => {
    expect(compareIcu(EN, "결과 없음")).toEqual([
      "dropped placeholder(s): count",
    ]);
  });

  it("rejects an invented placeholder", () => {
    expect(compareIcu("Clear {label}", "Clear {label} {extra}")).toEqual([
      "invented placeholder(s): extra",
    ]);
  });

  it("rejects demoting a rendered number to a plural branch", () => {
    const problems = compareIcu(EN, "{count, plural, other {results}}");
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("changes how its value renders");
  });

  it("rejects swapping one value formatter for another", () => {
    // {count, number} -> {count, date} parses and keeps the placeholder, but
    // renders a completely different value.
    const problems = compareIcu(
      "Page {count, number}",
      "Seite {count, date} {count, plural, one {r} other {rs}}",
    );
    expect(problems).toEqual([
      "'count' changes how its value renders: {number} -> {date}",
    ]);
  });

  it("accepts a select whose branch names are preserved", () => {
    // `select` branches are arbitrary identifiers, not CLDR plural categories,
    // so they must not be measured against the plural vocabulary.
    expect(
      compareIcu(
        "{g, select, male {he} female {she} other {they}}",
        "{g, select, male {er} female {sie} other {sie}}",
      ),
    ).toEqual([]);
  });

  it("rejects a select that invents or drops a branch", () => {
    const problems = compareIcu(
      "{g, select, male {he} other {they}}",
      "{g, select, admin {er} other {sie}}",
    );
    expect(problems).toContain("'g' invents select branch(es): admin");
    expect(problems).toContain("'g' drops select branch(es): male");
  });

  it("rejects a plural with no 'other' branch", () => {
    const problems = compareIcu(EN, "{count, number} {count, plural, one {x}}");
    expect(problems).toContain(
      "'count' has no 'other' branch (ICU requires one)",
    );
  });

  it("rejects an invalid plural selector", () => {
    const problems = compareIcu(
      EN,
      "{count, number} {count, plural, singular {x} other {y}}",
    );
    expect(problems.some((p) => p.includes("invalid plural selector"))).toBe(
      true,
    );
  });

  it("rejects a translation that does not parse", () => {
    expect(compareIcu("Clear {label}", "Effacer {label")[0]).toContain(
      "does not parse",
    );
  });
});

describe("the gate on fixtures", () => {
  const COMPLETE_KO = {
    astryx: {
      "@astryx.table.noData": "데이터 없음",
      "@astryx.pagination.count":
        "{total, number}개 중 {from, number}–{to, number}",
      "@astryx.powersearch.resultCount": "결과 {count, number}개",
    },
  };

  it("passes a complete, well-formed bundle", () => {
    expect(kinds(run({ ko: COMPLETE_KO }))).toEqual([]);
  });

  it("flags a key upstream no longer ships", () => {
    const result = run({
      ko: { astryx: { ...COMPLETE_KO.astryx, "@astryx.table.empty": "없음" } },
    });
    expect(kinds(result)).toEqual(["stale-key"]);
    expect(result.findings[0].severity).toBe("error");
  });

  it("flags upstream's {defaultMessage, description} object shape", () => {
    // The exact mistake the channel cannot report on its own:
    // buildAstryxOverrides keeps string values only.
    const result = run({
      ko: {
        astryx: {
          ...COMPLETE_KO.astryx,
          "@astryx.table.noData": { defaultMessage: "데이터 없음" },
        },
      },
    });
    expect(kinds(result)).toContain("non-string");
    expect(result.findings[0].detail).toContain("STRING values only");
  });

  it("flags an empty translation rather than shipping a blank label", () => {
    const result = run({
      ko: { astryx: { ...COMPLETE_KO.astryx, "@astryx.table.noData": "  " } },
    });
    expect(kinds(result)).toContain("empty-value");
  });

  it("flags ICU drift", () => {
    const result = run({
      ko: {
        astryx: {
          ...COMPLETE_KO.astryx,
          "@astryx.pagination.count": "{total, number}개 중 {from, number}",
        },
      },
    });
    expect(kinds(result)).toEqual(["icu-mismatch"]);
  });

  it("warns — not errors — on keys a bump added but nobody translated", () => {
    const result = run({
      ko: { astryx: { "@astryx.table.noData": "데이터 없음" } },
    });
    expect(kinds(result)).toEqual(["missing-keys"]);
    expect(result.findings[0].severity).toBe("warning");
    expect(result.findings[0].keys).toHaveLength(2);
  });

  it("escalates the same gap to an error under --strict", () => {
    const result = run(
      { ko: { astryx: { "@astryx.table.noData": "데이터 없음" } } },
      true,
    );
    expect(result.findings[0].severity).toBe("error");
  });

  it("exempts en — upstream's own catalog is the fallback", () => {
    const result = run({ en: { "comp:Foo": {} } });
    expect(kinds(result)).toEqual([]);
    expect(result.languages).toEqual([
      { lang: "en", exempt: true, translated: 0, missing: 3 },
    ]);
  });

  it("rejects a non-object subtree outright", () => {
    expect(kinds(run({ ko: { astryx: "nope" } }))).toEqual(["bad-subtree"]);
  });
});

describe("the shipped catalogs", () => {
  const result = runAstryxLocaleSync();

  it("has no errors and no warnings", () => {
    expect(result.findings).toEqual([]);
  });

  it("covers every upstream key in all 20 non-en bundles", () => {
    expect(result.upstreamKeyCount).toBe(250);
    const gaps = result.languages.filter((l) => !l.exempt && l.missing > 0);
    expect(gaps).toEqual([]);
    expect(result.languages).toHaveLength(21);
  });

  it("reads the catalogs the app actually ships", () => {
    expect(DEFAULT_UPSTREAM_CATALOG).toContain(
      "@astryxdesign/core/locales/en.json",
    );
    expect(DEFAULT_LOCALE_DIR).toContain("packages/backend.ai-ui/src/locale");
  });

  it("exits 0 by default and prints a compact coverage summary", () => {
    const stdout = execFileSync(process.execPath, [GATE], { encoding: "utf8" });
    expect(stdout).toContain(
      "250 upstream keys, 20 bundles fully translated, 0 partial, 1 exempt (en)",
    );
    expect(stdout.trim().endsWith("astryx locale sync OK")).toBe(true);
  });
});
