import { test } from "node:test";
import assert from "node:assert/strict";

import { buildSitemapXml } from "./sitemap.js";
import type { PageEnumerationRow } from "./versions.js";

const sample: PageEnumerationRow[] = [
  { version: "0.1", lang: "en", slug: "quickstart", path: "0.1/en/quickstart.html", isLatest: true },
  { version: "0.1", lang: "ko", slug: "quickstart", path: "0.1/ko/quickstart.html", isLatest: true },
  { version: "next", lang: "en", slug: "quickstart", path: "next/en/quickstart.html", isLatest: false },
];

test("buildSitemapXml — wraps URLs with the correct sitemap.org schema", () => {
  const xml = buildSitemapXml({
    pages: sample,
    baseUrl: "https://docs.example.com",
    lastModFor: () => undefined,
  });
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(
    xml,
    /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/,
  );
  assert.match(xml, /<\/urlset>\s*$/);
});

test("buildSitemapXml — emits one <url> per row", () => {
  const xml = buildSitemapXml({
    pages: sample,
    baseUrl: "https://docs.example.com",
    lastModFor: () => undefined,
  });
  const matches = xml.match(/<url>/g) ?? [];
  assert.equal(matches.length, sample.length);
});

test("buildSitemapXml — joins baseUrl + row.path correctly with a single slash", () => {
  const xml = buildSitemapXml({
    pages: sample,
    baseUrl: "https://docs.example.com",
    lastModFor: () => undefined,
  });
  assert.ok(xml.includes("<loc>https://docs.example.com/0.1/en/quickstart.html</loc>"));
});

test("buildSitemapXml — strips a trailing slash on baseUrl to avoid double-slash URLs", () => {
  const xml = buildSitemapXml({
    pages: sample.slice(0, 1),
    baseUrl: "https://docs.example.com/",
    lastModFor: () => undefined,
  });
  assert.ok(xml.includes("<loc>https://docs.example.com/0.1/en/quickstart.html</loc>"));
  assert.ok(!xml.includes("//0.1/"));
});

test("buildSitemapXml — emits relative paths when baseUrl is omitted", () => {
  // Documented as defensive (non-conformant) behavior — generator skips
  // emission when baseUrl is missing, but the function still works.
  const xml = buildSitemapXml({
    pages: sample.slice(0, 1),
    lastModFor: () => undefined,
  });
  assert.ok(xml.includes("<loc>0.1/en/quickstart.html</loc>"));
});

test("buildSitemapXml — emits <lastmod> when lastModFor returns a value", () => {
  const xml = buildSitemapXml({
    pages: sample.slice(0, 1),
    baseUrl: "https://docs.example.com",
    lastModFor: () => "2026-04-25",
  });
  assert.ok(xml.includes("<lastmod>2026-04-25</lastmod>"));
});

test("buildSitemapXml — omits <lastmod> when lastModFor returns undefined", () => {
  const xml = buildSitemapXml({
    pages: sample.slice(0, 1),
    baseUrl: "https://docs.example.com",
    lastModFor: () => undefined,
  });
  assert.ok(!xml.includes("<lastmod>"));
});

test("buildSitemapXml — XML-escapes special characters in <loc>", () => {
  const xml = buildSitemapXml({
    pages: [
      {
        version: "v1",
        lang: "en",
        slug: "p",
        path: "p?a=1&b=2.html",
        isLatest: true,
      },
    ],
    baseUrl: "https://docs.example.com",
    lastModFor: () => undefined,
  });
  assert.ok(xml.includes("<loc>https://docs.example.com/p?a=1&amp;b=2.html</loc>"));
  assert.ok(!xml.includes("&b=2"));
});
