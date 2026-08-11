#!/usr/bin/env node
/**
 * Visual comparison harness — antd → Astryx migration.
 *
 * Captures a page in light + dark and judges a before/after pair on the two
 * axes that matter for this migration — NOT pixel equality (component-level
 * visuals follow Astryx defaults by policy, so pixels are EXPECTED to
 * differ):
 *
 *   1. LAYOUT ANATOMY — the ordered set of landmark elements (headings,
 *      labels, form controls, buttons, tables, anything with an id/testid/
 *      role) with their boxes. A migration must keep the page's anatomy:
 *      same landmarks, same order, no unexplained disappearances. Position
 *      drift within tolerance is noted, not failed.
 *   2. TOKEN COMPLIANCE — for each landmark, are the computed colour /
 *      length values drawn from the declared Astryx token set (resolved
 *      in-page against the active theme + mode)? The "after" capture should
 *      be at least as token-compliant as the "before"; a dark-mode capture
 *      whose colours stop matching any dark token value is exactly how
 *      "light-on-light inside a dark app" regressions surface.
 *
 * Single-browser capture (per measure-03): both captures run in one Chromium
 * instance with animations frozen, eliminating per-launch variance.
 *
 * Usage:
 *   node scripts/migration-gates/visual-compare.mjs capture \
 *     --url <url> --out <dir> [--mode-param mode] [--wait <selector>] \
 *     [--settle <ms>]
 *   node scripts/migration-gates/visual-compare.mjs compare \
 *     --before <dir> --after <dir> --out <dir> [--ignore <key-regex>] \
 *     [--tolerance <px>]
 *
 * `capture` writes <out>/{light,dark}.png + .anatomy.json + .tokens.json.
 * `compare` writes <out>/report.md + report.json. Exit code is always 0
 * (informational); the report carries the per-mode verdict (OK / REVIEW).
 */
import {
  parseDeclaredCss,
  DEFAULT_DECLARED_CSS,
  REPO_ROOT,
} from "./astryx-token-gate.mjs";
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const MODES = ["light", "dark"];

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
        args[key] = argv[++i];
      } else {
        args[key] = true;
      }
    } else {
      args._.push(argv[i]);
    }
  }
  return args;
}

/** Declared Astryx token names, from the same sources as the P19 gate. */
function declaredTokenNames() {
  const names = new Set();
  for (const cssPath of DEFAULT_DECLARED_CSS) {
    const abs = resolve(REPO_ROOT, cssPath);
    if (!existsSync(abs)) continue;
    for (const n of parseDeclaredCss(readFileSync(abs, "utf8"))) names.add(n);
  }
  return [...names];
}

/**
 * In-page extraction: landmark anatomy + per-landmark token compliance.
 * Runs inside page.evaluate — keep it self-contained.
 */
