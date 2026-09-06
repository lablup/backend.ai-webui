/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { ProjectContextOrNull } from '../types/projectContext';
import ContainerLogModalWithLazyQueryLoader from './ComputeSessionNodeItems/ContainerLogModalWithLazyQueryLoader';
import SessionDetailDrawer from './SessionDetailDrawer';
import { BAIUnmountAfterClose } from 'backend.ai-ui';
import { useState, useEffect, useTransition } from 'react';
import { useLocation } from 'react-router-dom';

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
  // Read `sessionDetail` from the router location, NOT nuqs — nuqs applies
  // external URL changes inside startTransition, which entangles the drawer
  // mount with any concurrently held transition (e.g. a page poll refetch
  // suspended without a fallback) and delays it by seconds. Same pattern and
  // reasoning as `useTabQuerySnapshot` (react/src/hooks/index.tsx).
  const location = useLocation();
  const webUINavigate = useWebUINavigate();
  const sessionId = new URLSearchParams(location.search).get('sessionDetail');
  const setSessionId = (value: string | null) => {
    const params = new URLSearchParams(location.search);
    if (value === null) params.delete('sessionDetail');
    else params.set('sessionDetail', value);
    webUINavigate(
      {
        pathname: location.pathname,
        hash: location.hash,
        search: params.toString(),
      },
      { replace: true },
    );
  };
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
