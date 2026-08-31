import {
  b64urlFromBytes,
  bytesFromB64url,
  decodeAnchor,
  encodeAnchor,
  isSafePath,
} from './codec.js';
import type { AnchorV3 } from './types.js';
import { describe, expect, it } from 'vitest';

const anchor: AnchorV3 = {
  v: 3,
  s: '[data-testid="login-button"]',
  p: '/session/start',
  q: 'tab=general',
  tag: 'button',
  txt: 'Login',
  tid: 'login-button',
  rect: { x: 0.1, y: 0.2, w: 0.3, h: 0.4 },
  c: { name: 'LoginView', src: 'src/components/LoginView.tsx:120:8' },
};

describe('anchor codec', () => {
  it('round-trips a full v3 payload', async () => {
    const encoded = await encodeAnchor(anchor);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    await expect(decodeAnchor(encoded)).resolves.toEqual(anchor);
  });

  it('produces a fragment-safe base64url string (no +, /, =)', async () => {
    const encoded = await encodeAnchor({
      ...anchor,
      txt: '?/+= 한글 & <b>',
    });
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it('round-trips raw bytes through base64url', () => {
    const bytes = new Uint8Array([0, 1, 250, 251, 252, 253, 254, 255]);
    expect(bytesFromB64url(b64urlFromBytes(bytes))).toEqual(bytes);
  });

  it('rejects garbage instead of throwing', async () => {
    await expect(decodeAnchor('not-a-real-anchor')).resolves.toBeNull();
  });

  it('rejects a payload whose path could navigate off-origin', async () => {
    const encoded = await encodeAnchor({
      ...anchor,
      p: '//evil.example.com/',
    });
    await expect(decodeAnchor(encoded)).resolves.toBeNull();
  });

  it('treats only single-slash absolute paths as safe', () => {
    expect(isSafePath('/data')).toBe(true);
    expect(isSafePath('//evil')).toBe(false);
    expect(isSafePath('https://evil')).toBe(false);
    expect(isSafePath(undefined)).toBe(false);
  });
});
