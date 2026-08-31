import { redactRequestParameters } from './client';
import { describe, expect, it } from 'vitest';

const MASK = '********';

describe('redactRequestParameters', () => {
  it('masks every password-bearing key, including new_password2', () => {
    // The exact body update_password() sends (client.ts) — new_password2 was
    // missed by the old exact-match key list (CodeQL alert #157).
    const body = JSON.stringify({
      old_password: 'a',
      new_password: 'b',
      new_password2: 'b',
    });
    expect(JSON.parse(redactRequestParameters(body) as string)).toEqual({
      old_password: MASK,
      new_password: MASK,
      new_password2: MASK,
    });
  });

  it('masks listed secret keys and nested/camelCase password variants', () => {
    const body = {
      username: 'u',
      Password: 'p',
      confirmPassword: 'p',
      secret_key: 's',
      token: 't',
      nested: { otp: '1', newPassword2: 'p' },
    };
    expect(redactRequestParameters(body)).toEqual({
      username: 'u',
      Password: MASK,
      confirmPassword: MASK,
      secret_key: MASK,
      token: MASK,
      nested: { otp: MASK, newPassword2: MASK },
    });
  });

  it('leaves non-sensitive payloads and non-JSON strings unchanged', () => {
    expect(redactRequestParameters({ group: 'default', limit: 3 })).toEqual({
      group: 'default',
      limit: 3,
    });
    expect(redactRequestParameters('plain text')).toBe('plain text');
    expect(redactRequestParameters(null)).toBeNull();
  });
});
