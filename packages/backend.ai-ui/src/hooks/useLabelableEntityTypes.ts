import { useLabelableEntityTypesQuery } from '../__generated__/useLabelableEntityTypesQuery.graphql';
import { useQuery } from '@tanstack/react-query';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';

/** The entity type names the label UI is wired for. */
export type BAILabelableEntityType =
  'session' | 'vfolder' | 'deployment' | 'resource_group';

/**
 * The entity types the manager accepts labels for, fetched once per page load and
 * kept for the session. Empty until the first response arrives.
 */
export const useLabelableEntityTypes = (): ReadonlySet<string> => {
  'use memo';
  const relayEnv = useRelayEnvironment();
  const { data } = useQuery({
    queryKey: ['bai', 'entityTypes'],
    queryFn: async () => {
      const result = await fetchQuery<useLabelableEntityTypesQuery>(
        relayEnv,
        graphql`
          query useLabelableEntityTypesQuery {
            entityTypes {
              name
            }
          }
        `,
        {},
        { fetchPolicy: 'network-only' },
      ).toPromise();
      return (result?.entityTypes ?? []).map((entityType) => entityType.name);
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
  return new Set(data ?? []);
};

export const useIsLabelableEntityType = (
  entityType: BAILabelableEntityType,
): boolean => {
  'use memo';
  return useLabelableEntityTypes().has(entityType);
};

export default useLabelableEntityTypes;
