/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DEFAULT_RANGE } from './panelSettings';

/** A card's default range; a custom range is `YYYY-MM-DD/YYYY-MM-DD`. */
export const DEFAULT_TIME_RANGE = DEFAULT_RANGE;

/**
 * A time window, `after` inclusive, `before` exclusive. Never pass it as one
 * `DateTimeFilter`; filter with {@link withinWindow}.
 */
export interface DateTimeWindow {
  after: string;
  before: string;
}

export type ParsedTimeRange =
  | { kind: 'relative'; durationMs: number }
  | { kind: 'custom'; start: string; end: string };

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const UNIT_MS: Record<string, number> = { m: MINUTE, h: HOUR, d: DAY };

const RELATIVE_PATTERN = /^now-(\d+)([mhd])$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** At most this many buckets per chart, each one a count alias in one request. */
export const MAX_BUCKETS = 8;

/** Bucket counts for the ranges whose natural unit divides them (24h → 6×4h). */
const BUCKET_COUNT_BY_DURATION: ReadonlyMap<number, number> = new Map([
  [HOUR, 6],
  [DAY, 6],
  [7 * DAY, 7],
  [30 * DAY, 6],
]);

const isValidDate = (value: string) =>
  DATE_PATTERN.test(value) && !Number.isNaN(localDayStart(value));

/** Local midnight of a `YYYY-MM-DD` date, in epoch ms. */
const localDayStart = (date: string): number => {
  const [year, month, day] = date.split('-').map(Number);
  const value = new Date(year, month - 1, day);
  return value.getFullYear() === year &&
    value.getMonth() === month - 1 &&
    value.getDate() === day
    ? value.getTime()
    : Number.NaN;
};

const nextLocalDayStart = (date: string): number => {
  const start = new Date(localDayStart(date));
  return new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + 1,
  ).getTime();
};

export const customRange = (start: string, end: string) => `${start}/${end}`;

export const parseTimeRange = (
  range: string | null | undefined,
): ParsedTimeRange | null => {
  if (!range) return null;
  const relative = RELATIVE_PATTERN.exec(range);
  if (relative) {
    const durationMs = Number(relative[1]) * UNIT_MS[relative[2]];
    return durationMs > 0 ? { kind: 'relative', durationMs } : null;
  }
  const [start, end, ...rest] = range.split('/');
  if (rest.length || !start || !end || !isValidDate(start) || !isValidDate(end))
    return null;
  return start <= end ? { kind: 'custom', start, end } : null;
};

export const isValidTimeRange = (range: string | null | undefined) =>
  parseTimeRange(range) !== null;

const windowMs = (
  range: string,
  now: number,
): { from: number; to: number } | null => {
  const parsed = parseTimeRange(range);
  if (!parsed) return null;
  if (parsed.kind === 'relative')
    return { from: now - parsed.durationMs, to: now };
  // A custom range covers whole local days, end day included.
  return {
    from: localDayStart(parsed.start),
    to: nextLocalDayStart(parsed.end),
  };
};

/**
 * The range as a window. `now` must be stable between
 * refreshes (a card's last refresh time), or every render changes the query.
 * An unparsable range falls back to the default.
 */
export const rangeToDateTimeFilter = (
  range: string,
  now: number,
): DateTimeWindow => {
  const { from, to } =
    windowMs(range, now) ?? windowMs(DEFAULT_TIME_RANGE, now)!;
  return {
    after: new Date(from).toISOString(),
    before: new Date(to).toISOString(),
  };
};

const bucketCountFor = (durationMs: number) => {
  const known = BUCKET_COUNT_BY_DURATION.get(durationMs);
  if (known) return known;
  // Equal buckets of at least a minute, so a short custom range does not produce empty slivers.
  return Math.max(1, Math.min(MAX_BUCKETS, Math.floor(durationMs / MINUTE)));
};

/** `settled` buckets keep the same window and count across refreshes; `future` ones have not started. */
export type BucketState = 'settled' | 'live' | 'future';

export interface BucketPlan {
  /** The range the buckets partition exactly, as of `now`. */
  window: DateTimeWindow;
  /** Contiguous, oldest first, at most {@link MAX_BUCKETS}. */
  buckets: Array<DateTimeWindow>;
  states: Array<BucketState>;
  /** The window does not move with `now` (a custom range). */
  fixed: boolean;
}

/** `time` floored to a multiple of `step` in local time, so day buckets start at local midnight. */
const alignDown = (time: number, step: number, offset: number) =>
  Math.floor((time + offset) / step) * step - offset;

/**
 * Splits the range into contiguous buckets for charts whose every bucket is a
 * manager-counted alias. A relative range's inner edges sit on fixed multiples
 * of the step, so only its first (trimmed) and last (in progress) buckets
 * change between refreshes; a custom range is split equally.
 */
export const planBuckets = (range: string, now: number): BucketPlan => {
  const effective = isValidTimeRange(range) ? range : DEFAULT_TIME_RANGE;
  const parsed = parseTimeRange(effective)!;
  const { from, to } = windowMs(effective, now)!;
  const toWindow = (edges: Array<number>) =>
    edges.slice(0, -1).map((edge, index) => ({
      after: new Date(edge).toISOString(),
      before: new Date(edges[index + 1]).toISOString(),
    }));
  const window = {
    after: new Date(from).toISOString(),
    before: new Date(to).toISOString(),
  };

  if (parsed.kind === 'relative') {
    // The trimmed first bucket adds one, so the steps stay one under the cap.
    const count = Math.min(bucketCountFor(to - from), MAX_BUCKETS - 1);
    const step = Math.ceil((to - from) / count / MINUTE) * MINUTE;
    const offset = -new Date(now).getTimezoneOffset() * MINUTE;
    const edges = [from];
    for (
      let edge = alignDown(from, step, offset) + step;
      edge < to;
      edge += step
    )
      edges.push(edge);
    edges.push(to);
    const buckets = toWindow(edges);
    return {
      window,
      buckets,
      states: buckets.map((_bucket, index) =>
        index === 0 || index === buckets.length - 1 ? 'live' : 'settled',
      ),
      fixed: false,
    };
  }

  const count = bucketCountFor(to - from);
  const step = (to - from) / count;
  const buckets = toWindow(
    Array.from({ length: count + 1 }, (_unused, index) =>
      index === count ? to : Math.round(from + step * index),
    ),
  );
  return {
    window,
    buckets,
    states: buckets.map((bucket) =>
      new Date(bucket.before).getTime() <= now
        ? 'settled'
        : new Date(bucket.after).getTime() >= now
          ? 'future'
          : 'live',
    ),
    fixed: true,
  };
};

/** One microsecond before `iso`, the manager's timestamp resolution. */
const microsecondBefore = (iso: string) =>
  new Date(new Date(iso).getTime() - 1).toISOString().replace(/Z$/, '999Z');

/**
 * `field` within `window`, as two ANDed bounds: given both `after` and `before`
 * in one `DateTimeFilter`, manager 26.10.0a3 applies only `before`. Both manager
 * bounds are exclusive, so `after` moves back 1µs to keep the window's start.
 */
export const withinWindow = <TField extends string>(
  field: TField,
  window: DateTimeWindow,
): { AND: Array<Record<TField, { after?: string; before?: string }>> } => ({
  AND: [
    { [field]: { after: microsecondBefore(window.after) } } as Record<
      TField,
      { after: string }
    >,
    { [field]: { before: window.before } } as Record<
      TField,
      { before: string }
    >,
  ],
});
