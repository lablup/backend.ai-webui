import {
  useCurrentDomainValue,
  useCurrentProjectValue,
  useSetCurrentProject,
} from '../../hooks';
import { useScrollBreakPoint } from '../../hooks/useScrollBreackPoint';
import BAINotificationButton from '../BAINotificationButton';
import Flex, { FlexProps } from '../Flex';
import ProjectSelect from '../ProjectSelect';
import UserDropdownMenu from '../UserDropdownMenu';
import WEBUIHelpButton from '../WEBUIHelpButton';
// @ts-ignore
import rawCss from './WebUIHeader.css?raw';
import { MenuOutlined } from '@ant-design/icons';
import { theme, Button, Typography, Grid } from 'antd';
import _ from 'lodash';
import { Suspense } from 'react';
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

  const { md } = Grid.useBreakpoint();

  return (
    <Flex
      align="center"
      justify="between"
      direction="row"
      style={{
        height: HEADER_HEIGHT,
        paddingRight: token.marginMD,
        paddingLeft: token.marginMD,
        backgroundColor: scrolled ? token.colorBgContainer : 'transparent',
        boxShadow: scrolled ? '0 5px 6px -6px rgba(0, 0, 0, 0.1)' : 'none',
        transition: 'background-color 0.2s ease-in-out',
      }}
      className={'webui-header-container'}
    >
      <style>{rawCss}</style>
      <Flex direction="row" gap={'sm'}>
        <Button
          icon={<MenuOutlined />}
          type="text"
          onClick={() => {
            onClickMenuIcon?.();
          }}
          className="non-draggable"
        />
        <Typography.Title level={5} style={{ margin: 0 }}>
          {/* @ts-ignore */}
          {t(_.last(matches)?.handle?.labelKey) || ''}
        </Typography.Title>
      </Flex>
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
            className="non-draggable"
            showSearch
            domain={currentDomainName}
            size={gridBreakpoint.lg ? 'large' : 'middle'}
            value={currentProject?.id}
            onSelectProject={(projectInfo) => {
              setCurrentProject(projectInfo);
            }}
          />
        </Suspense>
        <Flex direction="row" className="non-draggable">
          <BAINotificationButton />
          <WEBUIHelpButton />
          <UserDropdownMenu />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default WebUIHeader;
