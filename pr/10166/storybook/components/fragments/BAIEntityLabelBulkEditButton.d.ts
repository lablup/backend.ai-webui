import { BAILabelableEntityType } from '../../hooks/useLabelableEntityTypes';
import { BAIEntityLabelSettingModalTarget } from './BAIEntityLabelSettingModal';
import { IconButtonProps } from '@lablup/ui-common/IconButton';
export interface BAIEntityLabelBulkEditButtonProps extends Omit<IconButtonProps, 'label' | 'icon' | 'onClick'> {
    entityType: BAILabelableEntityType;
    targets: ReadonlyArray<BAIEntityLabelSettingModalTarget>;
    /** Called once labels may have changed, to refetch the list. */
    onLabelsChanged?: () => void;
}
/** Adds labels to the selected rows; renders nothing when the type takes no labels. */
declare const BAIEntityLabelBulkEditButton: ({ entityType, targets, onLabelsChanged, ...iconButtonProps }: BAIEntityLabelBulkEditButtonProps) => import("react").JSX.Element | null;
export default BAIEntityLabelBulkEditButton;
