/**
 * A folder as `vfolder_nodes` returns it, reshaped to the field names the
 * mount select and the auto-mount helper already read. `id` is the dashed row
 * uuid and `group` is the owning project's uuid, or `null` for a user folder.
 */
export interface LegacyVFolder {
    name: string;
    id: string;
    quota_scope_id: string;
    host: string;
    status: string;
    usage_mode: string;
    created_at: string;
    permission: string;
    user: string | null;
    group: string | null;
    creator: string;
    user_email: string | null;
    group_name: string | null;
    ownership_type: string;
    cloneable: boolean;
    max_files: number;
    max_size: null | number;
    cur_size: number;
}
export interface LegacyVFolderListOptions {
    /** Scopes the list to a project; the caller's own folders come with it. */
    groupId?: string;
}
/**
 * The level the CALLER mounts this folder at. `vfolder_nodes.permissions` is
 * resolved per caller — owner, then their policy row, then the folder default
 * (backend.ai#14679) — so a folder they cannot mount carries no mount verb at
 * all. `wd` folds into `rw`, the vocabulary the select renders.
 */
export declare const mountLevelFromPermissions: (permissions: ReadonlyArray<unknown> | null | undefined) => string;
/**
 * The folder list behind `BAIVFolderMountConfigInput`, and the auto-mount
 * helper reading the same rows. Always the caller's own reachable folders:
 * `vfolder_nodes` takes no owner, so a session launched for somebody else no
 * longer lists that person's folders (FR-4045). Suspends.
 */
export declare const useSuspendedLegacyVFolders: ({ groupId, }?: LegacyVFolderListOptions) => {
    folders: LegacyVFolder[];
    refetch: () => Promise<void>;
    isFetching: boolean;
};
export interface LegacyVFolderMountScope {
    currentProjectId?: string;
    /** Hosts granting `mount-in-session`; omitted skips the host gate. */
    mountableHosts?: ReadonlyArray<string>;
}
/**
 * The gate `mount_ids` must pass server side: a host allowing
 * mount-in-session, and a folder of this project or the user's own.
 */
export declare const isMountableLegacyVFolder: (folder: LegacyVFolder, { currentProjectId, mountableHosts }: LegacyVFolderMountScope) => boolean;
