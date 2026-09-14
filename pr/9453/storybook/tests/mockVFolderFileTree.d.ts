import { LegacyVFolder } from '../components/baiClient/BAILegacyVFolderSelect';
import { BAIClient, VFolderFile } from '../components/provider/BAIClientProvider/types';
/**
 * Directory trees keyed by vfolder UUID, then by the same path notation
 * `useSearchVFolderFiles` uses ('.' = root, 'a/b' below it).
 */
export type MockVFolderFileTrees = Record<string, Record<string, Array<VFolderFile>>>;
export declare const mockVFolderFile: (name: string, type: VFolderFile["type"], modified: string) => VFolderFile;
/**
 * A REST `GET /folders` row with every field filled in, so a story only has
 * to name the handful that its gate or filter actually reads.
 */
export declare const mockLegacyVFolder: (folder: Pick<LegacyVFolder, "id" | "name"> & Partial<LegacyVFolder>) => LegacyVFolder;
export declare const MOCK_LEGACY_PROJECT_ID = "99999999-9999-9999-9999-999999999999";
export declare const MOCK_LEGACY_OTHER_PROJECT_ID = "88888888-8888-8888-8888-888888888888";
/** Only `local:volume1` grants `mount-in-session`, so `archive:cold` is gated out. */
export declare const MOCK_ALLOWED_VFOLDER_HOSTS: Record<string, Array<string>>;
/**
 * The shared REST folder fixture: two mountable folders, one auto-mounted
 * dotfile, one on a host without `mount-in-session`, and one owned by another
 * project — so a story exercises every gate BAILegacyVFolderSelect applies.
 */
export declare const mockLegacyVFolders: Array<LegacyVFolder>;
/**
 * A BAIClient whose `vfolder` file APIs (`list_files` / `mkdir` /
 * `rename_file` / `delete_files`) read and write the given in-memory trees,
 * and whose signed `GET /folders` request answers `folders`, so file-explorer
 * and folder-picker stories run without a backend. The trees are mutated in
 * place — hand a fresh copy per Storybook instance.
 */
export declare const createMockVFolderFileClient: (trees: MockVFolderFileTrees, folders?: Array<LegacyVFolder>) => BAIClient;
