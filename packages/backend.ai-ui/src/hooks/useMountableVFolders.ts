import { useFetchKey } from '.';
import type {
  useMountableVFoldersAutoMountedQuery,
  VFolderFilter,
  VFolderScope,
} from '../__generated__/useMountableVFoldersAutoMountedQuery.graphql';
import * as _ from 'lodash-es';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type { VFolderFilter, VFolderScope };

/** A folder the session mounts on its own, identified so it can be linked. */
export interface AutoMountedFolder {
  vfolderId: string;
  name: string;
}

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
 * The ready dotfile folders a session in `scope` mounts on its own.
 * Suspends. Callers passing the same scope share one query, so a `refetch`
 * from any of them updates all.
 */
export const useSuspendedAutoMountedVFolders = ({
  scope,
  mountableHosts,
}: VFolderMountScope) => {
  'use memo';
  const [fetchKey, updateFetchKey] = useFetchKey();
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
        limit: AUTO_MOUNTED_FOLDER_LIMIT,
      },
      { fetchKey, fetchPolicy: 'store-and-network' },
    );

  // A folder whose mount level is NONE is skipped by the server's auto-mount.
  const autoMountedFolders: Array<AutoMountedFolder> = _.compact(
    _.map(scopedVFoldersV2?.edges, ({ node }) =>
      node.accessControl.permission === 'NONE'
        ? null
        : { vfolderId: node.entityId, name: node.metadata.name },
    ),
  );
  return { autoMountedFolders, refetch: () => updateFetchKey() };
};
