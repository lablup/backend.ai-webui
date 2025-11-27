// EnvVarFormList.test.tsx
import '../../__test__/matchMedia.mock.js';
import { sanitizeSensitiveEnv } from './EnvVarFormList';

describe('emptySensitiveEnv', () => {
  it('should empty the value of sensitive environment variables', () => {
    const envs = [
      { variable: 'SECRET_KEY', value: '12345' },
      { variable: 'API_KEY', value: 'abcdef' },
      { variable: 'NON_SENSITIVE', value: 'value' },
    ];

    const result = sanitizeSensitiveEnv(envs);

    expect(result).toEqual([
      { variable: 'SECRET_KEY', value: '' },
      { variable: 'API_KEY', value: '' },
      { variable: 'NON_SENSITIVE', value: 'value' },
    ]);
  });

  it('should not change non-sensitive environment variables', () => {
    const envs = [{ variable: 'NON_SENSITIVE', value: 'value' }];
    const result = sanitizeSensitiveEnv(envs);

    expect(result).toEqual([{ variable: 'NON_SENSITIVE', value: 'value' }]);
  });

  it('should handle an empty array', () => {
    const envs: any[] = [];

    const result = sanitizeSensitiveEnv(envs);

    expect(result).toEqual([]);
  });

  it('should not sanitize disableSanitizeKeys even though it matches sensitive pattern', () => {
    const envs = [
      { variable: 'NGC_API_KEY', value: 'my-secret-ngc-key' },
      { variable: 'OTHER_API_KEY', value: 'should-be-sanitized' },
    ];

    const result = sanitizeSensitiveEnv(envs, ['NGC_API_KEY']);

    expect(result).toEqual([
      { variable: 'NGC_API_KEY', value: 'my-secret-ngc-key' },
      { variable: 'OTHER_API_KEY', value: '' },
    ]);
  });
});
