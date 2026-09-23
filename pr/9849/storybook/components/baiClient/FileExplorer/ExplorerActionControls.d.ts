import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { DeleteSelectedItemsModalProps } from './DeleteSelectedItemsModal';
import { RcFile } from './hooks';
interface ExplorerActionControlsProps {
    selectedFiles: Array<VFolderFile>;
    onRequestClose: (success: boolean, modifiedItems?: Array<VFolderFile>) => void;
    /** Hands the pick to the explorer's duplicate-aware upload path. */
    onUpload: (files: Array<RcFile>) => void;
    onDeleteFilesInBackground: DeleteSelectedItemsModalProps['onDeleteFilesInBackground'];
    onClearSelection?: () => void;
    enableDownload?: boolean;
    enableDelete?: boolean;
    enableWrite?: boolean;
    enableUpload?: boolean;
    mode?: 'explorer' | 'directoryPicker';
    onFolderCreated?: (folderName: string) => void;
    extra?: React.ReactNode;
}
declare const ExplorerActionControls: React.FC<ExplorerActionControlsProps>;
export default ExplorerActionControls;
