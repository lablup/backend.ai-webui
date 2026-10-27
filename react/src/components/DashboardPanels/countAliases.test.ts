/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  bucketCounts,
  bucketVariables,
  countDelta,
  failureSentiment,
  previousWindow,
  readSuccessFailure,
  successFailureVariables,
} from './countAliases';
import { MAX_BUCKETS } from './timeRange';

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

  it('reads the counts back oldest first, a skipped alias as 0', () => {
    expect(
      bucketCounts({ s0: { count: 4 }, s1: null, f0: { count: 9 } }, 's', 3),
    ).toEqual([4, 0, 0]);
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
  it('asks for the range, the previous range and each bucket of both outcomes', () => {
    const { buckets, variables } = successFailureVariables(
      (outcome, window) => ({ outcome, ...window }),
      'now-24h',
      WINDOW,
    );
    expect(buckets).toHaveLength(6);
    expect(variables.success).toEqual({ outcome: 'success', ...WINDOW });
    expect(variables.previousFailure).toEqual({
      outcome: 'failure',
      ...previousWindow(WINDOW),
    });
    expect(variables.s5).toEqual({ outcome: 'success', ...buckets[5] });
    expect(variables.f6On).toBe(false);
  });

  it('reads the counts, deltas and trends back', () => {
    expect(
      readSuccessFailure(
        {
          success: { count: 5 },
          failure: { count: 2 },
          previousSuccess: { count: 7 },
          previousFailure: null,
          s0: { count: 5 },
          f1: { count: 2 },
        },
        2,
      ),
    ).toEqual({
      success: 5,
      failure: 2,
      successDelta: { value: '-2', direction: 'down', current: 5, previous: 7 },
      failureDelta: { value: '+2', direction: 'up', current: 2, previous: 0 },
      successTrend: [5, 0],
      failureTrend: [0, 2],
    });
  });
});
