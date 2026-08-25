/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { dashboardEditModeAtom } from '../dashboardEditModeAtom';
import { IconButton } from '@astryxdesign/core/IconButton';
import { BAIFlex, BAIPopconfirm } from 'backend.ai-ui';
import { useAtomValue } from 'jotai';
import { SquarePenIcon, Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface PanelEditControlsProps {
  /** Panel title, used in the remove-confirm copy. */
  title: string;
  onEdit?: () => void;
  onRemove?: () => void;
}

/**
 * The per-panel edit affordances (pencil = open the panel modal pre-filled,
 * trash = remove with confirm). Rendered in the board-item title's extra slot,
 * visible only while the board is in edit mode.
 */
const PanelEditControls: React.FC<PanelEditControlsProps> = ({
  title,
  onEdit,
  onRemove,
}) => {
  'use memo';
  const { t } = useTranslation();
  const editMode = useAtomValue(dashboardEditModeAtom);

  if (!editMode || (!onEdit && !onRemove)) return null;
  return (
    <BAIFlex align="center" gap="xxs">
      {onEdit ? (
        <IconButton
          variant="ghost"
          size="sm"
          label={t('button.Edit')}
          tooltip={t('button.Edit')}
          icon={<SquarePenIcon size="1em" />}
          onClick={onEdit}
        />
      ) : null}
      {onRemove ? (
        <BAIPopconfirm
          title={t('dialog.ask.DoYouWantToDeleteSomething', { name: title })}
          isDanger
          onConfirm={onRemove}
        >
          <IconButton
            variant="ghost"
            size="sm"
            label={t('button.Delete')}
            tooltip={t('button.Delete')}
            icon={<Trash2 size="1em" />}
          />
        </BAIPopconfirm>
      ) : null}
    </BAIFlex>
  );
};

export default PanelEditControls;
