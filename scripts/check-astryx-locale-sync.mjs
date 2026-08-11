#!/usr/bin/env node
/**
 * check-astryx-locale-sync.mjs — keeps the BUI `astryx` override catalogs
 * key-synced with the catalog @astryxdesign/core actually ships (FR-3511).
 *
 * ## What it guards
 *
 * Astryx resolves its own chrome strings (`@astryx.<component>.<name>`) through
 * `InternationalizationProvider`. `BAIConfigProvider` feeds that provider the
 * `overrides` built by `buildAstryxOverrides`, which lifts the `astryx` subtree
 * out of each BUI locale bundle. Three things about that channel fail SILENTLY:
 *
 *   1. `buildAstryxOverrides` keeps only entries whose value is a **string**.
 *      Pasting upstream's `{defaultMessage, description}` object shape into the
 *      subtree type-checks, lints, tests and renders — as untranslated English.
 *   2. A key upstream renames or deletes on the next `@astryxdesign/core` bump
 *      leaves a translation that can never match again. Nothing warns: lookup
 *      just falls through to the shipped `en` catalog.
 *   3. An ICU placeholder mangled in translation (`{count, number}` →
 *      `{count}`, a dropped `other {}` plural branch) throws inside
 *      IntlMessageFormat at render time, in one language, on one screen.
 *
 * So: stale keys, non-string values and ICU drift are ERRORS. Keys upstream
 * added that no locale covers yet are a WARNING by default — they fall back to
 * English exactly as before, and a routine dependency bump should not hard-fail
 * every local `verify.sh` run until 20 translations have been written. Pass
 * `--strict` (CI, or the release checklist) to make coverage gaps fail too.
 *
 * `en` is deliberately exempt from the coverage check: upstream's `en.json` IS
 * the final fallback in Astryx's lookup chain, so a BUI-side English copy would
 * be a second source of truth that can only drift.
 *
 * Usage:
 *   node scripts/check-astryx-locale-sync.mjs            # warn on gaps
 *   node scripts/check-astryx-locale-sync.mjs --strict   # gaps fail too
 *   node scripts/check-astryx-locale-sync.mjs --json     # machine-readable
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, "..");

/** Upstream's shipped source-of-truth catalog. */
export const DEFAULT_UPSTREAM_CATALOG = path.join(
  REPO_ROOT,
  "react",
  "node_modules",
  "@astryxdesign",
  "core",
  "locales",
  "en.json",
);

/** The BUI locale bundles whose `astryx` subtree feeds `buildAstryxOverrides`. */
export const DEFAULT_LOCALE_DIR = path.join(
  REPO_ROOT,
  "packages",
  "backend.ai-ui",
  "src",
  "locale",
);

/** The reserved subtree name — must match `astryxOverrides.ts`. */
export const ASTRYX_SUBTREE = "astryx";

/** Locales that intentionally carry no overrides (upstream ships them). */
export const EXEMPT_LOCALES = new Set(["en"]);

const PLURAL_TYPES = new Set(["plural", "selectordinal", "select"]);
/** Only these carry CLDR branch names; `select` branches are arbitrary. */
const PLURAL_BRANCH_TYPES = new Set(["plural", "selectordinal"]);
const PLURAL_SELECTOR = /^(zero|one|two|few|many|other|=\d+)$/;

/* ------------------------------------------------------------------ *
 * ICU MessageFormat argument extraction (dependency-free on purpose —
 * this gate runs from the repo root, where intl-messageformat does not
 * resolve under pnpm's global virtual store).
 * ------------------------------------------------------------------ */

class IcuParseError extends Error {}

/**
 * Extract every argument in an ICU message, at any nesting depth.
 *
 * @param {string} message
 * @returns {Map<string, {types: Set<string>, selectors: Set<string>}>}
 */
