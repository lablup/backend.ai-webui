import { BAIEntityLabelTokensFragment$key } from '../../__generated__/BAIEntityLabelTokensFragment.graphql';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAINameActionCell from '../Table/BAINameActionCell';
import BAIEntityLabelTokens, {
  type BAIEntityLabel,
} from './BAIEntityLabelTokens';
import { TagsIcon } from 'lucide-react';

export interface BAIEntityLabelCellProps {
  entityLabelsFrgmt: BAIEntityLabelTokensFragment$key | null | undefined;
  /** Opens the label editor; omit to show the labels read-only. */
  onEdit?: () => void;
  /** Disables the edit action with this reason, e.g. without update permission. */
  editDisabledReason?: string;
  onLabelClick?: (label: BAIEntityLabel) => void;
}

/** A table cell showing an entity's labels, with "Edit labels" as a hover action. */
const BAIEntityLabelCell = ({
  entityLabelsFrgmt,
  onEdit,
  editDisabledReason,
  onLabelClick,
}: BAIEntityLabelCellProps) => {
  'use memo';
  const { t } = useBAIi18n();
  return (
    <BAINameActionCell
      title={
        <BAIEntityLabelTokens
          entityLabelsFrgmt={entityLabelsFrgmt}
          onLabelClick={onLabelClick}
          stopRowClick
          fallback="-"
        />
      }
      actions={
        onEdit
          ? [
              {
                key: 'edit-labels',
                title: t('comp:BAIEntityLabelCell.EditLabels'),
                icon: <TagsIcon />,
                disabled: editDisabledReason
                  ? { reason: editDisabledReason }
                  : false,
                onClick: onEdit,
              },
            ]
          : []
      }
    />
  );
};

export default BAIEntityLabelCell;
