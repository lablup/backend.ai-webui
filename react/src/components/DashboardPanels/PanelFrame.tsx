/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import PanelEditControls from './PanelEditControls';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIBoardItemTitle,
  BAIFetchKeyButton,
  BAIFlex,
  useFetchKey,
  useIsInBAIBoardItem,
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
 * The shared custom-panel shell, matching the built-in board items: a sticky
 * title row carrying the refresh button (plus the edit/remove controls while
 * the board is in edit mode) and a scrollable body. On a board the board pads
 * both; elsewhere (the panel modal's preview) the frame insets itself.
 */
const PanelFrame: React.FC<PanelFrameProps> = ({
  title,
  onEdit,
  onRemove,
  children,
}) => {
  'use memo';
  const { token } = useTheme();
  const isInBoard = useIsInBAIBoardItem();
  const [localFetchKey, updateLocalFetchKey] = useFetchKey();
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        height: '100%',
        ...(isInBoard ? {} : { paddingInline: token('--spacing-8') }),
      }}
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
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          ...(isInBoard ? {} : { marginBottom: token('--spacing-4') }),
        }}
      >
        {children(localFetchKey)}
      </BAIFlex>
    </BAIFlex>
  );
};

export default PanelFrame;
