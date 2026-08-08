/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionDetailDrawerFragment$key } from '../__generated__/SessionDetailDrawerFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import AutoUpdateFetchKeyButton from './AutoUpdateFetchKeyButton';
import SessionDetailContent from './SessionDetailContent';
import BAISkeletonAstryx from './astryx-bui/BAISkeletonAstryx';
// Ticket 17's FRONTIER note is now discharged: ticket 18 pinned
// `@astryxdesign/lab@0.3.0-canary.12db2a1`, so the Astryx Drawer is available
// and this drawer follows the `DeploymentRevisionDetailDrawer` precedent.
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Drawer } from '@astryxdesign/lab';
import { useFetchKey } from 'backend.ai-ui';
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
}
const SessionDetailDrawer: React.FC<SessionDetailDrawerProps> = ({
  sessionId,
  open = false,
  onClose,
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
    <Drawer
      isOpen={open}
      onClose={() => onClose?.()}
      side="end"
      size={800}
      label={t('session.SessionInfo')}
    >
      {/* lab Drawer renders content flush to the panel edges; reproduce the
          antd Drawer's 24px body padding with the spacing-6 token. */}
      <VStack gap={4} align="stretch" style={{ padding: 'var(--spacing-6)' }}>
        {/* lab Drawer has no title bar, so antd's `title` + `extra` become
            the first content row (ticket 18 precedent). */}
        <HStack gap={2} align="center" justify="between">
          <Heading level={5}>{t('session.SessionInfo')}</Heading>
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
        </HStack>
        <Suspense fallback={<BAISkeletonAstryx />}>
          {sessionId && (
            <SessionDetailContent
              id={sessionId}
              fetchKey={fetchKey}
              sessionFrgmt={cachedSessionFrgmt}
            />
          )}
        </Suspense>
      </VStack>
    </Drawer>
  );
};

export default SessionDetailDrawer;
