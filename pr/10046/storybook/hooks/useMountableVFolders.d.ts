import { VFolderFilter, VFolderScope } from '../__generated__/useMountableVFoldersAutoMountedQuery.graphql';
export type { VFolderFilter, VFolderScope };
/** A folder the session mounts on its own, identified so it can be linked. */
export interface AutoMountedFolder {
    vfolderId: string;
    name: string;
}
export interface VFolderMountScope {
    currentProjectId?: string;
    /** Hosts granting `mount-in-session`. */
    mountableHosts: ReadonlyArray<string>;
}
/** A dotfile folder is what a session mounts without being asked. */
export declare const isAutoMountFolderName: (name: string) => boolean;
/** The caller's own folders plus the current project's, the reach a session mounts from. */
export declare const mountableVFolderScope: (userId: string, currentProjectId?: string) => VFolderScope;
/** The server-side half of the mount gate: a host granting `mount-in-session`. */
export declare const mountableVFolderFilter: (mountableHosts: ReadonlyArray<string>) => VFolderFilter;
/** The page size of every mount-folder read. */
export declare const MOUNT_FOLDER_PAGE_SIZE = 100;
/**
 * The ready dotfile folders a session in this project mounts on its own.
 * Suspends; `refetch` re-reads them after the host creates a folder.
 */
export declare const useSuspendedAutoMountedVFolders: ({ currentProjectId, mountableHosts, }: VFolderMountScope) => {
    autoMountedFolders: AutoMountedFolder[];
    refetch: (newValue?: string | undefined) => void;
};
