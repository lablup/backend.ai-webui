/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIUnmountAfterClose } from 'backend.ai-ui';
import React, { Suspense } from 'react';

// Session detail and its action buttons load only when a session is opened.
const SessionDetailDrawer = React.lazy(() => import('../SessionDetailDrawer'));

interface SessionMonitorDetailDrawerProps {
  sessionId: string | null;
  onClose: () => void;
}

/**
 * The session detail drawer, opened from the monitor without a navigation.
 * The watched sessions span projects, so no project context is passed.
 */
const SessionMonitorDetailDrawer: React.FC<SessionMonitorDetailDrawerProps> = ({
  sessionId,
  onClose,
}) => {
  'use memo';
  return (
    <Suspense fallback={null}>
      <BAIUnmountAfterClose>
        <SessionDetailDrawer
          open={!!sessionId}
          sessionId={sessionId ?? undefined}
          project={null}
          onClose={onClose}
        />
      </BAIUnmountAfterClose>
    </Suspense>
  );
};

export default SessionMonitorDetailDrawer;
