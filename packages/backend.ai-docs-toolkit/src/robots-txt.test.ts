import { test } from "node:test";
import assert from "node:assert/strict";

import { buildRobotsTxt } from "./robots-txt.js";

test("buildRobotsTxt — emits User-agent + Disallow when no sitemap", () => {
  const out = buildRobotsTxt();
  assert.equal(out, "User-agent: *\nDisallow:\n");
});

test("buildRobotsTxt — appends Sitemap line when URL is provided", () => {
  const out = buildRobotsTxt({
    sitemapUrl: "https://docs.backend.ai/sitemap.xml",
  });
  // Blank line separates the rules from the sitemap reference (per de facto convention).
  assert.equal(
    out,
    "User-agent: *\nDisallow:\n\nSitemap: https://docs.backend.ai/sitemap.xml\n",
  );
});

test("buildRobotsTxt — empty options object behaves like no argument", () => {
  assert.equal(buildRobotsTxt({}), buildRobotsTxt());
});

test("buildRobotsTxt — output always ends with a single trailing newline", () => {
  for (const out of [
    buildRobotsTxt(),
    buildRobotsTxt({ sitemapUrl: "https://example.com/sitemap.xml" }),
  ]) {
    assert.ok(out.endsWith("\n"));
    assert.ok(!out.endsWith("\n\n"));
  }
});

test("buildRobotsTxt — preserves the sitemap URL exactly (no escaping, no normalization)", () => {
  // robots.txt does not require URL encoding; the value is passed through as-is.
  const url = "https://example.com/path?with=query&and=more";
  const out = buildRobotsTxt({ sitemapUrl: url });
  assert.ok(out.includes(`Sitemap: ${url}`));
});
