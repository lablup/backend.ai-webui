import { BAIModalProps } from '../../BAIModal';
import { default as React } from '../../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
interface CreateDirectoryModalProps extends BAIModalProps {
    onRequestClose: (success: boolean, createdFolderName?: string) => void;
}
declare const CreateDirectoryModal: React.FC<CreateDirectoryModalProps>;
export default CreateDirectoryModal;
