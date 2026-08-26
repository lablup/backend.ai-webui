/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSessionV2StatusBuckets } from './useSessionV2StatusBuckets';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let supportedFeatures: Array<string> = [];

vi.mock('.', () => ({
  useSuspendedBackendaiClient: () => ({
    supports: (feature: string) => supportedFeatures.includes(feature),
  }),
}));

describe('useSessionV2StatusBuckets', () => {
  beforeEach(() => {
    supportedFeatures = ['session-preemption-statuses'];
  });

  it('includes PREEMPTED / RESCHEDULING on a manager that defines them', () => {
    const { result } = renderHook(() => useSessionV2StatusBuckets());

    expect(result.current.running).toContain('PREEMPTED');
    expect(result.current.running).toContain('RESCHEDULING');
  });

  it('drops PREEMPTED / RESCHEDULING when the client lacks the flag', () => {
    supportedFeatures = [];
    const { result } = renderHook(() => useSessionV2StatusBuckets());

    expect(result.current.running).toEqual([
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
    const { result: onNew } = renderHook(() => useSessionV2StatusBuckets());
    supportedFeatures = [];
    const { result: onOld } = renderHook(() => useSessionV2StatusBuckets());

    expect(onOld.current.finished).toEqual(['TERMINATED', 'CANCELLED']);
    expect(onNew.current.finished).toEqual(onOld.current.finished);
  });
});
