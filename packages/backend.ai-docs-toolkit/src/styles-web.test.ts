/**
 * Unit tests for the website stylesheet generator (styles-web.ts).
 *
 * Run: pnpm --filter backend.ai-docs-toolkit test
 *
 * Coverage:
 *   - The ultrawide shell cap: --bai-layout-max is defined and .doc-page is
 *     capped and centered by it.
 *   - The rail grid: the two full-bleed sticky bars (topbar, version banner)
 *     inset their content by centering-gutter + --bai-rail-inset, so the
 *     brand and the banner icon stay on the sider's grid line at every
 *     viewport width instead of shifting as the cap is crossed.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { generateWebsiteStyles } from "./styles-web.js";

/** Extract the body of the first rule whose selector matches exactly. */
function ruleBody(css: string, selector: string): string {
  const idx = css.indexOf(`\n${selector} {`);
  assert.notEqual(idx, -1, `expected a "${selector}" rule in the stylesheet`);
  const start = css.indexOf("{", idx);
  const end = css.indexOf("}", start);
  return css.slice(start + 1, end);
}

test("generateWebsiteStyles — defines the ultrawide shell cap token", () => {
  const css = generateWebsiteStyles();
  assert.match(
    css,
    /--bai-layout-max:\s*1536px;/,
    "the shell cap token should be declared on :root",
  );
});

test("generateWebsiteStyles — .doc-page is capped and centered by the shell token", () => {
  const body = ruleBody(generateWebsiteStyles(), ".doc-page");
  assert.match(body, /max-width:\s*var\(--bai-layout-max\);/);
  assert.match(
    body,
    /margin-inline:\s*auto;/,
    "the capped grid must be centered, otherwise the whole shell hugs the left edge",
  );
});

test("generateWebsiteStyles — defines the rail grid inset", () => {
  const css = generateWebsiteStyles();
  assert.match(
    css,
    /--bai-rail-inset:\s*24px;/,
    "the rail grid line should be declared on :root",
  );
});

test("generateWebsiteStyles — full-bleed bars hold the rail grid at every width", () => {
  const css = generateWebsiteStyles();
  // The bars stay full-bleed (background + border span the viewport) and only
  // their inline padding grows. The padding must be centering-gutter PLUS the
  // rail inset, so the brand sits at shell+inset on both sides of the cap.
  // The tempting max(inset, gutter) form drops the inset term once the gutter
  // wins, which snaps the brand to shell+0 and visibly shifts the grid as the
  // window is resized past the cap — assert against that regression too.
  for (const selector of [".bai-topbar", ".docs-banner"] as const) {
    const body = ruleBody(css, selector);
    const declaration = body.match(/padding-inline:[^;]*;/s)?.[0] ?? "";
    assert.ok(
      declaration,
      `${selector} should declare padding-inline for the rail grid`,
    );
    const normalized = declaration.replace(/\s+/g, " ");
    assert.ok(
      normalized.includes("max(0px, (100% - var(--bai-layout-max)) / 2)"),
      `${selector} should grow by the centering gutter, got: ${normalized}`,
    );
    assert.ok(
      normalized.includes("var(--bai-rail-inset)"),
      `${selector} should add the rail inset on top of the gutter`,
    );
    // The only max() allowed is the one flooring the gutter at zero. A
    // non-zero floor (max(20px, gutter)) is the regression: it swallows the
    // inset once the gutter wins, snapping the brand to shell+0.
    const maxFloors = [...normalized.matchAll(/max\(\s*([^,]+),/g)].map((m) =>
      m[1].trim(),
    );
    assert.deepEqual(
      maxFloors,
      ["0px"],
      `${selector} may only clamp the gutter at 0px — a non-zero max() floor ` +
        `drops the inset above the cap and shifts the grid. Got: ${normalized}`,
    );
    assert.ok(
      !/max-width/.test(body),
      `${selector} must stay full-bleed (no max-width) so its background spans the viewport`,
    );
  }
});
