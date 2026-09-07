/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { convertToUUID, type VFolderMountConfigValue } from 'backend.ai-ui';
import * as _ from 'lodash-es';

export const DEFAULT_ALIAS_BASE_PATH = '/home/work/';

/**
 * The pre-`vfolderMounts` launcher mount fields. They still arrive from
 * `?formValues=`, from the recent-session history, and from the FileBrowser /
 * SFTP buttons, which keep writing `mount_ids` as 32-hex ids.
 */
export interface LegacyMountFormFields {
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
 * Undo `inputToMountDestination`: recover the raw alias a resolved absolute
 * mount path came from, so the alias input shows what the user would have
 * typed rather than the expanded path.
 */
const toAliasInput = (
  name: string | undefined,
  mountDestination: string | undefined,
) => {
  if (!mountDestination) return '';
  if (name && mountDestination === `${DEFAULT_ALIAS_BASE_PATH}${name}`)
    return '';
  if (mountDestination.startsWith(DEFAULT_ALIAS_BASE_PATH))
    return mountDestination.slice(DEFAULT_ALIAS_BASE_PATH.length);
  return mountDestination;
};

/**
 * Read-time migration of the legacy mount fields into `vfolderMounts`.
 * Returns `values` untouched when no legacy field is present, and drops the
 * legacy fields (without rebuilding) when `vfolderMounts` already carries the
 * selection.
 */
export const normalizeLegacyMountFields = <T extends object>(
  values: T,
): T & { vfolderMounts?: Array<VFolderMountConfigValue> } => {
  const legacy = values as LegacyMountFormFields;
  if (!legacy.mount_ids && !legacy.mount_id_map && !legacy.vfoldersNameMap) {
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
        ...(name ? { name } : {}),
        mountDestination: toAliasInput(name, legacy.mount_id_map?.[id]),
        subpath: '',
      };
    }),
  };
};