export function parseIcuArguments(message) {
  const args = new Map();
  const record = (name, type, selectors) => {
    let entry = args.get(name);
    if (!entry) {
      entry = { types: new Set(), selectors: new Set() };
      args.set(name, entry);
    }
    entry.types.add(type);
    for (const s of selectors ?? []) entry.selectors.add(s);
  };

  let i = 0;
  const len = message.length;

  const skipSpace = () => {
    while (i < len && /\s/.test(message[i])) i += 1;
  };

  /** Parse a message body until an unmatched `}` (or end of input). */
  const parseBody = (nested) => {
    while (i < len) {
      const ch = message[i];
      if (ch === "}") {
        if (nested) return;
        throw new IcuParseError(`unmatched '}' at offset ${i}`);
      }
      if (ch === "'") {
        // ICU apostrophe: `'{`, `'}` and `'#` start a quoted literal that runs
        // to the next apostrophe; anything else is a plain apostrophe.
        const next = message[i + 1];
        if (next === "{" || next === "}" || next === "#") {
          const close = message.indexOf("'", i + 2);
          i = close === -1 ? len : close + 1;
          continue;
        }
        i += next === "'" ? 2 : 1;
        continue;
      }
      if (ch === "{") {
        i += 1;
        parseArgument();
        continue;
      }
      i += 1;
    }
    if (nested) throw new IcuParseError("unterminated '{'");
  };

  /** Parse one `{…}` argument; `i` sits just past the opening brace. */
  const parseArgument = () => {
    skipSpace();
    const start = i;
    while (i < len && !",}".includes(message[i]) && !/\s/.test(message[i])) {
      i += 1;
    }
    const name = message.slice(start, i);
    if (name === "") throw new IcuParseError(`empty argument name at ${start}`);
    skipSpace();

    if (message[i] === "}") {
      i += 1;
      record(name, "simple");
      return;
    }
    if (message[i] !== ",") {
      throw new IcuParseError(`expected ',' or '}' after '${name}'`);
    }
    i += 1;
    skipSpace();

    const typeStart = i;
    while (i < len && !",}".includes(message[i]) && !/\s/.test(message[i])) {
      i += 1;
    }
    const type = message.slice(typeStart, i);
    skipSpace();

    if (!PLURAL_TYPES.has(type)) {
      // number/date/time (+ optional style) — skip to the matching brace.
      let depth = 1;
      while (i < len && depth > 0) {
        if (message[i] === "{") depth += 1;
        else if (message[i] === "}") depth -= 1;
        i += 1;
      }
      if (depth > 0)
        throw new IcuParseError(`unterminated '{${name}, ${type}'`);
      record(name, type);
      return;
    }

    // plural / selectordinal / select — parse the `selector {body}` branches.
    const selectors = [];
    while (i < len) {
      skipSpace();
      if (message[i] === "}") {
        i += 1;
        break;
      }
      if (message[i] === ",") {
        // `offset:N` and friends live here; skip the token.
        i += 1;
        continue;
      }
      const selStart = i;
      while (i < len && !/[\s{}]/.test(message[i])) i += 1;
      const selector = message.slice(selStart, i);
      if (selector === "")
        throw new IcuParseError(`empty selector in '${name}'`);
      if (selector.startsWith("offset:")) continue;
      skipSpace();
      if (message[i] !== "{") {
        throw new IcuParseError(`selector '${selector}' has no branch body`);
      }
      i += 1;
      parseBody(true);
      i += 1; // consume the branch's closing brace
      selectors.push(selector);
    }
    if (selectors.length === 0) {
      throw new IcuParseError(`'${name}' has no ${type} branches`);
    }
    record(name, type, selectors);
  };

  parseBody(false);
  return args;
}

/* ------------------------------------------------------------------ *
 * Comparison
 * ------------------------------------------------------------------ */

const setsEqual = (a, b) =>
  a.size === b.size && [...a].every((value) => b.has(value));

/**
 * Argument types that actually render the value. A name the source renders
 * must still render in the translation; `plural`/`select` alone only render
 * branch text, so demoting `{n, number}` to a plural branch loses the number.
 */
const VALUE_TYPES = new Set(["simple", "number", "date", "time"]);
const valueTypesOf = (types) =>
  new Set([...types].filter((t) => VALUE_TYPES.has(t)));

/**
 * Compare one translated message against the English source.
 *
 * Placeholder NAMES must match exactly — dropping one loses data, inventing
 * one throws at format time. Argument TYPES are deliberately not required to
 * match: languages without a plural distinction (ko, ja, zh, th, vi, id, ms)
 * legitimately render `{n, number} {n, plural, one {page} other {pages}}` as
 * `{n, number} 페이지`, and languages with more categories than English add
 * `few`/`many` branches. What must hold is that a rendered value stays
 * rendered, and that every plural/select keeps an `other` branch.
 *
 * @returns {string[]} human-readable problems (empty when the message is fine)
 */
