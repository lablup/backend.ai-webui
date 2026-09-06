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

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
/** A distinct WELL-FORMED id per index — base32 is `a`-`z` and `2`-`7`. */
const nthId = (i: number) =>
  `c_${LETTERS[i % 26]}${LETTERS[Math.floor(i / 26)]}aaaaa`;

beforeEach(() => {
  sessionStorage.clear();
});

describe('the set as a value', () => {
  it('appends a pin at the end of the set', () => {
    const set = addPin(
      addPin(emptyDraft(), pin('c_aaaaaaa')),
      pin('c_bbbbbbb'),
    );

    expect(set.added).toBe(true);
    expect(set.pins.map((p) => p.id)).toEqual(['c_aaaaaaa', 'c_bbbbbbb']);
  });

  // The link de-duplicates by id, so the set it is rendered from must too.
  it('refuses a pin the set already holds', () => {
    const once = addPin(emptyDraft(), pin('c_aaaaaaa'));

    const twice = addPin(
      once,
      pin('c_aaaaaaa', { label: 'a different label' }),
    );

    expect(twice.added).toBe(false);
    expect(twice.pins).toHaveLength(1);
    expect(twice.pins[0].label).toBe('Sessions › c_aaaaaaa');
  });

  it(`stops at ${MAX_SET_PINS} pins`, () => {
    let set = emptyDraft();
    for (let i = 0; i < MAX_SET_PINS; i++) set = addPin(set, pin(nthId(i)));

    const over = addPin(set, pin('c_overaaa'));

    expect(over.added).toBe(false);
    expect(over.pins).toHaveLength(MAX_SET_PINS);
  });

  it('removes one pin and leaves the order of the rest', () => {
    const set = addPin(
      addPin(addPin(emptyDraft(), pin('c_aaaaaaa')), pin('c_bbbbbbb')),
      pin('c_ccccccc'),
    );

    expect(removePin(set, 'c_bbbbbbb').pins.map((p) => p.id)).toEqual([
      'c_aaaaaaa',
      'c_ccccccc',
    ]);
  });

  describe('merging a link into it', () => {
    const set = () =>
      addPin(addPin(emptyDraft(), pin('c_aaaaaaa')), pin('c_bbbbbbb'));

    it('appends what is new in link order and counts what was there', () => {
      const merged = mergePins(set(), [
        pin('c_ccccccc'),
        pin('c_aaaaaaa'),
        pin('c_ddddddd'),
      ]);

      expect(merged.pins.map((p) => p.id)).toEqual([
        'c_aaaaaaa',
        'c_bbbbbbb',
        'c_ccccccc',
        'c_ddddddd',
      ]);
      expect(merged).toMatchObject({ added: 2, present: 1 });
    });

    // A pin the set already holds keeps the `at`/`pr` it was picked with; the
    // link carries neither, so taking the link's copy would disown the id.
    it('leaves a pin the set already holds exactly as it was', () => {
      const merged = mergePins(set(), [
        pin('c_aaaaaaa', {
          origin: 'link',
          label: 'from the link',
          at: undefined,
        }),
      ]);

      expect(merged.pins[0].label).toBe('Sessions › c_aaaaaaa');
      expect(merged.pins[0].origin).toBe('pick');
      expect(merged).toMatchObject({ added: 0, present: 1 });
    });

    it('takes nothing past the cap', () => {
      let full = emptyDraft();
      for (let i = 0; i < MAX_SET_PINS; i++) full = addPin(full, pin(nthId(i)));

      const merged = mergePins(full, [pin('c_overaaa')]);

      expect(merged.pins).toHaveLength(MAX_SET_PINS);
      expect(merged.added).toBe(0);
    });
  });
});

// ✕ on a card, and the dock's switch: what is drawn, not what is pinned.
describe('what the set says is on screen', () => {
  it('marks one pin hidden, and takes the mark off again', () => {
    const store = createDraftStore();
    store.add(pin('c_aaaaaaa'));
    store.add(pin('c_bbbbbbb'));

    store.hide('c_bbbbbbb', true);
    expect(stored().map((p) => p.hidden)).toEqual([undefined, true]);

    store.hide('c_bbbbbbb', false);
    expect(stored().map((p) => p.hidden)).toEqual([undefined, undefined]);
  });

  // R5.5. The switch is hide-all / show-all; nothing may stay hidden behind a
  // control that says the cards are shown.
  it('clears every per-pin ✕ when the switch goes back on', () => {
    const store = createDraftStore();
    store.add(pin('c_aaaaaaa'));
    store.add(pin('c_bbbbbbb'));
    store.hide('c_aaaaaaa', true);
    store.hideCards(true);

    store.hideCards(false);

    expect(store.pins().map((p) => p.hidden)).toEqual([undefined, undefined]);
    expect(stored().map((p) => p.hidden)).toEqual([undefined, undefined]);
  });

  it('leaves those flags alone when the switch goes off', () => {
    const store = createDraftStore();
    store.add(pin('c_aaaaaaa'));
    store.hide('c_aaaaaaa', true);

    store.hideCards(true);

    expect(store.pins()[0].hidden).toBe(true);
  });

  it('remembers the switch across a reload of the tab', () => {
    const store = createDraftStore();
    store.add(pin('c_aaaaaaa'));

    store.hideCards(true);

    expect(createDraftStore().cardsHidden()).toBe(true);
  });

  // The stack write-back re-saves the set; the switch is not its business.
  it('keeps the switch through a save that does not mention it', () => {
    const store = createDraftStore();
    store.add(pin('c_aaaaaaa'));
    store.hideCards(true);

    store.save({ pins: [{ ...store.pins()[0], stack: ['in Thing'] }] });

    expect(store.cardsHidden()).toBe(true);
    expect(store.pins()[0].stack).toEqual(['in Thing']);
  });

  it('reads a hand-edited flag as no flag at all', () => {
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        v: 1,
        cardsHidden: 'yes',
        pins: [{ ...pin('c_aaaaaaa'), hidden: 'yes' }],
      }),
    );

    const store = createDraftStore();

    expect(store.cardsHidden()).toBe(false);
    expect(store.pins()).toEqual([]);
  });
});

