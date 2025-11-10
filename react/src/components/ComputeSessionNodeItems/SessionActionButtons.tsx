import {
  SessionActionButtonsFragment$data,
  SessionActionButtonsFragment$key,
} from '../../__generated__/SessionActionButtonsFragment.graphql';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useCurrentUserInfo } from '../../hooks/backendai';
import { useBackendAIAppLauncher } from '../../hooks/useBackendAIAppLauncher';
import AppLauncherModal from './AppLauncherModal';
import ContainerCommitModal from './ContainerCommitModal';
import ContainerLogModal from './ContainerLogModal';
import SFTPConnectionInfoModal from './SFTPConnectionInfoModal';
import TerminateSessionModal from './TerminateSessionModal';
import { Tooltip, Button, theme, Space, ButtonProps } from 'antd';
import {
  BAIAppIcon,
  BAIContainerCommitIcon,
  BAIJupyterIcon,
  BAISessionLogIcon,
  BAISftpIcon,
  BAITerminalAppIcon,
  BAITerminateIcon,
  BAIUnmountAfterClose,
  omitNullAndUndefinedFields,
} from 'backend.ai-ui';
import _ from 'lodash';
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
  appName: 'jupyter';
  urlPostfix?: string;
};

interface SessionActionButtonsProps {
  sessionFrgmt: SessionActionButtonsFragment$key | null;
  size?: ButtonProps['size'];
  compact?: boolean;
  hiddenButtonKeys?: SessionActionButtonKey[];
  onAction?: (action: SessionActionButtonKey) => void;
  primaryAppOption?: PrimaryAppOption;
  noPrimaryButton?: boolean;
}

const isActive = (session: SessionActionButtonsFragment$data) => {
  return !['TERMINATED', 'CANCELLED', 'TERMINATING'].includes(
    session?.status || '',
  );
};
const isAppSupported = (session: SessionActionButtonsFragment$data) => {
  return (
    ['batch', 'interactive', 'inference', 'running'].includes(
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
  noPrimaryButton: noPrimaryColor,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();

  const session = useFragment(
    graphql`
      fragment SessionActionButtonsFragment on ComputeSessionNode {
        id
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

  return session ? (
    <>
      <Wrapper compact={compact}>
        {primaryAppOption && primaryAppOption.appName === 'jupyter' && (
          <Tooltip
            title={
              isButtonTitleMode
                ? undefined
                : t('session.ExecuteSpecificApp', {
                    appName: 'Jupyter Notebook',
                  })
            }
          >
            <Button
              size={size}
              type={noPrimaryColor ? undefined : 'primary'}
              disabled={
                !isAppSupported(session) || !isActive(session) || !isOwner
              }
              icon={<BAIJupyterIcon />}
              onClick={() => {
                const appOption = {
                  'app-name': primaryAppOption.appName,
                  'session-uuid': session?.row_id,
                  'url-postfix': primaryAppOption.urlPostfix,
                };

                // @ts-ignore
                globalThis.appLauncher._runApp(
                  omitNullAndUndefinedFields(appOption),
                );
              }}
              title={
                isButtonTitleMode
                  ? t('session.ExecuteSpecificApp', {
                      appName: 'Jupyter Notebook',
                    })
                  : undefined
              }
            />
          </Tooltip>
        )}
        {isVisible('appLauncher') && (
          <>
            <Tooltip
              title={isButtonTitleMode ? undefined : t('session.SeeAppDialog')}
            >
              <Button
                size={size}
                type={
                  primaryAppOption || noPrimaryColor ? undefined : 'primary'
                }
                disabled={
                  !isAppSupported(session) || !isActive(session) || !isOwner
                }
                icon={<BAIAppIcon />}
                onClick={() => {
                  onAction?.('appLauncher');
                  setOpenAppLauncherModal(true);
                }}
                title={
                  isButtonTitleMode ? t('session.SeeAppDialog') : undefined
                }
              />
            </Tooltip>
          </>
        )}
        {isVisible('sftp') && (
          <Tooltip title={t('data.explorer.RunSSH/SFTPserver')}>
            <Button
              type="primary"
              disabled={!isActive(session) || !isOwner}
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
                isButtonTitleMode ? undefined : t('session.ExecuteTerminalApp')
              }
            >
              <Button
                size={size}
                disabled={
                  !isAppSupported(session) || !isActive(session) || !isOwner
                }
                icon={<BAITerminalAppIcon />}
                onClick={() => {
                  onAction?.('terminal');
                  appLauncher.runTerminal();
                }}
                title={
                  isButtonTitleMode
                    ? t('session.ExecuteTerminalApp')
                    : undefined
                }
              />
            </Tooltip>
          </>
        )}
        {isVisible('logs') && (
          <Tooltip
            title={
              isButtonTitleMode ? undefined : t('session.SeeContainerLogs')
            }
          >
            <Button
              size={size}
              icon={<BAISessionLogIcon />}
              onClick={() => {
                onAction?.('logs');
                setOpenLogModal(true);
              }}
              title={
                isButtonTitleMode ? t('session.SeeContainerLogs') : undefined
              }
            />
          </Tooltip>
        )}
        {isVisible('containerCommit') && (
          <Tooltip
            title={
              isButtonTitleMode
                ? undefined
                : t('session.RequestContainerCommit')
            }
          >
            <Button
              size={size}
              disabled={!isActive(session) || !isOwner}
              icon={<BAIContainerCommitIcon />}
              onClick={() => {
                onAction?.('containerCommit');
                setOpenContainerCommitModal(true);
              }}
              title={
                isButtonTitleMode
                  ? t('session.RequestContainerCommit')
                  : undefined
              }
            />
          </Tooltip>
        )}
        {isVisible('terminate') && (
          <Tooltip
            title={
              isButtonTitleMode ? undefined : t('session.TerminateSession')
            }
          >
            <Button
              size={size}
              disabled={!isActive(session)}
              icon={
                <BAITerminateIcon
                  style={{
                    color: isActive(session) ? token.colorError : undefined,
                  }}
                />
              }
              onClick={() => {
                onAction?.('terminate');
                setOpenTerminateModal(true);
              }}
              title={
                isButtonTitleMode ? t('session.TerminateSession') : undefined
              }
            />
          </Tooltip>
        )}
      </Wrapper>

      <Suspense fallback={null}>
        {isVisible('appLauncher') && (
          <BAIUnmountAfterClose>
            <AppLauncherModal
              sessionFrgmt={session}
              open={openAppLauncherModal}
              onRequestClose={() => {
                setOpenAppLauncherModal(false);
              }}
            />
          </BAIUnmountAfterClose>
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
