import { useFetchKey } from '.';
import type {
  VFolderFilter,
  VFolderScope,
} from '../__generated__/BAIScopedVFolderSelectQuery.graphql';
import type { useMountableVFoldersAutoMountedQuery } from '../__generated__/useMountableVFoldersAutoMountedQuery.graphql';
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

export interface VFolderMountScope {
  /** The scopes a session mounts from, usually {@link mountableVFolderScope}. */
  scope: VFolderScope;
  /** Hosts granting `mount-in-session`. */
  mountableHosts: ReadonlyArray<string>;
}

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

/** Leaves out folders being deleted or already deleted. */
export const notDeletedVFolderFilter: VFolderFilter = {
  status: {
    notIn: [
      'DELETE_PENDING',
      'DELETE_ONGOING',
      'DELETE_ERROR',
      'DELETE_COMPLETE',
    ],
  },
};

const AUTO_MOUNTED_FOLDER_LIMIT = 100;

/**
 * The ready folders the user's and the project's auto-mount settings mount
 * into a session in `scope`, without those the caller's mount level is NONE for. Suspends. Callers passing the same scope share
 * one query, so a `refetch` from any of them updates all.
 */
export const useSuspendedAutoMountedVFolders = ({
  scope,
  mountableHosts,
}: VFolderMountScope) => {
  'use memo';
  const [fetchKey, updateFetchKey] = useFetchKey();
  const { scopedVfolderAutoMounts } =
    useLazyLoadQuery<useMountableVFoldersAutoMountedQuery>(
      graphql`
        query useMountableVFoldersAutoMountedQuery(
          $autoMountScope: VFolderAutoMountScope!
          $limit: Int!
        ) {
          scopedVfolderAutoMounts(
            scope: $autoMountScope
            limit: $limit
            orderBy: [{ field: MOUNT_DESTINATION, direction: ASC }]
          ) {
            edges {
              node {
                vfolderId
                mountDestination
                vfolder {
                  host
                  status
                  mountPermission
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
        // The auto-mount scope has no domain; a session mounts the user's and the project's.
        autoMountScope: { project: scope.project, user: scope.user },
        limit: AUTO_MOUNTED_FOLDER_LIMIT,
      },
      { fetchKey, fetchPolicy: 'store-and-network' },
    );

  const autoMountedFolders: Array<AutoMountedFolder> = _.compact(
    _.map(scopedVfolderAutoMounts?.edges, ({ node }) =>
      node.vfolder?.status === 'READY' &&
      node.vfolder.mountPermission !== 'NONE' &&
      _.includes(mountableHosts, node.vfolder.host)
        ? {
            vfolderId: node.vfolderId,
            name: node.vfolder.metadata.name,
            mountDestination: node.mountDestination,
          }
        : null,
    ),
  );
  return {
    autoMountedFolders,
    refetch: () => updateFetchKey(),
  };
};
