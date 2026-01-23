import { useSuspendedBackendaiClient } from '../hooks';
import ContainerLogModalWithLazyQueryLoader from './ComputeSessionNodeItems/ContainerLogModalWithLazyQueryLoader';
import SessionDetailDrawer from './SessionDetailDrawer';
import { BAIUnmountAfterClose } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import { useState, useEffect, useTransition } from 'react';

const SessionDetailAndContainerLogOpenerLegacy = () => {
  const [sessionId, setSessionId] = useQueryState(
    'sessionDetail',
    parseAsString.withOptions({ history: 'replace' }),
  );
  const [containerLogModalSessionId, setContainerLogModalSessionId] =
    useState<string>();
  const [isPendingLogModalOpen, startLogModalOpenTransition] = useTransition();
  const baiClient = useSuspendedBackendaiClient();

  useEffect(() => {
    const handler = (e: any) => {
      startLogModalOpenTransition(() => {
        setContainerLogModalSessionId(e.detail);
      });
    };
    document.addEventListener('bai-open-session-log', handler);
    return () => {
      document.removeEventListener('bai-open-session-log', handler);
    };
  }, [startLogModalOpenTransition, setContainerLogModalSessionId]);

  const supportSessionDetailPanel = baiClient?.supports('session-node');

  return (
    <>
      {supportSessionDetailPanel ? (
        <BAIUnmountAfterClose>
          <SessionDetailDrawer
            open={!!sessionId}
            sessionId={sessionId || undefined}
            onClose={() => {
              setSessionId(null);
            }}
          />
        </BAIUnmountAfterClose>
      ) : null}
      <ContainerLogModalWithLazyQueryLoader
        open={!!containerLogModalSessionId || isPendingLogModalOpen}
        loading={isPendingLogModalOpen}
        sessionId={containerLogModalSessionId}
        onRequestClose={() => {
          setContainerLogModalSessionId(undefined);
        }}
      />
    </>
  );
};
export default SessionDetailAndContainerLogOpenerLegacy;
