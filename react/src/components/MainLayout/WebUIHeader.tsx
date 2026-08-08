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
import { useSessionStorageState } from 'ahooks';
import { BAIFlex, BAIFlexProps } from 'backend.ai-ui';
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
        // The inherited text colour for everything on the band that is NOT an
        // Astryx component declaring its own (the antd-engine `ProjectSelect`
        // value, bare `currentColor` glyphs).
        //
        // This was `token.colorBgBase`, which is how legacy spelled "white":
        // antd's `colorBgBase` is `#fff` in light mode, so the header text came
        // out pure white. The shim maps `colorBgBase -> --color-background-body`
        // (the correct role mapping), and this theme pins that to the legacy
        // PAGE backdrop `#F7F7F6` — so the same expression now resolves to an
        // off-white grey, which is the greying users reported. `--color-on-dark`
        // is the Astryx token that actually means "content on a dark/inverted
        // surface" and is `#ffffff` in both modes, matching both the legacy
        // rendering and `--color-on-accent`, already pinned white for the same
        // reason. The band's BACKGROUND is unchanged in both modes by design.
        color: 'var(--color-on-dark)',
      }}
      className="bai-webui-header"
    >
      <BAIFlex data-testid="label-selector-project" direction="row" gap={'sm'}>
        {/* The header paints itself with the brand accent, so its contents
            need the opposite polarity from the page.

            This was `AstryxReverseTheme` — a nested `<Theme>` carrying the
            INVERTED RESOLVED MODE, the direct translation of antd's
            `ReverseThemeProvider` (a ConfigProvider with the flipped
            algorithm). That reproduces legacy's mechanism but not legacy's
            RESULT: a full theme flip resolves `--color-text-primary` to the
            other mode's ordinary body text — Astryx's dark-mode grey
            `#EBE0DA` (measured) — whereas antd's flipped algorithm gave
            `rgba(255,255,255,0.85)`, which over `#FF9729` renders as
            ≈`rgb(255,239,223)`, i.e. white. Users read the difference as the
            header text having gone grey.

            `MediaTheme` is the Astryx primitive for this case and it is a
            different thing from a theme flip: it declares the SURFACE
            LUMINANCE the content sits on, and its `defaultOnDarkTokens`
            (see `@astryxdesign/core/theme/onMediaTokens`) map
            `--color-text-primary` and `--color-icon-primary` to
            `var(--color-on-dark)` — pure white — on top of the
            `color-scheme: dark` flip. That is exactly "white text and icons
            on the accent band", expressed as a token context rather than a
            per-component colour. It is also the same fix the sider's tooltip
            took in c97189e60.

            `mode="dark"` is CONSTANT, not derived from the app mode: the
            orange band is a dark surface in both light and dark mode, so its
            content is "on dark" in both. That is what makes the header text
            white in both modes, which is the requested behaviour — the band's
            BACKGROUND is deliberately untouched.

            It renders `display: contents`, so it costs no layout. */}
        <MediaTheme mode="dark">
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
        <BAINotificationButton data-testid="button-notification" />
        {/* Same swap, same reason as the project group above: these controls
            sit ON the accent band, so they take the on-dark media context and
            their glyphs come out white instead of the dark theme's grey.

            The `UserDropdownMenu` PANEL is a DOM descendant here (Astryx
            renders its popover as an inline `[popover]` sibling of the
            trigger, not through a portal — measured), so it inherits this
            context too. That is the intended outcome and matches legacy,
            which also wrapped the whole dropdown in `ReverseThemeProvider`:
            `color-scheme: dark` keeps `--color-background-popover` on its
            dark value, so the panel stays a dark surface and the white text
            lands on it legibly. */}
        <MediaTheme mode="dark">
          <WebUIThemeToggleButton data-testid="button-theme" />
          <WEBUIHelpButton data-testid="button-help" />
          {/* `DropdownMenu` owns its trigger button, so the old
              `buttonRender` hook (whose only job was to wrap the trigger in
              ReverseThemeProvider, plus a `<div>` working around an antd
              Dropdown/ConfigProvider bug) is gone — the whole dropdown sits
              inside the media context instead. */}
          <UserDropdownMenu
            style={{
              marginLeft: token.marginXXS,
              marginRight: token.marginSM * -1,
              paddingLeft: token.paddingSM,
              paddingRight: token.paddingSM,
            }}
          />
        </MediaTheme>
      </BAIFlex>
    </BAIFlex>
  );
};

export default WebUIHeader;
