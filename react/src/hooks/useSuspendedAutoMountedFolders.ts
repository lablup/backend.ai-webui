/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { autoMountedFoldersFrom } from '../helper/vfolderMounts';
import {
  useSuspendedMyVFolders,
  type AutoMountedFolder,
  type VFolderMountScope,
} from 'backend.ai-ui';

/**
 * The ready dotfile folders a session mounts on its own, read off the same
 * folder list the mount select uses. Suspends.
 */
export const useSuspendedAutoMountedFolders = ({
  currentProjectId,
  mountableHosts,
}: VFolderMountScope): Array<AutoMountedFolder> => {
  'use memo';
  const { folders } = useSuspendedMyVFolders();

  return autoMountedFoldersFrom(folders, {
    currentProjectId,
    mountableHosts,
  });
};
