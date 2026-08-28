/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * V2 (`VFolderHostPermissionV2`) enum value → the canonical V1 kebab key used
 * by the permission catalog (`vfolder_host_permissions`) and the V1 mutations.
 *
 * `SET_USER_PERM` ↔ `set-user-specific-permission` is asymmetric: a naive
 * lowercase-and-dash yields `set-user-perm`, which matches no catalog key, so
 * the permission silently reads as "not granted".
 */
const V2_TO_V1_PERMISSION: Record<string, string> = {
  CREATE_VFOLDER: 'create-vfolder',
  MODIFY_VFOLDER: 'modify-vfolder',
  DELETE_VFOLDER: 'delete-vfolder',
  MOUNT_IN_SESSION: 'mount-in-session',
  UPLOAD_FILE: 'upload-file',
  DOWNLOAD_FILE: 'download-file',
  INVITE_OTHERS: 'invite-others',
  SET_USER_PERM: 'set-user-specific-permission',
};

/** Convert a V2 permission enum value to the canonical V1 kebab key. */
export const v2PermissionToKey = (perm: string): string =>
  V2_TO_V1_PERMISSION[perm] ?? perm.toLowerCase().replace(/_/g, '-');

/** V2 `VFolderHostPermissionEntry` shape (host name + permission enum list). */
export interface V2AllowedVfolderHostEntry {
  readonly host: string;
  readonly permissions: ReadonlyArray<string>;
}

/** The V2 entry list flattened to the `{ host: kebabPermissions[] }` record. */
export const v2AllowedVfolderHostsToRecord = (
  entries: ReadonlyArray<V2AllowedVfolderHostEntry> | null | undefined,
): Record<string, string[]> => {
  const record: Record<string, string[]> = {};
  for (const entry of entries ?? []) {
    record[entry.host] = entry.permissions.map(v2PermissionToKey);
  }
  return record;
};
