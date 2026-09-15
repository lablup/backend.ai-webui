/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { autoMountedFolderNamesFrom } from '../helper/vfolderMounts';
import {
  useSuspendedLegacyVFolders,
  type LegacyVFolderMountScope,
} from 'backend.ai-ui';

interface AutoMountedFolderNamesOptions extends LegacyVFolderMountScope {
  /**
   * The user the session is launched for. Their folders are what the session
   * auto-mounts, so an admin launching on someone else's behalf must pass it;
   * the caller's own folders are listed when it is unset.
   */
  ownerEmail?: string;
}

/**
 * Names of the ready dotfile folders a session mounts on its own, read off the
 * same owner-scoped `GET /folders` list the mount select uses. Suspends.
 */
export const useSuspendedAutoMountedFolderNames = ({
  ownerEmail,
  currentProjectId,
  mountableHosts,
}: AutoMountedFolderNamesOptions): Array<string> => {
  'use memo';
  const { folders } = useSuspendedLegacyVFolders(ownerEmail);

  return autoMountedFolderNamesFrom(folders, {
    currentProjectId,
    mountableHosts,
  });
};
