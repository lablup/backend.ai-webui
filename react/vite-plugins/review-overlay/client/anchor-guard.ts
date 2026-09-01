/**
 * What an anchor must look like before anything acts on it. A `#bai=v3` link
 * is pasted by a stranger, so every field is checked here before it reaches
 * `querySelector` and `location.assign`.
 */
import { isSafePath } from './codec.js';
import type { AnchorV3 } from './types.js';

/** Every string is bounded: the payload comes off a public PR comment. */
export const SELECTOR_MAX = 1024;
const NAME_MAX = 256;
const TXT_MAX = 64;

/** A tag name reaches `querySelectorAll`; nothing else may look like one. */
export const TAG_RE = /^[a-z][a-z0-9-]*$/;

const isText = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.length <= max;
const isFraction = (value: unknown): boolean =>
  typeof value === 'number' && Number.isFinite(value);

export function isAnchorV3(value: unknown): value is AnchorV3 {
  if (!value || typeof value !== 'object') return false;
  const a = value as Record<string, unknown>;
  if (a.v !== 3) return false;
  if (!isText(a.s, SELECTOR_MAX) || !a.s) return false;
  if (!isSafePath(a.p)) return false;
  if (a.q !== undefined && (!isText(a.q, SELECTOR_MAX) || /[#\s]/.test(a.q)))
    return false;
  if (a.tag !== undefined && (!isText(a.tag, NAME_MAX) || !TAG_RE.test(a.tag)))
    return false;
  if (a.txt !== undefined && !isText(a.txt, TXT_MAX)) return false;
  if (a.tid !== undefined && !isText(a.tid, NAME_MAX)) return false;
  if (a.rect !== undefined) {
    const r = a.rect as Record<string, unknown> | null;
    if (!r || typeof r !== 'object') return false;
    if (!['x', 'y', 'w', 'h'].every((k) => isFraction(r[k]))) return false;
  }
  if (a.c !== undefined) {
    const c = a.c as Record<string, unknown> | null;
    if (!c || typeof c !== 'object') return false;
    if (!isText(c.name, NAME_MAX) || !isText(c.src, NAME_MAX)) return false;
    if (c.dn !== undefined && !isText(c.dn, NAME_MAX)) return false;
  }
  return true;
}
