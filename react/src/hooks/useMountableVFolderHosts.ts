import { useMergedAllowedStorageHostPermission } from './useMergedAllowedStorageHostPermission';

/**
 * Returns the storage hosts the current user is allowed to mount in a session
 * (the hosts that carry the `mount-in-session` permission).
 *
 * Derived from {@link useMergedAllowedStorageHostPermission}, which is backed by
 * the `myStorageHostPermissions` GraphQL field (Strawberry V2): the union of
 * `allowed_vfolder_hosts` across the domain, the user's projects, and the
 * keypair resource policy, resolved server-side and already intersected with the
 * registered volumes. Sharing that hook keeps this to a single query rather than
 * issuing a second one for the same data.
 *
 * Note: the host set is scoped to the user (the union across all of the user's
 * projects), not to a single active project, so it is a slight superset of the
 * hosts mountable in one specific project.
 */
export const useMountableVFolderHosts = (): Array<string> => {
  'use memo';
  const { unitedAllowedPermissionByVolume } =
    useMergedAllowedStorageHostPermission();
  return Object.keys(unitedAllowedPermissionByVolume).filter((host) =>
    unitedAllowedPermissionByVolume[host].includes('mount-in-session'),
  );
};
