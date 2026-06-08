/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  mergeHiddenLayoutEntries,
  reconcileBoardLayout,
  type BoardLayoutEntry,
} from './boardLayout';

const entry = (id: string): BoardLayoutEntry => ({
  id,
  rowSpan: 2,
  columnSpan: 2,
  definition: { minRowSpan: 2, minColumnSpan: 2 },
});

const ids = (layout: ReadonlyArray<BoardLayoutEntry>) =>
  layout.map((item) => item.id);

describe('reconcileBoardLayout', () => {
  it('preserves the persisted order when every id is renderable', () => {
    const result = reconcileBoardLayout({
      persistedLayout: [entry('b'), entry('c'), entry('a')],
      defaultLayout: [entry('a'), entry('b'), entry('c')],
      renderableIds: new Set(['a', 'b', 'c']),
    });
    expect(ids(result)).toEqual(['b', 'c', 'a']);
  });

  it('keeps the persisted entry object (spans/offset) rather than the default', () => {
    const persisted: BoardLayoutEntry = { ...entry('a'), rowSpan: 4 };
    const result = reconcileBoardLayout({
      persistedLayout: [persisted],
      defaultLayout: [entry('a')],
      renderableIds: new Set(['a']),
    });
    expect(result).toEqual([persisted]);
  });

  it('drops persisted ids that are no longer renderable', () => {
    const result = reconcileBoardLayout({
      persistedLayout: [entry('a'), entry('removedPanel'), entry('b')],
      defaultLayout: [entry('a'), entry('b')],
      renderableIds: new Set(['a', 'b']),
    });
    expect(ids(result)).toEqual(['a', 'b']);
  });

  it('appends default ids missing from the persisted list, in seed order', () => {
    const result = reconcileBoardLayout({
      persistedLayout: [entry('b')],
      defaultLayout: [entry('a'), entry('b'), entry('c'), entry('d')],
      renderableIds: new Set(['a', 'b', 'c', 'd']),
    });
    // Persisted first, then unpersisted defaults in the defaultLayout order.
    expect(ids(result)).toEqual(['b', 'a', 'c', 'd']);
  });

  it('does not re-append a default whose id is persisted, even if duplicated', () => {
    // Documents current behavior: persisted duplicates pass through verbatim
    // (no dedupe), but the matching default is not appended a third time.
    const result = reconcileBoardLayout({
      persistedLayout: [entry('a'), entry('a')],
      defaultLayout: [entry('a'), entry('b')],
      renderableIds: new Set(['a', 'b']),
    });
    expect(ids(result)).toEqual(['a', 'a', 'b']);
  });

  it('returns the pure default order when nothing is persisted', () => {
    const defaultLayout = [entry('a'), entry('b'), entry('c')];
    const result = reconcileBoardLayout({
      persistedLayout: [],
      defaultLayout,
      renderableIds: new Set(['a', 'b', 'c']),
    });
    expect(result).toEqual(defaultLayout);
  });
});

describe('mergeHiddenLayoutEntries', () => {
  const entry = (id: string, rowSpan = 2) => ({ id, rowSpan, columnSpan: 2 });

  it('keeps entries the board did not report, so hidden panels do not lose their slot', () => {
    const previous = [
      entry('mySession'),
      entry('custom-1'),
      entry('myResource'),
    ];
    // The board only reports what it renders — the custom panel is opted out.
    const reported = [entry('myResource', 3), entry('mySession')];

    const merged = mergeHiddenLayoutEntries(reported, previous);

    expect(merged.map((item) => item.id)).toEqual([
      'myResource',
      'mySession',
      'custom-1',
    ]);
    // The reported geometry wins for reported ids...
    expect(merged[0].rowSpan).toBe(3);
    // ...and the hidden entry keeps the geometry it was stored with.
    expect(merged[2]).toEqual(entry('custom-1'));
  });

  it('is a plain overwrite when everything was reported', () => {
    const previous = [entry('a'), entry('b')];
    const reported = [entry('b', 4), entry('a')];

    expect(mergeHiddenLayoutEntries(reported, previous)).toEqual(reported);
  });

  it('tolerates an empty previous list', () => {
    const reported = [entry('a')];
    expect(mergeHiddenLayoutEntries(reported, [])).toEqual(reported);
  });
});
