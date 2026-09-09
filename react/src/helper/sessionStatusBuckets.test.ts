/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getSessionV2StatusBuckets } from './sessionStatusBuckets';
import { describe, expect, it } from 'vitest';

describe('getSessionV2StatusBuckets', () => {
  it('includes PREEMPTED / RESCHEDULING on a manager that defines them', () => {
    const { running } = getSessionV2StatusBuckets(true);

    expect(running).toContain('PREEMPTED');
    expect(running).toContain('RESCHEDULING');
  });

  it('drops PREEMPTED / RESCHEDULING when the client lacks the flag', () => {
    expect(getSessionV2StatusBuckets(false).running).toEqual([
      'PENDING',
      'SCHEDULED',
      'PREPARING',
      'PREPARED',
      'CREATING',
      'RUNNING',
      'DEPRIORITIZING',
      'TERMINATING',
    ]);
  });

  it('keeps the finished bucket identical either way', () => {
    expect(getSessionV2StatusBuckets(false).finished).toEqual([
      'TERMINATED',
      'CANCELLED',
    ]);
    expect(getSessionV2StatusBuckets(true).finished).toEqual(
      getSessionV2StatusBuckets(false).finished,
    );
  });
});
