import { useWebUINavigate } from '../hooks';
import {
  useCurrentUserInfo,
  useCurrentUserRole,
  useTOTPSupported,
} from '../hooks/backendai';
import { UserProfileQuery } from './UserProfileSettingModalQuery';
import { UserProfileSettingModalQuery } from './__generated__/UserProfileSettingModalQuery.graphql';
import UserOutlinedIcon from './icons/UserOutlinedIcon';
import {
  UserOutlined,
  MailOutlined,
  SecurityScanOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
  FileTextOutlined,
  LogoutOutlined,
  LoadingOutlined,
  SettingOutlined,
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
import _ from 'lodash';
import React, { Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryLoader } from 'react-relay';

const UserProfileSettingModal = React.lazy(
  () => import('./UserProfileSettingModal'),
);

interface UserDropdownMenu {
  iconColor?: string;
  color?: string;
}

const UserDropdownMenu: React.FC<UserDropdownMenu> = ({ ...props }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [userInfo] = useCurrentUserInfo();
  const screens = Grid.useBreakpoint();

  const [isOpenUserSettingModal, { set: setIsOpenUserSettingModal }] =
    useToggle(false);
  // const debouncedOpenToFixDropdownMenu = useDebounce(open, {
  //   wait: 100,
  //   leading: true,
  //   trailing: false,
  // });

  const userRole = useCurrentUserRole();

  const webuiNavigate = useWebUINavigate();
  const { isTOTPSupported } = useTOTPSupported();

  const [isPendingRefreshModal, startRefreshModalTransition] = useTransition();
  const [
    isPendingInitializeSettingModal,
    startInitializeSettingModalTransition,
  ] = useTransition();
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
      icon: isPendingInitializeSettingModal ? (
        <LoadingOutlined spin />
      ) : (
        <LockOutlined />
      ),
      onClick: (e) => {
        startInitializeSettingModalTransition(() => {
          loadUserProfileSettingQuery(
            {
              email: userInfo.email,
              isNotSupportTotp: !isTOTPSupported,
            },
            {
              fetchPolicy: 'network-only',
            },
          );
          setIsOpenUserSettingModal(true);
        });
        // e.domEvent.stopPropagation();
        // e.domEvent.preventDefault();
      },
    },
    {
      label: t('webui.menu.Preferences'),
      key: 'preferences',
      icon: <SettingOutlined />,
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
        webuiNavigate('/usersettings?tab=logs');
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
        <Button
          type="text"
          size="large"
          data-testid="user-dropdown-button"
          // loading={isPendingInitializeSettingModal}
          onClick={(e) => e.preventDefault()}
          style={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -2,
            fontSize: token.fontSize,
            color: token.colorIcon,
          }}
          icon={
            <Avatar
              size={17}
              icon={<UserOutlinedIcon style={{ fontSize: 20 }} />}
              style={{
                border: 1,
              }}
            ></Avatar>
          }
        >
          {screens.lg && _.truncate(userInfo.username, { length: 30 })}
        </Button>
      </Dropdown>
      <Suspense>
        {userProfileSettingQueryRef && (
          <UserProfileSettingModal
            totpSupported={isTOTPSupported}
            queryRef={userProfileSettingQueryRef}
            open={isOpenUserSettingModal}
            onRequestClose={() => {
              setIsOpenUserSettingModal(false);
            }}
            isRefreshModalPending={isPendingRefreshModal}
            onRequestRefresh={() => {
              startRefreshModalTransition(() => {
                loadUserProfileSettingQuery(
                  {
                    email: userInfo.email,
                    isNotSupportTotp: !isTOTPSupported,
                  },
                  {
                    fetchPolicy: 'network-only',
                  },
                );
              });
            }}
          />
        )}
      </Suspense>
    </>
  );
};

export default UserDropdownMenu;
