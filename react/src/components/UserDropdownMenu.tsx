import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { useWebComponentInfo } from './DefaultProviders';
import Flex from './Flex';
import {
  UserOutlined,
  MailOutlined,
  SecurityScanOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
  HolderOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useDebounce } from 'ahooks';
import { Avatar, Dropdown, Grid, MenuProps, Typography, theme } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const UserDropdownMenu: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { dispatchEvent } = useWebComponentInfo();
  const baiClient = useSuspendedBackendaiClient();
  const [userInfo] = useCurrentUserInfo();
  const [open, setOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const debouncedOpenToFixDropdownMenu = useDebounce(open, {
    wait: 100,
    leading: true,
    trailing: false,
  });

  const { data: roleData } = useTanQuery<{
    user: {
      role: string;
    };
  }>(
    'getUserRole',
    () => {
      return baiClient.user.get(userInfo.email, ['role']);
    },
    {
      suspense: false,
    },
  );
  const userRole = roleData?.user.role;

  const items: MenuProps['items'] = [
    {
      label: <Typography.Text ellipsis>{userInfo.username}</Typography.Text>,
      key: 'userFullName',
      icon: <UserOutlined />,
      disabled: true,
      style: {
        color: token.colorText,
        cursor: 'default',
        maxWidth: '15vw',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      },
    },
    {
      label: userInfo.email,
      key: 'userEmail',
      icon: <MailOutlined />,
      disabled: true,
      style: {
        cursor: 'default',
      },
    },
    {
      type: 'divider',
    },
    {
      label: userRole,
      key: 'userRole',
      icon: <SecurityScanOutlined />,
      disabled: true,
      style: {
        cursor: 'default',
      },
    },
    {
      type: 'divider',
    },
    {
      label: t('webui.menu.AboutBackendAI'),
      key: 'description',
      icon: <ExclamationCircleOutlined />,
      onClick: () => {
        const event: CustomEvent = new CustomEvent('backend-ai-show-splash');
        document.dispatchEvent(event);
      },
    },
    {
      label: t('webui.menu.MyAccount'),
      key: 'userProfileSetting',
      icon: <LockOutlined />,
      onClick: () => {
        // toggleUserProfileModal();
        dispatchEvent('moveTo', {
          path: '#userprofile',
        });
      },
    },
    {
      label: t('webui.menu.Preferences'),
      key: 'preferences',
      icon: <HolderOutlined />,
      onClick: () => {
        dispatchEvent('moveTo', {
          path: '/usersettings',
          params: { tab: 'general' },
        });
      },
    },
    {
      label: t('webui.menu.LogsErrors'),
      key: 'logs',
      icon: <FileTextOutlined />,
      onClick: () => {
        dispatchEvent('moveTo', {
          path: '/usersettings',
          params: { tab: 'logs' },
        });
      },
    },
    {
      label: t('webui.menu.LogOut'),
      key: 'logout',
      icon: <LogoutOutlined />,
      onClick: () => {
        const event: CustomEvent = new CustomEvent('backend-ai-logout');
        document.dispatchEvent(event);
      },
    },
  ];

  return (
    <>
      <Dropdown
        menu={{ items }}
        trigger={['click']}
        open={debouncedOpenToFixDropdownMenu}
        onOpenChange={(v) => setOpen(v)}
      >
        <Flex direction="row" gap="sm" style={{ cursor: 'pointer' }}>
          {screens.md && (
            <span style={{ maxWidth: '15vw' }}>
              <Typography.Text
                strong
                ellipsis
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {userInfo.username}
              </Typography.Text>
            </span>
          )}
          <Avatar icon={<UserOutlined />} />
        </Flex>
      </Dropdown>
    </>
  );
};

export default UserDropdownMenu;
