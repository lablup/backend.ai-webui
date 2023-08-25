import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { useWebComponentInfo } from './DefaultProviders';
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
import { useToggle } from 'ahooks';
import { Button, Dropdown, MenuProps } from 'antd';
import { update } from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const UserDropdownMenu: React.FC = () => {
  const { t } = useTranslation();

  const { dispatchEvent } = useWebComponentInfo();

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

  const getUsername = () => {
    let name =
      baiClient.full_name?.replace(/\s+/g, '').length > 0
        ? baiClient.full_name
        : baiClient.email;
    // mask username only when the configuration is enabled
    if (baiClient._config.maskUserInfo) {
      const maskStartIdx = 2;
      const emailPattern =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      const isEmail: boolean = emailPattern.test(name);
      const maskLength = isEmail
        ? name.split('@')[0].length - maskStartIdx
        : name.length - maskStartIdx;
      name = maskString(name, '*', maskStartIdx, maskLength);
    }
    return name;
  };

  const maskString = (
    value = '',
    maskChar = '*',
    startFrom = 0,
    maskLength = 0,
  ) => {
    // clamp mask length
    maskLength =
      startFrom + maskLength > value.length ? value.length : maskLength;
    return (
      value.substring(0, startFrom) +
      maskChar.repeat(maskLength) +
      value.substring(startFrom + maskLength, value.length)
    );
  };

  const [fullName, updateFullName] = useState(getUsername());

  const [isOpenUserProfileModal, { toggle: toggleUserProfileModal }] =
    useToggle(false);

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
        toggleUserProfileModal();
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
    <>
      {fullName}
      <Dropdown menu={{ items }} trigger={['click']}>
        <Button type="text" shape="circle">
          <UserOutlined style={{ fontSize: '20px' }} />
        </Button>
      </Dropdown>
      <UserProfileSettingModal
        open={isOpenUserProfileModal}
        onRequestClose={() => toggleUserProfileModal()}
        onRequestUpdateFullName={(newFullName) => updateFullName(newFullName)}
      />
    </>
  );
};

export default UserDropdownMenu;
