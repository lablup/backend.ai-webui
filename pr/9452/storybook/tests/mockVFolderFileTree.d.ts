import { BAIClient, VFolderFile } from '../components/provider/BAIClientProvider/types';
/**
 * Directory trees keyed by vfolder UUID, then by the same path notation
 * `useSearchVFolderFiles` uses ('.' = root, 'a/b' below it).
 */
export type MockVFolderFileTrees = Record<string, Record<string, Array<VFolderFile>>>;
export declare const mockVFolderFile: (name: string, type: VFolderFile["type"], modified: string) => VFolderFile;
/**
 * A BAIClient whose `vfolder` file APIs (`list_files` / `mkdir` /
 * `rename_file` / `delete_files`) read and write the given in-memory trees,
 * so file-explorer stories browse and mutate directories without a backend.
 * The trees are mutated in place — hand a fresh copy per Storybook instance.
 */
export declare const createMockVFolderFileClient: (trees: MockVFolderFileTrees) => BAIClient;
