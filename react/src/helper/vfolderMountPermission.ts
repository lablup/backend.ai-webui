/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/** The mount levels the UI distinguishes; `wd` folds into `rw` (backend.ai#14679). */
export type VFolderMountPermissionKey = 'ro' | 'rw' | 'none';

export const VFOLDER_MOUNT_PERMISSION_LABEL_KEYS: Record<
  VFolderMountPermissionKey,
  string
> = {
  ro: 'data.ReadOnly',
  rw: 'data.ReadWrite',
  none: 'data.NotMountable',
};

/** The letter badges shown next to the label; none for a level that mounts nothing. */
export const VFOLDER_MOUNT_PERMISSION_ICONS: Record<
  VFolderMountPermissionKey,
  string
> = {
  ro: 'R',
  rw: 'RW',
  none: '',
};

/** REST `permission` / legacy GraphQL `permission`: `ro`, `rw`, `wd`, `none` or null. */
export function mountPermissionFromLegacy(
  value: string | null | undefined,
): VFolderMountPermissionKey | null {
  switch (value) {
    case 'ro':
      return 'ro';
    case 'rw':
    case 'wd':
      return 'rw';
    case 'none':
      return 'none';
    default:
      return null;
  }
}

/** V2 `VFolderMountPermission`, including Relay's `%future added value`. */
export function mountPermissionFromV2(
  value: string | null | undefined,
): VFolderMountPermissionKey | null {
  switch (value) {
    case 'READ_ONLY':
      return 'ro';
    case 'READ_WRITE':
    case 'RW_DELETE':
      return 'rw';
    case 'NONE':
      return 'none';
    default:
      return null;
  }
}
