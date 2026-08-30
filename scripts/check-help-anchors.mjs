#!/usr/bin/env node
/**
 * check-help-anchors.mjs — resolve every WEBUIHelpButton manual target
 * (FR-3773).
 *
 * The header's "?" button opens `{docPage}#{anchor}` on the hosted user
 * manual, from the hand-curated table in `react/src/helper/helpAnchors.json`.
 * Nothing tied that table to the manual, so a renamed heading silently turned
 * the button into a no-op scroll. This checker resolves each entry against the
 * ENGLISH manual sources in `packages/backend.ai-webui-docs/src/en` and exits 1
 * on a dead page or anchor.
 *
 * Why English only: `docPage` slugs and heading ids are derived from the
 * navigation PATH (identical in every language) and the heading TEXT (which is
 * translated). Only the English site can be checked by slug; the other
 * languages are the translators' concern.
 *
 * Anchor ids are replicated from backend.ai-docs-toolkit, which is TypeScript
 * and ships no build output in this workspace, so it cannot be imported from a
 * plain `node` script. `slugify` / `slugFromNavPath` / `stripHtmlTags` /
 * `decodeHtmlEntities` below are line-for-line ports of
 * `packages/backend.ai-docs-toolkit/src/markdown-processor.ts` and
 * `markdown-extensions.ts`; `check-help-anchors.test.ts` pins the parity
 * against real headings from the manual.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, "..");
const HELP_ANCHORS_PATH = path.join(
  REPO_ROOT,
  "react/src/helper/helpAnchors.json",
);
const DOCS_ROOT = path.join(REPO_ROOT, "packages/backend.ai-webui-docs/src");
const BOOK_CONFIG_PATH = path.join(DOCS_ROOT, "book.config.yaml");
const DOCS_LANG = "en";

// ── Ports of the docs-toolkit slug rules ──────────────────────────────

/** Port of `markdown-processor.ts` `slugify`. */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Port of `markdown-processor.ts` `RESERVED_HOME_SLUG`. `website-generator.ts`
 * rejects a chapter that claims it, so `buildManualIndex` does too.
 */
export const RESERVED_HOME_SLUG = "index";

/**
 * Port of `markdown-processor.ts` `slugFromNavPath`: the leaf basename,
 * lowercased, keeping `[a-z0-9_-]` and collapsing any other run — and any run
 * of `-` — into a single `-`.
 */
export function slugFromNavPath(navPath) {
  const base = path.basename(navPath, path.extname(navPath)).toLowerCase();
  let cleaned = "";
  let lastWasDash = false;
  for (const ch of base) {
    if (/[a-z0-9_-]/.test(ch)) {
      if (ch === "-") {
        if (!lastWasDash && cleaned.length > 0) cleaned += "-";
        lastWasDash = true;
      } else {
        cleaned += ch;
        lastWasDash = false;
      }
    } else {
      if (!lastWasDash && cleaned.length > 0) cleaned += "-";
      lastWasDash = true;
    }
  }
  while (cleaned.endsWith("-") || cleaned.endsWith("_")) {
    cleaned = cleaned.slice(0, -1);
  }
  if (!cleaned) {
    throw new Error(
      `Cannot derive a slug from navigation path "${navPath}": ` +
        "no [a-z0-9_-] characters in basename.",
    );
  }
  return cleaned;
}

/** Port of `markdown-extensions.ts` `stripHtmlTags`. */
export function stripHtmlTags(str) {
  let result = str;
  let prev;
  do {
    prev = result;
    result = result.replace(/<[^>]*>?/g, "");
  } while (result !== prev);
  return result;
}

/** Port of `markdown-extensions.ts` `decodeHtmlEntities`. */
export function decodeHtmlEntities(str) {
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (m, hex) => {
      const cp = parseInt(hex, 16);
      return cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : m;
    })
    .replace(/&#(\d+);/g, (m, dec) => {
      const cp = parseInt(dec, 10);
      return cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : m;
    })
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * Plain-text form of a markdown heading, matching what the toolkit's web
 * renderer feeds to `slugify` (marked renders inline markdown to HTML, then
 * `decodeHtmlEntities(stripHtmlTags(...))` flattens it). Link and image
 * syntax is unwrapped here because marked turns it into tags that
 * `stripHtmlTags` removes together with the URL.
 */
