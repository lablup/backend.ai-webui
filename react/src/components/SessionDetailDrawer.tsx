/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionDetailDrawerFragment$key } from '../__generated__/SessionDetailDrawerFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { ProjectContextOrNull } from '../types/projectContext';
import AutoUpdateFetchKeyButton from './AutoUpdateFetchKeyButton';
import SessionDetailContent from './SessionDetailContent';
import BAIDrawer from './astryx-bui/BAIDrawerAstryx';
import { BAISkeleton, useFetchKey } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { Suspense, useMemo, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { useLocation } from 'react-router-dom';

// PILOT-DECISION: props no longer extend antd `DrawerProps` (a type-only antd
// import still blocks the P15 gate). All three consumers
// (SessionDetailAndContainerLogOpenerLegacy, RecentlyCreatedSession,
// DeploymentReplicasCard) pass exactly `open` / `sessionId` / `onClose`, so
// the explicit interface below is the whole live surface. antd spellings are
// kept and mapped internally (`open` -> `isOpen`).
interface SessionDetailDrawerProps {
  /** Whether the drawer is open. antd Drawer's `open`. */
  open?: boolean;
  /** Close request handler (Escape, scrim click, close button). */
  onClose?: () => void;
  sessionId?: string;
  /**
   * Explicit project prop contract (ADR-0001, FR-3413): pass-through to
   * `SessionDetailContent`. The mounting page decides the project context
   * (`null` on super-admin pages suppresses the project-mismatch alert).
   */
  project: ProjectContextOrNull;
}
const SessionDetailDrawer: React.FC<SessionDetailDrawerProps> = ({
  sessionId,
  open = false,
  onClose,
  project,
}) => {
  const { t } = useTranslation();
  useSuspendedBackendaiClient();

  const [isPendingReload, startReloadTransition] = useTransition();

  const [fetchKey, updateFetchKey] = useFetchKey();

  const location = useLocation();
  const {
    sessionDetailDrawerFrgmt: sessionFrgmtFromLocation,
    createdAt,
  }: {
    sessionDetailDrawerFrgmt?: SessionDetailDrawerFragment$key;
    createdAt?: string;
  } = location.state || {};

  const session = useFragment(
    graphql`
      fragment SessionDetailDrawerFragment on ComputeSessionNode {
        id
        project_id
        ...SessionDetailContentFragment
      }
    `,
    sessionFrgmtFromLocation,
  );

  const cachedSessionFrgmt = useMemo(() => {
    // If createdAt is within 1 minute, use sessionDetailDrawerFrgmt; otherwise return null to fetch fresh data in SessionDetailContent.
    if (createdAt && dayjs().diff(dayjs(createdAt), 'second') < 60) {
      return session;
    }
    return null;
    // only for the first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BAIDrawer
      open={open}
      onClose={onClose}
      side="end"
      size={800}
      title={t('session.SessionInfo')}
      extra={
        <AutoUpdateFetchKeyButton
          settingId="session-detail"
          defaultAutoUpdateDelay={10_000}
          loading={isPendingReload}
          value={fetchKey}
          onChange={(newFetchKey) => {
            startReloadTransition(() => {
              updateFetchKey(newFetchKey);
            });
          }}
        />
      }
    >
      <Suspense fallback={<BAISkeleton />}>
        {sessionId && (
          <SessionDetailContent
            id={sessionId}
            fetchKey={fetchKey}
            sessionFrgmt={cachedSessionFrgmt}
            project={project}
          />
        )}
      </Suspense>
    </BAIDrawer>
  );
};

export default SessionDetailDrawer;
