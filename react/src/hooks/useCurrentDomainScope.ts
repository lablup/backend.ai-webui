/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentDomainValue } from '.';
import { useCurrentDomainScopeQuery } from '../__generated__/useCurrentDomainScopeQuery.graphql';
import { graphql, useLazyLoadQuery } from 'react-relay';

/** The `domain` arm every `scoped*` scope input (`UserScope`, `ProjectScope`, …) shares. */
export interface DomainUUIDScope {
  domain: ReadonlyArray<{ value: string }>;
}

/**
 * The signed-in domain as a `scoped*` search scope (ADR 0012), for superadmins
 * and domain admins alike. Throws when the manager answers no domain id.
 */
export const useCurrentDomainScope = () => {
  'use memo';
  const domainName: string = useCurrentDomainValue();

  const { myUserV2 } = useLazyLoadQuery<useCurrentDomainScopeQuery>(
    graphql`
      query useCurrentDomainScopeQuery {
        myUserV2 {
          organization {
            domainId
          }
        }
      }
    `,
    {},
    { fetchPolicy: 'store-or-network' },
  );

  const domainId = myUserV2?.organization?.domainId;
  if (!domainId) {
    throw new Error('The manager did not answer the current domain id.');
  }
  const domainScope: DomainUUIDScope = { domain: [{ value: domainId }] };

  return { domainName, domainId, domainScope };
};
