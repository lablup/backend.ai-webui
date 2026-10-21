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
        query useGetAvailableFolderNameQuery($name: String!) {
          myVfolders(
            filter: {
              name: { equals: $name }
              status: { notEquals: DELETE_COMPLETE }
            }
          ) {
            count
          }
        }
      `,
      { name: targetName },
    )
      .toPromise()
      .then((data) => data?.myVfolders?.count)
      .catch(() => 0);

    const hash = generateRandomString(5);

    return count === 0 ? targetName : `${targetName.substring(0, 58)}_${hash}`;
  };
};

export default useGetAvailableFolderName;
