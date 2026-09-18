import {
  clearApiKeypair,
  loadApiKeypair,
  resolveInitialConnectionMode,
  saveApiKeypair,
} from './apiKeypairSession';
import { beforeEach, describe, expect, it } from 'vitest';

const keypair = { accessKey: 'AKIAIOSFODNN7EXAMPLE', secretKey: 's3cr3t' };

describe('apiKeypairSession', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('round-trips a keypair through sessionStorage', () => {
    expect(loadApiKeypair()).toBeNull();
    saveApiKeypair(keypair);
    expect(loadApiKeypair()).toEqual(keypair);
    clearApiKeypair();
    expect(loadApiKeypair()).toBeNull();
  });

  it('treats a malformed or partial entry as nothing stored and drops it', () => {
    sessionStorage.setItem('backendaiwebui.api_keypair', '{not json');
    expect(loadApiKeypair()).toBeNull();
    expect(sessionStorage.getItem('backendaiwebui.api_keypair')).toBeNull();

    sessionStorage.setItem(
      'backendaiwebui.api_keypair',
      JSON.stringify({ accessKey: 'only-half' }),
    );
    expect(loadApiKeypair()).toBeNull();
  });

  it('never touches localStorage', () => {
    saveApiKeypair(keypair);
    expect(
      Object.keys(localStorage).some((k) => k.includes('api_keypair')),
    ).toBe(false);
  });
});

describe('resolveInitialConnectionMode', () => {
  it('restores API mode from a kept keypair when the switch is offered', () => {
    expect(
      resolveInitialConnectionMode(
        { connection_mode: 'SESSION', change_signin_support: true },
        true,
      ),
    ).toBe('API');
  });

  it('follows the configured mode otherwise', () => {
    expect(
      resolveInitialConnectionMode(
        { connection_mode: 'SESSION', change_signin_support: true },
        false,
      ),
    ).toBe('SESSION');
    expect(
      resolveInitialConnectionMode(
        { connection_mode: 'SESSION', change_signin_support: false },
        true,
      ),
    ).toBe('SESSION');
    expect(
      resolveInitialConnectionMode(
        { connection_mode: 'API', change_signin_support: false },
        false,
      ),
    ).toBe('API');
  });
});
