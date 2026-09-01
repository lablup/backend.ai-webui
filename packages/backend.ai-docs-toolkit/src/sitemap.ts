/**
 * sitemap.xml builder (F2 / FR-2714).
 *
 * Pure function: takes the page enumeration produced by F6's
 * `generateWebsite()` and returns an XML string. Side-effect free so
 * it can be unit-tested without touching the filesystem.
 *
 * The output conforms to https://www.sitemaps.org/protocol.html:
 *   - Wrapped in `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`.
 *   - One `<url>` element per page.
 *   - `<loc>` is required; `<lastmod>` is optional (W3C Datetime).
 *   - We omit `<changefreq>` / `<priority>` — Google ignores them and
 *     they add noise.
 *
 * In versioned mode (per F6), every (version, lang, slug) row gets its
 * own `<url>`. In flat mode, every (lang, slug) row gets its own
 * `<url>`. The `isLatest` flag is NOT used to filter — search engines
 * benefit from indexing all versions; the `<link rel="canonical">` on
 * each non-latest page already tells them which version to prefer.
 */

import type { PageEnumerationRow } from "./versions.js";

/** XML-escape `&`, `<`, `>`, `'`, `"` for safe inclusion in element text. */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export interface BuildSitemapOptions {
  /** Pages to include (one row per (version, lang, slug)). */
  pages: readonly PageEnumerationRow[];
  /**
   * Public deploy URL, e.g. `https://docs.backend.ai`. Required for a
   * standards-compliant sitemap (W3C `<loc>` mandates a fully-qualified
   * URL). When unset, the caller should NOT call `buildSitemapXml` —
   * we still tolerate it here and emit relative `<loc>` values, but a
   * sitemap with relative paths is non-conformant and most crawlers
   * will reject it. F2's generator emits a warning and skips the file
   * when `baseUrl` is unset; this function is defensive but not lenient.
   */
  baseUrl?: string;
  /**
   * Resolve a `<lastmod>` ISO date string for a given page row. The
   * caller picks the strategy (git log, fs.stat mtime, or a constant).
   * Returning `undefined` omits the `<lastmod>` element.
   */
  lastModFor: (row: PageEnumerationRow) => string | undefined;
}

/**
 * Build a sitemap.xml document body. Returns the complete XML string
 * including the XML declaration. Lines are joined with `\n` for human
 * readability — crawlers ignore whitespace between elements.
 */
export function buildSitemapXml(opts: BuildSitemapOptions): string {
  const { pages, baseUrl, lastModFor } = opts;
  const trimmedBase = baseUrl
    ? baseUrl.endsWith("/")
      ? baseUrl.slice(0, -1)
      : baseUrl
    : "";

  const urlBlocks: string[] = [];
  for (const row of pages) {
    const fullUrl = trimmedBase ? `${trimmedBase}/${row.path}` : row.path;
    const lastMod = lastModFor(row);
    const inner: string[] = [`    <loc>${escapeXml(fullUrl)}</loc>`];
    if (lastMod) {
      inner.push(`    <lastmod>${escapeXml(lastMod)}</lastmod>`);
    }
    urlBlocks.push(`  <url>\n${inner.join("\n")}\n  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlBlocks.join("\n")}
</urlset>
`;
}
