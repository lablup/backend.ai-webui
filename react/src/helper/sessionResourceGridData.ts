/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Pure data layer for the session resource grid (FR-3570): slot-map parsing,
 per-slot/metric utilization lookup, and session→unit-cell quantization.
 Colors are passed in as resolved fill strings so this module stays
 theme-agnostic and unit-testable.
 */
import { SessionLiveStats } from './mergeKernelLiveStats';
import { utilizationBinIndex } from './utilizationThresholds';
import * as _ from 'lodash-es';

export const SESSION_CAP = 100;
export const MAX_UNITS_PER_SESSION = 256;

export const sessionGridModeValues = ['resource', 'kernel'] as const;
export type SessionGridMode = (typeof sessionGridModeValues)[number];
export const sessionGridMemUnitValues = ['1', '2', '4', '8'] as const;
export type SessionGridMemUnit = (typeof sessionGridMemUnitValues)[number];

/** Statuses whose kernels report meaningful live_stat. */
export const LIVE_SESSION_STATUSES = [
  'RUNNING',
  'RUNNING_DEGRADED',
  'TERMINATING',
];

export type SlotMap = Record<string, string>;

const parseJSONObject = (raw?: string | null): Record<string, any> => {
  try {
    const parsed = JSON.parse(raw || '{}');
    return _.isPlainObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

/**
 * Flat slot map of a session (`cpu`, `mem` in bytes, dynamic
 * `<family>.<unit>` accelerator keys). Falls back to `requested_slots`
 * while nothing is occupied yet (e.g. PENDING).
 */
export const parseSlotMap = (
  occupiedSlots?: string | null,
  requestedSlots?: string | null,
): { slots: SlotMap; slotsAreRequested: boolean } => {
  const occupied = parseJSONObject(occupiedSlots) as SlotMap;
  const slotsAreRequested = _.isEmpty(occupied);
  return {
    slots: slotsAreRequested
      ? (parseJSONObject(requestedSlots) as SlotMap)
      : occupied,
    slotsAreRequested,
  };
};

// `cpu` → `cpu_util`, `mem` → `mem`,
// `hyperaccel-lpu.device` → `hyperaccel_lpu_util`
export const utilKeyForSlot = (slot: string): string =>
  slot === 'cpu'
    ? 'cpu_util'
    : slot === 'mem'
      ? 'mem'
      : `${slot.split('.')[0].replace(/-/g, '_')}_util`;

const statPct = (liveStat: SessionLiveStats, key: string): number | null => {
  const stat = liveStat[key];
  const pct = stat ? parseFloat(stat.pct ?? '') : NaN;
  return Number.isFinite(pct) ? pct : null;
};

/** Utilization percent of one slot, or null when not live / no data. */
export const sessionUtilizationPct = (
  status: string,
  liveStat: SessionLiveStats,
  slot: string,
): number | null =>
  LIVE_SESSION_STATUSES.includes(status)
    ? statPct(liveStat, utilKeyForSlot(slot))
    : null;

/** A kernel's percent for a raw live_stat metric key, or null. */
export const kernelMetricPct = (
  status: string,
  liveStat: SessionLiveStats,
  metric: string,
): number | null =>
  LIVE_SESSION_STATUSES.includes(status) ? statPct(liveStat, metric) : null;

export interface UtilizationFills {
  /** 5 fills indexed by `utilizationBinIndex`. */
  bins: readonly [string, string, string, string, string];
  noData: string;
}

export const utilizationFill = (
  pct: number | null,
  fills: UtilizationFills,
): string =>
  pct === null || !Number.isFinite(pct)
    ? fills.noData
    : fills.bins[utilizationBinIndex(pct)];

export interface SessionGridUnit {
  color: string;
  /** 0..1 partial fill (fractional accelerator share). */
  fraction?: number;
}

export interface SessionGridKernelInput {
  status: string;
  liveStat: SessionLiveStats;
}

export interface SessionGridUnitsInput {
  status: string;
  slots: SlotMap;
  liveStat: SessionLiveStats;
  kernels: ReadonlyArray<SessionGridKernelInput>;
}

export interface SessionGridUnitsOptions {
  mode: SessionGridMode;
  /** Resource mode: the slot key to quantize (`cpu`, `mem`, `cuda.shares`, …). */
  resource: string;
  /** Kernel mode: the live_stat metric key to color by. */
  metric: string;
  memUnitGiB: number;
  fills: UtilizationFills;
  maxUnits?: number;
}

/**
 * Quantize one session into unit cells. Resource mode: 1 unit per CPU core /
 * selected GiB of memory / accelerator device (fractional remainder becomes
 * one partial-fill cell). Kernel mode: 1 unit per kernel. Sessions that
 * would yield no cells get a single no-data cell so they stay visible.
 */
export const sessionGridUnits = (
  session: SessionGridUnitsInput,
  options: SessionGridUnitsOptions,
): SessionGridUnit[] => {
  const {
    mode,
    resource,
    metric,
    memUnitGiB,
    fills,
    maxUnits = MAX_UNITS_PER_SESSION,
  } = options;
  if (mode === 'kernel') {
    const cells = session.kernels.slice(0, maxUnits).map((kernel) => ({
      color: utilizationFill(
        kernelMetricPct(kernel.status, kernel.liveStat, metric),
        fills,
      ),
    }));
    return cells.length > 0 ? cells : [{ color: fills.noData }];
  }
  const raw = parseFloat(session.slots[resource] ?? '0') || 0;
  const units = resource === 'mem' ? raw / (memUnitGiB * 2 ** 30) : raw;
  const full = Math.floor(units + 1e-9);
  const fraction = units - full;
  const color = utilizationFill(
    sessionUtilizationPct(session.status, session.liveStat, resource),
    fills,
  );
  const cells: SessionGridUnit[] = Array.from(
    { length: Math.min(full, maxUnits) },
    () => ({ color }),
  );
  if (fraction > 1e-6 && cells.length < maxUnits) {
    cells.push({ color, fraction });
  }
  return cells.length > 0 ? cells : [{ color: fills.noData }];
};

/**
 * Control inventories from the data actually present: slots always offer
 * cpu/mem first; metrics are the union of kernel live_stat keys, `_util`
 * first, then `mem`, `_mem`, the rest alphabetically.
 */
export const availableResourceSlots = (
  sessions: ReadonlyArray<{ slots: SlotMap }>,
): string[] =>
  _.uniq([
    'cpu',
    'mem',
    ...sessions.flatMap((s) =>
      Object.keys(s.slots).filter((k) => k !== 'cpu' && k !== 'mem'),
    ),
  ]);

export const availableLiveStatMetrics = (
  sessions: ReadonlyArray<{
    kernels: ReadonlyArray<{ liveStat: SessionLiveStats }>;
  }>,
): string[] =>
  _.uniq(
    sessions.flatMap((s) => s.kernels.flatMap((k) => Object.keys(k.liveStat))),
  ).sort((a, b) => {
    const rank = (k: string) =>
      k.includes('_util') ? 0 : k === 'mem' ? 1 : k.includes('_mem') ? 2 : 3;
    return rank(a) - rank(b) || a.localeCompare(b);
  });
