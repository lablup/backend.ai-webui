import { useGetAvailableFolderNameQuery } from '../__generated__/useGetAvailableFolderNameQuery.graphql';
import { generateRandomString } from '../helper';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';

export const useGetAvailableFolderName = () => {
  'use memo';
  const relayEnv = useRelayEnvironment();
  return async (seedName: string) => {
    // Limit folder name length to 64 characters
    const targetName = seedName.substring(0, 64);
    const count = await fetchQuery<useGetAvailableFolderNameQuery>(
      relayEnv,
      graphql`
        query useGetAvailableFolderNameQuery($filter: String!) {
          vfolder_nodes(filter: $filter, permission: "read_attribute") {
            edges {
              node {
                name
                status
              }
            }
            count
          }
        }
      `,
      {
        filter: `(name  == "${targetName}") & (status != "delete-complete")`,
      },
    )
      .toPromise()
      .then((data) => data?.vfolder_nodes?.count)
      .catch(() => 0);

    const hash = generateRandomString(5);

    return count === 0 ? targetName : `${targetName.substring(0, 58)}_${hash}`;
  };
};

export default useGetAvailableFolderName;
