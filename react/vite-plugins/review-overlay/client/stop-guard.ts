/**
 * A walkthrough Stop is a pin the implementing session authored: the same
 * `#bai=v3` anchor plus optional fields saying what changed and what to check
 * (FR-3949, additive under ADR 0002). Every cap lives here, shared by the
 * decoder and by whatever mints a stop.
 */
import type {
  AnchorCodeRef,
  AnchorI18nText,
  AnchorV3,
  AnchorVia,
} from './types.js';

export const STOP_TEXT_MAX = 280;
export const STOP_LITERAL_MAX = 40;
export const STOP_KIND_MAX = 64;
export const CODE_PATH_MAX = 256;
export const CODE_REFS_MAX = 3;
export const VIA_MAX = 8;
export const VIA_TEXT_MAX = 120;
/** A stop carries its own wording plus this many translations (FR-4057). */
export const I18N_LANGS_MAX = 4;
const SHA_RE = /^[0-9a-f]{40}$/;
/** `ko`, `en`, `pt-BR` — the shape `resources/i18n` names a language by. */
const LANG_RE = /^[a-z]{2}(-[A-Za-z]{2,4})?$/;

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

/**
 * A translation says at least what changed and what to check; the literals and
 * the `via` sentence fall back to the base language when it omits them.
 */
const isI18nText = (value: unknown): value is AnchorI18nText => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const text = value as Record<string, unknown>;
  if (!isText(text.ch, STOP_TEXT_MAX) || !isText(text.ck, STOP_TEXT_MAX))
    return false;
  if (text.old !== undefined && !isText(text.old, STOP_LITERAL_MAX))
    return false;
  if (text.new !== undefined && !isText(text.new, STOP_LITERAL_MAX))
    return false;
  return text.via === undefined || list(isVia, VIA_MAX)(text.via);
};

const isI18n = (value: unknown): boolean => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const langs = Object.keys(value as object);
  if (!langs.length || langs.length > I18N_LANGS_MAX) return false;
  return langs.every(
    (lang) =>
      LANG_RE.test(lang) &&
      isI18nText((value as Record<string, unknown>)[lang]),
  );
};

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
  lng: (v) => typeof v === 'string' && LANG_RE.test(v),
  i18n: isI18n,
};

/** The stop fields by name — what `stripStopFields` takes back off. */
export const STOP_FIELD_NAMES = Object.keys(STOP_FIELDS);

/**
 * The same anchor as an ORDINARY pin: every stop field gone, every element
 * signal (`s`, `p`, `q`, `tag`, `txt`, `tid`, `rect`, `c`) kept.
 *
 * A reviewer's remark about a stop is a finding of their own, and
 * `review-pins parse` leaves stops out of its findings by default — a
 * walkthrough's own link would otherwise read as N things to answer. So what
 * the reviewer copies is a pin, pointing at the same element.
 */
export function stripStopFields(anchor: AnchorV3): AnchorV3 {
  const next: AnchorV3 = { ...anchor };
  for (const field of STOP_FIELD_NAMES)
    delete (next as unknown as Record<string, unknown>)[field];
  return next;
}

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

/**
 * The languages this stop can be read in, base first — empty unless it was
 * minted with both `lng` and `i18n`, which is what the toggle keys off.
 */
export function stopLanguages(anchor: AnchorV3): string[] {
  if (!anchor.lng || !anchor.i18n) return [];
  const langs = [anchor.lng];
  for (const lang of Object.keys(anchor.i18n))
    if (!langs.includes(lang)) langs.push(lang);
  return langs.length > 1 ? langs : [];
}

/** One stop's wording, in whichever language the reader is holding it in. */
export interface StopText {
  ch: string;
  ck: string;
  old?: string | undefined;
  new?: string | undefined;
  via?: AnchorVia[] | undefined;
}

/** The stop's wording in `lang`, falling back per field to the base one. */
export function stopTextIn(anchor: AnchorV3, lang?: string | null): StopText {
  const base = {
    ch: anchor.ch ?? '',
    ck: anchor.ck ?? '',
    old: anchor.old,
    new: anchor.new,
    via: anchor.via,
  };
  const text = lang && lang !== anchor.lng ? anchor.i18n?.[lang] : undefined;
  if (!text) return base;
  return {
    ch: text.ch ?? base.ch,
    ck: text.ck ?? base.ck,
    old: text.old ?? base.old,
    new: text.new ?? base.new,
    via: text.via ?? base.via,
  };
}
