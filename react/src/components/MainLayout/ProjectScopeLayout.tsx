/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { buildPath } from '../../helper/pathBuilder';
import { useSuspendedBackendaiClient } from '../../hooks';
import {
  useCurrentProjectValue,
  useSetCurrentProject,
} from '../../hooks/useCurrentProject';
import WebUINavigate from '../WebUINavigate';
import { BAIAlert, BAIFlex } from 'backend.ai-ui';
import React, { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';

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
 * layout redirects (replace) to a guaranteed-valid fallback project's session
 * page rather than rendering with an undefined project id:
 *   - fallback = current atom project name if the user is still a member of it,
 *     otherwise `groups[0]`.
 *   - if the user has NO groups at all, we cannot synthesize a `/project//...`
 *     path, so we render the existing "no accessible projects" guidance.
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
  const currentProject = useCurrentProjectValue();
  const setCurrentProject = useSetCurrentProject();

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
    // No groups at all: cannot build a valid `/project/<name>/...` path. Show
    // the same "no accessible projects" guidance used by the project selector
    // rather than redirecting into an invalid empty-name URL.
    if (groups.length === 0) {
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

    // Invalid / inaccessible name: redirect to a guaranteed-valid fallback.
    // Prefer the current atom project if the user is still a member of it,
    // otherwise the first group.
    const currentName = currentProject.name ?? '';
    const fallbackName =
      currentName && groups.includes(currentName) ? currentName : groups[0];

    return (
      <WebUINavigate
        to={buildPath('project', 'session', fallbackName)}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProjectScopeLayout;
