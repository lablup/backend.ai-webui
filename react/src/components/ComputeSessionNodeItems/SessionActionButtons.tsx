/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  SessionActionButtonsFragment$data,
  SessionActionButtonsFragment$key,
} from '../../__generated__/SessionActionButtonsFragment.graphql';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useCurrentUserInfo } from '../../hooks/backendai';
import { useBackendAIAppLauncher } from '../../hooks/useBackendAIAppLauncher';
import ErrorBoundaryWithNullFallback from '../ErrorBoundaryWithNullFallback';
import AppLauncherModal from './AppLauncherModal';
import ContainerCommitModal from './ContainerCommitModal';
import ContainerLogModal from './ContainerLogModal';
import SFTPConnectionInfoModal from './SFTPConnectionInfoModal';
import TerminateSessionModal from './TerminateSessionModal';
import { Tooltip, Button, theme, Space, type ButtonProps } from 'antd';
import {
  BAIAppIcon,
  BAIContainerCommitIcon,
  BAIFileBrowserIcon,
  BAIJupyterIcon,
  BAISessionLogIcon,
  BAISftpIcon,
  BAITerminalAppIcon,
  BAITerminateIcon,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

type SessionActionButtonKey =
  | 'appLauncher'
  | 'terminal'
  | 'logs'
  | 'containerCommit'
  | 'sftp'
  | 'terminate';

export type PrimaryAppOption = {
  appName: 'jupyter' | 'filebrowser';
  urlPostfix?: string;
};

interface SessionActionButtonsProps {
  sessionFrgmt: SessionActionButtonsFragment$key | null;
  size?: ButtonProps['size'];
  compact?: boolean;
  hiddenButtonKeys?: SessionActionButtonKey[];
  onAction?: (action: SessionActionButtonKey) => void;
  primaryAppOption?: PrimaryAppOption;
}

const isActive = (session: SessionActionButtonsFragment$data) => {
  if (session?.type === 'system') {
    return session?.status === 'RUNNING';
  }
  return !['TERMINATED', 'CANCELLED', 'TERMINATING'].includes(
    session?.status || '',
  );
};
const isAppSupported = (session: SessionActionButtonsFragment$data) => {
  return (
    ['batch', 'interactive', 'inference', 'system', 'running'].includes(
      session?.type || '',
    ) && !_.isEmpty(JSON.parse(session?.service_ports ?? '{}'))
  );
};

const Wrapper: React.FC<{ compact?: boolean; children?: React.ReactNode }> = ({
  children,
  compact,
}) => {
  return compact ? <Space.Compact>{children}</Space.Compact> : <>{children}</>;
};

const SessionActionButtons: React.FC<SessionActionButtonsProps> = ({
  sessionFrgmt,
  compact,
  size,
  hiddenButtonKeys,
  primaryAppOption,
  onAction,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();

  const session = useFragment(
    graphql`
      fragment SessionActionButtonsFragment on ComputeSessionNode {
        id
        name
        row_id @required(action: NONE)
        type
        status
        access_key
        service_ports
        commit_status
        user_id
        ...TerminateSessionModalFragment
        ...ContainerLogModalFragment
        ...ContainerCommitModalFragment
        ...AppLauncherModalFragment
        ...SFTPConnectionInfoModalFragment
        ...useBackendAIAppLauncherFragment
      }
    `,
    sessionFrgmt,
  );
  const appLauncher = useBackendAIAppLauncher(session);

  const [openAppLauncherModal, setOpenAppLauncherModal] = useState(false);
  const [openTerminateModal, setOpenTerminateModal] = useState(false);
  const [openLogModal, setOpenLogModal] = useState(false);
  const [openContainerCommitModal, setOpenContainerCommitModal] =
    useState(false);
  const [openSFTPConnectionInfoModal, setOpenSFTPConnectionInfoModal] =
    useState(false);

  const userInfo = useCurrentUserInfo();
  const isOwner = userInfo[0]?.uuid === session?.user_id;
  // The session row's access_key is set when the session was created.
  // If the current keypair is different, manager APIs return 403
  // ("Only admins can perform operations on behalf of other users.")
  // for any per-session action — disable the buttons upfront instead.
  const isAccessKeyMismatch =
    !!session?.access_key &&
    !!baiClient._config.accessKey &&
    session.access_key !== baiClient._config.accessKey;

  // Only swap to the mismatch tooltip when switching access keys would
  // actually unblock the user — i.e. they own the session. For non-owners
  // the button is already disabled for a different reason and the mismatch
  // copy ("Switch to that access key to manage this session") would be
  // misleading.
  const resolveTooltip = (defaultTitle: string) =>
    isAccessKeyMismatch && isOwner
      ? t('session.AccessKeyMismatchTooltip')
      : defaultTitle;

  const hiddenButtons = React.useMemo(
    () => new Set(hiddenButtonKeys ?? []),
    [hiddenButtonKeys],
  );
  const isVisible = (key: SessionActionButtonKey) => {
    // If system session, hide not applicable buttons
    if (
      ['appLauncher', 'terminal', 'containerCommit'].includes(key) &&
      session?.type === 'system'
    ) {
      return false;
    }

    // sftp button is only for system sessions
    if (key === 'sftp' && session?.type !== 'system') {
      return false;
    }

    // If containerCommit feature is disabled in the config, hide the button
    if (!baiClient._config.enableContainerCommit && key === 'containerCommit') {
      return false;
    }
    return !hiddenButtons.has(key);
  };

  // When size is 'small', use the button's title attribute instead of a Tooltip
  const isButtonTitleMode = size === 'small';

  const launchApp = () => {
    if (!primaryAppOption?.appName) return;

    appLauncher.launchAppWithNotification({
      app: primaryAppOption.appName,
      onPrepared(workInfo) {
        if (workInfo.appConnectUrl) {
          const urlPostfix = primaryAppOption.urlPostfix || '';
          const targetUrl = urlPostfix
            ? new URL(urlPostfix, workInfo.appConnectUrl.href)
            : workInfo.appConnectUrl;
          setTimeout(() => {
            globalThis.open(targetUrl.href, '_blank');
          }, 1000);
        }
      },
    });
  };

  return session ? (
    <>
      <Wrapper compact={compact}>
        {primaryAppOption && (
          <>
            {primaryAppOption.appName === 'jupyter' && (
              <Tooltip
                title={
                  isButtonTitleMode
                    ? undefined
                    : resolveTooltip(
                        t('session.ExecuteSpecificApp', {
                          appName: 'Jupyter Notebook',
                        }),
                      )
                }
              >
                <Button
                  size={size}
                  type={'primary'}
                  disabled={
                    !isAppSupported(session) ||
                    !isActive(session) ||
                    !isOwner ||
                    isAccessKeyMismatch
                  }
                  icon={<BAIJupyterIcon />}
                  onClick={() => {
                    launchApp();
                  }}
                  title={
                    isButtonTitleMode
                      ? resolveTooltip(
                          t('session.ExecuteSpecificApp', {
                            appName: 'Jupyter Notebook',
                          }),
                        )
                      : undefined
                  }
                />
              </Tooltip>
            )}
            {primaryAppOption.appName === 'filebrowser' && (
              <Tooltip
                title={
                  isButtonTitleMode
                    ? undefined
                    : resolveTooltip(
                        t('session.ExecuteSpecificApp', {
                          appName: 'File browser',
                        }),
                      )
                }
              >
                <Button
                  size={size}
                  type={'primary'}
                  disabled={
                    !isAppSupported(session) ||
                    !isActive(session) ||
                    !isOwner ||
                    isAccessKeyMismatch
                  }
                  icon={<BAIFileBrowserIcon />}
                  onClick={() => {
                    launchApp();
                  }}
                  title={
                    isButtonTitleMode
                      ? resolveTooltip(
                          t('session.ExecuteSpecificApp', {
                            appName: 'File browser',
                          }),
                        )
                      : undefined
                  }
                />
              </Tooltip>
            )}
          </>
        )}
        {isVisible('appLauncher') && (
          <>
            <Tooltip
              title={
                isButtonTitleMode
                  ? undefined
                  : resolveTooltip(t('session.SeeAppDialog'))
              }
            >
              <Button
                size={size}
                type={primaryAppOption ? undefined : 'primary'}
                disabled={
                  !isAppSupported(session) ||
                  !isActive(session) ||
                  !isOwner ||
                  isAccessKeyMismatch
                }
                icon={<BAIAppIcon />}
                onClick={() => {
                  onAction?.('appLauncher');
                  setOpenAppLauncherModal(true);
                }}
                title={
                  isButtonTitleMode
                    ? resolveTooltip(t('session.SeeAppDialog'))
                    : undefined
                }
              />
            </Tooltip>
          </>
        )}
        {isVisible('sftp') && (
          <Tooltip title={resolveTooltip(t('data.explorer.RunSSH/SFTPserver'))}>
            <Button
              type="primary"
              disabled={!isActive(session) || !isOwner || isAccessKeyMismatch}
              size={size}
              icon={<BAISftpIcon />}
              onClick={() => {
                setOpenSFTPConnectionInfoModal(true);
              }}
            />
          </Tooltip>
        )}
        {isVisible('terminal') && (
          <>
            <Tooltip
              title={
                isButtonTitleMode
                  ? undefined
                  : resolveTooltip(t('session.ExecuteTerminalApp'))
              }
            >
              <Button
                size={size}
                disabled={
                  !isAppSupported(session) ||
                  !isActive(session) ||
                  !isOwner ||
                  isAccessKeyMismatch
                }
                icon={<BAITerminalAppIcon />}
                onClick={() => {
                  onAction?.('terminal');
                  appLauncher.runTerminal({});
                }}
                title={
                  isButtonTitleMode
                    ? resolveTooltip(t('session.ExecuteTerminalApp'))
                    : undefined
                }
              />
            </Tooltip>
          </>
        )}
        {isVisible('logs') && (
          <Tooltip
            title={
              isButtonTitleMode
                ? undefined
                : resolveTooltip(t('session.SeeContainerLogs'))
            }
          >
            <Button
              size={size}
              disabled={isAccessKeyMismatch}
              icon={<BAISessionLogIcon />}
              onClick={() => {
                onAction?.('logs');
                setOpenLogModal(true);
              }}
              title={
                isButtonTitleMode
                  ? resolveTooltip(t('session.SeeContainerLogs'))
                  : undefined
              }
            />
          </Tooltip>
        )}
        {isVisible('containerCommit') && (
          <Tooltip
            title={
              isButtonTitleMode
                ? undefined
                : resolveTooltip(t('session.RequestContainerCommit'))
            }
          >
            <Button
              size={size}
              disabled={
                session?.status !== 'RUNNING' || !isOwner || isAccessKeyMismatch
              }
              icon={<BAIContainerCommitIcon />}
              onClick={() => {
                onAction?.('containerCommit');
                setOpenContainerCommitModal(true);
              }}
              title={
                isButtonTitleMode
                  ? resolveTooltip(t('session.RequestContainerCommit'))
                  : undefined
              }
            />
          </Tooltip>
        )}
        {isVisible('terminate') && (
          <Tooltip
            title={
              isButtonTitleMode
                ? undefined
                : resolveTooltip(t('session.TerminateSession'))
            }
          >
            <Button
              size={size}
              disabled={!isActive(session) || isAccessKeyMismatch}
              icon={
                <BAITerminateIcon
                  style={{
                    color:
                      isActive(session) && !isAccessKeyMismatch
                        ? token.colorError
                        : undefined,
                  }}
                />
              }
              onClick={() => {
                onAction?.('terminate');
                setOpenTerminateModal(true);
              }}
              title={
                isButtonTitleMode
                  ? resolveTooltip(t('session.TerminateSession'))
                  : undefined
              }
            />
          </Tooltip>
        )}
      </Wrapper>

      <Suspense fallback={null}>
        {isVisible('appLauncher') && (
          <ErrorBoundaryWithNullFallback>
            <BAIUnmountAfterClose>
              <AppLauncherModal
                sessionFrgmt={session}
                open={openAppLauncherModal}
                onRequestClose={() => {
                  setOpenAppLauncherModal(false);
                }}
              />
            </BAIUnmountAfterClose>
          </ErrorBoundaryWithNullFallback>
        )}
        {isVisible('logs') && (
          <BAIUnmountAfterClose>
            <ContainerLogModal
              sessionFrgmt={session}
              open={openLogModal}
              onCancel={() => {
                setOpenLogModal(false);
              }}
            />
          </BAIUnmountAfterClose>
        )}
        {isVisible('containerCommit') && (
          <ContainerCommitModal
            sessionFrgmt={session}
            open={openContainerCommitModal}
            onRequestClose={() => setOpenContainerCommitModal(false)}
          />
        )}
        {isVisible('sftp') && (
          <BAIUnmountAfterClose>
            <SFTPConnectionInfoModal
              sessionFrgmt={session}
              open={openSFTPConnectionInfoModal}
              onCancel={() => {
                setOpenSFTPConnectionInfoModal(false);
              }}
            />
          </BAIUnmountAfterClose>
        )}
        {isVisible('terminate') && (
          <TerminateSessionModal
            sessionFrgmts={[session]}
            open={openTerminateModal}
            onRequestClose={() => {
              setOpenTerminateModal(false);
            }}
          />
        )}
      </Suspense>
    </>
  ) : (
    []
  );
};

export default SessionActionButtons;
