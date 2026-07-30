/**
 * Unit tests for the website stylesheet generator (styles-web.ts).
 *
 * Run: pnpm --filter backend.ai-docs-toolkit test
 *
 * Coverage:
 *   - The ultrawide shell cap: --bai-layout-max is defined and .doc-page is
 *     capped and centered by it.
 *   - The flat rail: the in-flow sider shares the page surface (its old
 *     3/255 tint became an unbounded band once the shell was centered),
 *     while the mobile drawer overlay keeps a surface of its own.
 *   - The rail grid: the two full-bleed sticky bars (topbar, version banner)
 *     inset their content by centering-gutter + --bai-rail-inset, so the
 *     brand and the banner icon stay on the sider's grid line at every
 *     viewport width instead of shifting as the cap is crossed.
 *   - The version row's separator: an inset ::after matching
 *     .doc-toc__divider, rather than a border spanning the sider edge to
 *     edge, plus the uniform 14px rhythm around it.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { generateWebsiteStyles } from "./styles-web.js";

/**
 * The stylesheet is heavily commented, and those comments name the very
 * tokens these tests assert on. Matching against raw CSS would let a
 * comment satisfy an assertion — so every test works on stripped output.
 */
function styles(): string {
  return generateWebsiteStyles().replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Extract the body of the first rule whose selector matches exactly. */
function ruleBody(css: string, selector: string): string {
  const idx = css.indexOf(`\n${selector} {`);
  assert.notEqual(idx, -1, `expected a "${selector}" rule in the stylesheet`);
  const start = css.indexOf("{", idx);
  const end = css.indexOf("}", start);
  return css.slice(start + 1, end);
}

test("generateWebsiteStyles — the in-flow rail is flat, the drawer keeps its surface", () => {
  const css = styles();

  // The capped shell detaches the rail from the viewport edge, so a tint
  // that is only 3/255 from --bai-bg reads as an unbounded band. The rail
  // must therefore share the page surface and lean on its border instead.
  const sider = ruleBody(css, ".doc-sidebar");
  assert.match(
    sider,
    /background:\s*var\(--bai-bg\);/,
    "the in-flow rail must use the page surface, not a near-invisible tint",
  );
  assert.ok(
    !/--bai-bg-sider/.test(sider),
    "the in-flow rail must not reintroduce --bai-bg-sider",
  );
  assert.match(
    sider,
    /border-right:\s*1px solid var\(--bai-border\);/,
    "with the tint gone, the border is the only thing separating rail from article",
  );

  // ...but the ≤880px drawer is a fixed overlay above the article, so it
  // does need a surface of its own. Guard that the flattening above was
  // not applied to it wholesale.
  assert.match(
    css,
    /body\.bai-drawer-open \.doc-sidebar \{[^}]*background:\s*var\(--bai-bg-sider\);/s,
    "the mobile drawer overlay should keep its own surface",
  );
});

test("generateWebsiteStyles — the TOC mirrors the rail's separator", () => {
  // The two hairlines are now the whole separation story, so they have to
  // stay symmetric; losing one leaves the shell visibly lopsided.
  const toc = ruleBody(styles(), ".doc-toc");
  assert.match(toc, /border-left:\s*1px solid var\(--bai-border\);/);
});

test("generateWebsiteStyles — the version row is separated by an inset rule", () => {
  const css = styles();

  // A border-bottom here would sit outside the padding box and span the
  // sider edge to edge. The separator has to be inset like the TOC's, and
  // inset by exactly the rail grid so it starts under the VERSION label.
  const row = ruleBody(css, ".doc-sidebar-version");
  assert.ok(
    !/border-bottom/.test(row),
    "the version row must not use a full-width border-bottom as its separator",
  );
  assert.match(
    row,
    /position:\s*relative;/,
    "the row must stay the containing block for its ::after separator",
  );

  const rule = ruleBody(css, ".doc-sidebar-version::after");
  for (const decl of [
    /left:\s*24px;/,
    /right:\s*24px;/,
    /height:\s*1px;/,
    /background:\s*var\(--bai-border-soft\);/,
  ]) {
    assert.match(rule, decl, `inset separator should declare ${decl}`);
  }

  // Same weight and token as the divider it is copying, so the two rails
  // separate their sections identically.
  const tocDivider = ruleBody(css, ".doc-toc__divider");
  assert.match(tocDivider, /height:\s*1px;/);
  assert.match(tocDivider, /background:\s*var\(--bai-border-soft\);/);
});

test("generateWebsiteStyles — defines the ultrawide shell cap token", () => {
  const css = styles();
  assert.match(
    css,
    /--bai-layout-max:\s*1536px;/,
    "the shell cap token should be declared on :root",
  );
});

test("generateWebsiteStyles — .doc-page is capped and centered by the shell token", () => {
  const body = ruleBody(styles(), ".doc-page");
  assert.match(body, /max-width:\s*var\(--bai-layout-max\);/);
  assert.match(
    body,
    /margin-inline:\s*auto;/,
    "the capped grid must be centered, otherwise the whole shell hugs the left edge",
  );
});

test("generateWebsiteStyles — defines the rail grid inset", () => {
  const css = styles();
  assert.match(
    css,
    /--bai-rail-inset:\s*24px;/,
    "the rail grid line should be declared on :root",
  );
});

test("generateWebsiteStyles — full-bleed bars hold the rail grid at every width", () => {
  const css = styles();
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

test("generateWebsiteStyles — the rail's three vertical gaps are uniform", () => {
  const css = styles();

  // The version block used to read top-heavy: 14px above the switcher pill,
  // 10px from the pill down to the separator, then 16px from the separator
  // to the first nav item. All three are now 14px, box to box, and each
  // comes from exactly one declaration so none can drift alone.
  const row = ruleBody(css, ".doc-sidebar-version");
  assert.match(
    row,
    /padding:\s*14px 24px;/,
    "symmetric padding makes the gap above the pill equal the gap below it",
  );

  const scroll = ruleBody(css, ".doc-sidebar__scroll");
  assert.match(
    scroll,
    /padding:\s*14px 8px 24px;/,
    "the scrollport's padding-top is the sole owner of the separator -> first item gap",
  );

  // If the intro regained a top margin the gap would become a sum again
  // (the exact bug this replaced), so pin it to zero.
  const intro = ruleBody(css, ".doc-sidebar-intro");
  assert.match(
    intro,
    /margin:\s*0 6px 4px;/,
    "the first item must not add its own top margin on top of the scrollport padding",
  );
});
