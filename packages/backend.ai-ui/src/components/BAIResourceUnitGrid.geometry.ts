/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Pure geometry for <BAIResourceUnitGrid> (FR-3569): lattice packing
 (serpentine / word-wrap), per-group row segments, boundary-loop chaining and
 rounded rectilinear paths. No React, no DOM — unit-testable as plain data.
 Constants and formulas are ported unchanged from the tuned prototype
 (`prototype/session-resource-grid`).
*/

export type UnitGridLayout = 'serpentine' | 'wordwrap';

export interface UnitGridMetrics {
  cellPx: number;
  gapPx: number;
  radiusPx: number;
  /** Inner padding between a group plate's border and its cells. */
  platePadX: number;
  platePadY: number;
  /** Clear vertical space between plates of adjacent rows. */
  rowGapPx: number;
  /** Outer padding of the whole lattice. */
  pad: number;
  /** Horizontal distance between adjacent lattice columns. */
  stridePx: number;
}

export const deriveMetrics = (
  cellPx = 16,
  gapPx = 2,
  radiusPx = 4,
): UnitGridMetrics => {
  const platePadX = gapPx * 2 + 1;
  const platePadY = gapPx * 2;
  return {
    cellPx,
    gapPx,
    radiusPx,
    platePadX,
    platePadY,
    rowGapPx: platePadY * 2 + gapPx * 3,
    pad: platePadX + gapPx,
    stridePx: cellPx + gapPx,
  };
};

export const latticeColsForWidth = (
  width: number,
  m: UnitGridMetrics,
): number =>
  Math.max(6, Math.floor((width - m.pad * 2 + m.gapPx) / m.stridePx));

export interface UnitGridPackedCell<TUnit> {
  groupKey: string;
  unit: TUnit;
  /** Flow-first cell of its group (packing inserts the seam before it). */
  first: boolean;
}

/**
 * Flatten groups into flow-ordered cells, truncating each group at
 * `maxUnitsPerGroup`. Groups with zero units yield no cells.
 */
export const packGroups = <TUnit>(
  groups: ReadonlyArray<{ key: string; units: readonly TUnit[] }>,
  maxUnitsPerGroup: number,
): UnitGridPackedCell<TUnit>[] =>
  groups.flatMap((group) =>
    group.units.slice(0, Math.max(0, maxUnitsPerGroup)).map((unit, i) => ({
      groupKey: group.key,
      unit,
      first: i === 0,
    })),
  );

export interface UnitGridPlacedCell<TUnit> extends UnitGridPackedCell<TUnit> {
  px: number;
  py: number;
  row: number;
}

/**
 * Place flow-ordered cells on a FIXED lattice. Serpentine: odd rows run
 * right→left so a wrap continuation is directly below the previous cell
 * (every group one connected region). Word-wrap: rows always run left→right;
 * a group that fits in one row but not in the remaining slots starts the next
 * row. In both layouts one skipped lattice slot separates adjacent groups.
 */
export const placeCells = <TUnit>(
  cells: ReadonlyArray<UnitGridPackedCell<TUnit>>,
  layout: UnitGridLayout,
  latticeCols: number,
  m: UnitGridMetrics,
): UnitGridPlacedCell<TUnit>[] => {
  const countByGroup = new Map<string, number>();
  cells.forEach((c) => {
    countByGroup.set(c.groupKey, (countByGroup.get(c.groupKey) ?? 0) + 1);
  });
  const placed: UnitGridPlacedCell<TUnit>[] = [];
  let slot = 0;
  let crow = 0;
  cells.forEach((cell) => {
    if (cell.first && slot > 0) {
      const n = countByGroup.get(cell.groupKey) ?? 0;
      if (
        layout === 'wordwrap' &&
        n <= latticeCols &&
        slot + 1 + n > latticeCols
      ) {
        crow += 1;
        slot = 0;
      } else {
        slot += 1; // seam slot between groups
      }
    }
    if (slot >= latticeCols) {
      crow += 1;
      slot = 0;
    }
    const visualSlot =
      layout === 'serpentine' && crow % 2 === 1 ? latticeCols - 1 - slot : slot;
    placed.push({
      ...cell,
      px: m.pad + visualSlot * m.stridePx,
      py: m.pad + crow * (m.cellPx + m.rowGapPx),
      row: crow,
    });
    slot += 1;
  });
  return placed;
};

