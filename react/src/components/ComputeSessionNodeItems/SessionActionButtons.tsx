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
import { useSuspendedAppTemplateConfig } from '../../hooks/useAppTemplate';
import { useBackendAIAppLauncher } from '../../hooks/useBackendAIAppLauncher';
import ErrorBoundaryWithNullFallback from '../ErrorBoundaryWithNullFallback';
import AppLauncherModal from './AppLauncherModal';
import ContainerCommitModal from './ContainerCommitModal';
import ContainerLogModal from './ContainerLogModal';
import SFTPConnectionInfoModal from './SFTPConnectionInfoModal';
import TerminateSessionModal from './TerminateSessionModal';
import { ButtonGroup } from '@astryxdesign/core/ButtonGroup';
import { IconButton } from '@astryxdesign/core/IconButton';
import { HStack } from '@astryxdesign/core/Stack';
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
  filterOutEmpty,
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

/**
 * FRONTIER (ticket 17): the antd-shaped `size` union is RESTATED here instead
 * of imported from `antd` (§6 — a type-only antd import still blocks the
 * zero-antd gate). Both consumers — `SessionDetailContent` (`"large"`) and
 * `BAIComputeSessionNodeNotificationItem` (`"small"`) — stay at zero diff, and
 * the translation to the Astryx enum below is unchanged.
 */
export type SessionActionButtonSize = 'small' | 'middle' | 'large';

export type PrimaryAppOption = {
  appName: 'jupyter' | 'filebrowser';
  urlPostfix?: string;
};

interface SessionActionButtonsProps {
  sessionFrgmt: SessionActionButtonsFragment$key | null;
  size?: SessionActionButtonSize;
  compact?: boolean;
  hiddenButtonKeys?: SessionActionButtonKey[];
  onAction?: (action: SessionActionButtonKey) => void;
  primaryAppOption?: PrimaryAppOption;
}

