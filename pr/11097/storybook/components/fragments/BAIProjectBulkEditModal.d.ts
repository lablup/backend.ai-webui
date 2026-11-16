import { BAIProjectBulkEditModalFragment$key } from '../../__generated__/BAIProjectBulkEditModalFragment.graphql';
import { BAIModalProps } from '../BAIModal';
/** One project the bulk update did not apply to. `id` is the `GroupNode` id. */
export interface BAIProjectBulkEditFailure {
    id: string;
    name: string;
    message: string;
}
/** Per-project outcome of one save; ids are `GroupNode` ids. */
export interface BAIProjectBulkEditResult {
    succeededIds: string[];
    failures: BAIProjectBulkEditFailure[];
}
export interface BAIProjectBulkEditModalProps extends Omit<BAIModalProps, 'onOk'> {
    selectedProjectFragments: BAIProjectBulkEditModalFragment$key;
    /** Called once the request settles; a rejected request fails every project. */
    onCompleted?: (result: BAIProjectBulkEditResult) => void;
}
declare const BAIProjectBulkEditModal: ({ selectedProjectFragments, onCompleted, ...modalProps }: BAIProjectBulkEditModalProps) => import("react").JSX.Element;
export default BAIProjectBulkEditModal;
