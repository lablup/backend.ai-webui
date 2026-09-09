/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getSessionV2StatusBuckets } from './sessionStatusBuckets';
import { describe, expect, it } from 'vitest';

describe('getSessionV2StatusBuckets', () => {
  it('includes PREEMPTED / RESCHEDULING on a manager that defines them', () => {
    const { running } = getSessionV2StatusBuckets(true, false);

    expect(running).toContain('PREEMPTED');
    expect(running).toContain('RESCHEDULING');
    expect(running).not.toContain('RESERVED');
  });

  it('includes RESERVED only when the reserved-status flag is set', () => {
    expect(getSessionV2StatusBuckets(true, true).running).toContain('RESERVED');
    expect(getSessionV2StatusBuckets(false, true).running).toContain(
      'RESERVED',
    );
  });

  it('drops all preemption statuses when the client lacks both flags', () => {
    expect(getSessionV2StatusBuckets(false, false).running).toEqual([
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
    expect(getSessionV2StatusBuckets(false, false).finished).toEqual([
      'TERMINATED',
      'CANCELLED',
    ]);
    expect(getSessionV2StatusBuckets(true, true).finished).toEqual(
      getSessionV2StatusBuckets(false, false).finished,
    );
  });
});
