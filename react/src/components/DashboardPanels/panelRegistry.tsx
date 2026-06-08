/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import ResourceTablePanel from './ResourceTablePanel';
import type { PanelDescriptor, PanelType } from './types';
import type React from 'react';

export interface PanelComponentProps {
  descriptor: PanelDescriptor;
  onChange?: (next: PanelDescriptor) => void;
  onRemove?: () => void;
}

/**
 * Maps a {@link PanelType} to the component that renders it. Adding a new panel
 * kind (e.g. a chart or an AI-authored view) is a single entry here — the board
 * host resolves the component from this map at render time.
 */
export const panelRegistry: Record<PanelType, React.FC<PanelComponentProps>> = {
  resourceTable: ResourceTablePanel,
};
