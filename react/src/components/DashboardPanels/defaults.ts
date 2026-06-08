/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { PanelDescriptor, PersistedPanel, ResourceKey } from './types';

const PANEL_LAYOUT = {
  rowSpan: 4,
  columnSpan: 2,
  definition: { minRowSpan: 3, minColumnSpan: 1 },
} as const;

/**
 * No custom panels are seeded by default — the board starts with only the
 * built-in dashboard panels. Users add custom (query-as-config) panels
 * explicitly via the edit drawer's "Add panel" modal.
 */
export const DEFAULT_PANELS: ReadonlyArray<PersistedPanel> = [];

/**
 * Create a fresh panel for a resource type, optionally pre-configured with the
 * filter and/or title built in the "Add panel" modal.
 */
export const createPanel = (
  resourceType: ResourceKey,
  overrides?: Pick<PanelDescriptor, 'filter' | 'title'>,
): PersistedPanel => ({
  id: `${resourceType}-${Date.now()}`,
  panelType: 'resourceTable',
  descriptor: { resourceType, ...overrides },
  ...PANEL_LAYOUT,
});
