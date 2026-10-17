import type {
  useMountableVFoldersAutoMountedQuery,
  VFolderFilter,
  VFolderScope,
} from '../__generated__/useMountableVFoldersAutoMountedQuery.graphql';
import useConnectedBAIClient from '../components/provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { toLocalId } from '../helper';
import { useDateISOState } from './useUpdatableState';
import * as _ from 'lodash-es';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type { VFolderFilter, VFolderScope };

/** A folder the session mounts on its own, identified so it can be linked. */
export interface AutoMountedFolder {
  vfolderId: string;
  name: string;
}

export interface VFolderMountScope {
  currentProjectId?: string;
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

/** The server-side half of the mount gate: a host granting `mount-in-session`. */
export const mountableVFolderFilter = (
  mountableHosts: ReadonlyArray<string>,
): VFolderFilter => ({
  host: { in: [...mountableHosts] },
  status: { notIn: ['DELETE_COMPLETE'] },
});

/** The page size of every mount-folder read. */
export const MOUNT_FOLDER_PAGE_SIZE = 100;

/**
 * The ready dotfile folders a session in this project mounts on its own.
 * Suspends; `refetch` re-reads them after the host creates a folder.
 */
export const useSuspendedAutoMountedVFolders = ({
  currentProjectId,
  mountableHosts,
}: VFolderMountScope) => {
  'use memo';
  const baiClient = useConnectedBAIClient();
  const [fetchKey, refetch] = useDateISOState('first');
  const { scopedVFoldersV2 } =
    useLazyLoadQuery<useMountableVFoldersAutoMountedQuery>(
      graphql`
        query useMountableVFoldersAutoMountedQuery(
          $scope: VFolderScope!
          $filter: VFolderFilter
          $limit: Int!
        ) {
          scopedVFoldersV2(
            scope: $scope
            filter: $filter
            limit: $limit
            orderBy: [{ field: NAME, direction: ASC }]
          ) {
            edges {
              node {
                id
                accessControl {
                  permission
                }
                metadata {
                  name
                }
              }
            }
          }
        }
      `,
      {
        scope: mountableVFolderScope(baiClient.user_uuid, currentProjectId),
        filter: {
          AND: [
            mountableVFolderFilter(mountableHosts),
            { name: { startsWith: '.' }, status: { equals: 'READY' } },
          ],
        },
        limit: MOUNT_FOLDER_PAGE_SIZE,
      },
      { fetchKey, fetchPolicy: 'store-and-network' },
    );

  // A folder whose mount level is NONE is skipped by the server's auto-mount.
  const autoMountedFolders: Array<AutoMountedFolder> = _.compact(
    _.map(scopedVFoldersV2?.edges, ({ node }) =>
      node.accessControl.permission === 'NONE'
        ? null
        : { vfolderId: toLocalId(node.id), name: node.metadata.name },
    ),
  );
  return { autoMountedFolders, refetch };
};
