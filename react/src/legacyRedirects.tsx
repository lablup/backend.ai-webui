/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Backward-compatibility redirect shims for the scope-aware routing scheme.
 *
 * Old, project-less URLs (`/session`, `/deployments/:id`, `/admin-session`,
 * `/project-data`, `/credential`, ...) keep working by redirecting (`replace`)
 * to their new canonical paths. This protects deep links, bookmarks, and the
 * external `react-navigate` event that Lit / electron shells dispatch.
 *
 * Two flavours:
 *   - Class A (static): admin / system paths that do NOT need a runtime project
 *     (e.g. `/admin-session -> /admin/session`).
 *   - Class B (runtime project): user & project-admin paths that must inject the
 *     current project NAME into the target (e.g. `/session ->
 *     /project/<cur>/session`). The current project is read from the atom via
 *     `useActiveProjectName()`. When no project is resolvable, the shim renders
 *     a terminal "no accessible projects" guidance instead of redirecting:
 *     redirecting to a project-scoped path (e.g. `/start`, itself a Class B shim)
 *     would bounce back here and loop.
 *
 * All shims preserve `location.search`. The factories that handle detail routes
 * read the dynamic param (`:deploymentId` / `:serviceId` / `:presetId` /
 * `:artifactId`) and forward it.
 */
import WebUINavigate from './components/WebUINavigate';
import { buildPath, RouteScope, FeatureKey } from './helper/pathBuilder';
import { useActiveProjectName } from './hooks/useRouteScope';
import { BAIAlert, BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';

/**
 * Builds the trailing segment(s) after the feature key from the matched dynamic
 * params, e.g. `:deploymentId` -> `/<id>`. Returns '' when no param is present.
 */
const useDetailSuffix = (
  paramName?: string,
): { suffix: string; missing: boolean } => {
  'use memo';
  const params = useParams();
  if (!paramName) {
    return { suffix: '', missing: false };
  }
  const value = params[paramName];
  if (!value) {
    return { suffix: '', missing: true };
  }
  return { suffix: `/${value}`, missing: false };
};

interface LegacyRedirectOptions {
  /** Append a fixed sub-path after the feature key (e.g. 'start', 'deployment-presets/new'). */
  subPath?: string;
  /**
   * Read a dynamic route param and append it after the feature key
   * (e.g. 'deploymentId' -> `/<deploymentId>`). Mutually exclusive with
   * `subPath`.
   */
  param?: string;
}

/**
 * Class A — static admin redirect. Produces a `<WebUINavigate>` to the
 * scope-aware admin path for `featureKey`, preserving search and any
 * configured sub-path / dynamic param. No project is required.
 */
export const AdminRedirect: React.FC<{
  featureKey: FeatureKey;
  options?: LegacyRedirectOptions;
}> = ({ featureKey, options }) => {
  'use memo';
  const location = useLocation();
  const { suffix } = useDetailSuffix(options?.param);
  const tail = options?.subPath ? `/${options.subPath}` : suffix;
  const target = buildPath('admin', featureKey) + tail + location.search;
  return <WebUINavigate to={target} replace />;
};

/**
 * Class B — runtime project-scoped redirect. Injects the current project NAME
 * and produces a `<WebUINavigate>` to the scope-aware (`project` /
 * `projectAdmin`) path. Falls back to `/start` when no project is resolvable.
 */
export const ProjectScopedRedirect: React.FC<{
  scope: Extract<RouteScope, 'project' | 'projectAdmin'>;
  featureKey: FeatureKey;
  options?: LegacyRedirectOptions;
}> = ({ scope, featureKey, options }) => {
  'use memo';
  const { t } = useTranslation();
  const location = useLocation();
  const projectName = useActiveProjectName();
  const { suffix } = useDetailSuffix(options?.param);

  if (!projectName) {
    // No resolvable project (user belongs to no project). Render the same
    // "no accessible projects" guidance as ProjectScopeLayout. Redirecting to a
    // project-scoped path (e.g. `/start`, itself a Class B shim) would bounce
    // back here and loop, so this branch is terminal.
    return (
      <BAIFlex direction="column" align="stretch" style={{ width: '100%' }}>
        <BAIAlert
          type="warning"
          showIcon
          description={t('projectSelect.NoAccessibleProjects')}
        />
      </BAIFlex>
    );
  }

  const tail = options?.subPath ? `/${options.subPath}` : suffix;
  const target =
    buildPath(scope, featureKey, projectName) + tail + location.search;
  return <WebUINavigate to={target} replace />;
};
