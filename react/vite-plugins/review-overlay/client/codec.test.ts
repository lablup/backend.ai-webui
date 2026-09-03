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

  // A tiny base64 payload inflates to megabytes; the decoder stops early.
  it('refuses a payload that inflates past the cap', async () => {
    const bomb = await encodeAnchor({ ...anchor, s: 'a'.repeat(200_000) });
    expect(bomb.length).toBeLessThan(2048);
    await expect(decodeAnchor(bomb)).resolves.toBeNull();
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

  it.each([
    ['an empty object', {}],
    ['a wrong version', { ...anchor, v: 2 }],
    ['no selector', { ...anchor, s: undefined }],
    ['an empty selector', { ...anchor, s: '' }],
    ['no path', { ...anchor, p: undefined }],
    ['a non-string path', { ...anchor, p: 3 }],
  ])(
    'rejects %s — the return type promises v, s and p',
    async (_n, payload) => {
      const encoded = await encodeAnchor(payload as unknown as AnchorV3);
      await expect(decodeAnchor(encoded)).resolves.toBeNull();
    },
  );

  it('rejects a payload whose path could navigate off-origin', async () => {
    const encoded = await encodeAnchor({
      ...anchor,
      p: '//evil.example.com/',
    });
    await expect(decodeAnchor(encoded)).resolves.toBeNull();
  });

  it('treats only single-slash absolute paths as safe', () => {
    expect(isSafePath('/data')).toBe(true);
    expect(isSafePath('/data/folder?tab=1')).toBe(true);
    expect(isSafePath('//evil')).toBe(false);
    expect(isSafePath('https://evil')).toBe(false);
    expect(isSafePath('')).toBe(false);
    expect(isSafePath('relative/path')).toBe(false);
    expect(isSafePath(undefined)).toBe(false);
  });

  // Every string the URL parser resolves to another origin must be rejected —
  // `^/` alone lets `\` and stripped control characters through.
  it.each([
    ['backslash separator', '/\\evil.example.com/x'],
    ['double backslash', '/\\\\evil.example.com'],
    ['stripped LF', '/\n/evil.example.com'],
    ['stripped CR', '/\r/evil.example.com'],
    ['stripped TAB', '/\t/evil.example.com'],
  ])('rejects %s, which resolves off-origin', (_name, path) => {
    expect(new URL(path, 'https://good.test').origin).not.toBe(
      'https://good.test',
    );
    expect(isSafePath(path)).toBe(false);
  });

  it('rejects an encoded payload whose path uses a backslash separator', async () => {
    const encoded = await encodeAnchor({ ...anchor, p: '/\\evil.example.com' });
    await expect(decodeAnchor(encoded)).resolves.toBeNull();
  });
});

/**
 * Measured through `deflate-raw`, the codec's own format: this anchor is 342
 * base64 chars on its own, 418 with a two-line note, 1359 in the worst case
 * (a SELECTOR_MAX selector plus 280 incompressible CJK chars) — of the 2048
 * `PIN_BODY_SRC` accepts.
 */
describe('an anchor carrying the reviewer note', () => {
  const noted = (n: string): AnchorV3 => ({ ...anchor, n });

  it('round-trips the note verbatim, newlines and all', async () => {
    const payload = noted('The button is misaligned.\nIt should sit flush.');
    const encoded = await encodeAnchor(payload);
    await expect(decodeAnchor(encoded)).resolves.toEqual(payload);
  });

  it('stays well inside the link budget at the cap', async () => {
    const cjk = String.fromCharCode(0xac00).repeat(280);
    const encoded = await encodeAnchor({ ...noted(cjk), nt: 1 });
    expect(encoded.length).toBeLessThan(2048);
  });

  it('refuses a note that is not a string', async () => {
    const encoded = await encodeAnchor({
      ...anchor,
      n: 7,
    } as unknown as AnchorV3);
    await expect(decodeAnchor(encoded)).resolves.toBeNull();
  });

  // Every link copied before the note travelled carries no `n` at all.
  it('reads a legacy anchor with no note', async () => {
    const decoded = await decodeAnchor(await encodeAnchor(anchor));
    expect(decoded?.n).toBeUndefined();
  });
});
