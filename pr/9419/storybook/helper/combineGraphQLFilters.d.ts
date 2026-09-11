/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/** Combines typed `*Filter` inputs through their `AND` combinator; null when empty. */
export declare const combineFiltersWithAnd: <T extends {
    AND?: ReadonlyArray<T> | null | undefined;
}>(parts: ReadonlyArray<T | null | undefined>) => T | null;
