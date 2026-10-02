/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient, useCurrentDomainValue } from '.';
import { useModelStoreProjectQuery } from '../__generated__/useModelStoreProjectQuery.graphql';
import { toLocalId } from 'backend.ai-ui';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Returns the id and name of the active MODEL_STORE project in the current
 * domain, or nulls when there is none. Assumes one model store per domain.
 * `'user'` reads the caller's memberships; `'admin'` reads every project of the
 * current domain (domain admin or higher), for admin pages.
 */
export const useModelStoreProject = (scope: 'user' | 'admin' = 'user') => {
  const baiClient = useSuspendedBackendaiClient();
  const domainName = useCurrentDomainValue();
  const userId: string = baiClient.user_uuid;
  const isAdminScope = scope === 'admin';

  const data = useLazyLoadQuery<useModelStoreProjectQuery>(
    graphql`
      query useModelStoreProjectQuery(
        $userId: UUID!
        $domainName: String!
        $isAdminScope: Boolean!
      ) {
        scopedProjectsV2(
          scope: { user: [{ value: $userId }] }
          filter: {
            type: { equals: MODEL_STORE }
            isActive: true
            domainName: { equals: $domainName }
          }
        )
          @skip(if: $isAdminScope)
          @since(version: "26.9.0a1")
          @catch(to: RESULT) {
          edges {
            node {
              id
              basicInfo {
                name
              }
            }
          }
        }
        domainProjectsV2(
          scope: { domainName: $domainName }
          filter: { type: { equals: MODEL_STORE }, isActive: true }
          limit: 1
        ) @include(if: $isAdminScope) @catch(to: RESULT) {
          edges {
            node {
              id
              basicInfo {
                name
              }
            }
          }
        }
      }
    `,
    { userId, domainName, isAdminScope },
    {
      fetchPolicy: 'store-or-network',
    },
  );

  const projects = isAdminScope ? data.domainProjectsV2 : data.scopedProjectsV2;
  const modelStoreProject =
    projects?.ok === true ? (projects.value?.edges?.[0]?.node ?? null) : null;

  return {
    id: modelStoreProject ? toLocalId(modelStoreProject.id) : null,
    name: modelStoreProject?.basicInfo?.name ?? null,
  };
};
