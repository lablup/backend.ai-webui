import { useCurrentDomainValue } from '../../hooks';
import { useSuspendedBackendaiClient } from '../../hooks';
import {
  useCurrentProjectValue,
  useSetCurrentProject,
} from '../../hooks/useCurrentProject';
import { useScrollBreakPoint } from '../../hooks/useScrollBreackPoint';
import BAINotificationButton from '../BAINotificationButton';
import Flex, { FlexProps } from '../Flex';
import LoginSessionExtendButton from '../LoginSessionExtendButton';
import ProjectSelect from '../ProjectSelect';
import UserDropdownMenu from '../UserDropdownMenu';
import WEBUIHelpButton from '../WEBUIHelpButton';
import { DRAWER_WIDTH } from '../WEBUINotificationDrawer';
import WebUIThemeToggleButton from '../WebUIThemeToggleButton';
// @ts-ignore
import rawCss from './WebUIHeader.css?raw';
import { MenuOutlined } from '@ant-design/icons';
import { theme, Button, Typography, Grid, Divider } from 'antd';
import _ from 'lodash';
import { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatches } from 'react-router-dom';

export interface WebUIHeaderProps extends FlexProps {
  logo?: React.ReactNode;
  onClickMenuIcon?: () => void;
  containerElement?: HTMLDivElement | null;
}

export const HEADER_HEIGHT = 62;
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
  const matches = useMatches();
  const { y: scrolled } = useScrollBreakPoint(
    {
      y: 1,
    },
    containerElement,
  );
  const gridBreakpoint = Grid.useBreakpoint();

  const { md } = Grid.useBreakpoint();

  const [isPendingProjectChanged, startProjectChangedTransition] =
    useTransition();
  const [optimisticProjectId, setOptimisticProjectId] = useState(
    currentProject.id,
  );
  return (
    <Flex
      align="center"
      justify="between"
      direction="row"
      style={{
        height: HEADER_HEIGHT,
        paddingRight: token.marginMD,
        // paddingLeft: token.marginMD,
        backgroundColor: token.colorFillContent,
        boxShadow: scrolled ? `0 5px 6px -6px ${token.colorBorder}` : 'none',
        transition: 'background-color 0.2s ease-in-out',
      }}
      className={'webui-header-container'}
    >
      <style>{rawCss}</style>
      <Flex
        direction="column"
        align="start"
        justify="center"
        style={{
          width: DRAWER_WIDTH,
          height: HEADER_HEIGHT,
          backgroundColor: token.colorPrimary,
        }}
      >
        <div className="logo-img-wrap non-draggable">{logo}</div>
      </Flex>
      <Flex direction="row" wrap={'wrap'} justify="between" gap={'sm'}>
        {/* <Button
          icon={<MenuOutlined />}
          type="text"
          onClick={() => {
            onClickMenuIcon?.();
          }}
          className="non-draggable"
        /> */}
        <Flex gap={md ? 'sm' : 'xs'}>
          <Typography.Text type="secondary">
            {t('webui.menu.Project')}
          </Typography.Text>
          <Suspense>
            <ProjectSelect
              popupMatchSelectWidth={false}
              style={{
                minWidth: 100,
                maxWidth: gridBreakpoint.lg ? undefined : 100,
              }}
              loading={isPendingProjectChanged}
              disabled={isPendingProjectChanged}
              className="non-draggable"
              showSearch
              domain={currentDomainName}
              size={gridBreakpoint.lg ? 'large' : 'middle'}
              value={
                isPendingProjectChanged
                  ? optimisticProjectId
                  : currentProject?.id
              }
              onSelectProject={(projectInfo) => {
                setOptimisticProjectId(projectInfo.projectId);
                startProjectChangedTransition(() => {
                  setCurrentProject(projectInfo);
                });
              }}
            />
          </Suspense>
          <Flex direction="row" className="non-draggable">
            <BAINotificationButton />
            <WebUIThemeToggleButton />
            <WEBUIHelpButton />
            {baiClient.supports('extend-login-session') &&
              baiClient._config.enableExtendLoginSession && (
                <Suspense>
                  <Divider type="vertical" />
                  <LoginSessionExtendButton />
                  <Divider type="vertical" />
                </Suspense>
              )}
            <UserDropdownMenu />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default WebUIHeader;
