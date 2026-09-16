/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
export type FilterCombinator = 'AND' | 'OR' | 'NOT';
/** Combines typed `*Filter` inputs through one of their combinator keys; null when empty. */
export declare const combineFilters: <T extends {
    AND?: ReadonlyArray<T> | null | undefined;
    OR?: ReadonlyArray<T> | null | undefined;
    NOT?: ReadonlyArray<T> | null | undefined;
}>(filters: ReadonlyArray<T | null | undefined>, operator?: FilterCombinator) => T | null;
