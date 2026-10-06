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
    /** Rows both `myVfolders` and the mocked REST `GET /folders` answer with. */
    folders?: Array<LegacyVFolder>;
    /** Fallback for a Suspense boundary around `children`; omit to render bare. */
    suspenseFallback?: React.ReactNode;
    children?: React.ReactNode;
}
/**
 * Everything a vfolder file-browsing story needs without a backend: a mock
 * Relay environment answering `myVfolders` from `folders` and
 * `vfolder_nodes` / the picker's `vfolderV2` from `vfolders`, and a mock
 * `BAIClient` whose file APIs read and write `trees` and whose signed
 * `GET /folders` request answers `folders`.
 */
declare const MockVFolderFileProviders: React.FC<MockVFolderFileProvidersProps>;
export default MockVFolderFileProviders;
