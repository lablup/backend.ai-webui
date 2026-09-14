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
/** The permission a host must grant before a session can mount a folder on it. */
export declare const MOUNT_IN_SESSION_PERMISSION = "mount-in-session";
/** Convert a V2 permission enum value to the canonical V1 kebab key. */
export declare const v2PermissionToKey: (perm: string) => string;
/**
 * Parse the `allowed_vfolder_hosts` JSONString returned by the backend into a
 * `{ host: permissionKeys[] }` record; `{}` when missing or unparseable.
 */
export declare const parseAllowedHosts: (raw: string | null | undefined) => Record<string, string[]>;
/** V2 `VFolderHostPermissionEntry` shape (host name + permission enum list). */
export interface V2AllowedVfolderHostEntry {
    readonly host: string;
    readonly permissions: ReadonlyArray<string>;
}
/** The V2 entry list flattened to the `{ host: kebabPermissions[] }` record. */
export declare const v2AllowedVfolderHostsToRecord: (entries: ReadonlyArray<V2AllowedVfolderHostEntry> | null | undefined) => Record<string, string[]>;
