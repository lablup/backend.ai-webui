import { MockVFolderFileTrees } from './mockVFolderFileTree';
export interface MockVFolder {
    name: string;
    row_id: string;
    /** Defaults to full read/write/delete content permissions. */
    permissions?: Array<string>;
}
export interface MockVFolderFileProvidersProps {
    vfolders: Array<MockVFolder>;
    trees: MockVFolderFileTrees | (() => MockVFolderFileTrees);
    /** Fallback for a Suspense boundary around `children`; omit to render bare. */
    suspenseFallback?: React.ReactNode;
    children?: React.ReactNode;
}
/**
 * Everything a vfolder file-browsing story needs without a backend: a mock
 * Relay environment answering `vfolder_nodes` / `vfolder_node` from
 * `vfolders`, and a mock `BAIClient` whose file APIs read and write `trees`.
 */
declare const MockVFolderFileProviders: React.FC<MockVFolderFileProvidersProps>;
export default MockVFolderFileProviders;
