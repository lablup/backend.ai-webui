/**
 * The draft set: the pins this tab has made so far, and the single source of
 * truth for what the layer draws. Pure operations over a `DraftSet`, plus a
 * thin `sessionStorage` mirror so a reload — including the full reload a deep
 * link causes — does not throw the set away. Reads are guarded: a malformed
 * value is an empty set, never a crash, and a tab with storage switched off
 * still keeps its set until it reloads.
 */
import { isAnchorV3 } from './anchor-guard.js';
import { dedupeById, MAX_SET_PINS } from './deeplink.js';
import type { DraftSet, SetPin } from './types.js';

export const DRAFT_KEY = 'bai-review:draft-set';
export { MAX_SET_PINS };

export const emptyDraft = (): DraftSet => ({ v: 1, pins: [] });

const isStrings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((line) => typeof line === 'string');

/** Storage is ours, but a half-written or hand-edited value is not a set. */
export function isSetPin(value: unknown): value is SetPin {
  if (!value || typeof value !== 'object') return false;
  const pin = value as Record<string, unknown>;
  if (typeof pin.id !== 'string' || !pin.id) return false;
  if (pin.origin !== 'pick' && pin.origin !== 'link') return false;
  if (typeof pin.anchorB64 !== 'string' || !pin.anchorB64) return false;
  if (typeof pin.label !== 'string') return false;
  if (typeof pin.appHash !== 'string') return false;
  if (pin.note !== undefined && typeof pin.note !== 'string') return false;
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
  return { v: 1, pins: [...set.pins, pin], added: true };
}

export function removePin(set: DraftSet, id: string): DraftSet {
  return { v: 1, pins: set.pins.filter((pin) => pin.id !== id) };
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
  return { v: 1, pins: next, added, present };
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
  save(set: DraftSet): void;
  pins(): SetPin[];
  has(id: string): boolean;
  isFull(): boolean;
  add(pin: SetPin): AddResult;
  remove(id: string): void;
  clear(): void;
  merge(pins: SetPin[]): MergeResult;
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
      write({ v: 1, pins: dedupeById(set.pins).slice(0, MAX_SET_PINS) }),
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
  };
}
