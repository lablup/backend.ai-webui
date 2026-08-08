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

/**
 * Extract the body of the first top-level rule whose selector matches
 * exactly. Slices to the first `}`, so it would mis-parse a rule containing
 * a nested block (CSS nesting / a nested @media). None of the selectors used
 * here nest today; the assert below fires if one starts to.
 */
function ruleBody(css: string, selector: string): string {
  const idx = css.indexOf(`\n${selector} {`);
  assert.notEqual(idx, -1, `expected a "${selector}" rule in the stylesheet`);
  const start = css.indexOf("{", idx);
  const end = css.indexOf("}", start);
  const body = css.slice(start + 1, end);
  assert.ok(
    !body.includes("{"),
    `"${selector}" now contains a nested block; ruleBody() cannot parse it`,
  );
  return body;
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
    /left:\s*var\(--bai-rail-inset\);/,
    /right:\s*var\(--bai-rail-inset\);/,
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

test("generateWebsiteStyles — the shell cap equals its column budget", () => {
  const css = styles();
  assert.match(
    css,
    /--bai-layout-max:\s*1536px;/,
    "the shell cap token should be declared on :root",
  );

  // Pin the arithmetic the cap's comment claims, so changing a column token
  // without revisiting the cap fails here rather than silently squeezing the
  // article. 1536 - 280 sider - 240 TOC = 1016 for the article column, which
  // must still clear the prose plus its two gutters.
  const px = (name: string) => {
    const m = css.match(new RegExp(`--${name}:\\s*(\\d+)px;`));
    assert.ok(m, `expected a --${name} token`);
    return Number(m[1]);
  };
  const article = px("bai-layout-max") - px("bai-sider-w") - px("bai-toc-w");
  assert.equal(article, 1016, "article column budget changed");
  assert.ok(
    article >= px("bai-content-max") + 2 * px("bai-gutter"),
    `article column ${article}px must fit the ${px("bai-content-max")}px prose ` +
      `plus 2x${px("bai-gutter")}px gutter`,
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

test("generateWebsiteStyles — the bar inset adds the grid on top of the margin", () => {
  const css = styles();
  const decl = css.match(/--bai-bar-inline:([^;]*);/s)?.[1] ?? "";
  const normalized = decl.replace(/\s+/g, " ").trim();

  assert.ok(
    normalized.includes("max(0px, (100% - var(--bai-layout-max)) / 2)"),
    `the bar inset should grow by the centering margin, got: ${normalized}`,
  );
  assert.ok(
    normalized.includes("var(--bai-rail-inset)"),
    "the bar inset should add the rail inset on top of that margin",
  );
  // The only max() allowed is the one flooring the margin at zero. A non-zero
  // floor — max(20px, margin) — is the regression: it swallows the inset once
  // the margin wins, snapping content to the shell edge and shifting the grid
  // as the window crosses the cap.
  const maxFloors = [...normalized.matchAll(/max\(\s*([^,]+),/g)].map((m) =>
    m[1].trim(),
  );
  assert.deepEqual(
    maxFloors,
    ["0px"],
    `only a 0px max() floor is allowed — a non-zero floor drops the inset ` +
      `above the cap and shifts the grid. Got: ${normalized}`,
  );
});

test("generateWebsiteStyles — both full-bleed bars use that inset, uncapped", () => {
  const css = styles();
  for (const selector of [".bai-topbar", ".docs-banner"] as const) {
    const body = ruleBody(css, selector);
    assert.match(
      body,
      /padding-inline:\s*var\(--bai-bar-inline\);/,
      `${selector} should take its inline padding from the shared token`,
    );
    assert.ok(
      !/max-width/.test(body),
      `${selector} must stay full-bleed (no max-width) so its background spans the viewport`,
    );
  }

  // Their block padding drives bar height, which version-banner.js measures
  // into --bai-banner-h and every sticky offset depends on. Pin it.
  assert.match(ruleBody(css, ".bai-topbar"), /padding-block:\s*0;/);
  assert.match(ruleBody(css, ".docs-banner"), /padding-block:\s*10px;/);

  // No override of either bar may use the `padding` shorthand: its inline
  // half silently resets --bai-bar-inline and drops the bar off the grid.
  // This is exactly the bug that shipped at <=640px, where the banner fell to
  // 16px while the topbar stayed at 24px. Overrides must use the longhands,
  // as the <=880px mobile-grid rule does.
  // Match on the exact selector, not a prefix — `.bai-topbar__search` and
  // friends legitimately use the shorthand on themselves.
  const BARS = new Set([".bai-topbar", ".docs-banner"]);
  let checked = 0;
  for (const m of css.matchAll(/\n\s*([^{}@\n][^{}]*?)\s*\{([^{}]*)\}/g)) {
    const hitsABar = m[1]
      .split(",")
      .map((s) => s.trim())
      .some((s) => BARS.has(s));
    if (!hitsABar) continue;
    checked++;
    assert.ok(
      !/(^|[\s;])padding:\s/.test(m[2]),
      `"${m[1].trim()}" must not use the 'padding' shorthand — it resets the ` +
        `rail grid. Use padding-block / padding-inline. Got: ${m[2].trim()}`,
    );
  }
  assert.ok(
    checked >= 3,
    `expected to scan the bars' base rules plus their overrides, saw ${checked}`,
  );

  // Below 880px the sider is gone, so the bars adopt the article's own 16px
  // gutter instead of the (now nonexistent) rail.
  const mobile = css.match(
    /@media \(max-width: 880px\) \{[\s\S]*?\n\}/g,
  )?.find((blk) => blk.includes(".bai-topbar,"));
  assert.ok(mobile, "expected a <=880px block pulling the bars onto the article gutter");
  assert.match(mobile, /padding-inline:\s*16px;/);
  assert.match(
    ruleBody(css, ".doc-main"),
    /max-width:\s*var\(--bai-content-max\);/,
    "sanity: .doc-main is still the article column this 16px is matched to",
  );
});

test("generateWebsiteStyles — the rail's three vertical gaps come from one token", () => {
  const css = styles();

  // The version block used to read top-heavy: 14px above the switcher pill,
  // 10px from the pill down to the separator, then 16px from the separator to
  // the first nav item. All three now resolve from --bai-rail-gap, so none can
  // drift alone.
  assert.match(css, /--bai-rail-gap:\s*14px;/);

  const row = ruleBody(css, ".doc-sidebar-version");
  // Both block values derive from the one gap token. The end value carries a
  // +1px correction because the ::after separator is positioned bottom: 0
  // INSIDE this padding box and consumes its last pixel — without it the
  // rendered gaps are 14/13/14, not 14/14/14.
  assert.match(
    row,
    /padding-block:\s*var\(--bai-rail-gap\) calc\(var\(--bai-rail-gap\) \+ 1px\);/,
    "block padding must derive both gaps from the token, +1px for the rule itself",
  );
  assert.match(
    row,
    /padding-inline:\s*var\(--bai-rail-inset\);/,
    "the row's inline padding is what puts the separator on the rail grid",
  );

  // The popup's offset compensates for that padding-bottom to keep its 6px
  // gap below the pill. It is a derived constant, so it must move with it.
  const popup = ruleBody(css, ".bai-select__list--version");
  assert.match(
    popup,
    /top:\s*calc\(100% - 9px\);/,
    "the version popup offset must track the row's padding-bottom (6px - 15px)",
  );

  const scroll = ruleBody(css, ".doc-sidebar__scroll");
  assert.match(
    scroll,
    /padding-block:\s*var\(--bai-rail-gap\)/,
    "the scrollport's block-start padding solely owns the separator -> first item gap",
  );

  // If the intro regained a top margin the gap would become a sum again --
  // the exact bug this replaced -- so pin the top edge to zero without
  // constraining its unrelated side/bottom values.
  const intro = ruleBody(css, ".doc-sidebar-intro");
  const margin = intro.match(/margin:([^;]*);/)?.[1]?.trim() ?? "";
  assert.equal(
    margin.split(/\s+/)[0],
    "0",
    `the first item must not add its own top margin on top of the ` +
      `scrollport padding. Got margin: ${margin}`,
  );
});
