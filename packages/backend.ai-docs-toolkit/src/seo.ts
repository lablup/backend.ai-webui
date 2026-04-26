/**
 * SEO & sharing-metadata helpers (F2 / FR-2714).
 *
 * Pure functions used by `website-builder.ts` to emit per-page `<head>`
 * tags: description, Open Graph, Twitter Card, canonical, JSON-LD
 * `TechArticle`. None of these helpers touch the filesystem or the
 * environment — they take primitives and return strings, so they are
 * trivially unit-testable and safe to call from any pipeline that has
 * already resolved the inputs.
 *
 * The helpers in this module are intentionally split from the head
 * builder: the head builder concerns itself with PageAssets / version
 * context wiring, while this module concerns itself only with SEO
 * metadata shape. F1 (hreflang), F3 (breadcrumb), F4 (Shiki/copy)
 * touch other parts of the head builder; keeping SEO isolated here
 * minimizes merge friction across the F1+F2+F3+F4+F6 stack.
 */

import { stripHtmlTags, escapeHtml } from "./markdown-extensions.js";

/**
 * Default character cap for `<meta name="description">`. The spec says
 * "≤ 160" with first-paragraph extraction "capped at ~155". We use 155
 * so that we never accidentally cross the 160-char hard limit due to
 * a trailing word boundary slip.
 */
export const DEFAULT_DESCRIPTION_CHAR_LIMIT = 155;

/**
 * Extract a plain-text description from rendered chapter HTML.
 *
 * Strategy:
 *   1. Look at the chapter HTML linearly and skip every block that is a
 *      heading, code block, table, list, image/figure, admonition, or
 *      anything else that would not read as a description.
 *   2. The first remaining `<p>...</p>` block is the seed description.
 *   3. Strip HTML tags and normalize whitespace.
 *   4. Truncate to `charLimit`. Prefer cutting at a sentence boundary
 *      (`. `, `? `, `! `, `。`, `？`, `！`); otherwise fall back to the
 *      last whitespace before the limit; otherwise hard-truncate with
 *      an ellipsis.
 *
 * Returns an empty string when no suitable paragraph can be found —
 * the caller decides whether to fall back to the document title or
 * skip the description tag.
 */
export function extractDescription(
  html: string,
  charLimit: number = DEFAULT_DESCRIPTION_CHAR_LIMIT,
): string {
  if (!html) return "";
  // Find the first <p>...</p> block. Marked emits `<p>` for plain
  // paragraphs; anything else (admonitions, figures, tables) is wrapped
  // in <div>/<figure>/<aside>/etc. So the first-<p> heuristic naturally
  // skips non-paragraph blocks.
  // The regex is non-greedy and case-insensitive; we iterate so we can
  // skip empty / whitespace-only paragraphs.
  const paraRegex = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = paraRegex.exec(html)) !== null) {
    const inner = match[1];
    const text = decodeHtmlEntities(stripHtmlTags(inner))
      .replace(/\s+/g, " ")
      .trim();
    if (text.length === 0) continue;
    return truncateForDescription(text, charLimit);
  }
  return "";
}

/**
 * Decode the small set of HTML entities that Marked emits in chapter
 * HTML: `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;`, `&#39;`, plus
 * numeric `&#NN;` / `&#xNN;` escapes. Used in the description
 * extraction path so that `&quot;AS IS&quot;` rendered into HTML
 * decodes back to `"AS IS"` before being re-encoded for the meta tag.
 */
function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_m, dec) => String.fromCodePoint(parseInt(dec, 10)));
}

/**
 * Truncate a plain-text string to `charLimit` characters, preferring
 * sentence boundaries, then word boundaries, with a trailing `…` when
 * the input is longer than the limit.
 */
export function truncateForDescription(
  text: string,
  charLimit: number,
): string {
  if (text.length <= charLimit) return text;
  // Don't degenerate to single-word descriptions: insist on cutting
  // at a boundary only if the resulting snippet is at least 40% of
  // the requested limit. Below that we'd rather keep more text and
  // just trail with an ellipsis.
  const minBoundary = Math.max(20, Math.floor(charLimit * 0.4));
  // Look for the last sentence boundary within the limit window.
  // Patterns covered: ". ", "? ", "! ", "。", "？", "！", "．" (full-width period).
  const slice = text.slice(0, charLimit);
  const sentenceBoundary = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("? "),
    slice.lastIndexOf("! "),
    slice.lastIndexOf("。"),
    slice.lastIndexOf("？"),
    slice.lastIndexOf("！"),
    slice.lastIndexOf("．"),
  );
  if (sentenceBoundary >= minBoundary) {
    // ASCII boundaries match ". " etc.; CJK boundaries match a
    // single char. Either way keep the punctuation, drop trailing space.
    return slice.slice(0, sentenceBoundary + 1).trim();
  }
  // Fall back to the last whitespace boundary inside the slice.
  const wordBoundary = slice.lastIndexOf(" ");
  if (wordBoundary >= minBoundary) {
    return slice.slice(0, wordBoundary).trim() + "…";
  }
  // Hard truncate.
  return slice.trim() + "…";
}

/**
 * Inputs for `buildOgTags`. URLs are passed in already resolved (the
 * caller decides how to mix relative / absolute, and what to emit when
 * `baseUrl` is unset). When a field is `undefined`, the corresponding
 * tag is omitted — never rendered as `<meta content="undefined">`.
 */
