/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// Single definition lives in BUI, which renders the same sentinel as ∞.
export { SIGNED_32BIT_MAX_INT } from 'backend.ai-ui';
export const SIGNED_32BIT_MIN_INT = -2147483648;

export const MAX_CPU_QUOTA = 1e16;

// Strawberry connections return 10 rows when no pagination argument is given.
// Catalog-sized lists (presets, domains) that a UI reads whole pass this bound
// explicitly instead of relying on that default.
export const CATALOG_FETCH_LIMIT = 100;
