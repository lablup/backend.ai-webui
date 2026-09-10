import { BAIColumnsType } from './tableTypes';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAITableColumnCSVExportModalProps<T = unknown> {
    open: boolean;
    /** `true` when an export actually ran, `false` on cancel / dismiss. */
    onRequestClose?: (success: boolean) => void;
    onExport: (selectedExportKeys: string[]) => Promise<void>;
    supportedFields: string[];
    columns: BAIColumnsType<T>;
}
declare const BAITableColumnCSVExportModal: <T>({ open, onRequestClose, onExport, supportedFields, columns, }: BAITableColumnCSVExportModalProps<T>) => React.JSX.Element | null;
export default BAITableColumnCSVExportModal;
