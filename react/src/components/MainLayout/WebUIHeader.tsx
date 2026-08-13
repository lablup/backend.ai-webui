/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { modal } from '../../app-shim';
import { buildPath, MENU_KEY_TO_SCOPE_FEATURE } from '../../helper/pathBuilder';
import {
  useCurrentDomainValue,
  useSuspendedBackendaiClient,
  useWebUINavigate,
} from '../../hooks';
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
import { useThemeMode } from '../../hooks/useThemeMode';
import { useUrlProjectValidity } from '../../hooks/useUrlProjectValidity';
import { useWebUIMenuItems } from '../../hooks/useWebUIMenuItems';
import { theme, useBAIBreakpoint } from '../../theme-shim';
import BAINotificationButton from '../BAINotificationButton';
import LoginSessionExtendButton from '../LoginSessionExtendButton';
import ProjectSelect from '../ProjectSelect';
import UserDropdownMenu from '../UserDropdownMenu';
import WEBUIHelpButton from '../WEBUIHelpButton';
import WebUIThemeToggleButton from '../WebUIThemeToggleButton';
import './WebUIHeader.css';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import { MediaTheme } from '@astryxdesign/core/theme';
import {
  ANTD_REVERSED_BAND_OVERLAYS,
  BAIFlex,
  BAIFlexProps,
  useSessionStorageState,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { MenuIcon } from 'lucide-react';
import { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatches } from 'react-router-dom';

export interface WebUIHeaderProps extends BAIFlexProps {
  onClickMenuIcon?: () => void;
}

const WebUIHeader: React.FC<WebUIHeaderProps> = ({ onClickMenuIcon }) => {
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();
  // The brand band is a REVERSED surface: its content polarity is the opposite
  // of the app's, so it is "on dark" in light mode and "on light" in dark.
  const bandMediaMode = isDarkMode ? 'light' : 'dark';
  const bandOverlays =
    ANTD_REVERSED_BAND_OVERLAYS[isDarkMode ? 'dark' : 'light'];
  const { t } = useTranslation();
  const currentDomainName = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  const setCurrentProject = useSetCurrentProject();
  const baiClient = useSuspendedBackendaiClient();
  // RESPONSIVE-POLICY R3: `Grid.useBreakpoint()` → theme-shim hook.
  const gridBreakpoint = useBAIBreakpoint();
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
    <BAIFlex
      data-testid="webui-header"
      align="center"
      justify="between"
      direction="row"
      style={{
        height: token.Layout?.headerHeight || 60,
        backgroundColor: token.Layout?.headerBg,
        paddingRight: token.marginLG,
        paddingLeft: token.marginLG,
        // The inherited colour for band content that declares none of its own
        // (bare `currentColor` glyphs). Inverts with the app mode, like the
        // `MediaTheme`s below.
        color: isDarkMode ? 'var(--color-on-light)' : 'var(--color-on-dark)',
        // Declared HERE, outside the `MediaTheme`s, and indexed in JS: the pair
        // must resolve against the APP scheme, but a custom property holding
        // `light-dark(a, b)` is substituted at USE time by consumers that sit
        // inside a forced-scheme subtree (measured, QA-FINDINGS Q-20).
        ...bandOverlays,
      }}
      className="bai-webui-header"
    >
      <BAIFlex data-testid="label-selector-project" direction="row" gap={'sm'}>
        {/* `MediaTheme` declares the SURFACE LUMINANCE its content sits on —
            not a theme flip — so it maps `--color-text-primary` /
            `--color-icon-primary` onto `--color-on-{dark,light}`. It renders
            `display: contents`, so it costs no layout. */}
        <MediaTheme mode={bandMediaMode}>
          {!gridBreakpoint.sm && (
            <IconButton
              icon={<MenuIcon size="1em" />}
              variant="ghost"
              label={t('webui.menu.Menu')}
              onClick={() => {
                onClickMenuIcon?.();
              }}
              className="non-draggable"
              style={{
                marginLeft: token.marginSM * -1,
              }}
            />
          )}
          {gridBreakpoint.sm && (
            <Text type="large" weight="semibold">
              {t('webui.menu.Project')}
            </Text>
          )}
        </MediaTheme>
        <Suspense>
          <ProjectSelect
            data-testid="selector-project"
            ghost
            popupMatchSelectWidth={false}
            style={{
              minWidth: 100,
              maxWidth: gridBreakpoint.lg ? undefined : 150,
              // Lands on the Selector TRIGGER, re-declaring the band wash the
              // theme's `field` entry neutralises for the popup panel below it
              // (FR-3505). Inline, so it wins there and only there.
              ...bandOverlays,
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
      </BAIFlex>
      <BAIFlex
        direction="row"
        className="non-draggable"
        gap="xxs"
        align="center"
      >
        {baiClient.supports('extend-login-session') &&
          baiClient._config.enableExtendLoginSession && (
            <Suspense>
              <LoginSessionExtendButton data-testid="button-extend-login-session" />
              {/* PILOT-DECISION: the antd `Divider orientation="vertical"`
                  here was painted `borderColor: 'transparent'` — i.e. it was
                  a SPACER, not a rule. Astryx `Divider` has no colour prop
                  (closed enums, P5), so the spacer is expressed as spacing
                  instead of a hidden rule. */}
              {gridBreakpoint.md && <span style={{ width: token.marginXS }} />}
            </Suspense>
          )}
        {/* `BAINotificationButton` scopes its own on-dark context to its
            button, because it also owns a `Tooltip` whose panel is an inline
            sibling — see that file. */}
        <BAINotificationButton data-testid="button-notification" />
        {/* Same swap, same reason as the project group above: these controls
            sit ON the accent band, so they take the on-dark media context and
            their glyphs come out white instead of the dark theme's grey.
            Both are plain `IconButton`s — they open no floating surface, so a
            shared wrapper has nothing to leak into. */}
        <MediaTheme mode={bandMediaMode}>
          <WebUIThemeToggleButton data-testid="button-theme" />
          <WEBUIHelpButton data-testid="button-help" />
        </MediaTheme>
        {/* `UserDropdownMenu` declares its OWN on-dark context, on just the
            trigger button.

            It used to sit inside the `MediaTheme` above. Astryx renders both
            the popover panel and the component's three `Dialog`s as inline
            siblings/descendants rather than through a portal (measured), so a
            wrapper here reached all of them: the modals painted as dark
            surfaces in LIGHT mode, and the dropdown panel stayed dark in both
            modes. Scoping the context to the trigger element is therefore the
            component's own business, not the header's — see
            `UserDropdownMenu.tsx`. */}
        <UserDropdownMenu
          style={{
            marginLeft: token.marginXXS,
            marginRight: token.marginSM * -1,
            paddingLeft: token.paddingSM,
            paddingRight: token.paddingSM,
          }}
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default WebUIHeader;
