/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DEFAULT_SESSION_GRID_VIEW } from '../../helper/sessionResourceGridData';
import { useWebUINavigate } from '../../hooks';
import SessionResourceGrid from '../SessionResourceGrid';
import PanelFrame from './PanelFrame';
import type { PanelKindProps } from './panelRegistry';
import { resolvePanelTitle, withResourceGroupClause } from './resourceRegistry';
import type { PanelDescriptor } from './types';
import { useDashboardQueryScope } from './useDashboardFilters';
import { BAISkeleton } from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

/**
 * Session resource grid as a board panel (FR-3570; the gate lives in
 * `useDashboardBoard` and the modal). Its view settings come from the
 * descriptor, so it renders no toolbar and grid panels never fight over the URL.
 */
const SessionResourceGridPanel: React.FC<PanelKindProps> = ({
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
      <Suspense fallback={<BAISkeleton />}>
        {/* Keyed by the query-shaping config so a condition edit resets the
              grid and retries out of a stuck error state; `fetchKey` is out of
              the key so a periodic refresh doesn't flash the skeleton. */}
        <SessionResourceGridContent
          key={`${JSON.stringify(descriptor.filter ?? null)}:${descriptor.order ?? ''}`}
          descriptor={descriptor}
          fetchKey={fetchKey}
        />
      </Suspense>
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
  const { projectId, domainName } = useDashboardQueryScope();
  const webUINavigate = useWebUINavigate();
  const location = useLocation();

  return (
    <SessionResourceGrid
      // The session resource's condition is the sessions page's own minilang
      // filter string, which is exactly what this grid takes.
      filter={
        withResourceGroupClause(
          typeof descriptor.filter === 'string' ? descriptor.filter : null,
          descriptor.resourceGroups,
        ) ?? null
      }
      order={descriptor.order ?? null}
      projectId={projectId}
      // Without a project (the superadmin page) the grid reads the current domain, like the table.
      domainName={projectId ? null : domainName}
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
