/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { MAX_BUCKETS } from '../timeRange';
import {
  FAILURES_ONLY_FILTER,
  bucketCounts,
  bucketVariables,
  countDelta,
  isFailuresOnlyFilter,
  previousWindow,
  toDonutRows,
  toPresetRows,
  toUsageRows,
} from './memberCardData';

describe('toDonutRows', () => {
  it('keeps the slice order and computes each share of the counted total', () => {
    expect(
      toDonutRows([
        { key: 'INTERACTIVE', label: 'Interactive', count: 3 },
        { key: 'BATCH', label: 'Batch', count: 1 },
        { key: 'INFERENCE', label: 'Inference', count: 2 },
        { key: 'SYSTEM', label: 'System', count: 0 },
      ]),
    ).toEqual([
      { key: 'INTERACTIVE', label: 'Interactive', value: 3, percent: 50 },
      { key: 'BATCH', label: 'Batch', value: 1, percent: 17 },
      { key: 'INFERENCE', label: 'Inference', value: 2, percent: 33 },
      { key: 'SYSTEM', label: 'System', value: 0, percent: 0 },
    ]);
  });

  it('reads a missing count as 0 and gives every row 0% when nothing is counted', () => {
    expect(
      toDonutRows([
        { key: 'a', label: 'A', count: null },
        { key: 'b', label: 'B' },
      ]),
    ).toEqual([
      { key: 'a', label: 'A', value: 0, percent: 0 },
      { key: 'b', label: 'B', value: 0, percent: 0 },
    ]);
  });
});

describe('toUsageRows', () => {
  const allocation = {
    assignable: [
      { resourceType: 'mem', quantity: '34359738368', unlimited: false },
      { resourceType: 'cuda.shares', quantity: '0.5', unlimited: false },
      { resourceType: 'cpu', quantity: '10', unlimited: false },
      { resourceType: 'cuda.device', quantity: '0', unlimited: false },
      { resourceType: 'tpu.device', quantity: null, unlimited: true },
    ],
    breakdown: {
      keypair: {
        used: [
          { resourceType: 'cpu', quantity: '6' },
          { resourceType: 'mem', quantity: '17179869184' },
          { resourceType: 'cuda.shares', quantity: '1.5' },
        ],
      },
    },
  };

  it('adds the remainder to the keypair usage and orders cpu, mem, then the rest', () => {
    expect(toUsageRows(allocation)).toEqual([
      { resourceType: 'cpu', used: 6, limit: 16 },
      { resourceType: 'mem', used: 17179869184, limit: 51539607552 },
      { resourceType: 'cuda.shares', used: 1.5, limit: 2 },
      { resourceType: 'tpu.device', used: 0, limit: null },
    ]);
  });

  it('keeps a slot with nothing used or assignable when asked to', () => {
    expect(toUsageRows(allocation, ['cpu', 'mem'], false)).toContainEqual({
      resourceType: 'cuda.device',
      used: 0,
      limit: 0,
    });
  });

  it('counts a used slot without an assignable entry as unlimited', () => {
    expect(
      toUsageRows({
        assignable: [],
        breakdown: {
          keypair: { used: [{ resourceType: 'cpu', quantity: 2 }] },
        },
      }),
    ).toEqual([{ resourceType: 'cpu', used: 2, limit: null }]);
  });

  it('returns no rows without an allocation', () => {
    expect(toUsageRows(null)).toEqual([]);
  });
});

describe('toPresetRows', () => {
  it('keeps availability and drops zero-quantity slots', () => {
    expect(
      toPresetRows({
        presets: [
          {
            id: 'p1',
            name: 'gpu-1',
            available: false,
            resourceSlots: [
              { resourceType: 'cpu', quantity: '8' },
              { resourceType: 'mem', quantity: '34359738368' },
              { resourceType: 'cuda.device', quantity: '0' },
            ],
          },
        ],
      }),
    ).toEqual([
      {
        id: 'p1',
        name: 'gpu-1',
        available: false,
        slots: [
          { resourceType: 'cpu', quantity: '8' },
          { resourceType: 'mem', quantity: '34359738368' },
        ],
      },
    ]);
    expect(toPresetRows(undefined)).toEqual([]);
  });
});

describe('bucket count aliases', () => {
  const buckets = [
    { after: '2026-10-26T00:00:00.000Z', before: '2026-10-26T04:00:00.000Z' },
    { after: '2026-10-26T04:00:00.000Z', before: '2026-10-26T08:00:00.000Z' },
  ];

  it('fills every alias slot, switching off the ones past the buckets', () => {
    const variables = bucketVariables('s', buckets, (window) => ({
      terminatedAt: window,
    }));
    expect(Object.keys(variables)).toHaveLength(MAX_BUCKETS * 2);
    expect(variables.s0).toEqual({ terminatedAt: buckets[0] });
    expect(variables.s1On).toBe(true);
    expect(variables.s2).toBeNull();
    expect(variables.s2On).toBe(false);
  });

  it('reads the counts back oldest first, a skipped alias as 0', () => {
    expect(
      bucketCounts({ s0: { count: 4 }, s1: null, f0: { count: 9 } }, 's', 3),
    ).toEqual([4, 0, 0]);
  });
});

describe('previousWindow and countDelta', () => {
  it('takes the window of the same length right before', () => {
    expect(
      previousWindow({
        after: '2026-10-25T12:00:00.000Z',
        before: '2026-10-26T12:00:00.000Z',
      }),
    ).toEqual({
      after: '2026-10-24T12:00:00.000Z',
      before: '2026-10-25T12:00:00.000Z',
    });
  });

  it('signs the change and names its direction', () => {
    expect(countDelta(12, 9)).toEqual({ value: '+3', direction: 'up' });
    expect(countDelta(1, 2)).toEqual({ value: '-1', direction: 'down' });
    expect(countDelta(0, 0)).toEqual({ value: '0', direction: 'flat' });
  });
});

describe('failures-only filter', () => {
  it('recognizes only the saved failures-only filter', () => {
    expect(isFailuresOnlyFilter(FAILURES_ONLY_FILTER)).toBe(true);
    expect(isFailuresOnlyFilter({ status: { in: ['ERROR', 'DENIED'] } })).toBe(
      true,
    );
    expect(isFailuresOnlyFilter(null)).toBe(false);
    expect(isFailuresOnlyFilter({ status: { in: ['ERROR'] } })).toBe(false);
  });
});
