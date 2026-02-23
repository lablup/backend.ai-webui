import useDebouncedDeferredValue from './useDebouncedDeferredValue';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';

describe('useDebouncedDeferredValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebouncedDeferredValue('initial'));
      expect(result.current).toBe('initial');
    });

    it('should handle different value types', () => {
      const { result: stringResult } = renderHook(() =>
        useDebouncedDeferredValue('test'),
      );
      expect(stringResult.current).toBe('test');

      const { result: numberResult } = renderHook(() =>
        useDebouncedDeferredValue(42),
      );
      expect(numberResult.current).toBe(42);

      const { result: booleanResult } = renderHook(() =>
        useDebouncedDeferredValue(true),
      );
      expect(booleanResult.current).toBe(true);

      const { result: objectResult } = renderHook(() =>
        useDebouncedDeferredValue({ key: 'value' }),
      );
      expect(objectResult.current).toEqual({ key: 'value' });

      const { result: arrayResult } = renderHook(() =>
        useDebouncedDeferredValue([1, 2, 3]),
      );
      expect(arrayResult.current).toEqual([1, 2, 3]);
    });

    it('should handle null and undefined values', () => {
      const { result: nullResult } = renderHook(() =>
        useDebouncedDeferredValue(null),
      );
      expect(nullResult.current).toBe(null);

      const { result: undefinedResult } = renderHook(() =>
        useDebouncedDeferredValue(undefined),
      );
      expect(undefinedResult.current).toBe(undefined);
    });
  });

  describe('Debouncing Behavior', () => {
    it('should debounce rapid value changes with default wait time', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedDeferredValue(value),
        { initialProps: { value: 'initial' } },
      );

      expect(result.current).toBe('initial');

      // Rapid updates within debounce window
      act(() => {
        rerender({ value: 'updated1' });
        jest.advanceTimersByTime(50);
        rerender({ value: 'updated2' });
        jest.advanceTimersByTime(50);
        rerender({ value: 'final' });
      });

      // Should not have updated yet
      expect(result.current).toBe('initial');

      // Advance past default debounce time (200ms)
      await act(async () => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(result.current).toBe('final');
      });
    });

    it('should respect custom wait time option', async () => {
      const customWait = 500;
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedDeferredValue(value, { wait: customWait }),
        { initialProps: { value: 'initial' } },
      );

      act(() => {
        rerender({ value: 'updated' });
      });

      // Should not update before custom wait time
      await act(async () => {
        jest.advanceTimersByTime(400);
      });
      expect(result.current).toBe('initial');

      // Should update after custom wait time
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current).toBe('updated');
      });
    });

    it('should handle leading edge debounce option', async () => {
      const { result, rerender } = renderHook(
        ({ value }) =>
          useDebouncedDeferredValue(value, {
            wait: 200,
            leading: true,
          }),
        { initialProps: { value: 'initial' } },
      );

      expect(result.current).toBe('initial');

      act(() => {
        rerender({ value: 'updated' });
      });

      // With leading: true, value should update immediately on first change
      await waitFor(() => {
        expect(result.current).toBe('updated');
      });
    });

    it('should handle trailing edge debounce option', async () => {
      const { result, rerender } = renderHook(
        ({ value }) =>
          useDebouncedDeferredValue(value, {
            wait: 200,
            trailing: true,
          }),
        { initialProps: { value: 'initial' } },
      );

      act(() => {
        rerender({ value: 'updated' });
      });

      // Should not update immediately
      expect(result.current).toBe('initial');

      // Should update after wait time
      await act(async () => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(result.current).toBe('updated');
      });
    });

    it('should handle maxWait option', async () => {
      const { result, rerender } = renderHook(
        ({ value }) =>
          useDebouncedDeferredValue(value, {
            wait: 500,
            maxWait: 300,
          }),
        { initialProps: { value: 'initial' } },
      );

      // Continuously update within debounce window
      act(() => {
        rerender({ value: 'update1' });
        jest.advanceTimersByTime(100);
        rerender({ value: 'update2' });
        jest.advanceTimersByTime(100);
        rerender({ value: 'update3' });
        jest.advanceTimersByTime(100);
      });

      // After maxWait time, should force update even if keep updating
      await waitFor(() => {
        expect(result.current).toBe('update3');
      });
    });
  });

  describe('Integration with React Deferred Value', () => {
    it('should combine debouncing with deferred updates', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedDeferredValue(value),
        { initialProps: { value: 'initial' } },
      );

      // Update value
      act(() => {
        rerender({ value: 'updated' });
      });

      // Initial value should remain during debounce
      expect(result.current).toBe('initial');

      // After debounce time
      await act(async () => {
        jest.advanceTimersByTime(200);
      });

      // Should eventually update (deferred value may lag slightly)
      await waitFor(() => {
        expect(result.current).toBe('updated');
      });
    });

    it('should handle multiple rapid updates correctly', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedDeferredValue(value),
        { initialProps: { value: 0 } },
      );

      // Simulate rapid typing/updates
      const updates = [1, 2, 3, 4, 5];
      act(() => {
        updates.forEach((value, index) => {
          setTimeout(() => rerender({ value }), index * 50);
        });
      });

      // Advance through all updates
      await act(async () => {
        jest.advanceTimersByTime(250);
      });

      // Should debounce and show final value
      await act(async () => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(result.current).toBe(5);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero wait time', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedDeferredValue(value, { wait: 0 }),
        { initialProps: { value: 'initial' } },
      );

      act(() => {
        rerender({ value: 'updated' });
      });

      // With zero wait, should update quickly
      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(result.current).toBe('updated');
      });
    });

    it('should handle same value updates', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedDeferredValue(value),
        { initialProps: { value: 'test' } },
      );

      act(() => {
        rerender({ value: 'test' });
      });

      await act(async () => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current).toBe('test');
    });

    it('should handle complex object updates', async () => {
      const initialObj = { id: 1, name: 'John', nested: { value: 'a' } };
      const updatedObj = { id: 2, name: 'Jane', nested: { value: 'b' } };

      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedDeferredValue(value),
        { initialProps: { value: initialObj } },
      );

      expect(result.current).toEqual(initialObj);

      act(() => {
        rerender({ value: updatedObj });
      });

      await act(async () => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(result.current).toEqual(updatedObj);
      });
    });
  });

  describe('Performance Considerations', () => {
    it('should not cause memory leaks with unmounting', () => {
      const { unmount } = renderHook(() => useDebouncedDeferredValue('test'));

      expect(() => unmount()).not.toThrow();
    });

    it('should handle unmount during debounce', async () => {
      const { rerender, unmount } = renderHook(
        ({ value }) => useDebouncedDeferredValue(value),
        { initialProps: { value: 'initial' } },
      );

      act(() => {
        rerender({ value: 'updated' });
      });

      // Unmount before debounce completes
      unmount();

      // Should not throw or cause issues
      await act(async () => {
        jest.advanceTimersByTime(200);
      });
    });
  });

  describe('TypeScript Type Safety', () => {
    it('should preserve type information', () => {
      const { result: stringResult } = renderHook(() =>
        useDebouncedDeferredValue('test'),
      );
      const _stringCheck: string = stringResult.current;

      const { result: numberResult } = renderHook(() =>
        useDebouncedDeferredValue(42),
      );
      const _numberCheck: number = numberResult.current;

      const { result: objectResult } = renderHook(() =>
        useDebouncedDeferredValue({ key: 'value' }),
      );
      const _objectCheck: { key: string } = objectResult.current;
    });
  });
});
