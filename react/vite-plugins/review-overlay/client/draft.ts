/**
 * The draft set: the pins this tab has made so far, and the single source of
 * truth for what the layer draws. Pure operations over a `DraftSet`, plus a
 * thin `sessionStorage` mirror so a reload — including the full reload a deep
 * link causes — does not throw the set away. Reads are guarded: a malformed
 * value is an empty set, never a crash, and a tab with storage switched off
 * still keeps its set until it reloads.
 */
import { isAnchorV3 } from './anchor-guard.js';
import { PIN_BODY_SRC } from './codec.js';
import { dedupeById, MAX_SET_PINS } from './deeplink.js';
import type { DraftSet, SetPin } from './types.js';

export const DRAFT_KEY = 'bai-review:draft-set';
export { MAX_SET_PINS };

export const emptyDraft = (): DraftSet => ({ v: 1, pins: [] });

const isStrings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((line) => typeof line === 'string');

/**
 * The `<id>.<anchor>` a stored pin has to be able to emit — the same grammar
 * `parseFragments` reads back, so what the store keeps is what a link carries.
 */
const PIN_BODY_RE = new RegExp(`^${PIN_BODY_SRC}$`);

/** Storage is ours, but a half-written or hand-edited value is not a set. */
export function isSetPin(value: unknown): value is SetPin {
  if (!value || typeof value !== 'object') return false;
  const pin = value as Record<string, unknown>;
  if (typeof pin.id !== 'string' || typeof pin.anchorB64 !== 'string')
    return false;
  // A pin whose id or payload no reader could parse is a pin whose link is
  // dropped on arrival; the set is better off without it than carrying it.
  if (!PIN_BODY_RE.test(`${pin.id}.${pin.anchorB64}`)) return false;
  if (pin.origin !== 'pick' && pin.origin !== 'link') return false;
  if (typeof pin.label !== 'string') return false;
  if (typeof pin.appHash !== 'string') return false;
  if (pin.note !== undefined && typeof pin.note !== 'string') return false;
  if (pin.hidden !== undefined && pin.hidden !== true) return false;
  if (!isStrings(pin.stack)) return false;
  if (
    pin.origin === 'pick' &&
    (typeof pin.at !== 'string' || typeof pin.pr !== 'number')
  )
    return false;
  return isAnchorV3(pin.anchor);
}

/** Whatever of a stored set is still a set; anything else is an empty one. */
export function parseDraft(raw: string | null): DraftSet {
  if (!raw) return emptyDraft();
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return emptyDraft();
  }
  if (!value || typeof value !== 'object') return emptyDraft();
  const set = value as Record<string, unknown>;
  if (set.v !== 1 || !Array.isArray(set.pins)) return emptyDraft();
  return {
    v: 1,
    pins: dedupeById(set.pins.filter(isSetPin)).slice(0, MAX_SET_PINS),
    ...(set.cardsHidden === true ? { cardsHidden: true as const } : {}),
  };
}

export interface AddResult {
  added: boolean;
}

export interface MergeResult {
  /** Pins the set did not have, appended in the order they were given. */
  added: number;
  /** Pins it already had, which keep their place and their stored data. */
  present: number;
}

/** Appended at the end, once. A full set takes nothing more. */
export function addPin(set: DraftSet, pin: SetPin): DraftSet & AddResult {
  if (set.pins.length >= MAX_SET_PINS || set.pins.some((p) => p.id === pin.id))
    return { ...set, added: false };
  return { ...set, pins: [...set.pins, pin], added: true };
}

export function removePin(set: DraftSet, id: string): DraftSet {
  return { ...set, pins: set.pins.filter((pin) => pin.id !== id) };
}

/**
 * A card hidden. The pin keeps its place, its note and its identity — only its
 * card goes, and the flag is stored so a reload does not bring it back.
 */
