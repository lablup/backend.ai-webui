#!/usr/bin/env node
// @ts-check
/**
 * generate-terminology.mjs
 *
 * Renders the term tables in TERMINOLOGY.md from terminology.json, which is the
 * single machine-readable source of truth. Only the regions between the
 * auto-generated markers are rewritten; all surrounding human prose is left
 * untouched.
 *
 * Markers:
 *   <!-- terminology:auto:concepts START --> ... <!-- terminology:auto:concepts END -->
 *   <!-- terminology:auto:avoid START -->    ... <!-- terminology:auto:avoid END -->
 *
 * Usage:
 *   node scripts/generate-terminology.mjs           # write TERMINOLOGY.md in place
 *   node scripts/generate-terminology.mjs --check    # exit non-zero if stale (CI)
 *
 * Dependency-free Node ESM (no yaml, no markdown libs).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, "..");
const JSON_PATH = join(PKG_ROOT, "terminology.json");
const MD_PATH = join(PKG_ROOT, "TERMINOLOGY.md");

// Stable, human-meaningful category order (matches the manual's section order).
const CATEGORY_ORDER = [
  "Core Concepts",
  "Feature-Specific Terms",
  "User Roles",
  "UI Navigation Terms",
];

// Language display labels for table headers.
const LANG_LABELS = {
  en: "EN",
  ko: "KO",
  ja: "JA",
  th: "TH",
};

const MARKERS = {
  concepts: {
    start: "<!-- terminology:auto:concepts START -->",
    end: "<!-- terminology:auto:concepts END -->",
  },
  avoid: {
    start: "<!-- terminology:auto:avoid START -->",
    end: "<!-- terminology:auto:avoid END -->",
  },
};

const EMPTY_CELL = "—";

/**
 * Escape a value for safe rendering inside a Markdown table cell.
 * Pipes would break the column layout; newlines would break the row.
 * @param {unknown} value
 * @returns {string}
 */
function cell(value) {
  if (value === undefined || value === null || value === "") return EMPTY_CELL;
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ");
}

/**
 * Stable comparator by a string key.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function byString(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Build one Markdown table for a single category's concepts.
 * @param {Array<any>} concepts already-filtered, already-sorted concepts in this category
 * @param {string[]} languages ordered list of language codes
 * @returns {string}
 */
function renderConceptTable(concepts, languages) {
  const hasContext = concepts.some(
    (c) => typeof c.context === "string" && c.context.length > 0,
  );
  const hasDescription = concepts.some(
    (c) => typeof c.description === "string" && c.description.length > 0,
  );
  const hasDecidingFR = concepts.some(
    (c) => typeof c.decidingFR === "string" && c.decidingFR.length > 0,
  );

  const headers = [
    "Concept",
    ...languages.map((l) => LANG_LABELS[l] ?? l.toUpperCase()),
  ];
  if (hasContext) headers.push("Context");
  if (hasDecidingFR) headers.push("Deciding FR");
  if (hasDescription) headers.push("Description");

  const lines = [];
  lines.push(`| ${headers.join(" | ")} |`);
  lines.push(`|${headers.map(() => "---").join("|")}|`);

  for (const c of concepts) {
    const row = [cell(c.id)];
    for (const lang of languages) {
      row.push(cell(c.preferred ? c.preferred[lang] : undefined));
    }
    if (hasContext) row.push(cell(c.context));
    if (hasDecidingFR) row.push(cell(c.decidingFR));
    if (hasDescription) row.push(cell(c.description));
    lines.push(`| ${row.join(" | ")} |`);
  }

  return lines.join("\n");
}

/**
 * Render the full concepts region (all categories) deterministically.
 * @param {any} data parsed terminology.json
 * @returns {string}
 */
function renderConcepts(data) {
  const languages = Array.isArray(data.languages)
    ? data.languages
    : ["en", "ko", "ja", "th"];

  // Resolve a deterministic category order: known categories first (in the
  // canonical order), then any unknown categories sorted alphabetically so the
  // output never silently drops a concept whose category we did not anticipate.
  const presentCategories = [...new Set(data.concepts.map((c) => c.category))];
  const orderedCategories = [
    ...CATEGORY_ORDER.filter((cat) => presentCategories.includes(cat)),
    ...presentCategories
      .filter((cat) => !CATEGORY_ORDER.includes(cat))
      .sort(byString),
  ];

  const sections = [];
  for (const category of orderedCategories) {
    const inCategory = data.concepts
      .filter((c) => c.category === category)
      // Stable, idempotent sort: approved before deprecated, then by id.
      .sort((a, b) => {
        const sa = a.status === "deprecated" ? 1 : 0;
        const sb = b.status === "deprecated" ? 1 : 0;
        if (sa !== sb) return sa - sb;
        return byString(a.id, b.id);
      });
    if (inCategory.length === 0) continue;
    sections.push(
      `### ${category}\n\n${renderConceptTable(inCategory, languages)}`,
    );
  }

  return sections.join("\n\n");
}

