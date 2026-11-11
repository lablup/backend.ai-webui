/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  CHART_GROUPINGS,
  chartCounts,
  chartTableFilter,
  chartTypesFor,
  chartWindow,
  combineFilters,
  resolveChart,
} from './chartSources';
import { settingsFromInput } from './defaults';
import { hasSetting, panelDefinitionOf } from './panelSettings';
import { MAX_BUCKETS } from './timeRange';
import { RESOURCE_KEYS, type PanelDefinition, type PanelInput } from './types';

const NOW = new Date('2026-11-09T12:34:00Z').getTime();

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
      period: false,
      showTable: false,
    });
    expect(
      resolveChart('vfolder', { type: 'scatter' as never, groupBy: 'type' }),
    ).toMatchObject({ type: 'donut', groupBy: 'status' });
  });

  it('keeps valid settings', () => {
    expect(
      resolveChart('deployment', {
        type: 'area',
        groupBy: 'openToPublic',
        period: true,
        showTable: true,
      }),
    ).toEqual({
      type: 'area',
      groupBy: 'openToPublic',
      period: true,
      showTable: true,
    });
  });

  it('turns a radar into a bar when its grouping has fewer than three groups', () => {
    expect(chartTypesFor('deployment', 'openToPublic')).not.toContain('radar');
    expect(chartTypesFor('deployment', 'status')).toContain('radar');
    expect(
      resolveChart('deployment', { type: 'radar', groupBy: 'openToPublic' })
        .type,
    ).toBe('bar');
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

  it('counts every row of a group without a period', () => {
    const counts = chartCounts(
      'session',
      resolveChart('session', { type: 'bar', groupBy: 'type' }),
      'now-24h',
      NOW,
    );
    expect(counts.map(({ key }) => key)).toEqual([
      'interactive',
      'batch',
      'inference',
      'system',
    ]);
    expect(counts[0].filter).toBe('type == "interactive"');
  });

  it('narrows each group to the range with a period', () => {
    const counts = chartCounts(
      'deployment',
      resolveChart('deployment', { type: 'pie', period: true }),
      'now-1h',
      NOW,
    );
    expect(counts[0].filter).toEqual({
      AND: [
        { status: { equals: 'PENDING' } },
        expect.objectContaining({ AND: expect.any(Array) }),
      ],
    });
  });

  it('splits the range into creation-time buckets for a time chart', () => {
    const session = chartCounts(
      'session',
      resolveChart('session', { type: 'line' }),
      'now-24h',
      NOW,
    );
    expect(session.length).toBeGreaterThan(1);
    expect(session.length).toBeLessThanOrEqual(MAX_BUCKETS);
    expect(session[0].filter).toMatch(
      /^created_at >= ".*" & created_at < ".*"$/,
    );
    expect(session.at(-1)?.window?.before).toBe(new Date(NOW).toISOString());

    const vfolder = chartCounts(
      'vfolder',
      resolveChart('vfolder', { type: 'column' }),
      'now-1h',
      NOW,
    );
    expect(vfolder[0].filter).toHaveProperty('AND');
  });

  it('keeps a fixed window of up to 7 days and drops a longer one to the default', () => {
    const threeDays = '2026-11-01T00:00:00.000Z/2026-11-04T00:00:00.000Z';
    const tenDays = '2026-11-01T00:00:00.000Z/2026-11-11T00:00:00.000Z';
    const line = resolveChart('session', { type: 'line' });
    const fixed = chartCounts('session', line, threeDays, NOW);
    expect(fixed[0].window?.after).toBe('2026-11-01T00:00:00.000Z');
    expect(fixed.at(-1)?.window?.before).toBe('2026-11-04T00:00:00.000Z');
    expect(chartWindow(line, tenDays, NOW)).toEqual(
      chartWindow(line, 'now-24h', NOW),
    );
  });
});

describe('session status groups', () => {
  it('put every legacy session status in exactly one group', () => {
    const statuses = [
      'PENDING',
      'DEPRIORITIZING',
      'RESERVED',
      'SCHEDULED',
      'PREPARING',
      'PULLING',
      'PREPARED',
      'CREATING',
      'RUNNING',
      'RESTARTING',
      'RUNNING_DEGRADED',
      'PREEMPTED',
      'RESCHEDULING',
      'TERMINATING',
      'TERMINATED',
      'ERROR',
      'CANCELLED',
    ];
    const filters = CHART_GROUPINGS.session
      .find(({ key }) => key === 'status')!
      .groups.map(({ filter }) => String(filter));
    for (const status of statuses) {
      expect(
        filters.filter((filter) => filter.includes(`"${status}"`)),
      ).toHaveLength(1);
    }
  });
});

describe('chartTableFilter', () => {
  it('lists the rows the chart counts', () => {
    const donut = resolveChart('session', { type: 'donut' });
    expect(
      chartTableFilter(
        'session',
        'name == "a"',
        chartWindow(donut, 'now-1h', NOW),
      ),
    ).toBe('name == "a"');
    const withPeriod = resolveChart('session', { type: 'donut', period: true });
    expect(
      chartTableFilter(
        'session',
        'name == "a"',
        chartWindow(withPeriod, 'now-1h', NOW),
      ),
    ).toMatch(/^\(name == "a"\) & \(created_at >= /);
  });
});

describe('panel range setting', () => {
  const preset = {
    key: 'resource.session',
    kind: 'preset',
    settings: ['resourceGroup'],
  } as unknown as PanelDefinition;

  it('takes a range only on a chart that counts within a period', () => {
    const rangeOf = (panel: Parameters<typeof panelDefinitionOf>[1]) =>
      hasSetting(panelDefinitionOf(preset, panel), 'range');
    expect(rangeOf({ viz: 'table' })).toBe(false);
    expect(rangeOf({ viz: 'chart', chart: { type: 'donut' } })).toBe(false);
    expect(
      rangeOf({ viz: 'chart', chart: { type: 'bar', period: true } }),
    ).toBe(true);
    expect(rangeOf({ viz: 'chart', chart: { type: 'line' } })).toBe(true);
  });

  it('saves the modal range into the card settings and drops it when unused', () => {
    const input: PanelInput = {
      panelType: 'resourceChart',
      resourceType: 'session',
      chart: { type: 'line' },
      range: 'now-7d',
    };
    expect(settingsFromInput({ resourceGroups: ['a'] }, input)).toEqual({
      resourceGroups: ['a'],
      range: 'now-7d',
    });
    expect(
      settingsFromInput(
        { resourceGroups: ['a'], range: 'now-7d' },
        { ...input, chart: { type: 'donut' } },
      ),
    ).toEqual({ resourceGroups: ['a'] });
    expect(
      settingsFromInput(undefined, { ...input, range: 'now-30d' })?.range,
    ).toBe('now-24h');
  });
});
