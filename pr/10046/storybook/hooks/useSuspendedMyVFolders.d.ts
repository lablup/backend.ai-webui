import { useSuspendedMyVFoldersQuery } from '../__generated__/useSuspendedMyVFoldersQuery.graphql';
/**
 * The flat folder row the mount select and `VFolderTable` read, mapped from a
 * `myVfolders` node (the shape `GET /folders` returned): `id` is the 32-hex
 * local id (no dashes) and `group` is the owning project's UUID or `null`.
 */
export interface VFolderListItem {
    name: string;
    id: string;
    quota_scope_id: string;
    host: string;
    status: string;
    usage_mode: string;
    created_at: string;
    is_owner: boolean;
    permission: string;
    user: string | null;
    group: string | null;
    creator: string;
    user_email: string | null;
    group_name: string | null;
    ownership_type: string;
    type: string;
    cloneable: boolean;
    max_files: number;
    max_size: null | number;
    cur_size: number;
}
export type MyVfolderNode = NonNullable<useSuspendedMyVFoldersQuery['response']['myVfolders']>['edges'][number]['node'];
/**
 * A `myVfolders` node as a `VFolderListItem`. `quota` / `usage` are not selected
 * (26.4.4+, and `usage` is a storage-proxy round trip); no consumer reads them.
 */
export declare const toVFolderListItem: (node: MyVfolderNode, currentUserId: string) => VFolderListItem;
/**
 * The caller's folder list behind `BAIVFolderMountConfigInput`. Suspends. One
 * cache entry, so a host deriving something from the same list (auto-mounted
 * names) shares the single fetch.
 */
export declare const useSuspendedMyVFolders: () => {
    folders: VFolderListItem[];
    refetch: (options?: import('@tanstack/react-query').RefetchOptions) => Promise<import('@tanstack/react-query').QueryObserverResult<VFolderListItem[], unknown>>;
    isFetching: boolean;
};
export interface VFolderMountScope {
    currentProjectId?: string;
    /** Hosts granting `mount-in-session`; omitted skips the host gate. */
    mountableHosts?: ReadonlyArray<string>;
}
/**
 * The gate `mount_ids` must pass server side: a host allowing
 * mount-in-session, and a folder of this project or the user's own.
 */
export declare const isMountableVFolder: (folder: VFolderListItem, { currentProjectId, mountableHosts }: VFolderMountScope) => boolean;
