/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { buildPath, MENU_KEY_TO_SCOPE_FEATURE } from '../../helper/pathBuilder';
import { useCurrentDomainValue, useWebUINavigate } from '../../hooks';
import { useAccessibleProjects } from '../../hooks/useAccessibleProjects';
import {
  useCurrentProjectValue,
  useSetCurrentProject,
} from '../../hooks/useCurrentProject';
import {
  useCurrentUserProjectRoles,
  useEffectiveAdminRole,
} from '../../hooks/useCurrentUserProjectRoles';
import {
  rewriteProjectNameInPath,
  useActiveProjectName,
  useCurrentMenuKey,
  useSwitchProject,
} from '../../hooks/useRouteScope';
import { useUrlProjectValidity } from '../../hooks/useUrlProjectValidity';
import { useWebUIMenuItems } from '../../hooks/useWebUIMenuItems';
import ProjectSelect from '../ProjectSelect';
import ReverseThemeProvider from '../ReverseThemeProvider';
import { useSessionStorageState } from 'ahooks';
import { theme, Modal, Typography, Grid } from 'antd';
import * as _ from 'lodash-es';
import { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatches } from 'react-router-dom';

/**
 * The header's current-project selector, including the "leaving admin mode"
 * confirm flow bound to it.
 *
 * Extracted from `WebUIHeader` for FR-3414: the selector block — and with it
 * every ambient current-project read this UI needs — is mounted ONLY when the
 * current route is not one of the project-agnostic pages
 * (`useIsProjectAgnosticPage` in the parent). On those pages this component
 * is simply not rendered, so nothing here can read or write the
 * current-project atom: leaving an admin page restores the user's previous,
 * untouched selection.
 */
