/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Big } from 'big.js';
import * as _ from 'lodash-es';

export interface ResourceStatItem {
  current: string;
  capacity: string;
  pct: string;
  unit_hint: string;
  'stats.max'?: string;
  'stats.avg'?: string;
  'stats.rate'?: string;
  [key: string]: string | undefined;
}

export interface SessionLiveStats {
  cuda_util?: ResourceStatItem;
  cpu_util?: ResourceStatItem;
  cuda_mem?: ResourceStatItem;
  cpu_used?: ResourceStatItem;
  mem?: ResourceStatItem;
  io_read?: ResourceStatItem;
  io_write?: ResourceStatItem;
  net_rx?: ResourceStatItem;
  net_tx?: ResourceStatItem;
  io_scratch_size?: ResourceStatItem;
  [key: string]: ResourceStatItem | undefined;
}

export type LiveStatErrorHandler = (
  message: string,
  ...detail: unknown[]
) => void;

export const parseLiveStat = (
  raw: string | null | undefined,
  onError?: LiveStatErrorHandler,
): SessionLiveStats => {
  try {
    const parsed = JSON.parse(raw || '{}');
    return _.isPlainObject(parsed) ? parsed : {};
  } catch (e) {
    onError?.('Failed to parse live_stat:', e);
    return {};
  }
};

/**
 * Merge per-kernel live_stat objects into one session-level view: sum
 * `current`/`capacity`, average `stats.*`, recompute `pct`, keep the first
 * non-empty `unit_hint`, and carry other fields from the first item.
 */
export const mergeKernelLiveStats = (
  statsList: SessionLiveStats[],
  onError?: LiveStatErrorHandler,
): SessionLiveStats => {
  const allKeys: Array<keyof SessionLiveStats> = _.uniq(
    _.flatMap(statsList, (stats) => _.keys(stats)),
  );
  const merged: SessionLiveStats = {};
  allKeys.forEach((key) => {
    const items = statsList
      .map((stats) => stats[key])
      .filter((item): item is ResourceStatItem => !!item);
    if (items.length === 0) return;
    const sumFields = ['current', 'capacity'];
    const avgFields = ['stats.max', 'stats.avg', 'stats.rate'];
    const summed: ResourceStatItem = {} as ResourceStatItem;
    const totalOf = (field: string) =>
      items.reduce((acc, item) => {
        const value = _.get(item, field) ?? '0';
        try {
          return acc.plus(new Big(value));
        } catch (e) {
          onError?.(`Failed to parse value for ${field}:`, value, e);
          return acc;
        }
      }, new Big(0));
    sumFields.forEach((field) => {
      summed[field] = totalOf(field).toString();
    });
    avgFields.forEach((field) => {
      summed[field] = totalOf(field).div(items.length).toString();
    });
    const current = new Big(summed.current ?? '0');
    const capacity = new Big(summed.capacity ?? '0');
    summed.pct = capacity.gt(0)
      ? current.div(capacity).times(100).toFixed(2)
      : '0';
    summed.unit_hint = items.find((item) => item.unit_hint)?.unit_hint ?? '';
    const firstItem = items[0];
    if (firstItem) {
      const allFieldPaths = [
        ...Object.keys(firstItem),
        ...avgFields.filter((field) => _.has(firstItem, field)),
      ];
      allFieldPaths.forEach((field) => {
        if (
          !sumFields.includes(field) &&
          !avgFields.includes(field) &&
          field !== 'unit_hint' &&
          field !== 'pct'
        ) {
          _.set(summed, field, _.get(firstItem, field) ?? '');
        }
      });
    }
    merged[key] = summed;
  });
  return merged;
};