export const gridSize = (
  placed: ReadonlyArray<{ row: number }>,
  latticeCols: number,
  m: UnitGridMetrics,
): { width: number; height: number; rowCount: number } => {
  const rowCount = placed.length > 0 ? placed[placed.length - 1].row + 1 : 1;
  return {
    width: m.pad * 2 + latticeCols * m.stridePx - m.gapPx,
    height: m.pad * 2 + rowCount * (m.cellPx + m.rowGapPx) - m.rowGapPx,
    rowCount,
  };
};

export interface UnitGridSegment {
  groupKey: string;
  row: number;
  x0: number;
  x1: number;
  y: number;
}

/** One horizontal segment per (group, row) — the plate building block. */
export const extractSegments = (
  placed: ReadonlyArray<{
    groupKey: string;
    row: number;
    px: number;
    py: number;
  }>,
  m: UnitGridMetrics,
): UnitGridSegment[] => {
  const segments: UnitGridSegment[] = [];
  placed.forEach((cell) => {
    const seg = segments[segments.length - 1];
    if (seg && seg.groupKey === cell.groupKey && seg.row === cell.row) {
      // min/max so serpentine's right→left rows extend segments correctly.
      seg.x0 = Math.min(seg.x0, cell.px);
      seg.x1 = Math.max(seg.x1, cell.px + m.cellPx);
    } else {
      segments.push({
        groupKey: cell.groupKey,
        row: cell.row,
        x0: cell.px,
        x1: cell.px + m.cellPx,
        y: cell.py,
      });
    }
  });
  return segments;
};

/**
 * Consecutive segments of one group (a group's cells are contiguous in flow
 * order, so its segments are consecutive too).
 */
export const groupConsecutiveSegments = (
  segments: ReadonlyArray<UnitGridSegment>,
): UnitGridSegment[][] => {
  const groups: UnitGridSegment[][] = [];
  segments.forEach((seg) => {
    const group = groups[groups.length - 1];
    if (group && group[0].groupKey === seg.groupKey) group.push(seg);
    else groups.push([seg]);
  });
  return groups;
};

export type BoundarySeg = [number, number, number, number];

/**
 * Chain axis-aligned boundary segments into closed loops (each vertex has
 * exactly two incident segments by construction), merging collinear runs.
 */
export const chainLoops = (
  segs: ReadonlyArray<BoundarySeg>,
): Array<Array<[number, number]>> => {
  const key = (x: number, y: number) => `${x.toFixed(2)},${y.toFixed(2)}`;
  const unused = new Set<number>(segs.map((_, i) => i));
  const byPoint = new Map<string, number[]>();
  segs.forEach((s, i) => {
    [key(s[0], s[1]), key(s[2], s[3])].forEach((k) => {
      const list = byPoint.get(k);
      if (list) list.push(i);
      else byPoint.set(k, [i]);
    });
  });
  const near = (a: number, b: number) => Math.abs(a - b) < 0.01;
  const loops: Array<Array<[number, number]>> = [];
  while (unused.size > 0) {
    const startIdx: number = unused.values().next().value as number;
    unused.delete(startIdx);
    const s0 = segs[startIdx];
    const pts: Array<[number, number]> = [
      [s0[0], s0[1]],
      [s0[2], s0[3]],
    ];
    let cur: [number, number] = [s0[2], s0[3]];
    for (;;) {
      const candidates = (byPoint.get(key(cur[0], cur[1])) ?? []).filter((i) =>
        unused.has(i),
      );
      if (candidates.length === 0) break;
      const i = candidates[0];
      unused.delete(i);
      const s = segs[i];
      const next: [number, number] =
        near(s[0], cur[0]) && near(s[1], cur[1]) ? [s[2], s[3]] : [s[0], s[1]];
      pts.push(next);
      cur = next;
    }
    if (pts.length > 2 && near(pts[0][0], cur[0]) && near(pts[0][1], cur[1]))
      pts.pop();
    const merged: Array<[number, number]> = [];
    pts.forEach((p) => {
      const a = merged[merged.length - 2];
      const b = merged[merged.length - 1];
      if (
        a &&
        b &&
        ((near(a[0], b[0]) && near(b[0], p[0])) ||
          (near(a[1], b[1]) && near(b[1], p[1])))
      )
        merged[merged.length - 1] = p;
      else merged.push(p);
    });
    while (merged.length > 3) {
      const a = merged[merged.length - 1];
      const b = merged[0];
      const c = merged[1];
      if (
        (near(a[0], b[0]) && near(b[0], c[0])) ||
        (near(a[1], b[1]) && near(b[1], c[1]))
      )
        merged.shift();
      else break;
    }
    if (merged.length >= 4) loops.push(merged);
  }
  return loops;
};

