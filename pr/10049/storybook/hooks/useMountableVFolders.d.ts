import { VFolderFilter, VFolderScope } from '../__generated__/useMountableVFoldersAutoMountedQuery.graphql';
export type { VFolderFilter, VFolderScope };
/** A folder the session mounts on its own, identified so it can be linked. */
export interface AutoMountedFolder {
    vfolderId: string;
    name: string;
}
export interface VFolderMountScope {
    /** The scopes a session mounts from, usually {@link mountableVFolderScope}. */
    scope: VFolderScope;
    /** Hosts granting `mount-in-session`. */
    mountableHosts: ReadonlyArray<string>;
}
/** A dotfile folder is what a session mounts without being asked. */
export declare const isAutoMountFolderName: (name: string) => boolean;
/** The caller's own folders plus the current project's, the reach a session mounts from. */
export declare const mountableVFolderScope: (userId: string, currentProjectId?: string) => VFolderScope;
/**
 * The server-side half of the mount gate: a host granting `mount-in-session`.
 * Hosts are sorted so every caller sends the same variables and shares one Relay cache entry.
 */
export declare const mountableVFolderFilter: (mountableHosts: ReadonlyArray<string>) => VFolderFilter;
/**
 * The ready dotfile folders a session in `scope` mounts on its own.
 * Suspends. Callers passing the same scope share one query, so a `refetch`
 * from any of them updates all.
 */
export declare const useSuspendedAutoMountedVFolders: ({ scope, mountableHosts, }: VFolderMountScope) => {
    autoMountedFolders: AutoMountedFolder[];
    refetch: () => void;
};
