/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/** Convert a V2 permission enum value to the canonical V1 kebab key. */
export declare const v2PermissionToKey: (perm: string) => string;
/** V2 `VFolderHostPermissionEntry` shape (host name + permission enum list). */
export interface V2AllowedVfolderHostEntry {
    readonly host: string;
    readonly permissions: ReadonlyArray<string>;
}
/** The V2 entry list flattened to the `{ host: kebabPermissions[] }` record. */
export declare const v2AllowedVfolderHostsToRecord: (entries: ReadonlyArray<V2AllowedVfolderHostEntry> | null | undefined) => Record<string, string[]>;
