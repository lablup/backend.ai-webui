/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useMergedAllowedStorageHostPermissionQuery } from '../__generated__/useMergedAllowedStorageHostPermissionQuery.graphql';
import { v2PermissionToKey } from '../helper/storageHostPermission';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Per-host storage permissions for the current user, keyed by host name, with
 * permission values in the legacy kebab-case form (e.g. 'mount-in-session',
 * 'download-file', 'upload-file') for backward compatibility with existing
 * consumers.
 *
 * Backed by `myStorageHostPermissions` (Strawberry V2), which resolves the
 * union of `allowed_vfolder_hosts` across the domain, the user's projects, and
 * the keypair resource policy server-side, already intersected with the
 * registered volumes. This replaces the previous client-side merge, which had
 * to resolve the keypair resource-policy name first and therefore incurred a
 * request waterfall.
 */
export const useMergedAllowedStorageHostPermission = () => {
  'use memo';
  const { myStorageHostPermissions } =
    useLazyLoadQuery<useMergedAllowedStorageHostPermissionQuery>(
      graphql`
        query useMergedAllowedStorageHostPermissionQuery {
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

  const unitedAllowedPermissionByVolume: Record<
    string,
    Array<string>
  > = Object.fromEntries(
    (myStorageHostPermissions?.items ?? []).map((item) => [
      item.host,
      item.permissions.map(v2PermissionToKey),
    ]),
  );

  return { unitedAllowedPermissionByVolume };
};
