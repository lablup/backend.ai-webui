import BAIModal from './BAIModal';
import ContainerLogModalWithLazyQueryLoader from './ComputeSessionNodeItems/ContainerLogModalWithLazyQueryLoader';
import SessionDetailDrawer from './SessionDetailDrawer';
import { Skeleton } from 'antd';
import { Suspense, useEffect, useState } from 'react';
import { StringParam, useQueryParam } from 'use-query-params';

const ComputeSessionList = () => {
  const [sessionId, setSessionId] = useQueryParam('sessionDetail', StringParam);

  const [containerLogModalSessionId, setContainerLogModalSessionId] =
    useState<string>();
  useEffect(() => {
    const handler = (e: any) => {
      setContainerLogModalSessionId(e.detail);
    };
    document.addEventListener('bai-open-session-log', handler);
    return () => {
      document.removeEventListener('bai-open-session-log', handler);
    };
  }, []);
  return (
    <>
      <SessionDetailDrawer
        open={!sessionId}
        sessionId={sessionId || undefined}
        onClose={() => {
          setSessionId(null, 'replaceIn');
        }}
      />
      {containerLogModalSessionId && (
        <Suspense
          fallback={
            <BAIModal
              open
              // loading
              width={'100%'}
              styles={{
                header: {
                  width: '100%',
                },
                body: {
                  height: 'calc(100vh - 100px)',
                  maxHeight: 'calc(100vh - 100px)',
                },
              }}
              footer={null}
            >
              <Skeleton active />
            </BAIModal>
          }
        >
          <ContainerLogModalWithLazyQueryLoader
            sessionId={containerLogModalSessionId}
            afterClose={() => {
              setContainerLogModalSessionId(undefined);
            }}
          />
        </Suspense>
      )}
    </>
  );
};

export default ComputeSessionList;
