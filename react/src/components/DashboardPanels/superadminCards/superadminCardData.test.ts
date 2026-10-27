/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  AUDIT_ENTITY_TYPES,
  bucketDayAfter,
  byCpuUsage,
  coreHours,
  entityTypeFailureFilters,
  gibHours,
  slotQuantity,
} from './superadminCardData';

const usage = (cpu: string, mem = '0') => ({
  resourceUsage: {
    entries: [
      { resourceType: 'cpu', quantity: cpu },
      { resourceType: 'mem', quantity: mem },
    ],
  },
});

describe('slotQuantity', () => {
  it('reads one slot and treats a missing or malformed one as 0', () => {
    const { entries } = usage('5400', '1073741824').resourceUsage;
    expect(slotQuantity(entries, 'cpu')).toBe(5400);
    expect(slotQuantity(entries, 'cuda.device')).toBe(0);
    expect(slotQuantity([{ resourceType: 'cpu', quantity: 'x' }], 'cpu')).toBe(
      0,
    );
    expect(slotQuantity(null, 'cpu')).toBe(0);
  });
});

describe('usage units', () => {
  it('turns core-seconds into core-hours and byte-seconds into GiB-hours', () => {
    expect(coreHours(7200)).toBe(2);
    expect(gibHours(3600 * 1024 ** 3)).toBe(1);
  });
});

describe('byCpuUsage', () => {
  it('orders bucket rows by their own CPU use without merging them', () => {
    const rows = [
      { id: 'a', ...usage('10') },
      { id: 'b', ...usage('300') },
      { id: 'c', ...usage('20') },
    ];
    expect(byCpuUsage(rows).map((row) => row.id)).toEqual(['b', 'c', 'a']);
  });
});

describe('bucketDayAfter', () => {
  it('is the day before the window starts, since DateFilter.after is exclusive', () => {
    const after = new Date(2026, 9, 27, 9, 30).toISOString();
    expect(bucketDayAfter({ after, before: after })).toBe('2026-10-26');
  });
});

describe('entityTypeFailureFilters', () => {
  const window = {
    after: '2026-10-26T00:00:00.000Z',
    before: '2026-10-27T00:00:00.000Z',
  };

  it('counts failures per listed entity type and every other type once', () => {
    const filters = entityTypeFailureFilters(window);
    expect(Object.keys(filters)).toHaveLength(AUDIT_ENTITY_TYPES.length + 1);
    expect(filters.resourceGroup.entityType).toEqual({
      equals: 'resource_group',
    });
    expect(filters.other.entityType).toEqual({
      notIn: [...AUDIT_ENTITY_TYPES],
    });
  });

  it('filters the window as two ANDed bounds and failures as ERROR or DENIED', () => {
    const { session } = entityTypeFailureFilters(window);
    expect(session.AND).toEqual([
      { createdAt: { after: window.after } },
      { createdAt: { before: window.before } },
    ]);
    expect(session.status).toEqual({ in: ['ERROR', 'DENIED'] });
  });
});
