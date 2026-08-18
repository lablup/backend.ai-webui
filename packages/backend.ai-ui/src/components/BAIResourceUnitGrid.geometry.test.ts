import {
  chainLoops,
  deriveMetrics,
  extractSegments,
  gridSize,
  groupConsecutiveSegments,
  latticeColsForWidth,
  letterCellIndices,
  packGroups,
  placeCells,
  platePath,
  roundedLoopPath,
  type BoundarySeg,
  type UnitGridLayout,
  type UnitGridPlacedCell,
} from './BAIResourceUnitGrid.geometry';

const m = deriveMetrics();

const makeGroups = (sizes: Record<string, number>) =>
  Object.entries(sizes).map(([key, n]) => ({
    key,
    units: Array.from({ length: n }, (_, i) => ({ i })),
  }));

const place = (
  sizes: Record<string, number>,
  layout: UnitGridLayout,
  cols: number,
) => placeCells(packGroups(makeGroups(sizes), 256), layout, cols, m);

const colOf = (cell: { px: number }) =>
  Math.round((cell.px - m.pad) / m.stridePx);

/** Position along the packing path (row-major, odd rows reversed if serpentine). */
const flowSlot = (
  cell: { px: number; row: number },
  layout: UnitGridLayout,
  cols: number,
) => {
  const col = colOf(cell);
  const slotInRow =
    layout === 'serpentine' && cell.row % 2 === 1 ? cols - 1 - col : col;
  return cell.row * cols + slotInRow;
};

const byGroup = <TUnit>(placed: UnitGridPlacedCell<TUnit>[]) => {
  const map = new Map<string, UnitGridPlacedCell<TUnit>[]>();
  placed.forEach((c) => {
    const list = map.get(c.groupKey) ?? [];
    list.push(c);
    map.set(c.groupKey, list);
  });
  return map;
};

describe('deriveMetrics', () => {
  it('preserves the tuned prototype constants', () => {
    expect(m).toEqual({
      cellPx: 16,
      gapPx: 2,
      radiusPx: 4,
      platePadX: 5,
      platePadY: 4,
      rowGapPx: 14,
      pad: 7,
      stridePx: 18,
    });
  });

  it('derives lattice columns from width with a floor of 6', () => {
    expect(latticeColsForWidth(0, m)).toBe(6);
    // width = pad*2 + cols*stride - gap → exactly 10 columns
    expect(latticeColsForWidth(m.pad * 2 + 10 * m.stridePx - m.gapPx, m)).toBe(
      10,
    );
  });
});

describe('packGroups', () => {
  it('flattens groups in order, marking each first cell', () => {
    const packed = packGroups(makeGroups({ a: 2, b: 1 }), 256);
    expect(packed.map((c) => c.groupKey)).toEqual(['a', 'a', 'b']);
    expect(packed.map((c) => c.first)).toEqual([true, false, true]);
  });

  it('truncates each group at maxUnitsPerGroup', () => {
    const packed = packGroups(makeGroups({ a: 300, b: 5 }), 256);
    expect(packed.filter((c) => c.groupKey === 'a')).toHaveLength(256);
    expect(packed.filter((c) => c.groupKey === 'b')).toHaveLength(5);
  });

  it('yields no cells for empty groups and empty input', () => {
    expect(packGroups(makeGroups({ a: 0 }), 256)).toEqual([]);
    expect(packGroups([], 256)).toEqual([]);
  });

  it('preserves unit payloads (fractions ride along)', () => {
    const packed = packGroups(
      [{ key: 'a', units: [{ fraction: 1 }, { fraction: 0.5 }] }],
      256,
    );
    expect(packed[1].unit.fraction).toBe(0.5);
  });
});

