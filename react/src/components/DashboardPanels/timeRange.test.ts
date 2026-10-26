/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  MAX_BUCKETS,
  bucketize,
  customRange,
  parseTimeRange,
  rangeToDateTimeFilter,
  withinWindow,
} from './timeRange';

const NOW = Date.UTC(2026, 9, 26, 12, 0, 0);
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const ms = (iso: string) => new Date(iso).getTime();

const expectContiguous = (
  buckets: Array<{ after: string; before: string }>,
  from: number,
  to: number,
) => {
  expect(buckets.length).toBeGreaterThan(0);
  expect(buckets.length).toBeLessThanOrEqual(MAX_BUCKETS);
  expect(ms(buckets[0].after)).toBe(from);
  expect(ms(buckets[buckets.length - 1].before)).toBe(to);
  buckets.forEach((bucket, index) => {
    expect(ms(bucket.after)).toBeLessThan(ms(bucket.before));
    if (index > 0) expect(bucket.after).toBe(buckets[index - 1].before);
  });
};

describe('parseTimeRange', () => {
  it('parses relative ranges', () => {
    expect(parseTimeRange('now-24h')).toEqual({
      kind: 'relative',
      durationMs: DAY,
    });
    expect(parseTimeRange('now-30m')).toEqual({
      kind: 'relative',
      durationMs: 30 * 60_000,
    });
  });

  it('parses a custom range of dates', () => {
    expect(parseTimeRange('2026-10-01/2026-10-07')).toEqual({
      kind: 'custom',
      start: '2026-10-01',
      end: '2026-10-07',
    });
  });

  it('rejects malformed, reversed and impossible ranges', () => {
    expect(parseTimeRange('')).toBeNull();
    expect(parseTimeRange('now-0h')).toBeNull();
    expect(parseTimeRange('now-1w')).toBeNull();
    expect(parseTimeRange('2026-10-07/2026-10-01')).toBeNull();
    expect(parseTimeRange('2026-02-30/2026-03-01')).toBeNull();
    expect(parseTimeRange('2026-10-01/2026-10-02/2026-10-03')).toBeNull();
  });
});

describe('rangeToDateTimeFilter', () => {
  it('ends a relative range at now', () => {
    expect(rangeToDateTimeFilter('now-1h', NOW)).toEqual({
      after: new Date(NOW - HOUR).toISOString(),
      before: new Date(NOW).toISOString(),
    });
  });

  it('covers whole local days, end day included, for a custom range', () => {
    const { after, before } = rangeToDateTimeFilter(
      customRange('2026-10-01', '2026-10-07'),
      NOW,
    );
    expect(ms(after)).toBe(new Date(2026, 9, 1).getTime());
    expect(ms(before)).toBe(new Date(2026, 9, 8).getTime());
  });

  it('falls back to the last 24 hours for an unparsable range', () => {
    expect(rangeToDateTimeFilter('garbage', NOW)).toEqual(
      rangeToDateTimeFilter('now-24h', NOW),
    );
  });
});

describe('bucketize', () => {
  it.each([
    ['now-1h', HOUR, 6],
    ['now-24h', DAY, 6],
    ['now-7d', 7 * DAY, 7],
    ['now-30d', 30 * DAY, 6],
  ])('splits %s into %d contiguous buckets', (range, duration, count) => {
    const buckets = bucketize(range, NOW);
    expect(buckets).toHaveLength(count);
    expectContiguous(buckets, NOW - duration, NOW);
    expect(ms(buckets[0].before) - ms(buckets[0].after)).toBe(duration / count);
  });

  it('splits other relative ranges into at most eight equal buckets', () => {
    const buckets = bucketize('now-12h', NOW);
    expect(buckets).toHaveLength(MAX_BUCKETS);
    expectContiguous(buckets, NOW - 12 * HOUR, NOW);
  });

  it('never makes buckets shorter than a minute', () => {
    expect(bucketize('now-3m', NOW)).toHaveLength(3);
    expect(bucketize('now-1m', NOW)).toHaveLength(1);
  });

  it('splits a custom range into at most eight contiguous buckets', () => {
    const range = customRange('2026-09-01', '2026-10-15');
    const buckets = bucketize(range, NOW);
    expect(buckets.length).toBeLessThanOrEqual(MAX_BUCKETS);
    expectContiguous(
      buckets,
      new Date(2026, 8, 1).getTime(),
      new Date(2026, 9, 16).getTime(),
    );
  });

  it('covers a single custom day', () => {
    const buckets = bucketize(customRange('2026-10-01', '2026-10-01'), NOW);
    expectContiguous(
      buckets,
      new Date(2026, 9, 1).getTime(),
      new Date(2026, 9, 2).getTime(),
    );
  });
});

describe('withinWindow', () => {
  it('splits the window into two ANDed bounds on the field', () => {
    expect(
      withinWindow('terminatedAt', {
        after: '2026-10-25T12:00:00.000Z',
        before: '2026-10-26T12:00:00.000Z',
      }),
    ).toEqual({
      AND: [
        { terminatedAt: { after: '2026-10-25T12:00:00.000Z' } },
        { terminatedAt: { before: '2026-10-26T12:00:00.000Z' } },
      ],
    });
  });

  it('bounds every bucket the same way', () => {
    const filters = bucketize('now-1h', NOW).map((bucket) =>
      withinWindow('createdAt', bucket),
    );
    filters.forEach((filter) => {
      expect(filter.AND).toHaveLength(2);
      expect(Object.keys(filter.AND[0].createdAt)).toEqual(['after']);
      expect(Object.keys(filter.AND[1].createdAt)).toEqual(['before']);
    });
  });
});
