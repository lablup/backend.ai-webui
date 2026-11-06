/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  MAX_BUCKETS,
  customRange,
  parseTimeRange,
  planBuckets,
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

describe('planBuckets', () => {
  const MINUTE = 60_000;
  const localOffset = (now: number) =>
    -new Date(now).getTimezoneOffset() * MINUTE;
  const isAligned = (iso: string, step: number, now: number) =>
    (ms(iso) + localOffset(now)) % step === 0;

  it.each([
    ['now-1h', HOUR, 10 * MINUTE],
    ['now-24h', DAY, 4 * HOUR],
    ['now-7d', 7 * DAY, DAY],
    ['now-30d', 30 * DAY, 5 * DAY],
  ])(
    'partitions %s exactly, inner edges on multiples of the step',
    (range, duration, step) => {
      const plan = planBuckets(range, NOW + 7 * MINUTE);
      const now = NOW + 7 * MINUTE;
      expectContiguous(plan.buckets, now - duration, now);
      expect(plan.window).toEqual({
        after: new Date(now - duration).toISOString(),
        before: new Date(now).toISOString(),
      });
      plan.buckets
        .slice(1)
        .forEach((bucket) =>
          expect(isAligned(bucket.after, step, now)).toBe(true),
        );
      expect(plan.fixed).toBe(false);
    },
  );

  it('keeps the settled buckets identical until a bucket closes', () => {
    const step = 4 * HOUR;
    const start =
      Math.floor((NOW + localOffset(NOW)) / step) * step -
      localOffset(NOW) +
      MINUTE;
    const settled = (now: number) => {
      const plan = planBuckets('now-24h', now);
      return plan.buckets.filter((_b, i) => plan.states[i] === 'settled');
    };
    const first = settled(start);
    expect(settled(start + 30 * MINUTE)).toEqual(first);
    expect(settled(start + step - 2 * MINUTE)).toEqual(first);
    expect(settled(start + step)).not.toEqual(first);
  });

  it('marks only the trimmed first and the in-progress last bucket live', () => {
    const plan = planBuckets('now-24h', NOW + 7 * MINUTE);
    expect(plan.states[0]).toBe('live');
    expect(plan.states[plan.states.length - 1]).toBe('live');
    expect(plan.states.slice(1, -1).every((state) => state === 'settled')).toBe(
      true,
    );
  });

  it('never exceeds the bucket cap', () => {
    ['now-1m', 'now-3m', 'now-12h', 'now-90d'].forEach((range) => {
      const now = NOW + 13 * MINUTE + 17_000;
      expect(planBuckets(range, now).buckets.length).toBeLessThanOrEqual(
        MAX_BUCKETS,
      );
    });
  });

  it('splits a custom range equally and settles the buckets that ended', () => {
    const range = customRange('2026-09-01', '2026-10-15');
    const plan = planBuckets(range, NOW);
    expectContiguous(
      plan.buckets,
      new Date(2026, 8, 1).getTime(),
      new Date(2026, 9, 16).getTime(),
    );
    expect(plan.states.every((state) => state === 'settled')).toBe(true);
    expect(plan.fixed).toBe(true);
  });

  it('marks the custom bucket holding now live and the later ones future', () => {
    const now = NOW + 7 * MINUTE;
    const today = new Date(now);
    const date = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
    const plan = planBuckets(customRange(date, date), now);
    const live = plan.states.filter((state) => state === 'live');
    expect(live).toHaveLength(1);
    const liveIndex = plan.states.indexOf('live');
    expect(plan.states.slice(0, liveIndex).every((s) => s === 'settled')).toBe(
      true,
    );
    expect(plan.states.slice(liveIndex + 1).every((s) => s === 'future')).toBe(
      true,
    );
  });

  it('covers a single custom day', () => {
    const plan = planBuckets(customRange('2026-10-01', '2026-10-01'), NOW);
    expectContiguous(
      plan.buckets,
      new Date(2026, 9, 1).getTime(),
      new Date(2026, 9, 2).getTime(),
    );
  });
});

describe('withinWindow', () => {
  it('splits the window into two ANDed bounds, the start kept by a 1µs earlier exclusive bound', () => {
    expect(
      withinWindow('terminatedAt', {
        after: '2026-10-25T12:00:00.000Z',
        before: '2026-10-26T12:00:00.000Z',
      }),
    ).toEqual({
      AND: [
        { terminatedAt: { after: '2026-10-25T11:59:59.999999Z' } },
        { terminatedAt: { before: '2026-10-26T12:00:00.000Z' } },
      ],
    });
  });

  it('bounds every bucket the same way', () => {
    const filters = planBuckets('now-1h', NOW).buckets.map((bucket) =>
      withinWindow('createdAt', bucket),
    );
    filters.forEach((filter) => {
      expect(filter.AND).toHaveLength(2);
      expect(Object.keys(filter.AND[0].createdAt)).toEqual(['after']);
      expect(Object.keys(filter.AND[1].createdAt)).toEqual(['before']);
    });
  });
});
