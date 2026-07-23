/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PROJECT_ADMIN_PAGE_KEYS } from '../hooks/useWebUIMenuItems';
import { BAIAlert, BAIAlertProps } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface ProjectAdminScopeAlertProps extends BAIAlertProps {}

const ProjectAdminScopeAlert: React.FC<ProjectAdminScopeAlertProps> = (
  props,
) => {
  const { t } = useTranslation();
  const location = useLocation();

  // PROJECT_ADMIN_PAGE_KEYS is the single source of truth for which
  // routes belong to the project-admin section. Project-admin paths
  // are mounted at `/<key>` (e.g. `/project-admin-users`), so the
  // first pathname segment is the menu key.
  const firstSegment = location.pathname.split('/')[1];
  const isProjectAdminPage = (
    PROJECT_ADMIN_PAGE_KEYS as ReadonlyArray<string>
  ).includes(firstSegment);

  if (!isProjectAdminPage) return null;

  return (
    <BAIAlert
      type="info"
      showIcon
      description={t('webui.menu.ProjectAdminScopeAlert')}
      {...props}
    />
  );
};

export default ProjectAdminScopeAlert;
