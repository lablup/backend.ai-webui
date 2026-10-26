/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import * as _ from 'lodash-es';

/** One donut slice and its legend row. */
export interface DonutRow {
  key: string;
  label: string;
  value: number;
  /** Share of the total, 0-100; 0 for every row when the total is 0. */
  percent: number;
}

/** Legend rows for manager-counted slices, in the given order. */
export const toDonutRows = (
  slices: ReadonlyArray<{ key: string; label: string; count?: number | null }>,
): Array<DonutRow> => {
  const values = slices.map((slice) => Math.max(0, slice.count ?? 0));
  const total = _.sum(values);
  return slices.map((slice, index) => ({
    key: slice.key,
    label: slice.label,
    value: values[index],
    percent: total > 0 ? Math.round((values[index] / total) * 100) : 0,
  }));
};

type QuantityEntry = {
  readonly resourceType: string;
  readonly quantity?: unknown;
};
type LimitEntry = QuantityEntry & { readonly unlimited: boolean };

/** One slot of the viewer's allocation in one resource group. */
export interface UsageRow {
  resourceType: string;
  used: number;
  /** `used` plus what the manager says is still assignable; null when unlimited. */
  limit: number | null;
}

const toNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

/**
 * Used-vs-limit rows from `effectiveResourceAllocationV2`: `used` is the
 * keypair's, the remainder is the manager's `assignable` (already the minimum
 * across scopes). Slots follow `slotOrder`, then the rest alphabetically; with
 * `dropEmpty`, a slot with nothing used and nothing assignable is left out.
 */
export const toUsageRows = (
  allocation:
    | {
        readonly assignable: ReadonlyArray<LimitEntry>;
        readonly breakdown: {
          readonly keypair: { readonly used: ReadonlyArray<QuantityEntry> };
        };
      }
    | null
    | undefined,
  slotOrder: ReadonlyArray<string> = ['cpu', 'mem'],
  dropEmpty = true,
): Array<UsageRow> => {
  if (!allocation) return [];
  const used = new Map(
    allocation.breakdown.keypair.used.map((entry) => [
      entry.resourceType,
      toNumber(entry.quantity),
    ]),
  );
  const assignable = new Map(
    allocation.assignable.map((entry) => [entry.resourceType, entry]),
  );
  const slots = _.uniq([...assignable.keys(), ...used.keys()]);
  const ordered = _.sortBy(slots, [
    (slot) => {
      const index = slotOrder.indexOf(slot);
      return index === -1 ? slotOrder.length : index;
    },
    (slot) => slot,
  ]);
  return ordered.flatMap((resourceType) => {
    const usedQuantity = used.get(resourceType) ?? 0;
    const entry = assignable.get(resourceType);
    const limit =
      !entry || entry.unlimited || entry.quantity == null
        ? null
        : usedQuantity + toNumber(entry.quantity);
    return dropEmpty && limit === 0 && usedQuantity === 0
      ? []
      : [{ resourceType, used: usedQuantity, limit }];
  });
};

/**
 * Used-vs-limit rows from a `ScopeResourceUsageV2` (`projectResourceAllocationV2`)
 * or a resource group's used against its capacity, slots ordered as in {@link toUsageRows}.
 */
export const toLimitUsageRows = (
  usage:
    | {
        readonly limits: ReadonlyArray<LimitEntry>;
        readonly used: ReadonlyArray<QuantityEntry>;
      }
    | null
    | undefined,
  slotOrder: ReadonlyArray<string> = ['cpu', 'mem'],
): Array<UsageRow> => {
  if (!usage) return [];
  const used = new Map(
    usage.used.map((entry) => [entry.resourceType, toNumber(entry.quantity)]),
  );
  const limits = new Map(
    usage.limits.map((entry) => [entry.resourceType, entry]),
  );
  const ordered = _.sortBy(_.uniq([...limits.keys(), ...used.keys()]), [
    (slot) => {
      const index = slotOrder.indexOf(slot);
      return index === -1 ? slotOrder.length : index;
    },
    (slot) => slot,
  ]);
  return ordered.flatMap((resourceType) => {
    const usedQuantity = used.get(resourceType) ?? 0;
    const entry = limits.get(resourceType);
    const limit =
      !entry || entry.unlimited || entry.quantity == null
        ? null
        : toNumber(entry.quantity);
    return limit === 0 && usedQuantity === 0
      ? []
      : [{ resourceType, used: usedQuantity, limit }];
  });
};

/** One preset row of the presets card. */
export interface PresetRow {
  id: string;
  name: string;
  slots: Array<{ resourceType: string; quantity: string }>;
  available: boolean;
}

/** Preset rows from `checkPresetAvailabilityV2`, slots with a zero quantity left out. */
export const toPresetRows = (
  payload:
    | {
        readonly presets: ReadonlyArray<{
          readonly id: string;
          readonly name: string;
          readonly available: boolean;
          readonly resourceSlots: ReadonlyArray<QuantityEntry>;
        }>;
      }
    | null
    | undefined,
): Array<PresetRow> =>
  (payload?.presets ?? []).map((preset) => ({
    id: preset.id,
    name: preset.name,
    available: preset.available,
    slots: preset.resourceSlots
      .filter((slot) => toNumber(slot.quantity) > 0)
      .map((slot) => ({
        resourceType: slot.resourceType,
        quantity: String(slot.quantity),
      })),
  }));

/** `AuditLogStatus` has no FAILURE: a failed action is recorded as ERROR or DENIED. */
export const AUDIT_FAILURE_STATUSES = ['ERROR', 'DENIED'] as const;

/** The activity card's saved filter while "failures only" is on. */
export const FAILURES_ONLY_FILTER = {
  status: { in: [...AUDIT_FAILURE_STATUSES] },
};

export const isFailuresOnlyFilter = (filter: unknown): boolean =>
  _.isEqual(filter, FAILURES_ONLY_FILTER);
