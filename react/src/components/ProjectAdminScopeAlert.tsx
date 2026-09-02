/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useRouteAccessDecision } from '../hooks/useRouteAccess';
import { useRouteScope } from '../hooks/useRouteScope';
import { BAIAlert, BAIAlertProps } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMatches } from 'react-router-dom';

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
  // Whenever a route-error screen owns the content area — the merged
  // invalid-project state ('defer'), the forbidden/blocked pages, or the
  // catch-all 404 (an authorized user on `/project/x/admin/bogus` is still
  // 'allowed', but UnknownRoutePage renders Page404 / a Lit plugin page,
  // not a project-admin settings page) — this page-scoped notice must not
  // appear above it.
  const decision = useRouteAccessDecision();
  const matches = useMatches();
  const isNotFoundRoute = !!(
    matches[matches.length - 1]?.handle as { notFound?: boolean } | undefined
  )?.notFound;

  if (!isProjectAdminPage || decision !== 'allowed' || isNotFoundRoute)
    return null;

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
