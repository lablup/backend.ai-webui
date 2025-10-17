import { UserProfileSettingModalQuery } from '../__generated__/UserProfileSettingModalQuery.graphql';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import {
  useCurrentUserInfo,
  useCurrentUserRole,
  useTOTPSupported,
} from '../hooks/backendai';
import AboutBackendAIModal from './AboutBackendAIModal';
import DesktopAppDownloadModal from './DesktopAppDownloadModal';
import { UserProfileQuery } from './UserProfileSettingModalQuery';
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
  DownloadOutlined,
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
import React, { CSSProperties, Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryLoader } from 'react-relay';

const UserProfileSettingModal = React.lazy(
  () => import('./UserProfileSettingModal'),
);

const UserDropdownMenu: React.FC<{
  buttonRender?: (defaultButton: React.ReactNode) => React.ReactNode;
  style?: CSSProperties;
}> = ({ buttonRender = (btn) => btn, style }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [userInfo] = useCurrentUserInfo();
  const screens = Grid.useBreakpoint();
  const baiClient = useSuspendedBackendaiClient();

  const [isOpenUserSettingModal, { set: setIsOpenUserSettingModal }] =
    useToggle(false);
  const [isDownloadModalOpen, { toggle: toggleDownloadModal }] =
    useToggle(false);
  const [isOpenAboutBAIModal, { toggle: toggleAboutBAIModal }] =
    useToggle(false);

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
      'data-testid': 'dropdown-user-name',
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
      'data-testid': 'dropdown-user-email',
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
      'data-testid': 'dropdown-user-role',
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
      'data-testid': 'dropdown-about-backend-ai',
      label: t('webui.menu.AboutBackendAI'),
      key: 'description',
      icon: <ExclamationCircleOutlined />,
      onClick: () => {
        toggleAboutBAIModal();
      },
    },
    {
      'data-testid': 'dropdown-my-account',
      label: t('webui.menu.MyAccount'),
      key: 'userProfileSetting',
      icon: isPendingInitializeSettingModal ? (
        <LoadingOutlined spin />
      ) : (
        <LockOutlined />
      ),
      onClick: () => {
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
      'data-testid': 'dropdown-preferences',
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
      'data-testid': 'dropdown-logs-errors',
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
    baiClient._config.allowAppDownloadPanel && {
      label: t('summary.DownloadWebUIApp'),
      key: 'downloadDesktopApp',
      icon: <DownloadOutlined />,
      onClick: () => toggleDownloadModal(),
    },
    {
      'data-testid': 'dropdown-logout',
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
        overlayStyle={{
          maxWidth: 300,
        }}
        placement="bottomRight"
      >
        {buttonRender(
          <Button
            type="text"
            data-testid="user-dropdown-button"
            style={{
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -2,
              fontSize: token.fontSizeLG,
              ...style,
            }}
            // icon={<UserOutlined />}
            icon={
              <Avatar
                size={17}
                icon={
                  <UserOutlined
                    style={{ fontSize: 10, color: token.colorPrimary }}
                  />
                }
                style={{
                  // border: 1,
                  backgroundColor: token.colorBgBase,
                }}
              ></Avatar>
            }
          >
            {screens.lg && _.truncate(userInfo.username, { length: 30 })}
          </Button>,
        )}
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
      <DesktopAppDownloadModal
        open={isDownloadModalOpen}
        onRequestClose={() => toggleDownloadModal()}
      />
      <AboutBackendAIModal
        open={isOpenAboutBAIModal}
        onRequestClose={toggleAboutBAIModal}
      />
    </>
  );
};

export default UserDropdownMenu;
