#!/usr/bin/env node
// @ts-check
/**
 * check-terminology-i18n.mjs — deterministic, dependency-free i18n terminology checker.
 *
 * Closes the central gap: UI string VALUES in the i18n stores are never checked
 * against the documentation termbase today. This script is READ-ONLY — it never
 * writes, reorders, or reformats any JSON. It is meant to run AFTER prettier /
 * prettier-plugin-sort-json and the i18n merge driver, so it must not fight them.
 *
 * Three independent checks:
 *
 *   CHECK 1 (terminology drift, needs the termbase):
 *     Flags i18n VALUES (never keys) that contain a forbidden term from
 *     terminology.json `avoid[]`. Latin-script terms use whole-word matching;
 *     ko/ja/th terms use careful substring matching. Matches inside obvious
 *     identifiers / URLs / paths / config keys / backticked tokens / {{interp}}
 *     are skipped. An inline allowlist file silences legitimate strings.
 *
 *   CHECK 2 (near-duplicate value divergence, needs NO termbase) — OFF by default:
 *     Within each i18n file, flags a leaf-key final segment whose values include
 *     a NEAR-DUPLICATE: two or more distinct raw values that collapse to the same
 *     normalized form (lowercase, whitespace/hyphen/punctuation stripped) — i.e.
 *     the same term spelled inconsistently ("Auto Scaling" vs "Auto-scaling",
 *     "Grupo de recursos" vs "Grupo de Recursos", "セッションID" vs "セッション ID").
 *     Genuinely different values normalize apart and are NOT flagged, so this is
 *     high-signal (FR-3050 redesign replaced the old "any 2 distinct values" form
 *     that emitted thousands of benign phrasing differences). List-only / report;
 *     never blocks. Still OFF by default (enable with --check2): the findings are
 *     a real cross-locale casing-consistency backlog to triage, mostly in the
 *     non-English stores; promoting it to a default warn is a follow-up once that
 *     backlog is cleared.
 *
 *   CHECK 3 (unknown capitalized user-facing noun, needs the termbase) — OFF by
 *   default; opt in with --check3:
 *     Surfaces a candidate NEW user-facing term that should probably be
 *     registered in the termbase. For each ENGLISH i18n VALUE that reads like
 *     prose (a sentence, not a short label), it mines embedded Title-Case
 *     multiword phrases ("Resource Preset") and PascalCase product-like tokens
 *     ("TensorBoard"), then WARNs when the phrase has no matching
 *     terminology.json concept (preferred.en) or avoid[] term and is not in the
 *     allowlist. This is inherently heuristic, so it is deliberately CONSERVATIVE:
 *     it scans ONLY prose values (short UI labels / button microcopy are skipped),
 *     peels leading imperative verbs and sentence-lead words, reuses
 *     isInsideCodeContext() to skip identifiers / URLs / interpolation, and is
 *     compared against the full preferred[] + avoid[] + approved-compound set
 *     (case-insensitive). It is ALWAYS report-only ("warn"): it NEVER affects the
 *     exit code, even under --strict, and stays OFF in verify.sh. Tune false
 *     positives via the allowlist `ignoreNouns` array. The output is a manageable
 *     short list, not a wall of label noise; broadening it (e.g. scanning the BUI
 *     locale store too, or non-prose labels) is a tracked follow-up.
 *
 * Modes:
 *   (default)  WARN  — report findings, exit 0.
 *   --warn           — same as default (explicit).
 *   --strict         — exit non-zero when there are blocking (error-severity)
 *                      CHECK 1 findings. CHECK 2 and CHECK 3 are always
 *                      report-only and never affect the exit code. Non-English
 *                      and context-qualified terminology findings are
 *                      WARN-severity (never block), because they need human
 *                      judgement.
 *
 * Other flags:
 *   --json           Emit machine-readable JSON instead of the text report.
 *   --check2         Enable CHECK 2 (OFF by default — see CHECK 2 note above).
 *   --check3         Enable CHECK 3 (OFF by default — see CHECK 3 note above).
 *                    Always report-only; never affects the exit code.
 *   --no-check1      Skip CHECK 1 (terminology drift).
 *   --help           Print usage.
 *
 * Inline-ignore / allowlist conventions (so a false positive never hard-blocks
 * a valid PR):
 *   1. An optional allowlist file `scripts/terminology-i18n.allowlist.json`
 *      (sibling of this script). Shape:
 *        {
 *          "ignoreValues":   ["exact string value to never flag", ...],
 *          "ignoreKeys":     ["dotted.leaf.key.path", "comp:Foo^Bar", ...],
 *          "ignoreSegments": ["Description", "Tooltip", ...],  // CHECK 2 only
 *          "ignoreNouns":    ["GitHub", "TensorBoard", ...]    // CHECK 3 only
 *        }
 *      Missing file => empty allowlist (no effect). `ignoreNouns` entries are
 *      matched case-insensitively against CHECK 3 candidate phrases (whole phrase
 *      or as a contained multiword sub-phrase); seed it with known proper nouns
 *      / product names that are not termbase concepts.
 *   2. An inline marker inside a VALUE: appending the literal token
 *      `[[i18n-term-ok]]` anywhere in a string value tells CHECK 1 to skip that
 *      value. (CHECK 3 honors the same marker.) Used only when the canonical
 *      termbase genuinely cannot model the exception — prefer the allowlist file.
 *
 * Dependency-free: native Node ESM only. No npm package is imported. The output
 * JSON files (terminology.json, allowlist) are read with fs + JSON.parse — no
 * YAML, no schema validator, nothing gated by pnpm minimumReleaseAge.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// scripts/ lives at the repo root; the repo root is its parent.
const REPO_ROOT = path.resolve(__dirname, "..");

const TERMINOLOGY_PATH = path.join(
  REPO_ROOT,
  "packages",
  "backend.ai-webui-docs",
  "terminology.json",
);
const ALLOWLIST_PATH = path.join(__dirname, "terminology-i18n.allowlist.json");

// The two i18n stores, scanned uniformly. Both are read VALUES-only.
const I18N_GLOBS = [
  {
    dir: path.join(REPO_ROOT, "resources", "i18n"),
    label: "resources/i18n",
    // resources/i18n nests with '.' between segments (dialog.ask.Foo).
    keySep: ".",
  },
  {
    dir: path.join(REPO_ROOT, "packages", "backend.ai-ui", "src", "locale"),
    label: "packages/backend.ai-ui/src/locale",
    // The BUI store sets i18next nsSeparator '^'; the ':' in `comp:Foo` is a
    // literal key prefix, not a separator. We only build display paths here, so
    // the chosen separator is cosmetic — use '^' to echo the runtime convention.
    keySep: "^",
  },
];

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/** @param {string} s */
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** ANSI helpers (suppressed when not a TTY or NO_COLOR is set). */
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = {
  red: (s) => (useColor ? `\x1b[31m${s}\x1b[0m` : s),
  yellow: (s) => (useColor ? `\x1b[33m${s}\x1b[0m` : s),
  cyan: (s) => (useColor ? `\x1b[36m${s}\x1b[0m` : s),
  dim: (s) => (useColor ? `\x1b[2m${s}\x1b[0m` : s),
  bold: (s) => (useColor ? `\x1b[1m${s}\x1b[0m` : s),
};

