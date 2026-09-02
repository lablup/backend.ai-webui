/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * Human-readable message of a rejected mutation promise.
 * `useMutationWithPromise` rejects GraphQL-level failures with the raw
 * `PayloadError[]`, so unwrap per-error messages instead of `String()`.
 */
export const reasonMessage = (reason: unknown): string => {
  if (reason instanceof Error) {
    return reason.message;
  }
  if (Array.isArray(reason)) {
    const messages = reason
      .map((item) =>
        item !== null && typeof item === 'object' && 'message' in item
          ? String(item.message)
          : String(item),
      )
      .filter(Boolean);
    if (messages.length > 0) {
      return messages.join('\n');
    }
  }
  return String(reason);
};
