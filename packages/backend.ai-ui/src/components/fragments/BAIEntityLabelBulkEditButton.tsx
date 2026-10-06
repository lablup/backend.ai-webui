import { useBAIi18n } from '../../hooks/useBAIi18n';
import {
  useIsLabelableEntityType,
  type BAILabelableEntityType,
} from '../../hooks/useLabelableEntityTypes';
import BAIEntityLabelSettingModal, {
  type BAIEntityLabelSettingModalTarget,
} from './BAIEntityLabelSettingModal';
import { IconButton, type IconButtonProps } from '@lablup/ui-common/IconButton';
import { TagsIcon } from 'lucide-react';
import { useState } from 'react';

export interface BAIEntityLabelBulkEditButtonProps extends Omit<
  IconButtonProps,
  'label' | 'icon' | 'onClick'
> {
  entityType: BAILabelableEntityType;
  targets: ReadonlyArray<BAIEntityLabelSettingModalTarget>;
  /** Called once labels may have changed, to refetch the list. */
  onLabelsChanged?: () => void;
}

/** Adds labels to the selected rows; renders nothing when the type takes no labels. */
const BAIEntityLabelBulkEditButton = ({
  entityType,
  targets,
  onLabelsChanged,
  ...iconButtonProps
}: BAIEntityLabelBulkEditButtonProps) => {
  'use memo';
  const { t } = useBAIi18n();
  const isLabelable = useIsLabelableEntityType(entityType);
  const [isOpen, setIsOpen] = useState(false);

  if (!isLabelable) return null;

  return (
    <>
      <IconButton
        variant="ghost"
        tooltip={t('comp:BAIEntityLabelBulkEditButton.AddLabels')}
        {...iconButtonProps}
        label={t('comp:BAIEntityLabelBulkEditButton.AddLabels')}
        icon={<TagsIcon />}
        onClick={() => setIsOpen(true)}
      />
      <BAIEntityLabelSettingModal
        open={isOpen}
        mode="add"
        entityType={entityType}
        targets={targets}
        onRequestClose={(success) => {
          setIsOpen(false);
          if (success) onLabelsChanged?.();
        }}
      />
    </>
  );
};

export default BAIEntityLabelBulkEditButton;