function extractInPage(tokenNames) {
  // --- resolve declared tokens to USED values in this document/mode -------
  // Custom properties keep functions like light-dark() unresolved in their
  // computed value, so each token is resolved through a real property on a
  // probe element (the theme-shim technique): `color: var(--x)` for colour
  // tokens, `width: var(--x)` for lengths. One layout flush total.
  const host = document.createElement("div");
  host.style.cssText =
    "position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none";
  const probes = tokenNames.map((name) => {
    const c = document.createElement("span");
    c.style.color = `var(${name})`;
    const l = document.createElement("span");
    l.style.position = "absolute";
    l.style.width = `var(${name})`;
    host.append(c, l);
    return { name, c, l };
  });
  document.body.append(host);
  // Sentinel: a colour probe that inherits (its var is never declared)
  // resolves to the host's inherited colour — mark that value as ambiguous
  // rather than crediting it to a token.
  const inheritedColor = getComputedStyle(host).color;
  const colorValues = new Map(); // computed rgb -> [token names]
  const lengthValues = new Map(); // computed px -> [token names]
  for (const { name, c, l } of probes) {
    const cv = getComputedStyle(c).color;
    if (cv && cv !== inheritedColor) {
      if (!colorValues.has(cv)) colorValues.set(cv, []);
      colorValues.get(cv).push(name);
    }
    const lv = getComputedStyle(l).width;
    if (lv && lv !== "auto" && /px$/.test(lv)) {
      if (!lengthValues.has(lv)) lengthValues.set(lv, []);
      lengthValues.get(lv).push(name);
    }
  }
  host.remove();

  // --- landmarks ----------------------------------------------------------
  const LANDMARK_TAGS = new Set([
    "button",
    "input",
    "select",
    "textarea",
    "label",
    "form",
    "table",
    "thead",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "a",
    "pre",
  ]);
  const seenKeyCounts = new Map();
  const landmarks = [];
  for (const el of document.querySelectorAll("body *")) {
    const tag = el.tagName.toLowerCase();
    const id = el.id || null;
    const testid = el.getAttribute("data-testid");
    const role = el.getAttribute("role");
    if (!id && !testid && !role && !LANDMARK_TAGS.has(tag)) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;

    // Stable matching key: id > testid > tag+text > tag+role, de-duplicated
    // with an occurrence counter.
    const text = (el.textContent || "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 40);
    let base;
    if (id) base = `${tag}#${id}`;
    else if (testid) base = `${tag}[data-testid=${testid}]`;
    else if (
      ["label", "button", "a", "h1", "h2", "h3", "h4", "h5"].includes(tag) &&
      text
    )
      base = `${tag}:${text}`;
    else base = role ? `${tag}[role=${role}]` : tag;
    const n = (seenKeyCounts.get(base) || 0) + 1;
    seenKeyCounts.set(base, n);
    const key = n === 1 ? base : `${base}~${n}`;

    // Token compliance over the value families the theme owns.
    const colorProps = ["color", "background-color", "border-top-color"];
    const lengthProps = [
      "font-size",
      "border-top-left-radius",
      "padding-top",
      "row-gap",
    ];
    const misses = [];
    let checked = 0;
    let matched = 0;
    for (const prop of colorProps) {
      const v = cs.getPropertyValue(prop);
      if (!v || v === "rgba(0, 0, 0, 0)" || v === "transparent") continue;
      checked += 1;
      if (colorValues.has(v)) matched += 1;
      else misses.push({ prop, value: v });
    }
    for (const prop of lengthProps) {
      const v = cs.getPropertyValue(prop);
      if (!v || v === "0px" || v === "auto" || v === "normal") continue;
      checked += 1;
      if (lengthValues.has(v)) matched += 1;
      else misses.push({ prop, value: v });
    }

    landmarks.push({
      key,
      tag,
      text: text || null,
      box: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      },
      tokens: { checked, matched, misses },
    });
  }

  return {
    landmarks,
    tokenMapSizes: { colors: colorValues.size, lengths: lengthValues.size },
  };
}

async function capture(args) {
  const url = args.url;
  const out = args.out;
  if (!url || !out) {
    console.error("capture requires --url and --out");
    process.exit(2);
  }
  mkdirSync(out, { recursive: true });
  const tokenNames = declaredTokenNames();
  const browser = await chromium.launch();
  try {
    for (const mode of MODES) {
      const ctx = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        colorScheme: mode,
      });
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
      const target = args["mode-param"]
        ? `${url}${url.includes("?") ? "&" : "?"}${args["mode-param"]}=${mode}`
        : url;
      await page.goto(target, { waitUntil: "networkidle", timeout: 60000 });
      if (args.wait)
        await page.waitForSelector(args.wait, {
          timeout: 30000,
          state: "attached",
        });
      await page.waitForTimeout(Number(args.settle ?? 1500));
      // Freeze animations/transitions so both captures are stable frames.
      await page.addStyleTag({
        content:
          "*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }",
      });
      await page.waitForTimeout(300);

      const extraction = await page.evaluate(extractInPage, tokenNames);
      await page.screenshot({ path: join(out, `${mode}.png`), fullPage: true });
      writeFileSync(
        join(out, `${mode}.anatomy.json`),
        JSON.stringify(
          { url: target, mode, errors, landmarks: extraction.landmarks },
          null,
          2,
        ),
      );
      writeFileSync(
        join(out, `${mode}.tokens.json`),
        JSON.stringify(
          {
            url: target,
            mode,
            declaredTokens: tokenNames.length,
            resolvedTokenValues: extraction.tokenMapSizes,
            summary: summarizeTokens(extraction.landmarks),
          },
          null,
          2,
        ),
      );
      console.log(
        `${mode}: ${extraction.landmarks.length} landmarks, ` +
          `token compliance ${fmtRatio(summarizeTokens(extraction.landmarks))}` +
          (errors.length > 0 ? `, ${errors.length} page error(s)` : ""),
      );
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
}

