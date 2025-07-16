import {
  SessionActionButtonsFragment$data,
  SessionActionButtonsFragment$key,
} from '../../__generated__/SessionActionButtonsFragment.graphql';
import {
  SessionActionButtonsLegacyFragment$data,
  SessionActionButtonsLegacyFragment$key,
} from '../../__generated__/SessionActionButtonsLegacyFragment.graphql';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useCurrentUserInfo } from '../../hooks/backendai';
import { useBackendAIAppLauncher } from '../../hooks/useBackendAIAppLauncher';
import AppIcon from '../BAIIcons/AppIcon';
import ContainerCommitIcon from '../BAIIcons/ContainerCommitIcon';
import SessionLogIcon from '../BAIIcons/SessionLogIcon';
import TerminalAppIcon from '../BAIIcons/TerminalAppIcon';
import TerminateIcon from '../BAIIcons/TerminateIcon';
import AppLauncherModal from './AppLauncherModal';
import ContainerCommitModal from './ContainerCommitModal';
import ContainerLogModal from './ContainerLogModal';
import TerminateSessionModal from './TerminateSessionModal';
import { Tooltip, Button, theme } from 'antd';
import _ from 'lodash';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface SessionActionButtonsProps {
  sessionFrgmt: SessionActionButtonsFragment$key | null;
  legacySessionFrgmt?: SessionActionButtonsLegacyFragment$key | null;
}

const isActive = (session: SessionActionButtonsFragment$data) => {
  return !['TERMINATED', 'CANCELLED', 'TERMINATING'].includes(
    session?.status || '',
  );
};
const isAppSupported = (
  session: SessionActionButtonsFragment$data,
  legacy_session: SessionActionButtonsLegacyFragment$data | null | undefined,
) => {
  return (
    ['batch', 'interactive', 'inference', 'system', 'running'].includes(
      session?.type || '',
    ) &&
    !_.isEmpty(
      JSON.parse(
        session?.service_ports ?? legacy_session?.service_ports ?? '{}',
      ),
    )
  );
};

const SessionActionButtons: React.FC<SessionActionButtonsProps> = (props) => {
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
    props.sessionFrgmt,
  );

  const legacySession = useFragment(
    graphql`
      fragment SessionActionButtonsLegacyFragment on ComputeSession {
        id
        service_ports
        ...AppLauncherModalLegacyFragment
      }
    `,
    props.legacySessionFrgmt,
  );

  const [openAppLauncherModal, setOpenAppLauncherModal] = useState(false);
  const [openTerminateModal, setOpenTerminateModal] = useState(false);
  const [openLogModal, setOpenLogModal] = useState(false);
  const [openContainerCommitModal, setOpenContainerCommitModal] =
    useState(false);

  const userInfo = useCurrentUserInfo();
  const isOwner = userInfo[0]?.uuid === session?.user_id;

  return (
    session && (
      <>
        <Tooltip title={t('session.SeeAppDialog')}>
          <Button
            disabled={
              !isAppSupported(session, legacySession) ||
              !isActive(session) ||
              !isOwner
            }
            icon={<AppIcon />}
            onClick={() => {
              setOpenAppLauncherModal(true);
            }}
          />
        </Tooltip>
        <Suspense fallback={null}>
          <AppLauncherModal
            sessionFrgmt={session}
            legacySessionFrgmt={legacySession}
            open={openAppLauncherModal}
            onRequestClose={() => {
              setOpenAppLauncherModal(false);
            }}
          />
        </Suspense>
        <Tooltip title={t('session.ExecuteTerminalApp')}>
          <Button
            disabled={
              !isAppSupported(session, legacySession) ||
              !isActive(session) ||
              !isOwner
            }
            icon={<TerminalAppIcon />}
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

        <Tooltip title={t('session.SeeContainerLogs')}>
          <Button
            icon={<SessionLogIcon />}
            onClick={() => {
              setOpenLogModal(true);
            }}
          />
        </Tooltip>
        <ContainerLogModal
          sessionFrgmt={session}
          open={openLogModal}
          onCancel={() => {
            setOpenLogModal(false);
          }}
        />
        <Tooltip title={t('session.RequestContainerCommit')}>
          <Button
            disabled={
              !baiClient._config.enableContainerCommit ||
              session.type === 'system' ||
              !isActive(session) ||
              !isOwner
            }
            icon={<ContainerCommitIcon />}
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
        <Tooltip title={t('session.TerminateSession')}>
          <Button
            disabled={!isActive(session)}
            icon={
              <TerminateIcon
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
      </>
    )
  );
};

export default SessionActionButtons;
