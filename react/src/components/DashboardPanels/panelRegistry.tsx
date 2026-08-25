/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import ResourceCountPanel from './ResourceCountPanel';
import ResourceTablePanel, {
  type ResourceTablePanelProps,
} from './ResourceTablePanel';
import SessionResourceGridPanel from './SessionResourceGridPanel';
import type { PanelType, PersistedPanel, ResourceKey } from './types';
import type React from 'react';

/** Props every panel component accepts. */
export type PanelComponentProps = ResourceTablePanelProps;

/**
 * Maps a {@link PanelType} to the component that renders it. Adding a new panel
 * kind (e.g. a chart view) is a single entry here — the board host resolves the
 * component from this map at render time.
 */
export const panelRegistry: Record<PanelType, React.FC<PanelComponentProps>> = {
  resourceTable: ResourceTablePanel,
  resourceCount: ResourceCountPanel,
  sessionResourceGrid: SessionResourceGridPanel,
};

/** i18n key for each kind's label in the panel modal's kind selector. */
export const panelTypeLabelKeys: Record<PanelType, string> = {
  resourceTable: 'dashboard.panelModal.Table',
  resourceCount: 'dashboard.panelModal.Count',
  // Reuse the sessions page's own view-toggle label so the two surfaces read as
  // the same "two ways to look at sessions".
  sessionResourceGrid: 'session.resourceGrid.GridView',
};

export interface PanelTypeAvailabilityOptions {
  /** `experimental_session_resource_grid` — gates the grid kind. */
  gridEnabled: boolean;
  /**
   * Kind of the panel being edited. An already-saved grid panel keeps offering
   * the grid kind even while the flag is off, so editing it cannot silently
   * rewrite the user's saved view.
   */
  forcePanelType?: PanelType;
}

/** Kinds offerable for a resource, given the experimental flag. */
export const availablePanelTypes = (
  resourceType: ResourceKey,
  { gridEnabled, forcePanelType }: PanelTypeAvailabilityOptions,
): Array<PanelType> => {
  const types: Array<PanelType> = ['resourceTable', 'resourceCount'];
  const gridOfferable = gridEnabled || forcePanelType === 'sessionResourceGrid';
  if (resourceType === 'session' && gridOfferable) {
    types.push('sessionResourceGrid');
  }
  return types;
};

/**
 * The kind to RENDER, which is not always the kind that is stored: with the
 * experimental flag off a saved grid panel falls back to the session table.
 * The stored `panelType` is deliberately left untouched (mirroring the sessions
 * page's `effectiveView`) so re-enabling the flag restores the saved view, and
 * the descriptor's filter/order stay valid on the table path either way.
 */
export const effectivePanelType = (
  panel: Pick<PersistedPanel, 'panelType'>,
  { gridEnabled }: { gridEnabled: boolean },
): PanelType =>
  panel.panelType === 'sessionResourceGrid' && !gridEnabled
    ? 'resourceTable'
    : panel.panelType;
