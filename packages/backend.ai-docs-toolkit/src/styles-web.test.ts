/**
 * Unit tests for the website stylesheet generator (styles-web.ts).
 *
 * Run: pnpm --filter backend.ai-docs-toolkit test
 *
 * Coverage:
 *   - The ultrawide shell cap: --bai-layout-max is defined, .doc-page is
 *     capped and centered by it, and the two full-bleed sticky bars
 *     (topbar, version banner) inset their content to the same cap while
 *     keeping their original gutter below it.
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

test("generateWebsiteStyles — full-bleed bars inset their content to the shell cap", () => {
  const css = generateWebsiteStyles();
  // The bars stay full-bleed (background + border span the viewport) and
  // only their inline padding grows, so the brand/banner text lines up
  // with the sider's left edge on ultrawide viewports. max() preserves the
  // original gutter at every width below the cap.
  for (const [selector, gutter] of [
    [".bai-topbar", "20px"],
    [".docs-banner", "22px"],
  ] as const) {
    const body = ruleBody(css, selector);
    assert.match(
      body,
      new RegExp(
        `padding-inline:\\s*max\\(${gutter},\\s*calc\\(\\(100% - var\\(--bai-layout-max\\)\\) / 2\\)\\);`,
      ),
      `${selector} should inset its content to the shell cap`,
    );
    assert.ok(
      !/max-width/.test(body),
      `${selector} must stay full-bleed (no max-width) so its background spans the viewport`,
    );
  }
});
