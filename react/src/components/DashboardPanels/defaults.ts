/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { BAIBoardItem } from '../BAIBoard';
import type { PanelInput, PersistedPanel } from './types';

/** No seeded custom panels — panels exist only when added through the modal. */
export const DEFAULT_PANELS: ReadonlyArray<PersistedPanel> = [];

/**
 * Seed layout for a custom panel's first appearance on the board. Matches the
 * built-in panels' minColumnSpan 2 so a table never collapses to one column.
 */
export const DEFAULT_PANEL_LAYOUT: Omit<BAIBoardItem, 'data' | 'id'> = {
  rowSpan: 3,
  columnSpan: 2,
  definition: { minRowSpan: 3, minColumnSpan: 2 },
};

export const createPanel = (input: PanelInput): PersistedPanel => ({
  // randomUUID (not Date.now) — a double-submit in the same millisecond must
  // still yield distinct ids, or removePanel(id) deletes both.
  id: `${input.resourceType}-${crypto.randomUUID()}`,
  panelType: 'resourceTable',
  descriptor: {
    resourceType: input.resourceType,
    title: input.title,
    filter: input.filter ?? null,
    order: input.order ?? null,
  },
});
