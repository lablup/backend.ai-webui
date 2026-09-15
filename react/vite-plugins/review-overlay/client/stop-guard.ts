/**
 * A walkthrough Stop is a pin the implementing session authored: the same
 * `#bai=v3` anchor plus optional fields saying what changed and what to check
 * (FR-3949, additive under ADR 0002). Every cap lives here, shared by the
 * decoder and by whatever mints a stop.
 */
import type { AnchorCodeRef, AnchorV3, AnchorVia } from './types.js';

export const STOP_TEXT_MAX = 280;
export const STOP_LITERAL_MAX = 40;
export const STOP_KIND_MAX = 64;
export const CODE_PATH_MAX = 256;
export const CODE_REFS_MAX = 3;
export const VIA_MAX = 8;
export const VIA_TEXT_MAX = 120;
const SHA_RE = /^[0-9a-f]{40}$/;

/**
 * Query params that describe a moment, not a place: the session launcher
 * writes its whole form into `formValues`, so an anchor carrying it never
 * matches the URL a reader lands on. Dropped at capture for every pin.
 */
export const VOLATILE_QUERY_PARAMS = ['formValues'];

/** Where a `dlg` pick lives: Astryx's native `<dialog>`, or an ARIA dialog. */
export const DIALOG_SELECTOR = 'dialog, [role="dialog"], [role="alertdialog"]';

/** A stop is any anchor that says what to check. */
export const isStop = (anchor: AnchorV3 | null | undefined): boolean =>
  typeof anchor?.ck === 'string';

const isText = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.length <= max;
const isLine = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

const isCodeRef = (value: unknown): value is AnchorCodeRef => {
  if (!value || typeof value !== 'object') return false;
  const ref = value as Record<string, unknown>;
  if (!isText(ref.path, CODE_PATH_MAX) || !ref.path) return false;
  if (!isLine(ref.line)) return false;
  return ref.to === undefined || (isLine(ref.to) && ref.to >= ref.line);
};

const isVia = (value: unknown): value is AnchorVia => {
  if (!value || typeof value !== 'object') return false;
  const click = (value as Record<string, unknown>).click;
  if (!click || typeof click !== 'object') return false;
  const c = click as Record<string, unknown>;
  const text = c.text === undefined || isText(c.text, VIA_TEXT_MAX);
  const tid = c.tid === undefined || isText(c.tid, VIA_TEXT_MAX);
  return text && tid && (c.text !== undefined || c.tid !== undefined);
};

type Check = (value: unknown) => boolean;
const list =
  (item: Check, max: number): Check =>
  (value) =>
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= max &&
    value.every(item);

/** Field → the shape it must have; anything else is dropped, never fatal. */
const STOP_FIELDS: Record<string, Check> = {
  ch: (v) => isText(v, STOP_TEXT_MAX),
  ck: (v) => isText(v, STOP_TEXT_MAX),
  old: (v) => isText(v, STOP_LITERAL_MAX),
  new: (v) => isText(v, STOP_LITERAL_MAX),
  type: (v) => v === 'added' || v === 'modified',
  kind: (v) => isText(v, STOP_KIND_MAX),
  code: list(isCodeRef, CODE_REFS_MAX),
  sha: (v) => typeof v === 'string' && SHA_RE.test(v),
  pr: (v) => isLine(v),
  via: list(isVia, VIA_MAX),
  dlg: (v) => v === 1,
};

/**
 * The decoder's answer to a stop field it does not like: drop that field and
 * keep the pin. A link is pasted by a stranger, but a bad `code` list must
 * not cost the reader the element it points at.
 */
export function stripInvalidStopFields<T extends Record<string, unknown>>(
  anchor: T,
): T {
  let next: T | null = null;
  for (const [field, ok] of Object.entries(STOP_FIELDS)) {
    if (anchor[field] === undefined || ok(anchor[field])) continue;
    next ??= { ...anchor };
    delete next[field];
  }
  return next ?? anchor;
}

/** Every stop field present is well-formed (what `stripInvalidStopFields` leaves). */
export const hasValidStopFields = (anchor: Record<string, unknown>): boolean =>
  Object.entries(STOP_FIELDS).every(
    ([field, ok]) => anchor[field] === undefined || ok(anchor[field]),
  );

const keyOf = (pair: string): string => {
  const key = pair.split('=')[0];
  try {
    return decodeURIComponent(key);
  } catch {
    return key;
  }
};

/**
 * `location.search` minus the params that never survive a reload. Textual on
 * purpose: `URLSearchParams` would re-encode `a%20b` as `a+b` on the way out.
 */
export function stripVolatileQuery(search: string): string {
  const raw = search.replace(/^\?/, '');
  if (!raw) return '';
  return raw
    .split('&')
    .filter((pair) => !VOLATILE_QUERY_PARAMS.includes(keyOf(pair)))
    .join('&');
}
