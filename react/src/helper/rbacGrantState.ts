/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * Grant state of a role over a single (scope, entity) pair, computed by
 * comparing the operations the role actually grants against the full set of
 * operations the permission matrix defines for that (scopeType, entityType).
 *
 * - `full`    — the role grants every operation the matrix lists (including
 *               the `GRANT_*` delegate operations).
 * - `partial` — the role grants some, but not all, of the matrix operations.
 * - `none`    — the role grants none of the matrix operations (still shown as
 *               a gray tag; never hidden).
 */
export type RBACGrantState = 'full' | 'partial' | 'none';

/**
 * Compute the grant state for a single (scope, entity) pair.
 *
 * @param fullOperations   All operations the matrix lists for the
 *                         (scopeType, entityType) — duplicates are tolerated.
 * @param grantedOperations The operations the role currently grants on the
 *                         concrete scope for that entity type.
 *
 * The comparison is intersection-based: only matrix operations count. An
 * operation the role grants that the matrix no longer lists (stale grant) does
 * not by itself make the state `partial`.
 */
export const computeRBACGrantState = (
  fullOperations: ReadonlyArray<string>,
  grantedOperations: ReadonlySet<string>,
): RBACGrantState => {
  const uniqueFullOperations = new Set(fullOperations);
  // No configurable operations → nothing can be granted → treat as none.
  if (uniqueFullOperations.size === 0) {
    return 'none';
  }

  const grantedWithinMatrix =
    uniqueFullOperations.intersection(grantedOperations).size;

  if (grantedWithinMatrix === 0) {
    return 'none';
  }
  if (grantedWithinMatrix === uniqueFullOperations.size) {
    return 'full';
  }
  return 'partial';
};
