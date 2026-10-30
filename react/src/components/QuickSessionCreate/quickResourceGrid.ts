/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import * as _ from 'lodash-es';

/** How a resource slot is drawn on the quick-create grid (#10733). */
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

/** Memory steps are GiB; every other kind uses the slot's own unit. */
export const getUnitSteps = (
  kind: QuickSlotKind,
  quantumSize?: number | null,
): number[] => {
  switch (kind) {
    case 'cpu':
    case 'count':
      return [1, 4, 16];
    case 'mem':
      return [0.25, 1, 4, 16, 64];
    case 'shares': {
      const quantum = quantumSize && quantumSize > 0 ? quantumSize : 0.1;
      return _.sortBy(_.uniq([quantum, 1, 4]));
    }
  }
};

export const getCellCap = (kind: QuickSlotKind) => (kind === 'cpu' ? 64 : 32);

/** The smallest step whose cap covers `limit`; memory starts at 1 GiB. */
export const getDefaultUnit = (
  kind: QuickSlotKind,
  steps: number[],
  limit: number | undefined,
): number => {
  const candidates = kind === 'mem' ? steps.filter((s) => s >= 1) : steps;
  if (limit === undefined || !_.isFinite(limit)) {
    return _.includes(candidates, 1) ? 1 : candidates[0];
  }
  return (
    candidates.find((step) => step * getCellCap(kind) >= limit - EPSILON) ??
    _.last(candidates)!
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
  const cap = getCellCap(kind);
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
    columns: Math.max(1, Math.min(QUICK_GRID_COLUMNS, totalCells)),
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
