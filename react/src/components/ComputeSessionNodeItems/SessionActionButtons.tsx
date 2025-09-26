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

interface SessionActionButtonsProps {
  sessionFrgmt: SessionActionButtonsFragment$key | null;
  size?: ButtonProps['size'];
  compact?: boolean;
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

  const Wrapper: React.FC<PropsWithChildren> = ({ children }) => {
    return compact ? (
      <Space.Compact>{children}</Space.Compact>
    ) : (
      <>{children}</>
    );
  };
  return session ? (
    <Wrapper>
      {session.type !== 'system' && (
        <>
          <Tooltip title={t('session.SeeAppDialog')}>
            <Button
              size={size}
              disabled={
                !isAppSupported(session) || !isActive(session) || !isOwner
              }
              icon={<BAIAppIcon />}
              onClick={() => {
                setOpenAppLauncherModal(true);
              }}
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
          <Tooltip title={t('session.ExecuteTerminalApp')}>
            <Button
              size={size}
              disabled={
                !isAppSupported(session) || !isActive(session) || !isOwner
              }
              icon={<BAITerminalAppIcon />}
              onClick={() => {
                appLauncher.runTerminal(session?.row_id);
              }}
            />
          </Tooltip>
          {/* Don't put this modal to end of the return array(<></>). */}
          <TerminateSessionModal
            sessionFrgmts={[session]}
            open={openTerminateModal}
            onRequestClose={() => {
              setOpenTerminateModal(false);
            }}
          />
        </>
      )}

      <Tooltip title={t('session.SeeContainerLogs')}>
        <Button
          size={size}
          icon={<BAISessionLogIcon />}
          onClick={() => {
            setOpenLogModal(true);
          }}
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

      {session.type !== 'system' && (
        <>
          <Tooltip title={t('session.RequestContainerCommit')}>
            <Button
              size={size}
              disabled={
                !baiClient._config.enableContainerCommit ||
                session.type === 'system' ||
                !isActive(session) ||
                !isOwner
              }
              icon={<BAIContainerCommitIcon />}
              onClick={() => {
                setOpenContainerCommitModal(true);
              }}
            />
          </Tooltip>
          <ContainerCommitModal
            sessionFrgmt={session}
            open={openContainerCommitModal}
            onRequestClose={() => setOpenContainerCommitModal(false)}
          />
        </>
      )}
      <Tooltip title={t('session.TerminateSession')}>
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
            setOpenTerminateModal(true);
          }}
        />
      </Tooltip>
    </Wrapper>
  ) : (
    []
  );
};

export default SessionActionButtons;