describe('the stored mirror', () => {
  it('is written on every change and read back at construction', () => {
    const store = createDraftStore();
    store.add(pin('c_aaaaaaa'));
    store.add(pin('c_bbbbbbb'));

    expect(stored().map((p) => p.id)).toEqual(['c_aaaaaaa', 'c_bbbbbbb']);
    expect(
      createDraftStore()
        .pins()
        .map((p) => p.id),
    ).toEqual(['c_aaaaaaa', 'c_bbbbbbb']);
  });

  it('says whether the pin joined, and answers `has` and `isFull`', () => {
    const store = createDraftStore();

    expect(store.add(pin('c_aaaaaaa'))).toEqual({ added: true });
    expect(store.add(pin('c_aaaaaaa'))).toEqual({ added: false });
    expect(store.has('c_aaaaaaa')).toBe(true);
    expect(store.has('c_bbbbbbb')).toBe(false);
    expect(store.isFull()).toBe(false);
    for (let i = 0; i < MAX_SET_PINS; i++) store.add(pin(nthId(i)));
    expect(store.isFull()).toBe(true);
  });

  it('drops the key entirely once the set is cleared', () => {
    const store = createDraftStore();
    store.add(pin('c_aaaaaaa'));

    store.clear();

    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(store.pins()).toEqual([]);
  });

  it('removes one pin and keeps the rest stored', () => {
    const store = createDraftStore();
    store.add(pin('c_aaaaaaa'));
    store.add(pin('c_bbbbbbb'));

    store.remove('c_aaaaaaa');

    expect(stored().map((p) => p.id)).toEqual(['c_bbbbbbb']);
  });

  it('reloads what another tab of the same session left', () => {
    const store = createDraftStore();
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ v: 1, pins: [pin('c_zzzzzzz')] }),
    );

    expect(store.load().pins.map((p) => p.id)).toEqual(['c_zzzzzzz']);
    expect(store.pins().map((p) => p.id)).toEqual(['c_zzzzzzz']);
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
            pin('c_aaaaaaa'),
            { id: 'c_bbbbbbb' },
            { ...pin('c_ccccccc'), anchor: { v: 3, s: '', p: '/' } },
            {
              ...pin('c_ddddddd'),
              anchor: { v: 3, s: 'a', p: 'javascript:1' },
            },
            { ...pin('c_eeeeeee'), stack: 'not lines' },
            { ...pin('c_fffffff'), origin: 'pick', at: undefined },
            pin('c_ggggggg', { origin: 'link', at: undefined, pr: undefined }),
          ],
        }),
      );

      expect(
        createDraftStore()
          .pins()
          .map((p) => p.id),
      ).toEqual(['c_aaaaaaa', 'c_ggggggg']);
    });

    // A pin the link grammar cannot carry is a pin whose link every reader
    // drops on arrival — the store is the last place that can still say no.
    it('drops a pin whose id or payload no link could carry', () => {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          v: 1,
          pins: [
            pin('c_aaaaaaa'),
            pin('c_b'),
            pin('c_0000000'),
            pin('c_aaaaaaaa'),
            pin('C_AAAAAAA'),
            { ...pin('c_bbbbbbb'), anchorB64: 'short' },
            { ...pin('c_ccccccc'), anchorB64: 'has spaces in it' },
            { ...pin('c_ddddddd'), anchorB64: 'a'.repeat(2049) },
          ],
        }),
      );

      expect(
        createDraftStore()
          .pins()
          .map((p) => p.id),
      ).toEqual(['c_aaaaaaa']);
    });
  });

  // The reviewer keeps working; only the reload loses the set.
  it('keeps the set in memory when there is no storage at all', () => {
    const store = createDraftStore(null);

    store.add(pin('c_aaaaaaa'));

    expect(store.pins().map((p) => p.id)).toEqual(['c_aaaaaaa']);
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

    store.add(pin('c_aaaaaaa'));

    expect(store.pins().map((p) => p.id)).toEqual(['c_aaaaaaa']);
  });
});
