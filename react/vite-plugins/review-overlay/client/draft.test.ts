/**
 * The draft set store (FR-3858): what the tab is building right now. Pure
 * operations over the set, and a `sessionStorage` mirror that has to survive
 * a hand-edited value, a full quota and a tab with storage switched off.
 */
import {
  addPin,
  createDraftStore,
  DRAFT_KEY,
  emptyDraft,
  MAX_SET_PINS,
  mergePins,
  parseDraft,
  removePin,
} from './draft.js';
import type { SetPin } from './types.js';
import { beforeEach, describe, expect, it } from 'vitest';

const pin = (id: string, over: Record<string, unknown> = {}): SetPin =>
  ({
    id,
    origin: 'pick',
    anchor: { v: 3, s: `[data-testid="${id}"]`, p: '/session/start' },
    anchorB64: `PAYLOAD_${id}`,
    label: `Sessions › ${id}`,
    appHash: '',
    stack: [],
    at: '2026-08-31T09:00:00Z',
    pr: 9330,
    ...over,
  }) as unknown as SetPin;

const stored = () => parseDraft(sessionStorage.getItem(DRAFT_KEY)).pins;

beforeEach(() => {
  sessionStorage.clear();
});

describe('the set as a value', () => {
  it('appends a pin at the end of the set', () => {
    const set = addPin(addPin(emptyDraft(), pin('c_a')), pin('c_b'));

    expect(set.added).toBe(true);
    expect(set.pins.map((p) => p.id)).toEqual(['c_a', 'c_b']);
  });

  // The link de-duplicates by id, so the set it is rendered from must too.
  it('refuses a pin the set already holds', () => {
    const once = addPin(emptyDraft(), pin('c_a'));

    const twice = addPin(once, pin('c_a', { label: 'a different label' }));

    expect(twice.added).toBe(false);
    expect(twice.pins).toHaveLength(1);
    expect(twice.pins[0].label).toBe('Sessions › c_a');
  });

  it(`stops at ${MAX_SET_PINS} pins`, () => {
    let set = emptyDraft();
    for (let i = 0; i < MAX_SET_PINS; i++) set = addPin(set, pin(`c_${i}`));

    const over = addPin(set, pin('c_over'));

    expect(over.added).toBe(false);
    expect(over.pins).toHaveLength(MAX_SET_PINS);
  });

  it('removes one pin and leaves the order of the rest', () => {
    const set = addPin(
      addPin(addPin(emptyDraft(), pin('c_a')), pin('c_b')),
      pin('c_c'),
    );

    expect(removePin(set, 'c_b').pins.map((p) => p.id)).toEqual(['c_a', 'c_c']);
  });

  describe('merging a link into it', () => {
    const set = () => addPin(addPin(emptyDraft(), pin('c_a')), pin('c_b'));

    it('appends what is new in link order and counts what was there', () => {
      const merged = mergePins(set(), [pin('c_c'), pin('c_a'), pin('c_d')]);

      expect(merged.pins.map((p) => p.id)).toEqual([
        'c_a',
        'c_b',
        'c_c',
        'c_d',
      ]);
      expect(merged).toMatchObject({ added: 2, present: 1 });
    });

    // A pin the set already holds keeps the `at`/`pr` it was picked with; the
    // link carries neither, so taking the link's copy would disown the id.
    it('leaves a pin the set already holds exactly as it was', () => {
      const merged = mergePins(set(), [
        pin('c_a', { origin: 'link', label: 'from the link', at: undefined }),
      ]);

      expect(merged.pins[0].label).toBe('Sessions › c_a');
      expect(merged.pins[0].origin).toBe('pick');
      expect(merged).toMatchObject({ added: 0, present: 1 });
    });

    it('takes nothing past the cap', () => {
      let full = emptyDraft();
      for (let i = 0; i < MAX_SET_PINS; i++) full = addPin(full, pin(`c_${i}`));

      const merged = mergePins(full, [pin('c_over')]);

      expect(merged.pins).toHaveLength(MAX_SET_PINS);
      expect(merged.added).toBe(0);
    });
  });
});

describe('the stored mirror', () => {
  it('is written on every change and read back at construction', () => {
    const store = createDraftStore();
    store.add(pin('c_a'));
    store.add(pin('c_b'));

    expect(stored().map((p) => p.id)).toEqual(['c_a', 'c_b']);
    expect(createDraftStore().pins().map((p) => p.id)).toEqual(['c_a', 'c_b']);
  });

  it('says whether the pin joined, and answers `has` and `isFull`', () => {
    const store = createDraftStore();

    expect(store.add(pin('c_a'))).toEqual({ added: true });
    expect(store.add(pin('c_a'))).toEqual({ added: false });
    expect(store.has('c_a')).toBe(true);
    expect(store.has('c_b')).toBe(false);
    expect(store.isFull()).toBe(false);
    for (let i = 0; i < MAX_SET_PINS; i++) store.add(pin(`c_${i}`));
    expect(store.isFull()).toBe(true);
  });

  it('drops the key entirely once the set is cleared', () => {
    const store = createDraftStore();
    store.add(pin('c_a'));

    store.clear();

    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(store.pins()).toEqual([]);
  });

  it('removes one pin and keeps the rest stored', () => {
    const store = createDraftStore();
    store.add(pin('c_a'));
    store.add(pin('c_b'));

    store.remove('c_a');

    expect(stored().map((p) => p.id)).toEqual(['c_b']);
  });

  it('reloads what another tab of the same session left', () => {
    const store = createDraftStore();
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ v: 1, pins: [pin('c_z')] }),
    );

    expect(store.load().pins.map((p) => p.id)).toEqual(['c_z']);
    expect(store.pins().map((p) => p.id)).toEqual(['c_z']);
  });

  // The value is ours, but a reload can land on a half-written or a
  // hand-edited one, and an empty set is always a usable answer.
  describe('a value that is not a set', () => {
    it('reads as empty when it is not JSON at all', () => {
      sessionStorage.setItem(DRAFT_KEY, '{not json');
      expect(createDraftStore().pins()).toEqual([]);
    });

    it('reads as empty when the version is not this one', () => {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ v: 2, pins: [] }));
      expect(parseDraft(sessionStorage.getItem(DRAFT_KEY)).pins).toEqual([]);
    });

    it('keeps the members that are still pins and drops the rest', () => {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          v: 1,
          pins: [
            pin('c_a'),
            { id: 'c_b' },
            { ...pin('c_c'), anchor: { v: 3, s: '', p: '/' } },
            { ...pin('c_d'), anchor: { v: 3, s: 'a', p: 'javascript:1' } },
            { ...pin('c_e'), stack: 'not lines' },
            { ...pin('c_f'), origin: 'pick', at: undefined },
            pin('c_g', { origin: 'link', at: undefined, pr: undefined }),
          ],
        }),
      );

      expect(createDraftStore().pins().map((p) => p.id)).toEqual([
        'c_a',
        'c_g',
      ]);
    });
  });

  // The reviewer keeps working; only the reload loses the set.
  it('keeps the set in memory when there is no storage at all', () => {
    const store = createDraftStore(null);

    store.add(pin('c_a'));

    expect(store.pins().map((p) => p.id)).toEqual(['c_a']);
    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it('keeps the set in memory when the write is refused', () => {
    const store = createDraftStore({
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => undefined,
    } as unknown as Storage);

    store.add(pin('c_a'));

    expect(store.pins().map((p) => p.id)).toEqual(['c_a']);
  });
});
