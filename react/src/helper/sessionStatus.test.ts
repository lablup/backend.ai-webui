/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  getSessionKernelProgress,
  isTransitionalSessionStatus,
} from './sessionStatus';
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

const kernels = (...statuses: Array<string>) => ({
  edges: statuses.map((status) => ({ node: { status } })),
});

const repeat = (status: string, count: number) =>
  Array.from({ length: count }, () => status);

describe('getSessionKernelProgress', () => {
  it.each(['PREPARING', 'PREPARED', 'PULLING', 'CREATING'])(
    'counts RUNNING kernels while the session is %s',
    (status) => {
      expect(
        getSessionKernelProgress({
          status,
          cluster_size: 4,
          kernel_nodes: kernels('RUNNING', 'RUNNING', 'PULLING', 'PREPARING'),
        }),
      ).toEqual({ phase: 'creating', done: 2, total: 4, percent: 50 });
    },
  );

  it('counts TERMINATED kernels while the session is TERMINATING', () => {
    expect(
      getSessionKernelProgress({
        status: 'TERMINATING',
        cluster_size: 120,
        kernel_nodes: kernels(...repeat('TERMINATED', 119), 'RUNNING'),
      }),
    ).toEqual({ phase: 'terminating', done: 119, total: 120, percent: 99 });
  });

  it.each(['RUNNING', 'TERMINATED', 'PENDING', 'ERROR'])(
    'reports no phase and no percent for %s',
    (status) => {
      expect(
        getSessionKernelProgress({
          status,
          cluster_size: 4,
          kernel_nodes: kernels('RUNNING', 'RUNNING', 'RUNNING', 'RUNNING'),
        }).phase,
      ).toBeNull();
      expect(
        getSessionKernelProgress({
          status,
          cluster_size: 4,
          kernel_nodes: kernels('RUNNING', 'RUNNING', 'RUNNING', 'RUNNING'),
        }).percent,
      ).toBeUndefined();
    },
  );

  it('falls back to the kernel count when cluster_size is missing', () => {
    expect(
      getSessionKernelProgress({
        status: 'TERMINATING',
        cluster_size: null,
        kernel_nodes: kernels('TERMINATED', 'TERMINATED', 'RUNNING'),
      }),
    ).toEqual({ phase: 'terminating', done: 2, total: 3, percent: 67 });
  });

  it('ignores a non-positive cluster_size', () => {
    expect(
      getSessionKernelProgress({
        status: 'TERMINATING',
        cluster_size: 0,
        kernel_nodes: kernels('TERMINATED', 'RUNNING'),
      }).total,
    ).toBe(2);
  });

  it('is indeterminate for a single-node session', () => {
    expect(
      getSessionKernelProgress({
        status: 'TERMINATING',
        cluster_size: 1,
        kernel_nodes: kernels('RUNNING'),
      }).percent,
    ).toBeUndefined();
  });

  it('is indeterminate when no kernels were selected', () => {
    expect(
      getSessionKernelProgress({
        status: 'TERMINATING',
        cluster_size: 120,
        kernel_nodes: { edges: [] },
      }).percent,
    ).toBeUndefined();
    expect(
      getSessionKernelProgress({ status: 'TERMINATING' }).percent,
    ).toBeUndefined();
  });

  it('clamps to 100 when more kernels finish than cluster_size claims', () => {
    expect(
      getSessionKernelProgress({
        status: 'TERMINATING',
        cluster_size: 2,
        kernel_nodes: kernels('TERMINATED', 'TERMINATED', 'TERMINATED'),
      }).percent,
    ).toBe(100);
  });

  it('survives null edges and null nodes', () => {
    expect(
      getSessionKernelProgress({
        status: 'TERMINATING',
        cluster_size: 4,
        kernel_nodes: {
          edges: [null, { node: null }, { node: { status: 'TERMINATED' } }],
        },
      }),
    ).toEqual({ phase: 'terminating', done: 1, total: 4, percent: 25 });
  });
});
