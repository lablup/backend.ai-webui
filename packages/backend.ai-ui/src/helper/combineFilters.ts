/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

export type FilterCombinator = 'AND' | 'OR' | 'NOT';

/** Combines typed `*Filter` inputs through one of their combinator keys; null when empty. */
export const combineFilters = <
  T extends {
    AND?: ReadonlyArray<T> | null | undefined;
    OR?: ReadonlyArray<T> | null | undefined;
    NOT?: ReadonlyArray<T> | null | undefined;
  },
>(
  filters: ReadonlyArray<T | null | undefined>,
  operator: FilterCombinator = 'AND',
): T | null => {
  const compacted = filters.filter((part): part is T => !!part);
  if (compacted.length === 0) return null;
  // Negating one part is not the part itself, so `NOT` always wraps.
  if (compacted.length === 1 && operator !== 'NOT') return compacted[0];
  // `T` may declare required fields the combinator cannot know about, so the
  // combinator-only wrapper needs the double assertion to land back on `T`.
  return { [operator]: compacted } as unknown as T;
};
