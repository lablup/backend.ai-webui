import { useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery } from '../__generated__/useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery.graphql';
import { useMergedAllowedStorageHostPermission_KeypairQuery } from '../__generated__/useMergedAllowedStorageHostPermission_KeypairQuery.graphql';
import useConnectedBAIClient from '../components/provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { useSuspenseQuery } from '@tanstack/react-query';
import { graphql, useLazyLoadQuery } from 'react-relay';

export const useMergedAllowedStorageHostPermission = () => {
  const baiClient = useConnectedBAIClient();
  const userAccessKey = baiClient?.accessKey;
  const domainName = baiClient?._config?.domainName;
  const projectId = baiClient?.current_group_id();

  const { keypair } =
    useLazyLoadQuery<useMergedAllowedStorageHostPermission_KeypairQuery>(
      graphql`
        query useMergedAllowedStorageHostPermission_KeypairQuery(
          $domainName: String!
          $accessKey: String
        ) {
          keypair(domain_name: $domainName, access_key: $accessKey)
            @required(action: THROW) {
            resource_policy @required(action: THROW)
          }
        }
      `,
      {
        domainName,
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
        ) {
          domain(name: $domainName) {
            allowed_vfolder_hosts
          }
          group(id: $projectId, domain_name: $domainName) {
            allowed_vfolder_hosts
          }
          keypair_resource_policy(name: $resourcePolicyName) {
            allowed_vfolder_hosts
          }
        }
      `,
      {
        domainName,
        projectId,
        resourcePolicyName: keypair?.resource_policy,
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
