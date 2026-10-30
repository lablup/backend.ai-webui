#!/usr/bin/env node
/**
 * git merge driver for react/src/generated/searchIndex.json (ADR 0003).
 *
 *   merge.search-index.driver = node scripts/merge-search-index.mjs %O %A %B %P
 *
 * Merges the three index versions entry by entry (matched by `path`) and
 * writes the result into %A. The result is provisional: the index is a
 * function of the merged source, not of the three indexes, so on success the
 * driver leaves a marker that `scripts/check-search-index-drift.mjs` (husky
 * post-merge / post-rewrite) reads to say whether `pnpm run search-index` is
 * needed. Anything it cannot merge falls back to git's own line conflict.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  byString,
  compareEntries,
  compareSettings,
  compareTabs,
  serialize,
  settingId,
  tabId,
} from "../react/scripts/search-index-format.mjs";

export const STATE_DIR_NAME = "search-index-merge";
export const PENDING_FILE = "pending";
export const LOG_FILE = "log";

export class MergeConflict extends Error {}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** 3-way merge of one value; `undefined` means absent on that side. */
function mergeValue(base, ours, theirs, what) {
  if (same(ours, theirs)) return ours;
  if (same(ours, base)) return theirs;
  if (same(theirs, base)) return ours;
  throw new MergeConflict(`${what} changed on both sides`);
}

/** 3-way merge of a set of strings; never conflicts. */
function mergeSet(base = [], ours = [], theirs = []) {
  const b = new Set(base);
  const o = new Set(ours);
  const t = new Set(theirs);
  const out = new Set();
  for (const x of o) if (t.has(x) || !b.has(x)) out.add(x);
  for (const x of t) if (o.has(x) || !b.has(x)) out.add(x);
  return [...out].sort(byString);
}

/**
 * 3-way merge of a list of objects matched by `idOf`. A member both sides
 * still have goes through `mergeMember` (against `empty` when both added it);
 * otherwise `mergeValue` decides, so a removal meeting a change conflicts.
 */
function mergeMembers(base, ours, theirs, { idOf, mergeMember, empty, what }) {
  const index = (list) => new Map((list ?? []).map((m) => [idOf(m), m]));
  const b = index(base);
  const o = index(ours);
  const t = index(theirs);
  const out = [];
  for (const id of new Set([...o.keys(), ...t.keys(), ...b.keys()])) {
    const label = `${what} ${JSON.stringify(id)}`;
    const both = o.has(id) && t.has(id);
    const merged =
      both && (b.has(id) || empty)
        ? mergeMember(b.get(id) ?? empty, o.get(id), t.get(id), label)
        : mergeValue(b.get(id), o.get(id), t.get(id), label);
    if (merged !== undefined) out.push(merged);
  }
  return out;
}

/** Field order follows ours, then theirs: both came out of `serialize`. */
function mergeFields(base, ours, theirs, label, special) {
  const out = {};
  for (const field of new Set([...Object.keys(ours), ...Object.keys(theirs)])) {
    const merge = special[field];
    const value = merge
      ? merge(base[field], ours[field], theirs[field], `${label} ${field}`)
      : mergeValue(
          base[field],
          ours[field],
          theirs[field],
          `${label} ${field}`,
        );
    if (value !== undefined) out[field] = value;
  }
  return out;
}

const mergeSetting = (base, ours, theirs, label) =>
  mergeFields(base, ours, theirs, label, { descriptionKeys: mergeSet });

const mergeEntry = (base, ours, theirs, label) =>
  mergeFields(base, ours, theirs, label, {
    keys: mergeSet,
    tabs: (b, o, t, what) =>
      mergeMembers(b, o, t, {
        idOf: tabId,
        mergeMember: mergeValue,
        what,
      }).sort(compareTabs),
    settings: (b, o, t, what) =>
      mergeMembers(b, o, t, {
        idOf: settingId,
        mergeMember: mergeSetting,
        empty: { descriptionKeys: [] },
        what,
      }).sort(compareSettings),
  });

/** Throws `MergeConflict` for anything it will not decide on its own. */
export function mergeIndexes(base, ours, theirs) {
  if (base.version !== ours.version || ours.version !== theirs.version)
    throw new MergeConflict("index version differs");
  if (![base, ours, theirs].every((x) => Array.isArray(x.entries)))
    throw new MergeConflict("an index has no entries array");
  const { entries: baseEntries, ...baseRest } = base;
  const { entries: ourEntries, ...ourRest } = ours;
  const { entries: theirEntries, ...theirRest } = theirs;
  const top = mergeFields(baseRest, ourRest, theirRest, "index", {});
  const entries = mergeMembers(baseEntries, ourEntries, theirEntries, {
    idOf: (e) => e.path,
    mergeMember: mergeEntry,
    empty: { tabs: [], settings: [], keys: [] },
    what: "entry",
  });
  return { ...top, entries: entries.sort(compareEntries) };
}

export function mergeIndexTexts(baseText, oursText, theirsText) {
  const parse = (text, side) => {
    let value;
    try {
      value = JSON.parse(text);
    } catch {
      throw new MergeConflict(`${side} is not valid JSON`);
    }
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new MergeConflict(`${side} is not an index object`);
    return value;
  };
  return serialize(
    mergeIndexes(
      parse(baseText, "base"),
      parse(oursText, "ours"),
      parse(theirsText, "theirs"),
    ),
  );
}

function stateDir() {
  const r = spawnSync("git", ["rev-parse", "--absolute-git-dir"], {
    encoding: "utf8",
  });
  if (r.status !== 0) return null;
  return path.join(r.stdout.trim(), STATE_DIR_NAME);
}

export function appendLog(dir, outcome, file) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(
      path.join(dir, LOG_FILE),
      `${new Date().toISOString()}\t${outcome}\t${file}\n`,
    );
  } catch {
    // Measurement only; never fail a merge over it.
  }
}

function main([basePath, oursPath, theirsPath, file = ""]) {
  const dir = stateDir();
  try {
    const merged = mergeIndexTexts(
      fs.readFileSync(basePath, "utf8"),
      fs.readFileSync(oursPath, "utf8"),
      fs.readFileSync(theirsPath, "utf8"),
    );
    fs.writeFileSync(oursPath, merged);
    if (dir) {
      fs.mkdirSync(dir, { recursive: true });
      fs.appendFileSync(path.join(dir, PENDING_FILE), `${file}\n`);
      appendLog(dir, "resolved", file);
    }
    console.error(
      `search-index: merged ${file} provisionally; ` +
        "the post-merge/post-rewrite hook says if it needs `pnpm run search-index`",
    );
    return 0;
  } catch (e) {
    if (!(e instanceof MergeConflict)) throw e;
    if (dir) appendLog(dir, `fallback: ${e.message}`, file);
    console.error(
      `search-index: ${e.message}; leaving a normal conflict in ${file} ` +
        "(.claude/rules/search-index-conflicts.md)",
    );
    // Same markers git would have written without a driver.
    spawnSync(
      "git",
      [
        "merge-file",
        "-L",
        "ours",
        "-L",
        "base",
        "-L",
        "theirs",
        oursPath,
        basePath,
        theirsPath,
      ],
      { stdio: "ignore" },
    );
    return 1;
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  process.exitCode = main(process.argv.slice(2));
}
