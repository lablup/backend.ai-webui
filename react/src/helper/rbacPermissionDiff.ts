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

/**
 * The value a user assigns to a modified bulk-edit cell. Cells left as
 * 'Keep as is' are simply absent from the modified-cell map — they carry no
 * value and therefore leave each scope's existing grant untouched (FR-6).
 *
 * - `checked`   — apply the grant to every selected scope that lacks it.
 * - `unchecked` — revoke the grant from every selected scope that has it.
 */
export type BulkCellState = 'checked' | 'unchecked';

/**
 * Multi-scope bulk-apply reconciliation (PR 3 / FR-6): given a single scope's
 * initial (currently-granted) cell set and the shared map of user-modified
 * cells, produce that scope's create/delete diff.
 *
 * Only the cells the user explicitly modified are applied; every other cell
 * ('Keep as is') keeps the scope's existing value. A scope already in the
 * desired state yields an empty diff (no request), which is how "skip scopes
 * already in the desired state" falls out for free.
 *
 * Implemented on top of {@link diffPermissionCells} so both single- and
 * multi-scope edits share the same dirty-tracking core.
 */
export const applyBulkPermissionCells = (
  initialKeys: ReadonlySet<string>,
  modifiedCells: ReadonlyMap<string, BulkCellState>,
): PermissionCellDiff => {
  const desiredKeys = new Set(initialKeys);
  modifiedCells.forEach((state, key) => {
    if (state === 'checked') {
      desiredKeys.add(key);
    } else {
      desiredKeys.delete(key);
    }
  });
  return diffPermissionCells(initialKeys, desiredKeys);
};
