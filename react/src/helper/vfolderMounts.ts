/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  convertToUUID,
  isMountableVFolder,
  mountDestinationToInput,
  type AutoMountedFolder,
  type VFolderListItem,
  type VFolderMountScope,
  type VFolderMountConfigValue,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';

/**
 * The pre-`vfolderMounts` launcher mount fields, carrying `mount_ids` as
 * 32-hex ids. They still arrive from `?formValues=` URLs and the stored
 * recent-session history.
 */
interface LegacyMountFormFields {
  mount_ids?: Array<string>;
  mount_id_map?: Record<string, string>;
  vfoldersNameMap?: Record<string, string>;
}

const LEGACY_MOUNT_KEYS = [
  'mount_ids',
  'mount_id_map',
  'vfoldersNameMap',
] as const;

/**
 * Read-time migration of the legacy mount fields into `vfolderMounts`, which
 * an existing `vfolderMounts` wins over (the legacy fields are then dropped).
 */
export const normalizeLegacyMountFields = <T extends object>(
  values: T,
): T & { vfolderMounts?: Array<VFolderMountConfigValue> } => {
  const legacy = values as LegacyMountFormFields;
  if (!_.some(LEGACY_MOUNT_KEYS, (key) => key in values)) {
    return values as T & { vfolderMounts?: Array<VFolderMountConfigValue> };
  }

  const rest = _.omit(values, LEGACY_MOUNT_KEYS) as T & {
    vfolderMounts?: Array<VFolderMountConfigValue>;
  };
  if (rest.vfolderMounts) return rest;

  return {
    ...rest,
    vfolderMounts: _.map(legacy.mount_ids ?? [], (id) => {
      const name = legacy.vfoldersNameMap?.[id];
      return {
        vfolderId: convertToUUID(id),
        name,
        mountDestination: mountDestinationToInput(
          name ?? '',
          legacy.mount_id_map?.[id],
        ),
        subpath: '',
      };
    }),
  };
};

/** A dotfile folder is what a session mounts without being asked. */
export const isAutoMountFolderName = (name: string) => name.startsWith('.');

/**
 * The folders a session mounts on its own — ready dotfile folders — picked out
 * of a `GET /folders` list the same way VFolderTable did it.
 */
export const autoMountedFoldersFrom = (
  folders: Array<VFolderListItem>,
  scope: VFolderMountScope,
): Array<AutoMountedFolder> =>
  _.map(
    _.filter(
      folders,
      (folder) =>
        folder.status === 'ready' &&
        isAutoMountFolderName(folder.name) &&
        isMountableVFolder(folder, scope),
    ),
    (folder) => ({ vfolderId: convertToUUID(folder.id), name: folder.name }),
  );
