import {
  getResultValue,
  isErrorResult,
  isOkResult,
  type ExtractResultError,
  type ExtractResultValue,
} from './resultTypes';
import { describe, expect, it } from '@jest/globals';

describe('resultTypes utilities', () => {
  describe('isOkResult', () => {
    it('should return true for successful result', () => {
      const result = { ok: true, value: 'test data' };
      expect(isOkResult(result)).toBe(true);
    });

    it('should return false for failed result', () => {
      const result = { ok: false, errors: ['error message'] };
      expect(isOkResult(result)).toBe(false);
    });

    it('should narrow type correctly for successful result', () => {
      const result = { ok: true, value: 42 } as
        | { ok: true; value: number }
        | { ok: false; errors: string[] };

      if (isOkResult(result)) {
        // Type should be narrowed to { ok: true; value: number }
        expect(result.value).toBe(42);
        // TypeScript should recognize result.value exists
        const value: number = result.value;
        expect(value).toBe(42);
      }
    });

    it('should handle result with undefined value', () => {
      const result = { ok: true, value: undefined };
      expect(isOkResult(result)).toBe(true);
    });

    it('should handle result with null value', () => {
      const result = { ok: true, value: null };
      expect(isOkResult(result)).toBe(true);
    });
  });

  describe('isErrorResult', () => {
    it('should return true for failed result', () => {
      const result = { ok: false, errors: ['error1', 'error2'] };
      expect(isErrorResult(result)).toBe(true);
    });

    it('should return false for successful result', () => {
      const result = { ok: true, value: 'success' };
      expect(isErrorResult(result)).toBe(false);
    });

    it('should narrow type correctly for failed result', () => {
      const result = { ok: false, errors: ['network error'] } as
        | { ok: true; value: string }
        | { ok: false; errors: string[] };

      if (isErrorResult(result)) {
        // Type should be narrowed to { ok: false; errors: string[] }
        expect(result.errors).toEqual(['network error']);
        // TypeScript should recognize result.errors exists
        const errors: string[] = result.errors;
        expect(errors.length).toBe(1);
      }
    });

    it('should handle different error types', () => {
      interface CustomError {
        message: string;
        code: number;
      }
      const result = {
        ok: false,
        errors: { message: 'custom error', code: 500 },
      } as { ok: true; value: any } | { ok: false; errors: CustomError };

      if (isErrorResult<CustomError>(result)) {
        expect(result.errors.message).toBe('custom error');
        expect(result.errors.code).toBe(500);
      }
    });

    it('should handle result with undefined errors', () => {
      const result = { ok: false, errors: undefined };
      expect(isErrorResult(result)).toBe(true);
    });
  });

  describe('getResultValue', () => {
    it('should return value for successful result', () => {
      const result = { ok: true, value: 'test value' };
      expect(getResultValue(result)).toBe('test value');
    });

    it('should return null for failed result', () => {
      const result = { ok: false, errors: ['error'] };
      expect(getResultValue(result)).toBeNull();
    });

    it('should return custom default value for failed result', () => {
      const result = { ok: false, errors: ['error'] };
      const defaultValue = 'fallback value';
      expect(getResultValue(result, defaultValue)).toBe(defaultValue);
    });

    it('should return null when value is undefined in successful result', () => {
      const result = { ok: true, value: undefined };
      expect(getResultValue(result)).toBeNull();
    });

    it('should return custom default when value is undefined', () => {
      const result = { ok: true, value: undefined };
      expect(getResultValue(result, 'default')).toBe('default');
    });

    it('should handle numeric zero as valid value', () => {
      const result = { ok: true, value: 0 };
      expect(getResultValue(result)).toBe(0);
    });

    it('should handle empty string as valid value', () => {
      const result = { ok: true, value: '' };
      expect(getResultValue(result)).toBe('');
    });

    it('should handle boolean false as valid value', () => {
      const result = { ok: true, value: false };
      expect(getResultValue(result)).toBe(false);
    });

    it('should handle null as valid value when explicitly set', () => {
      const result = { ok: true, value: null };
      // null value is considered undefined per the logic
      expect(getResultValue(result)).toBeNull();
    });

    it('should handle complex objects', () => {
      const complexObject = { id: 1, name: 'test', nested: { value: 42 } };
      const result = { ok: true, value: complexObject };
      expect(getResultValue(result)).toEqual(complexObject);
    });

    it('should handle arrays', () => {
      const array = [1, 2, 3, 4, 5];
      const result = { ok: true, value: array };
      expect(getResultValue(result)).toEqual(array);
    });

    it('should return default for non-ok result with no default specified', () => {
      const result = { ok: false };
      expect(getResultValue(result)).toBeNull();
    });
  });

  describe('Type extraction utilities', () => {
    it('should correctly extract success value type', () => {
      type TestResult =
        | { ok: true; value: string }
        | { ok: false; errors: string[] };
      type ValueType = ExtractResultValue<TestResult>;

      // This is a type-level test - if it compiles, the type is correct
      const value: ValueType = 'test';
      expect(typeof value).toBe('string');
    });

    it('should correctly extract error type', () => {
      type TestResult =
        | { ok: true; value: number }
        | { ok: false; errors: Error[] };
      type ErrorType = ExtractResultError<TestResult>;

      // This is a type-level test - if it compiles, the type is correct
      const errors: ErrorType = [new Error('test')];
      expect(Array.isArray(errors)).toBe(true);
    });
  });

  describe('Real-world GraphQL Result pattern', () => {
    it('should handle typical GraphQL @catch result', () => {
      type User = { id: string; name: string };
      type UserResult =
        | { ok: true; value: User }
        | { ok: false; errors: readonly { message: string }[] };

      const successResult: UserResult = {
        ok: true,
        value: { id: '123', name: 'John' },
      };

      const errorResult: UserResult = {
        ok: false,
        errors: [{ message: 'User not found' }],
      };

      // Success case
      if (isOkResult(successResult)) {
        expect(successResult.value.id).toBe('123');
        expect(successResult.value.name).toBe('John');
      }

      // Error case
      if (isErrorResult(errorResult)) {
        expect(errorResult.errors[0].message).toBe('User not found');
      }

      // Value extraction
      const user = getResultValue(successResult);
      expect(user?.name).toBe('John');

      const noUser = getResultValue(errorResult);
      expect(noUser).toBeNull();
    });

    it('should handle nullable result values', () => {
      type NullableResult =
        | { ok: true; value: string | null }
        | { ok: false; errors: string[] };

      const nullValueResult: NullableResult = {
        ok: true,
        value: null,
      };

      expect(isOkResult(nullValueResult)).toBe(true);
      // Since value is explicitly null, getResultValue returns the default
      expect(getResultValue(nullValueResult)).toBeNull();
    });

    it('should handle multiple error types', () => {
      type MultiErrorResult =
        | { ok: true; value: number }
        | { ok: false; errors: Array<{ message: string; code: number }> };

      const errorResult: MultiErrorResult = {
        ok: false,
        errors: [
          { message: 'Validation error', code: 400 },
          { message: 'Auth error', code: 401 },
        ],
      };

      if (isErrorResult(errorResult)) {
        expect(errorResult.errors).toHaveLength(2);
        expect(errorResult.errors[0].code).toBe(400);
        expect(errorResult.errors[1].code).toBe(401);
      }
    });
  });
});
