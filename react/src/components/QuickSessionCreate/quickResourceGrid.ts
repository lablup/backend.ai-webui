/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import * as _ from 'lodash-es';

/** How a resource slot is drawn on the resource grids (#10733, revised in #10741). */
export type QuickSlotKind = 'cpu' | 'mem' | 'shares' | 'count';

export const QUICK_GRID_COLUMNS = 8;
const EPSILON = 1e-9;

export const getQuickSlotKind = (
  slotName: string,
  isBinary?: boolean,
): QuickSlotKind => {
  if (slotName === 'cpu') return 'cpu';
  if (slotName === 'mem' || isBinary) return 'mem';
  if (slotName.endsWith('.shares')) return 'shares';
  return 'count';
};

/** A memory cell in MiB mode; every other unit is the slot's own (memory: GiB). */
export const MEM_MIB_UNIT = 0.25;

/** Only memory switches units (MiB / GiB); other slots draw one fixed unit per cell. */
export const getUnitSteps = (
  kind: QuickSlotKind,
  quantumSize?: number | null,
): number[] => {
  switch (kind) {
    case 'cpu':
    case 'count':
      return [1];
    case 'mem':
      return [MEM_MIB_UNIT, 1];
    case 'shares':
      return [quantumSize && quantumSize > 0 ? quantumSize : 0.1];
  }
};

/** MiB mode is capped small; a larger amount switches to GiB. */
export const getCellCap = (kind: QuickSlotKind, unit: number) =>
  kind === 'mem' && unit < 1 ? 32 : 128;

/** The smallest step whose cap covers `limit`; GiB when the limit is unknown. */
export const getDefaultUnit = (
  kind: QuickSlotKind,
  steps: number[],
  limit: number | undefined,
): number => {
  if (limit === undefined || !_.isFinite(limit)) {
    return _.includes(steps, 1) ? 1 : steps[0];
  }
  return (
    steps.find((step) => step * getCellCap(kind, step) >= limit - EPSILON) ??
    _.last(steps)!
  );
};

/** The default unit, lowered so a non-zero amount fills at least one cell. */
export const getInitialUnit = (
  kind: QuickSlotKind,
  steps: number[],
  limit: number | undefined,
  amount: number,
): number => {
  const unit = getDefaultUnit(kind, steps, limit);
  if (amount <= 0 || amount + EPSILON >= unit) return unit;
  return _.findLast(steps, (step) => step <= amount + EPSILON) ?? steps[0];
};

export interface QuickGridCells {
  columns: number;
  totalCells: number;
  availableCells: number;
  minCells: number;
}

export const getGridCells = ({
  kind,
  unit,
  min,
  max,
  remaining,
}: {
  kind: QuickSlotKind;
  unit: number;
  min?: number;
  max?: number;
  remaining?: number;
}): QuickGridCells => {
  const cap = getCellCap(kind, unit);
  const limitCells =
    max === undefined || !_.isFinite(max)
      ? cap
      : Math.floor(max / unit + EPSILON);
  const totalCells = Math.max(0, Math.min(cap, limitCells));
  const availableCells =
    remaining === undefined || !_.isFinite(remaining)
      ? totalCells
      : Math.max(
          0,
          Math.min(totalCells, Math.floor(remaining / unit + EPSILON)),
        );
  const minCells = min && min > 0 ? Math.ceil(min / unit - EPSILON) : 0;
  return {
    columns: Math.max(
      1,
      Math.min(
        totalCells > 64 ? QUICK_GRID_COLUMNS * 2 : QUICK_GRID_COLUMNS,
        totalCells,
      ),
    ),
    totalCells,
    availableCells,
    minCells,
  };
};

/** Whole cells an amount fills. */
export const amountToCells = (amount: number | undefined, unit: number) =>
  Math.max(0, Math.floor((amount ?? 0) / unit + EPSILON));

/** Keeps the amount on a unit switch, rounded down to the new unit and never below `min`. */
export const roundAmountToUnit = (
  amount: number,
  unit: number,
  min: number = 0,
) => {
  const rounded = _.round(Math.floor(amount / unit + EPSILON) * unit, 6);
  return Math.max(rounded, min);
};
