import { LegacyVFolder } from '../components/fragments/BAIVFolderMountConfigInput';
import { MockVFolderFileTrees } from './mockVFolderFileTree';
export interface MockVFolder {
    name: string;
    row_id: string;
    /** Defaults to full read/write/delete content permissions. */
    permissions?: Array<string>;
}
export interface MockVFolderFileProvidersProps {
    vfolders?: Array<MockVFolder>;
    trees?: MockVFolderFileTrees | (() => MockVFolderFileTrees);
    /** Rows the mocked REST `GET /folders` request answers with. */
    folders?: Array<LegacyVFolder>;
    /** Fallback for a Suspense boundary around `children`; omit to render bare. */
    suspenseFallback?: React.ReactNode;
    children?: React.ReactNode;
}
/**
 * Everything a vfolder file-browsing story needs without a backend: a mock
 * Relay environment answering `vfolder_nodes` / `vfolder_node` from
 * `vfolders`, and a mock `BAIClient` whose file APIs read and write `trees`
 * and whose signed `GET /folders` request answers `folders`.
 */
declare const MockVFolderFileProviders: React.FC<MockVFolderFileProvidersProps>;
export default MockVFolderFileProviders;
