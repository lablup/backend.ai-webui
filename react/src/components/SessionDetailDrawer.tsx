import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { useInterval } from '../hooks/useIntervalValue';
import SessionDetailContent from './SessionDetailContent';
import { ReloadOutlined } from '@ant-design/icons';
import { Button, Drawer, Skeleton, Tooltip } from 'antd';
import { DrawerProps } from 'antd/lib';
import React, { Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

// import { StringParam, useQueryParam } from 'use-query-params';

interface SessionDetailDrawerProps extends DrawerProps {
  sessionId?: string;
}
const SessionDetailDrawer: React.FC<SessionDetailDrawerProps> = ({
  sessionId,
  ...drawerProps
}) => {
  const { t } = useTranslation();
  // const [sessionId, setSessionId] = useQueryParam('sessionDetail', StringParam);
  useSuspendedBackendaiClient();

  const [isPendingReload, startReloadTransition] = useTransition();

  const [fetchKey, updateFetchKey] = useUpdatableState('first');

  useInterval(() => {
    startReloadTransition(() => {
      updateFetchKey();
    });
  }, 7_000);
  return (
    <Drawer
      title={t('session.SessionInfo')}
      width={800}
      keyboard={false}
      {...drawerProps}
      open={!!sessionId}
      onClose={(e) => {
        drawerProps.onClose?.(e);
        // setSessionId(null, 'pushIn');
      }}
      extra={
        <Tooltip title={t('button.Refresh')}>
          <Button
            loading={isPendingReload}
            icon={<ReloadOutlined />}
            onClick={() => {
              startReloadTransition(() => {
                updateFetchKey();
              });
            }}
          />
        </Tooltip>
      }
    >
      <Suspense fallback={<Skeleton active />}>
        {sessionId && (
          <SessionDetailContent id={sessionId} fetchKey={fetchKey} />
        )}
      </Suspense>
    </Drawer>
  );
};

export default SessionDetailDrawer;
