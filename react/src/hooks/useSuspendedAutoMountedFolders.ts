/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { autoMountedFoldersFrom } from '../helper/vfolderMounts';
import {
  useSuspendedLegacyVFolders,
  type AutoMountedFolder,
  type LegacyVFolderMountScope,
} from 'backend.ai-ui';

type AutoMountedFoldersOptions = LegacyVFolderMountScope;

/**
 * The ready dotfile folders a session mounts on its own, read off the same
 * `vfolder_nodes` list the mount select uses. Suspends.
 */
export const useSuspendedAutoMountedFolders = ({
  currentProjectId,
  mountableHosts,
}: AutoMountedFoldersOptions): Array<AutoMountedFolder> => {
  'use memo';
  const { folders } = useSuspendedLegacyVFolders({
    groupId: currentProjectId,
  });

  return autoMountedFoldersFrom(folders, {
    currentProjectId,
    mountableHosts,
  });
};
