/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for generateUUID().
 *
 * Coverage:
 * - Uses crypto.randomUUID when available (primary path)
 * - Falls back to crypto.getRandomValues when randomUUID is unavailable
 * - Produces valid UUID v4 format in both paths
 * - Throws when crypto is completely unavailable
 */
import { generateUUID } from './uuid';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('generateUUID', () => {
  const originalCrypto = globalThis.crypto;

  afterEach(() => {
    // Restore the original crypto object after each test
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      configurable: true,
      writable: true,
    });
  });

  it('returns a valid UUID v4 string using crypto.randomUUID', () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(UUID_V4_REGEX);
  });

  it('returns unique values on successive calls', () => {
    const uuids = new Set(Array.from({ length: 100 }, () => generateUUID()));
    expect(uuids.size).toBe(100);
  });

  it('falls back to crypto.getRandomValues when randomUUID is unavailable', () => {
    // Remove randomUUID but keep getRandomValues
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        getRandomValues: originalCrypto.getRandomValues.bind(originalCrypto),
      },
      configurable: true,
      writable: true,
    });

    const uuid = generateUUID();
    expect(uuid).toMatch(UUID_V4_REGEX);
  });

  it('produces unique values via the fallback path', () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        getRandomValues: originalCrypto.getRandomValues.bind(originalCrypto),
      },
      configurable: true,
      writable: true,
    });

    const uuids = new Set(Array.from({ length: 100 }, () => generateUUID()));
    expect(uuids.size).toBe(100);
  });

  it('always sets version digit to 4', () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        getRandomValues: originalCrypto.getRandomValues.bind(originalCrypto),
      },
      configurable: true,
      writable: true,
    });

    for (let i = 0; i < 50; i++) {
      const uuid = generateUUID();
      // The 15th character (index 14) should always be '4' (version field)
      expect(uuid[14]).toBe('4');
    }
  });

  it('always sets variant bits to 8, 9, a, or b', () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        getRandomValues: originalCrypto.getRandomValues.bind(originalCrypto),
      },
      configurable: true,
      writable: true,
    });

    for (let i = 0; i < 50; i++) {
      const uuid = generateUUID();
      // The 20th character (index 19) should be 8, 9, a, or b (variant field)
      expect('89ab').toContain(uuid[19]);
    }
  });

  it('throws an error when crypto is completely unavailable', () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    expect(() => generateUUID()).toThrow(
      'generateUUID requires crypto.randomUUID or crypto.getRandomValues',
    );
  });
});
