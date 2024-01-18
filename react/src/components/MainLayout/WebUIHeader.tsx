import { useCurrentDomainValue, useCurrentProjectValue } from '../../hooks';
import { useScrollBreakPoint } from '../../hooks/useScrollBreackPoint';
import BAINotificationButton from '../BAINotificationButton';
import Flex, { FlexProps } from '../Flex';
import ProjectSelector from '../ProjectSelector';
import UserDropdownMenu from '../UserDropdownMenu';
import WEBUIHelpButton from '../WEBUIHelpButton';
import { MenuOutlined } from '@ant-design/icons';
import { theme, Button, Typography, Grid } from 'antd';
import { t } from 'i18next';
import _ from 'lodash';
import { Suspense } from 'react';
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
  const currentDomainName = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  const matches = useMatches();
  const { y: scrolled } = useScrollBreakPoint(
    {
      y: 1,
    },
    containerElement,
  );

  const { md } = Grid.useBreakpoint();

  return (
    <Flex
      align="center"
      justify="between"
      direction="row"
      style={{
        position: 'sticky',
        height: HEADER_HEIGHT,
        top: 0,
        zIndex: 1,
        // width: '100%',
        // justifyContent: 'space-between',
        // padding: token.marginMD,
        paddingRight: token.marginMD,
        paddingLeft: token.marginMD,

        // backdropFilter: 'blur(15px)',
        backgroundColor: scrolled ? token.colorBgContainer : 'transparent',
        boxShadow: scrolled ? '0 5px 6px -6px rgba(0, 0, 0, 0.1)' : 'none',
        transition: 'background-color 0.2s ease-in-out',

        // margin: token.marginMD * -1,
        // borderBottom: `1px solid ${token.colorBorder}`,
      }}
    >
      <Flex direction="row" gap={'sm'}>
        <Button
          icon={<MenuOutlined />}
          type="text"
          onClick={() => {
            onClickMenuIcon?.();
          }}
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
          <ProjectSelector
            style={{ minWidth: 150 }}
            showSearch
            domain={currentDomainName}
            size="large"
            value={currentProject?.id}
            onChange={(value) => {
              const event: CustomEvent = new CustomEvent(
                'backend-ai-group-changed',
                {
                  detail: value,
                },
              );
              document.dispatchEvent(event);
            }}
          />
        </Suspense>

        <Flex direction="row">
          <BAINotificationButton />
          <WEBUIHelpButton />
          <UserDropdownMenu />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default WebUIHeader;
