/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePromiseTracker } from './usePromiseTracker';

describe('usePromiseTracker', () => {
  it('should initialize with zero counts', () => {
    const { result } = renderHook(() => usePromiseTracker());

    expect(result.current.pendingCount).toBe(0);
    expect(result.current.resolvedCount).toBe(0);
    expect(result.current.rejectedCount).toBe(0);
    expect(result.current.results.resolved).toEqual([]);
    expect(result.current.results.rejected).toEqual([]);
  });

  it('should track a single resolved promise', async () => {
    const { result } = renderHook(() => usePromiseTracker<string>());
    const testData = 'test-data';
    const promise = Promise.resolve(testData);

    act(() => {
      result.current.trackPromise(promise);
    });

    // Initially should show as pending
    expect(result.current.pendingCount).toBe(1);
    expect(result.current.resolvedCount).toBe(0);

    // Wait for promise to resolve
    await act(async () => {
      await promise;
    });

    // After resolution
    expect(result.current.pendingCount).toBe(0);
    expect(result.current.resolvedCount).toBe(1);
    expect(result.current.rejectedCount).toBe(0);
    expect(result.current.results.resolved).toEqual([testData]);
    expect(result.current.results.rejected).toEqual([]);
  });

  it('should track a single rejected promise', async () => {
    const { result } = renderHook(() => usePromiseTracker<never, Error>());
    const testError = new Error('test-error');
    const promise = Promise.reject(testError);

    let caughtError: Error | null = null;

    act(() => {
      result.current.trackPromise(promise).catch((e) => {
        caughtError = e;
      });
    });

    // Initially should show as pending
    expect(result.current.pendingCount).toBe(1);
    expect(result.current.rejectedCount).toBe(0);

    // Wait for promise to reject
    await act(async () => {
      try {
        await promise;
      } catch {
        // Expected to reject
      }
    });

    // After rejection
    expect(result.current.pendingCount).toBe(0);
    expect(result.current.resolvedCount).toBe(0);
    expect(result.current.rejectedCount).toBe(1);
    expect(result.current.results.resolved).toEqual([]);
    expect(result.current.results.rejected).toEqual([testError]);
    expect(caughtError).toBe(testError);
  });

  it('should track multiple concurrent promises', async () => {
    const { result } = renderHook(() => usePromiseTracker<string>());

    const promise1 = new Promise<string>((resolve) =>
      setTimeout(() => resolve('result-1'), 50),
    );
    const promise2 = new Promise<string>((resolve) =>
      setTimeout(() => resolve('result-2'), 100),
    );
    const promise3 = new Promise<string>((resolve) =>
      setTimeout(() => resolve('result-3'), 25),
    );

    act(() => {
      result.current.trackPromise(promise1);
      result.current.trackPromise(promise2);
      result.current.trackPromise(promise3);
    });

    // All should be pending
    expect(result.current.pendingCount).toBe(3);
    expect(result.current.resolvedCount).toBe(0);

    // Wait for all to resolve
    await act(async () => {
      await Promise.all([promise1, promise2, promise3]);
    });

    // All should be resolved
    expect(result.current.pendingCount).toBe(0);
    expect(result.current.resolvedCount).toBe(3);
    expect(result.current.results.resolved).toContain('result-1');
    expect(result.current.results.resolved).toContain('result-2');
    expect(result.current.results.resolved).toContain('result-3');
  });

  it('should track mixed resolved and rejected promises', async () => {
    const { result } = renderHook(() => usePromiseTracker<string, Error>());

    const promise1 = Promise.resolve('success-1');
    const promise2 = Promise.reject(new Error('error-1'));
    const promise3 = Promise.resolve('success-2');

    act(() => {
      result.current.trackPromise(promise1);
      result.current.trackPromise(promise2).catch(() => {
        // Suppress unhandled rejection
      });
      result.current.trackPromise(promise3);
    });

    // All should be pending
    expect(result.current.pendingCount).toBe(3);

    // Wait for all to settle
    await act(async () => {
      await Promise.allSettled([promise1, promise2, promise3]);
    });

    // Check final counts
    expect(result.current.pendingCount).toBe(0);
    expect(result.current.resolvedCount).toBe(2);
    expect(result.current.rejectedCount).toBe(1);
    expect(result.current.results.resolved).toHaveLength(2);
    expect(result.current.results.rejected).toHaveLength(1);
  });

  it('should reset counts and results', async () => {
    const { result } = renderHook(() => usePromiseTracker<string>());

    const promise1 = Promise.resolve('data-1');
    const promise2 = Promise.resolve('data-2');

    act(() => {
      result.current.trackPromise(promise1);
      result.current.trackPromise(promise2);
    });

    await act(async () => {
      await Promise.all([promise1, promise2]);
    });

    // Should have results
    expect(result.current.resolvedCount).toBe(2);
    expect(result.current.results.resolved).toHaveLength(2);

    // Reset
    act(() => {
      result.current.reset();
    });

    // Should be back to initial state
    expect(result.current.pendingCount).toBe(0);
    expect(result.current.resolvedCount).toBe(0);
    expect(result.current.rejectedCount).toBe(0);
    expect(result.current.results.resolved).toEqual([]);
    expect(result.current.results.rejected).toEqual([]);
  });

  it('should preserve promise return value', async () => {
    const { result } = renderHook(() => usePromiseTracker<number>());
    const expectedValue = 42;
    const promise = Promise.resolve(expectedValue);

    let returnedValue: number | undefined;

    await act(async () => {
      returnedValue = await result.current.trackPromise(promise);
    });

    expect(returnedValue).toBe(expectedValue);
  });

  it('should preserve promise rejection', async () => {
    const { result } = renderHook(() => usePromiseTracker<never, Error>());
    const expectedError = new Error('test-error');
    const promise = Promise.reject(expectedError);

    let caughtError: Error | undefined;

    await act(async () => {
      try {
        await result.current.trackPromise(promise);
      } catch (error) {
        caughtError = error as Error;
      }
    });

    expect(caughtError).toBe(expectedError);
  });

  it('should handle promises with different types', async () => {
    const { result } = renderHook(() =>
      usePromiseTracker<number | string | boolean>(),
    );

    const promise1 = Promise.resolve(42);
    const promise2 = Promise.resolve('text');
    const promise3 = Promise.resolve(true);

    act(() => {
      result.current.trackPromise(promise1);
      result.current.trackPromise(promise2);
      result.current.trackPromise(promise3);
    });

    await act(async () => {
      await Promise.all([promise1, promise2, promise3]);
    });

    expect(result.current.results.resolved).toEqual([42, 'text', true]);
  });

  it('should handle sequential promise tracking', async () => {
    const { result } = renderHook(() => usePromiseTracker<string>());

    // Track first promise
    const promise1 = Promise.resolve('first');
    act(() => {
      result.current.trackPromise(promise1);
    });

    await act(async () => {
      await promise1;
    });

    expect(result.current.resolvedCount).toBe(1);
    expect(result.current.pendingCount).toBe(0);

    // Track second promise
    const promise2 = Promise.resolve('second');
    act(() => {
      result.current.trackPromise(promise2);
    });

    await act(async () => {
      await promise2;
    });

    expect(result.current.resolvedCount).toBe(2);
    expect(result.current.pendingCount).toBe(0);
    expect(result.current.results.resolved).toEqual(['first', 'second']);
  });

  it('should handle custom error types', async () => {
    class CustomError extends Error {
      constructor(
        message: string,
        public code: number,
      ) {
        super(message);
      }
    }

    const { result } = renderHook(() =>
      usePromiseTracker<never, CustomError>(),
    );

    const customError = new CustomError('custom error', 404);
    const promise = Promise.reject(customError);

    act(() => {
      result.current.trackPromise(promise).catch(() => {
        // Suppress unhandled rejection
      });
    });

    await act(async () => {
      try {
        await promise;
      } catch {
        // Expected
      }
    });

    expect(result.current.results.rejected).toHaveLength(1);
    expect(result.current.results.rejected[0]).toBeInstanceOf(CustomError);
    expect(result.current.results.rejected[0].code).toBe(404);
  });
});
