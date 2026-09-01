/**
 * Reading `#bai=v3` blocks back out of a comment body (FR-3813).
 *
 * Everything here runs on the dev server against text a stranger can write
 * into a public PR, so it is deliberately total: no throw, no regex over
 * attacker-chosen input beyond the fixed pin pattern.
 */
import { PIN_BODY_SRC } from '../client/codec.js';

export { isAnchorV3 } from '../client/anchor-guard.js';

/** `#bai=v3.<id>` with the anchor payload optional — R3.3's two valid forms. */
export const PIN_RE = new RegExp(`#bai=v3\\.${PIN_BODY_SRC}`, 'g');

const PIN_TEXT_MAX = 400;
const NORMALIZED_MAX = 80;

export interface PinLink {
  id: string;
  anchorB64: string | null;
  /** A pin pasted outside a quote block is accepted and flagged (R3.4). */
  quoted: boolean;
}

/** One pin, with the words of the block it actually sits in (R3.3). */
export interface PinMention extends PinLink {
  text: string;
  normalized: string;
  /** Words outside every quote block — a quote-reply's own answer (R3.8). */
  remainder: string;
}

const htmlUnescape = (text: string): string =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&#0*61;|&#x0*3d;|&equals;/gi, '=')
    .replace(/&#0*35;|&#x0*23;|&num;/gi, '#')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/gi, "'");

/**
 * A bare `%` in prose ("CPU at 90%") makes a whole-body decode throw, which
 * would drop every percent-encoded link in that comment, so a failed body
 * falls back to decoding each `%XX` run on its own.
 */
function percentDecode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text.replace(/(?:%[0-9A-Fa-f]{2})+/g, (run) => {
      try {
        return decodeURIComponent(run);
      } catch {
        return run;
      }
    });
  }
}

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
  const decoded = percentDecode(text);
  add(decoded);
  add(htmlUnescape(text));
  add(htmlUnescape(decoded));
  return [...seen];
}

const isQuoted = (line: string) => /^\s*>/.test(line);
const stripQuote = (line: string) => line.replace(/^\s*>\s?/, '');

const cleanText = (lines: string[]): string =>
  lines
    .filter(
      (line) => !/^\[Open on dev server\]/.test(line) && !/^!\[/.test(line),
    )
    .join('\n')
    .replace(/<!--[^]*?-->/g, '')
    .replace(/\[Open on dev server\]\([^)]*\)/g, '')
    .trim()
    .slice(0, PIN_TEXT_MAX);

interface Segment {
  quoted: boolean;
  lines: string[];
}

/** Consecutive quoted lines are one block; R3.3 allows several per comment. */
function segments(body: string): Segment[] {
  const out: Segment[] = [];
  for (const line of body.split('\n')) {
    const quoted = isQuoted(line);
    const text = quoted ? stripQuote(line) : line;
    const last = out[out.length - 1];
    if (last && last.quoted === quoted) last.lines.push(text);
    else out.push({ quoted, lines: [text] });
  }
  return out;
}

/**
 * The pin's display text: the block's own quote lines, minus the link and the
 * HTML marker, so a pin reads like the note the reviewer wrote rather than
 * like markdown source.
 */
export function pinText(body: string): string {
  const lines = (body || '').split('\n');
  const quoted = lines.filter(isQuoted).map(stripQuote);
  return cleanText(quoted.length ? quoted : lines);
}

/**
 * Word content only. Channels reformat the same pasted block, so "is this the
 * same block again (a second source) or an answer to it (a reply)?" can only
 * be asked of the words.
 */
export function normalizedText(body: string): string {
  return (body || '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLowerCase()
    .slice(0, NORMALIZED_MAX);
}

export function extractPins(body: string): PinMention[] {
  const found = new Map<string, PinMention>();
  for (const variant of textVariants(body || '')) {
    const parts = segments(variant);
    const hasQuote = parts.some(
      (part) => part.quoted && part.lines.some((line) => line.trim()),
    );
    const remainder = hasQuote
      ? cleanText(parts.filter((part) => !part.quoted).flatMap((p) => p.lines))
      : '';
    const whole = cleanText(parts.flatMap((part) => part.lines));
    for (const part of parts) {
      const text = part.quoted ? cleanText(part.lines) : whole;
      for (const line of part.lines) {
        for (const match of line.matchAll(PIN_RE)) {
          const [, id, anchorB64] = match;
          const hit = found.get(id);
          if (!hit) {
            found.set(id, {
              id,
              anchorB64: anchorB64 || null,
              quoted: part.quoted,
              text,
              normalized: normalizedText(text),
              remainder: part.quoted ? remainder : '',
            });
            continue;
          }
          if (!hit.anchorB64 && anchorB64) hit.anchorB64 = anchorB64;
          if (part.quoted) hit.quoted = true;
        }
      }
    }
  }
  return [...found.values()];
}

export function extractPinLinks(text: string): PinLink[] {
  return extractPins(text).map(({ id, anchorB64, quoted }) => ({
    id,
    anchorB64,
    quoted,
  }));
}
