/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient, useCurrentDomainValue } from '.';
import { useModelStoreProjectQuery } from '../__generated__/useModelStoreProjectQuery.graphql';
import { toLocalId } from 'backend.ai-ui';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Hook to get the MODEL_STORE type project info.
 * Returns the first active MODEL_STORE project's id and name.
 *
 * NOTE: Currently assumes a single MODEL_STORE project exists per domain
 * and returns the first one. If multi-model-store support is needed in the
 * future, this hook should accept a project selector or return all
 * MODEL_STORE projects for the caller to choose from.
 */
export const useModelStoreProject = () => {
  useSuspendedBackendaiClient();
  const domainName = useCurrentDomainValue();

  const { domainV2 } = useLazyLoadQuery<useModelStoreProjectQuery>(
    graphql`
      query useModelStoreProjectQuery($domainName: String!) {
        domainV2(domainName: $domainName) {
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
      }
    `,
    { domainName },
    {
      fetchPolicy: 'store-or-network',
    },
  );

  const modelStoreProject = domainV2?.projects?.edges?.[0]?.node ?? null;

  return {
    id: modelStoreProject ? toLocalId(modelStoreProject.id) : null,
    name: modelStoreProject?.basicInfo?.name ?? null,
  };
};