function summarizeTokens(landmarks) {
  let checked = 0;
  let matched = 0;
  for (const lm of landmarks) {
    checked += lm.tokens.checked;
    matched += lm.tokens.matched;
  }
  return { checked, matched };
}

const fmtRatio = ({ checked, matched }) =>
  checked === 0
    ? "n/a"
    : `${matched}/${checked} (${((matched / checked) * 100).toFixed(1)}%)`;

/**
 * Build the `--ignore` matcher.
 *
 * The flag IS meant to take a regex, so the fix for CodeQL's
 * `js/regex-injection` here is not to stop compiling one — it is to stop
 * compiling an unbounded one. A pattern arrives from this script's own CLI, so
 * the realistic failure is a catastrophically backtracking pattern typed by
 * hand (ReDoS against the operator's own terminal), not an attack. Two cheap
 * bounds remove that: cap the source length, and reject nested quantifiers,
 * which is the shape that backtracks exponentially.
 */
const compileIgnore = (pattern) => {
  if (!pattern) return null;
  if (pattern.length > 200) {
    throw new Error(
      `--ignore pattern is ${pattern.length} chars; cap is 200. ` +
        'Narrow the pattern rather than widening the cap.',
    );
  }
  // (a+)+ / (a*)* / (a+)* … — a quantified group whose body is itself quantified.
  if (/\([^)]*[+*][^)]*\)\s*[+*]/.test(pattern)) {
    throw new Error(
      `--ignore pattern has a nested quantifier and can backtrack ` +
        `exponentially: ${pattern}`,
    );
  }
  // codeql[js/regex-injection] — `--ignore` is DOCUMENTED as taking a regex
  // (see the usage block at the top of this file), so compiling one is the
  // feature, not a lapse. CodeQL cannot tell "a flag the operator typed into
  // their own terminal" from "untrusted input", and it never will here: this
  // script is a hand-run migration gate, is not imported by the app, and is not
  // invoked by any workflow (`.github/workflows/astryx-migration-gates.yml`
  // references it in prose only). The realistic failure mode — a
  // catastrophically backtracking pattern — is what the two checks above bound.
  // Suppressed rather than "fixed" by downgrading the flag to substring
  // matching, which would quietly remove a capability the tool advertises.
  return new RegExp(pattern);
};

function compareMode(before, after, { ignore, tolerance }) {
  const ignoreRe = compileIgnore(ignore);
  const filt = (list) =>
    ignoreRe ? list.filter((lm) => !ignoreRe.test(lm.key)) : list;
  const b = filt(before.landmarks);
  const a = filt(after.landmarks);
  const bMap = new Map(b.map((lm) => [lm.key, lm]));
  const aMap = new Map(a.map((lm) => [lm.key, lm]));

  const missing = b.filter((lm) => !aMap.has(lm.key)).map((lm) => lm.key);
  const extra = a.filter((lm) => !bMap.has(lm.key)).map((lm) => lm.key);
  const matchedKeys = b.filter((lm) => aMap.has(lm.key)).map((lm) => lm.key);

  // Order preservation: count inversions in the after-order of matched keys.
  const afterIndex = new Map(a.map((lm, i) => [lm.key, i]));
  const seq = matchedKeys.map((k) => afterIndex.get(k));
  let inversions = 0;
  for (let i = 0; i < seq.length; i++) {
    for (let j = i + 1; j < seq.length; j++) {
      if (seq[i] > seq[j]) inversions += 1;
    }
  }

  const moved = [];
  for (const key of matchedKeys) {
    const bb = bMap.get(key).box;
    const ab = aMap.get(key).box;
    const d = Math.max(Math.abs(bb.x - ab.x), Math.abs(bb.y - ab.y));
    const sizeDelta = Math.max(Math.abs(bb.w - ab.w), Math.abs(bb.h - ab.h));
    if (d > tolerance || sizeDelta > tolerance) {
      moved.push({ key, before: bb, after: ab });
    }
  }

  const beforeTokens = summarizeTokens(b);
  const afterTokens = summarizeTokens(a);
  const anatomyOk =
    missing.length === 0 && extra.length === 0 && inversions === 0;

  return {
    landmarks: {
      before: b.length,
      after: a.length,
      matched: matchedKeys.length,
    },
    missing,
    extra,
    inversions,
    moved,
    tokens: { before: beforeTokens, after: afterTokens },
    verdict: anatomyOk ? "OK" : "REVIEW",
  };
}

