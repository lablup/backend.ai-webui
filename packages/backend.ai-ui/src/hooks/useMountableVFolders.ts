import { useFetchKey } from '.';
import type {
  useMountableVFoldersAutoMountedQuery,
  VFolderFilter,
  VFolderScope,
} from '../__generated__/useMountableVFoldersAutoMountedQuery.graphql';
import useConnectedBAIClient from '../components/provider/BAIClientProvider/hooks/useConnectedBAIClient';
import * as _ from 'lodash-es';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type { VFolderFilter, VFolderScope };

/** A folder the session mounts on its own, identified so it can be linked. */
export interface AutoMountedFolder {
  vfolderId: string;
  name: string;
  /** Set by an auto-mount setting; otherwise the folder takes its default path. */
  mountDestination?: string;
}

/** The first manager that reads auto-mounts from per-scope settings rather than dot names. */
export const AUTO_MOUNT_SETTING_MANAGER_VERSION = '26.10.0a5';

export interface VFolderMountScope {
  /** The scopes a session mounts from, usually {@link mountableVFolderScope}. */
  scope: VFolderScope;
  /** Hosts granting `mount-in-session`. */
  mountableHosts: ReadonlyArray<string>;
}

/** A dotfile folder is what a session mounts without being asked. */
export const isAutoMountFolderName = (name: string) => name.startsWith('.');

/** The caller's own folders plus the current project's, the reach a session mounts from. */
export const mountableVFolderScope = (
  userId: string,
  currentProjectId?: string,
): VFolderScope => ({
  user: [{ value: userId }],
  ...(currentProjectId ? { project: [{ value: currentProjectId }] } : {}),
});

/**
 * The server-side half of the mount gate: a host granting `mount-in-session`.
 * Hosts are sorted so every caller sends the same variables and shares one Relay cache entry.
 */
export const mountableVFolderFilter = (
  mountableHosts: ReadonlyArray<string>,
): VFolderFilter => ({
  host: { in: _.sortBy(mountableHosts) },
  status: { notIn: ['DELETE_COMPLETE'] },
});

const AUTO_MOUNTED_FOLDER_LIMIT = 100;

/**
 * The folders a session in `scope` mounts on its own: the user's and the
 * project's auto-mount settings on a manager that has them, the ready dotfile
 * folders before that. Suspends. Callers passing the same scope share one
 * query, so a `refetch` from any of them updates all.
 */
export const useSuspendedAutoMountedVFolders = ({
  scope,
  mountableHosts,
}: VFolderMountScope) => {
  'use memo';
  const baiClient = useConnectedBAIClient();
  const isAutoMountSetting = baiClient.isManagerVersionCompatibleWith(
    AUTO_MOUNT_SETTING_MANAGER_VERSION,
  );
  const [fetchKey, updateFetchKey] = useFetchKey();
  const { scopedVFoldersV2, scopedVfolderAutoMounts } =
    useLazyLoadQuery<useMountableVFoldersAutoMountedQuery>(
      graphql`
        query useMountableVFoldersAutoMountedQuery(
          $scope: VFolderScope!
          $filter: VFolderFilter
          $autoMountScope: VFolderAutoMountScope!
          $limit: Int!
          $isAutoMountSetting: Boolean!
        ) {
          scopedVFoldersV2(
            scope: $scope
            filter: $filter
            limit: $limit
            orderBy: [{ field: NAME, direction: ASC }]
          ) @skip(if: $isAutoMountSetting) {
            edges {
              node {
                entityId
                accessControl {
                  permission
                }
                metadata {
                  name
                }
              }
            }
          }
          scopedVfolderAutoMounts(
            scope: $autoMountScope
            limit: $limit
            orderBy: [{ field: MOUNT_DESTINATION, direction: ASC }]
          ) @include(if: $isAutoMountSetting) {
            edges {
              node {
                vfolderId
                mountDestination
                vfolder {
                  host
                  status
                  metadata {
                    name
                  }
                }
              }
            }
          }
        }
      `,
      {
        scope,
        filter: {
          AND: [
            mountableVFolderFilter(mountableHosts),
            { name: { startsWith: '.' }, status: { equals: 'READY' } },
          ],
        },
        // The auto-mount scope has no domain; a session mounts the user's and the project's.
        autoMountScope: { project: scope.project, user: scope.user },
        limit: AUTO_MOUNTED_FOLDER_LIMIT,
        isAutoMountSetting,
      },
      { fetchKey, fetchPolicy: 'store-and-network' },
    );

  const autoMountedFolders: Array<AutoMountedFolder> = isAutoMountSetting
    ? _.compact(
        _.map(scopedVfolderAutoMounts?.edges, ({ node }) =>
          node.vfolder?.status === 'READY' &&
          _.includes(mountableHosts, node.vfolder.host)
            ? {
                vfolderId: node.vfolderId,
                name: node.vfolder.metadata.name,
                mountDestination: node.mountDestination,
              }
            : null,
        ),
      )
    : // A folder whose mount level is NONE is skipped by the server's auto-mount.
      _.compact(
        _.map(scopedVFoldersV2?.edges, ({ node }) =>
          node.accessControl.permission === 'NONE'
            ? null
            : { vfolderId: node.entityId, name: node.metadata.name },
        ),
      );
  return {
    autoMountedFolders,
    isAutoMountSetting,
    refetch: () => updateFetchKey(),
  };
};
