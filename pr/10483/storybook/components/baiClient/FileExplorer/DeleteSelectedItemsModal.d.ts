import { BAIModalProps } from '../../BAIModal';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
export interface DeleteSelectedItemsModalProps extends BAIModalProps {
    onRequestClose: (success: boolean, deletingFilePaths?: Array<string>) => void;
    onDeleteFilesInBackground?: (bgTaskId: string, targetVFolderId: string, deletingFilePaths: Array<string>) => void;
    selectedFiles: Array<VFolderFile>;
}
declare const DeleteSelectedItemsModal: React.FC<DeleteSelectedItemsModalProps>;
export default DeleteSelectedItemsModal;
