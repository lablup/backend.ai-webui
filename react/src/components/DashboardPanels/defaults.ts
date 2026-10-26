/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DEFAULT_SESSION_GRID_VIEW } from '../../helper/sessionResourceGridData';
import { generateUUID } from '../../helper/uuid';
import type {
  PanelInput,
  PanelType,
  PersistedPanelV2,
  ResourceKey,
  Viz,
} from './types';
import type { BAIBoardItem } from 'backend.ai-ui';

/**
 * Seed layout per panel kind. Tables match the built-in cards' minColumnSpan 2;
 * the grid's value is breadth, so it seeds full width like `activeAgents`.
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
  sessionResourceGrid: {
    rowSpan: 4,
    columnSpan: 4,
    definition: { minRowSpan: 2, minColumnSpan: 2 },
  },
};

export const VIZ_TO_PANEL_TYPE: Record<Viz, PanelType> = {
  table: 'resourceTable',
  stat: 'resourceCount',
  grid: 'sessionResourceGrid',
};

export const PANEL_TYPE_TO_VIZ: Record<PanelType, Viz> = {
  resourceTable: 'table',
  resourceCount: 'stat',
  sessionResourceGrid: 'grid',
};

/** Catalog key of the preset that lists `source`. */
export const presetKey = (source: ResourceKey) => `resource.${source}`;

/** The size a panel of `panelType` takes when it first lands on the board. */
export const defaultSizeOf = (panelType: PanelType) => ({
  columnSpan: DEFAULT_PANEL_LAYOUTS[panelType].columnSpan ?? 2,
  rowSpan: DEFAULT_PANEL_LAYOUTS[panelType].rowSpan ?? 2,
});

/** The panel-config fields of a modal submission; layout fields are left to the caller. */
export const panelConfigFromInput = (input: PanelInput) => ({
  key: presetKey(input.resourceType),
  viz: PANEL_TYPE_TO_VIZ[input.panelType],
  title: input.title,
  filter: input.filter ?? null,
  order: input.order ?? null,
  gridView:
    input.panelType === 'sessionResourceGrid'
      ? (input.gridView ?? DEFAULT_SESSION_GRID_VIEW)
      : null,
});

export const createPanel = (input: PanelInput): PersistedPanelV2 => ({
  // generateUUID, not Date.now (a double submit must still yield two ids) nor
  // crypto.randomUUID (absent on plain-HTTP origins).
  id: `${input.resourceType}-${generateUUID()}`,
  ...panelConfigFromInput(input),
  ...defaultSizeOf(input.panelType),
});
