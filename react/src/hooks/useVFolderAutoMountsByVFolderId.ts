/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import type { useVFolderAutoMountsByVFolderIdQuery } from '../__generated__/useVFolderAutoMountsByVFolderIdQuery.graphql';
import { AUTO_MOUNT_SETTING_MANAGER_VERSION } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface VFolderAutoMountEntry {
  scopeType: 'PROJECT' | 'USER' | (string & {});
  mountDestination: string;
  subpath: string;
  mountPermission: string;
}

const AUTO_MOUNT_LIMIT = 100;

/**
 * The auto-mounts of the current user and project, keyed by vfolder UUID.
 * `VFolder.vfolderAutoMounts` would answer this per row, but no released
 * manager carries it yet. Suspends; empty on a manager without the API.
 */
export const useVFolderAutoMountsByVFolderId = ({
  userId,
  projectId,
  fetchKey,
}: {
  userId: string;
  projectId?: string;
  fetchKey?: string;
}): {
  isSupported: boolean;
  autoMountsByVFolderId: Record<string, Array<VFolderAutoMountEntry>>;
} => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const isSupported = baiClient.isManagerVersionCompatibleWith(
    AUTO_MOUNT_SETTING_MANAGER_VERSION,
  );
  const { scopedVfolderAutoMounts } =
    useLazyLoadQuery<useVFolderAutoMountsByVFolderIdQuery>(
      graphql`
        query useVFolderAutoMountsByVFolderIdQuery(
          $scope: VFolderAutoMountScope!
          $limit: Int!
          $isSupported: Boolean!
        ) {
          scopedVfolderAutoMounts(
            scope: $scope
            limit: $limit
            orderBy: [{ field: MOUNT_DESTINATION, direction: ASC }]
          ) @include(if: $isSupported) {
            edges {
              node {
                vfolderId
                scopeType
                mountDestination
                subpath
                mountPermission
              }
            }
          }
        }
      `,
      {
        scope: {
          user: [{ value: userId }],
          ...(projectId ? { project: [{ value: projectId }] } : {}),
        },
        limit: AUTO_MOUNT_LIMIT,
        isSupported,
      },
      { fetchKey, fetchPolicy: 'store-and-network' },
    );

  return {
    isSupported,
    autoMountsByVFolderId: _.groupBy(
      _.map(scopedVfolderAutoMounts?.edges, ({ node }) => node),
      'vfolderId',
    ),
  };
};
