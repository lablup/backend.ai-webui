import { getResultValue, isErrorResult, isOkResult } from './resultTypes';

describe('resultTypes utilities', () => {
  describe('isOkResult', () => {
    it('should return true for successful results', () => {
      const result = { ok: true, value: 'success data' };
      expect(isOkResult(result)).toBe(true);
    });

    it('should return false for failed results', () => {
      const result = { ok: false, errors: ['error message'] };
      expect(isOkResult(result)).toBe(false);
    });

    it('should return true even when value is undefined', () => {
      const result = { ok: true, value: undefined };
      expect(isOkResult(result)).toBe(true);
    });

    it('should return true when value is null', () => {
      const result = { ok: true, value: null };
      expect(isOkResult(result)).toBe(true);
    });

    it('should return true when value is 0', () => {
      const result = { ok: true, value: 0 };
      expect(isOkResult(result)).toBe(true);
    });

    it('should return true when value is empty string', () => {
      const result = { ok: true, value: '' };
      expect(isOkResult(result)).toBe(true);
    });

    it('should return true when value is false', () => {
      const result = { ok: true, value: false };
      expect(isOkResult(result)).toBe(true);
    });

    it('should handle complex object values', () => {
      const result = {
        ok: true,
        value: { id: 1, name: 'test', data: [1, 2, 3] },
      };
      expect(isOkResult(result)).toBe(true);
    });
  });

  describe('isErrorResult', () => {
    it('should return true for failed results', () => {
      const result = { ok: false, errors: ['error message'] };
      expect(isErrorResult(result)).toBe(true);
    });

    it('should return false for successful results', () => {
      const result = { ok: true, value: 'success data' };
      expect(isErrorResult(result)).toBe(false);
    });

    it('should return true even when errors is undefined', () => {
      const result = { ok: false, errors: undefined };
      expect(isErrorResult(result)).toBe(true);
    });

    it('should return true when errors is empty array', () => {
      const result = { ok: false, errors: [] };
      expect(isErrorResult(result)).toBe(true);
    });

    it('should handle complex error objects', () => {
      const result = {
        ok: false,
        errors: [
          { code: 'ERR001', message: 'Something went wrong' },
          { code: 'ERR002', message: 'Another error' },
        ],
      };
      expect(isErrorResult(result)).toBe(true);
    });

    it('should handle single error object', () => {
      const result = {
        ok: false,
        errors: { code: 'ERR001', message: 'Error occurred' },
      };
      expect(isErrorResult(result)).toBe(true);
    });
  });

  describe('getResultValue', () => {
    it('should extract value from successful result', () => {
      const result = { ok: true, value: 'success data' };
      expect(getResultValue(result)).toBe('success data');
    });

    it('should return default value for failed result', () => {
      const result = { ok: false, errors: ['error'] };
      expect(getResultValue(result, 'default')).toBe('default');
    });

    it('should return null by default when result fails', () => {
      const result = { ok: false, errors: ['error'] };
      expect(getResultValue(result)).toBeNull();
    });

    it('should return default value when value is undefined', () => {
      const result = { ok: true, value: undefined };
      expect(getResultValue(result, 'default')).toBe('default');
    });

    it('should extract null value when explicitly set', () => {
      const result = { ok: true, value: null };
      expect(getResultValue(result)).toBeNull();
    });

    it('should extract 0 as valid value', () => {
      const result = { ok: true, value: 0 };
      expect(getResultValue(result)).toBe(0);
    });

    it('should extract empty string as valid value', () => {
      const result = { ok: true, value: '' };
      expect(getResultValue(result)).toBe('');
    });

    it('should extract false as valid value', () => {
      const result = { ok: true, value: false };
      expect(getResultValue(result)).toBe(false);
    });

    it('should extract complex objects', () => {
      const complexValue = { id: 1, name: 'test', items: [1, 2, 3] };
      const result = { ok: true, value: complexValue };
      expect(getResultValue(result)).toEqual(complexValue);
    });

    it('should extract array values', () => {
      const arrayValue = [1, 2, 3, 4, 5];
      const result = { ok: true, value: arrayValue };
      expect(getResultValue(result)).toEqual(arrayValue);
    });

    it('should use custom default value when result fails', () => {
      const result = { ok: false };
      const defaultValue = { id: 0, name: 'default' };
      expect(getResultValue(result, defaultValue)).toEqual(defaultValue);
    });

    it('should use null default when explicitly passed', () => {
      const result = { ok: false };
      expect(getResultValue(result, null)).toBeNull();
    });
  });

  describe('Type inference', () => {
    it('should properly narrow types with isOkResult', () => {
      const result: { ok: boolean; value?: string; errors?: string[] } = {
        ok: true,
        value: 'test',
      };

      if (isOkResult(result)) {
        // Type should be narrowed to { ok: true; value: string }
        const value: string = result.value;
        expect(value).toBe('test');
      }
    });

    it('should properly narrow types with isErrorResult', () => {
      const result: { ok: boolean; value?: string; errors?: string[] } = {
        ok: false,
        errors: ['error1', 'error2'],
      };

      if (isErrorResult(result)) {
        // Type should be narrowed to { ok: false; errors: string[] }
        const errors: string[] | undefined = result.errors;
        expect(errors).toEqual(['error1', 'error2']);
      }
    });

    it('should work with union types', () => {
      type SuccessResult = { ok: true; value: number };
      type ErrorResult = { ok: false; errors: string[] };
      type Result = SuccessResult | ErrorResult;

      const success: Result = { ok: true, value: 42 };
      const error: Result = { ok: false, errors: ['error'] };

      expect(isOkResult(success)).toBe(true);
      expect(isErrorResult(error)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle results with both value and errors', () => {
      const result = {
        ok: true,
        value: 'data',
        errors: ['should not appear'],
      };
      expect(isOkResult(result)).toBe(true);
      expect(getResultValue(result)).toBe('data');
    });

    it('should handle results with missing value field', () => {
      const result = { ok: true };
      expect(isOkResult(result)).toBe(true);
      expect(getResultValue(result, 'default')).toBe('default');
    });

    it('should handle results with missing errors field', () => {
      const result = { ok: false };
      expect(isErrorResult(result)).toBe(true);
    });
  });

  describe('Real-world GraphQL @catch(to: RESULT) scenarios', () => {
    it('should handle successful mutation result', () => {
      const mutationResult = {
        ok: true,
        value: {
          id: '123',
          name: 'Created Resource',
          createdAt: '2025-11-26T00:00:00Z',
        },
      };

      expect(isOkResult(mutationResult)).toBe(true);
      const resource = getResultValue(mutationResult);
      expect(resource?.id).toBe('123');
    });

    it('should handle failed mutation with GraphQL errors', () => {
      const mutationResult = {
        ok: false,
        errors: [
          {
            message: 'Validation failed',
            extensions: { code: 'VALIDATION_ERROR' },
          },
        ],
      };

      expect(isErrorResult(mutationResult)).toBe(true);
      if (isErrorResult(mutationResult)) {
        expect(mutationResult.errors).toHaveLength(1);
      }
    });

    it('should handle query result with nullable fields', () => {
      const queryResult = {
        ok: true,
        value: {
          user: null,
          session: undefined,
        },
      };

      expect(isOkResult(queryResult)).toBe(true);
      const data = getResultValue(queryResult);
      expect(data?.user).toBeNull();
    });

    it('should handle network errors', () => {
      const networkError = {
        ok: false,
        errors: [{ message: 'Network request failed' }],
      };

      expect(isErrorResult(networkError)).toBe(true);
      expect(getResultValue(networkError, {})).toEqual({});
    });

    it('should handle partial success scenarios', () => {
      const batchResult = {
        ok: true,
        value: {
          successful: ['item1', 'item2'],
          failed: ['item3'],
        },
      };

      if (isOkResult(batchResult)) {
        expect(batchResult.value.successful).toHaveLength(2);
        expect(batchResult.value.failed).toHaveLength(1);
      }
    });
  });
});
