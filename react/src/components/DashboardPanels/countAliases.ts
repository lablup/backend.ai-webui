/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  PermissionDeniedError,
  permissionDeniedCode,
  readSecondary,
} from './panelPermission';
import {
  MAX_BUCKETS,
  planBuckets,
  type BucketPlan,
  type DateTimeWindow,
} from './timeRange';
import * as _ from 'lodash-es';
import type { Result } from 'relay-runtime';

type BucketIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** `<prefix>0..7` hold the bucket filters, `<prefix>0..7On` whether each alias runs. */
export type BucketAliasVariables<TPrefix extends string, TFilter> = {
  [K in `${TPrefix}${BucketIndex}`]: TFilter | null;
} & { [K in `${TPrefix}${BucketIndex}On`]: boolean };

/**
 * Query variables for up to {@link MAX_BUCKETS} bucket count aliases named
 * `<prefix>0..7`; a missing or null bucket switches its alias off.
 */
export const bucketVariables = <TPrefix extends string, TFilter>(
  prefix: TPrefix,
  buckets: ReadonlyArray<DateTimeWindow | null>,
  makeFilter: (window: DateTimeWindow) => TFilter,
): BucketAliasVariables<TPrefix, TFilter> =>
  countAliasVariables(
    prefix,
    buckets.map((window) => (window ? makeFilter(window) : null)),
  );

/** Variables for count aliases `<prefix>0..7`, one per filter; a missing or null filter switches its alias off. */
export const countAliasVariables = <TPrefix extends string, TFilter>(
  prefix: TPrefix,
  filters: ReadonlyArray<TFilter | null>,
): BucketAliasVariables<TPrefix, TFilter> =>
  Object.fromEntries(
    _.range(MAX_BUCKETS).flatMap((index) => {
      const filter = filters[index] ?? null;
      return [
        [`${prefix}${index}`, filter],
        [`${prefix}${index}On`, filter !== null],
      ];
    }),
  ) as BucketAliasVariables<TPrefix, TFilter>;

type CountValue = { readonly count?: number | null } | null | undefined;
/** A count alias read with `@catch(to: RESULT)`, or with `@catch(to: NULL)` (a bare value). */
export type CountAlias = CountValue | Result<CountValue, unknown>;

const isResult = (alias: CountAlias): alias is Result<CountValue, unknown> =>
  !!alias && 'ok' in alias;

/** An alias's count: 0 when it failed or did not run, `denied` when the viewer may not read it. */
export const readCount = (
  alias: CountAlias,
): { count: number; denied: boolean } => {
  if (!isResult(alias)) return { count: alias?.count ?? 0, denied: false };
  const { value, denied } = readSecondary(alias);
  return { count: value?.count ?? 0, denied };
};

/**
 * The count of each alias, null where it is denied (drawn "-"). When every
 * alias is denied the card's data is, so it throws for the permission boundary.
 */
export const readCounts = <K extends string>(
  data: Readonly<Record<K, CountAlias>>,
  keys: ReadonlyArray<K>,
): Record<K, number | null> => {
  const counts = keys.map((key) => readCount(data[key]));
  if (counts.length > 0 && counts.every((count) => count.denied)) {
    const first = data[keys[0]];
    throw new PermissionDeniedError(
      (isResult(first) && !first.ok && permissionDeniedCode(first.errors)) ||
        'forbidden',
    );
  }
  return Object.fromEntries(
    keys.map((key, index) => [
      key,
      counts[index].denied ? null : counts[index].count,
    ]),
  ) as Record<K, number | null>;
};

/** A count as text; "-" for a denied one. */
export const countText = (count: number | null | undefined): string =>
  count === null ? '-' : String(count ?? 0);

/** The sum of counts, null when any part of it is denied. */
export const sumCounts = (
  counts: ReadonlyArray<number | null | undefined>,
): number | null =>
  counts.some((count) => count === null) ? null : _.sum(counts);

/** The window of the same length that ends where `window` starts. */
export const previousWindow = (window: DateTimeWindow): DateTimeWindow => {
  const after = new Date(window.after).getTime();
  const before = new Date(window.before).getTime();
  return {
    after: new Date(after - (before - after)).toISOString(),
    before: window.after,
  };
};

export interface CountDelta {
  /** "-" when either count it compares is denied. */
  value: string;
  direction: 'up' | 'down' | 'flat';
  current: number;
  previous: number;
  /** The range `current` counts; the previous range is the one right before it. */
  window?: DateTimeWindow;
}

/** The change from the previous range's count, formatted with its sign. */
export const countDelta = (
  current: number,
  previous: number,
  window?: DateTimeWindow,
  denied = false,
): CountDelta => {
  if (denied) return { value: '-', direction: 'flat', current, previous };
  const diff = current - previous;
  return {
    value: diff > 0 ? `+${diff}` : String(diff),
    direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
    current,
    previous,
    ...(window ? { window } : {}),
  };
};

/** A rise in failures is bad news, so its delta reads negative. */
export const failureSentiment = (
  delta: CountDelta,
): 'positive' | 'negative' | 'neutral' =>
  delta.direction === 'up'
    ? 'negative'
    : delta.direction === 'down'
      ? 'positive'
      : 'neutral';

export type Outcome = 'success' | 'failure';

