/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * Narrow a role's whole scope list to a single scope type and page it locally.
 *
 * The fallback for managers that do not serve `EntityFilter.scopeType` /
 * `scopeId` (< 26.8.0) and so can neither filter nor page `Role.scopes` by
 * scope type. FR-3406.
 *
 * @param scopes    Every scope row fetched for the role, any scope type.
 * @param scopeType The scope type to keep.
 * @param page      Zero-based `offset` and page size `limit`.
 *
 * `scopeCount` counts the rows of the requested type, not the role's total —
 * the server's `count` covers every type at once and cannot be used as the
 * pagination total on this path.
 */
export const narrowAndPageScopes = <T extends { readonly scopeType: string }>(
  scopes: ReadonlyArray<T>,
  scopeType: string,
  { offset, limit }: { offset: number; limit: number },
): { scopeRows: T[]; scopeCount: number } => {
  const scopesOfType = scopes.filter((scope) => scope.scopeType === scopeType);
  return {
    scopeRows: scopesOfType.slice(offset, offset + limit),
    scopeCount: scopesOfType.length,
  };
};
