import { BAIAnyObject, BAIColumnsType } from './Table/tableTypes';
import { BulkErrorModalProps } from '@lablup/ui-common/components/BulkErrorModal';
import { ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIBulkErrorModalProps<RecordType = BAIAnyObject> extends Omit<BulkErrorModalProps<RecordType & object>, 'isOpen' | 'onOpenChange' | 'columns' | 'data' | 'description'> {
    open?: boolean;
    /** How one failed request renders, per column. */
    columns: BAIColumnsType<RecordType>;
    /** One record per failed request, each with a unique `key` (or `id`). */
    dataSource: RecordType[];
    /** Retry guidance in an error alert above the table. */
    alertDescription?: ReactNode;
    /** Called when the user dismisses the modal (header X, mask, Esc). */
    onRequestClose: () => void;
}
declare const BAIBulkErrorModal: <RecordType extends BAIAnyObject = BAIAnyObject>({ open, columns, dataSource, alertDescription, onRequestClose, headerClassName, ...modalProps }: BAIBulkErrorModalProps<RecordType>) => import("react").JSX.Element;
export default BAIBulkErrorModal;
