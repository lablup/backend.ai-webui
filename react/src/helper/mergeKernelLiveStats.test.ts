/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  mergeKernelLiveStats,
  parseLiveStat,
  ResourceStatItem,
} from './mergeKernelLiveStats';

const stat = (overrides: Partial<ResourceStatItem>): ResourceStatItem => ({
  current: '0',
  capacity: '0',
  pct: '0',
  unit_hint: '',
  ...overrides,
});

describe('parseLiveStat', () => {
  it('parses a JSON object', () => {
    expect(
      parseLiveStat('{"cpu_util":{"current":"10","capacity":"100"}}'),
    ).toEqual({ cpu_util: { current: '10', capacity: '100' } });
  });

  it('returns {} for null, undefined, and empty strings', () => {
    expect(parseLiveStat(null)).toEqual({});
    expect(parseLiveStat(undefined)).toEqual({});
    expect(parseLiveStat('')).toEqual({});
  });

  it('returns {} and reports invalid JSON', () => {
    const onError = vi.fn();
    expect(parseLiveStat('{invalid', onError)).toEqual({});
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('returns {} for non-object JSON', () => {
    expect(parseLiveStat('[1,2]')).toEqual({});
    expect(parseLiveStat('42')).toEqual({});
  });
});

describe('mergeKernelLiveStats', () => {
  it('sums current/capacity across kernels and recomputes pct', () => {
    const merged = mergeKernelLiveStats([
      { cpu_util: stat({ current: '50', capacity: '100' }) },
      { cpu_util: stat({ current: '30', capacity: '100' }) },
    ]);
    expect(merged.cpu_util?.current).toBe('80');
    expect(merged.cpu_util?.capacity).toBe('200');
    expect(merged.cpu_util?.pct).toBe('40.00');
  });

  it('recomputes pct instead of averaging the per-kernel pct fields', () => {
    const merged = mergeKernelLiveStats([
      { mem: stat({ current: '10', capacity: '100', pct: '10' }) },
      { mem: stat({ current: '90', capacity: '100', pct: '90' }) },
    ]);
    expect(merged.mem?.pct).toBe('50.00');
  });

  it('merges keys missing from some kernels using only the present items', () => {
    const merged = mergeKernelLiveStats([
      { cpu_util: stat({ current: '10', capacity: '100' }) },
      {
        cpu_util: stat({ current: '20', capacity: '100' }),
        cuda_util: stat({ current: '5', capacity: '10' }),
      },
    ]);
    expect(merged.cpu_util?.current).toBe('30');
    expect(merged.cuda_util?.current).toBe('5');
    expect(merged.cuda_util?.capacity).toBe('10');
    expect(merged.cuda_util?.pct).toBe('50.00');
  });

  it('returns {} for an empty kernel list', () => {
    expect(mergeKernelLiveStats([])).toEqual({});
  });

  it('reports pct 0 when the capacity sum is 0', () => {
    const merged = mergeKernelLiveStats([
      { io_read: stat({ current: '1024', capacity: '0' }) },
    ]);
    expect(merged.io_read?.pct).toBe('0');
  });

  it('averages stats.* fields', () => {
    const merged = mergeKernelLiveStats([
      { cpu_util: stat({ current: '1', capacity: '2', 'stats.avg': '10' }) },
      { cpu_util: stat({ current: '1', capacity: '2', 'stats.avg': '30' }) },
    ]);
    expect(merged.cpu_util?.['stats.avg']).toBe('20');
  });

  it('keeps the first non-empty unit_hint', () => {
    const merged = mergeKernelLiveStats([
      { mem: stat({ current: '1', capacity: '2', unit_hint: '' }) },
      { mem: stat({ current: '1', capacity: '2', unit_hint: 'bytes' }) },
    ]);
    expect(merged.mem?.unit_hint).toBe('bytes');
  });

  it('skips unparsable numeric values and reports them', () => {
    const onError = vi.fn();
    const merged = mergeKernelLiveStats(
      [
        { cpu_util: stat({ current: 'garbage', capacity: '100' }) },
        { cpu_util: stat({ current: '25', capacity: '100' }) },
      ],
      onError,
    );
    expect(merged.cpu_util?.current).toBe('25');
    expect(merged.cpu_util?.capacity).toBe('200');
    expect(onError).toHaveBeenCalled();
  });
});
