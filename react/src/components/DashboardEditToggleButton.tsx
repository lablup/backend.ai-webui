/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { dashboardEditModeAtom } from './dashboardEditModeAtom';
import { Button } from '@lablup/ui-common/Button';
import { useAtom } from 'jotai';
import { SquarePenIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * The dashboard bar's toggle for {@link dashboardEditModeAtom}: "Edit" opens
 * the edit sider, "Close" hides it. Sized like the refresh control beside it.
 */
const DashboardEditToggleButton: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const [editMode, setEditMode] = useAtom(dashboardEditModeAtom);

  return (
    <Button
      variant="secondary"
      icon={<SquarePenIcon size="1em" />}
      label={editMode ? t('button.Close') : t('dashboard.Edit')}
      onClick={() => setEditMode((prev) => !prev)}
      data-testid="dashboard-edit-toggle"
    />
  );
};

export default DashboardEditToggleButton;
