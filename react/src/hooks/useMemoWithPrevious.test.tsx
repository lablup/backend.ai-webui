/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useMemoWithPrevious } from './useMemoWithPrevious';
import { renderHook, act } from '@testing-library/react';

describe('useMemoWithPrevious Hook', () => {
  it('should initialize with initialPrev', () => {
    const factory = jest.fn(() => 'current value');
    const { result } = renderHook(() =>
      useMemoWithPrevious(factory, [], {
        initialPrev: 'initial previous value',
      }),
    );

    expect(result.current[0].current).toBe('current value');
    expect(result.current[0].previous).toBe('initial previous value');
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should update current and previous when dependencies change', () => {
    let dep = 1;
    const factory = jest.fn(() => `current value ${dep}`);

    const { result, rerender } = renderHook(() =>
      useMemoWithPrevious(factory, [dep]),
    );

    // Initial render
    expect(result.current[0].current).toBe('current value 1');
    expect(result.current[0].previous).toBeUndefined();
    expect(factory).toHaveBeenCalledTimes(1);

    // Update dep and rerender
    // act(() => {
    dep = 2;
    rerender();
    // });

    // After dependency change
    expect(result.current[0].current).toBe('current value 2');
    expect(result.current[0].previous).toBe('current value 1');
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('should reset previous when resetPrevious is called', () => {
    let dep = 1;
    const factory = jest.fn(() => `current value ${dep}`);

    const { result, rerender } = renderHook(() =>
      useMemoWithPrevious(factory, [dep], {
        initialPrev: 'initial previous value',
      }),
    );

    // Initial render
    expect(result.current[0].current).toBe('current value 1');
    expect(result.current[0].previous).toBe('initial previous value');

    // Update dep and rerender
    dep = 2;
    rerender();

    expect(result.current[0].current).toBe('current value 2');
    expect(result.current[0].previous).toBe('current value 1');

    // Call resetPrevious
    act(() => {
      result.current[1].resetPrevious();
    });

    expect(result.current[0].current).toBe('current value 2');
    expect(result.current[0].previous).toBe('initial previous value');
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('should not update previous if dependencies do not change', () => {
    const factory = jest.fn(() => 'current value');
    const { result, rerender } = renderHook(() =>
      useMemoWithPrevious(factory, []),
    );

    // Initial render
    expect(result.current[0].current).toBe('current value');
    expect(result.current[0].previous).toBeUndefined();

    // Rerender without changing dependencies
    rerender();

    expect(result.current[0].current).toBe('current value');
    expect(result.current[0].previous).toBeUndefined();
    expect(factory).toHaveBeenCalledTimes(1);
  });
});
