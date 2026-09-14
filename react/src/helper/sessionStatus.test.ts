/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { isTransitionalSessionStatus } from './sessionStatus';
import { describe, expect, it } from 'vitest';

describe('isTransitionalSessionStatus', () => {
  it.each([
    'RESERVED',
    'PREEMPTED',
    'RESCHEDULING',
    'SCHEDULED',
    'RESTARTING',
    'TERMINATING',
    'PENDING',
    'PREPARING',
    'PREPARED',
    'CREATING',
    'PULLING',
  ])('treats %s as transitional', (status) => {
    expect(isTransitionalSessionStatus(status)).toBe(true);
  });

  it.each(['RUNNING', 'TERMINATED', 'CANCELLED', 'ERROR', 'DEPRIORITIZING'])(
    'treats %s as settled',
    (status) => {
      expect(isTransitionalSessionStatus(status)).toBe(false);
    },
  );

  it('treats a missing status as settled', () => {
    expect(isTransitionalSessionStatus(null)).toBe(false);
    expect(isTransitionalSessionStatus(undefined)).toBe(false);
    expect(isTransitionalSessionStatus('')).toBe(false);
  });
});
