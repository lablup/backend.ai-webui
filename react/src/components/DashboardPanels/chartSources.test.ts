/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  CHART_GROUPINGS,
  chartCounts,
  combineFilters,
  resolveChart,
} from './chartSources';
import { MAX_BUCKETS } from './timeRange';
import { RESOURCE_KEYS } from './types';

describe('combineFilters', () => {
  it('ANDs a session minilang condition with the group clause', () => {
    expect(combineFilters('name ilike "%a%"', 'status == "ERROR"')).toBe(
      '(name ilike "%a%") & (status == "ERROR")',
    );
    expect(combineFilters(null, 'status == "ERROR"')).toBe('status == "ERROR"');
  });

  it('ANDs a V2 filter with the group filter, skipping an empty one', () => {
    const group = { status: { equals: 'READY' } };
    expect(combineFilters({ name: { contains: 'a' } }, group)).toEqual({
      AND: [{ name: { contains: 'a' } }, group],
    });
    expect(combineFilters({}, group)).toBe(group);
    expect(combineFilters(undefined, group)).toBe(group);
  });
});

describe('resolveChart', () => {
  it('falls back to a donut of the first grouping for an unknown or missing chart', () => {
    expect(resolveChart('session', null)).toEqual({
      type: 'donut',
      groupBy: 'status',
      range: 'now-24h',
      showTable: false,
    });
    expect(
      resolveChart('vfolder', {
        type: 'pie' as never,
        groupBy: 'type',
        range: 'now-30d',
      }),
    ).toMatchObject({ type: 'donut', groupBy: 'status', range: 'now-24h' });
  });

  it('keeps valid settings', () => {
    expect(
      resolveChart('deployment', {
        type: 'bar',
        groupBy: 'openToPublic',
        range: 'now-7d',
        showTable: true,
      }),
    ).toEqual({
      type: 'bar',
      groupBy: 'openToPublic',
      range: 'now-7d',
      showTable: true,
    });
  });
});

describe('chartCounts', () => {
  it('offers at most one count alias per group for every source', () => {
    for (const source of RESOURCE_KEYS) {
      for (const grouping of CHART_GROUPINGS[source]) {
        expect(grouping.groups.length).toBeLessThanOrEqual(MAX_BUCKETS);
      }
    }
  });

  it('returns the groups of the chosen grouping', () => {
    const counts = chartCounts(
      'session',
      resolveChart('session', { type: 'bar', groupBy: 'type' }),
      Date.now(),
    );
    expect(counts.map(({ key }) => key)).toEqual([
      'interactive',
      'batch',
      'inference',
      'system',
    ]);
    expect(counts[0].filter).toBe('type == "interactive"');
  });

  it('splits a line range into creation-time buckets', () => {
    const now = new Date('2026-11-09T12:34:00Z').getTime();
    const session = chartCounts(
      'session',
      resolveChart('session', { type: 'line', range: 'now-24h' }),
      now,
    );
    expect(session.length).toBeGreaterThan(1);
    expect(session.length).toBeLessThanOrEqual(MAX_BUCKETS);
    expect(session[0].filter).toMatch(
      /^created_at >= ".*" & created_at < ".*"$/,
    );
    expect(session.at(-1)?.window?.before).toBe(new Date(now).toISOString());

    const vfolder = chartCounts(
      'vfolder',
      resolveChart('vfolder', { type: 'line', range: 'now-1h' }),
      now,
    );
    expect(vfolder[0].filter).toHaveProperty('AND');
  });
});
