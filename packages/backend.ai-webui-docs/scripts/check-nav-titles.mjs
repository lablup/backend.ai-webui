#!/usr/bin/env node
/**
 * check-nav-titles.mjs — guard against sidebar-label / page-H1 drift (FR-3276).
 *
 * The sidebar label for each manual page lives in `src/book.config.yaml`
 * (per language) while the page title is the markdown H1 — two sources
 * that historically drifted apart silently (e.g. the "Sessions All" label
 * for the "Compute Sessions" page, fixed in FR-3271/#8186).
 *
 * Policy encoded here:
 *   - The nav label is a SHORT navigation label; the H1 is the FULL
 *     descriptive title. They are allowed to differ BY DESIGN
 *     (e.g. "SFTP to Container" ↔ "SSH/SFTP Connection to a Compute
 *     Session"), never by accident.
 *   - "By design" is approximated as: the label and the H1 share a
 *     meaningful common substring (≥ 3 chars for Latin-script pairs,
 *     ≥ 2 chars when either side contains CJK/Thai). Pairs below the
 *     threshold are reported unless explicitly allowlisted.
 *
 * Usage: node scripts/check-nav-titles.mjs   (exit 1 on violations)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(pkgRoot, "src");

/**
 * Intentional label↔H1 pairs that legitimately share no common substring.
 * Key: `<lang>/<nav path>`; value: the exact nav label the exemption covers
 * (so a later label change re-triggers the check).
 */
const ALLOWLIST = new Map([
  // (none currently — add entries as `["en/foo/foo.md", "Label"],`)
]);

const cjkOrThai =
  /[ᄀ-ᇿ぀-ヿ㄰-㆏一-鿿가-힯฀-๿]/;

/** Lowercase and collapse everything that isn't a letter/number to single spaces. */
function normalize(s) {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Longest common substring length (O(n·m); titles are short). */
function lcsLength(a, b) {
  const m = a.length;
  const n = b.length;
  let best = 0;
  let prev = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    const cur = new Array(n + 1).fill(0);
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        cur[j] = prev[j - 1] + 1;
        if (cur[j] > best) best = cur[j];
      }
    }
    prev = cur;
  }
  return best;
}

function firstH1(markdown) {
  const m = markdown.match(/^# (.+)$/m);
  return m ? m[1].trim() : null;
}

function flattenNav(entries) {
  const out = [];
  for (const e of entries ?? []) {
    if (e && Array.isArray(e.items)) out.push(...flattenNav(e.items));
    else if (e && e.path) out.push({ title: e.title, path: e.path });
  }
  return out;
}

const config = parse(
  fs.readFileSync(path.join(srcDir, "book.config.yaml"), "utf8"),
);
const navigation = config?.navigation ?? {};

const violations = [];
let checked = 0;

for (const [lang, entries] of Object.entries(navigation)) {
  for (const { title, path: navPath } of flattenNav(entries)) {
    const mdFile = path.join(srcDir, lang, navPath);
    if (!fs.existsSync(mdFile)) {
      violations.push(`${lang}/${navPath}: file missing (nav label "${title}")`);
      continue;
    }
    const h1 = firstH1(fs.readFileSync(mdFile, "utf8"));
    if (!h1) {
      violations.push(`${lang}/${navPath}: no H1 found (nav label "${title}")`);
      continue;
    }
    checked++;

    const key = `${lang}/${navPath}`;
    if (ALLOWLIST.get(key) === title) continue;

    const a = normalize(title ?? "");
    const b = normalize(h1);
    if (a === b) continue;
    const threshold = cjkOrThai.test(a + b) ? 2 : 3;
    if (lcsLength(a, b) >= threshold) continue;

    violations.push(
      `${key}: nav label "${title}" shares nothing with H1 "${h1}" — ` +
        `rename one of them, or allowlist the pair in check-nav-titles.mjs if intentional`,
    );
  }
}

if (violations.length > 0) {
  console.error(`check-nav-titles: ${violations.length} violation(s):\n`);
  for (const v of violations) console.error(`  ✗ ${v}`);
  process.exit(1);
}
console.log(`check-nav-titles: OK (${checked} nav entries checked)`);
