import { safeStorage } from './safe-storage';
import { Client, ClientConfig, backend } from './index';
import { describe, expect, it } from 'vitest';

// vitest runs this package in the default node environment, so a direct
// `localStorage` access anywhere on the construct-and-sign path throws —
// exactly the condition the Electron local proxy (src/wsproxy) runs under.
describe('Node compatibility (no DOM)', () => {
  it('runs where localStorage is genuinely absent', () => {
    expect(typeof localStorage).toBe('undefined');
  });

  it('constructs ClientConfig and Client without browser globals', () => {
    const config = new ClientConfig('AKTEST', 'SKTEST', 'https://example.com');
    const client = new backend.Client(config, 'node-compat-test');
    expect(client).toBeInstanceOf(Client);
    // safeStorage.getItem returned null, so the session id fell back to ''.
    expect(client._loginSessionId).toBe('');
  });

  it('signs requests without a DOM (byte-stable key and signature)', () => {
    const config = new ClientConfig('AKTEST', 'SKTEST', 'https://example.com');
    const client = new Client(config, 'node-compat-test');
    const date = new Date('2026-08-30T00:00:00Z'); // getCurrentDate is UTC-based
    const signKey = client.getSignKey(config.secretKey, date);
    expect(signKey).toBe(
      'ccc5234ad7e2936858ba17147eab33f69258a087625c494e5ba4e025d2779a85',
    );
    const aStr = client.getAuthenticationString(
      'GET',
      '/auth/test',
      date.toISOString(),
      '',
      'application/json',
    );
    expect(client.sign(signKey, 'binary', aStr, 'hex')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('safeStorage no-ops instead of throwing when storage is absent', () => {
    expect(safeStorage.getItem('backendaiwebui.sessionid')).toBeNull();
    expect(() => safeStorage.setItem('k', 'v')).not.toThrow();
    expect(() => safeStorage.removeItem('k')).not.toThrow();
  });
});