const isActive = (session: SessionActionButtonsFragment$data) => {
  if (session?.type === 'system') {
    return session?.status === 'RUNNING';
  }
  return !['TERMINATED', 'CANCELLED', 'TERMINATING', 'ERROR'].includes(
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

/**
 * QA-FINDINGS Q-19 (measured): `'large'` maps to Astryx **`md`**, not `lg`.
 * Astryx's `lg` glyph is a 20px StyleX literal with no theme lever, against the
 * 16px the report asked for; `md`'s glyph is exactly 16px. Residue: `md`'s 32px
 * box is 8px under the 40px reference — in the direction the report wanted.
 */
const toAstryxSize = (size?: SessionActionButtonSize): 'sm' | 'md' | 'lg' =>
  size === 'small' ? 'sm' : 'md';

// A disabled control must not keep a solid fill: inside an info Banner the theme
// collapses `--color-accent` onto the text colour, so a half-opacity filled chip
// still reads louder than an enabled neighbour. FR-3506.
const variantWhenEnabled = (
  isDisabled: boolean,
  variant: 'primary' | 'secondary',
): 'primary' | 'secondary' | 'ghost' => (isDisabled ? 'ghost' : variant);

const SessionActionButtons: React.FC<SessionActionButtonsProps> = ({
  sessionFrgmt,
  compact,
  size,
  hiddenButtonKeys,
  primaryAppOption,
  onAction,
}) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { hideAppsOnBatchSession } = useSuspendedAppTemplateConfig();

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

    // Hide the app launcher and terminal for batch sessions when configured
    // to do so.
    if (
      (key === 'appLauncher' || key === 'terminal') &&
      hideAppsOnBatchSession &&
      session?.type === 'batch'
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

  const astryxSize = toAstryxSize(size);

  const isAppDisabled =
    !session || !isAppSupported(session) || !isActive(session) || !isOwner;
  const isSftpDisabled = !session || !isActive(session) || !isOwner;
  const isContainerCommitDisabled = session?.status !== 'RUNNING' || !isOwner;
  const isTerminateDisabled = !session || !isActive(session);

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

  // PILOT-DECISION (ticket 17): antd icon-only `Button`s in a `Space.Compact`
  // -> Astryx `IconButton`s in a `ButtonGroup` (compact) / `HStack` (loose).
  // The small-size "native title instead of Tooltip" special case collapses
  // into IconButton's own `tooltip` prop; every icon-only control now carries
  // a real accessible `label` (P8).
  const buttons = session
    ? filterOutEmpty([
        primaryAppOption && primaryAppOption.appName === 'jupyter' && (
          <IconButton
            key="primary-jupyter"
            size={astryxSize}
            variant={variantWhenEnabled(isAppDisabled, 'primary')}
            isDisabled={isAppDisabled}
            icon={<BAIJupyterIcon />}
            label={t('session.ExecuteSpecificApp', {
              appName: 'Jupyter Notebook',
            })}
            tooltip={t('session.ExecuteSpecificApp', {
              appName: 'Jupyter Notebook',
            })}
            onClick={() => {
              launchApp();
            }}
          />
        ),
        primaryAppOption && primaryAppOption.appName === 'filebrowser' && (
          <IconButton
            key="primary-filebrowser"
            size={astryxSize}
            variant={variantWhenEnabled(isAppDisabled, 'primary')}
            isDisabled={isAppDisabled}
            icon={<BAIFileBrowserIcon />}
            label={t('session.ExecuteSpecificApp', {
              appName: 'File browser',
            })}
            tooltip={t('session.ExecuteSpecificApp', {
              appName: 'File browser',
            })}
            onClick={() => {
              launchApp();
            }}
          />
        ),
        isVisible('appLauncher') && (
          <IconButton
            key="appLauncher"
            size={astryxSize}
            variant={variantWhenEnabled(
              isAppDisabled,
              primaryAppOption ? 'secondary' : 'primary',
            )}
            isDisabled={isAppDisabled}
            icon={<BAIAppIcon />}
            label={t('session.SeeAppDialog')}
            tooltip={t('session.SeeAppDialog')}
            onClick={() => {
              onAction?.('appLauncher');
              setOpenAppLauncherModal(true);
            }}
          />
        ),
        isVisible('sftp') && (
          <IconButton
            key="sftp"
            size={astryxSize}
            variant={variantWhenEnabled(isSftpDisabled, 'primary')}
            isDisabled={isSftpDisabled}
            icon={<BAISftpIcon />}
            label={t('data.explorer.RunSSH/SFTPserver')}
            tooltip={t('data.explorer.RunSSH/SFTPserver')}
            onClick={() => {
              setOpenSFTPConnectionInfoModal(true);
            }}
          />
        ),
        isVisible('terminal') && (
          <IconButton
            key="terminal"
            size={astryxSize}
            variant={variantWhenEnabled(isAppDisabled, 'secondary')}
            isDisabled={isAppDisabled}
            icon={<BAITerminalAppIcon />}
            label={t('session.ExecuteTerminalApp')}
            tooltip={t('session.ExecuteTerminalApp')}
            onClick={() => {
              onAction?.('terminal');
              appLauncher.runTerminal({});
            }}
          />
        ),
        isVisible('logs') && (
          <IconButton
            key="logs"
            size={astryxSize}
            icon={<BAISessionLogIcon />}
            label={t('session.SeeContainerLogs')}
            tooltip={t('session.SeeContainerLogs')}
            onClick={() => {
              onAction?.('logs');
              setOpenLogModal(true);
            }}
          />
        ),
        isVisible('containerCommit') && (
          <IconButton
            key="containerCommit"
            size={astryxSize}
            variant={variantWhenEnabled(isContainerCommitDisabled, 'secondary')}
            isDisabled={isContainerCommitDisabled}
            icon={<BAIContainerCommitIcon />}
            label={t('session.RequestContainerCommit')}
            tooltip={t('session.RequestContainerCommit')}
            onClick={() => {
              onAction?.('containerCommit');
              setOpenContainerCommitModal(true);
            }}
          />
        ),
        isVisible('terminate') && (
          <IconButton
            key="terminate"
            size={astryxSize}
            variant={variantWhenEnabled(isTerminateDisabled, 'secondary')}
            isDisabled={isTerminateDisabled}
            icon={
              <BAITerminateIcon
                style={{
                  color: isTerminateDisabled ? undefined : 'var(--color-error)',
                }}
              />
            }
            label={t('session.TerminateSession')}
            tooltip={t('session.TerminateSession')}
            onClick={() => {
              onAction?.('terminate');
              setOpenTerminateModal(true);
            }}
          />
        ),
      ])
    : [];

  return session ? (
    <>
      {compact ? (
        <ButtonGroup label={t('data.explorer.Actions')} size={astryxSize}>
          {buttons}
        </ButtonGroup>
      ) : (
        <HStack gap={1}>{buttons}</HStack>
      )}

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
