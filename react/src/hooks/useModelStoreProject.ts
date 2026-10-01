/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient, useCurrentDomainValue } from '.';
import { useModelStoreProjectQuery } from '../__generated__/useModelStoreProjectQuery.graphql';
import { toLocalId } from 'backend.ai-ui';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Returns the id and name of the caller's active MODEL_STORE project, or nulls
 * when the caller belongs to none. Assumes one model store per domain and
 * reads it through the caller's memberships (ADR 0006).
 */
export const useModelStoreProject = () => {
  const baiClient = useSuspendedBackendaiClient();
  const domainName = useCurrentDomainValue();
  const userId: string = baiClient.user_uuid;

  const data = useLazyLoadQuery<useModelStoreProjectQuery>(
    graphql`
      query useModelStoreProjectQuery($userId: UUID!, $domainName: String!) {
        scopedProjectsV2(
          scope: { user: [{ value: $userId }] }
          filter: {
            type: { equals: MODEL_STORE }
            isActive: true
            domainName: { equals: $domainName }
          }
        ) @catch(to: RESULT) {
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
    { userId, domainName },
    {
      fetchPolicy: 'store-or-network',
    },
  );

  const modelStoreProject =
    data.scopedProjectsV2?.ok === true
      ? (data.scopedProjectsV2.value?.edges?.[0]?.node ?? null)
      : null;

  return {
    id: modelStoreProject ? toLocalId(modelStoreProject.id) : null,
    name: modelStoreProject?.basicInfo?.name ?? null,
  };
};
