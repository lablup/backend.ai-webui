/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
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
});
