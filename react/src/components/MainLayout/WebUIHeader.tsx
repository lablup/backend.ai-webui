/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  useCurrentDomainValue,
  useSuspendedBackendaiClient,
  useWebUINavigate,
} from '../../hooks';
import {
  useCurrentProjectValue,
  useSetCurrentProject,
} from '../../hooks/useCurrentProject';
import {
  useCurrentUserProjectRoles,
  useEffectiveAdminRole,
} from '../../hooks/useCurrentUserProjectRoles';
import { useWebUIMenuItems } from '../../hooks/useWebUIMenuItems';
import BAINotificationButton from '../BAINotificationButton';
import LoginSessionExtendButton from '../LoginSessionExtendButton';
import ProjectSelect from '../ProjectSelect';
import ReverseThemeProvider from '../ReverseThemeProvider';
import UserDropdownMenu from '../UserDropdownMenu';
import WEBUIHelpButton from '../WEBUIHelpButton';
import WebUIThemeToggleButton from '../WebUIThemeToggleButton';
import { useSessionStorageState } from 'ahooks';
import { theme, Button, Modal, Typography, Grid, Divider } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex, BAIFlexProps } from 'backend.ai-ui';
import { MenuIcon } from 'lucide-react';
import { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css }) => ({
  webuiHeader: css`
    &,
    & .draggable {
      -webkit-app-region: drag;
    }
    & .non-draggable {
      -webkit-app-region: no-drag;
    }
  `,
}));

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
  const gridBreakpoint = Grid.useBreakpoint();
  const webuiNavigate = useWebUINavigate();
  const { isSelectedAdminCategoryMenu, defaultMenuPath } = useWebUIMenuItems();
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
    startProjectChangedTransition(() => {
      setCurrentProject(projectInfo);
    });
  };

  const { styles } = useStyles();

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
        color: token.colorBgBase,
      }}
      className={styles.webuiHeader}
    >
      <BAIFlex data-testid="label-selector-project" direction="row" gap={'sm'}>
        <ReverseThemeProvider>
          {!gridBreakpoint.sm && (
            <Button
              icon={<MenuIcon />}
              type="text"
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
            <Typography.Text
              style={{
                fontWeight: 600, // semi-bold
                fontSize: token.fontSizeLG,
              }}
            >
              {t('webui.menu.Project')}
            </Typography.Text>
          )}
        </ReverseThemeProvider>
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
            value={isProjectChanging ? optimisticProjectId : currentProject?.id}
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
                    applyProjectChange(projectInfo);
                    // Exit admin mode by navigating to the last-visited
                    // general page (or the default menu path as fallback).
                    webuiNavigate(goBackPath || defaultMenuPath);
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
              {gridBreakpoint.md && (
                <Divider
                  orientation="vertical"
                  style={{ borderColor: 'transparent' }}
                />
              )}
            </Suspense>
          )}
        <BAINotificationButton data-testid="button-notification" />
        <ReverseThemeProvider>
          <WebUIThemeToggleButton data-testid="button-theme" />
          <WEBUIHelpButton data-testid="button-help" />
        </ReverseThemeProvider>
        <UserDropdownMenu
          data-testid="dropdown-user-menu"
          buttonRender={(btn) => (
            //  Add a `div` to resolve the Dropdown bug when the child is a `ConfigProvider`(ReverseThemeProvider).
            <div>
              <ReverseThemeProvider>{btn}</ReverseThemeProvider>
            </div>
          )}
          style={{
            marginLeft: token.marginXXS,
            marginRight: token.marginSM * -1,
            paddingLeft: token.paddingSM,
            paddingRight: token.paddingSM,
          }}
        />
      </BAIFlex>
      {modalContextHolder}
    </BAIFlex>
  );
};

export default WebUIHeader;
