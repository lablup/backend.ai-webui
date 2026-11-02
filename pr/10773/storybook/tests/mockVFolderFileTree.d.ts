import { BAIClient, VFolderFile } from '../components/provider/BAIClientProvider/types';
/**
 * Directory trees keyed by vfolder UUID, then by the same path notation
 * `useSearchVFolderFiles` uses ('.' = root, 'a/b' below it).
 */
export type MockVFolderFileTrees = Record<string, Record<string, Array<VFolderFile>>>;
export declare const mockVFolderFile: (name: string, type: VFolderFile["type"], modified: string) => VFolderFile;
/** A folder as the mount-folder queries return it, flattened for fixtures. */
export interface MockMountFolder {
    /** The vfolder UUID. */
    id: string;
    name: string;
    host: string;
    status: string;
    usageMode: string;
    /** The caller's mount level: READ_ONLY, READ_WRITE, RW_DELETE or NONE. */
    permission: string;
    ownershipType: 'USER' | 'GROUP';
    projectId: string | null;
    creatorEmail: string | null;
    createdAt: string;
}
/**
 * A mount folder with every field filled in, so a story only has to name the
 * handful that its gate or filter actually reads.
 */
export declare const mockMountFolder: (folder: Pick<MockMountFolder, "id" | "name"> & Partial<MockMountFolder>) => MockMountFolder;
export declare const MOCK_PROJECT_ID = "99999999-9999-9999-9999-999999999999";
/** The scope a session in MOCK_PROJECT_ID mounts from. */
export declare const MOCK_MOUNT_SCOPE: {
    user: {
        value: string;
    }[];
    project: {
        value: string;
    }[];
};
/** Only `local:volume1` grants `mount-in-session`, so `archive:cold` is gated out. */
export declare const MOCK_MOUNTABLE_HOSTS: Array<string>;
/**
 * The shared folder fixture: two mountable folders, one auto-mounted dotfile,
 * one on a host without `mount-in-session`, and one owned by another project,
 * so a story exercises every gate the mount config input applies.
 */
export declare const mockMountFolders: Array<MockMountFolder>;
/**
 * A BAIClient whose `vfolder` file APIs (`list_files` / `mkdir` /
 * `rename_file` / `delete_files`) read and write the given in-memory trees,
 * so file-explorer and folder-picker stories run without a backend. The trees are mutated in
 * place — hand a fresh copy per Storybook instance.
 */
export declare const createMockVFolderFileClient: (trees: MockVFolderFileTrees) => BAIClient;
