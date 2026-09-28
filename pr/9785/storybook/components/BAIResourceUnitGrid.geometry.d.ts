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
export declare const deriveMetrics: (cellPx?: number, gapPx?: number, radiusPx?: number) => UnitGridMetrics;
export declare const latticeColsForWidth: (width: number, m: UnitGridMetrics) => number;
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
export declare const packGroups: <TUnit>(groups: ReadonlyArray<{
    key: string;
    units: readonly TUnit[];
}>, maxUnitsPerGroup: number) => UnitGridPackedCell<TUnit>[];
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
export declare const placeCells: <TUnit>(cells: ReadonlyArray<UnitGridPackedCell<TUnit>>, layout: UnitGridLayout, latticeCols: number, m: UnitGridMetrics) => UnitGridPlacedCell<TUnit>[];
export declare const gridSize: (placed: ReadonlyArray<{
    row: number;
}>, latticeCols: number, m: UnitGridMetrics) => {
    width: number;
    height: number;
    rowCount: number;
};
export interface UnitGridSegment {
    groupKey: string;
    row: number;
    x0: number;
    x1: number;
    y: number;
}
/** One horizontal segment per (group, row) — the plate building block. */
export declare const extractSegments: (placed: ReadonlyArray<{
    groupKey: string;
    row: number;
    px: number;
    py: number;
}>, m: UnitGridMetrics) => UnitGridSegment[];
/**
 * Consecutive segments of one group (a group's cells are contiguous in flow
 * order, so its segments are consecutive too).
 */
export declare const groupConsecutiveSegments: (segments: ReadonlyArray<UnitGridSegment>) => UnitGridSegment[][];
export type BoundarySeg = [number, number, number, number];
/**
 * Chain axis-aligned boundary segments into closed loops (each vertex has
 * exactly two incident segments by construction), merging collinear runs.
 */
export declare const chainLoops: (segs: ReadonlyArray<BoundarySeg>) => Array<Array<[number, number]>>;
/**
 * Rounded rectilinear-polygon path: every corner (convex and concave) is
 * rounded with a quadratic arc clamped to half of its shorter edge.
 */
export declare const roundedLoopPath: (pts: ReadonlyArray<[number, number]>, radius: number) => string;
/**
 * One group's merged plate: vertically-adjacent overlapping row segments are
 * bridged so the run reads as one region, then the union boundary is traced
 * and every corner rounded.
 */
export declare const platePath: (segs: ReadonlyArray<UnitGridSegment>, m: UnitGridMetrics) => string;
/**
 * Index (into `placed`) of each group's VISUAL top-left cell — topmost row,
 * then leftmost. On serpentine's right→left rows this differs from the
 * flow-first cell; the group initial (and the popover anchor) go here.
 */
export declare const letterCellIndices: (placed: ReadonlyArray<{
    groupKey: string;
    px: number;
    py: number;
}>) => Map<string, number>;
