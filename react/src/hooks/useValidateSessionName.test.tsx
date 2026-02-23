import { renderHook } from '@testing-library/react';
import { useValidateSessionName } from './useValidateSessionName';

// Mock react-i18next to return translation keys
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useValidateSessionName', () => {
  describe('Basic validation rules', () => {
    it('should return validation rules array', () => {
      const { result } = renderHook(() => useValidateSessionName());
      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current.length).toBeGreaterThan(0);
    });

    it('should include min length validation', () => {
      const { result } = renderHook(() => useValidateSessionName());
      const minRule = result.current.find((rule: any) => rule.min === 4);
      expect(minRule).toBeDefined();
      expect(minRule?.message).toBeDefined();
    });

    it('should include max length validation', () => {
      const { result } = renderHook(() => useValidateSessionName());
      const maxRule = result.current.find((rule: any) => rule.max === 64);
      expect(maxRule).toBeDefined();
      expect(maxRule?.message).toBeDefined();
    });
  });

  describe('Required field validation', () => {
    it('should make field required when currentName is provided', () => {
      const { result } = renderHook(() =>
        useValidateSessionName('existing-session'),
      );
      const requiredRule = result.current.find(
        (rule: any) => rule.required === true,
      );
      expect(requiredRule).toBeDefined();
    });

    it('should not require field when currentName is not provided', () => {
      const { result } = renderHook(() => useValidateSessionName());
      const requiredRule = result.current.find(
        (rule: any) => rule.required === true,
      );
      expect(requiredRule).toBeUndefined();
    });

    it('should not require field when currentName is null', () => {
      const { result } = renderHook(() => useValidateSessionName(null));
      const requiredRule = result.current.find(
        (rule: any) => rule.required === true,
      );
      expect(requiredRule).toBeUndefined();
    });

    it('should not require field when currentName is empty string', () => {
      const { result } = renderHook(() => useValidateSessionName(''));
      const requiredRule = result.current.find(
        (rule: any) => rule.required === true,
      );
      expect(requiredRule).toBeUndefined();
    });
  });

  describe('Custom validator - valid session names', () => {
    it('should accept valid session name with alphanumeric characters', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);
      expect(validator).toBeDefined();

      const validationResult = await validator?.validator({}, 'mySession123');
      expect(validationResult).toBeUndefined();
    });

    it('should accept session name with hyphens', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      const validationResult = await validator?.validator(
        {},
        'my-session-name',
      );
      expect(validationResult).toBeUndefined();
    });

    it('should accept session name with dots', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      const validationResult = await validator?.validator(
        {},
        'my.session.name',
      );
      expect(validationResult).toBeUndefined();
    });

    it('should accept session name with underscores', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      const validationResult = await validator?.validator(
        {},
        'my_session_name',
      );
      expect(validationResult).toBeUndefined();
    });

    it('should accept session name with mixed valid characters', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      const validationResult = await validator?.validator(
        {},
        'Session_Name-123.test',
      );
      expect(validationResult).toBeUndefined();
    });

    it('should accept empty value', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      const validationResult = await validator?.validator({}, '');
      expect(validationResult).toBeUndefined();
    });
  });

  describe('Custom validator - invalid session names', () => {
    it('should reject session name starting with hyphen', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      await expect(validator?.validator({}, '-mySession')).rejects.toMatch(
        /start/i,
      );
    });

    it('should reject session name starting with dot', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      await expect(validator?.validator({}, '.mySession')).rejects.toMatch(
        /start/i,
      );
    });

    it('should reject session name ending with hyphen', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      await expect(validator?.validator({}, 'mySession-')).rejects.toMatch(
        /end/i,
      );
    });

    it('should reject session name ending with dot', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      await expect(validator?.validator({}, 'mySession.')).rejects.toMatch(
        /end/i,
      );
    });

    it('should reject session name with spaces', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      await expect(
        validator?.validator({}, 'my session name'),
      ).rejects.toMatch(/invalid|character/i);
    });

    it('should reject session name with special characters', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      await expect(
        validator?.validator({}, 'mySession@name'),
      ).rejects.toMatch(/invalid|character/i);
    });

    it('should reject session name with slash', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      await expect(
        validator?.validator({}, 'my/session/name'),
      ).rejects.toMatch(/invalid|character/i);
    });

    it('should reject session name with parentheses', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      // Parenthesis at the end triggers the "end with" check first
      await expect(
        validator?.validator({}, 'mySession(test)'),
      ).rejects.toMatch(/end/i);
    });
  });

  describe('Edge cases', () => {
    it('should accept session name at minimum length', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      const validationResult = await validator?.validator({}, 'test');
      expect(validationResult).toBeUndefined();
    });

    it('should accept session name at maximum length', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      const longName = 'a'.repeat(64);
      const validationResult = await validator?.validator({}, longName);
      expect(validationResult).toBeUndefined();
    });

    it('should accept numeric-only session name', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      const validationResult = await validator?.validator({}, '12345');
      expect(validationResult).toBeUndefined();
    });

    it('should accept uppercase session name', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      const validationResult = await validator?.validator({}, 'MYSESSION');
      expect(validationResult).toBeUndefined();
    });

    it('should accept mixed case session name', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      const validationResult = await validator?.validator({}, 'MySession');
      expect(validationResult).toBeUndefined();
    });
  });

  describe('Differences from useValidateServiceName', () => {
    it('should accept dots in session names (unlike service names)', async () => {
      const { result } = renderHook(() => useValidateSessionName());
      const validator = result.current.find((rule: any) => rule.validator);

      const validationResult = await validator?.validator(
        {},
        'session.with.dots',
      );
      expect(validationResult).toBeUndefined();
    });

    it('should have max length of 64 characters', () => {
      const { result } = renderHook(() => useValidateSessionName());
      const maxRule = result.current.find((rule: any) => rule.max);
      expect(maxRule?.max).toBe(64);
    });
  });
});