export function compareIcu(englishMessage, translatedMessage) {
  let source;
  let target;
  try {
    source = parseIcuArguments(englishMessage);
  } catch (error) {
    return [`upstream message does not parse: ${error.message}`];
  }
  try {
    target = parseIcuArguments(translatedMessage);
  } catch (error) {
    return [`translation does not parse as ICU: ${error.message}`];
  }

  const problems = [];
  const sourceNames = new Set(source.keys());
  const targetNames = new Set(target.keys());
  if (!setsEqual(sourceNames, targetNames)) {
    const missing = [...sourceNames].filter((n) => !targetNames.has(n));
    const extra = [...targetNames].filter((n) => !sourceNames.has(n));
    if (missing.length)
      problems.push(`dropped placeholder(s): ${missing.join(", ")}`);
    if (extra.length)
      problems.push(`invented placeholder(s): ${extra.join(", ")}`);
  }

  for (const [name, sourceArg] of source) {
    const targetArg = target.get(name);
    if (!targetArg) continue;
    // The formatter is structure, not translation: number/date/time/simple each
    // render a different value, so the target must keep the source's set exactly.
    const sourceValueTypes = valueTypesOf(sourceArg.types);
    const targetValueTypes = valueTypesOf(targetArg.types);
    if (!setsEqual(sourceValueTypes, targetValueTypes)) {
      problems.push(
        `'${name}' changes how its value renders: {${[...sourceValueTypes].join("|") || "-"}} -> ` +
          `{${[...targetValueTypes].join("|") || "-"}}`,
      );
    }
    if (targetArg.selectors.size > 0) {
      if (!targetArg.selectors.has("other")) {
        problems.push(`'${name}' has no 'other' branch (ICU requires one)`);
      }
      if ([...targetArg.types].some((t) => PLURAL_BRANCH_TYPES.has(t))) {
        for (const selector of targetArg.selectors) {
          if (!PLURAL_SELECTOR.test(selector)) {
            problems.push(
              `'${name}' has an invalid plural selector '${selector}'`,
            );
          }
        }
      } else {
        // `select` branch names are arbitrary identifiers chosen upstream, so
        // they are matched against the source rather than a fixed vocabulary.
        const invented = [...targetArg.selectors].filter(
          (s) => !sourceArg.selectors.has(s),
        );
        const dropped = [...sourceArg.selectors].filter(
          (s) => !targetArg.selectors.has(s),
        );
        if (invented.length)
          problems.push(
            `'${name}' invents select branch(es): ${invented.join(", ")}`,
          );
        if (dropped.length)
          problems.push(
            `'${name}' drops select branch(es): ${dropped.join(", ")}`,
          );
      }
    }
  }
  return problems;
}

/* ------------------------------------------------------------------ *
 * The check
 * ------------------------------------------------------------------ */

