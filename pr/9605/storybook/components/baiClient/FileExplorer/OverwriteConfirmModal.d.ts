import { BAIModalProps } from '../../BAIModal';
import { DuplicatedUploadEntry } from './hooks';
export interface OverwriteConfirmModalProps extends BAIModalProps {
    duplicatedEntries: Array<DuplicatedUploadEntry>;
    /** Entries in the same pick whose names are free. */
    newEntryCount: number;
    onRequestClose: (success: boolean, overwritingNames?: Array<string>) => void;
}
declare const OverwriteConfirmModal: React.FC<OverwriteConfirmModalProps>;
export default OverwriteConfirmModal;
