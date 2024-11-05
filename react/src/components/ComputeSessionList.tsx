import SessionDetailDrawer from './SessionDetailDrawer';
import React from 'react';
import { StringParam, useQueryParam } from 'use-query-params';

const ComputeSessionList = () => {
  const [sessionId, setSessionId] = useQueryParam('sessionDetail', StringParam);
  return (
    <SessionDetailDrawer
      open={!sessionId}
      sessionId={sessionId || undefined}
      onClose={() => {
        setSessionId(null, 'replaceIn');
      }}
    />
  );
};

export default ComputeSessionList;