export function listLocaleFiles(localeDir) {
  return fs
    .readdirSync(localeDir)
    .filter((f) => f.endsWith(".json") && !f.endsWith(".schema.json"))
    .sort()
    .map((f) => ({
      lang: f.slice(0, -".json".length),
      file: path.join(localeDir, f),
    }));
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

/**
 * @param {object} [options]
 * @param {string} [options.upstreamCatalog] path to @astryxdesign/core's en.json
 * @param {string} [options.localeDir] directory of BUI locale bundles
 * @param {boolean} [options.strict] treat coverage gaps as errors
 * @returns {{findings: Array, languages: Array, upstreamKeyCount: number}}
 */
export function runAstryxLocaleSync(options = {}) {
  const upstreamCatalog = options.upstreamCatalog ?? DEFAULT_UPSTREAM_CATALOG;
  const localeDir = options.localeDir ?? DEFAULT_LOCALE_DIR;
  const strict = options.strict ?? false;

  if (!fs.existsSync(upstreamCatalog)) {
    return {
      findings: [
        {
          severity: "error",
          lang: "-",
          kind: "no-upstream-catalog",
          detail:
            `upstream catalog not found at ${path.relative(REPO_ROOT, upstreamCatalog)} ` +
            `— run \`pnpm install\` so @astryxdesign/core is present`,
        },
      ],
      languages: [],
      upstreamKeyCount: 0,
    };
  }

  const upstream = readJson(upstreamCatalog);
  const upstreamKeys = Object.keys(upstream);
  const findings = [];
  const languages = [];

  for (const { lang, file } of listLocaleFiles(localeDir)) {
    const bundle = readJson(file);
    const subtree = bundle[ASTRYX_SUBTREE];
    const exempt = EXEMPT_LOCALES.has(lang);
    const rel = path.relative(REPO_ROOT, file);

    if (
      subtree !== undefined &&
      (typeof subtree !== "object" || Array.isArray(subtree))
    ) {
      findings.push({
        severity: "error",
        lang,
        file: rel,
        kind: "bad-subtree",
        detail: `'${ASTRYX_SUBTREE}' must be an object of flat string entries`,
      });
      continue;
    }

    const entries = subtree ? Object.entries(subtree) : [];
    const covered = new Set();

    for (const [key, value] of entries) {
      if (!(key in upstream)) {
        findings.push({
          severity: "error",
          lang,
          file: rel,
          kind: "stale-key",
          key,
          detail:
            "not in @astryxdesign/core's en.json — renamed or removed upstream",
        });
        continue;
      }
      if (typeof value !== "string") {
        findings.push({
          severity: "error",
          lang,
          file: rel,
          kind: "non-string",
          key,
          detail:
            `value is ${Array.isArray(value) ? "an array" : typeof value}; ` +
            "buildAstryxOverrides keeps STRING values only, so this entry is " +
            "silently dropped (do not copy upstream's {defaultMessage, description} shape)",
        });
        continue;
      }
      if (value.trim() === "") {
        findings.push({
          severity: "error",
          lang,
          file: rel,
          kind: "empty-value",
          key,
          detail:
            "empty translation — remove the key instead, so it falls back to English",
        });
        continue;
      }
      for (const problem of compareIcu(upstream[key].defaultMessage, value)) {
        findings.push({
          severity: "error",
          lang,
          file: rel,
          kind: "icu-mismatch",
          key,
          detail: problem,
        });
      }
      covered.add(key);
    }

    const missing = upstreamKeys.filter((key) => !covered.has(key));
    languages.push({
      lang,
      exempt,
      translated: covered.size,
      missing: missing.length,
    });
    if (!exempt && missing.length > 0) {
      findings.push({
        severity: strict ? "error" : "warning",
        lang,
        file: rel,
        kind: "missing-keys",
        keys: missing,
        detail: `${missing.length} of ${upstreamKeys.length} keys have no translation`,
      });
    }
  }

  return { findings, languages, upstreamKeyCount: upstreamKeys.length };
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

const REMEDIATION = `
How to fix
  stale-key    @astryxdesign/core renamed or removed this key. Delete the entry
               from every packages/backend.ai-ui/src/locale/*.json 'astryx'
               subtree (or rename it to the new upstream key).
  non-string   The 'astryx' subtree holds FLAT STRINGS keyed by the full
               '@astryx.*' key — never upstream's {defaultMessage, description}
               object. buildAstryxOverrides drops non-strings silently.
  icu-mismatch Every placeholder name in the English message must appear in the
               translation and none may be invented; a value the English
               renders ({n, number}) must still render. Plural categories may
               differ per language, but every plural/select needs an 'other'.
  missing-keys New upstream keys with no translation. They fall back to English,
               so this is a warning by default. Translate them into the 20
               non-en bundles ('en' is exempt — upstream's en.json is the
               fallback), then re-run. Use --strict to make this fail.
`;

function main(argv) {
  const strict = argv.includes("--strict");
  const asJson = argv.includes("--json");
  const result = runAstryxLocaleSync({ strict });

  if (asJson) {
    console.log(
      JSON.stringify(result, (_k, v) => (v instanceof Set ? [...v] : v), 2),
    );
  } else {
    // Deliberately compact: `verify.sh` pipes every step through `tail -20`,
    // so a per-language table would push real findings off the top.
    const exempt = result.languages.filter((l) => l.exempt);
    const complete = result.languages.filter(
      (l) => !l.exempt && l.missing === 0,
    );
    const partial = result.languages.filter((l) => !l.exempt && l.missing > 0);
    console.log(
      `astryx locale sync — ${result.upstreamKeyCount} upstream keys, ` +
        `${complete.length} bundles fully translated, ` +
        `${partial.length} partial, ` +
        `${exempt.length} exempt (${exempt.map((l) => l.lang).join(", ") || "none"})` +
        `${strict ? " [strict]" : ""}`,
    );
    for (const lang of partial) {
      console.log(
        `  ${lang.lang.padEnd(6)} ${lang.translated}/${result.upstreamKeyCount} translated`,
      );
    }
    const errors = result.findings.filter((f) => f.severity === "error");
    const warnings = result.findings.filter((f) => f.severity === "warning");
    for (const finding of [...errors, ...warnings]) {
      const scope = finding.key ? ` ${finding.key}` : "";
      console.log(
        `\n${finding.severity.toUpperCase()} [${finding.kind}] ${finding.lang}${scope}` +
          `\n  ${finding.detail}` +
          (finding.keys
            ? `\n  first: ${finding.keys.slice(0, 5).join(", ")}`
            : ""),
      );
    }
    if (errors.length > 0 || warnings.length > 0) console.log(REMEDIATION);
    console.log(
      errors.length === 0
        ? `astryx locale sync OK${warnings.length ? ` (${warnings.length} warning(s))` : ""}`
        : `astryx locale sync FAILED — ${errors.length} error(s)`,
    );
  }

  return result.findings.some((f) => f.severity === "error") ? 1 : 0;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  process.exit(main(process.argv.slice(2)));
}
