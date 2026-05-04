/**
 * Unit tests for SEO helpers (F2 / FR-2714).
 *
 * Run with: `pnpm test` (uses tsx --test).
 *
 * The helpers in `seo.ts` and friends are pure, so the tests don't
 * touch the filesystem. Sitemap is tested with a fixed mock page
 * enumeration so we can compare full XML output.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  extractDescription,
  truncateForDescription,
  buildOgTags,
  buildTwitterCard,
  buildJsonLd,
  joinBaseUrl,
  DEFAULT_DESCRIPTION_CHAR_LIMIT,
} from "./seo.js";
import { buildSitemapXml } from "./sitemap.js";
import { buildRobotsTxt } from "./robots-txt.js";

test("extractDescription — strips HTML, decodes entities, picks first paragraph", () => {
  const html = `
    <h1 id="x">Title <a href="#x">#</a></h1>
    <p>This is the <strong>first</strong> paragraph with &quot;quotes&quot; and <code>code</code>.</p>
    <p>Second paragraph.</p>
  `;
  const desc = extractDescription(html);
  assert.equal(
    desc,
    'This is the first paragraph with "quotes" and code.',
  );
});

test("extractDescription — skips empty <p> blocks", () => {
  const html = `<p>   </p><p>Real content.</p>`;
  assert.equal(extractDescription(html), "Real content.");
});

test("extractDescription — returns '' when no <p> exists", () => {
  const html = `<h1>Only heading</h1><pre><code>x</code></pre>`;
  assert.equal(extractDescription(html), "");
});

test("extractDescription — truncates to 155 chars by default", () => {
  const longText = "Sentence one. " + "word ".repeat(80) + "tail.";
  const html = `<p>${longText}</p>`;
  const desc = extractDescription(html);
  assert.ok(desc.length <= DEFAULT_DESCRIPTION_CHAR_LIMIT);
});

test("truncateForDescription — prefers sentence boundary", () => {
  // Two sentences in a 200-char window: the cut at limit=80 falls
  // mid-second-sentence, so the truncator backs up to the period
  // after the first sentence (no ellipsis on sentence-boundary cuts).
  const text =
    "First sentence here ends with a period. Second sentence runs much longer than the limit allows for sure.";
  const result = truncateForDescription(text, 80);
  assert.equal(result, "First sentence here ends with a period.");
});

test("truncateForDescription — falls back to word boundary", () => {
  const text = "alpha beta gamma delta epsilon zeta eta theta iota kappa lambda";
  const result = truncateForDescription(text, 50);
  // Should end at a word boundary, with ellipsis.
  assert.ok(result.endsWith("…"));
  assert.ok(!result.endsWith(" …"));
  assert.ok(result.length <= 50);
});

test("buildOgTags — emits article type and required fields", () => {
  const tags = buildOgTags({
    title: "Quickstart",
    description: "Welcome to the docs.",
    pageUrl: "https://example.com/en/quickstart.html",
    imageUrl: "https://example.com/assets/og.png",
    siteName: "Backend.AI",
    locale: "en",
  });
  assert.equal(tags.length, 7);
  assert.ok(tags[0].includes('og:type" content="article"'));
  assert.ok(tags[1].includes('og:title" content="Quickstart"'));
  assert.ok(tags.some((t) => t.includes("og:description")));
  assert.ok(tags.some((t) => t.includes("og:url")));
  assert.ok(tags.some((t) => t.includes("og:image")));
  assert.ok(tags.some((t) => t.includes("og:site_name")));
  assert.ok(tags.some((t) => t.includes("og:locale")));
});

test("buildOgTags — omits optional fields when undefined", () => {
  const tags = buildOgTags({ title: "Minimal" });
  // Only og:type and og:title are required.
  assert.equal(tags.length, 2);
});

test("buildTwitterCard — always summary_large_image", () => {
  const tags = buildTwitterCard({ title: "X" });
  assert.ok(tags[0].includes('twitter:card" content="summary_large_image"'));
});

test("buildJsonLd — produces valid JSON in <script>", () => {
  const tag = buildJsonLd({
    headline: "X",
    inLanguage: "en",
    description: "Y",
    dateModified: "2026-01-01T00:00:00Z",
    author: "Lablup",
    publisher: "Lablup",
    url: "https://example.com/x.html",
    imageUrl: "https://example.com/og.png",
  });
  assert.ok(tag.startsWith('<script type="application/ld+json">'));
  assert.ok(tag.endsWith("</script>"));
  const json = tag.slice(
    '<script type="application/ld+json">'.length,
    -"</script>".length,
  );
  const parsed = JSON.parse(json);
  assert.equal(parsed["@type"], "TechArticle");
  assert.equal(parsed.headline, "X");
  assert.equal(parsed.author.name, "Lablup");
});

test("buildJsonLd — escapes </script> sequences", () => {
  const tag = buildJsonLd({
    headline: "</script><script>alert(1)</script>",
    inLanguage: "en",
  });
  // The raw `</script>` must NOT appear unescaped between the
  // wrapper tags (other than the closing wrapper itself).
  const inner = tag.slice(
    '<script type="application/ld+json">'.length,
    -"</script>".length,
  );
  assert.ok(!/<\/script/i.test(inner));
});

test("joinBaseUrl — composes correctly", () => {
  assert.equal(
    joinBaseUrl("https://docs.backend.ai", "en/x.html"),
    "https://docs.backend.ai/en/x.html",
  );
  assert.equal(
    joinBaseUrl("https://docs.backend.ai/", "/en/x.html"),
    "https://docs.backend.ai/en/x.html",
  );
  assert.equal(joinBaseUrl(undefined, "en/x.html"), undefined);
});

test("buildSitemapXml — emits absolute URLs and lastmod", () => {
  const xml = buildSitemapXml({
    pages: [
      { version: "", lang: "en", slug: "a", path: "en/a.html", isLatest: true },
      { version: "", lang: "ko", slug: "a", path: "ko/a.html", isLatest: true },
    ],
    baseUrl: "https://docs.example.com",
    lastModFor: () => "2026-01-01T00:00:00Z",
  });
  assert.ok(xml.includes("<loc>https://docs.example.com/en/a.html</loc>"));
  assert.ok(xml.includes("<loc>https://docs.example.com/ko/a.html</loc>"));
  assert.ok(xml.includes("<lastmod>2026-01-01T00:00:00Z</lastmod>"));
  assert.ok(xml.startsWith('<?xml version="1.0"'));
});

test("buildSitemapXml — versioned mode emits per-version <loc>", () => {
  const xml = buildSitemapXml({
    pages: [
      {
        version: "26.03",
        lang: "en",
        slug: "a",
        path: "26.03/en/a.html",
        isLatest: true,
      },
      {
        version: "25.16",
        lang: "en",
        slug: "a",
        path: "25.16/en/a.html",
        isLatest: false,
      },
    ],
    baseUrl: "https://docs.example.com",
    lastModFor: () => undefined,
  });
  assert.ok(xml.includes("<loc>https://docs.example.com/26.03/en/a.html</loc>"));
  assert.ok(xml.includes("<loc>https://docs.example.com/25.16/en/a.html</loc>"));
  // No <lastmod> when the resolver returns undefined.
  assert.ok(!xml.includes("<lastmod>"));
});

test("buildRobotsTxt — allow-all + sitemap reference", () => {
  const txt = buildRobotsTxt({ sitemapUrl: "https://x.com/sitemap.xml" });
  assert.ok(txt.includes("User-agent: *"));
  assert.ok(txt.includes("Disallow:"));
  assert.ok(txt.includes("Sitemap: https://x.com/sitemap.xml"));
});

test("buildRobotsTxt — omits Sitemap line when URL missing", () => {
  const txt = buildRobotsTxt();
  assert.ok(txt.includes("User-agent: *"));
  assert.ok(!txt.includes("Sitemap:"));
});
