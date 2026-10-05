import { BAITableProps } from '../../Table';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { RcFile } from './hooks';
export declare const FolderInfoContext: import('../../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react').Context<{
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