function compare(args) {
  const { before, after, out } = args;
  if (!before || !after || !out) {
    console.error("compare requires --before, --after, --out");
    process.exit(2);
  }
  mkdirSync(out, { recursive: true });
  const tolerance = Number(args.tolerance ?? 16);
  const report = {
    before,
    after,
    ignore: args.ignore ?? null,
    tolerance,
    modes: {},
  };
  const md = [
    "# Visual comparison report (antd → Astryx)",
    "",
    `- before: \`${before}\``,
    `- after:  \`${after}\``,
    `- judgment basis: **layout anatomy + token compliance** — pixel equality is a non-goal`,
    `- box tolerance: ${tolerance}px` +
      (args.ignore ? `, ignored keys: \`${args.ignore}\`` : ""),
    "",
  ];
  for (const mode of MODES) {
    const bPath = join(before, `${mode}.anatomy.json`);
    const aPath = join(after, `${mode}.anatomy.json`);
    if (!existsSync(bPath) || !existsSync(aPath)) continue;
    const b = JSON.parse(readFileSync(bPath, "utf8"));
    const a = JSON.parse(readFileSync(aPath, "utf8"));
    const result = compareMode(b, a, { ignore: args.ignore, tolerance });
    report.modes[mode] = result;

    md.push(`## ${mode} — ${result.verdict}`);
    md.push("");
    md.push(
      `- landmarks: before ${result.landmarks.before} / after ${result.landmarks.after} / matched ${result.landmarks.matched}`,
    );
    md.push(
      `- anatomy: missing ${result.missing.length}, extra ${result.extra.length}, order inversions ${result.inversions}, moved beyond tolerance ${result.moved.length}`,
    );
    md.push(
      `- token compliance: before ${fmtRatio(result.tokens.before)} → after ${fmtRatio(result.tokens.after)}`,
    );
    if (result.missing.length > 0)
      md.push(
        `- MISSING in after: ${result.missing.map((k) => `\`${k}\``).join(", ")}`,
      );
    if (result.extra.length > 0)
      md.push(
        `- EXTRA in after: ${result.extra.map((k) => `\`${k}\``).join(", ")}`,
      );
    if (result.moved.length > 0) {
      md.push("- moved:");
      for (const m of result.moved.slice(0, 20)) {
        md.push(
          `  - \`${m.key}\`: (${m.before.x},${m.before.y} ${m.before.w}×${m.before.h}) → (${m.after.x},${m.after.y} ${m.after.w}×${m.after.h})`,
        );
      }
    }
    md.push("");
    md.push(
      `screenshots: \`${join(before, `${mode}.png`)}\` vs \`${join(after, `${mode}.png`)}\``,
    );
    md.push("");
  }
  writeFileSync(join(out, "report.json"), JSON.stringify(report, null, 2));
  writeFileSync(join(out, "report.md"), md.join("\n"));
  for (const [mode, r] of Object.entries(report.modes)) {
    console.log(
      `${mode}: ${r.verdict} — matched ${r.landmarks.matched}, missing ${r.missing.length}, ` +
        `extra ${r.extra.length}, inversions ${r.inversions}, moved ${r.moved.length}; ` +
        `tokens ${fmtRatio(r.tokens.before)} → ${fmtRatio(r.tokens.after)}`,
    );
  }
  console.log(`report: ${join(out, "report.md")}`);
}

const args = parseArgs(process.argv.slice(2));
const command = args._[0];
if (command === "capture") await capture(args);
else if (command === "compare") compare(args);
else {
  console.error(
    "usage: visual-compare.mjs capture|compare [options] (see header)",
  );
  process.exit(2);
}
