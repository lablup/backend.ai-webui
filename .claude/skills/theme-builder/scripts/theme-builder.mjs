#!/usr/bin/env node
/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// Helpers behind .claude/skills/theme-builder/SKILL.md. Run from anywhere:
//   node .claude/skills/theme-builder/scripts/theme-builder.mjs <command> ...
//
//   extract <url> [--json] [--scripts]  brand colour / font / logo candidates from a site
//   check <theme.json> [--json]         seed hex format + WCAG contrast per family
//   validate <theme.json>               JSON-schema validation against resources/theme.schema.json
//
// Pure functions are exported for scripts/theme-builder.test.mjs.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(HERE, "../../../..");
export const SCHEMA_PATH = resolve(REPO_ROOT, "resources/theme.schema.json");

// Surfaces the runtime pins: CARD_SURFACE in react/src/astryx-theme/backendAiTheme.ts
// and --color-on-accent, which is white in both schemes.
export const LIGHT_SURFACE = "#FFFFFF";
export const DARK_SURFACE = "#141414";
export const ON_ACCENT = "#FFFFFF";
const UI_MIN = 3; // WCAG AA for UI components / large text
const TEXT_MIN = 4.5; // WCAG AA for body text

// ---------- colour math ----------

const HEX6 = /^#[0-9a-f]{6}$/i;

