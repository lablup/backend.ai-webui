import { useBackendAIAppLauncher } from '../../hooks/useBackendAIAppLauncher';
import ContainerLogModal from './ContainerLogModal';
import TerminateSessionModal from './TerminateSessionModal';
import {
  SessionActionButtonsFragment$data,
  SessionActionButtonsFragment$key,
} from './__generated__/SessionActionButtonsFragment.graphql';
import { Tooltip, Button, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import { TerminalIcon, PowerOffIcon, ScrollTextIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

interface SessionActionButtonsProps {
  sessionFrgmt: SessionActionButtonsFragment$key | null;
}
// const isRunning = (session:SessionActionButtonsFragment$data) => {
//   return [
//     'batch',
//     'interactive',
//     'inference',
//     'system',
//     'running',
//     'others',
//   ].includes(session);
// }

const isActive = (session: SessionActionButtonsFragment$data) => {
  return !['TERMINATED', 'CANCELLED'].includes(session?.status || '');
};
// const isTransitional = (session: SessionActionButtonsFragment$data) => {
//   return [
//     'RESTARTING',
//     'TERMINATING',
//     'PENDING',
//     'PREPARING',
//     'CREATING',
//     'PULLING',
//   ].includes(session?.status || '');
// };

const SessionActionButtons: React.FC<SessionActionButtonsProps> = (props) => {
  const { token } = theme.useToken();
  const appLauncher = useBackendAIAppLauncher();

  const { t } = useTranslation();

  const session = useFragment(
    graphql`
      fragment SessionActionButtonsFragment on ComputeSessionNode {
        id
        row_id @required(action: NONE)
        status
        access_key
        service_ports
        commit_status
        ...TerminateSessionModalFragment
        ...ContainerLogModalFragment
      }
    `,
    props.sessionFrgmt,
  );
  const [openTerminateModal, setOpenTerminateModal] = useState(false);
  const [openLogModal, setOpenLogModal] = useState(false);

  // const isDisabledTermination = !['PENDING'].includes(session?.status || '') && session?.commit_status === 'ongoing'
  // ${(this._isRunning && !this._isPreparing(rowData.item.status)) ||
  //   this._isError(rowData.item.status)
  return (
    session && (
      <>
        {/* <Tooltip title={t('session.SeeAppDialog')}>
        <Button icon={<LayoutGridIcon />} onClick={()=>{
          appLauncher.showLauncher({
            "access-key": session?.access_key || '',
            "service-ports": session?.service_ports || '',
          })
        }} />
      </Tooltip> */}
        <Tooltip title={t('session.ExecuteTerminalApp')}>
          <Button
            disabled={!isActive(session)}
            icon={<TerminalIcon />}
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
            icon={<ScrollTextIcon />}
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
        {/*
        <Tooltip title={t('session.RequestContainerCommit')}>
        <Button icon={<ContainerIcon />} />
      </Tooltip> */}
        <Tooltip title={t('session.TerminateSession')}>
          <Button
            disabled={!isActive(session)}
            icon={
              <PowerOffIcon
                color={isActive(session) ? token.colorError : undefined}
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
