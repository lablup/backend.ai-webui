import { useMountableVFolderHostsQuery } from '../__generated__/useMountableVFolderHostsQuery.graphql';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Returns the storage hosts the current user is allowed to mount in a session.
 *
 * Backed by the `myStorageHostPermissions` GraphQL field (Strawberry V2), which
 * resolves — server-side — the union of `allowed_vfolder_hosts` inherited from
 * the domain, the user's projects, and the keypair resource policy, already
 * intersected with the volumes currently registered on the storage manager.
 *
 * This avoids the legacy client-side merge (domain + group + keypair
 * `allowed_vfolder_hosts`), which first had to resolve the keypair's
 * resource-policy name and therefore incurred a request waterfall.
 *
 * Note: the host set is scoped to the user (the union across all of the user's
 * projects), not to a single active project, so it is a slight superset of the
 * hosts mountable in one specific project.
 *
 * @returns the list of host names on which the user holds the
 *   `MOUNT_IN_SESSION` permission.
 */
export const useMountableVFolderHosts = (): Array<string> => {
  'use memo';
  const { myStorageHostPermissions } =
    useLazyLoadQuery<useMountableVFolderHostsQuery>(
      graphql`
        query useMountableVFolderHostsQuery {
          myStorageHostPermissions {
            items {
              host
              permissions
            }
          }
        }
      `,
      {},
    );

  return (myStorageHostPermissions?.items ?? [])
    .filter((item) => item.permissions.includes('MOUNT_IN_SESSION'))
    .map((item) => item.host);
};