describe('placeCells — serpentine', () => {
  const cols = 6;
  const placed = place({ a: 5, b: 7, c: 3 }, 'serpentine', cols);

  it('keeps every group contiguous along the packing path (zero interior gaps)', () => {
    byGroup(placed).forEach((cells) => {
      for (let i = 1; i < cells.length; i++) {
        expect(flowSlot(cells[i], 'serpentine', cols)).toBe(
          flowSlot(cells[i - 1], 'serpentine', cols) + 1,
        );
      }
    });
  });

  it('keeps every group one 4-connected region across row wraps', () => {
    byGroup(placed).forEach((cells) => {
      for (let i = 1; i < cells.length; i++) {
        const dRow = cells[i].row - cells[i - 1].row;
        const dCol = Math.abs(colOf(cells[i]) - colOf(cells[i - 1]));
        // Same row: adjacent column. Next row: directly below (serpentine).
        expect((dRow === 0 && dCol === 1) || (dRow === 1 && dCol === 0)).toBe(
          true,
        );
      }
    });
  });

  it('separates adjacent groups by exactly one seam slot', () => {
    const groups = ['a', 'b', 'c'].map(
      (k) => byGroup(placed).get(k) as UnitGridPlacedCell<unknown>[],
    );
    for (let i = 1; i < groups.length; i++) {
      const prevLast = flowSlot(groups[i - 1].at(-1)!, 'serpentine', cols);
      const nextFirst = flowSlot(groups[i][0], 'serpentine', cols);
      expect(nextFirst).toBe(prevLast + 2);
    }
  });

  it('preserves flow order and reverses odd rows', () => {
    for (let i = 1; i < placed.length; i++) {
      expect(flowSlot(placed[i], 'serpentine', cols)).toBeGreaterThan(
        flowSlot(placed[i - 1], 'serpentine', cols),
      );
      if (placed[i].row === placed[i - 1].row) {
        const dx = placed[i].px - placed[i - 1].px;
        // Odd rows run right→left on screen.
        expect(placed[i].row % 2 === 1 ? dx < 0 : dx > 0).toBe(true);
      }
    }
  });
});

describe('placeCells — wordwrap', () => {
  const cols = 6;

  it('always runs rows left→right', () => {
    const placed = place({ a: 4, b: 4, c: 9 }, 'wordwrap', cols);
    for (let i = 1; i < placed.length; i++) {
      if (placed[i].row === placed[i - 1].row) {
        expect(placed[i].px).toBeGreaterThan(placed[i - 1].px);
      }
    }
  });

  it('starts a group on the next row when it fits a row but not the remainder', () => {
    const placed = place({ a: 4, b: 4 }, 'wordwrap', cols);
    const b = byGroup(placed).get('b')!;
    expect(b[0].row).toBe(1);
    expect(colOf(b[0])).toBe(0);
    // The gap is at the END of row 0: `a` keeps columns 0..3.
    const a = byGroup(placed).get('a')!;
    expect(a.every((c) => c.row === 0)).toBe(true);
    expect(a.map(colOf)).toEqual([0, 1, 2, 3]);
  });

  it('never splits a group that fits in one row', () => {
    const placed = place({ a: 3, b: 5, c: 6, d: 2 }, 'wordwrap', cols);
    byGroup(placed).forEach((cells) => {
      if (cells.length <= cols) {
        expect(new Set(cells.map((c) => c.row)).size).toBe(1);
      }
    });
  });

  it('keeps larger-than-a-row groups connected via full middle rows', () => {
    const placed = place({ a: 2, b: 14 }, 'wordwrap', cols);
    const b = byGroup(placed).get('b')!;
    // Middle rows of a multi-row group span all columns.
    const rows = Array.from(new Set(b.map((c) => c.row)));
    rows.slice(1, -1).forEach((row) => {
      expect(b.filter((c) => c.row === row)).toHaveLength(cols);
    });
    for (let i = 1; i < b.length; i++) {
      const sameRow = b[i].row === b[i - 1].row;
      expect(sameRow || b[i].row === b[i - 1].row + 1).toBe(true);
    }
  });
});

describe('placeCells — degenerate cases', () => {
  it('handles zero groups', () => {
    const placed = place({}, 'serpentine', 6);
    expect(placed).toEqual([]);
    expect(gridSize(placed, 6, m).rowCount).toBe(1);
  });

  it('handles a single unit', () => {
    const placed = place({ a: 1 }, 'serpentine', 6);
    expect(placed).toHaveLength(1);
    expect(placed[0]).toMatchObject({ px: m.pad, py: m.pad, row: 0 });
  });

  it('handles an exactly-full row in both layouts', () => {
    (['serpentine', 'wordwrap'] as const).forEach((layout) => {
      const placed = place({ a: 6, b: 2 }, layout, 6);
      const a = byGroup(placed).get('a')!;
      const b = byGroup(placed).get('b')!;
      expect(a.every((c) => c.row === 0)).toBe(true);
      expect(b.every((c) => c.row === 1)).toBe(true);
    });
  });
});

