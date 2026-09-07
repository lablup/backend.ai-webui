import { LegacyVFolder } from '../components/baiClient/BAILegacyVFolderSelect';
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
    /**
     * `allowed_vfolder_hosts`, answered identically for the domain, the group
     * and the keypair resource policy. A host without `mount-in-session` is how
     * a story shows BAILegacyVFolderSelect's gate dropping a folder.
     */
    allowedVFolderHosts?: Record<string, Array<string>>;
    /** Fallback for a Suspense boundary around `children`; omit to render bare. */
    suspenseFallback?: React.ReactNode;
    children?: React.ReactNode;
}
/**
 * Everything a vfolder file-browsing story needs without a backend: a mock
 * Relay environment answering `vfolder_nodes` / `vfolder_node` from
 * `vfolders` and the allowed-hosts query from `allowedVFolderHosts`, and a
 * mock `BAIClient` whose file APIs read and write `trees` and whose signed
 * `GET /folders` request answers `folders`.
 */
declare const MockVFolderFileProviders: React.FC<MockVFolderFileProvidersProps>;
export default MockVFolderFileProviders;
