import { BAITableProps } from '../../Table';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { RcFile } from './hooks';
export declare const FolderInfoContext: import('../../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react').Context<{
    targetVFolderId: string;
    targetVFolderName: string;
    currentPath: string;
}>;
export interface BAIFileExplorerRef {
    refetch: () => void;
}
export interface BAIFileExplorerProps {
    targetVFolderId: string;
    targetVFolderName?: string;
    fetchKey?: string;
    mode?: 'explorer' | 'directoryPicker';
    defaultPath?: string;
    onChangeCurrentPath?: (currentPath: string) => void;
    onUpload?: (files: Array<RcFile>, currentPath: string) => void;
    tableProps?: Partial<BAITableProps<VFolderFile>>;
    style?: React.CSSProperties;
    fileDropContainerRef?: React.RefObject<HTMLDivElement | null>;
    enableDownload?: boolean;
    enableDelete?: boolean;
    enableWrite?: boolean;
    enableCreate?: boolean;
    enableRename?: boolean;
    enableUpload?: boolean;
    enableEdit?: boolean;
    onChangeFetchKey?: (fetchKey: string) => void;
    ref?: React.Ref<BAIFileExplorerRef>;
    onDeleteFilesInBackground?: (bgTaskId: string, targetVFolderId: string, deletingFilePaths: Array<string>) => void;
    deletingFilePaths?: Array<string>;
    onClickEditFile?: (file: VFolderFile, currentPath: string) => void;
}
declare const BAIFileExplorer: React.FC<BAIFileExplorerProps>;
export default BAIFileExplorer;