/** Latin / ASCII-letter script detection for a term. */
function isLatinTerm(term) {
  // If the term contains any non-ASCII letter, treat it as a non-latin script
  // term (ko/ja/th) — substring matching, no word boundaries.
  return !/[^\x00-\x7f]/.test(term);
}

/** Does the term contain an uppercase ASCII letter? (=> case-sensitive match) */
function hasUpper(term) {
  return /[A-Z]/.test(term);
}

/**
 * Read + parse a JSON file. Returns null and logs to stderr on failure (so a
 * malformed sibling file degrades to "skip" rather than crashing the harness).
 * @param {string} p
 * @param {boolean} required
 */
function readJson(p, required) {
  let raw;
  try {
    raw = fs.readFileSync(p, "utf8");
  } catch (err) {
    if (required) {
      console.error(`error: cannot read required file: ${p}`);
      console.error(String(err && err.message ? err.message : err));
    }
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error(`error: invalid JSON in ${p}`);
    console.error(String(err && err.message ? err.message : err));
    return null;
  }
}

/**
 * Recursively collect every leaf STRING value with its dotted/`^`-joined key
 * path. Skips the `$schema` meta key. Keys are never inspected for terms.
 * @param {any} node
 * @param {string} prefix
 * @param {string} sep
 * @param {Array<{key: string, segment: string, value: string}>} out
 */
function collectLeaves(node, prefix, sep, out) {
  if (node == null || typeof node !== "object") return;
  for (const k of Object.keys(node)) {
    if (k === "$schema") continue;
    const v = node[k];
    const keyPath = prefix ? `${prefix}${sep}${k}` : k;
    if (typeof v === "string") {
      out.push({ key: keyPath, segment: k, value: v });
    } else if (v && typeof v === "object") {
      collectLeaves(v, keyPath, sep, out);
    }
  }
}

/**
 * List *.json locale files in a directory (non-recursive). Returns absolute
 * paths sorted for deterministic output. Skips the i18n.schema.json sibling if
 * present and ignores non-.json files (e.g. the BUI store's .ts antd shims).
 * @param {string} dir
 */
function listLocaleFiles(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return [];
  }
  return entries
    .filter((f) => f.endsWith(".json"))
    .filter((f) => f !== "i18n.schema.json" && !f.endsWith(".schema.json"))
    .sort()
    .map((f) => path.join(dir, f));
}

// ---------------------------------------------------------------------------
// Code-context detection — skip matches that live inside identifiers / URLs /
// paths / config keys / backticked tokens / interpolation placeholders.
// ---------------------------------------------------------------------------

/**
 * Given a value and the [start,end) span of a matched term, decide whether the
 * match sits inside a "code-like" token that must NOT be flagged as prose drift.
 * This is the i18n analogue of the docs "backticked tokens are not prose" rule.
 * @param {string} value
 * @param {number} start
 * @param {number} end
 */
