import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { useWebComponentInfo } from './DefaultProviders';
import Flex from './Flex';
import UserProfileSettingModal from './UserProfileSettingModal';
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
import { useDebounce, useToggle } from 'ahooks';
import { Avatar, Dropdown, MenuProps } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const UserDropdownMenu: React.FC = () => {
  const { t } = useTranslation();
  const { dispatchEvent } = useWebComponentInfo();
  const baiClient = useSuspendedBackendaiClient();
  const [userInfo] = useCurrentUserInfo();
  const [open, setOpen] = useState(false);
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

  const [isOpenUserProfileModal, { toggle: toggleUserProfileModal }] =
    useToggle(false);

  const items: MenuProps['items'] = [
    {
      label: userInfo.username,
      key: 'userFullName',
      icon: <UserOutlined />,
      disabled: true,
      style: {
        color: '#1f1f1f',
        cursor: 'default',
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
        toggleUserProfileModal();
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
          <b>{userInfo.username}</b>
          <Avatar icon={<UserOutlined />} />
        </Flex>
      </Dropdown>
      <UserProfileSettingModal
        open={isOpenUserProfileModal}
        onRequestClose={() => toggleUserProfileModal()}
      />
    </>
  );
};

export default UserDropdownMenu;
