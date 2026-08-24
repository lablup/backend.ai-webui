/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import ResourceCountPanel from './ResourceCountPanel';
import ResourceTablePanel, {
  type ResourceTablePanelProps,
} from './ResourceTablePanel';
import type { PanelType } from './types';
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
};
