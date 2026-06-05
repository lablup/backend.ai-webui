/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useRouteScope } from '../hooks/useRouteScope';
import { BAIAlert, BAIAlertProps } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ProjectAdminScopeAlertProps extends BAIAlertProps {}

const ProjectAdminScopeAlert: React.FC<ProjectAdminScopeAlertProps> = (
  props,
) => {
  'use memo';
  const { t } = useTranslation();
  // Project-admin pages live under `/project/:name/admin/*`; the route handle
  // marks them with `scope: 'projectAdmin'`. Reading the scope from the matched
  // route (rather than parsing the pathname's first segment, which is now the
  // `project` prefix) is the single source of truth for this gate.
  const scope = useRouteScope();
  const isProjectAdminPage = scope === 'projectAdmin';

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
