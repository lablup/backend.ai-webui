import {
  useCurrentDomainValue,
  useCurrentProjectValue,
  useSuspendedBackendaiClient,
} from '../../hooks';
import Flex from '../Flex';
import ProjectSelector from '../ProjectSelector';
import {
  BellOutlined,
  HolderOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { theme, Layout, Button, Typography, Avatar, Dropdown } from 'antd';
import { t } from 'i18next';
import { Suspense } from 'react';

const WebUIHeader: React.FC<{
  onClickMenuIcon?: () => void;
}> = ({ onClickMenuIcon }) => {
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const currentDomainName = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  return (
    <Layout.Header
      style={{
        position: 'sticky',
        height: 64,
        top: 0,
        zIndex: 1,
        // width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: token.marginMD,
        paddingRight: token.marginMD,
        // margin: token.marginMD * -1,
        backgroundColor: token.colorBgContainer,
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
          {/* {_.last(matches)?.handle?.title || ''} */}
          {/* {title} */}
        </Typography.Title>
      </Flex>
      <Flex gap={'xs'}>
        <Typography.Text type="secondary">
          {t('webui.menu.Project')}
        </Typography.Text>
        <Suspense>
          <ProjectSelector
            style={{ minWidth: 150 }}
            showSearch
            domain={currentDomainName}
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

        <Button size="large" icon={<BellOutlined />} type="text"></Button>
        <Dropdown
          menu={{
            items: [
              {
                label: 'Preferences',
                icon: <HolderOutlined />,
                key: 'preferences',
                // onClick: () => toggleIsOpenPreferences(),
              },
              {
                label: 'Log out',
                icon: <LogoutOutlined />,
                key: 'logout',
                // onClick: () => logout(),
              },
            ],
          }}
          trigger={['click']}
        >
          {/* to fix "react-dom.development.js:86 Warning: findDOMNode is deprecated in StrictMode.", it seems like a bug of ant.d dropdown */}
          <Flex
            direction="row"
            gap={token.marginXS}
            style={{ cursor: 'pointer' }}
          >
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{ backgroundColor: '#BFBFBF' }}
            />
            <Typography.Text>
              {/* {window?.ManagerHub?.user?.name}{' '}
          {window?.ManagerHub?.user?.email} */}
            </Typography.Text>
            {/* <DownOutlined
          style={{
            fontSize: 12,
            color: token.colorTextSecondary,
          }}
        /> */}
          </Flex>
        </Dropdown>
      </Flex>
    </Layout.Header>
  );
};

export default WebUIHeader;
