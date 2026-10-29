/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { withinWindow } from '../timeRange';
import {
  AUDIT_ENTITY_TYPES,
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
    expect(session.AND).toEqual(withinWindow('createdAt', window).AND);
    expect(session.status).toEqual({ in: ['ERROR', 'DENIED'] });
  });
});