export function normalizeHex(input) {
  if (typeof input !== "string") return null;
  const s = input.trim();
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(s);
  if (short)
    return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`.toUpperCase();
  if (HEX6.test(s)) return s.toUpperCase();
  const rgb =
    /^rgba?\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/i.exec(
      s,
    );
  if (rgb) {
    const alpha =
      rgb[4] === undefined
        ? 1
        : rgb[4].endsWith("%")
          ? parseFloat(rgb[4]) / 100
          : parseFloat(rgb[4]);
    if (alpha < 0.5) return null;
    return rgbToHex([+rgb[1], +rgb[2], +rgb[3]]);
  }
  return null;
}

export function isHex6(value) {
  return typeof value === "string" && HEX6.test(value);
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(rgb) {
  return `#${rgb
    .map((v) =>
      Math.round(Math.max(0, Math.min(255, v)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")
    .toUpperCase()}`;
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function rgbToHsl([r, g, b]) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}

function hslToRgb([h, s, l]) {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const hue = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    hue(p, q, h + 1 / 3) * 255,
    hue(p, q, h) * 255,
    hue(p, q, h - 1 / 3) * 255,
  ];
}

export function saturation(hex) {
  return rgbToHsl(hexToRgb(hex))[1];
}

/** Lighten a hex seed until it reads on the dark surface; null when no lightness works. */
export function suggestDarkSeed(lightHex) {
  const [h, s, l0] = rgbToHsl(hexToRgb(lightHex));
  for (let l = Math.max(l0, 0.3); l <= 0.9; l += 0.02) {
    const candidate = rgbToHex(hslToRgb([h, s, l]));
    if (
      contrastRatio(candidate, DARK_SURFACE) >= TEXT_MIN &&
      contrastRatio(candidate, ON_ACCENT) >= UI_MIN
    ) {
      return candidate;
    }
  }
  for (let l = Math.max(l0, 0.3); l <= 0.9; l += 0.02) {
    const candidate = rgbToHex(hslToRgb([h, s, l]));
    if (contrastRatio(candidate, DARK_SURFACE) >= TEXT_MIN) return candidate;
  }
  return null;
}

// ---------- validate ----------

function loadAjv() {
  // ajv is a devDependency of the react workspace, not of the root.
  const require = createRequire(resolve(REPO_ROOT, "react/package.json"));
  const mod = require("ajv");
  return mod.default ?? mod;
}

export function validateDocument(
  doc,
  schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf8")),
) {
  const Ajv = loadAjv();
  const validate = new Ajv({ allErrors: true }).compile(schema);
  const ok = validate(doc);
  const errors = (validate.errors ?? []).map((e) => {
    let message = e.message ?? "invalid";
    if (e.keyword === "additionalProperties")
      message = `unknown key "${e.params.additionalProperty}"`;
    if (e.keyword === "const")
      message = `must be ${JSON.stringify(e.params.allowedValue)}`;
    if (e.keyword === "enum")
      message = `must be one of ${JSON.stringify(e.params.allowedValues)}`;
    if (e.keyword === "pattern")
      message = `must match ${e.params.pattern} (6-digit hex)`;
    return { path: e.instancePath || "/", keyword: e.keyword, message };
  });
  // oneOf reports the tuple-vs-string alternatives plus a summary; keep the specific ones.
  const specific = errors.filter((e) => e.keyword !== "oneOf");
  return { ok: !!ok, errors: specific.length ? specific : errors };
}

// ---------- check ----------

function seedPair(value) {
  if (typeof value === "string")
    return { light: value, dark: value, tuple: false };
  if (Array.isArray(value))
    return { light: value[0], dark: value[1] ?? value[0], tuple: true };
  return null;
}

const STRICT_SEEDS = new Set(["accent", "link", "info"]);

export function checkDocument(doc) {
  const findings = [];
  const rows = [];
  const families = doc?.theme?.families ?? {};
  if (doc?.schemaVersion !== 2)
    findings.push({
      level: "error",
      path: "/schemaVersion",
      message: "must be 2",
    });
  if (!families.default)
    findings.push({
      level: "error",
      path: "/theme/families",
      message: 'a "default" family is required',
    });

  for (const [family, entry] of Object.entries(families)) {
    for (const [seed, value] of Object.entries(entry?.seeds ?? {})) {
      const path = `/theme/families/${family}/seeds/${seed}`;
      const pair = seedPair(value);
      if (!pair || !isHex6(pair.light) || !isHex6(pair.dark)) {
        findings.push({
          level: "error",
          path,
          message:
            "seed must be a 6-digit hex (#RRGGBB) or a [light, dark] tuple of them; anything else silently drops to the neutral palette",
        });
        continue;
      }
      const light = pair.light.toUpperCase();
      const dark = pair.dark.toUpperCase();
      const row = {
        family,
        seed,
        light,
        dark,
        lightOnSurface: contrastRatio(light, LIGHT_SURFACE),
        darkOnSurface: contrastRatio(dark, DARK_SURFACE),
        darkUnderWhite: contrastRatio(dark, ON_ACCENT),
        suggestedDark: null,
      };
      const level = STRICT_SEEDS.has(seed) ? "warn" : "info";
      if (row.lightOnSurface < UI_MIN) {
        findings.push({
          level,
          path,
          message: `light ${light} is ${row.lightOnSurface.toFixed(2)}:1 on white — white on-accent text and accent-coloured text need ≥ ${UI_MIN}:1 (≥ ${TEXT_MIN}:1 for body text)`,
        });
      }
      if (row.darkOnSurface < UI_MIN) {
        row.suggestedDark = suggestDarkSeed(light);
        findings.push({
          level,
          path,
          message: `dark ${dark} is ${row.darkOnSurface.toFixed(2)}:1 on ${DARK_SURFACE} — unreadable as accent text on the dark surface${row.suggestedDark ? `; try ${row.suggestedDark}` : ""}`,
        });
      } else if (row.darkUnderWhite < UI_MIN) {
        findings.push({
          level,
          path,
          message: `dark ${dark} is ${row.darkUnderWhite.toFixed(2)}:1 under white text — dark-scheme primary buttons keep white text`,
        });
      }
      if (
        !pair.tuple &&
        STRICT_SEEDS.has(seed) &&
        row.darkOnSurface < TEXT_MIN
      ) {
        row.suggestedDark ??= suggestDarkSeed(light);
        findings.push({
          level: "info",
          path,
          message: `single value reused for dark; a [light, dark] tuple${row.suggestedDark ? ` such as ["${light}", "${row.suggestedDark}"]` : ""} usually reads better`,
        });
      }
      rows.push(row);
    }
    const headerBg = entry?.headerBg;
    if (headerBg !== undefined) {
      const pair = seedPair(headerBg);
      for (const [scheme, value] of [
        ["light", pair?.light],
        ["dark", pair?.dark],
      ]) {
        const hex = normalizeHex(value);
        if (!hex) continue;
        findings.push({
          level: "info",
          path: `/theme/families/${family}/headerBg`,
          message: `${scheme} header ${hex}: white logo ${contrastRatio(hex, "#FFFFFF").toFixed(2)}:1, dark logo ${contrastRatio(hex, DARK_SURFACE).toFixed(2)}:1 — pick logo.src / logo.srcDark accordingly`,
        });
      }
    }
  }
  return { findings, rows };
}

// ---------- extract ----------

const COLOR_RE = /#(?:[0-9a-f]{6}|[0-9a-f]{3})\b|rgba?\([^)]*\)/gi;
const VAR_RE =
  /--([a-z0-9-]*(?:primary|brand|accent|main|point|key|theme)[a-z0-9-]*)\s*:\s*([^;}]+)/gi;
const FONT_RE = /font-family\s*:\s*([^;}]+)/gi;

function attr(tag, name) {
  const m = new RegExp(
    `\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i",
  ).exec(tag);
  return m ? (m[1] ?? m[2] ?? m[3]) : undefined;
}

function resolveUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return href;
  }
}

