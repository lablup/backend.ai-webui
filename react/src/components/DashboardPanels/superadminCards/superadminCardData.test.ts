/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { withinWindow } from '../timeRange';
import {
  AUDIT_ENTITY_TYPES,
  coreHours,
  entityTypeFailureFilters,
  gibHours,
  slotQuantity,
  sumUsageByProject,
  usageDays,
  usageDaysFilter,
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

describe('sumUsageByProject', () => {
  const bucket = (
    projectId: string,
    group: string,
    cpu: string,
    mem = '0',
  ) => ({
    projectId,
    resourceGroupName: group,
    project: { basicInfo: { name: `name-${projectId}` } },
    ...usage(cpu, mem),
  });

  it('adds up each project over days and resource groups, then ranks by CPU', () => {
    const totals = sumUsageByProject([
      bucket('a', 'rg1', '100', '10'),
      bucket('b', 'rg1', '150'),
      bucket('a', 'rg2', '100', '5'),
      bucket('c', 'rg1', '20'),
      bucket('b', 'rg1', '30'),
    ]);
    expect(totals.map((total) => [total.projectId, total.cpu])).toEqual([
      ['a', 200],
      ['b', 180],
      ['c', 20],
    ]);
    expect(totals[0]).toMatchObject({
      projectName: 'name-a',
      resourceGroups: ['rg1', 'rg2'],
      mem: 15,
    });
  });

  it('breaks a CPU tie by memory', () => {
    const totals = sumUsageByProject([
      bucket('a', 'rg', '10', '1'),
      bucket('b', 'rg', '10', '5'),
    ]);
    expect(totals.map((total) => total.projectId)).toEqual(['b', 'a']);
  });
});

describe('usageDays', () => {
  it('reads the local days a window touches, its end exclusive', () => {
    const at = (value: string) => new Date(value).toISOString();
    expect(
      usageDays({
        after: at('2026-10-27T10:00:00'),
        before: at('2026-10-27T11:00:00'),
      }),
    ).toEqual({ first: '2026-10-27', last: '2026-10-27' });
    expect(
      usageDays({
        after: at('2026-10-27T10:00:00'),
        before: at('2026-10-29T00:00:00'),
      }),
    ).toEqual({ first: '2026-10-27', last: '2026-10-28' });
  });

  it('bounds periodStart by the day before and the day after', () => {
    expect(
      usageDaysFilter({ first: '2026-10-27', last: '2026-10-28' }),
    ).toEqual({
      AND: [
        { periodStart: { after: '2026-10-26' } },
        { periodStart: { before: '2026-10-29' } },
      ],
    });
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
