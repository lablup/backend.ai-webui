/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserDropdownMenuQuery } from '../__generated__/UserDropdownMenuQuery.graphql';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import {
  useCurrentUserInfo,
  useCurrentUserRole,
  useTOTPSupported,
} from '../hooks/backendai';
import AboutBackendAIModal from './AboutBackendAIModal';
import DesktopAppDownloadModal from './DesktopAppDownloadModal';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import {
  UserOutlined,
  MailOutlined,
  SecurityScanOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
  FileTextOutlined,
  LogoutOutlined,
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
import {
  BAIUnmountAfterClose,
  filterOutEmpty,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { CSSProperties, Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const UserProfileSettingModal = React.lazy(
  () => import('./UserProfileSettingModal'),
);

const UserDropdownMenu: React.FC<{
  buttonRender?: (defaultButton: React.ReactNode) => React.ReactNode;
  style?: CSSProperties;
}> = ({ buttonRender = (btn) => btn, style }) => {
  'use memo';
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

  const [fetchKey, updateFetchKey] = useFetchKey();
  const [, startRefetchTransition] = useTransition();

  const { user, myClientIp } = useLazyLoadQuery<UserDropdownMenuQuery>(
    graphql`
      query UserDropdownMenuQuery(
        $email: String!
        $isNotSupportTotp: Boolean!
        $isNotSupportUpdateUserV2: Boolean!
      ) {
        user(email: $email) {
          full_name
          ...UserProfileSettingModalFragment
        }
        myClientIp @skipOnClient(if: $isNotSupportUpdateUserV2) {
          clientIp
        }
      }
    `,
    {
      email: baiClient.email,
      isNotSupportTotp: !isTOTPSupported,
      isNotSupportUpdateUserV2: !baiClient.supports('update-user-v2'),
    },
    {
      fetchPolicy: 'store-and-network',
      fetchKey,
    },
  );

  const currentClientIp = baiClient.supports('update-user-v2')
    ? myClientIp?.clientIp
    : undefined;

  const displayName =
    _.trim(user?.full_name ?? '').length > 0
      ? (user?.full_name ?? '')
      : userInfo.email;

  const items: MenuProps['items'] = filterOutEmpty([
    {
      'data-testid': 'dropdown-user-name',
      label: <Typography.Text>{displayName}</Typography.Text>,
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
      icon: <LockOutlined />,
      onClick: () => {
        setIsOpenUserSettingModal(true);
      },
    },
    {
      'data-testid': 'dropdown-preferences',
      label: t('webui.menu.Preferences'),
      key: 'preferences',
      icon: <SettingOutlined />,
      onClick: () => {
        webuiNavigate('/usersettings?tab=general');
      },
    },
    {
      'data-testid': 'dropdown-logs-errors',
      label: t('webui.menu.LogsErrors'),
      key: 'logs',
      icon: <FileTextOutlined />,
      onClick: () => {
        webuiNavigate('/usersettings?tab=logs');
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
  ]);

  return (
    <>
      <Dropdown
        menu={{ items }}
        trigger={['click']}
        styles={{
          root: {
            maxWidth: 300,
          },
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
            icon={
              <Avatar
                size={17}
                style={{
                  backgroundColor: token.colorBgBase,
                }}
              >
                <UserOutlined
                  style={{ fontSize: 10, color: token.colorPrimary }}
                />
              </Avatar>
            }
          >
            {screens.lg && _.truncate(displayName, { length: 30 })}
          </Button>,
        )}
      </Dropdown>
      <ErrorBoundaryWithNullFallback>
        <Suspense>
          {isOpenUserSettingModal && (
            <BAIUnmountAfterClose>
              <UserProfileSettingModal
                totpSupported={isTOTPSupported}
                userFrgmt={user}
                currentClientIp={currentClientIp}
                open={isOpenUserSettingModal}
                onRequestClose={() => {
                  setIsOpenUserSettingModal(false);
                }}
                onRequestRefresh={() => {
                  startRefetchTransition(() => {
                    updateFetchKey();
                  });
                }}
              />
            </BAIUnmountAfterClose>
          )}
        </Suspense>
        <BAIUnmountAfterClose>
          <DesktopAppDownloadModal
            open={isDownloadModalOpen}
            onRequestClose={() => toggleDownloadModal()}
          />
        </BAIUnmountAfterClose>
        <BAIUnmountAfterClose>
          <AboutBackendAIModal
            open={isOpenAboutBAIModal}
            onRequestClose={toggleAboutBAIModal}
          />
        </BAIUnmountAfterClose>
      </ErrorBoundaryWithNullFallback>
    </>
  );
};

export default UserDropdownMenu;