const WebUIHeaderProjectSelect: React.FC = () => {
  'use memo';
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const currentDomainName = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  const setCurrentProject = useSetCurrentProject();
  const gridBreakpoint = Grid.useBreakpoint();
  const webuiNavigate = useWebUINavigate();
  const matches = useMatches();
  const currentMenuKey = useCurrentMenuKey();
  const switchProject = useSwitchProject();
  // When the URL carries an invalid/inaccessible `:projectName`, the atom keeps
  // the last valid project, which would make the header selector look like that
  // project is selected. Detect this and show the selector unselected instead.
  // Checked against the selector's own accessible-project source (FR-3388) so
  // this can never disagree with what the selector renders.
  const activeProjectName = useActiveProjectName();
  const { accessibleProjects } = useAccessibleProjects();
  const accessibleProjectNames = _.compact(
    _.map(accessibleProjects, (project) => project?.name),
  );
  // A router-owned 404 outside any project context (e.g. an invalid scope
  // prefix like `/admi/...`) corresponds to no project at all — show the
  // selector placeholder there too. Scoped 404s under a valid
  // `/project/:projectName/*` URL keep their project context (the param is
  // present), so only the projectless catch-alls blank the selector.
  const deepestHandle = matches[matches.length - 1]?.handle as
    { notFound?: boolean } | undefined;
  const { urlProjectName } = useUrlProjectValidity();
  const isProjectlessNotFound = !!deepestHandle?.notFound && !urlProjectName;
  const isUrlProjectInvalid =
    (!!activeProjectName &&
      !accessibleProjectNames.includes(activeProjectName)) ||
    isProjectlessNotFound;
  const { isSelectedAdminCategoryMenu } = useWebUIMenuItems();
  const effectiveAdminRole = useEffectiveAdminRole();
  const { projectAdminIds } = useCurrentUserProjectRoles();
  // Last visited general page — shared with WebUISider's "go back" button so
  // that exiting admin mode returns the user to where they were last. See
  // WebUISider.tsx (`backendaiwebui.last_visited_general_path`).
  const [goBackPath] = useSessionStorageState<string | undefined>(
    'backendaiwebui.last_visited_general_path',
  );

  const [isPendingProjectChanged, startProjectChangedTransition] =
    useTransition();
  const [optimisticProjectId, setOptimisticProjectId] = useState(
    currentProject.id,
  );
  // Tracks whether the admin-exit confirm modal is currently open. While open,
  // the select optimistically shows the target project and a loading state,
  // even though we haven't committed the change yet.
  const [isConfirmingProjectSwitch, setIsConfirmingProjectSwitch] =
    useState(false);
  const isProjectChanging =
    isPendingProjectChanged || isConfirmingProjectSwitch;

  const [modal, modalContextHolder] = Modal.useModal();

  const applyProjectChange = (projectInfo: {
    projectId: string;
    projectName: string;
    projectResourcePolicy: unknown;
  }) => {
    setOptimisticProjectId(projectInfo.projectId);

    // `useSwitchProject` holds the canonical scope rule (FR-3428): on project
    // / project-admin scope the URL owns the current project, so it stays on
    // the exact same page and swaps ONLY the `:projectName` segment, letting
    // `ProjectScopeLayout` converge `currentProjectAtom` to the new URL. On
    // global admin scope it updates the atom directly.
    startProjectChangedTransition(() => {
      switchProject(projectInfo);
    });
  };

  return (
    <>
      {gridBreakpoint.sm && (
        <ReverseThemeProvider>
          <Typography.Text
            style={{
              fontWeight: 600, // semi-bold
              fontSize: token.fontSizeLG,
            }}
          >
            {t('webui.menu.Project')}
          </Typography.Text>
        </ReverseThemeProvider>
      )}
      <Suspense>
        <ProjectSelect
          data-testid="selector-project"
          ghost
          popupMatchSelectWidth={false}
          style={{
            minWidth: 100,
            maxWidth: gridBreakpoint.lg ? undefined : 150,
          }}
          loading={isProjectChanging}
          disabled={isProjectChanging}
          className="non-draggable"
          showSearch
          domain={currentDomainName}
          value={
            isProjectChanging
              ? optimisticProjectId
              : isUrlProjectInvalid
                ? undefined
                : currentProject?.id
          }
          onSelectProject={(projectInfo) => {
            const isTargetProjectAdmin = projectAdminIds.includes(
              projectInfo.projectId,
            );

            // In admin mode, switching to a project the user is NOT a
            // project-admin of means leaving admin mode. Confirm first so
            // the user doesn't accidentally lose their admin context.
            if (
              isSelectedAdminCategoryMenu &&
              effectiveAdminRole === 'currentProjectAdmin' &&
              !isTargetProjectAdmin
            ) {
              // Optimistically show the target project (with loading) while
              // the confirm modal is open, so the user sees where they are
              // about to switch to.
              setOptimisticProjectId(projectInfo.projectId);
              setIsConfirmingProjectSwitch(true);
              modal.confirm({
                title: t('header.SwitchOutOfAdminConfirmTitle'),
                content: t('header.SwitchOutOfAdminConfirmContent', {
                  projectName: projectInfo.projectName,
                }),
                okText: t('button.Confirm'),
                cancelText: t('button.Cancel'),
                onOk: () => {
                  setIsConfirmingProjectSwitch(false);
                  setOptimisticProjectId(projectInfo.projectId);
                  // Leaving admin mode: switch to the target project (atom)
                  // and navigate to the last-visited general page, but rewrite
                  // that page's project segment to the NEW project so the
                  // project-scope layout doesn't immediately sync the atom
                  // back to the old project's name.
                  startProjectChangedTransition(() => {
                    setCurrentProject(projectInfo);
                  });
                  // Return to the last-visited general page, preserving its
                  // full sub-path (e.g. /session/start) and swapping ONLY the
                  // project segment to the NEW project, so the project-scope
                  // layout does not sync the atom back to the old project.
                  const fallbackFeature =
                    currentMenuKey &&
                    MENU_KEY_TO_SCOPE_FEATURE[currentMenuKey]?.scope ===
                      'project'
                      ? MENU_KEY_TO_SCOPE_FEATURE[currentMenuKey].featureKey
                      : 'session';
                  let target = buildPath(
                    'project',
                    fallbackFeature,
                    projectInfo.projectName,
                  );
                  if (goBackPath) {
                    const segments = goBackPath.split('/');
                    if (segments[1] === 'project' && segments.length > 2) {
                      target = rewriteProjectNameInPath(
                        goBackPath,
                        projectInfo.projectName,
                      );
                    }
                  }
                  webuiNavigate(target);
                },
                onCancel: () => {
                  // Revert the optimistic selection back to the current
                  // project so the dropdown reflects the unchanged state.
                  setIsConfirmingProjectSwitch(false);
                  setOptimisticProjectId(currentProject.id);
                },
              });
              return;
            }

            applyProjectChange(projectInfo);
          }}
        />
      </Suspense>
      {modalContextHolder}
    </>
  );
};

export default WebUIHeaderProjectSelect;
