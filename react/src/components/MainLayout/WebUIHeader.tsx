import { useCurrentDomainValue } from '../../hooks';
import { useSuspendedBackendaiClient } from '../../hooks';
import {
  useCurrentProjectValue,
  useSetCurrentProject,
} from '../../hooks/useCurrentProject';
import BAINotificationButton from '../BAINotificationButton';
import Flex, { FlexProps } from '../Flex';
import LoginSessionExtendButton from '../LoginSessionExtendButton';
import ProjectSelect from '../ProjectSelect';
import ReverseThemeProvider from '../ReverseThemeProvider';
import UserDropdownMenu from '../UserDropdownMenu';
import WEBUIHelpButton from '../WEBUIHelpButton';
import { DRAWER_WIDTH } from '../WEBUINotificationDrawer';
import WebUIThemeToggleButton from '../WebUIThemeToggleButton';
import { theme, Button, Typography, Grid, Divider } from 'antd';
import { createStyles } from 'antd-style';
import { MenuIcon } from 'lucide-react';
import { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css, token }) => ({
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

export interface WebUIHeaderProps extends FlexProps {
  logo?: React.ReactNode;
  onClickMenuIcon?: () => void;
  containerElement?: HTMLDivElement | null;
}

const WebUIHeader: React.FC<WebUIHeaderProps> = ({
  logo,
  onClickMenuIcon,
  containerElement,
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const currentDomainName = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  const setCurrentProject = useSetCurrentProject();
  const baiClient = useSuspendedBackendaiClient();
  const gridBreakpoint = Grid.useBreakpoint();

  const [isPendingProjectChanged, startProjectChangedTransition] =
    useTransition();
  const [optimisticProjectId, setOptimisticProjectId] = useState(
    currentProject.id,
  );

  const { styles } = useStyles();

  return (
    <Flex
      align="center"
      justify="between"
      direction="row"
      style={{
        height: token.Layout?.headerHeight || 60,
        backgroundColor: token.Layout?.headerBg,
        paddingRight: token.marginMD,
        paddingLeft: token.marginMD,
        color: token.colorBgBase,
      }}
      className={styles.webuiHeader}
    >
      <Flex direction="row" gap={'sm'}>
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
            ghost
            popupMatchSelectWidth={false}
            style={{
              minWidth: 100,
              maxWidth: gridBreakpoint.lg ? undefined : 150,
            }}
            loading={isPendingProjectChanged}
            disabled={isPendingProjectChanged}
            className="non-draggable"
            showSearch
            domain={currentDomainName}
            value={
              isPendingProjectChanged ? optimisticProjectId : currentProject?.id
            }
            onSelectProject={(projectInfo) => {
              setOptimisticProjectId(projectInfo.projectId);
              startProjectChangedTransition(() => {
                setCurrentProject(projectInfo);
              });
            }}
          />
        </Suspense>
      </Flex>
      <Flex direction="row" className="non-draggable" gap="xxs" align="center">
        {baiClient.supports('extend-login-session') &&
          baiClient._config.enableExtendLoginSession && (
            <Suspense>
              <LoginSessionExtendButton />
              {gridBreakpoint.md && (
                <Divider
                  type="vertical"
                  style={{ borderColor: 'transparent' }}
                />
              )}
            </Suspense>
          )}
        <BAINotificationButton
          buttonRender={(btn) => (
            <ReverseThemeProvider>{btn}</ReverseThemeProvider>
          )}
        />

        <ReverseThemeProvider>
          <WebUIThemeToggleButton />
          <WEBUIHelpButton />
        </ReverseThemeProvider>
        <UserDropdownMenu
          buttonRender={(btn) => (
            <ReverseThemeProvider>{btn}</ReverseThemeProvider>
          )}
        />
      </Flex>
    </Flex>
  );
};

export default WebUIHeader;
