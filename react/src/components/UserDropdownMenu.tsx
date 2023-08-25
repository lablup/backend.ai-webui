import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { useWebComponentInfo } from './DefaultProviders';
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
import { Button, Dropdown, MenuProps } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

const UserDropdownMenu: React.FC = () => {
  const { t } = useTranslation();

  const { value, dispatchEvent } = useWebComponentInfo();
  let parsedValue: {
    fullName: string;
  };
  try {
    parsedValue = JSON.parse(value || '');
  } catch (error) {
    parsedValue = {
      fullName: '',
    };
  }

  const { fullName } = parsedValue;

  const baiClient = useSuspendedBackendaiClient();

  const { data: userInfo } = useTanQuery(
    'getUserRole',
    () => {
      return baiClient.user.get(baiClient.email, ['role']);
    },
    {
      suspense: false,
    },
  );
  const userRole = userInfo?.user.role;

  const items: MenuProps['items'] = [
    {
      label: fullName,
      key: 'userFullName',
      icon: <UserOutlined />,
      disabled: true,
      style: {
        color: '#1f1f1f',
        cursor: 'default',
      },
    },
    {
      label: baiClient.email,
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
        dispatchEvent('open', null);
      },
    },
    {
      label: t('webui.menu.Preferences'),
      key: 'preferences',
      icon: <HolderOutlined />,
      onClick: () => {
        dispatchEvent('moveToUserSettingPage', null);
      },
    },
    {
      label: t('webui.menu.LogsErrors'),
      key: 'logs',
      icon: <FileTextOutlined />,
      onClick: () => {
        dispatchEvent('moveToLogPage', null);
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
    <Dropdown menu={{ items }} trigger={['click']}>
      <Button type="text" shape="circle">
        <UserOutlined style={{ fontSize: '20px' }} />
      </Button>
    </Dropdown>
  );
};

export default UserDropdownMenu;
