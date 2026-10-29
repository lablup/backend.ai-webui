/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  MAX_BUCKETS,
  planBuckets,
  type BucketPlan,
  type DateTimeWindow,
} from './timeRange';
import * as _ from 'lodash-es';

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
  Object.fromEntries(
    _.range(MAX_BUCKETS).flatMap((index) => {
      const window = buckets[index];
      return [
        [`${prefix}${index}`, window ? makeFilter(window) : null],
        [`${prefix}${index}On`, !!window],
      ];
    }),
  ) as BucketAliasVariables<TPrefix, TFilter>;

type CountAlias = { readonly count: number } | null | undefined;

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
): CountDelta => {
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
  successDelta: CountDelta;
  failureDelta: CountDelta;
  successTrend: Array<number>;
  failureTrend: Array<number>;
}

type CountData = Readonly<Record<string, CountAlias>>;

/**
 * Reads the two queries {@link successFailureVariables} planned. A failed or
 * skipped count reads 0, in its bucket and in the totals summed from them.
 */
export const readSuccessFailure = (
  plan: BucketPlan,
  history: CountData | null,
  live: CountData,
): SuccessFailureCounts => {
  const slots = liveSlots(plan);
  const trend = (historyPrefix: 's' | 'f', livePrefix: 'liveS' | 'liveF') =>
    plan.states.map((state, index) =>
      state === 'settled'
        ? (history?.[`${historyPrefix}${index}`]?.count ?? 0)
        : state === 'live'
          ? (live[`${livePrefix}${slots[index]}`]?.count ?? 0)
          : 0,
    );
  const successTrend = trend('s', 'liveS');
  const failureTrend = trend('f', 'liveF');
  const success = _.sum(successTrend);
  const failure = _.sum(failureTrend);
  const previous = plan.fixed ? history : live;
  return {
    success,
    failure,
    successDelta: countDelta(
      success,
      previous?.previousSuccess?.count ?? 0,
      plan.window,
    ),
    failureDelta: countDelta(
      failure,
      previous?.previousFailure?.count ?? 0,
      plan.window,
    ),
    successTrend,
    failureTrend,
  };
};
