/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { selectBoard } from './dashboardConfig';
import type { DashboardBoardsState } from './useDashboardBoards';
import { Tab } from '@lablup/ui-common/TabList';
import { BAITabList } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface DashboardBoardTabsProps {
  boards: DashboardBoardsState;
}

/** Switches an admin dashboard's boards; the edit sider manages them. */
const DashboardBoardTabs: React.FC<DashboardBoardTabsProps> = ({ boards }) => {
  'use memo';
  const { t } = useTranslation();
  const { config, activeBoard, update } = boards;

  return (
    <BAITabList
      value={activeBoard.id}
      onChange={(id) => update((current) => selectBoard(current, id))}
      aria-label={t('dashboard.boards.Boards')}
    >
      {config.boards.map((board) => (
        <Tab
          key={board.id}
          value={board.id}
          label={board.title || t('dashboard.boards.DefaultBoard')}
        />
      ))}
    </BAITabList>
  );
};

export default DashboardBoardTabs;
