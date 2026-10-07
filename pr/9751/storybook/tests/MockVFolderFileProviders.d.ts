import { LegacyVFolder } from '../components/fragments/BAIVFolderMountConfigInput';
import { MockVFolderFileTrees } from './mockVFolderFileTree';
export interface MockVFolder {
    name: string;
    row_id: string;
    /** `VFolder.permissions` bits; defaults to read, write and delete. */
    permissions?: Array<string>;
}
export interface MockVFolderFileProvidersProps {
    vfolders?: Array<MockVFolder>;
    trees?: MockVFolderFileTrees | (() => MockVFolderFileTrees);
    /** Rows `vfolder_nodes` answers with, in the shape the mount select reads. */
    folders?: Array<LegacyVFolder>;
    /** Fallback for a Suspense boundary around `children`; omit to render bare. */
    suspenseFallback?: React.ReactNode;
    children?: React.ReactNode;
}
/**
 * Everything a vfolder file-browsing story needs without a backend: a mock
 * Relay environment answering `vfolder_nodes` / the picker's `vfolderV2` from
 * `vfolders`, and a mock `BAIClient` whose file APIs read and write `trees`.
 */
declare const MockVFolderFileProviders: React.FC<MockVFolderFileProvidersProps>;
export default MockVFolderFileProviders;
