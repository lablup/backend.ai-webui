/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import { toProjectContext } from '../../types/projectContext';
import SessionDetailDrawer from '../SessionDetailDrawer';
import { BAIUnmountAfterClose } from 'backend.ai-ui';
import React from 'react';

interface SessionMonitorDetailDrawerProps {
  sessionId: string | null;
  /** False above project scope (ADR-0001): no current project is read. */
  withProject: boolean;
  onClose: () => void;
}

/** The session detail drawer, opened from the monitor without a navigation. */
const SessionMonitorDetailDrawer: React.FC<SessionMonitorDetailDrawerProps> = (
  props,
) => {
  'use memo';
  return props.withProject ? (
    <ProjectScopedDrawer {...props} />
  ) : (
    <Drawer {...props} project={null} />
  );
};

const ProjectScopedDrawer: React.FC<SessionMonitorDetailDrawerProps> = (
  props,
) => {
  'use memo';
  const currentProject = useCurrentProjectValue();
  return <Drawer {...props} project={toProjectContext(currentProject)} />;
};

const Drawer: React.FC<
  SessionMonitorDetailDrawerProps & {
    project: ReturnType<typeof toProjectContext>;
  }
> = ({ sessionId, project, onClose }) => {
  'use memo';
  return (
    <BAIUnmountAfterClose>
      <SessionDetailDrawer
        open={!!sessionId}
        sessionId={sessionId ?? undefined}
        project={project}
        onClose={onClose}
      />
    </BAIUnmountAfterClose>
  );
};

export default SessionMonitorDetailDrawer;
