/**
 * Unit tests for the PDF stylesheet generator (styles.ts).
 *
 * Run: pnpm --filter backend.ai-docs-toolkit test
 *
 * Coverage:
 *   - @font-face emission from resolved pdfFontFaces entries.
 *   - theme.fontFamily leading the body / :lang() stacks.
 *   - theme.coverTitleFontFamily scoped to .cover-title only.
 *   - defaults: no @font-face, no custom families when unconfigured.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "url";

import { generatePdfStyles } from "./styles.js";
import { defaultTheme, resolveTheme } from "./theme.js";

test("generatePdfStyles — default theme emits no @font-face and no custom family", () => {
  const css = generatePdfStyles(defaultTheme, "en");
  assert.ok(!css.includes("@font-face"));
  assert.match(
    css,
    /body \{\n  font-family: -apple-system/,
    "body stack should start with the built-in system fonts",
  );
});

test("generatePdfStyles — renders @font-face rules from pdfFontFaces", () => {
  const fontPath = "/abs/fonts/NanumSquareRegular.ttf";
  const css = generatePdfStyles(defaultTheme, "en", [
    { family: "NanumSquare", path: fontPath, weight: 400, style: "normal" },
    { family: "NanumSquare", path: "/abs/fonts/NanumSquareBold.ttf", weight: 700 },
  ]);
  const rules = css.match(/@font-face \{[^}]*\}/g) ?? [];
  assert.equal(rules.length, 2);
  assert.ok(rules[0].includes('font-family: "NanumSquare";'));
  assert.ok(rules[0].includes(`src: url("${pathToFileURL(fontPath).href}");`));
  assert.ok(rules[0].includes("font-weight: 400;"));
  assert.ok(rules[0].includes("font-style: normal;"));
  assert.ok(rules[1].includes("font-weight: 700;"));
  assert.ok(!rules[1].includes("font-style:"), "omitted style emits no descriptor");
});

test("generatePdfStyles — theme.fontFamily leads body and :lang() stacks", () => {
  const theme = resolveTheme({ fontFamily: "NanumSquare" });
  const css = generatePdfStyles(theme, "ko");
  const stacks = css.match(/font-family: "NanumSquare", -apple-system/g) ?? [];
  // body + :lang(ja) + :lang(th)
  assert.equal(stacks.length, 3);
});

test("generatePdfStyles — coverTitleFontFamily scoped to .cover-title", () => {
  const theme = resolveTheme({ coverTitleFontFamily: "NanumSquare" });
  const css = generatePdfStyles(theme, "en");
  const coverBlock = css.match(/\.cover-title \{[^}]*\}/)?.[0] ?? "";
  assert.ok(coverBlock.includes('font-family: "NanumSquare"'));
  // Body stack stays on the built-in fonts.
  assert.match(css, /body \{\n  font-family: -apple-system/);
});

test("generatePdfStyles — cover title falls back through theme.fontFamily", () => {
  const theme = resolveTheme({
    fontFamily: "BodyFace",
    coverTitleFontFamily: "CoverFace",
  });
  const css = generatePdfStyles(theme, "en");
  const coverBlock = css.match(/\.cover-title \{[^}]*\}/)?.[0] ?? "";
  assert.ok(coverBlock.includes('font-family: "CoverFace", "BodyFace",'));
  // The cover title keeps the built-in CJK fallback so a Latin-only custom
  // cover face does not render Hangul/Kana/Han as tofu.
  assert.ok(coverBlock.includes('"Noto Sans KR"'));
  assert.ok(coverBlock.includes("Helvetica, Arial, sans-serif"));
});
