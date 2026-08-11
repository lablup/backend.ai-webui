/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { buildPath } from '../../helper/pathBuilder';
import { useWebUINavigate } from '../../hooks';
import {
  useCurrentProjectValue,
  useSetCurrentProject,
} from '../../hooks/useCurrentProject';
import { getRouteScopeAndKey } from '../../hooks/useRouteScope';
import { useUrlProjectValidity } from '../../hooks/useUrlProjectValidity';
import ProjectScopeErrorState from './ProjectScopeErrorState';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { ArrowRightIcon } from 'lucide-react';
import React, { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';

/**
 * Layout element for the `/project/:projectName/*` subtree (project + project
 * admin scopes). It keeps the URL `:projectName` and the existing
 * `currentProjectAtom` in sync, and guards against invalid / inaccessible
 * project names.
 *
 * Resolution (render-time, no setState):
 *   - name -> id and membership both come from `useUrlProjectValidity`, which
 *     reads the same accessible-project list the header's `ProjectSelect`
 *     renders (`useAccessibleProjects`, FR-3388).
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
  const location = useLocation();
  const currentProject = useCurrentProjectValue();
  const setCurrentProject = useSetCurrentProject();
  const webuiNavigate = useWebUINavigate();

  // Shared URL-project validation (also consulted by PageAccessGuard and
  // ProjectAdminScopeAlert so all three agree on "this project doesn't
  // resolve"). The param is already percent-decoded by react-router.
  const { urlProjectName, isInvalid, resolvedId, groups } =
    useUrlProjectValidity();
  const projectName = urlProjectName ?? '';
  const isValid = !!urlProjectName && !isInvalid;

  // Effect-event reads the latest resolved id / current value; the surrounding
  // effect only re-synchronizes when the URL project name changes.
  const syncProject = useEffectEvent(() => {
    if (!isValid || !resolvedId) {
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
    // Offer the alphabetically-first accessible project as the escape hatch —
    // a stable, predictable target regardless of what the atom last held.
    const ownProject = [...groups].sort((a, b) => a.localeCompare(b))[0];
    return (
      <ProjectScopeErrorState
        variant="not-found"
        projectName={projectName}
        featureKey={getRouteScopeAndKey(location.pathname).featureKey}
        extra={
          // Same shape as Page404/ForbiddenPage: antd's `iconPosition="end"`
          // has no Astryx counterpart — the trailing slot is `endContent`.
          <Button
            variant="primary"
            size="lg"
            endContent={<Icon icon={ArrowRightIcon} />}
            label={t('projectSelect.GoToProject', { project: ownProject })}
            onClick={() =>
              webuiNavigate(buildPath('project', 'session', ownProject))
            }
          />
        }
      />
    );
  }

  return <Outlet />;
};

export default ProjectScopeLayout;
