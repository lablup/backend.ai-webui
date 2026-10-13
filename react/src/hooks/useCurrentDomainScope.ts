/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '.';
import { useCurrentDomainScopeQuery } from '../__generated__/useCurrentDomainScopeQuery.graphql';
import { graphql, useLazyLoadQuery } from 'react-relay';

/** The manager version that answers `scoped*` searches and `UserV2.organization.domainId`. */
export const SCOPED_SEARCH_MIN_VERSION = '26.9.0a4';

/** The `domain` arm every `scoped*` scope input (`UserScope`, `ProjectScope`, …) shares. */
export interface DomainUUIDScope {
  domain: ReadonlyArray<{ value: string }>;
}

/**
 * The signed-in domain as a `scoped*` search scope (ADR 0011). `domainScope` is
 * null below 26.9.0a4, where callers keep the name-keyed field of their pair.
 */
export const useCurrentDomainScope = () => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const domainName: string = useCurrentDomainValue();
  const supportsScopedSearch = baiClient.isManagerVersionCompatibleWith(
    SCOPED_SEARCH_MIN_VERSION,
  );

  const { myUserV2 } = useLazyLoadQuery<useCurrentDomainScopeQuery>(
    graphql`
      query useCurrentDomainScopeQuery {
        myUserV2 {
          organization {
            domainId @since(version: "26.9.0a4")
          }
        }
      }
    `,
    {},
    { fetchPolicy: supportsScopedSearch ? 'store-or-network' : 'store-only' },
  );

  const domainId =
    (supportsScopedSearch && myUserV2?.organization?.domainId) || null;
  const domainScope: DomainUUIDScope | null = domainId
    ? { domain: [{ value: domainId }] }
    : null;

  return { domainName, domainId, domainScope, supportsScopedSearch };
};
