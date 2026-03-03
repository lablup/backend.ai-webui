/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * Generates a UUID v4 string.
 *
 * Uses `crypto.randomUUID()` when available (requires HTTPS or localhost).
 * Falls back to `crypto.getRandomValues()` for plain HTTP origins where
 * `crypto.randomUUID()` is not available.
 *
 * Both paths use cryptographically secure random number generation.
 *
 * @returns A UUID v4 string in the format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * @throws {Error} If neither `crypto.randomUUID` nor `crypto.getRandomValues` is available
 */
export function generateUUID(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  if (
    typeof crypto === 'undefined' ||
    typeof crypto.getRandomValues !== 'function'
  ) {
    throw new Error(
      'generateUUID requires crypto.randomUUID or crypto.getRandomValues',
    );
  }
  // Fallback using crypto.getRandomValues (available in all contexts including HTTP)
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => {
    const cNum = Number(c);
    return (
      cNum ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (cNum / 4)))
    ).toString(16);
  });
}
