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
import TerminateSessionModal from './TerminateSessionModal';
import { Tooltip, Button, theme, Space, ButtonProps } from 'antd';
import {
  BAIAppIcon,
  BAIContainerCommitIcon,
  BAISessionLogIcon,
  BAITerminalAppIcon,
  BAITerminateIcon,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import _ from 'lodash';
import React, { Suspense, useState, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

type SessionActionButtonKey =
  | 'appLauncher'
  | 'terminal'
  | 'logs'
  | 'containerCommit'
  | 'terminate';

interface SessionActionButtonsProps {
  sessionFrgmt: SessionActionButtonsFragment$key | null;
  size?: ButtonProps['size'];
  compact?: boolean;
  hiddenButtonKeys?: SessionActionButtonKey[];
  onAction?: (action: SessionActionButtonKey) => void;
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

const SessionActionButtons: React.FC<SessionActionButtonsProps> = ({
  sessionFrgmt,
  compact,
  size,
  hiddenButtonKeys,
  onAction,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const appLauncher = useBackendAIAppLauncher();
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
      }
    `,
    sessionFrgmt,
  );

  const [openAppLauncherModal, setOpenAppLauncherModal] = useState(false);
  const [openTerminateModal, setOpenTerminateModal] = useState(false);
  const [openLogModal, setOpenLogModal] = useState(false);
  const [openContainerCommitModal, setOpenContainerCommitModal] =
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

    // If containerCommit feature is disabled in the config, hide the button
    if (!baiClient._config.enableContainerCommit && key === 'containerCommit') {
      return false;
    }
    return !hiddenButtons.has(key);
  };

  const Wrapper: React.FC<PropsWithChildren> = ({ children }) => {
    return compact ? (
      <Space.Compact>{children}</Space.Compact>
    ) : (
      <>{children}</>
    );
  };

  // When size is 'small', use the button's title attribute instead of a Tooltip
  const isButtonTitleMode = size === 'small';

  return session ? (
    <Wrapper>
      {isVisible('appLauncher') && (
        <>
          <Tooltip
            title={isButtonTitleMode ? undefined : t('session.SeeAppDialog')}
          >
            <Button
              size={size}
              type="primary"
              disabled={
                !isAppSupported(session) || !isActive(session) || !isOwner
              }
              icon={<BAIAppIcon />}
              onClick={() => {
                onAction?.('appLauncher');
                setOpenAppLauncherModal(true);
              }}
              title={isButtonTitleMode ? t('session.SeeAppDialog') : undefined}
            />
          </Tooltip>
          <Suspense fallback={null}>
            <AppLauncherModal
              sessionFrgmt={session}
              open={openAppLauncherModal}
              onRequestClose={() => {
                setOpenAppLauncherModal(false);
              }}
            />
          </Suspense>
        </>
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
                appLauncher.runTerminal(session?.row_id);
              }}
              title={
                isButtonTitleMode ? t('session.ExecuteTerminalApp') : undefined
              }
            />
          </Tooltip>
          <TerminateSessionModal
            sessionFrgmts={[session]}
            open={openTerminateModal}
            onRequestClose={() => {
              setOpenTerminateModal(false);
            }}
          />
        </>
      )}

      {isVisible('logs') && (
        <>
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
          <BAIUnmountAfterClose>
            <ContainerLogModal
              sessionFrgmt={session}
              open={openLogModal}
              onCancel={() => {
                setOpenLogModal(false);
              }}
            />
          </BAIUnmountAfterClose>
        </>
      )}

      {isVisible('containerCommit') && (
        <>
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
          <ContainerCommitModal
            sessionFrgmt={session}
            open={openContainerCommitModal}
            onRequestClose={() => setOpenContainerCommitModal(false)}
          />
        </>
      )}
      {isVisible('terminate') && (
        <Tooltip
          title={isButtonTitleMode ? undefined : t('session.TerminateSession')}
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
  ) : (
    []
  );
};

export default SessionActionButtons;