describe('segments and plates', () => {
  const cols = 6;

  it('emits one segment per (group, row) with min/max extents', () => {
    // `a` fills slots 0–4 of row 0; the seam pushes `b` onto rows 1–2.
    const placed = place({ a: 5, b: 7 }, 'serpentine', cols);
    const segments = extractSegments(placed, m);
    const bSegs = segments.filter((s) => s.groupKey === 'b');
    expect(bSegs.map((s) => s.row)).toEqual([1, 2]);
    bSegs.forEach((s) => expect(s.x1).toBeGreaterThan(s.x0));
  });

  it('groups consecutive segments per group', () => {
    const placed = place({ a: 5, b: 7, c: 3 }, 'serpentine', cols);
    const groups = groupConsecutiveSegments(extractSegments(placed, m));
    expect(groups.map((g) => g[0].groupKey)).toEqual(['a', 'b', 'c']);
  });

  it('chains a rectangle boundary into one closed 4-corner loop', () => {
    const rect: BoundarySeg[] = [
      [0, 0, 10, 0],
      [10, 0, 10, 10],
      [10, 10, 0, 10],
      [0, 10, 0, 0],
    ];
    const loops = chainLoops(rect);
    expect(loops).toHaveLength(1);
    expect(loops[0]).toHaveLength(4);
  });

  it('merges collinear runs while chaining', () => {
    const rect: BoundarySeg[] = [
      [0, 0, 5, 0],
      [5, 0, 10, 0], // collinear continuation of the top edge
      [10, 0, 10, 10],
      [10, 10, 0, 10],
      [0, 10, 0, 0],
    ];
    const loops = chainLoops(rect);
    expect(loops).toHaveLength(1);
    expect(loops[0]).toHaveLength(4);
  });

  it('produces one closed rounded path for a multi-row serpentine group', () => {
    const placed = place({ a: 2, b: 8 }, 'serpentine', cols);
    const segGroups = groupConsecutiveSegments(extractSegments(placed, m));
    const d = platePath(segGroups[1], m);
    // Vertically-adjacent overlapping rows are bridged into ONE region.
    expect(d.match(/M/g)).toHaveLength(1);
    expect(d.match(/Z/g)).toHaveLength(1);
    expect(d).toContain('Q');
  });

  it('closes every loop it emits', () => {
    const placed = place({ a: 3, b: 4, c: 11 }, 'wordwrap', cols);
    groupConsecutiveSegments(extractSegments(placed, m)).forEach((segs) => {
      const d = platePath(segs, m);
      expect(d.match(/M/g)?.length).toBe(d.match(/Z/g)?.length);
      expect(d.length).toBeGreaterThan(0);
    });
  });

  it('rounds a unit square into a closed quadratic path', () => {
    const d = roundedLoopPath(
      [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ],
      4,
    );
    expect(d.startsWith('M')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    expect(d.match(/Q/g)).toHaveLength(4);
  });
});

describe('letterCellIndices', () => {
  it('picks the visual top-left cell, not the flow-first, on serpentine', () => {
    // `b` starts at slot 4 of row 0 and wraps onto reversed row 1.
    const placed = place({ a: 3, b: 5 }, 'serpentine', 6);
    const idx = letterCellIndices(placed);
    const b = placed[idx.get('b')!];
    const bCells = byGroup(placed).get('b')!;
    const minRow = Math.min(...bCells.map((c) => c.row));
    const minPx = Math.min(
      ...bCells.filter((c) => c.row === minRow).map((c) => c.px),
    );
    expect(b.row).toBe(minRow);
    expect(b.px).toBe(minPx);
  });

  it('is keyed by group key', () => {
    const placed = place({ a: 2, b: 2 }, 'wordwrap', 6);
    const idx = letterCellIndices(placed);
    expect(placed[idx.get('a')!].groupKey).toBe('a');
    expect(placed[idx.get('b')!].groupKey).toBe('b');
  });
});
