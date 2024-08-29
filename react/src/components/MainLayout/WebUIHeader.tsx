import { useCustomThemeConfig } from '../../helper/customThemeConfig';
import { useCurrentDomainValue } from '../../hooks';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../../hooks';
import {
  useCurrentProjectValue,
  useSetCurrentProject,
} from '../../hooks/useCurrentProject';
import { useScrollBreakPoint } from '../../hooks/useScrollBreackPoint';
import { useThemeMode } from '../../hooks/useThemeMode';
import BAINotificationButton from '../BAINotificationButton';
import Flex, { FlexProps } from '../Flex';
import ProjectSelect from '../ProjectSelect';
import UserDropdownMenu from '../UserDropdownMenu';
import WEBUIHelpButton from '../WEBUIHelpButton';
import WebUIThemeToggleButton from '../WebUIThemeToggleButton';
// @ts-ignore
import rawCss from './WebUIHeader.css?raw';
import { MenuOutlined } from '@ant-design/icons';
import { theme, Button, Typography, Grid } from 'antd';
import _ from 'lodash';
import { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatches } from 'react-router-dom';

export interface WebUIHeaderProps extends FlexProps {
  onClickMenuIcon?: () => void;
  containerElement?: HTMLDivElement | null;
}

export const HEADER_HEIGHT = 62;
const WebUIHeader: React.FC<WebUIHeaderProps> = ({
  onClickMenuIcon,
  containerElement,
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const currentDomainName = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  const setCurrentProject = useSetCurrentProject();
  const matches = useMatches();
  const { y: scrolled } = useScrollBreakPoint(
    {
      y: 1,
    },
    containerElement,
  );
  const gridBreakpoint = Grid.useBreakpoint();
  const themeConfig = useCustomThemeConfig();
  const webuiNavigate = useWebUINavigate();
  const { isDarkMode } = useThemeMode();
  const mergedSiderTheme = themeConfig?.sider?.theme
    ? themeConfig.sider.theme
    : isDarkMode
      ? 'dark'
      : 'light';

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
        paddingLeft: token.marginMD,
        backgroundColor: token.colorFillContent,
        boxShadow: scrolled ? `0 5px 6px -6px ${token.colorBorder}` : 'none',
        transition: 'background-color 0.2s ease-in-out',
      }}
      className={'webui-header-container'}
    >
      <style>{rawCss}</style>
      <Flex align="center" justify="start" direction="row">
        <img
          className="logo-wide"
          alt={themeConfig?.logo?.alt || 'Backend.AI Logo'}
          src={
            mergedSiderTheme === 'dark' && themeConfig?.logo?.srcDark
              ? themeConfig?.logo?.srcDark ||
                '/manifest/backend.ai-text-bgdark.svg'
              : themeConfig?.logo?.src || '/manifest/backend.ai-text.svg'
          }
          style={{
            width: themeConfig?.logo?.size?.width || 191,
            height: themeConfig?.logo?.size?.height || 32,
            cursor: 'pointer',
          }}
          onClick={() => webuiNavigate(themeConfig?.logo?.href || '/summary')}
        />
        <Suspense>
          <Flex gap={md ? 'sm' : 'xs'}>
            <Typography.Text
              type="secondary"
              style={{ color: 'white', fontSize: '1rem' }}
            >
              {t('webui.menu.Project')}
            </Typography.Text>
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
          </Flex>
        </Suspense>
      </Flex>
      <Flex gap={md ? 'sm' : 'xs'}>
        <Flex direction="row" className="non-draggable">
          <BAINotificationButton />
          <WebUIThemeToggleButton />
          <WEBUIHelpButton />
          <UserDropdownMenu />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default WebUIHeader;
