import { BAIModalProps } from './BAIModal';
import { BAIColumnsType } from './Table';
import { ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * to-astryx phase 3 / ticket B: was `import type { AnyObject } from
 * 'antd/es/_util/type'` — a direct antd import for a two-line structural type.
 * Inlined verbatim (antd's own definition) so the modal family carries no antd
 * specifier of its own.
 */
type AnyObject = Record<PropertyKey, any>;
export interface BAIBulkErrorModalProps<RecordType = AnyObject> extends Omit<BAIModalProps, 'children' | 'onOk' | 'onCancel' | 'footer' | 'type'> {
    /**
     * Column definitions for the failed-request table. Every bulk operation has
     * its own response shape, so the caller describes how one failed request is
     * rendered per row instead of this component hardcoding the columns.
     */
    columns: BAIColumnsType<RecordType>;
    /**
     * One record per failed request. Each record must carry a unique `key`
     * field — the table relies on antd's default row key resolution.
     */
    dataSource: RecordType[];
    /**
     * Optional guidance rendered as the body of a `BAIAlert` above the table
     * (e.g. how to retry), under a fixed localized "Error Occurred" alert
     * title. No default — the caller injects operation-specific copy. Any
     * `ReactNode` works (the underlying antd `Alert.description` accepts one).
     */
    alertDescription?: ReactNode;
    /** Called when the user dismisses the modal (header X, mask, Esc). */
    onRequestClose: () => void;
}
/**
 * Shared modal that surfaces per-request errors of a bulk operation in a
 * table — one row per failed request (FR-3334). Purely informational: it has
 * no footer — dismissal happens through the header X (or mask / Esc) and is
 * reported through the `onRequestClose` convention so the caller decides what
 * happens next (typically keeping its own form open for a retry).
 *
 * The title defaults to a localized "Action execution failed" with an error
 * icon; pass `title` to replace it verbatim with operation-specific copy.
 */
declare const BAIBulkErrorModal: <RecordType extends AnyObject = AnyObject>({ columns, dataSource, alertDescription, onRequestClose, title, ...baiModalProps }: BAIBulkErrorModalProps<RecordType>) => import("react").JSX.Element;
export default BAIBulkErrorModal;
