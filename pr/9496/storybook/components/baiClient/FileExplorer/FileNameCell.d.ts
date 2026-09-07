import { VFolderFile } from '../../provider/BAIClientProvider/types';
interface FileNameCellProps {
    selectedItem: VFolderFile;
    existingFiles: Array<VFolderFile>;
    onClickName: (e: React.MouseEvent) => void;
    onEndRename: () => void;
    onClickDelete: () => void;
    onClickEdit?: () => void;
    enableRename?: boolean;
    enableDownload?: boolean;
    enableDelete?: boolean;
    enableEdit?: boolean;
    isPendingDelete?: boolean;
}
declare const FileNameCell: React.FC<FileNameCellProps>;
export default FileNameCell;
