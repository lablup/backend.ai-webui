import { BAIEntityLabelTokensFragment$key } from '../../__generated__/BAIEntityLabelTokensFragment.graphql';
import { BAIEntityLabel } from './BAIEntityLabelTokens';
export interface BAIEntityLabelCellProps {
    entityLabelsFrgmt: BAIEntityLabelTokensFragment$key | null | undefined;
    /** Opens the label editor; omit to show the labels read-only. */
    onEdit?: () => void;
    /** Disables the edit action with this reason, e.g. without update permission. */
    editDisabledReason?: string;
    onLabelClick?: (label: BAIEntityLabel) => void;
}
/** A table cell showing an entity's labels, with "Edit labels" as a hover action. */
declare const BAIEntityLabelCell: ({ entityLabelsFrgmt, onEdit, editDisabledReason, onLabelClick, }: BAIEntityLabelCellProps) => import("react").JSX.Element;
export default BAIEntityLabelCell;
