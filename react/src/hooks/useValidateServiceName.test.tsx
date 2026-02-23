import { useValidateServiceName } from './useValidateServiceName';
import { renderHook } from '@testing-library/react';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useValidateServiceName', () => {
  describe('Basic Validation Rules', () => {
    it('should return an array of validation rules', () => {
      const { result } = renderHook(() => useValidateServiceName());
      expect(result.current).toBeInstanceOf(Array);
      expect(result.current).toHaveLength(4);
    });

    it('should have min length rule with translation key', () => {
      const { result } = renderHook(() => useValidateServiceName());
      const minRule = result.current[0];
      expect(minRule).toHaveProperty('min', 4);
      expect(minRule).toHaveProperty(
        'message',
        'modelService.ServiceNameMinLength',
      );
    });

    it('should have max length rule with translation key', () => {
      const { result } = renderHook(() => useValidateServiceName());
      const maxRule = result.current[1];
      expect(maxRule).toHaveProperty('max', 24);
      expect(maxRule).toHaveProperty('type', 'string');
      expect(maxRule).toHaveProperty(
        'message',
        'modelService.ServiceNameMaxLength',
      );
    });

    it('should have required rule', () => {
      const { result } = renderHook(() => useValidateServiceName());
      const requiredRule = result.current[3];
      expect(requiredRule).toHaveProperty('required', true);
    });
  });

  describe('Custom Validator - Valid Service Names', () => {
    it('should accept service name starting with letter', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, 'myservice')).resolves.toBeUndefined();
    });

    it('should accept service name starting with underscore', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, '_myservice')).resolves.toBeUndefined();
    });

    it('should accept service name ending with letter', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, 'myservice')).resolves.toBeUndefined();
    });

    it('should accept service name ending with number', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, 'myservice123')).resolves.toBeUndefined();
    });

    it('should accept service name with hyphens in the middle', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, 'my-service')).resolves.toBeUndefined();
    });

    it('should accept service name with underscores', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, 'my_service_123')).resolves.toBeUndefined();
    });

    it('should accept alphanumeric service name', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, 'service123')).resolves.toBeUndefined();
    });

    it('should accept service name with mixed case', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, 'MyService')).resolves.toBeUndefined();
    });

    it('should accept empty value', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, '')).resolves.toBeUndefined();
    });
  });

  describe('Custom Validator - Invalid Service Names', () => {
    it('should reject service name starting with hyphen', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, '-myservice')).rejects.toBe(
        'modelService.ServiceNameShouldStartWith',
      );
    });

    it('should reject service name ending with hyphen', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, 'myservice-')).rejects.toBe(
        'modelService.ServiceNameShouldEndWith',
      );
    });

    it('should reject service name with spaces', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, 'my service')).rejects.toBe(
        'modelService.ServiceNameInvalidCharacter',
      );
    });

    it('should reject service name with special characters', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, 'my@service')).rejects.toBe(
        'modelService.ServiceNameInvalidCharacter',
      );
    });

    it('should reject service name with dots', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, 'my.service')).rejects.toBe(
        'modelService.ServiceNameInvalidCharacter',
      );
    });

    it('should reject service name with slashes', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, 'my/service')).rejects.toBe(
        'modelService.ServiceNameInvalidCharacter',
      );
    });

    it('should reject service name with parentheses', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      // Parentheses at end triggers end-with check first
      await expect(validator({}, 'my(service)')).rejects.toBe(
        'modelService.ServiceNameShouldEndWith',
      );
    });

    it('should reject service name with brackets', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      // Brackets at end triggers end-with check first
      await expect(validator({}, 'my[service]')).rejects.toBe(
        'modelService.ServiceNameShouldEndWith',
      );
    });
  });

  describe('Edge Cases', () => {
    it('should accept minimum valid length (4 characters)', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, 'test')).resolves.toBeUndefined();
    });

    it('should accept maximum valid length (24 characters)', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(
        validator({}, 'service123456789012345'),
      ).resolves.toBeUndefined();
    });

    it('should accept numeric-only service name', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, '123456')).resolves.toBeUndefined();
    });

    it('should accept service name with multiple hyphens', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, 'my-test-service')).resolves.toBeUndefined();
    });

    it('should accept service name with multiple underscores', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      await expect(validator({}, 'my_test_service')).resolves.toBeUndefined();
    });
  });

  describe('Differences from useValidateSessionName', () => {
    it('should allow only hyphens and underscores as special characters', async () => {
      const { result } = renderHook(() => useValidateServiceName());
      const customRule = result.current[2] as any;
      const validator = customRule.validator;

      // Session name allows dots, but service name does not
      await expect(validator({}, 'my.service')).rejects.toBe(
        'modelService.ServiceNameInvalidCharacter',
      );
    });

    it('should have different min/max length requirements', () => {
      const { result } = renderHook(() => useValidateServiceName());
      const minRule = result.current[0];
      const maxRule = result.current[1];

      // Service name: 4-24 characters (different from session name)
      expect(minRule).toHaveProperty('min', 4);
      expect(maxRule).toHaveProperty('max', 24);
    });

    it('should have required rule (always required, unlike session name)', () => {
      const { result } = renderHook(() => useValidateServiceName());
      const requiredRule = result.current[3];

      expect(requiredRule).toHaveProperty('required', true);
    });
  });
});
