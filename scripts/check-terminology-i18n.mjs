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
 * Two independent checks:
 *
 *   CHECK 1 (terminology drift, needs the termbase):
 *     Flags i18n VALUES (never keys) that contain a forbidden term from
 *     terminology.json `avoid[]`. Latin-script terms use whole-word matching;
 *     ko/ja/th terms use careful substring matching. Matches inside obvious
 *     identifiers / URLs / paths / config keys / backticked tokens / {{interp}}
 *     are skipped. An inline allowlist file silences legitimate strings.
 *
 *   CHECK 2 (key -> two-values divergence, needs NO termbase) — OFF by default:
 *     Within each i18n file, flags any leaf-key final segment that maps to two
 *     or more DIFFERENT string values across the file's namespaces. It surfaced
 *     real drift (AppProxy / AutoScalingRules / VFolder / ko ResourceGroup) but
 *     in its current segment-across-namespace form it also flags thousands of
 *     benign phrasing differences, so it is OFF by default — enable with
 *     --check2. List-only / report; never blocks. Refining it into a high-signal
 *     check (e.g. near-duplicate values only, or termbase-linked segments) is a
 *     tracked follow-up.
 *
 * Modes:
 *   (default)  WARN  — report findings, exit 0.
 *   --warn           — same as default (explicit).
 *   --strict         — exit non-zero when there are blocking (error-severity)
 *                      CHECK 1 findings. CHECK 2 is always report-only and never
 *                      affects the exit code. Non-English and context-qualified
 *                      terminology findings are WARN-severity (never block),
 *                      because they need human judgement.
 *
 * Other flags:
 *   --json           Emit machine-readable JSON instead of the text report.
 *   --check2         Enable CHECK 2 (OFF by default — see CHECK 2 note above).
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
 *          "ignoreSegments": ["Description", "Tooltip", ...]   // CHECK 2 only
 *        }
 *      Missing file => empty allowlist (no effect).
 *   2. An inline marker inside a VALUE: appending the literal token
 *      `[[i18n-term-ok]]` anywhere in a string value tells CHECK 1 to skip that
 *      value. (Used only when the canonical termbase genuinely cannot model the
 *      exception — prefer the allowlist file.)
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
 * @param {Array<{file:string,label:string,leaves:Array<{key:string,segment:string,value:string}>,lang:string}>} stores
 * @param {{ignoreSegments: Set<string>}} allow
 */
function runCheck2(stores, allow) {
  /** @type {Array<any>} */
  const findings = [];

  for (const store of stores) {
    // segment -> Map(value -> [keyPaths])
    /** @type {Map<string, Map<string, string[]>>} */
    const bySegment = new Map();
    for (const leaf of store.leaves) {
      if (allow.ignoreSegments.has(leaf.segment)) continue;
      let valMap = bySegment.get(leaf.segment);
      if (!valMap) {
        valMap = new Map();
        bySegment.set(leaf.segment, valMap);
      }
      let keys = valMap.get(leaf.value);
      if (!keys) {
        keys = [];
        valMap.set(leaf.value, keys);
      }
      keys.push(leaf.key);
    }

    for (const [segment, valMap] of bySegment) {
      if (valMap.size < 2) continue;
      const variants = [...valMap.entries()].map(([value, keys]) => ({
        value,
        keys,
      }));
      findings.push({
        check: "key-divergence",
        severity: "report", // always report-only; never affects exit code
        file: store.file,
        fileLabel: store.label,
        lang: store.lang,
        segment,
        distinct: valMap.size,
        variants,
      });
    }
  }

  // Sort highest-signal first: fewest distinct variants (near-duplicates like
  // "Auto-scaling Rules" vs "Auto Scaling Rules") rank above broad spreads, then
  // by file then segment for determinism.
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
// Reporting
// ---------------------------------------------------------------------------

function shorten(s, n = 120) {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}

function printTextReport(check1, check2, opts) {
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
        "CHECK 2 — key -> two-values divergence (report-only, no termbase)",
      ),
    );
    if (check2.length === 0) {
      console.log(c.dim("  no divergent final-segments found."));
    } else {
      // In --summary mode show only the top N highest-signal findings (fewest
      // distinct variants first; runCheck2 already sorted them that way).
      const shown =
        opts.limitCheck2 > 0 ? check2.slice(0, opts.limitCheck2) : check2;
      for (const f of shown) {
        console.log(
          `  ${c.yellow("report")} [${f.fileLabel}/${f.lang}] segment ${c.cyan(
            f.segment,
          )} -> ${f.distinct} distinct values`,
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
      c.dim(`  CHECK 2 summary: ${check2.length} divergent segments.`),
    );
    console.log("");
  }

  console.log(c.bold("=== TERMINOLOGY SUMMARY ==="));
  console.log(
    `  blocking terminology findings: ${errorCount}` +
      (opts.strict ? "" : c.dim("  (warn mode: not enforced)")),
  );
  console.log(`  warn-only terminology findings: ${warnCount}`);
  console.log(`  key-divergence findings (report): ${check2.length}`);
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
                                          [--no-check1] [--check2]

Modes:
  (default) / --warn   Report findings, always exit 0.
  --strict             Exit non-zero when there are blocking (error-severity)
                       CHECK 1 findings. CHECK 2 is always report-only.

Options:
  --summary            Cap CHECK 2 output at the top 20 highest-signal findings
                       (fewest distinct variants first). For the verify.sh step.
  --limit-check2=N     Cap CHECK 2 output at N findings (0 = unlimited).
  --lang=en,ko         Restrict scanning to these locale files only.
  --json               Machine-readable output (always full, never capped).
  --check2             Enable CHECK 2 (OFF by default — broad/noisy today).
  --no-check1          Skip CHECK 1 (terminology drift).

CHECK 1  Terminology drift: i18n VALUES (never keys) vs terminology.json avoid[].
CHECK 2  Key -> two-values divergence within each file (no termbase needed).
         OFF by default; enable with --check2. Currently low signal-to-noise.

Allowlist: scripts/terminology-i18n.allowlist.json (optional)
Inline marker: append ${INLINE_OK_MARKER} to a value to skip it in CHECK 1.
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
          },
          check1,
          check2,
        },
        null,
        2,
      ) + "\n",
    );
  } else {
    printTextReport(check1, check2, opts);
  }

  const blocking = check1.filter((f) => f.severity === "error").length;
  // CHECK 2 is always report-only and NEVER affects the exit code.
  if (opts.strict && blocking > 0) return 1;
  return 0;
}

process.exit(main());
