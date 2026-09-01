/**
 * Reading `#bai=v3` blocks back out of a comment body (FR-3813).
 *
 * Everything here runs on the dev server against text a stranger can write
 * into a public PR, so it is deliberately total: no throw, no regex over
 * attacker-chosen input beyond the fixed pin pattern, and the anchor is
 * type-checked field by field before any consumer trusts it.
 */
import { isSafePath } from '../client/codec.js';
import type { AnchorV3 } from '../client/types.js';

/** `#bai=v3.<id>` with the anchor payload optional — R3.3's two valid forms. */
export const PIN_RE = /#bai=v3\.(c_[a-z2-7]{7})(?:\.([A-Za-z0-9_-]{8,}))?/g;

const PIN_TEXT_MAX = 400;
const NORMALIZED_MAX = 80;

export interface PinLink {
  id: string;
  anchorB64: string | null;
  /** A pin pasted outside a quote block is accepted and flagged (R3.4). */
  quoted: boolean;
}

const htmlUnescape = (text: string): string =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&#0*61;|&equals;/g, '=')
    .replace(/&#0*35;|&num;/g, '#')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'");

/**
 * GitHub stores what the author typed, but a link that went through a mail
 * client, Teams or a markdown renderer comes back percent-encoded or
 * HTML-escaped — `%23bai%3Dv3` and `#bai&#61;v3` are the same pin.
 */
function textVariants(text: string): string[] {
  const seen = new Set<string>([text]);
  const add = (value: string) => {
    if (value && !seen.has(value)) seen.add(value);
  };
  let decoded = text;
  try {
    decoded = decodeURIComponent(text);
    add(decoded);
  } catch {
    // A bare `%` in prose is not a percent-escape; the raw scan still counts.
  }
  add(htmlUnescape(text));
  add(htmlUnescape(decoded));
  return [...seen];
}

export function extractPinLinks(text: string): PinLink[] {
  const found = new Map<string, PinLink>();
  for (const variant of textVariants(text || '')) {
    for (const line of variant.split('\n')) {
      const quoted = /^\s*>/.test(line);
      for (const match of line.matchAll(PIN_RE)) {
        const [, id, anchorB64] = match;
        const hit = found.get(id);
        if (!hit) {
          found.set(id, { id, anchorB64: anchorB64 || null, quoted });
          continue;
        }
        if (!hit.anchorB64 && anchorB64) hit.anchorB64 = anchorB64;
        if (quoted) hit.quoted = true;
      }
    }
  }
  return [...found.values()];
}

/**
 * The pin's display text: the block's own quote lines, minus the link and the
 * HTML marker, so a pin reads like the note the reviewer wrote rather than
 * like markdown source.
 */
export function pinText(body: string): string {
  const lines = (body || '').split('\n');
  const quoted = lines
    .filter((line) => line.startsWith('>'))
    .map((line) => line.replace(/^>\s?/, ''))
    .filter(
      (line) => !/^\[Open on dev server\]/.test(line) && !/^!\[/.test(line),
    );
  return (quoted.length ? quoted : lines)
    .join('\n')
    .replace(/<!--[^]*?-->/g, '')
    .replace(/\[Open on dev server\]\([^)]*\)/g, '')
    .trim()
    .slice(0, PIN_TEXT_MAX);
}

/**
 * Word content only. Channels reformat the same pasted block — quote
 * prefixes, escaped markdown, collapsed whitespace — so "is this the same
 * block again (a second source) or an answer to it (a reply)?" can only be
 * asked of the words. One definition for every channel, so FR-3816's Teams
 * source folds in without a second rule.
 */
export function normalizedText(body: string): string {
  return (body || '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLowerCase()
    .slice(0, NORMALIZED_MAX);
}

const isString = (value: unknown): value is string => typeof value === 'string';
const isFraction = (value: unknown): boolean =>
  typeof value === 'number' && Number.isFinite(value);

/**
 * `decodeAnchor` only guarantees `v`, `s` and a safe `p`. A pin arrives from
 * whoever can comment on the PR, and the client feeds these fields to
 * `querySelector`, `location.assign` and the DOM, so every optional field is
 * checked here before the payload leaves the server.
 */
export function isAnchorV3(value: unknown): value is AnchorV3 {
  if (!value || typeof value !== 'object') return false;
  const a = value as Record<string, unknown>;
  if (a.v !== 3) return false;
  if (!isString(a.s) || !a.s) return false;
  if (!isSafePath(a.p)) return false;
  if (a.q !== undefined && (!isString(a.q) || /[#\s]/.test(a.q))) return false;
  if (
    a.tag !== undefined &&
    (!isString(a.tag) || !/^[a-z][a-z0-9-]*$/.test(a.tag))
  )
    return false;
  if (a.txt !== undefined && (!isString(a.txt) || a.txt.length > 64))
    return false;
  if (a.tid !== undefined && !isString(a.tid)) return false;
  if (a.rect !== undefined) {
    const r = a.rect as Record<string, unknown> | null;
    if (!r || typeof r !== 'object') return false;
    if (!['x', 'y', 'w', 'h'].every((k) => isFraction(r[k]))) return false;
  }
  if (a.c !== undefined) {
    const c = a.c as Record<string, unknown> | null;
    if (!c || typeof c !== 'object') return false;
    if (!isString(c.name) || !isString(c.src)) return false;
  }
  return true;
}
