/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useMergedAllowedVFolderHostsQuery } from '../__generated__/useMergedAllowedVFolderHostsQuery.graphql';
import {
  MOUNT_IN_SESSION_PERMISSION,
  parseAllowedHosts,
} from '../helper/vfolderHostPermission';
import * as _ from 'lodash-es';
import { graphql, useLazyLoadQuery } from 'react-relay';

// `group(id:)` is `UUID!`, so a placeholder keeps the query valid while the
// project selection is @skip-ed.
const NIL_UUID = '00000000-0000-0000-0000-000000000000';

export interface UseMergedAllowedVFolderHostsArgs {
  domainName: string;
  /** Omit or pass `null` to merge only the domain and keypair policies. */
  projectId?: string | null;
}

export interface MergedAllowedVFolderHosts {
  /** Host name -> the permission keys merged across the three policies. */
  permissionsByHost: Record<string, Array<string>>;
  /** The subset of hosts granting `mount-in-session`. */
  mountableHosts: Array<string>;
}

/**
 * Merge the `allowed_vfolder_hosts` of the domain, the (optional) project and
 * the caller's keypair resource policy into one host -> permissions record.
 * Suspends on the query.
 */
export const useMergedAllowedVFolderHosts = ({
  domainName,
  projectId,
}: UseMergedAllowedVFolderHostsArgs): MergedAllowedVFolderHosts => {
  'use memo';
  const { domain, group, keypair_resource_policy } =
    useLazyLoadQuery<useMergedAllowedVFolderHostsQuery>(
      graphql`
        query useMergedAllowedVFolderHostsQuery(
          $domainName: String!
          $projectId: UUID!
          $skipProject: Boolean!
          $keypairResourcePolicyName: String
        ) {
          domain(name: $domainName) {
            allowed_vfolder_hosts
          }
          group(id: $projectId, domain_name: $domainName)
            @skip(if: $skipProject) {
            allowed_vfolder_hosts
          }
          keypair_resource_policy(name: $keypairResourcePolicyName) {
            allowed_vfolder_hosts
          }
        }
      `,
      {
        domainName,
        projectId: projectId || NIL_UUID,
        skipProject: !projectId,
        // The manager's `resolve_keypair_resource_policy` falls back to the
        // CALLER's policy, looked up by access key, when `name` is null.
        keypairResourcePolicyName: null,
      },
      { fetchPolicy: 'store-or-network' },
    );

  const permissionsByHost = _.merge(
    {},
    parseAllowedHosts(domain?.allowed_vfolder_hosts),
    parseAllowedHosts(group?.allowed_vfolder_hosts),
    parseAllowedHosts(keypair_resource_policy?.allowed_vfolder_hosts),
  );

  return {
    permissionsByHost,
    mountableHosts: Object.keys(permissionsByHost).filter((host) =>
      _.includes(permissionsByHost[host], MOUNT_IN_SESSION_PERMISSION),
    ),
  };
};

export default useMergedAllowedVFolderHosts;
