/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { buildPath } from '../../helper/pathBuilder';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../../hooks';
import {
  useCurrentProjectValue,
  useSetCurrentProject,
} from '../../hooks/useCurrentProject';
import { getRouteScopeAndKey } from '../../hooks/useRouteScope';
import ProjectScopeErrorState from './ProjectScopeErrorState';
import { Button } from 'antd';
import { ArrowRightIcon } from 'lucide-react';
import React, { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useParams } from 'react-router-dom';

interface BackendAIClientGroups {
  groups?: string[];
  groupIds?: Record<string, string>;
}

/**
 * Layout element for the `/project/:projectName/*` subtree (project + project
 * admin scopes). It keeps the URL `:projectName` and the existing
 * `currentProjectAtom` in sync, and guards against invalid / inaccessible
 * project names.
 *
 * Resolution (render-time, no setState):
 *   - `id = baiClient.groupIds[name]` (name -> uuid)
 *   - membership = `baiClient.groups.includes(name)`
 *
 * If the URL project name is invalid (not a member, or no resolvable id), the
 * layout does NOT silently switch to another project — the name is just a name
 * and may legitimately be missing or access-restricted (stale bookmark, shared
 * link to a project the user cannot access, renamed/deleted project). Instead it
 * renders an explicit "not found / no access" guidance:
 *   - if the user has NO groups at all, the "no accessible projects" guidance.
 *   - otherwise a "project not found or no access" notice, keeping the header
 *     project selector available and offering a button that navigates to one of
 *     the user's own projects on an explicit click.
 *
 * Sync (effect-only, idempotent):
 *   - `setCurrentProject({ projectName, projectId })` runs in an effect keyed on
 *     `[projectName]`, guarded so it only fires when the atom name differs from
 *     the URL name. The body is wrapped in `useEffectEvent` so it reads the
 *     latest resolved id / current value without widening the dep array (repo
 *     convention `use-effect-event.md`).
 */
const ProjectScopeLayout: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { projectName: rawProjectName } = useParams<{ projectName: string }>();
  const location = useLocation();
  const currentProject = useCurrentProjectValue();
  const setCurrentProject = useSetCurrentProject();
  const webuiNavigate = useWebUINavigate();

  // `useParams` already decodes percent-encoding; treat a missing param as ''.
  const projectName = rawProjectName ?? '';

  const clientGroups = baiClient as unknown as BackendAIClientGroups;
  const groups = clientGroups.groups ?? [];
  const groupIds = clientGroups.groupIds ?? {};

  const isMember = groups.includes(projectName);
  const resolvedId = groupIds[projectName];
  const isValid = isMember && !!resolvedId;

  // Effect-event reads the latest resolved id / current value; the surrounding
  // effect only re-synchronizes when the URL project name changes.
  const syncProject = useEffectEvent(() => {
    if (!isValid) {
      return;
    }
    if (currentProject.name !== projectName) {
      setCurrentProject({ projectName, projectId: resolvedId });
    }
  });

  useEffect(() => {
    syncProject();
  }, [projectName]);

  if (!isValid) {
    // No groups at all: the user belongs to no project. Render a terminal
    // "no accessible projects" status.
    if (groups.length === 0) {
      return <ProjectScopeErrorState variant="no-projects" />;
    }

    // Invalid / inaccessible project name while the user DOES have other
    // projects: do NOT silently switch to an arbitrary project (the name is
    // just a name — it may not exist or be access-restricted). Render an
    // explicit "not found / no access" status. The header project selector
    // shows no selection for this invalid project, and a convenience button
    // navigates to one of the user's own projects on an explicit click.
    const ownProject =
      currentProject.name && groups.includes(currentProject.name)
        ? currentProject.name
        : groups[0];
    return (
      <ProjectScopeErrorState
        variant="not-found"
        projectName={projectName}
        featureKey={getRouteScopeAndKey(location.pathname).featureKey}
        extra={
          <Button
            type="primary"
            size="large"
            icon={<ArrowRightIcon size="1em" />}
            iconPosition="end"
            onClick={() =>
              webuiNavigate(buildPath('project', 'session', ownProject))
            }
          >
            {t('projectSelect.GoToProject', { project: ownProject })}
          </Button>
        }
      />
    );
  }

  return <Outlet />;
};

export default ProjectScopeLayout;
