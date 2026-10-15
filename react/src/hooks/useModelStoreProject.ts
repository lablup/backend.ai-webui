/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient, useCurrentDomainValue } from '.';
import { useModelStoreProjectQuery } from '../__generated__/useModelStoreProjectQuery.graphql';
import { useCurrentDomainScope } from './useCurrentDomainScope';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Returns the id and name of the active MODEL_STORE project in the current
 * domain, or nulls when there is none. Assumes one model store per domain.
 * `'user'` scopes `scopedProjectsV2` to the caller's memberships; `'admin'` to
 * the current domain (domain admin or higher), for admin pages (ADR 0012).
 */
export const useModelStoreProject = (scope: 'user' | 'admin' = 'user') => {
  const baiClient = useSuspendedBackendaiClient();
  const domainName = useCurrentDomainValue();
  const { domainScope } = useCurrentDomainScope();
  const projectScope =
    scope === 'admin'
      ? domainScope
      : { user: [{ value: baiClient.user_uuid as string }] };

  const data = useLazyLoadQuery<useModelStoreProjectQuery>(
    graphql`
      query useModelStoreProjectQuery(
        $scope: ProjectScope!
        $domainName: String!
      ) {
        scopedProjectsV2(
          scope: $scope
          filter: {
            type: { equals: MODEL_STORE }
            isActive: true
            domainName: { equals: $domainName }
          }
          limit: 1
        ) @catch(to: RESULT) {
          edges {
            node {
              id
              entityId
              basicInfo {
                name
              }
            }
          }
        }
      }
    `,
    { scope: projectScope, domainName },
    {
      fetchPolicy: 'store-or-network',
    },
  );

  const projects = data.scopedProjectsV2;
  const modelStoreProject =
    projects?.ok === true ? (projects.value?.edges?.[0]?.node ?? null) : null;

  return {
    id: modelStoreProject?.entityId ?? null,
    name: modelStoreProject?.basicInfo?.name ?? null,
  };
};
