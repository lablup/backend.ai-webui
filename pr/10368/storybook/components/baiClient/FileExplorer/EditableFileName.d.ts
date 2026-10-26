import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { default as React } from '../../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface EditableFileNameProps {
    fileInfo: VFolderFile;
    existingFiles: Array<VFolderFile>;
    onEndEdit?: () => void;
    onStartEdit?: () => void;
    disabled?: boolean;
    style?: React.CSSProperties;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
}
declare const EditableFileName: React.FC<EditableFileNameProps>;
export default EditableFileName;
