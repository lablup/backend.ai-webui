import { useGetAvailableFolderNameQuery } from '../__generated__/useGetAvailableFolderNameQuery.graphql';
import useConnectedBAIClient from '../components/provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { generateRandomString } from '../helper';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';

export const useGetAvailableFolderName = () => {
  'use memo';
  const relayEnv = useRelayEnvironment();
  const baiClient = useConnectedBAIClient();
  const readsV2 = baiClient.supports('vfolder-v2');
  return async (seedName: string) => {
    // Limit folder name length to 64 characters
    const targetName = seedName.substring(0, 64);
    // `@include` / `@skip` mirror the version gates so Relay never expects the
    // root field the request transformer stripped.
    const count = await fetchQuery<useGetAvailableFolderNameQuery>(
      relayEnv,
      graphql`
        query useGetAvailableFolderNameQuery(
          $name: String!
          $legacyFilter: String!
          $readsV2: Boolean!
        ) {
          myVfolders(
            filter: {
              name: { equals: $name }
              status: { notEquals: DELETE_COMPLETE }
            }
          ) @since(version: "26.4.2") @include(if: $readsV2) {
            count
          }
          vfolder_nodes(filter: $legacyFilter, permission: "read_attribute")
            @deprecatedSince(version: "26.4.2")
            @skip(if: $readsV2) {
            count
          }
        }
      `,
      {
        name: targetName,
        legacyFilter: `(name  == "${targetName}") & (status != "delete-complete")`,
        readsV2,
      },
    )
      .toPromise()
      .then((data) => data?.myVfolders?.count ?? data?.vfolder_nodes?.count)
      .catch(() => 0);

    const hash = generateRandomString(5);

    return count === 0 ? targetName : `${targetName.substring(0, 58)}_${hash}`;
  };
};

export default useGetAvailableFolderName;
