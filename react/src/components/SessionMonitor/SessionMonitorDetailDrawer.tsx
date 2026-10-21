/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import SessionDetailDrawer from '../SessionDetailDrawer';
import { BAIUnmountAfterClose } from 'backend.ai-ui';
import React from 'react';

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
    <BAIUnmountAfterClose>
      <SessionDetailDrawer
        open={!!sessionId}
        sessionId={sessionId ?? undefined}
        project={null}
        onClose={onClose}
      />
    </BAIUnmountAfterClose>
  );
};

export default SessionMonitorDetailDrawer;
