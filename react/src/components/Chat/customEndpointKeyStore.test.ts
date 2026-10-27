/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getCustomEndpointHost, normalizeCustomEndpointURL } from './ChatModel';
import {
  copyCustomEndpointApiKey,
  getCustomEndpointApiKey,
  setCustomEndpointApiKey,
  useCustomEndpointApiKey,
} from './customEndpointKeyStore';
import { act, renderHook } from '@testing-library/react';

describe('customEndpointKeyStore', () => {
  afterEach(() => {
    setCustomEndpointApiKey('/chat/a', undefined);
    setCustomEndpointApiKey('/chat/b', undefined);
  });

  it('keeps keys per chat panel, not per endpoint', () => {
    setCustomEndpointApiKey('/chat/a', 'key-a');
    setCustomEndpointApiKey('/chat/b', 'key-b');
    expect(getCustomEndpointApiKey('/chat/a')).toBe('key-a');
    expect(getCustomEndpointApiKey('/chat/b')).toBe('key-b');
  });

  it('never writes the key to Web Storage', () => {
    sessionStorage.clear();
    localStorage.clear();
    setCustomEndpointApiKey('/chat/a', 'key-a');
    expect(sessionStorage.length).toBe(0);
    expect(localStorage.length).toBe(0);
  });

  it('clears a key when set to undefined', () => {
    setCustomEndpointApiKey('/chat/a', 'key-a');
    setCustomEndpointApiKey('/chat/a', undefined);
    expect(getCustomEndpointApiKey('/chat/a')).toBeUndefined();
  });

  it('copies a key to a cloned panel', () => {
    setCustomEndpointApiKey('/chat/a', 'key-a');
    copyCustomEndpointApiKey('/chat/a', '/chat/b');
    expect(getCustomEndpointApiKey('/chat/b')).toBe('key-a');
  });

  it('notifies subscribed panels of their own key only', () => {
    const a = renderHook(() => useCustomEndpointApiKey('/chat/a'));
    const b = renderHook(() => useCustomEndpointApiKey('/chat/b'));
    act(() => setCustomEndpointApiKey('/chat/a', 'key-a'));
    expect(a.result.current).toBe('key-a');
    expect(b.result.current).toBeUndefined();
  });
});

describe('normalizeCustomEndpointURL', () => {
  it('accepts http(s) URLs and strips trailing slashes', () => {
    expect(normalizeCustomEndpointURL(' https://api.example.com/v1/ ')).toBe(
      'https://api.example.com/v1',
    );
    expect(normalizeCustomEndpointURL('http://10.0.0.5:8000')).toBe(
      'http://10.0.0.5:8000',
    );
  });

  it('rejects empty, relative and non-http values', () => {
    expect(normalizeCustomEndpointURL('')).toBeUndefined();
    expect(normalizeCustomEndpointURL('v1')).toBeUndefined();
    expect(normalizeCustomEndpointURL('ftp://x')).toBeUndefined();
  });

  it('reads the host for the selector label', () => {
    expect(getCustomEndpointHost('https://api.example.com/v1')).toBe(
      'api.example.com',
    );
    expect(getCustomEndpointHost(undefined)).toBeUndefined();
  });
});