/**
 * Rounded rectilinear-polygon path: every corner (convex and concave) is
 * rounded with a quadratic arc clamped to half of its shorter edge.
 */
export const roundedLoopPath = (
  pts: ReadonlyArray<[number, number]>,
  radius: number,
): string => {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    const inLen = Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    const outLen = Math.hypot(next[0] - p[0], next[1] - p[1]);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const pin: [number, number] = [
      p[0] - ((p[0] - prev[0]) / inLen) * r,
      p[1] - ((p[1] - prev[1]) / inLen) * r,
    ];
    const pout: [number, number] = [
      p[0] + ((next[0] - p[0]) / outLen) * r,
      p[1] + ((next[1] - p[1]) / outLen) * r,
    ];
    d +=
      (i === 0 ? `M${pin[0]},${pin[1]}` : `L${pin[0]},${pin[1]}`) +
      `Q${p[0]},${p[1]} ${pout[0]},${pout[1]}`;
  }
  return d + 'Z';
};

/**
 * One group's merged plate: vertically-adjacent overlapping row segments are
 * bridged so the run reads as one region, then the union boundary is traced
 * and every corner rounded.
 */
export const platePath = (
  segs: ReadonlyArray<UnitGridSegment>,
  m: UnitGridMetrics,
): string => {
  const rects = segs.map((s) => ({
    x: s.x0 - m.platePadX,
    y: s.y - m.platePadY,
    w: s.x1 - s.x0 + m.platePadX * 2,
    h: m.cellPx + m.platePadY * 2,
  }));
  const bridges: Array<{
    ox0: number;
    ox1: number;
    y0: number;
    y1: number;
  } | null> = [];
  for (let i = 0; i < rects.length - 1; i++) {
    const A = rects[i];
    const B = rects[i + 1];
    const ox0 = Math.max(A.x, B.x);
    const ox1 = Math.min(A.x + A.w, B.x + B.w);
    bridges.push(
      segs[i + 1].row === segs[i].row + 1 && ox1 - ox0 > m.gapPx
        ? { ox0, ox1, y0: A.y + A.h, y1: B.y }
        : null,
    );
  }
  const hPieces = (
    a0: number,
    a1: number,
    ex: { ox0: number; ox1: number } | null | undefined,
  ): Array<[number, number]> =>
    ex
      ? (
          [
            [a0, Math.max(a0, ex.ox0)],
            [Math.min(a1, ex.ox1), a1],
          ] as Array<[number, number]>
        ).filter(([p0, p1]) => p1 - p0 > 0.5)
      : [[a0, a1]];
  const boundary: BoundarySeg[] = [];
  rects.forEach((g0, i) => {
    const above = i > 0 ? bridges[i - 1] : null;
    const below = i < rects.length - 1 ? bridges[i] : null;
    hPieces(g0.x, g0.x + g0.w, above).forEach(([p0, p1]) =>
      boundary.push([p0, g0.y, p1, g0.y]),
    );
    hPieces(g0.x, g0.x + g0.w, below).forEach(([p0, p1]) =>
      boundary.push([p0, g0.y + g0.h, p1, g0.y + g0.h]),
    );
    boundary.push([g0.x, g0.y, g0.x, g0.y + g0.h]);
    boundary.push([g0.x + g0.w, g0.y, g0.x + g0.w, g0.y + g0.h]);
  });
  bridges.forEach((b) => {
    if (b) {
      boundary.push([b.ox0, b.y0, b.ox0, b.y1]);
      boundary.push([b.ox1, b.y0, b.ox1, b.y1]);
    }
  });
  return chainLoops(boundary)
    .map((loop) => roundedLoopPath(loop, m.radiusPx + m.platePadY))
    .join('');
};

/**
 * Index (into `placed`) of each group's VISUAL top-left cell — topmost row,
 * then leftmost. On serpentine's right→left rows this differs from the
 * flow-first cell; the group initial (and the popover anchor) go here.
 */
export const letterCellIndices = (
  placed: ReadonlyArray<{ groupKey: string; px: number; py: number }>,
): Map<string, number> => {
  const indices = new Map<string, number>();
  placed.forEach((c, i) => {
    const curIdx = indices.get(c.groupKey);
    if (curIdx === undefined) {
      indices.set(c.groupKey, i);
      return;
    }
    const cur = placed[curIdx];
    if (c.py < cur.py || (c.py === cur.py && c.px < cur.px))
      indices.set(c.groupKey, i);
  });
  return indices;
};