/**
 * Render the "Terms to Avoid" table.
 * Context qualifiers are folded into the Avoid cell as `term (context)` to match
 * the manual's historical presentation (e.g. "WSProxy (as a UI label)").
 * @param {any} data parsed terminology.json
 * @returns {string}
 */
function renderAvoid(data) {
  const rows = [...data.avoid].sort((a, b) => {
    const c = byString(String(a.avoid), String(b.avoid));
    if (c !== 0) return c;
    return byString(String(a.context ?? ""), String(b.context ?? ""));
  });

  const lines = [];
  lines.push("| Avoid | Use Instead | Reason |");
  lines.push("|---|---|---|");
  for (const r of rows) {
    const avoidLabel =
      typeof r.context === "string" && r.context.length > 0
        ? `${r.avoid} (${r.context})`
        : String(r.avoid);
    lines.push(
      `| ${cell(avoidLabel)} | ${cell(r.useInstead)} | ${cell(r.reason)} |`,
    );
  }
  return lines.join("\n");
}

/**
 * Replace the content between a START/END marker pair, preserving the markers
 * and everything outside them. Throws if either marker is missing.
 * @param {string} md
 * @param {{start: string, end: string}} marker
 * @param {string} body
 * @returns {string}
 */
function replaceRegion(md, marker, body) {
  const startIdx = md.indexOf(marker.start);
  const endIdx = md.indexOf(marker.end);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(
      `Missing marker(s) in TERMINOLOGY.md: expected "${marker.start}" and "${marker.end}". ` +
        `Add the markers around the region to be generated.`,
    );
  }
  if (endIdx < startIdx) {
    throw new Error(
      `Marker order inverted in TERMINOLOGY.md: "${marker.end}" appears before "${marker.start}".`,
    );
  }
  const before = md.slice(0, startIdx + marker.start.length);
  const after = md.slice(endIdx);
  // Always surround the generated body with single blank lines so the Markdown
  // renders correctly and the output is idempotent.
  return `${before}\n\n${body}\n\n${after}`;
}

/**
 * Produce the fully-generated TERMINOLOGY.md content from current on-disk md +
 * terminology.json.
 * @param {string} md current TERMINOLOGY.md content
 * @param {any} data parsed terminology.json
 * @returns {string}
 */
function generate(md, data) {
  let out = md;
  out = replaceRegion(out, MARKERS.concepts, renderConcepts(data));
  out = replaceRegion(out, MARKERS.avoid, renderAvoid(data));
  return out;
}

/**
 * Compute a small unified-ish diff summary for the --check failure message.
 * Dependency-free: reports the first differing line.
 * @param {string} expected
 * @param {string} actual
 * @returns {string}
 */
function firstDiff(expected, actual) {
  const e = expected.split("\n");
  const a = actual.split("\n");
  const max = Math.max(e.length, a.length);
  for (let i = 0; i < max; i++) {
    if (e[i] !== a[i]) {
      return [
        `First difference at line ${i + 1}:`,
        `  on-disk:   ${JSON.stringify(a[i] ?? "<missing>")}`,
        `  generated: ${JSON.stringify(e[i] ?? "<missing>")}`,
      ].join("\n");
    }
  }
  return "Files differ in length but share a common prefix.";
}

function main() {
  const check = process.argv.includes("--check");

  let data;
  try {
    data = JSON.parse(readFileSync(JSON_PATH, "utf8"));
  } catch (err) {
    console.error(`Failed to read/parse ${JSON_PATH}: ${err.message}`);
    process.exit(2);
  }

  let md;
  try {
    md = readFileSync(MD_PATH, "utf8");
  } catch (err) {
    console.error(`Failed to read ${MD_PATH}: ${err.message}`);
    process.exit(2);
  }

  let next;
  try {
    next = generate(md, data);
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }

  if (check) {
    if (next !== md) {
      console.error(
        "TERMINOLOGY.md is out of date with terminology.json.\n" +
          "Run `pnpm run build:terminology` (in packages/backend.ai-webui-docs) to regenerate.\n" +
          firstDiff(next, md),
      );
      process.exit(1);
    }
    console.log("TERMINOLOGY.md is up to date with terminology.json.");
    return;
  }

  if (next !== md) {
    writeFileSync(MD_PATH, next, "utf8");
    console.log("Regenerated TERMINOLOGY.md from terminology.json.");
  } else {
    console.log("TERMINOLOGY.md already up to date; no changes written.");
  }
}

main();
