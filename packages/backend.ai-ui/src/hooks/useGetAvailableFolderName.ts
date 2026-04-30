import { useGetAvailableFolderNameQuery } from '../__generated__/useGetAvailableFolderNameQuery.graphql';
import { generateRandomString } from '../helper';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';

export const useGetAvailableFolderName = () => {
  'use memo';
  const relayEnv = useRelayEnvironment();
  return async (seedName: string) => {
    // Limit folder name length to 64 characters
    const targetName = seedName.substring(0, 64);
    // Use the V2 `myVfolders` query so the availability check stays in the
    // caller's own vfolder scope (matching the V1 default scope). The filter
    // mirrors the previous V1 semantics: exact name match, excluding
    // already-purged (`DELETE_COMPLETE`) folders so reused names become
    // reclaimable after a full purge.
    const count = await fetchQuery<useGetAvailableFolderNameQuery>(
      relayEnv,
      graphql`
        query useGetAvailableFolderNameQuery($filter: VFolderFilter) {
          myVfolders(filter: $filter) {
            count
          }
        }
      `,
      {
        filter: {
          AND: [
            { name: { equals: targetName } },
            { status: { notEquals: 'DELETE_COMPLETE' } },
          ],
        },
      },
    )
      .toPromise()
      .then((data) => data?.myVfolders?.count)
      .catch(() => 0);

    const hash = generateRandomString(5);

    return count === 0 ? targetName : `${targetName.substring(0, 58)}_${hash}`;
  };
};

export default useGetAvailableFolderName;
