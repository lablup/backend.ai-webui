#!/usr/bin/env node
// @ts-check
/**
 * check-terminology-i18n.selftest.mjs — precision self-test (the "trust
 * anchor") for the NON-ENGLISH avoid[] rows in terminology.json (FR-3051).
 *
 * WHY THIS EXISTS: ko/ja/th have no reliable word boundaries, so CHECK 1
 * matches non-Latin avoid terms by plain SUBSTRING. That makes a bare concept
 * noun catastrophic as an avoid term — ko "세션" appears in ~201 legitimate
 * values, ja "セッション" in ~196 — every one would fire. Non-English avoid
 * rows must therefore be PRECISE multi-token compounds (e.g. "스케일링 그룹",
 * "スケーリンググループ") or unambiguous deprecated spellings ("레플리카",
 * "슈퍼어드민"), and this harness is the hard gate that keeps a noisy row from
 * ever entering the termbase.
 *
 * WHAT IT ASSERTS — for every non-en avoid[] row, against the REAL matcher
 * (imported from check-terminology-i18n.mjs, never a copy):
 *
 *   1. COVERAGE   — the row has a fixtures entry in
 *                   packages/backend.ai-webui-docs/terminology.selftest.json
 *                   (and every fixtures entry maps back to a live row — no
 *                   stale entries).
 *   2. CURATION   — the avoid term is not a substring of any
 *                   concepts[].preferred[lang] value (a bare token inside a
 *                   preferred compound would flag every legitimate use).
 *   3. DETECTABLE — every positiveFixture produces >= 1 match.
 *   4. PRECISE    — every negativeFixture (the known longer legitimate
 *                   compounds) produces 0 matches.
 *   5. BUDGET     — the row's live hit-count over the CURRENT i18n stores
 *                   (via the real runCheck1, allowlist applied) is within
 *                   falsePositiveBudget (default 0).
 *   6. TEETH      — each negativeControls entry (a known-bad bare-noun row,
 *                   e.g. ko "세션") is evaluated the same way and MUST exceed
 *                   the budget by expectAtLeastLiveHits. If a control stops
 *                   firing, the gate itself has silently broken.
 *
 * SEVERITY MODEL (unchanged by this script): this harness gates the DATA
 * (terminology.json curation) and is a HARD gate in CI
 * (.github/workflows/terminology-selftest.yml) — triggered ONLY by the
 * termbase / fixtures / checker paths, never by docs prose or i18n content,
 * so pre-existing content drift can never hard-block an unrelated PR. The
 * drift scan over i18n CONTENT stays WARN-only — in scripts/verify.sh this
 * script runs inside the warn-only terminology section precisely so that new
 * content drift never hard-blocks a build (that is CHECK 1's warn job), while
 * a bad avoid ROW is still caught in CI before it lands.
 *
 * Usage: node scripts/check-terminology-i18n.selftest.mjs
 *        (also: pnpm run lint:terminology:selftest)
 * Exit codes: 0 = all assertions hold; 1 = at least one failure.
 *
 * Dependency-free: native Node ESM only, same as the checker it tests.
 */

import path from "node:path";
import process from "node:process";

import {
  TERMINOLOGY_PATH,
  ALLOWLIST_PATH,
  I18N_GLOBS,
  REPO_ROOT,
  readJson,
  collectLeaves,
  listLocaleFiles,
  buildTermMatcher,
  buildApprovedCompounds,
  runCheck1,
} from "./check-terminology-i18n.mjs";

const SELFTEST_PATH = path.join(
  path.dirname(TERMINOLOGY_PATH),
  "terminology.selftest.json",
);

/** @type {string[]} */
const failures = [];
let passCount = 0;

/**
 * @param {boolean} ok
 * @param {string} label
 * @param {string} [detail]
 */
function assertThat(ok, label, detail) {
  if (ok) {
    passCount++;
  } else {
    failures.push(detail ? `${label}\n      ${detail}` : label);
  }
}