export function headingPlainText(rawHeading) {
  const unwrapped = rawHeading
    .replace(/^#{1,6}\s+/, "")
    .replace(/\s+#+\s*$/, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, "$1");
  return decodeHtmlEntities(stripHtmlTags(unwrapped)).trim();
}

/** In-page id the web build gives a heading: `<chapterSlug>-<slugify(text)>`. */
export const headingId = (chapterSlug, rawHeading) =>
  `${chapterSlug}-${slugify(headingPlainText(rawHeading))}`;

// ── Manual index ──────────────────────────────────────────────────────

/**
 * Whether a line can be the title half of a setext heading: a paragraph line,
 * not an ATX heading, a blockquote, a list item or a table row.
 */
const isSetextTitle = (line) =>
  line.trim() !== "" && !/^ {0,3}(#|>|[-*+] |\d+[.)] |\|)/.test(line);

/**
 * Every anchor id reachable on one chapter's page: heading ids (ATX and
 * setext) plus the explicit `<a id="…">` markers the sources carry (the
 * toolkit registers those verbatim, without the chapter prefix).
 */
export function collectAnchorIds(markdown, chapterSlug) {
  const ids = new Set();
  let inFence = false;
  let fenceMarker = "";
  let inFrontMatter = false;
  let previousLine = "";
  const lines = markdown.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (index === 0 && line.trim() === "---") {
      inFrontMatter = true;
      return;
    }
    if (inFrontMatter) {
      if (line.trim() === "---") inFrontMatter = false;
      return;
    }
    const fence = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (!inFence) {
        inFence = true;
        fenceMarker = fence[1][0];
      } else if (fence[1][0] === fenceMarker) {
        inFence = false;
      }
      previousLine = "";
      return;
    }
    if (inFence) {
      previousLine = "";
      return;
    }
    if (/^#{1,6}\s+\S/.test(line)) {
      ids.add(headingId(chapterSlug, line));
    } else if (/^ {0,3}(=+|-+) *$/.test(line) && isSetextTitle(previousLine)) {
      ids.add(headingId(chapterSlug, previousLine.trim()));
    }
    for (const match of line.matchAll(/<a\s+[^>]*?\bid="([^"]+)"/g)) {
      ids.add(match[1]);
    }
    previousLine = line;
  });
  return ids;
}

/**
 * The `path:` entries under `navigation.<lang>` in book.config.yaml. A
 * targeted slice rather than a YAML parse: `yaml` is a dependency of the docs
 * toolkit only and does not resolve from the repo root.
 */
export function readNavigationPaths(yamlText, lang) {
  const lines = yamlText.split(/\r?\n/);
  const start = lines.findIndex((line) => line === `  ${lang}:`);
  if (start === -1) return [];
  const paths = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line) || /^  \S/.test(line)) break;
    const match = line.match(/^\s*-?\s*path:\s*(\S+)\s*$/);
    if (match) paths.push(match[1]);
  }
  return paths;
}

/** Map of `<slug>.html` → { navPath, anchors } for the English manual. */
export function buildManualIndex({
  docsRoot = DOCS_ROOT,
  lang = DOCS_LANG,
  bookConfigPath = BOOK_CONFIG_PATH,
} = {}) {
  const navPaths = readNavigationPaths(
    fs.readFileSync(bookConfigPath, "utf8"),
    lang,
  );
  if (navPaths.length === 0) {
    throw new Error(
      `No navigation paths found for '${lang}' in ${bookConfigPath} — ` +
        "the config layout changed and this checker needs updating.",
    );
  }
  const index = new Map();
  for (const navPath of navPaths) {
    const slug = slugFromNavPath(navPath);
    if (slug === RESERVED_HOME_SLUG) {
      throw new Error(
        `Chapter slug "${RESERVED_HOME_SLUG}" is reserved for the home page ` +
          `(navigation path "${navPath}").`,
      );
    }
    const filePath = path.join(docsRoot, lang, navPath);
    if (!fs.existsSync(filePath)) continue;
    index.set(`${slug}.html`, {
      navPath,
      anchors: collectAnchorIds(fs.readFileSync(filePath, "utf8"), slug),
    });
  }
  return index;
}

// ── Resolution ────────────────────────────────────────────────────────

/** Human-readable label for an entry, for the failure list. */
const entryLabel = (entry) =>
  entry.tab
    ? `${entry.path || "(root)"}?tab=${entry.tab}`
    : entry.path || "(root)";

/**
 * Resolve every entry against the manual index. Returns one problem per dead
 * page or anchor; an empty array means every target resolves.
 */
export function checkEntries(entries, index) {
  const problems = [];
  for (const entry of entries) {
    const page = index.get(entry.docPage);
    if (!page) {
      problems.push({
        type: "missing-page",
        entry,
        message: `${entryLabel(entry)} → ${entry.docPage} — no manual source maps to this page`,
      });
      continue;
    }
    if (entry.anchor && !page.anchors.has(entry.anchor)) {
      problems.push({
        type: "missing-anchor",
        entry,
        message: `${entryLabel(entry)} → ${entry.docPage}#${entry.anchor} — no such anchor in ${page.navPath}`,
      });
    }
  }
  return problems;
}

function main() {
  const { entries } = JSON.parse(fs.readFileSync(HELP_ANCHORS_PATH, "utf8"));
  const index = buildManualIndex();
  const problems = checkEntries(entries, index);

  console.log(
    `Checked ${entries.length} help-anchor entries against ${index.size} ${DOCS_LANG} manual pages.`,
  );
  if (problems.length === 0) return 0;

  console.log(`\n${problems.length} dead help target(s):`);
  for (const problem of problems) console.log(`  ${problem.message}`);
  console.log(
    `\nFix react/src/helper/helpAnchors.json: point the entry at a real heading in ` +
      `packages/backend.ai-webui-docs/src/${DOCS_LANG}, or drop it if the section is gone.`,
  );
  return 1;
}

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
