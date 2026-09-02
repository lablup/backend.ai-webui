/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import PanelEditControls from './PanelEditControls';
import { useTheme } from '@astryxdesign/core/theme';
import {
  BAIBoardItemTitle,
  BAIFetchKeyButton,
  BAIFlex,
  useFetchKey,
} from 'backend.ai-ui';
import React, { useTransition } from 'react';

export interface PanelFrameProps {
  title: string;
  onEdit?: () => void;
  onRemove?: () => void;
  /**
   * Body, given a panel-local refresh key that changes when the panel's own
   * refresh button is pressed. Combine it with the board's `fetchKey`.
   */
  children: (localFetchKey: string) => React.ReactNode;
}

/**
 * The shared custom-panel shell, matching the built-in board items: the same
 * horizontal inset, a sticky title row carrying the refresh button (plus the
 * edit/remove controls while the board is in edit mode), and a scrollable body.
 */
const PanelFrame: React.FC<PanelFrameProps> = ({
  title,
  onEdit,
  onRemove,
  children,
}) => {
  'use memo';
  const { token } = useTheme();
  const [localFetchKey, updateLocalFetchKey] = useFetchKey();
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{ paddingInline: token('--spacing-8'), height: '100%' }}
    >
      <BAIBoardItemTitle
        title={title}
        extra={
          <BAIFlex align="center" gap="xxs">
            <BAIFetchKeyButton
              size="small"
              loading={isPendingRefetch}
              value=""
              onChange={() => {
                startRefetchTransition(() => {
                  updateLocalFetchKey();
                });
              }}
              type="text"
              style={{ backgroundColor: 'transparent' }}
            />
            <PanelEditControls
              title={title}
              onEdit={onEdit}
              onRemove={onRemove}
            />
          </BAIFlex>
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
        {children(localFetchKey)}
      </BAIFlex>
    </BAIFlex>
  );
};

export default PanelFrame;
