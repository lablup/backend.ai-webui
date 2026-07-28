/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { dashboardEditModeAtom } from './dashboardEditModeAtom';
import { EditOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useAtom } from 'jotai';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Breadcrumb-bar control that toggles the dashboard's edit mode
 * ({@link dashboardEditModeAtom}). Locked by default: the label reads "Edit" and
 * clicking it enters edit mode (which unlocks drag/resize of the board items);
 * while editing the label reads "Close" and clicking it exits. Teleported into
 * the breadcrumb right slot via `breadcrumbExtraAtom` from `DashboardPage`.
 */
const DashboardEditToggleButton: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const [editMode, setEditMode] = useAtom(dashboardEditModeAtom);

  return (
    <Button
      type={editMode ? 'default' : 'primary'}
      size="small"
      icon={<EditOutlined />}
      onClick={() => setEditMode((prev) => !prev)}
    >
      {editMode ? t('button.Close') : t('button.Edit')}
    </Button>
  );
};

export default DashboardEditToggleButton;
