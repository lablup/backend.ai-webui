/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { generateUUID } from '../../helper/uuid';
import type { BAIBoardItem } from '../BAIBoard';
import type { PanelInput, PanelType, PersistedPanel } from './types';

/** No seeded custom panels — panels exist only when added through the modal. */
export const DEFAULT_PANELS: ReadonlyArray<PersistedPanel> = [];

/**
 * Seed layout per panel kind for its first appearance on the board. Tables
 * match the built-in panels' minColumnSpan 2 so they never collapse to one
 * column; count stats are compact.
 */
export const DEFAULT_PANEL_LAYOUTS: Record<
  PanelType,
  Omit<BAIBoardItem, 'data' | 'id'>
> = {
  resourceTable: {
    rowSpan: 3,
    columnSpan: 2,
    definition: { minRowSpan: 3, minColumnSpan: 2 },
  },
  resourceCount: {
    rowSpan: 2,
    columnSpan: 1,
    definition: { minRowSpan: 2, minColumnSpan: 1 },
  },
};

export const createPanel = (input: PanelInput): PersistedPanel => ({
  // A UUID (not Date.now) — a double-submit in the same millisecond must still
  // yield distinct ids, or removePanel(id) deletes both. generateUUID, not
  // crypto.randomUUID: the latter is absent on plain-HTTP origins.
  id: `${input.resourceType}-${generateUUID()}`,
  panelType: input.panelType,
  descriptor: {
    resourceType: input.resourceType,
    title: input.title,
    filter: input.filter ?? null,
    order: input.order ?? null,
  },
});
