import { useTokenCount, encodeAsync } from './useTokenizer';
import { renderHook, waitFor } from '@testing-library/react';

// Mock gpt-tokenizer
jest.mock('gpt-tokenizer', () => ({
  encode: jest.fn((str: string) => Array(str.length).fill(0)), // Mock: 1 token per character
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
      const { encode } = require('gpt-tokenizer');
      encode.mockImplementationOnce(() => {
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
  });
});