/** @param {{lang?: string, avoid?: string}} entry */
function keyOf(entry) {
  return `${entry.lang} ${entry.avoid}`;
}

function main() {
  const termbase = readJson(TERMINOLOGY_PATH, true);
  const selftest = readJson(SELFTEST_PATH, true);
  if (!termbase || !selftest) return 1; // readJson already printed the error

  const nonEnRows = (
    Array.isArray(termbase.avoid) ? termbase.avoid : []
  ).filter(
    (r) => r && typeof r.avoid === "string" && r.lang && r.lang !== "en",
  );
  const fixtureRows = Array.isArray(selftest.rows) ? selftest.rows : [];
  const controls = Array.isArray(selftest.negativeControls)
    ? selftest.negativeControls
    : [];
  const defaultBudget =
    typeof selftest.defaultFalsePositiveBudget === "number"
      ? selftest.defaultFalsePositiveBudget
      : 0;

  // ---- 1. COVERAGE: rows <-> fixtures must be exactly in sync -------------
  // Fixtures entries must carry string lang+avoid keys and be unique —
  // a blank key would only surface as a cryptic "stale entry" failure, and
  // duplicates would silently collapse in the Map index below.
  for (const fixture of fixtureRows) {
    assertThat(
      typeof fixture.lang === "string" &&
        fixture.lang.length > 0 &&
        typeof fixture.avoid === "string" &&
        fixture.avoid.length > 0,
      `[fixtures] a fixtures entry is missing its string lang/avoid key: ${JSON.stringify(
        { lang: fixture.lang, avoid: fixture.avoid },
      )}`,
    );
  }
  const fixturesByKey = new Map(fixtureRows.map((f) => [keyOf(f), f]));
  assertThat(
    fixturesByKey.size === fixtureRows.length,
    `[fixtures] ${fixtureRows.length - fixturesByKey.size} duplicate lang+avoid fixtures entr(y/ies) collapse in the index`,
    "each non-en avoid row must have exactly one fixtures entry",
  );
  const rowKeys = new Set(nonEnRows.map((r) => keyOf(r)));
  // Duplicate (lang, avoid) termbase rows would collapse in this Set and pass
  // the stale-fixture cross-check; a duplicate avoid row is an authoring error.
  assertThat(
    rowKeys.size === nonEnRows.length,
    `[fixtures] ${nonEnRows.length - rowKeys.size} duplicate (lang, avoid) row(s) in terminology.json avoid[]`,
    "deduplicate the termbase rows so coverage stays one-to-one",
  );
  for (const row of nonEnRows) {
    assertThat(
      fixturesByKey.has(keyOf(row)),
      `[coverage] non-en avoid row "${row.avoid}" (${row.lang}) has no fixtures entry`,
      `add a { lang, avoid, positiveFixtures, negativeFixtures } entry to ${path.relative(REPO_ROOT, SELFTEST_PATH)}`,
    );
  }
  for (const fixture of fixtureRows) {
    assertThat(
      rowKeys.has(keyOf(fixture)),
      `[coverage] stale fixtures entry "${fixture.avoid}" (${fixture.lang}) has no matching terminology.json avoid row`,
      "remove the entry (or restore the avoid row) so the two files stay in sync",
    );
  }

  // ---- 2. CURATION: avoid term must not hide inside a preferred term -----
  const concepts = Array.isArray(termbase.concepts) ? termbase.concepts : [];
  for (const row of nonEnRows) {
    for (const concept of concepts) {
      const preferred =
        concept && concept.preferred ? concept.preferred[row.lang] : undefined;
      if (typeof preferred !== "string") continue;
      // preferred values may list variants ("에이전트, 에이전트 노드").
      for (const part of preferred.split(/[,/]/)) {
        const candidate = part.trim();
        if (!candidate) continue;
        assertThat(
          !candidate.includes(row.avoid),
          `[curation] avoid row "${row.avoid}" (${row.lang}) is a substring of preferred "${candidate}" (concept ${concept.id})`,
          "a bare token inside a preferred compound would flag every legitimate use; use a precise compound or drop the row",
        );
      }
    }
  }

  // ---- Build the real stores + matcher inputs (shared by 3/4/5/6) --------
  const langsNeeded = new Set([
    ...nonEnRows.map((r) => r.lang),
    ...controls.map((c) => c.lang),
  ]);
  const stores = [];
  for (const glob of I18N_GLOBS) {
    for (const file of listLocaleFiles(glob.dir)) {
      const lang = path.basename(file, ".json");
      if (!langsNeeded.has(lang)) continue;
      const data = readJson(file, false);
      if (!data || typeof data !== "object") continue;
      /** @type {Array<{key:string,segment:string,value:string}>} */
      const leaves = [];
      collectLeaves(data, "", glob.keySep, leaves);
      stores.push({ file, label: glob.label, lang, leaves });
    }
  }
  // Every configured store must be present for every language under test —
  // a missing or unparseable locale file would silently shrink the live
  // corpus and let the budget/teeth gates pass on incomplete data.
  for (const glob of I18N_GLOBS) {
    for (const lang of langsNeeded) {
      assertThat(
        stores.some((s) => s.label === glob.label && s.lang === lang),
        `[wiring] no ${lang} store loaded from ${glob.label}`,
        "the live false-positive budget would be computed from incomplete data (missing or unparseable locale file)",
      );
    }
  }

  const allowRaw = readJson(ALLOWLIST_PATH, false) || {};
  const allow = {
    ignoreValues: new Set(
      Array.isArray(allowRaw.ignoreValues) ? allowRaw.ignoreValues : [],
    ),
    ignoreKeys: new Set(
      Array.isArray(allowRaw.ignoreKeys) ? allowRaw.ignoreKeys : [],
    ),
  };
  const approvedCompounds = buildApprovedCompounds(termbase);

  /** @param {any} row @returns {number} live CHECK 1 finding count */
  function liveHits(row) {
    return runCheck1(stores, [row], allow, approvedCompounds).length;
  }

  // ---- 3/4/5. Per-row: detectability, precision, live budget -------------
  for (const row of nonEnRows) {
    const fixture = fixturesByKey.get(keyOf(row));
    const match = buildTermMatcher(row, approvedCompounds);

    if (fixture) {
      // Fixtures must be strings: a non-string positive would crash inside
      // runCheck1 with a misleading stack, and a non-string negative would
      // silently PASS the precision gate (regex coercion never matches).
      const rawPositives = Array.isArray(fixture.positiveFixtures)
        ? fixture.positiveFixtures
        : [];
      const positives = rawPositives.filter((s) => typeof s === "string");
      assertThat(
        positives.length === rawPositives.length,
        `[fixtures] "${row.avoid}" (${row.lang}) has ${rawPositives.length - positives.length} non-string positiveFixtures entr(y/ies)`,
      );
      assertThat(
        positives.length > 0,
        `[detectable] "${row.avoid}" (${row.lang}) has no positiveFixtures`,
        "at least one synthetic string proving the row can fire is required",
      );
      for (const s of positives) {
        assertThat(
          match(s).length > 0,
          `[detectable] "${row.avoid}" (${row.lang}) did NOT match positive fixture: ${JSON.stringify(s)}`,
        );
      }

      // Regression-guard the severity model: a non-English row must ALWAYS
      // yield WARN-severity findings (never "error"), so it can never
      // hard-block under --strict. Exercised through the real runCheck1
      // pipeline on a synthetic store built from the first positive fixture.
      if (positives.length > 0) {
        const syntheticStore = {
          file: "(fixture)",
          label: "(fixture)",
          lang: row.lang,
          leaves: [{ key: "fixture", segment: "fixture", value: positives[0] }],
        };
        const findings = runCheck1(
          [syntheticStore],
          [row],
          { ignoreValues: new Set(), ignoreKeys: new Set() },
          approvedCompounds,
        );
        assertThat(
          findings.length > 0 && findings.every((f) => f.severity === "warn"),
          `[severity] "${row.avoid}" (${row.lang}) produced a non-warn finding through runCheck1`,
          `non-English rows must stay WARN-only (got: ${JSON.stringify(findings.map((f) => f.severity))})`,
        );
      }

      const rawNegatives = Array.isArray(fixture.negativeFixtures)
        ? fixture.negativeFixtures
        : [];
      const negatives = rawNegatives.filter((s) => typeof s === "string");
      assertThat(
        negatives.length === rawNegatives.length,
        `[fixtures] "${row.avoid}" (${row.lang}) has ${rawNegatives.length - negatives.length} non-string negativeFixtures entr(y/ies)`,
      );
      assertThat(
        negatives.length > 0,
        `[precise] "${row.avoid}" (${row.lang}) has no negativeFixtures`,
        "cover the legitimate longer compounds the term must not fire inside",
      );
      for (const s of negatives) {
        assertThat(
          match(s).length === 0,
          `[precise] "${row.avoid}" (${row.lang}) MATCHED negative fixture: ${JSON.stringify(s)}`,
        );
      }
    }

    // The live-budget gate runs even when the fixtures entry is missing —
    // a noisy row must blow up on its hit-count, not hide behind the
    // coverage failure (e.g. bare ko "세션" ≈ 200 live values, budget 0).
    const budget =
      fixture && typeof fixture.falsePositiveBudget === "number"
        ? fixture.falsePositiveBudget
        : defaultBudget;
    const hits = liveHits(row);
    assertThat(
      hits <= budget,
      `[budget] "${row.avoid}" (${row.lang}) fires on ${hits} live i18n value(s); budget is ${budget}`,
      "either the stores contain real drift to fix first, the row is too broad, or a rare legitimate use needs the allowlist",
    );
  }

  // ---- 6. TEETH: known-bad bare-noun rows must blow the budget -----------
  for (const control of controls) {
    const syntheticRow = {
      avoid: control.avoid,
      useInstead: "(negative control)",
      reason: "(negative control)",
      lang: control.lang,
      context: null,
      conceptId: null,
    };
    const wanted =
      typeof control.expectAtLeastLiveHits === "number"
        ? control.expectAtLeastLiveHits
        : 1;
    const hits = liveHits(syntheticRow);
    assertThat(
      hits >= wanted,
      `[teeth] negative control "${control.avoid}" (${control.lang}) fired on only ${hits} live value(s); expected >= ${wanted}`,
      "the false-positive budget gate has lost its teeth — the matcher or the stores changed in a way that hides bare-noun noise",
    );
    // The control must also beat every budget actually configured — otherwise
    // raising defaultFalsePositiveBudget (or a per-row budget) past the
    // control's hit-count would defang the gate: a row exactly this noisy
    // would fit the budget while the teeth check still "passed".
    const maxConfiguredBudget = Math.max(
      defaultBudget,
      ...fixtureRows.map((f) =>
        typeof f.falsePositiveBudget === "number"
          ? f.falsePositiveBudget
          : defaultBudget,
      ),
    );
    assertThat(
      hits > maxConfiguredBudget,
      `[teeth] negative control "${control.avoid}" (${control.lang}) fired on ${hits} live value(s), which fits the largest configured falsePositiveBudget (${maxConfiguredBudget})`,
      "a real row this noisy would be ACCEPTED by the budget gate — lower the budgets or reconsider the control",
    );
  }

  // ---- Report -------------------------------------------------------------
  console.log("non-English terminology precision self-test (FR-3051)");
  console.log(
    `  rows under test: ${nonEnRows.length} non-en avoid row(s), ${controls.length} negative control(s)`,
  );
  if (failures.length === 0) {
    console.log(`  PASS — ${passCount} assertion(s) hold.`);
    return 0;
  }
  console.log(`  ${passCount} assertion(s) passed, ${failures.length} FAILED:`);
  for (const f of failures) {
    console.log(`  FAIL  ${f}`);
  }
  return 1;
}

process.exit(main());
