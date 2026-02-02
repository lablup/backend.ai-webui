import { SessionDetailDrawerFragment$key } from '../__generated__/SessionDetailDrawerFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import SessionDetailContent from './SessionDetailContent';
import { Drawer, Skeleton } from 'antd';
import { DrawerProps } from 'antd/lib';
import { BAIFetchKeyButton, useFetchKey } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { Suspense, useMemo, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { useLocation } from 'react-router-dom';

interface SessionDetailDrawerProps extends DrawerProps {
  sessionId?: string;
}
const SessionDetailDrawer: React.FC<SessionDetailDrawerProps> = ({
  sessionId,
  ...drawerProps
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
      title={t('session.SessionInfo')}
      size={800}
      extra={
        <BAIFetchKeyButton
          loading={isPendingReload}
          autoUpdateDelay={7_000}
          value={fetchKey}
          onChange={(newFetchKey) => {
            startReloadTransition(() => {
              updateFetchKey(newFetchKey);
            });
          }}
        />
      }
      {...drawerProps}
    >
      <Suspense fallback={<Skeleton active />}>
        {sessionId && (
          <SessionDetailContent
            id={sessionId}
            fetchKey={fetchKey}
            sessionFrgmt={cachedSessionFrgmt}
            deprecatedProjectId={session?.project_id}
          />
        )}
      </Suspense>
    </Drawer>
  );
};

export default SessionDetailDrawer;
