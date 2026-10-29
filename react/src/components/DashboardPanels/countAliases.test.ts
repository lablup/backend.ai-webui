/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  bucketVariables,
  countDelta,
  failureSentiment,
  previousWindow,
  readSuccessFailure,
  successFailureVariables,
} from './countAliases';
import { MAX_BUCKETS, customRange, planBuckets } from './timeRange';

const WINDOW = {
  after: '2026-10-25T12:00:00.000Z',
  before: '2026-10-26T12:00:00.000Z',
};

describe('bucket count aliases', () => {
  const buckets = [
    { after: '2026-10-26T00:00:00.000Z', before: '2026-10-26T04:00:00.000Z' },
    { after: '2026-10-26T04:00:00.000Z', before: '2026-10-26T08:00:00.000Z' },
  ];

  it('fills every alias slot, switching off the ones past the buckets', () => {
    const variables = bucketVariables('s', buckets, (window) => ({
      terminatedAt: window,
    }));
    expect(Object.keys(variables)).toHaveLength(MAX_BUCKETS * 2);
    expect(variables.s0).toEqual({ terminatedAt: buckets[0] });
    expect(variables.s1On).toBe(true);
    expect(variables.s2).toBeNull();
    expect(variables.s2On).toBe(false);
  });

  it('switches off the alias of a null bucket', () => {
    const variables = bucketVariables('s', [null, buckets[1]], (window) => ({
      terminatedAt: window,
    }));
    expect(variables.s0On).toBe(false);
    expect(variables.s0).toBeNull();
    expect(variables.s1).toEqual({ terminatedAt: buckets[1] });
  });
});

describe('previousWindow and countDelta', () => {
  it('takes the window of the same length right before', () => {
    expect(previousWindow(WINDOW)).toEqual({
      after: '2026-10-24T12:00:00.000Z',
      before: '2026-10-25T12:00:00.000Z',
    });
  });

  it('signs the change, names its direction, and reads a rise in failures as negative', () => {
    expect(countDelta(12, 9)).toEqual({
      value: '+3',
      direction: 'up',
      current: 12,
      previous: 9,
    });
    expect(countDelta(1, 2, WINDOW)).toEqual({
      value: '-1',
      direction: 'down',
      current: 1,
      previous: 2,
      window: WINDOW,
    });
    expect(countDelta(0, 0)).toMatchObject({ value: '0', direction: 'flat' });
    expect(failureSentiment(countDelta(3, 1))).toBe('negative');
    expect(failureSentiment(countDelta(1, 3))).toBe('positive');
  });
});

describe('successFailureVariables and readSuccessFailure', () => {
  const NOW = Date.UTC(2026, 9, 26, 12, 7, 0);
  const makeFilter = (
    outcome: 'success' | 'failure',
    window: { after: string; before: string },
  ) => ({ outcome, ...window });

  it('asks history for the settled buckets and live for the moving ones and a relative previous range', () => {
    const { plan, hasHistory, history, live } = successFailureVariables(
      makeFilter,
      'now-24h',
      NOW,
    );
    const last = plan.buckets.length - 1;
    expect(hasHistory).toBe(true);
    expect(history.s0On).toBe(false);
    expect(history.s1).toEqual({ outcome: 'success', ...plan.buckets[1] });
    expect(history[`f${last}On` as 'f7On']).toBe(false);
    expect(history.previousOn).toBe(false);
    expect(live.liveS0).toEqual({ outcome: 'success', ...plan.buckets[0] });
    expect(live.liveF1).toEqual({ outcome: 'failure', ...plan.buckets[last] });
    expect(live.previousOn).toBe(true);
    expect(live.previousFailure).toEqual({
      outcome: 'failure',
      ...previousWindow(plan.window),
    });
  });

  it('keeps a past custom range and its previous range in history only', () => {
    const { hasHistory, history, live } = successFailureVariables(
      makeFilter,
      customRange('2026-10-01', '2026-10-07'),
      NOW,
    );
    expect(hasHistory).toBe(true);
    expect(history.previousOn).toBe(true);
    expect(live.previousOn).toBe(false);
    expect(live.live0On).toBe(false);
    expect(live.live1On).toBe(false);
  });

  it('sums the buckets into the totals and reads the previous range from the right query', () => {
    const plan = planBuckets('now-1h', NOW);
    const last = plan.buckets.length - 1;
    const history = Object.fromEntries(
      plan.buckets.map((_bucket, index) => [`s${index}`, { count: 10 }]),
    );
    const counts = readSuccessFailure(
      plan,
      { ...history, f2: { count: 4 }, s3: null },
      {
        liveS0: { count: 1 },
        liveS1: { count: 2 },
        liveF1: { count: 3 },
        previousSuccess: { count: 50 },
      },
    );
    const settled = plan.states.filter((state) => state === 'settled').length;
    expect(counts.successTrend[0]).toBe(1);
    expect(counts.successTrend[last]).toBe(2);
    expect(counts.successTrend[3]).toBe(0);
    expect(counts.success).toBe(1 + 2 + 10 * (settled - 1));
    expect(counts.failureTrend).toEqual(
      plan.states.map((_state, index) =>
        index === 2 ? 4 : index === last ? 3 : 0,
      ),
    );
    expect(counts.failure).toBe(7);
    expect(counts.successDelta).toMatchObject({
      current: counts.success,
      previous: 50,
      window: plan.window,
    });
    expect(counts.failureDelta.previous).toBe(0);
  });

  it('reads a failed or missing history as 0', () => {
    const plan = planBuckets('now-1h', NOW);
    const counts = readSuccessFailure(plan, null, {});
    expect(counts.success).toBe(0);
    expect(counts.successTrend).toHaveLength(plan.buckets.length);
  });
});