function isInsideCodeContext(value, start, end) {
  // 1. Inside a {{ interpolation }} placeholder.
  //    Find the nearest unmatched {{ before `start` with no closing }} between.
  const before = value.slice(0, start);
  const lastOpen = before.lastIndexOf("{{");
  if (lastOpen !== -1) {
    const closeBetween = value.indexOf("}}", lastOpen);
    if (closeBetween === -1 || closeBetween >= start) {
      return true;
    }
  }

  // 2. Inside a backtick code span. Count the backticks BEFORE the match: an
  //    odd count means the match sits inside an unclosed `...` span. Counting
  //    (rather than lastIndexOf + look-ahead) ensures an earlier *closed* span
  //    like "Run `foo` then group sessions" does not falsely mark the later
  //    bare word "group" as code.
  if ((before.match(/`/g) || []).length % 2 === 1) return true;
  // <code>...</code> (used by some BUI strings, e.g. TypeToConfirm).
  const openCode = before.lastIndexOf("<code>");
  if (openCode !== -1) {
    const closeCode = value.indexOf("</code>", openCode);
    if (closeCode === -1 || closeCode >= end) return true;
  }

  // 3. Expand the match to its surrounding "token" (run of non-space chars) and
  //    classify that token. U+0020 is the only whitespace we treat as a break
  //    (the stores are normalized to space-only whitespace).
  let ts = start;
  while (ts > 0 && value[ts - 1] !== " ") ts--;
  let te = end;
  while (te < value.length && value[te] !== " ") te++;
  const token = value.slice(ts, te);

  // URL or scheme-qualified reference.
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(token)) return true;
  if (/https?:\/\//i.test(token)) return true;
  // Absolute / relative filesystem path.
  if (token.includes("/") && /[\/]/.test(token) && /^[~./]|\//.test(token)) {
    // e.g. /home/work, ./scripts, ../packages, cr.backend.ai/stable/img
    return true;
  }
  // Dotted identifier / config key / hostname (a.b.c, config.toml,
  // wsproxy.proxyURL, backend.ai, service-definition.toml). At least one dot
  // with alnum on both sides and no spaces.
  if (
    /^[A-Za-z0-9_$~./-]+$/.test(token) &&
    /[A-Za-z0-9]\.[A-Za-z0-9]/.test(token)
  ) {
    return true;
  }
  // CLI flag / option token (--tp, --dtype=half, -H).
  if (/^-{1,2}[A-Za-z]/.test(token)) return true;
  // Looks like an env/identifier in SCREAMING_SNAKE or a code token with _ / $.
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(token) && /[_$]/.test(token))
    return true;

  return false;
}

/**
 * Build a matcher for one avoid term. Returns a function(value) -> array of
 * match spans {index, length, text} that are NOT inside a code context and not
 * inside an approved compound phrase.
 *
 * `approvedCompounds` is a Set of lowercased multiword phrases derived from the
 * termbase (preferred.en values + useInstead values) that contain the avoid
 * term — e.g. "resource group" contains the avoid term "group". A bare,
 * single-word, context-qualified avoid term (the classic case: "group (for
 * project)") must NOT fire when it is part of one of these phrases, otherwise it
 * false-flags every "Resource Group" label. Multiword avoid terms (e.g.
 * "scaling group", "data folder") are matched literally and are unaffected.
 *
 * @param {{avoid: string, lang?: string, context?: string|null}} row
 * @param {Set<string>} approvedCompounds
 */
function buildTermMatcher(row, approvedCompounds) {
  const term = row.avoid;
  const latin = isLatinTerm(term);
  const caseSensitive = hasUpper(term); // WSProxy must not match lowercase wsproxy
  const flags = caseSensitive ? "g" : "gi";
  const isSingleLatinWord = latin && !/\s/.test(term);
  // Only single-word, context-qualified avoid terms get the compound guard.
  // Those are the inherently ambiguous ones ("group (for project)").
  const guardCompounds = isSingleLatinWord && !!row.context;

  let re;
  if (latin) {
    // Whole-word match. \b handles leading/trailing; for multi-word terms
    // ("scaling group") allow flexible internal whitespace (one or more spaces).
    const body = escapeRegExp(term).replace(/\\ /g, " ").replace(/ +/g, "\\s+");
    re = new RegExp(`(?<![A-Za-z0-9])${body}(?![A-Za-z0-9])`, flags);
  } else {
    // Non-latin (ko/ja/th): plain substring, no word boundaries (CJK/Thai have
    // no spaces between words). Still case-insensitive-irrelevant.
    re = new RegExp(escapeRegExp(term), flags);
  }

  const lowerTerm = term.toLowerCase();

  // Anaphora-safe guard: if the VALUE anywhere contains an approved compound
  // whose final word is this avoid term (e.g. "resource group" for the bare
  // avoid term "group"), suppress every bare-term match in that value. A later
  // pronominal reference ("…the resource group… within that group") would
  // otherwise false-flag. Only single-word, context-qualified terms are guarded.
  const compoundEndings = guardCompounds
    ? [...approvedCompounds].filter((p) => p.endsWith(` ${lowerTerm}`))
    : [];

  /**
   * Is the matched single word part of an approved compound? Looks at the
   * adjacent word on each side and checks "prev term" / "term next" against the
   * approved-compound set.
   */
  function inApprovedCompound(value, start, end) {
    // word before
    let ps = start;
    while (ps > 0 && value[ps - 1] === " ") ps--; // skip the single space
    let pwEnd = ps;
    let pwStart = pwEnd;
    while (pwStart > 0 && /[A-Za-z]/.test(value[pwStart - 1])) pwStart--;
    const prev = value.slice(pwStart, pwEnd).toLowerCase();
    // word after
    let ns = end;
    while (ns < value.length && value[ns] === " ") ns++;
    let nwStart = ns;
    let nwEnd = nwStart;
    while (nwEnd < value.length && /[A-Za-z]/.test(value[nwEnd])) nwEnd++;
    const next = value.slice(nwStart, nwEnd).toLowerCase();

    if (prev && approvedCompounds.has(`${prev} ${lowerTerm}`)) return true;
    if (next && approvedCompounds.has(`${lowerTerm} ${next}`)) return true;
    return false;
  }

  return function matchValue(value) {
    const out = [];
    if (guardCompounds && compoundEndings.length > 0) {
      const lowerValue = value.toLowerCase();
      if (compoundEndings.some((p) => lowerValue.includes(p))) {
        // The value is about an approved compound (e.g. "resource group");
        // skip the inherently-ambiguous bare term to avoid anaphoric false hits.
        return out;
      }
    }
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(value)) !== null) {
      const start = m.index;
      const end = m.index + m[0].length;
      const skip =
        isInsideCodeContext(value, start, end) ||
        (guardCompounds && inApprovedCompound(value, start, end));
      if (!skip) {
        out.push({ index: start, length: m[0].length, text: m[0] });
      }
      if (m[0].length === 0) re.lastIndex++; // guard against zero-width loops
    }
    return out;
  };
}

/**
 * Derive the set of approved multiword phrases (lowercased) from the termbase:
 * every preferred.* term and every useInstead string is split on commas/slashes
 * and any resulting multiword phrase is added. These are the canonical
 * compounds a context-qualified single-word avoid term must not fire inside.
 * @param {any} termbase
 */
function buildApprovedCompounds(termbase) {
  const set = new Set();
  const add = (phrase) => {
    if (typeof phrase !== "string") return;
    for (const part of phrase.split(/[,/]/)) {
      const norm = part.trim().toLowerCase().replace(/\s+/g, " ");
      if (norm.includes(" ")) set.add(norm);
    }
  };
  if (termbase && Array.isArray(termbase.concepts)) {
    for (const concept of termbase.concepts) {
      if (concept && concept.preferred) {
        for (const v of Object.values(concept.preferred)) add(v);
      }
    }
  }
  if (termbase && Array.isArray(termbase.avoid)) {
    for (const row of termbase.avoid) add(row && row.useInstead);
  }
  // A few canonical English compounds that are not concept names but are
  // legitimate prose ("group ID", "group folder", "group label"). These keep
  // the inherently-ambiguous bare-"group" rule from drowning the report; tune
  // via the allowlist file rather than expanding this list casually.
  for (const extra of [
    "group id",
    "group ids",
    "group folder",
    "group folders",
    "group labels",
    "policy group",
    "resource groups",
  ]) {
    set.add(extra);
  }
  return set;
}

// ---------------------------------------------------------------------------
// CHECK 1 — terminology drift against avoid[]
// ---------------------------------------------------------------------------

const INLINE_OK_MARKER = "[[i18n-term-ok]]";

/**
 * @param {Array<{file: string, label: string, leaves: Array<{key:string,segment:string,value:string}>, lang: string}>} stores
 * @param {Array<any>} avoidRows
 * @param {{ignoreValues: Set<string>, ignoreKeys: Set<string>}} allow
 * @param {Set<string>} approvedCompounds
 */
function runCheck1(stores, avoidRows, allow, approvedCompounds) {
  /** @type {Array<any>} */
  const findings = [];

  // Pre-build matchers once per avoid row.
  const matchers = avoidRows.map((row) => ({
    row,
    // Context-qualified rows (e.g. "group (for project)", "WSProxy as a UI
    // label") and any non-English row are WARN-severity: they need human
    // judgement and must never hard-block a PR. Bare English rows with no
    // context are blocking in --strict.
    severity: (row.lang && row.lang !== "en") || row.context ? "warn" : "error",
    match: buildTermMatcher(row, approvedCompounds),
  }));

  for (const store of stores) {
    for (const leaf of store.leaves) {
      const value = leaf.value;
      if (value.includes(INLINE_OK_MARKER)) continue;
      if (allow.ignoreValues.has(value)) continue;
      if (allow.ignoreKeys.has(leaf.key)) continue;

      for (const { row, severity, match } of matchers) {
        // Respect the avoid row's lang: only check a value when the file's lang
        // matches the row's lang. Rows without an explicit lang default to 'en'.
        const rowLang = row.lang || "en";
        if (store.lang !== rowLang) continue;

        const spans = match(value);
        if (spans.length === 0) continue;

        findings.push({
          check: "terminology",
          severity,
          file: store.file,
          fileLabel: store.label,
          lang: store.lang,
          key: leaf.key,
          term: row.avoid,
          useInstead: row.useInstead,
          reason: row.reason,
          context: row.context || null,
          value,
          spans,
        });
      }
    }
  }
  return findings;
}

// ---------------------------------------------------------------------------
// CHECK 2 — final-segment maps to >= 2 distinct values within a file
// ---------------------------------------------------------------------------

/**
 * Normalize a value for near-duplicate comparison: lowercase, then strip all
 * whitespace, hyphens, underscores, slashes, and common ASCII punctuation. Two
 * values that differ ONLY by case / spacing / hyphenation / punctuation collapse
 * to the same key; genuinely different wording stays distinct. Interpolation
 * braces `{{ }}` are left intact so placeholders do not collapse together.
 * @param {string} s
 */
function normalizeForNearDup(s) {
  return s.toLowerCase().replace(/[\s\-_./,;:!?'"`()[\]]+/g, "");
}

/**
 * Given the distinct raw values that collapsed to one normalized form, report
 * which normalization dimension(s) explain the collision, so consumers can tell
 * a case-only inconsistency from a spacing/hyphen one. Applies the same
 * dimensions cumulatively (matching normalizeForNearDup) and records each one
 * whose addition actually reduces the distinct-value count.
 * @param {string[]} rawValues
 * @returns {string[]} subset of ["case","whitespace","hyphen","punctuation"]
 */
function nearDupReasons(rawValues) {
  const reasons = [];
  let prev = new Set(rawValues);
  const step = (fn, name) => {
    const next = new Set([...prev].map(fn));
    if (next.size < prev.size) reasons.push(name);
    prev = next;
  };
  step((v) => v.toLowerCase(), "case");
  step((v) => v.replace(/\s+/g, ""), "whitespace");
  step((v) => v.replace(/[-_]+/g, ""), "hyphen");
  step((v) => v.replace(/[./,;:!?'"`()[\]]+/g, ""), "punctuation");
  return reasons;
}

/**
 * @param {Array<{file:string,label:string,leaves:Array<{key:string,segment:string,value:string}>,lang:string}>} stores
 * @param {{ignoreSegments: Set<string>}} allow
 */
function runCheck2(stores, allow) {
  /** @type {Array<any>} */
  const findings = [];

  for (const store of stores) {
    // segment -> Map(normalized -> Map(rawValue -> [keyPaths]))
    /** @type {Map<string, Map<string, Map<string, string[]>>>} */
    const bySegment = new Map();
    for (const leaf of store.leaves) {
      if (allow.ignoreSegments.has(leaf.segment)) continue;
      const norm = normalizeForNearDup(leaf.value);
      if (!norm) continue; // empty / all-punctuation after normalizing
      let normMap = bySegment.get(leaf.segment);
      if (!normMap) {
        normMap = new Map();
        bySegment.set(leaf.segment, normMap);
      }
      let valMap = normMap.get(norm);
      if (!valMap) {
        valMap = new Map();
        normMap.set(norm, valMap);
      }
      let keys = valMap.get(leaf.value);
      if (!keys) {
        keys = [];
        valMap.set(leaf.value, keys);
      }
      keys.push(leaf.key);
    }

    for (const [segment, normMap] of bySegment) {
      // A near-duplicate cluster is one normalized form reached by >=2 DISTINCT
      // raw values (the same word spelled inconsistently — "Auto Scaling" vs
      // "Auto-scaling", "Grupo de recursos" vs "Grupo de Recursos"). Values that
      // are genuinely different normalize apart and are NOT flagged — that is
      // what makes this high-signal versus the old "any 2 distinct values".
      const clusters = [];
      for (const [normalized, valMap] of normMap) {
        if (valMap.size < 2) continue;
        clusters.push({
          normalized,
          reasons: nearDupReasons([...valMap.keys()]),
          variants: [...valMap.entries()].map(([value, keys]) => ({
            value,
            keys,
          })),
        });
      }
      if (clusters.length === 0) continue;
      const variants = clusters.flatMap((cl) => cl.variants);
      const reasons = [...new Set(clusters.flatMap((cl) => cl.reasons))];
      findings.push({
        check: "near-duplicate",
        severity: "report", // always report-only; never affects exit code
        file: store.file,
        fileLabel: store.label,
        lang: store.lang,
        segment,
        reasons,
        distinct: variants.length,
        clusters,
        variants,
      });
    }
  }

  // Sort highest-signal first: fewest variants (a clean 2-way case/hyphen split)
  // rank above larger clusters, then by file / lang / segment for determinism.
  findings.sort(
    (a, b) =>
      a.distinct - b.distinct ||
      a.fileLabel.localeCompare(b.fileLabel) ||
      a.lang.localeCompare(b.lang) ||
      a.segment.localeCompare(b.segment),
  );
  return findings;
}

// ---------------------------------------------------------------------------
// CHECK 3 — unknown capitalized user-facing noun (candidate new term)
//
// Heuristic, report-only. For each ENGLISH prose VALUE, mine embedded Title-Case
// multiword phrases and PascalCase product tokens that are NOT already a termbase
// concept (preferred.en), NOT an avoid[] term, NOT an approved compound, and NOT
// allowlisted (ignoreNouns). Emit a WARN suggesting the term be registered.
//
// Conservative by construction (see the header CHECK 3 note):
//   - English only (store.lang === 'en'); the termbase preferred.en is English.
//   - Prose only: a value must read like a sentence (>= 5 words, >= 3 lowercase
//     words). Short labels / button microcopy ("Created At", "Start Service")
//     are NOT mined — they are UI text, not candidate concepts.
//   - Leading imperative verbs / sentence-lead words are peeled so an
//     instruction like "Press Enter to confirm" does not surface "Press Enter".
//   - isInsideCodeContext() skips identifiers / URLs / interpolation / backticks.
// ---------------------------------------------------------------------------

// Imperative / function verbs that lead UI labels and instructions — when one of
// these starts a candidate phrase it is an action, not a noun concept.
const CHECK3_LABEL_VERBS = new Set(
  (
    "add edit delete remove create update save cancel close open select choose " +
    "set get start stop run view show hide upload download import export copy " +
    "move rename clear reset apply submit confirm press click manage refresh " +
    "reload restart launch connect disconnect install login logout register " +
    "sign use change modify configure assign revoke grant deny allow check " +
    "uncheck skip retry continue finish complete send receive request approve " +
    "reject accept decline mount unmount attach detach pull push build deploy " +
    "scale terminate purge restore archive duplicate generate validate verify " +
    "enable disable provide requires require shutdown imported invalid"
  ).split(/\s+/),
);

// Sentence-lead / function words that, capitalized at a sentence start, are not
// the head of a term (peeled before evaluating a sentence-initial phrase).
const CHECK3_SENTENCE_LEAD = new Set(
  (
    "the a an this that these those there here it you your we our please if when " +
    "while after before once now then also and or but so to for of in on at by " +
    "with from into as is are be can will would should could may might must not " +
    "no yes all none some any each every other another same more less most least new"
  ).split(/\s+/),
);

/**
 * Does the value read like prose (a sentence) rather than a short label? Only
 * prose values are mined for embedded candidate terms.
 * @param {string} v
 */
function check3LooksLikeProse(v) {
  const words = v.match(/[A-Za-z][A-Za-z'-]*/g) || [];
  if (words.length < 5) return false;
  const lower = words.filter((w) => /^[a-z]/.test(w)).length;
  return lower >= 3;
}

/**
 * Extract candidate phrases from a value:
 *   - PascalCase single tokens with >= 2 humps (TensorBoard, FastTrack).
 *   - Runs of >= 2 adjacent Title-Case words ("Resource Preset"), where adjacency
 *     means separated by exactly one space (so a comma/period breaks the run).
 * Each candidate carries whether it begins a sentence (so leading verbs / lead
 * words can be peeled). Matches inside code context are dropped here.
 * @param {string} value
 */
function check3FindCandidates(value) {
  /** @type {Array<{text:string,start:number,end:number,kind:string,words?:string[],sentenceInitial?:boolean}>} */
  const cands = [];

  const pascalRe = /\b(?:[A-Z][a-z0-9]+){2,}\b/g;
  let m;
  while ((m = pascalRe.exec(value)) !== null) {
    if (m[0].length === 0) {
      pascalRe.lastIndex++;
      continue;
    }
    const start = m.index;
    const end = start + m[0].length;
    if (isInsideCodeContext(value, start, end)) continue;
    cands.push({ text: m[0], start, end, kind: "pascal" });
  }

  const wordRe = /[A-Za-z][A-Za-z'’-]*/g;
  /** @type {Array<{text:string,start:number,end:number}>} */
  const words = [];
  let w;
  while ((w = wordRe.exec(value)) !== null) {
    words.push({ text: w[0], start: w.index, end: w.index + w[0].length });
  }
  let i = 0;
  while (i < words.length) {
    if (/^[A-Z][a-z]/.test(words[i].text)) {
      let j = i;
      while (
        j + 1 < words.length &&
        /^[A-Z][a-z]/.test(words[j + 1].text) &&
        words[j + 1].start === words[j].end + 1 // exactly one space between
      ) {
        j++;
      }
      if (j > i) {
        const start = words[i].start;
        const end = words[j].end;
        if (!isInsideCodeContext(value, start, end)) {
          const prevChar =
            start > 0 ? value.slice(0, start).trimEnd().slice(-1) : "";
          const sentenceInitial = start === 0 || /[.!?:]/.test(prevChar);
          cands.push({
            text: value.slice(start, end),
            start,
            end,
            kind: "phrase",
            words: words.slice(i, j + 1).map((x) => x.text),
            sentenceInitial,
          });
        }
      }
      i = j + 1;
    } else {
      i++;
    }
  }
  return cands;
}

/**
 * Build the set of phrases CHECK 3 treats as "already known" (lowercased): every
 * termbase preferred.* value and avoid/useInstead term (split on , and /), plus
 * the approved compounds, plus the allowlist ignoreNouns. A candidate is known
 * if it equals a known phrase, or if a multiword known phrase contains it / it
 * contains a multiword known phrase (so "Resource Preset Settings" is covered by
 * a known "resource preset").
 * @param {any} termbase
 * @param {Set<string>} approvedCompounds
 * @param {Set<string>} ignoreNouns lowercased allowlist nouns
 */
function buildCheck3Known(termbase, approvedCompounds, ignoreNouns) {
  const known = new Set();
  const add = (s) => {
    if (typeof s !== "string") return;
    for (const part of s.split(/[,/]/)) {
      const norm = part.trim().toLowerCase().replace(/\s+/g, " ");
      if (norm) known.add(norm);
    }
  };
  if (termbase && Array.isArray(termbase.concepts)) {
    for (const concept of termbase.concepts) {
      if (concept && concept.preferred) {
        for (const v of Object.values(concept.preferred)) add(v);
      }
    }
  }
  if (termbase && Array.isArray(termbase.avoid)) {
    for (const row of termbase.avoid) {
      add(row && row.avoid);
      add(row && row.useInstead);
    }
  }
  for (const p of approvedCompounds) known.add(p);
  for (const n of ignoreNouns) known.add(n);
  return known;
}

/**
 * @param {string} phrase
 * @param {Set<string>} known lowercased known phrases
 */
function check3IsKnown(phrase, known) {
  const low = phrase.toLowerCase();
  if (known.has(low)) return true;
  for (const k of known) {
    if (!k.includes(" ")) continue; // single tokens compared by exact match only
    if (low.includes(k)) return true;
    if (k.includes(low) && low.includes(" ")) return true;
  }
  return false;
}

/**
 * @param {Array<{file:string,label:string,lang:string,leaves:Array<{key:string,segment:string,value:string}>}>} stores
 * @param {Set<string>} known lowercased known phrases (preferred + avoid + compounds + ignoreNouns)
 */
function runCheck3(stores, known) {
  /** phrase(lowercased) -> finding */
  /** @type {Map<string, any>} */
  const byPhrase = new Map();

  for (const store of stores) {
    // English only: the termbase preferred.en is the comparison key.
    if (store.lang !== "en") continue;
    for (const leaf of store.leaves) {
      const value = leaf.value;
      if (value.includes(INLINE_OK_MARKER)) continue;
      if (!check3LooksLikeProse(value)) continue;

      for (const cand of check3FindCandidates(value)) {
        let text = cand.text;
        if (cand.kind === "phrase") {
          const phraseWords = cand.words.slice();
          if (cand.sentenceInitial) {
            // Peel leading sentence-lead / imperative words at a sentence start.
            while (
              phraseWords.length > 1 &&
              (CHECK3_SENTENCE_LEAD.has(phraseWords[0].toLowerCase()) ||
                CHECK3_LABEL_VERBS.has(phraseWords[0].toLowerCase()))
            ) {
              phraseWords.shift();
            }
          }
          // An imperative verb still leading the phrase => it is an action label.
          if (
            phraseWords.length >= 1 &&
            CHECK3_LABEL_VERBS.has(phraseWords[0].toLowerCase())
          ) {
            continue;
          }
          if (phraseWords.length < 2) continue; // need a multiword phrase
          text = phraseWords.join(" ");
        }
        if (check3IsKnown(text, known)) continue;

        const lowKey = text.toLowerCase();
        let finding = byPhrase.get(lowKey);
        if (!finding) {
          finding = {
            check: "unknown-noun",
            severity: "report", // always report-only; never affects exit code
            kind: cand.kind,
            term: text,
            occurrences: 0,
            file: store.file,
            fileLabel: store.label,
            lang: store.lang,
            sampleKey: leaf.key,
            sampleValue: value,
          };
          byPhrase.set(lowKey, finding);
        }
        finding.occurrences++;
      }
    }
  }

  const findings = [...byPhrase.values()];
  // Highest-signal first: most occurrences, then alphabetical for determinism.
  findings.sort(
    (a, b) => b.occurrences - a.occurrences || a.term.localeCompare(b.term),
  );
  return findings;
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function shorten(s, n = 120) {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}

function printTextReport(check1, check2, check3, opts) {
  const errorCount = check1.filter((f) => f.severity === "error").length;
  const warnCount = check1.filter((f) => f.severity === "warn").length;

  console.log(c.bold("i18n terminology check"));
  console.log(
    c.dim(
      `mode=${opts.strict ? "strict" : "warn"}  termbase=${path.relative(
        REPO_ROOT,
        TERMINOLOGY_PATH,
      )}`,
    ),
  );
  console.log("");

  if (opts.runCheck1) {
    console.log(c.bold("CHECK 1 — terminology drift (i18n VALUES vs avoid[])"));
    if (check1.length === 0) {
      console.log(c.dim("  no forbidden terms found in i18n values."));
    } else {
      for (const f of check1) {
        const tag = f.severity === "error" ? c.red("error") : c.yellow("warn ");
        const ctx = f.context ? c.dim(` (context: ${f.context})`) : "";
        console.log(
          `  ${tag} [${f.fileLabel}/${f.lang}] ${c.cyan(f.key)}${ctx}`,
        );
        console.log(
          `        term "${f.term}" -> use "${f.useInstead}" ${c.dim(
            "(" + f.reason + ")",
          )}`,
        );
        console.log(`        value: ${shorten(f.value)}`);
      }
    }
    console.log("");
    console.log(
      c.dim(
        `  CHECK 1 summary: ${errorCount} blocking, ${warnCount} warn-only.`,
      ),
    );
    console.log("");
  }

  if (opts.runCheck2) {
    console.log(
      c.bold(
        "CHECK 2 — near-duplicate value divergence (report-only, no termbase)",
      ),
    );
    if (check2.length === 0) {
      console.log(c.dim("  no near-duplicate values found."));
    } else {
      // In --summary mode show only the top N highest-signal findings (fewest
      // distinct variants first; runCheck2 already sorted them that way).
      const shown =
        opts.limitCheck2 > 0 ? check2.slice(0, opts.limitCheck2) : check2;
      for (const f of shown) {
        console.log(
          `  ${c.yellow("report")} [${f.fileLabel}/${f.lang}] segment ${c.cyan(
            f.segment,
          )} -> ${f.distinct} near-duplicate value(s)${
            f.reasons && f.reasons.length
              ? c.dim(" [" + f.reasons.join(", ") + "]")
              : ""
          }`,
        );
        for (const v of f.variants) {
          console.log(
            `        ${JSON.stringify(shorten(v.value, 80))}  ${c.dim(
              "@ " + v.keys.join(", "),
            )}`,
          );
        }
      }
      if (shown.length < check2.length) {
        console.log(
          c.dim(
            `        … ${
              check2.length - shown.length
            } more (run \`pnpm run lint:terminology\` for the full list).`,
          ),
        );
      }
    }
    console.log("");
    console.log(
      c.dim(`  CHECK 2 summary: ${check2.length} near-duplicate segment(s).`),
    );
    console.log("");
  }

  if (opts.runCheck3) {
    console.log(
      c.bold(
        "CHECK 3 — unknown capitalized user-facing noun (report-only, candidate terms)",
      ),
    );
    if (check3.length === 0) {
      console.log(c.dim("  no unregistered capitalized nouns found in prose."));
    } else {
      for (const f of check3) {
        const occ = f.occurrences > 1 ? c.dim(` (×${f.occurrences})`) : "";
        console.log(
          `  ${c.yellow("warn ")} [${f.fileLabel}/${f.lang}] ${c.cyan(
            f.term,
          )}${occ} — no terminology.json entry; add one (with decidingFR) or allowlist it (ignoreNouns)`,
        );
        console.log(
          `        e.g. ${f.sampleKey}: ${shorten(f.sampleValue, 100)}`,
        );
      }
    }
    console.log("");
    console.log(
      c.dim(
        `  CHECK 3 summary: ${check3.length} candidate noun(s) (report-only; never blocks).`,
      ),
    );
    console.log("");
  }

  console.log(c.bold("=== TERMINOLOGY SUMMARY ==="));
  console.log(
    `  blocking terminology findings: ${errorCount}` +
      (opts.strict ? "" : c.dim("  (warn mode: not enforced)")),
  );
  console.log(`  warn-only terminology findings: ${warnCount}`);
  console.log(`  near-duplicate findings (report): ${check2.length}`);
  console.log(`  unknown-noun findings (report): ${check3.length}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = {
    strict: false,
    json: false,
    runCheck1: true,
    // CHECK 2 (key->two-values divergence) is OFF by default: its current
    // segment-across-namespace form is too broad (thousands of benign hits,
    // e.g. ModifiedAt -> "Modificado en" / "Modificado el"). Opt in with
    // --check2. Refining it into a high-signal check is tracked as a follow-up.
    runCheck2: false,
    // CHECK 3 (unknown capitalized user-facing noun) is OFF by default: it is a
    // heuristic candidate-term suggester. Opt in with --check3. It is always
    // report-only and never affects the exit code (mirrors CHECK 2's gating).
    runCheck3: false,
    help: false,
    // 0 = unlimited. --summary sets a sane default cap on CHECK 2 output so the
    // verify.sh harness stays readable; the full list is always available via
    // `pnpm run lint:terminology`.
    limitCheck2: 0,
    // Optional comma-separated lang filter (e.g. --lang=en,ko). Empty = all.
    langs: null,
  };
  for (const a of argv) {
    if (a.startsWith("--limit-check2=")) {
      const n = Number.parseInt(a.slice("--limit-check2=".length), 10);
      opts.limitCheck2 = Number.isFinite(n) && n > 0 ? n : 0;
      continue;
    }
    if (a.startsWith("--lang=")) {
      const list = a
        .slice("--lang=".length)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      opts.langs = list.length ? new Set(list) : null;
      continue;
    }
    switch (a) {
      case "--strict":
        opts.strict = true;
        break;
      case "--warn":
        opts.strict = false;
        break;
      case "--json":
        opts.json = true;
        break;
      case "--summary":
        // Bounded report for the verify.sh warn-only step.
        if (opts.limitCheck2 === 0) opts.limitCheck2 = 20;
        break;
      case "--check2":
        opts.runCheck2 = true;
        break;
      case "--no-check2":
        opts.runCheck2 = false;
        break;
      case "--check3":
        opts.runCheck3 = true;
        break;
      case "--no-check3":
        opts.runCheck3 = false;
        break;
      case "--no-check1":
        opts.runCheck1 = false;
        break;
      case "--help":
      case "-h":
        opts.help = true;
        break;
      default:
        console.error(`warning: unknown argument ignored: ${a}`);
    }
  }
  return opts;
}

const USAGE = `check-terminology-i18n.mjs — deterministic i18n terminology checker (read-only)

Usage:
  node scripts/check-terminology-i18n.mjs [--warn|--strict] [--json] [--summary]
                                          [--limit-check2=N] [--lang=en,ko]
                                          [--no-check1] [--check2] [--check3]

Modes:
  (default) / --warn   Report findings, always exit 0.
  --strict             Exit non-zero when there are blocking (error-severity)
                       CHECK 1 findings. CHECK 2 and CHECK 3 are always
                       report-only and never affect the exit code.

Options:
  --summary            Cap CHECK 2 output at the top 20 highest-signal findings
                       (fewest distinct variants first). For the verify.sh step.
  --limit-check2=N     Cap CHECK 2 output at N findings (0 = unlimited).
  --lang=en,ko         Restrict scanning to these locale files only.
  --json               Machine-readable output (always full, never capped).
  --check2             Enable CHECK 2 (OFF by default — broad/noisy today).
  --check3             Enable CHECK 3 (OFF by default — heuristic candidate-term
                       suggester; English prose only; always report-only).
  --no-check1          Skip CHECK 1 (terminology drift).

CHECK 1  Terminology drift: i18n VALUES (never keys) vs terminology.json avoid[].
CHECK 2  Key -> two-values divergence within each file (no termbase needed).
         OFF by default; enable with --check2. Currently low signal-to-noise.
CHECK 3  Unknown capitalized user-facing noun: a Title-Case multiword phrase or
         PascalCase product token in an English prose i18n VALUE with no matching
         terminology.json concept / avoid term — a candidate to register in the
         termbase. OFF by default; enable with --check3. WARN/report-only.

Allowlist: scripts/terminology-i18n.allowlist.json (optional)
  ignoreNouns: phrases CHECK 3 must never flag (proper nouns, product names).
Inline marker: append ${INLINE_OK_MARKER} to a value to skip it in CHECK 1
  (CHECK 3 honors the same marker).
`;

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    process.stdout.write(USAGE);
    return 0;
  }

  // Load termbase (only required for CHECK 1).
  const termbase = readJson(TERMINOLOGY_PATH, opts.runCheck1);
  if (opts.runCheck1 && (!termbase || !Array.isArray(termbase.avoid))) {
    console.error(
      `error: ${path.relative(
        REPO_ROOT,
        TERMINOLOGY_PATH,
      )} is missing or has no "avoid" array; cannot run CHECK 1.`,
    );
    // Soft-degrade: skip CHECK 1 rather than crash the warn-only harness.
    opts.runCheck1 = false;
  }
  const avoidRows =
    opts.runCheck1 && termbase && Array.isArray(termbase.avoid)
      ? termbase.avoid.filter((r) => r && typeof r.avoid === "string")
      : [];

  // Load optional allowlist.
  const allowRaw = readJson(ALLOWLIST_PATH, false) || {};
  const allow = {
    ignoreValues: new Set(
      Array.isArray(allowRaw.ignoreValues) ? allowRaw.ignoreValues : [],
    ),
    ignoreKeys: new Set(
      Array.isArray(allowRaw.ignoreKeys) ? allowRaw.ignoreKeys : [],
    ),
    ignoreSegments: new Set(
      Array.isArray(allowRaw.ignoreSegments) ? allowRaw.ignoreSegments : [],
    ),
    // CHECK 3 only: lowercased phrases never flagged as candidate nouns.
    ignoreNouns: new Set(
      (Array.isArray(allowRaw.ignoreNouns) ? allowRaw.ignoreNouns : [])
        .filter((s) => typeof s === "string")
        .map((s) => s.trim().toLowerCase().replace(/\s+/g, " "))
        .filter(Boolean),
    ),
  };

  // Build the flat list of stores (one per locale file), collecting leaves.
  /** @type {Array<{file:string,label:string,lang:string,leaves:Array<{key:string,segment:string,value:string}>}>} */
  const stores = [];
  for (const glob of I18N_GLOBS) {
    for (const file of listLocaleFiles(glob.dir)) {
      const lang = path.basename(file, ".json"); // en, ko, ja, th, zh-CN, ...
      if (opts.langs && !opts.langs.has(lang)) continue;
      const data = readJson(file, false);
      if (!data || typeof data !== "object") continue;
      /** @type {Array<{key:string,segment:string,value:string}>} */
      const leaves = [];
      collectLeaves(data, "", glob.keySep, leaves);
      stores.push({ file, label: glob.label, lang, leaves });
    }
  }

  if (stores.length === 0) {
    console.error("error: no i18n locale files found; nothing to check.");
    return 0; // never block; this is a wiring problem, not a content problem
  }

  const approvedCompounds = buildApprovedCompounds(termbase);
  const check1 = opts.runCheck1
    ? runCheck1(stores, avoidRows, allow, approvedCompounds)
    : [];
  const check2 = opts.runCheck2 ? runCheck2(stores, allow) : [];
  // CHECK 3 needs the termbase (preferred.en) to know what is already "known".
  // If the termbase failed to load, skip CHECK 3 rather than flag everything.
  const check3 =
    opts.runCheck3 && termbase
      ? runCheck3(
          stores,
          buildCheck3Known(termbase, approvedCompounds, allow.ignoreNouns),
        )
      : [];

  if (opts.json) {
    const errorCount = check1.filter((f) => f.severity === "error").length;
    const warnCount = check1.filter((f) => f.severity === "warn").length;
    process.stdout.write(
      JSON.stringify(
        {
          mode: opts.strict ? "strict" : "warn",
          summary: {
            blocking: errorCount,
            warn: warnCount,
            keyDivergence: check2.length,
            unknownNoun: check3.length,
          },
          check1,
          check2,
          check3,
        },
        null,
        2,
      ) + "\n",
    );
  } else {
    printTextReport(check1, check2, check3, opts);
  }

  const blocking = check1.filter((f) => f.severity === "error").length;
  // CHECK 2 and CHECK 3 are always report-only and NEVER affect the exit code.
  if (opts.strict && blocking > 0) return 1;
  return 0;
}

// Exported for scripts/check-terminology-i18n.selftest.mjs (FR-3051): the
// non-English avoid-row precision harness must exercise the REAL matcher and
// CHECK 1 pipeline, not a copy of them. Importing this module does not run the
// CLI — see the entry guard below.
export {
  REPO_ROOT,
  TERMINOLOGY_PATH,
  ALLOWLIST_PATH,
  I18N_GLOBS,
  readJson,
  collectLeaves,
  listLocaleFiles,
  buildTermMatcher,
  buildApprovedCompounds,
  runCheck1,
};

// Run the CLI only when this file is executed directly
// (`node scripts/check-terminology-i18n.mjs ...`), not when imported.
// realpathSync so a symlinked invocation still matches __filename (which node
// resolves to the real path when loading the entry module).
const invokedPath = (() => {
  if (!process.argv[1]) return "";
  const resolved = path.resolve(process.argv[1]);
  try {
    return fs.realpathSync(resolved);
  } catch {
    return resolved;
  }
})();
if (invokedPath === __filename) {
  process.exit(main());
}
