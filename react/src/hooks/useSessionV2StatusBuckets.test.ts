/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSessionV2StatusBuckets } from './useSessionV2StatusBuckets';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let managerVersion = '26.8.0';

// Semver-lite compare — enough for the two-branch gate under test.
const isManagerVersionCompatibleWith = (version: string) => {
  const toParts = (v: string) => v.split('.').map(Number);
  const [a, b] = [toParts(managerVersion), toParts(version)];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff > 0;
  }
  return true;
};

vi.mock('.', () => ({
  useSuspendedBackendaiClient: () => ({ isManagerVersionCompatibleWith }),
}));

describe('useSessionV2StatusBuckets', () => {
  beforeEach(() => {
    managerVersion = '26.8.0';
  });

  it('includes PREEMPTED / RESCHEDULING on a manager that defines them', () => {
    const { result } = renderHook(() => useSessionV2StatusBuckets());

    expect(result.current.running).toContain('PREEMPTED');
    expect(result.current.running).toContain('RESCHEDULING');
  });

  it('drops PREEMPTED / RESCHEDULING on a manager older than 26.8.0', () => {
    managerVersion = '26.4.9';
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

  it('keeps the finished bucket identical across manager versions', () => {
    const { result: onNew } = renderHook(() => useSessionV2StatusBuckets());
    managerVersion = '26.4.9';
    const { result: onOld } = renderHook(() => useSessionV2StatusBuckets());

    expect(onOld.current.finished).toEqual(['TERMINATED', 'CANCELLED']);
    expect(onNew.current.finished).toEqual(onOld.current.finished);
  });
});
