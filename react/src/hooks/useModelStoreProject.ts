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
 * when the domain has none. Assumes one model store per domain (ADR 0006 pair:
 * 26.9.0a1+ reads the caller's memberships, 26.2.0+ reads the domain, older
 * managers read the legacy `groups` list).
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
          filter: { type: { equals: MODEL_STORE }, isActive: true }
        ) @since(version: "26.9.0a1") @catch(to: RESULT) {
          edges {
            node {
              id
              basicInfo {
                name
              }
            }
          }
        }
        domainV2(domainName: $domainName)
          @since(version: "26.2.0")
          @deprecatedSince(version: "26.9.0a1")
          @catch(to: RESULT) {
          projects(filter: { type: { equals: MODEL_STORE }, isActive: true }) {
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
        legacyGroups: groups(
          domain_name: $domainName
          is_active: true
          type: ["MODEL_STORE"]
        ) @deprecatedSince(version: "26.2.0") @catch(to: RESULT) {
          id
          name
        }
      }
    `,
    { userId, domainName },
    {
      fetchPolicy: 'store-or-network',
    },
  );

  const modelStoreProject =
    (data.scopedProjectsV2?.ok === true
      ? data.scopedProjectsV2.value?.edges?.[0]?.node
      : null) ??
    (data.domainV2?.ok === true
      ? data.domainV2.value?.projects?.edges?.[0]?.node
      : null) ??
    null;
  if (modelStoreProject) {
    return {
      id: toLocalId(modelStoreProject.id),
      name: modelStoreProject.basicInfo?.name ?? null,
    };
  }
  // Legacy `Group.id` is already the raw UUID.
  const legacyGroup =
    data.legacyGroups?.ok === true ? data.legacyGroups.value?.[0] : null;
  return {
    id: legacyGroup?.id ?? null,
    name: legacyGroup?.name ?? null,
  };
};