export interface OgTagOptions {
  title: string;
  description?: string;
  imageUrl?: string;
  pageUrl?: string;
  siteName?: string;
  locale?: string;
}

/**
 * Build Open Graph `<meta>` tags. The order is stable so the test
 * fixtures (and visual diffs) are deterministic. Returns an array of
 * fully-formed `<meta>` tag strings; the caller joins them with the
 * indentation appropriate for its surrounding template.
 */
export function buildOgTags(opts: OgTagOptions): string[] {
  const lines: string[] = [];
  // og:type is always "article" for chapter pages — F2 emits these per
  // chapter only. The site index page (F1) uses "website" but is
  // assembled by F1, not F2.
  lines.push(`<meta property="og:type" content="article" />`);
  lines.push(
    `<meta property="og:title" content="${escapeHtml(opts.title)}" />`,
  );
  if (opts.description) {
    lines.push(
      `<meta property="og:description" content="${escapeHtml(opts.description)}" />`,
    );
  }
  if (opts.pageUrl) {
    lines.push(
      `<meta property="og:url" content="${escapeHtml(opts.pageUrl)}" />`,
    );
  }
  if (opts.imageUrl) {
    lines.push(
      `<meta property="og:image" content="${escapeHtml(opts.imageUrl)}" />`,
    );
  }
  if (opts.siteName) {
    lines.push(
      `<meta property="og:site_name" content="${escapeHtml(opts.siteName)}" />`,
    );
  }
  if (opts.locale) {
    lines.push(
      `<meta property="og:locale" content="${escapeHtml(opts.locale)}" />`,
    );
  }
  return lines;
}

/**
 * Inputs for `buildTwitterCard`.
 */
export interface TwitterCardOptions {
  title: string;
  description?: string;
  imageUrl?: string;
}

/**
 * Build Twitter Card `<meta>` tags (always `summary_large_image`).
 * F2 deliberately does NOT emit `twitter:site` / `twitter:creator`
 * — Backend.AI does not have a project-wide Twitter handle declared
 * anywhere in repo config, so guessing a value would be worse than
 * omitting it. Operators who want those tags can add them post-build
 * (proxy / CDN edge) without changing the toolkit.
 */
export function buildTwitterCard(opts: TwitterCardOptions): string[] {
  const lines: string[] = [
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(opts.title)}" />`,
  ];
  if (opts.description) {
    lines.push(
      `<meta name="twitter:description" content="${escapeHtml(opts.description)}" />`,
    );
  }
  if (opts.imageUrl) {
    lines.push(
      `<meta name="twitter:image" content="${escapeHtml(opts.imageUrl)}" />`,
    );
  }
  return lines;
}

/**
 * Inputs for `buildJsonLd`. `headline` is the page title; `inLanguage`
 * is the BCP-47 / Open Graph locale (en, ko, ja, th); `dateModified`
 * is an ISO-8601 timestamp from the page's last-modified record; the
 * remaining fields come from `og.siteName` / `pdfMetadata.author`
 * fallback chains.
 */
export interface JsonLdOptions {
  headline: string;
  description?: string;
  inLanguage: string;
  dateModified?: string;
  author?: string;
  publisher?: string;
  url?: string;
  imageUrl?: string;
}

/**
 * Build a JSON-LD `<script type="application/ld+json">` block carrying
 * a Schema.org `TechArticle`. Only well-formed fields are included;
 * `undefined` fields are omitted entirely so the JSON validator stays
 * happy. The output is a complete `<script>` element ready to inject
 * into `<head>`.
 *
 * Note: schema.org's `Article`/`TechArticle` allow either a string or
 * an `Organization` for `publisher`. We use the simpler `Organization`
 * shape because tooling consensus is to prefer it; when no name is
 * known, we omit `publisher` rather than synthesize a placeholder.
 */
export function buildJsonLd(opts: JsonLdOptions): string {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: opts.headline,
    inLanguage: opts.inLanguage,
  };
  if (opts.description) data.description = opts.description;
  if (opts.dateModified) data.dateModified = opts.dateModified;
  if (opts.url) data.url = opts.url;
  if (opts.imageUrl) data.image = opts.imageUrl;
  if (opts.author) {
    data.author = { "@type": "Organization", name: opts.author };
  }
  if (opts.publisher) {
    data.publisher = { "@type": "Organization", name: opts.publisher };
  }
  // JSON.stringify produces output that is safe for a `<script>` body
  // EXCEPT for the closing `</script>` sequence. Defensively escape the
  // forward slash inside `</` so embedding cannot break the host page.
  const json = JSON.stringify(data).replace(/<\/(?=script)/gi, "<\\/");
  return `<script type="application/ld+json">${json}</script>`;
}

/**
 * Resolve an absolute URL by joining `baseUrl` (no trailing slash
 * required) with a relative path. Returns `undefined` when `baseUrl`
 * is missing — callers use this to decide whether to omit absolute-URL
 * tags entirely.
 */
export function joinBaseUrl(
  baseUrl: string | undefined,
  relativePath: string,
): string | undefined {
  if (!baseUrl) return undefined;
  const trimmedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const trimmedRel = relativePath.startsWith("/")
    ? relativePath.slice(1)
    : relativePath;
  return `${trimmedBase}/${trimmedRel}`;
}
