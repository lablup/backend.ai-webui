import { BAIAnyObject, BAIColumnsType } from './Table/tableTypes';
import { BulkErrorModalProps } from '@lablup/ui-common/components/BulkErrorModal';
import { ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