type PreviousVariables<TFilter> = {
  previousSuccess: TFilter | null;
  previousFailure: TFilter | null;
  previousOn: boolean;
};

/** Counts that cannot change any more: the settled buckets, and a fixed range's previous range. */
export type HistoryVariables<TFilter> = BucketAliasVariables<'s', TFilter> &
  BucketAliasVariables<'f', TFilter> &
  PreviousVariables<TFilter>;

type LiveSlot = 0 | 1;

/** Counts that still move: up to two live buckets, and a relative range's previous range. */
export type LiveVariables<TFilter> = {
  [K in `live${'S' | 'F'}${LiveSlot}`]: TFilter | null;
} & { [K in `live${LiveSlot}On`]: boolean } & PreviousVariables<TFilter>;

const LIVE_SLOTS: ReadonlyArray<LiveSlot> = [0, 1];

/** Which live slot reads each bucket, `undefined` for the others. */
const liveSlots = (plan: BucketPlan): Array<LiveSlot | undefined> => {
  let next = 0;
  return plan.states.map((state) =>
    state === 'live' ? LIVE_SLOTS[next++] : undefined,
  );
};

/**
 * Variables of a success/failure count split in two queries: `history`, whose
 * counts cannot change and which runs only when `hasHistory`, and `live`, which
 * runs on every refresh. The range's totals are the sums of its buckets.
 */
export const successFailureVariables = <TFilter>(
  makeFilter: (outcome: Outcome, window: DateTimeWindow) => TFilter,
  range: string,
  now: number,
): {
  plan: BucketPlan;
  hasHistory: boolean;
  history: HistoryVariables<TFilter>;
  live: LiveVariables<TFilter>;
} => {
  const plan = planBuckets(range, now);
  const previous = previousWindow(plan.window);
  const previousVariables = (on: boolean): PreviousVariables<TFilter> => ({
    previousSuccess: on ? makeFilter('success', previous) : null,
    previousFailure: on ? makeFilter('failure', previous) : null,
    previousOn: on,
  });
  const settled = plan.buckets.map((bucket, index) =>
    plan.states[index] === 'settled' ? bucket : null,
  );
  const slots = liveSlots(plan);
  const liveBuckets = LIVE_SLOTS.map((slot) => {
    const index = slots.indexOf(slot);
    return index >= 0 ? plan.buckets[index] : null;
  });
  return {
    plan,
    hasHistory: plan.fixed || settled.some(Boolean),
    history: {
      ...bucketVariables('s', settled, (window) =>
        makeFilter('success', window),
      ),
      ...bucketVariables('f', settled, (window) =>
        makeFilter('failure', window),
      ),
      ...previousVariables(plan.fixed),
    },
    live: {
      ...(Object.fromEntries(
        LIVE_SLOTS.flatMap((slot) => {
          const window = liveBuckets[slot];
          return [
            [`liveS${slot}`, window ? makeFilter('success', window) : null],
            [`liveF${slot}`, window ? makeFilter('failure', window) : null],
            [`live${slot}On`, !!window],
          ];
        }),
      ) as Omit<LiveVariables<TFilter>, keyof PreviousVariables<TFilter>>),
      ...previousVariables(!plan.fixed),
    },
  };
};

export interface SuccessFailureCounts {
  success: number;
  failure: number;
  /** A bucket of the total is denied: the total and its delta draw "-". */
  successDenied: boolean;
  failureDenied: boolean;
  successDelta: CountDelta;
  failureDelta: CountDelta;
  successTrend: Array<number>;
  failureTrend: Array<number>;
}

type CountData = Readonly<Record<string, CountAlias>>;

/**
 * Reads the two queries {@link successFailureVariables} planned. A failed or
 * skipped count reads 0, in its bucket and in the totals summed from them; a
 * denied one marks the total denied.
 */
export const readSuccessFailure = (
  plan: BucketPlan,
  history: CountData | null,
  live: CountData,
): SuccessFailureCounts => {
  const slots = liveSlots(plan);
  const buckets = (historyPrefix: 's' | 'f', livePrefix: 'liveS' | 'liveF') =>
    plan.states.map((state, index) =>
      readCount(
        state === 'settled'
          ? history?.[`${historyPrefix}${index}`]
          : state === 'live'
            ? live[`${livePrefix}${slots[index]}`]
            : null,
      ),
    );
  const successBuckets = buckets('s', 'liveS');
  const failureBuckets = buckets('f', 'liveF');
  const successTrend = successBuckets.map((bucket) => bucket.count);
  const failureTrend = failureBuckets.map((bucket) => bucket.count);
  const success = _.sum(successTrend);
  const failure = _.sum(failureTrend);
  const successDenied = successBuckets.some((bucket) => bucket.denied);
  const failureDenied = failureBuckets.some((bucket) => bucket.denied);
  const previous = plan.fixed ? history : live;
  const previousSuccess = readCount(previous?.previousSuccess);
  const previousFailure = readCount(previous?.previousFailure);
  return {
    success,
    failure,
    successDenied,
    failureDenied,
    successDelta: countDelta(
      success,
      previousSuccess.count,
      plan.window,
      successDenied || previousSuccess.denied,
    ),
    failureDelta: countDelta(
      failure,
      previousFailure.count,
      plan.window,
      failureDenied || previousFailure.denied,
    ),
    successTrend,
    failureTrend,
  };
};
