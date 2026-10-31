/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  FAILURES_ONLY_FILTER,
  isFailuresOnlyFilter,
  toDonutRows,
  toLimitUsageRows,
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
  const effectiveAssignable = [
    { resourceType: 'mem', quantity: '34359738368', unlimited: false },
    { resourceType: 'cuda.shares', quantity: '0.5', unlimited: false },
    { resourceType: 'cpu', quantity: '10', unlimited: false },
    { resourceType: 'cuda.device', quantity: '0', unlimited: false },
    { resourceType: 'tpu.device', quantity: null, unlimited: true },
  ];
  const user = {
    used: [
      { resourceType: 'cpu', quantity: '9' },
      { resourceType: 'mem', quantity: '25769803776' },
      { resourceType: 'cuda.shares', quantity: '1.5' },
    ],
    assignable: [
      { resourceType: 'cpu', quantity: '7', unlimited: false },
      { resourceType: 'mem', quantity: '68719476736', unlimited: false },
      { resourceType: 'cuda.shares', quantity: null, unlimited: true },
      { resourceType: 'tpu.device', quantity: null, unlimited: true },
    ],
  };

  it("adds the smaller remainder to the user's usage and orders cpu, mem, then the rest", () => {
    expect(
      toUsageRows(user.used, [effectiveAssignable, user.assignable]),
    ).toEqual([
      // The user's remainder (7) is under the effective one (10).
      { resourceType: 'cpu', used: 9, limit: 16 },
      // The effective remainder (32 GiB) is under the user's (64 GiB).
      { resourceType: 'mem', used: 25769803776, limit: 60129542144 },
      // Unlimited for the user, so the effective remainder (0.5) holds.
      { resourceType: 'cuda.shares', used: 1.5, limit: 2 },
      { resourceType: 'tpu.device', used: 0, limit: null },
    ]);
  });

  it('keeps a slot unlimited only when no list limits it', () => {
    expect(
      toUsageRows(
        [{ resourceType: 'cpu', quantity: '3' }],
        [
          [
            { resourceType: 'cpu', quantity: null, unlimited: true },
            { resourceType: 'mem', quantity: null, unlimited: true },
          ],
          [
            { resourceType: 'cpu', quantity: '5', unlimited: false },
            { resourceType: 'mem', quantity: null, unlimited: true },
          ],
        ],
      ),
    ).toEqual([
      { resourceType: 'cpu', used: 3, limit: 8 },
      { resourceType: 'mem', used: 0, limit: null },
    ]);
  });

  it('keeps a slot with nothing used or assignable when asked to', () => {
    expect(
      toUsageRows(user.used, [effectiveAssignable, user.assignable], {
        dropEmpty: false,
      }),
    ).toContainEqual({ resourceType: 'cuda.device', used: 0, limit: 0 });
  });

  it('counts a used slot without an assignable entry as unlimited', () => {
    expect(
      toUsageRows([{ resourceType: 'cpu', quantity: 2 }], [[], []]),
    ).toEqual([{ resourceType: 'cpu', used: 2, limit: null }]);
  });
});

describe('toLimitUsageRows', () => {
  it("reads the scope's own used against its own limits, unlimited as null", () => {
    expect(
      toLimitUsageRows({
        limits: [
          { resourceType: 'mem', quantity: null, unlimited: true },
          { resourceType: 'cuda.device', quantity: '4', unlimited: false },
          { resourceType: 'cpu', quantity: '16', unlimited: false },
          { resourceType: 'tpu', quantity: '0', unlimited: false },
        ],
        used: [
          { resourceType: 'cpu', quantity: '11.000000' },
          { resourceType: 'mem', quantity: '2048' },
        ],
      }),
    ).toEqual([
      { resourceType: 'cpu', used: 11, limit: 16 },
      { resourceType: 'mem', used: 2048, limit: null },
      { resourceType: 'cuda.device', used: 0, limit: 4 },
    ]);
    expect(toLimitUsageRows(null)).toEqual([]);
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
