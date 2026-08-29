import { basename, extname } from 'node:path';

/**
 * Byte-identical to `slugify` in `packages/backend.ai-docs-toolkit/src/
 * markdown-processor.ts` — the deployed anchors must match exactly.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Page slug from a markdown path: the toolkit's `slugFromNavPath`, which keeps
 * `_` so `admin_menu/admin_menu.md` stays `admin_menu`.
 */
export function slugFromPath(markdownPath: string): string {
  const base = basename(markdownPath, extname(markdownPath)).toLowerCase();
  let cleaned = '';
  let lastWasDash = false;
  for (const char of base) {
    const allowed = /[a-z0-9_-]/.test(char);
    if (allowed && char !== '-') {
      cleaned += char;
      lastWasDash = false;
    } else if (!lastWasDash && cleaned.length > 0) {
      cleaned += '-';
      lastWasDash = true;
    }
  }
  while (cleaned.endsWith('-') || cleaned.endsWith('_')) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
}

/** The toolkit's `stripHtmlTags`: repeat until no tag-like run remains. */
export function stripHtmlTags(value: string): string {
  let result = value;
  let previous: string;
  do {
    previous = result;
    result = result.replace(/<[^>]*>?/g, '');
  } while (result !== previous);
  return result;
}

/** The toolkit's `decodeHtmlEntities`, the set `marked` emits when escaping. */
export function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex: string) => {
      const codePoint = parseInt(hex, 16);
      return codePoint > 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match;
    })
    .replace(/&#(\d+);/g, (match, dec: string) => {
      const codePoint = parseInt(dec, 10);
      return codePoint > 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match;
    })
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Plain text of a markdown heading, matching what the toolkit slugifies: it
 * slugifies marked's inline HTML with tags stripped, so inline markup and link
 * targets have to go here too.
 */
export function headingPlainText(raw: string): string {
  const withoutMarkup = raw
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
    .replace(/`+/g, '')
    .replace(/\*\*|__|~~|\*/g, '');
  return decodeHtmlEntities(stripHtmlTags(withoutMarkup))
    .replace(/\s+/g, ' ')
    .trim();
}

/** The deployed anchor for a heading on a page: `{pageSlug}-{slugify(text)}`. */
export function headingAnchor(pageSlug: string, headingText: string): string {
  return `${pageSlug}-${slugify(headingText)}`;
}
