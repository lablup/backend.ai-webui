/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ModelCardV2Filter } from '../__generated__/AdminModelCardQuery.graphql';

type Filter = ModelCardV2Filter | null | undefined;

/**
 * The user's own conditions inside a filter built by
 * `scopeModelCardListFilter`; any other filter is returned as is.
 */
export const unscopeModelCardListFilter = (
  filter: Filter,
): ModelCardV2Filter | undefined => {
  if (!filter) return undefined;
  const isScoped =
    filter.domainName != null &&
    Object.keys(filter).every((key) => key === 'domainName' || key === 'AND') &&
    (filter.AND?.length ?? 0) <= 1;
  return isScoped ? (filter.AND?.[0] ?? undefined) : filter;
};

/**
 * Pins the admin model card list to one domain. The user's filter is nested
 * under `AND`, so no `OR`/`NOT` in it can reach past the domain condition.
 * Idempotent: an already scoped filter is unwrapped first.
 */
export const scopeModelCardListFilter = (
  filter: Filter,
  domainName: string | null | undefined,
): ModelCardV2Filter | undefined => {
  const userFilter = unscopeModelCardListFilter(filter);
  if (!domainName) return userFilter;
  return {
    domainName: { equals: domainName },
    ...(userFilter ? { AND: [userFilter] } : {}),
  };
};
