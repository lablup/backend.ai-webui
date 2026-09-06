/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DEFAULT_SESSION_GRID_VIEW } from '../../helper/sessionResourceGridData';
import { useWebUINavigate } from '../../hooks';
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import SessionResourceGrid from '../SessionResourceGrid';
import PanelFrame from './PanelFrame';
import type { PanelComponentProps } from './panelRegistry';
import { resolvePanelTitle } from './resourceRegistry';
import type { PanelDescriptor } from './types';
import { BAISkeleton } from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

/**
 * Session resource grid as a board panel (FR-3570 is experimental; the gate
 * lives in `useCustomPanels`/the modal, not here). The grid's five view
 * settings come from the descriptor and are edited only in the panel modal, so
 * the panel renders no toolbar — a locked board can be read without ever
 * mutating panel config, and multiple grid panels cannot fight over the URL
 * query-state the grid otherwise keeps its settings in.
 */
const SessionResourceGridPanel: React.FC<PanelComponentProps> = ({
  descriptor,
  fetchKey,
  onEdit,
  onRemove,
}) => {
  'use memo';
  const { t } = useTranslation();
  const title = resolvePanelTitle(descriptor, t);

  return (
    <PanelFrame title={title} onEdit={onEdit} onRemove={onRemove}>
      {(localFetchKey) => (
        <Suspense fallback={<BAISkeleton />}>
          {/* Keyed by the query-shaping config so a condition edit resets the
              grid and retries out of a stuck error state; `fetchKey` is out of
              the key so a periodic refresh doesn't flash the skeleton. */}
          <SessionResourceGridContent
            key={`${JSON.stringify(descriptor.filter ?? null)}:${descriptor.order ?? ''}`}
            descriptor={descriptor}
            fetchKey={`${fetchKey ?? ''}:${localFetchKey}`}
          />
        </Suspense>
      )}
    </PanelFrame>
  );
};

/**
 * Suspending inner half. Also the panel modal's live preview, where the modal
 * owns the view settings interactively via `onChangeViewParams` (which is what
 * makes the grid's own toolbar appear) and rows stay inert.
 */
export const SessionResourceGridContent: React.FC<{
  descriptor: PanelDescriptor;
  fetchKey?: string;
  onChangeViewParams?: (next: NonNullable<PanelDescriptor['gridView']>) => void;
  /** Modal preview: keep cells inert (no detail-drawer navigation). */
  disableSessionDetail?: boolean;
}> = ({ descriptor, fetchKey, onChangeViewParams, disableSessionDetail }) => {
  'use memo';
  const currentProject = useCurrentProjectValue();
  const webUINavigate = useWebUINavigate();
  const location = useLocation();

  return (
    <SessionResourceGrid
      // The session resource's condition is the sessions page's own minilang
      // filter string, which is exactly what this grid takes.
      filter={typeof descriptor.filter === 'string' ? descriptor.filter : null}
      order={descriptor.order ?? null}
      projectId={currentProject.id ?? null}
      fetchKey={fetchKey ?? ''}
      viewParams={descriptor.gridView ?? DEFAULT_SESSION_GRID_VIEW}
      onChangeViewParams={onChangeViewParams}
      onClickSession={
        disableSessionDetail
          ? undefined
          : (sessionId) => {
              // Same mechanism as the table panel: the shared `sessionDetail`
              // search param opens the drawer the built-in board item owns.
              const newSearchParams = new URLSearchParams(location.search);
              newSearchParams.set('sessionDetail', sessionId);
              webUINavigate({
                pathname: location.pathname,
                hash: location.hash,
                search: newSearchParams.toString(),
              });
            }
      }
    />
  );
};

export default SessionResourceGridPanel;
