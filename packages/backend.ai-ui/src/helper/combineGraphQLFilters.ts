/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/** Combines typed `*Filter` inputs through their `AND` combinator; null when empty. */
export const combineFiltersWithAnd = <
  T extends { AND?: ReadonlyArray<T> | null | undefined },
>(
  parts: ReadonlyArray<T | null | undefined>,
): T | null => {
  const compacted = parts.filter((part): part is T => !!part);
  if (compacted.length === 0) return null;
  if (compacted.length === 1) return compacted[0];
  // `T` may declare required fields the combinator cannot know about, so the
  // `AND`-only wrapper needs the double assertion to land back on `T`.
  return { AND: compacted } as unknown as T;
};
