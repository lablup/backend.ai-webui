// Run: node --test .claude/skills/theme-builder/scripts/theme-builder.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

import {
  REPO_ROOT,
  checkDocument,
  contrastRatio,
  extractFromSources,
  normalizeHex,
  suggestDarkSeed,
  validateDocument,
} from "./theme-builder.mjs";

const shipped = () =>
  JSON.parse(readFileSync(resolve(REPO_ROOT, "resources/theme.json"), "utf8"));

test("normalizeHex accepts short hex, long hex and rgb()", () => {
  assert.equal(normalizeHex("#abc"), "#AABBCC");
  assert.equal(normalizeHex("#ff7a00"), "#FF7A00");
  assert.equal(normalizeHex("rgb(255, 0, 0)"), "#FF0000");
  assert.equal(normalizeHex("rgba(255, 0, 0, 0.2)"), null);
  assert.equal(normalizeHex("var(--x)"), null);
});

test("contrastRatio matches WCAG reference values", () => {
  assert.ok(Math.abs(contrastRatio("#FFFFFF", "#000000") - 21) < 0.01);
  assert.ok(Math.abs(contrastRatio("#FFFFFF", "#FFFFFF") - 1) < 0.001);
});

test("suggestDarkSeed lightens until it reads on the dark surface", () => {
  const dark = suggestDarkSeed("#0054E3");
  assert.match(dark, /^#[0-9A-F]{6}$/);
  assert.ok(contrastRatio(dark, "#141414") >= 4.5);
});

test("validateDocument accepts the shipped resources/theme.json", () => {
  const result = validateDocument(shipped());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
});

test("validateDocument rejects a v1 document with the offending paths", () => {
  const result = validateDocument({
    light: { token: { colorPrimary: "#FF7A00" } },
  });
  assert.equal(result.ok, false);
  assert.ok(
    result.errors.some(
      (e) => e.path === "/" && /schemaVersion/.test(e.message),
    ),
  );
  assert.ok(
    result.errors.some((e) => e.message.includes('unknown key "light"')),
  );
});

test("validateDocument rejects a non-hex seed", () => {
  const result = validateDocument({
    schemaVersion: 2,
    theme: { families: { default: { seeds: { accent: "orange" } } } },
  });
  assert.equal(result.ok, false);
  assert.ok(
    result.errors.some(
      (e) => e.path === "/theme/families/default/seeds/accent",
    ),
  );
});

test("checkDocument passes the shipped document without errors", () => {
  const { findings, rows } = checkDocument(shipped());
  assert.equal(findings.filter((f) => f.level === "error").length, 0);
  assert.ok(rows.some((r) => r.family === "default" && r.seed === "accent"));
});

test("checkDocument flags a pale accent and a dark value that vanishes on #141414", () => {
  const { findings } = checkDocument({
    schemaVersion: 2,
    theme: {
      families: {
        default: { seeds: { accent: ["#FFFF00", "#101010"], error: "red" } },
      },
    },
  });
  assert.ok(
    findings.some(
      (f) =>
        f.level === "warn" &&
        f.path.endsWith("/accent") &&
        /on white/.test(f.message),
    ),
  );
  assert.ok(
    findings.some(
      (f) =>
        f.level === "warn" &&
        f.path.endsWith("/accent") &&
        /#141414/.test(f.message),
    ),
  );
  assert.ok(
    findings.some((f) => f.level === "error" && f.path.endsWith("/error")),
  );
});

test("extractFromSources ranks brand colours, variables, fonts and logos", () => {
  const html = `<html><head><title>Acme Cloud</title>
    <meta name="theme-color" content="#123456">
    <link rel="icon" href="/favicon.ico">
    <style>:root{--brand-primary:#123456}.btn{background:#123456;color:#fff}a{color:#123456}body{font-family:"Pretendard",sans-serif}</style>
    </head><body><img src="/img/logo.svg" alt="Acme logo"><img src="/img/hero.jpg" alt="hero"></body></html>`;
  const r = extractFromSources({
    html,
    baseUrl: "https://acme.example/",
    cssTexts: [".card{border:1px solid #eeeeee}.cta{background:#123456}"],
  });
  assert.equal(r.title, "Acme Cloud");
  assert.equal(r.themeColor, "#123456");
  assert.equal(r.colors[0].hex, "#123456");
  assert.equal(r.colors[0].count, 4);
  assert.equal(r.colors[0].contexts.background, 2);
  assert.equal(r.colors[0].contexts.color, 1);
  assert.deepEqual(r.cssVars, [{ name: "brand-primary", value: "#123456" }]);
  assert.equal(r.fonts[0].family, "Pretendard");
  assert.deepEqual(r.logos, [
    { src: "https://acme.example/img/logo.svg", alt: "Acme logo" },
  ]);
  assert.equal(r.icons[0].href, "https://acme.example/favicon.ico");
  assert.ok(r.greys.some((g) => g.hex === "#EEEEEE"));
});