function contextOf(text, index) {
  const before = text.slice(Math.max(0, index - 60), index);
  const m = /([a-z-]+)\s*:\s*[^;{}]*$/i.exec(before);
  const prop = (m?.[1] ?? "").toLowerCase();
  if (prop.startsWith("background")) return "background";
  if (prop === "color" || prop === "fill") return "color";
  if (prop.startsWith("border") || prop === "stroke") return "border";
  return "other";
}

export function extractFromSources({
  html = "",
  baseUrl = "https://example.invalid/",
  cssTexts = [],
  scriptTexts = [],
}) {
  const inlineStyles = [
    ...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi),
  ].map((m) => m[1]);
  const styleAttrs = [...html.matchAll(/\bstyle\s*=\s*"([^"]*)"/gi)].map(
    (m) => m[1],
  );
  const sources = [...inlineStyles, ...styleAttrs, ...cssTexts, ...scriptTexts];

  const counts = new Map();
  for (const text of sources) {
    for (const m of text.matchAll(COLOR_RE)) {
      const hex = normalizeHex(m[0]);
      if (!hex) continue;
      const entry = counts.get(hex) ?? {
        hex,
        count: 0,
        contexts: { background: 0, color: 0, border: 0, other: 0 },
      };
      entry.count += 1;
      entry.contexts[contextOf(text, m.index)] += 1;
      counts.set(hex, entry);
    }
  }
  const all = [...counts.values()];
  const isGrey = (hex) =>
    saturation(hex) < 0.12 || luminance(hex) > 0.95 || luminance(hex) < 0.02;
  const colors = all
    .filter((c) => !isGrey(c.hex))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
  const greys = all
    .filter((c) => isGrey(c.hex))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const cssVars = [];
  for (const text of [...inlineStyles, ...cssTexts]) {
    for (const m of text.matchAll(VAR_RE)) {
      const value = m[2].trim();
      if (!cssVars.some((v) => v.name === m[1] && v.value === value))
        cssVars.push({ name: m[1], value });
    }
  }

  const fontCounts = new Map();
  for (const text of [...inlineStyles, ...cssTexts]) {
    for (const m of text.matchAll(FONT_RE)) {
      const first = m[1]
        .split(",")[0]
        .trim()
        .replace(/^['"]|['"]$/g, "");
      if (
        !first ||
        first.startsWith("var(") ||
        /^(inherit|initial|unset)$/i.test(first)
      )
        continue;
      fontCounts.set(first, (fontCounts.get(first) ?? 0) + 1);
    }
  }
  const fonts = [...fontCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([family, count]) => ({ family, count }));

  const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const meta = (key, byProperty = false) => {
    const tag = metaTags.find(
      (t) =>
        (attr(t, byProperty ? "property" : "name") ?? "").toLowerCase() === key,
    );
    return tag ? attr(tag, "content") : undefined;
  };
  const themeColor = meta("theme-color");
  const ogImage = meta("og:image", true);

  const logos = [];
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const src = attr(tag, "src") ?? attr(tag, "data-src");
    const hint = `${src ?? ""} ${attr(tag, "alt") ?? ""} ${attr(tag, "class") ?? ""} ${attr(tag, "id") ?? ""}`;
    if (src && /logo|brand/i.test(hint))
      logos.push({
        src: resolveUrl(src, baseUrl),
        alt: attr(tag, "alt") ?? "",
      });
  }
  const icons = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    const rel = (attr(tag, "rel") ?? "").toLowerCase();
    const href = attr(tag, "href");
    if (href && rel.includes("icon"))
      icons.push({ rel, href: resolveUrl(href, baseUrl) });
  }
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim();

  return {
    title,
    themeColor,
    ogImage: ogImage ? resolveUrl(ogImage, baseUrl) : undefined,
    cssVars,
    colors,
    greys,
    fonts,
    logos,
    icons,
  };
}

async function fetchText(url, { maxBytes = 2_000_000 } = {}) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(15_000),
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; backend.ai-webui theme-builder)",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return text.length > maxBytes ? text.slice(0, maxBytes) : text;
}

