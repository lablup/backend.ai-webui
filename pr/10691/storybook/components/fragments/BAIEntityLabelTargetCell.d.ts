import { BAILabelableEntityType } from '../../hooks/useLabelableEntityTypes';
import { BAIEntityLabelCellProps } from './BAIEntityLabelCell';
export interface BAIEntityLabelTargetCellProps extends Pick<BAIEntityLabelCellProps, 'editDisabledReason' | 'onLabelClick'> {
    entityType: BAILabelableEntityType;
    /** The entity's UUID (`entityId`), not its Relay global id. */
    entityId: string;
    /** Names the entity in the editor's failure list; falls back to `entityId`. */
    name?: string;
    /** Shows the labels without the "Edit labels" action. */
    readOnly?: boolean;
}
/**
 * A Labels row for a detail surface whose entity type carries no `entityLabels`
 * field: loads the labels by entity target and refreshes them after an edit.
 */
declare const BAIEntityLabelTargetCell: (props: BAIEntityLabelTargetCellProps) => import("react").JSX.Element;
export default BAIEntityLabelTargetCell;
