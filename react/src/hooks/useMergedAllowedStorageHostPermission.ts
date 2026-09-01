/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery } from '../__generated__/useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery.graphql';
import { useMergedAllowedStorageHostPermission_KeypairQuery } from '../__generated__/useMergedAllowedStorageHostPermission_KeypairQuery.graphql';
import { useSuspenseQuery } from '@tanstack/react-query';
import { graphql, useLazyLoadQuery } from 'react-relay';

// Placeholder UUID sent for the (validated, non-null) `$projectId` variable
// when the project-scope lookup is skipped. The `group` field is `@skip`ped in
// that case, so the value never reaches a resolver.
const NIL_UUID = '00000000-0000-0000-0000-000000000000';

export const useMergedAllowedStorageHostPermission = (
  domain: string,
  /**
   * Project to merge group-level `allowed_vfolder_hosts` from. `null` (e.g.
   * a user-owned folder opened from a super-admin page, where no ambient
   * project context exists — FR-3413) skips the group-scope lookup and merges
   * only the domain- and keypair-resource-policy-level permissions.
   */
  projectId: string | null,
  userAccessKey: string,
) => {
  const baiClient = useSuspendedBackendaiClient();
  const { keypair } =
    useLazyLoadQuery<useMergedAllowedStorageHostPermission_KeypairQuery>(
      graphql`
        query useMergedAllowedStorageHostPermission_KeypairQuery(
          $domainName: String
          $accessKey: String
        ) {
          keypair(domain_name: $domainName, access_key: $accessKey)
            @required(action: THROW) {
            resource_policy @required(action: THROW)
          }
        }
      `,
      {
        domainName: domain,
        accessKey: userAccessKey,
      },
      {
        fetchPolicy: 'store-or-network',
      },
    );
  const mergedAllowedVFolderHosts =
    useLazyLoadQuery<useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery>(
      graphql`
        query useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery(
          $domainName: String
          $projectId: UUID!
          $resourcePolicyName: String
          $skipProjectScope: Boolean!
        ) {
          domain(name: $domainName) {
            allowed_vfolder_hosts
          }
          group(id: $projectId, domain_name: $domainName)
            @skip(if: $skipProjectScope) {
            allowed_vfolder_hosts
          }
          keypair_resource_policy(name: $resourcePolicyName) {
            allowed_vfolder_hosts
          }
        }
      `,
      {
        domainName: domain,
        projectId: projectId ?? NIL_UUID,
        resourcePolicyName: keypair?.resource_policy,
        skipProjectScope: projectId === null,
      },
      {
        fetchPolicy: 'store-or-network',
      },
    );

  const allowedPermissionForDomainsByVolume = JSON.parse(
    mergedAllowedVFolderHosts?.domain?.allowed_vfolder_hosts || '{}',
  );
  const allowedPermissionForGroupsByVolume = JSON.parse(
    mergedAllowedVFolderHosts?.group?.allowed_vfolder_hosts || '{}',
  );
  const allowedPermissionForResourcePolicyByVolume = JSON.parse(
    mergedAllowedVFolderHosts?.keypair_resource_policy?.allowed_vfolder_hosts ||
      '{}',
  );

  const _mergeDedupe = (arr: any[]) => [
    ...new Set([].concat(...arr.filter(Boolean))),
  ];

  const { data: vhostInfo } = useSuspenseQuery({
    queryKey: ['vhostInfo'],
    queryFn: async () => {
      return await baiClient.vfolder.list_hosts();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 0,
  });
  const unitedAllowedPermissionByVolume = Object.assign(
    {},
    ...vhostInfo.allowed.map((volume: string) => {
      return {
        [volume]: _mergeDedupe([
          allowedPermissionForDomainsByVolume[volume],
          allowedPermissionForGroupsByVolume[volume],
          allowedPermissionForResourcePolicyByVolume[volume],
        ]),
      };
    }),
  );

  return {
    StorageHostPermissionByDomain: allowedPermissionForDomainsByVolume,
    StorageHostPermissionByGroup: allowedPermissionForGroupsByVolume,
    StorageHostPermissionByResourcePolicy:
      allowedPermissionForResourcePolicyByVolume,
    unitedAllowedPermissionByVolume,
  };
};