export async function extract(url, { scripts = false, log = () => {} } = {}) {
  const html = await fetchText(url);
  const hrefs = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = (attr(m[0], "rel") ?? "").toLowerCase();
    const href = attr(m[0], "href");
    if (href && rel.split(/\s+/).includes("stylesheet"))
      hrefs.push(resolveUrl(href, url));
  }
  const cssTexts = [];
  const fetched = new Set();
  const pull = async (href) => {
    if (fetched.has(href) || fetched.size >= 30) return;
    fetched.add(href);
    try {
      const css = await fetchText(href);
      cssTexts.push(css);
      for (const m of css.matchAll(/@import\s+(?:url\()?["']?([^"')\s;]+)/gi))
        await pull(resolveUrl(m[1], href));
    } catch (e) {
      log(`skip ${href}: ${e.message}`);
    }
  };
  for (const href of hrefs) await pull(href);

  const scriptTexts = [];
  if (scripts) {
    const srcs = [
      ...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi),
    ]
      .map((m) => resolveUrl(m[1], url))
      .slice(0, 20);
    for (const src of srcs) {
      try {
        scriptTexts.push(await fetchText(src));
      } catch (e) {
        log(`skip ${src}: ${e.message}`);
      }
    }
  }
  const result = extractFromSources({
    html,
    baseUrl: url,
    cssTexts,
    scriptTexts,
  });
  return {
    url,
    stylesheets: [...fetched],
    scriptsScanned: scriptTexts.length,
    ...result,
  };
}

// ---------- CLI ----------

function readJsonFile(path) {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8"));
}

function printExtract(r) {
  const lines = [
    `# ${r.title ?? r.url}`,
    `url: ${r.url}`,
    `stylesheets: ${r.stylesheets.length}${r.scriptsScanned ? `, scripts: ${r.scriptsScanned}` : ""}`,
  ];
  if (r.themeColor) lines.push(`theme-color: ${r.themeColor}`);
  if (r.cssVars.length) {
    lines.push("", "## brand-named CSS variables");
    for (const v of r.cssVars.slice(0, 20))
      lines.push(`  --${v.name}: ${v.value}`);
  }
  lines.push("", "## saturated colours (count · background/color/border)");
  for (const c of r.colors)
    lines.push(
      `  ${c.hex}  ${String(c.count).padStart(4)} · ${c.contexts.background}/${c.contexts.color}/${c.contexts.border}`,
    );
  if (r.greys.length)
    lines.push(
      "",
      "## greys",
      ...r.greys.map((c) => `  ${c.hex}  ${String(c.count).padStart(4)}`),
    );
  if (r.fonts.length)
    lines.push(
      "",
      "## fonts",
      ...r.fonts.map((f) => `  ${f.family}  ${f.count}`),
    );
  if (r.logos.length)
    lines.push(
      "",
      "## logo candidates",
      ...r.logos.map((l) => `  ${l.src}${l.alt ? `  (${l.alt})` : ""}`),
    );
  if (r.icons.length)
    lines.push(
      "",
      "## icons",
      ...r.icons.map((i) => `  ${i.href}  [${i.rel}]`),
    );
  if (r.ogImage) lines.push(`  ${r.ogImage}  [og:image]`);
  if (r.colors.length < 3)
    lines.push(
      "",
      "Few colours found — the site probably styles from JS bundles. Re-run with --scripts, or read computed styles in a browser (see SKILL.md).",
    );
  console.log(lines.join("\n"));
}

function printCheck({ findings, rows }) {
  console.log(
    "family      seed     light    dark     L/white  D/#141414  D/white",
  );
  for (const r of rows) {
    console.log(
      `${r.family.padEnd(11)} ${r.seed.padEnd(8)} ${r.light}  ${r.dark}  ${r.lightOnSurface.toFixed(2).padStart(7)}  ${r.darkOnSurface.toFixed(2).padStart(9)}  ${r.darkUnderWhite.toFixed(2).padStart(7)}`,
    );
  }
  if (findings.length) {
    console.log("");
    for (const f of findings)
      console.log(`${f.level.toUpperCase().padEnd(5)} ${f.path}: ${f.message}`);
  }
  const summary = { error: 0, warn: 0, info: 0 };
  for (const f of findings) summary[f.level] += 1;
  console.log(
    `\n${summary.error} error, ${summary.warn} warn, ${summary.info} info`,
  );
}

async function main(argv) {
  const [cmd, target, ...rest] = argv;
  const json = rest.includes("--json");
  if (cmd === "validate" && target) {
    const result = validateDocument(readJsonFile(target));
    if (json) console.log(JSON.stringify(result, null, 2));
    else if (result.ok)
      console.log(`OK: ${target} matches resources/theme.schema.json`);
    else for (const e of result.errors) console.log(`${e.path}: ${e.message}`);
    return result.ok ? 0 : 1;
  }
  if (cmd === "check" && target) {
    const result = checkDocument(readJsonFile(target));
    if (json) console.log(JSON.stringify(result, null, 2));
    else printCheck(result);
    return result.findings.some((f) => f.level === "error") ? 1 : 0;
  }
  if (cmd === "extract" && target) {
    const result = await extract(target, {
      scripts: rest.includes("--scripts"),
      log: (m) => console.error(m),
    });
    if (json) console.log(JSON.stringify(result, null, 2));
    else printExtract(result);
    return 0;
  }
  console.error(
    "usage: theme-builder.mjs extract <url> [--json] [--scripts] | check <theme.json> [--json] | validate <theme.json> [--json]",
  );
  return 2;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (err) => {
      console.error(`error: ${err.message}`);
      process.exit(1);
    },
  );
}