export function hidePin(set: DraftSet, id: string, hidden: boolean): DraftSet {
  return {
    ...set,
    pins: set.pins.map((pin) => {
      if (pin.id !== id) return pin;
      const { hidden: _was, ...rest } = pin;
      return (hidden ? { ...rest, hidden: true } : rest) as SetPin;
    }),
  };
}

/** The dock's switch, over the whole set. */
export function hideCards(set: DraftSet, hidden: boolean): DraftSet {
  const { cardsHidden: _was, ...rest } = set;
  return hidden ? { ...rest, cardsHidden: true } : rest;
}

/**
 * R5.5. The switch is hide-all / SHOW-all, not suspend-and-restore: turning it
 * on clears every per-pin hide so nothing is left stranded behind a control that
 * says the cards are shown.
 */
export function showAllPins(set: DraftSet): DraftSet {
  return {
    ...set,
    pins: set.pins.map((pin) => {
      const { hidden: _was, ...rest } = pin;
      return rest as SetPin;
    }),
  };
}

/**
 * A link merges into the set rather than replacing it: what is already there
 * keeps its place and the data it was stored with, and the rest is appended
 * in link order. The cap is what stops a pasted hash from growing it forever.
 */
export function mergePins(
  set: DraftSet,
  pins: SetPin[],
): DraftSet & MergeResult {
  const next = [...set.pins];
  let added = 0;
  let present = 0;
  for (const pin of dedupeById(pins)) {
    if (next.some((held) => held.id === pin.id)) {
      present++;
      continue;
    }
    if (next.length >= MAX_SET_PINS) continue;
    next.push(pin);
    added++;
  }
  return { ...set, pins: next, added, present };
}

const safeStorage = (): Storage | null => {
  try {
    return sessionStorage;
  } catch {
    // A tab with storage disabled keeps its set in memory until it reloads.
    return null;
  }
};

export interface DraftStore {
  load(): DraftSet;
  /** Fields the given set does not name — the switch, say — are kept. */
  save(set: Partial<DraftSet> & { pins: SetPin[] }): void;
  pins(): SetPin[];
  has(id: string): boolean;
  isFull(): boolean;
  add(pin: SetPin): AddResult;
  remove(id: string): void;
  clear(): void;
  merge(pins: SetPin[]): MergeResult;
  /** Hide or show one card. */
  hide(id: string, hidden: boolean): void;
  cardsHidden(): boolean;
  /** Turning the switch back ON also un-hides every individually hidden pin. */
  hideCards(hidden: boolean): void;
}

export function createDraftStore(
  storage: Storage | null = safeStorage(),
): DraftStore {
  const read = (): DraftSet => {
    try {
      return parseDraft(storage?.getItem(DRAFT_KEY) ?? null);
    } catch {
      return emptyDraft();
    }
  };
  let current = read();
  const write = (set: DraftSet): void => {
    current = set;
    try {
      if (set.pins.length) storage?.setItem(DRAFT_KEY, JSON.stringify(set));
      else storage?.removeItem(DRAFT_KEY);
    } catch {
      // Quota, or storage went away mid-session; memory still holds the set.
    }
  };
  return {
    load: () => (current = read()),
    save: (set) =>
      write({
        ...current,
        ...set,
        v: 1,
        pins: dedupeById(set.pins).slice(0, MAX_SET_PINS),
      }),
    pins: () => current.pins,
    has: (id) => current.pins.some((pin) => pin.id === id),
    isFull: () => current.pins.length >= MAX_SET_PINS,
    add(pin) {
      const { added, ...set } = addPin(current, pin);
      if (added) write(set);
      return { added };
    },
    remove(id) {
      write(removePin(current, id));
    },
    clear() {
      write(emptyDraft());
    },
    merge(pins) {
      const { added, present, ...set } = mergePins(current, pins);
      if (added) write(set);
      return { added, present };
    },
    hide(id, hidden) {
      write(hidePin(current, id, hidden));
    },
    cardsHidden: () => current.cardsHidden === true,
    hideCards(hidden) {
      const next = hideCards(current, hidden);
      write(hidden ? next : showAllPins(next));
    },
  };
}
