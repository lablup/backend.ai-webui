/** A `vfolder_nodes` row. `id` is the dashed row uuid; `group` is null for a user folder. */
export interface LegacyVFolder {
    name: string;
    id: string;
    host: string;
    status: string;
    usage_mode: string;
    created_at: string;
    /** The caller's mount level: `rw` / `ro` / `none`, or `''` before 26.9.0a1. */
    permission: string;
    group: string | null;
    creator: string;
    user_email: string | null;
    group_name: string | null;
    ownership_type: string;
}
export interface LegacyVFolderListOptions {
    /** Scopes the list to a project; the caller's own folders come with it. */
    groupId?: string;
}
/**
 * The caller's mount level from `vfolder_nodes.permissions` (backend.ai#14679).
 * `null` means the manager predates the field's `@since`, so the level is unknown.
 */
export declare const mountLevelFromPermissions: (permissions: ReadonlyArray<unknown> | null | undefined) => string;
/** The caller's folders reachable from `groupId`, for the mount inputs. Suspends. */
export declare const useSuspendedLegacyVFolders: ({ groupId, }?: LegacyVFolderListOptions) => {
    folders: LegacyVFolder[];
    refetch: () => Promise<import('../__generated__/useSuspendedLegacyVFoldersQuery.graphql').useSuspendedLegacyVFoldersQuery$data | undefined>;
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
