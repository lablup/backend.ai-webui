import {
  useCurrentDomainValue,
  useSuspendedBackendaiClient,
} from '../../hooks';
import {
  useCurrentProjectValue,
  useSetCurrentProject,
} from '../../hooks/useCurrentProject';
import BAINotificationButton from '../BAINotificationButton';
import LoginSessionExtendButton from '../LoginSessionExtendButton';
import ProjectSelect from '../ProjectSelect';
import ReverseThemeProvider from '../ReverseThemeProvider';
import UserDropdownMenu from '../UserDropdownMenu';
import WEBUIHelpButton from '../WEBUIHelpButton';
import WebUIThemeToggleButton from '../WebUIThemeToggleButton';
import { theme, Button, Typography, Grid, Divider } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex, BAIFlexProps } from 'backend.ai-ui';
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

export interface WebUIHeaderProps extends BAIFlexProps {
  onClickMenuIcon?: () => void;
  containerElement?: HTMLDivElement | null;
}

const WebUIHeader: React.FC<WebUIHeaderProps> = ({
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
    <BAIFlex
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
      <BAIFlex direction="row" gap={'sm'}>
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
              <LoginSessionExtendButton />
              {gridBreakpoint.md && (
                <Divider
                  type="vertical"
                  style={{ borderColor: 'transparent' }}
                />
              )}
            </Suspense>
          )}
        <BAINotificationButton />
        <ReverseThemeProvider>
          <WebUIThemeToggleButton />
          <WEBUIHelpButton />
        </ReverseThemeProvider>
        <UserDropdownMenu
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
    </BAIFlex>
  );
};

export default WebUIHeader;
