import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useCurrentUserInfo, useCurrentUserRole } from '../hooks/backendai';
import { useTanQuery } from '../hooks/reactQueryAlias';
import Flex from './Flex';
import UserProfileSettingModal, {
  UserProfileQuery,
} from './UserProfileSettingModal';
import { UserProfileSettingModalQuery } from './__generated__/UserProfileSettingModalQuery.graphql';
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
import {
  Avatar,
  Button,
  Dropdown,
  Grid,
  MenuProps,
  Typography,
  theme,
} from 'antd';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryLoader } from 'react-relay';

const UserDropdownMenu: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [userInfo] = useCurrentUserInfo();
  const screens = Grid.useBreakpoint();
  const baiClient = useSuspendedBackendaiClient();

  const [isOpenUserSettingModal, { set: setIsOpenUserSettingModal }] =
    useToggle(false);
  // const debouncedOpenToFixDropdownMenu = useDebounce(open, {
  //   wait: 100,
  //   leading: true,
  //   trailing: false,
  // });

  const userRole = useCurrentUserRole();

  const webuiNavigate = useWebUINavigate();
  const { data: isManagerSupportingTOTP } = useTanQuery<boolean>(
    'isManagerSupportingTOTP',
    () => {
      return baiClient.isManagerSupportingTOTP();
    },
    {
      suspense: false,
    },
  );
  const totpSupported = baiClient.supports('2FA') && isManagerSupportingTOTP;
  const items: MenuProps['items'] = [
    {
      label: <Typography.Text>{userInfo.username}</Typography.Text>, //To display properly when the user name is too long.
      key: 'userFullName',
      icon: <UserOutlined />,
      disabled: true,
      style: {
        color: token.colorText,
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
        loadUserProfileSettingQuery({
          email: userInfo.email,
          isNotSupportTotp: !totpSupported,
        });
        setIsOpenUserSettingModal(true);
        // toggleUserProfileModal();
        // dispatchEvent('moveTo', {
        //   path: '#userprofile',
        // });
      },
    },
    {
      label: t('webui.menu.Preferences'),
      key: 'preferences',
      icon: <HolderOutlined />,
      onClick: () => {
        webuiNavigate('/usersettings', {
          params: {
            tab: 'general',
          },
        });
        // dispatch event to update tab of backend-ai-usersettings
        const event = new CustomEvent('backend-ai-usersettings', {});
        document.dispatchEvent(event);
      },
    },
    {
      label: t('webui.menu.LogsErrors'),
      key: 'logs',
      icon: <FileTextOutlined />,
      onClick: () => {
        webuiNavigate('/usersettings', {
          params: {
            tab: 'logs',
          },
        });
        // dispatch event to update tab of backend-ai-usersettings
        const event = new CustomEvent('backend-ai-usersettings', {});
        document.dispatchEvent(event);
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

  const [userProfileSettingQueryRef, loadUserProfileSettingQuery] =
    useQueryLoader<UserProfileSettingModalQuery>(UserProfileQuery);

  return (
    <>
      <Dropdown
        menu={{ items }}
        trigger={['click']}
        // open={debouncedOpenToFixDropdownMenu}
        overlayStyle={{
          maxWidth: 300,
        }}
        placement="bottomRight"
      >
        <Button type="text" size="large">
          <Flex
            direction="row"
            gap="sm"
            style={{ cursor: 'pointer', maxWidth: '15vw' }}
          >
            <Flex>
              <Avatar size={'small'} icon={<UserOutlined />} />
            </Flex>
            {screens.md && (
              <Typography.Text strong ellipsis>
                {userInfo.username}
              </Typography.Text>
            )}
          </Flex>
        </Button>
      </Dropdown>
      <Suspense>
        {userProfileSettingQueryRef && (
          <UserProfileSettingModal
            totpSupported={totpSupported}
            queryRef={userProfileSettingQueryRef}
            open={isOpenUserSettingModal}
            onRequestClose={() => {
              setIsOpenUserSettingModal(false);
            }}
            onRequestRefresh={() => {}}
          />
        )}
      </Suspense>
    </>
  );
};

export default UserDropdownMenu;
