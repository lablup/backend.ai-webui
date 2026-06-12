import * as tokenizerModule from './useTokenizer';
import { useTokenCount, encodeAsync } from './useTokenizer';
import { act, renderHook, waitFor } from '@testing-library/react';
import { encode } from 'gpt-tokenizer';
import type { Mock } from 'vitest';

// A manually-resolvable promise, used to drive the order in which
// concurrent encodeAsync calls complete.
const createDeferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

// Mock gpt-tokenizer
vi.mock('gpt-tokenizer', () => ({
  encode: vi.fn((str: string) => Array(str.length).fill(0)), // Mock: 1 token per character
}));

describe('useTokenizer', () => {
  describe('encodeAsync', () => {
    it('should encode string and return token count', async () => {
      const result = await encodeAsync('hello world');
      expect(result).toBe(11); // 11 characters = 11 tokens in our mock
    });

    it('should handle empty string', async () => {
      const result = await encodeAsync('');
      expect(result).toBe(0);
    });

    it('should handle long strings', async () => {
      const longString = 'a'.repeat(1000);
      const result = await encodeAsync(longString);
      expect(result).toBe(1000);
    });
  });

  describe('useTokenCount', () => {
    it('should initialize with 0', () => {
      const { result } = renderHook(() => useTokenCount());
      expect(result.current).toBe(0);
    });

    it('should count tokens for given input', async () => {
      const { result } = renderHook(() => useTokenCount('hello world'));

      await waitFor(() => {
        expect(result.current).toBe(11);
      });
    });

    it('should update token count when input changes', async () => {
      const { result, rerender } = renderHook(
        ({ input }) => useTokenCount(input),
        {
          initialProps: { input: 'hello' },
        },
      );

      await waitFor(() => {
        expect(result.current).toBe(5);
      });

      rerender({ input: 'hello world' });

      await waitFor(() => {
        expect(result.current).toBe(11);
      });
    });

    it('should fallback to string length on encoding error', async () => {
      (encode as Mock).mockImplementationOnce(() => {
        throw new Error('Encoding failed');
      });

      const { result } = renderHook(() => useTokenCount('test'));

      await waitFor(() => {
        expect(result.current).toBe(4); // Fallback to string length
      });
    });

    it('should handle empty string input', async () => {
      const { result } = renderHook(() => useTokenCount(''));

      await waitFor(() => {
        expect(result.current).toBe(0);
      });
    });

    it('should handle undefined input', async () => {
      const { result } = renderHook(() => useTokenCount(undefined));

      await waitFor(() => {
        expect(result.current).toBe(0);
      });
    });

    // Regression test for FR-3091: during streaming, useTokenCount fires a
    // new async token count on every chunk. Those calls can resolve out of
    // order. Without cancellation, a stale (earlier-input) result that
    // resolves *after* the latest one would overwrite the displayed count,
    // making TPS climb after streaming ends. The effect cleanup must discard
    // any result whose input is no longer current.
    it('discards a stale result that resolves after a newer input', async () => {
      const firstCall = createDeferred<number>();
      const secondCall = createDeferred<number>();
      const spy = vi
        .spyOn(tokenizerModule.tokenCounter, 'encodeAsync')
        .mockReturnValueOnce(firstCall.promise)
        .mockReturnValueOnce(secondCall.promise);

      const { result, rerender } = renderHook(
        ({ input }) => useTokenCount(input),
        { initialProps: { input: 'short' } },
      );

      // Change the input before the first computation resolves, kicking off a
      // second concurrent computation.
      rerender({ input: 'a much longer streamed message' });

      expect(spy).toHaveBeenCalledTimes(2);

      // The newer (second) computation resolves first with the correct count.
      await act(async () => {
        secondCall.resolve(30);
      });
      expect(result.current).toBe(30);

      // The stale (first) computation resolves later with a larger value.
      // Cancellation must prevent it from overwriting the current count.
      await act(async () => {
        firstCall.resolve(5);
      });
      expect(result.current).toBe(30);

      spy.mockRestore();
    });
  });
});
