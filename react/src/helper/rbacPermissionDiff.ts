/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * Result of reconciling an edited permission-cell set against the initial
 * (currently-granted) set for a single scope.
 *
 * Cell keys are opaque `"entityType|operation"` strings; the caller maps them
 * back to `adminCreatePermission` / `adminDeletePermission` inputs.
 */
export interface PermissionCellDiff {
  /** Cells newly checked → need `adminCreatePermission`. */
  toCreate: string[];
  /** Cells unchecked → need `adminDeletePermission` (by existing row id). */
  toDelete: string[];
}

/**
 * Dirty-track the edited permission cells against the initial state and return
 * only the changed cells (FR-6). Unchanged cells produce no work, so no request
 * is issued for them.
 *
 * Pure and set-based so it can be reused per target scope by the multi-scope
 * bulk edit (PR 3): call it once per selected scope with that scope's own
 * initial set and the shared edited set.
 */
export const diffPermissionCells = (
  initialKeys: ReadonlySet<string>,
  editedKeys: ReadonlySet<string>,
): PermissionCellDiff => {
  const toCreate = Array.from(editedKeys).filter(
    (key) => !initialKeys.has(key),
  );
  const toDelete = Array.from(initialKeys).filter(
    (key) => !editedKeys.has(key),
  );
  return { toCreate, toDelete };
};
