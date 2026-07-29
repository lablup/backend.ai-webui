/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { ProjectContextOrNull } from '../types/projectContext';
import ContainerLogModalWithLazyQueryLoader from './ComputeSessionNodeItems/ContainerLogModalWithLazyQueryLoader';
import SessionDetailDrawer from './SessionDetailDrawer';
import { BAIUnmountAfterClose } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import { useState, useEffect, useTransition } from 'react';

interface SessionDetailAndContainerLogOpenerLegacyProps {
  /**
   * Explicit project prop contract (ADR-0001, FR-3413): pass-through to
   * `SessionDetailDrawer`. This opener is mounted on several pages
   * (general session list, scheduler, admin session page) — each mounting
   * page decides the project context (`null` on super-admin pages).
   */
  project: ProjectContextOrNull;
}

const SessionDetailAndContainerLogOpenerLegacy: React.FC<
  SessionDetailAndContainerLogOpenerLegacyProps
> = ({ project }) => {
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
            project={project}
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
