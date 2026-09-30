import { BAIProjectBulkEditModalFragment$key } from '../../__generated__/BAIProjectBulkEditModalFragment.graphql';
import { BAIModalProps } from '../BAIModal';
export interface BAIProjectBulkEditModalProps extends BAIModalProps {
    selectedProjectFragments: BAIProjectBulkEditModalFragment$key;
}
declare const BAIProjectBulkEditModal: ({ selectedProjectFragments, ...tableProps }: BAIProjectBulkEditModalProps) => import("react").JSX.Element;
export default BAIProjectBulkEditModal;
