/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { dashboardEditModeAtom } from './dashboardEditModeAtom';
import { Button } from '@lablup/ui-common/Button';
import { useAtom } from 'jotai';
import { Pencil } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Breadcrumb-bar toggle for {@link dashboardEditModeAtom}: "Edit" opens the
 * edit sider, "Close" hides it. Teleported via `breadcrumbExtraAtom`.
 */
const DashboardEditToggleButton: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const [editMode, setEditMode] = useAtom(dashboardEditModeAtom);

  return (
    <Button
      variant={editMode ? 'secondary' : 'primary'}
      size="sm"
      icon={<Pencil size="1em" />}
      label={editMode ? t('button.Close') : t('dashboard.Edit')}
      onClick={() => setEditMode((prev) => !prev)}
    />
  );
};

export default DashboardEditToggleButton;
