/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { MAX_BUCKETS, bucketize, type DateTimeWindow } from './timeRange';
import * as _ from 'lodash-es';

type BucketIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** `<prefix>0..7` hold the bucket filters, `<prefix>0..7On` whether each alias runs. */
export type BucketAliasVariables<TPrefix extends string, TFilter> = {
  [K in `${TPrefix}${BucketIndex}`]: TFilter | null;
} & { [K in `${TPrefix}${BucketIndex}On`]: boolean };

/**
 * Query variables for up to {@link MAX_BUCKETS} bucket count aliases named
 * `<prefix>0..7`; the aliases past the buckets are switched off.
 */
export const bucketVariables = <TPrefix extends string, TFilter>(
  prefix: TPrefix,
  buckets: ReadonlyArray<DateTimeWindow>,
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

/** The bucket counts the aliases returned, oldest first; a skipped alias reads 0. */
export const bucketCounts = (
  data: Readonly<Record<string, CountAlias>>,
  prefix: string,
  bucketCount: number,
): Array<number> =>
  _.range(Math.min(bucketCount, MAX_BUCKETS)).map(
    (index) => data[`${prefix}${index}`]?.count ?? 0,
  );

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
}

/** The change from the previous range's count, formatted with its sign. */
export const countDelta = (current: number, previous: number): CountDelta => {
  const diff = current - previous;
  return {
    value: diff > 0 ? `+${diff}` : String(diff),
    direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
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

export type SuccessFailureVariables<TFilter> = {
  success: TFilter;
  failure: TFilter;
  previousSuccess: TFilter;
  previousFailure: TFilter;
} & BucketAliasVariables<'s', TFilter> &
  BucketAliasVariables<'f', TFilter>;

/**
 * Variables of a success/failure count query: `success`, `failure`,
 * `previousSuccess`, `previousFailure`, and the bucket aliases `s0..7` / `f0..7`.
 */
export const successFailureVariables = <TFilter>(
  makeFilter: (outcome: Outcome, window: DateTimeWindow) => TFilter,
  range: string,
  timeRange: DateTimeWindow,
): {
  buckets: Array<DateTimeWindow>;
  variables: SuccessFailureVariables<TFilter>;
} => {
  const buckets = bucketize(range, new Date(timeRange.before).getTime());
  const previous = previousWindow(timeRange);
  return {
    buckets,
    variables: {
      ...bucketVariables('s', buckets, (window) =>
        makeFilter('success', window),
      ),
      ...bucketVariables('f', buckets, (window) =>
        makeFilter('failure', window),
      ),
      success: makeFilter('success', timeRange),
      failure: makeFilter('failure', timeRange),
      previousSuccess: makeFilter('success', previous),
      previousFailure: makeFilter('failure', previous),
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

/** Reads the aliases {@link successFailureVariables} asked for. */
export const readSuccessFailure = (
  data: Readonly<Record<string, CountAlias>>,
  bucketCount: number,
): SuccessFailureCounts => {
  const success = data.success?.count ?? 0;
  const failure = data.failure?.count ?? 0;
  return {
    success,
    failure,
    successDelta: countDelta(success, data.previousSuccess?.count ?? 0),
    failureDelta: countDelta(failure, data.previousFailure?.count ?? 0),
    successTrend: bucketCounts(data, 's', bucketCount),
    failureTrend: bucketCounts(data, 'f', bucketCount),
  };
};
