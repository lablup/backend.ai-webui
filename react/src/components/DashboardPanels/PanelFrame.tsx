/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import PanelEditControls from './PanelEditControls';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIBoardItemTitle, BAIFlex } from 'backend.ai-ui';
import React from 'react';

export interface PanelFrameProps {
  title: string;
  onEdit?: () => void;
  onRemove?: () => void;
  children: React.ReactNode;
}

/**
 * The shared custom-panel shell, matching the built-in board items: the same
 * horizontal inset, a sticky title row (with the edit/remove controls while
 * the board is in edit mode), and a scrollable body. The dashboard's own
 * refresh control refreshes it.
 */
const PanelFrame: React.FC<PanelFrameProps> = ({
  title,
  onEdit,
  onRemove,
  children,
}) => {
  'use memo';
  const { token } = useTheme();

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{ paddingInline: token('--spacing-8'), height: '100%' }}
    >
      <BAIBoardItemTitle
        title={title}
        extra={
          <PanelEditControls
            title={title}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        }
      />
      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          marginBottom: token('--spacing-4'),
        }}
      >
        {children}
      </BAIFlex>
    </BAIFlex>
  );
};

export default PanelFrame;
