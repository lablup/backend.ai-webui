/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { mergeHiddenLayoutEntries, type BoardLayoutEntry } from './boardLayout';
import {
  DEFAULT_PANEL_LAYOUTS,
  PANEL_TYPE_TO_VIZ,
  VIZ_TO_PANEL_TYPE,
  presetKey,
} from './defaults';
import { sanitizePanelSettings } from './panelSettings';
import {
  PANEL_TYPES,
  RESOURCE_KEYS,
  VIZ_TYPES,
  type DashboardBoard,
  type PanelCatalogContext,
  type PanelDefinition,
  type PanelPage,
  type PanelSize,
  type PersistedPanel,
  type PersistedPanelV2,
  type Viz,
} from './types';
import * as _ from 'lodash-es';

export interface CatalogEntry {
  definition: PanelDefinition;
  /** Listed but unusable here (e.g. a config switch is off): not rendered, not addable. */
  locked: boolean;
}

const meetsRole = (
  required: NonNullable<PanelDefinition['requires']>['role'],
  role: PanelCatalogContext['role'],
) => {
  if (!required) return true;
  if (required === 'superadmin') return role === 'superadmin';
  // TODO(#10422): check the project's admin role once the project admin board lands.
  return role === 'superadmin' || role === 'admin';
};

/**
 * The entries a viewer may see on `page`. An entry the role cannot use, or
 * whose menu is in `blockList` / `inactiveList`, is dropped outright.
 */
export const catalogFor = (
  definitions: ReadonlyArray<PanelDefinition>,
  { page, role, config }: PanelCatalogContext,
): Array<CatalogEntry> => {
  const disabledMenus = new Set([
    ...(config.blockList ?? []),
    ...(config.inactiveList ?? []),
  ]);
  return definitions
    .filter(
      (definition) =>
        definition.page.includes(page) &&
        meetsRole(definition.requires?.role, role) &&
        !definition.requires?.hidden?.(config, role) &&
        !([] as ReadonlyArray<string>)
          .concat(definition.requires?.menuKey ?? [])
          .some((menuKey) => disabledMenus.has(menuKey)),
    )
    .map((definition) => ({
      definition,
      locked: definition.requires?.config
        ? !definition.requires.config(config, role)
        : false,
    }));
};

/** What the edit sider offers: single-instance cards the viewer can use, never a locked one. */
export const siderEntries = (entries: ReadonlyArray<CatalogEntry>) =>
  entries.filter(
    (entry) => entry.definition.kind === 'custom' && !entry.locked,
  );

export const panelTitleKey = (
  definition: PanelDefinition,
  role: PanelCatalogContext['role'],
) =>
  role === 'superadmin' && definition.superadminTitleKey
    ? definition.superadminTitleKey
    : definition.titleKey;

export const sizeOf = (
  definition: PanelDefinition,
  viz?: Viz,
): { defaultSize: PanelSize; minSize: PanelSize } =>
  definition.sizeByViz?.[viz ?? definition.viz ?? 'table'] ?? {
    defaultSize: definition.defaultSize,
    minSize: definition.minSize,
  };

const singleInstanceDefinitions = (
  definitions: ReadonlyArray<PanelDefinition>,
  page: PanelPage,
) =>
  definitions.filter(
    (definition) =>
      definition.kind === 'custom' && definition.page.includes(page),
  );

const panelOf = (definition: PanelDefinition): PersistedPanelV2 => ({
  id: definition.key,
  key: definition.key,
  ...sizeOf(definition).defaultSize,
});

/**
 * A new board: every single-instance entry of the page except `defaultHidden`
 * ones. Role and config are not consulted; rendering skips what the viewer
 * cannot use, as the hard-coded boards did.
 */
export const seedBoard = (
  definitions: ReadonlyArray<PanelDefinition>,
  page: PanelPage,
): DashboardBoard => {
  const pageDefinitions = singleInstanceDefinitions(definitions, page);
  return {
    panels: pageDefinitions
      .filter((definition) => !definition.defaultHidden)
      .map(panelOf),
    knownKeys: pageDefinitions.map((definition) => definition.key),
  };
};

/** Appends the entries a release added since the board was saved. */
export const syncBoard = (
  board: DashboardBoard,
  definitions: ReadonlyArray<PanelDefinition>,
  page: PanelPage,
): DashboardBoard => {
  const known = new Set(board.knownKeys);
  const unseen = singleInstanceDefinitions(definitions, page).filter(
    (definition) => !known.has(definition.key),
  );
  if (unseen.length === 0) return board;
  const onBoard = new Set(board.panels.map((panel) => panel.id));
  return {
    panels: [
      ...board.panels,
      ...unseen
        .filter(
          (definition) =>
            !definition.defaultHidden && !onBoard.has(definition.key),
        )
        .map(panelOf),
    ],
    knownKeys: [
      ...board.knownKeys,
      ...unseen.map((definition) => definition.key),
    ],
  };
};

/**
 * Adds a panel. A single-instance entry's id is its key, so adding it twice is
 * a no-op; a preset needs `init.id`.
 */
export const addPanel = (
  board: DashboardBoard,
  definition: PanelDefinition,
  init: Partial<PersistedPanelV2> = {},
): DashboardBoard => {
  const id = definition.kind === 'custom' ? definition.key : init.id;
  if (!id || board.panels.some((panel) => panel.id === id)) return board;
  const viz =
    definition.kind === 'preset' ? (init.viz ?? definition.viz) : undefined;
  const panel: PersistedPanelV2 = {
    ...init,
    ...sizeOf(definition, viz).defaultSize,
    id,
    key: definition.key,
    ...(viz ? { viz } : {}),
  };
  return {
    panels: [...board.panels, panel],
    knownKeys: board.knownKeys.includes(definition.key)
      ? board.knownKeys
      : [...board.knownKeys, definition.key],
  };
};

export const removePanel = (
  board: DashboardBoard,
  id: string,
): DashboardBoard =>
  board.panels.some((panel) => panel.id === id)
    ? { ...board, panels: board.panels.filter((panel) => panel.id !== id) }
    : board;

export const updatePanel = (
  board: DashboardBoard,
  id: string,
  patch: Partial<Omit<PersistedPanelV2, 'id'>>,
): DashboardBoard => ({
  ...board,
  panels: board.panels.map((panel) =>
    panel.id === id ? { ...panel, ...patch } : panel,
  ),
});

const layoutEntryOf = (panel: PersistedPanelV2): BoardLayoutEntry => ({
  id: panel.id,
  columnSpan: panel.columnSpan,
  rowSpan: panel.rowSpan,
  ...(panel.columnOffset ? { columnOffset: panel.columnOffset } : {}),
});

/**
 * Writes what the board reported back into the panels, verbatim, so the next
 * render hands the controlled board exactly that. Panels the board is not
 * rendering keep their index (`mergeHiddenLayoutEntries`).
 */
export const applyLayout = (
  board: DashboardBoard,
  reported: ReadonlyArray<BoardLayoutEntry>,
): DashboardBoard => {
  const byId = new Map(board.panels.map((panel) => [panel.id, panel]));
  const reportedEntries = reported.filter((entry) => byId.has(entry.id));
  const reportedIds = new Set(reportedEntries.map((entry) => entry.id));
  const merged = mergeHiddenLayoutEntries(
    reportedEntries,
    board.panels.map(layoutEntryOf),
  );
  return {
    ...board,
    panels: merged.map((entry) => {
      const panel = byId.get(entry.id)!;
      if (!reportedIds.has(entry.id)) return panel;
      return {
        ..._.omit(panel, 'columnOffset'),
        columnSpan: entry.columnSpan ?? panel.columnSpan,
        rowSpan: entry.rowSpan ?? panel.rowSpan,
        ...(entry.columnOffset
          ? { columnOffset: { ...entry.columnOffset } }
          : {}),
      };
    }),
  };
};

/** Layout entries for the panels `isRenderable` accepts, min sizes from the catalog. */
export const toBoardLayout = (
  board: DashboardBoard,
  definitions: ReadonlyArray<PanelDefinition>,
  isRenderable: (panel: PersistedPanelV2) => boolean,
): Array<BoardLayoutEntry> => {
  const byKey = new Map(
    definitions.map((definition) => [definition.key, definition]),
  );
  return board.panels.flatMap((panel) => {
    const definition = byKey.get(panel.key);
    if (!definition || !isRenderable(panel)) return [];
    const { minSize } = sizeOf(definition, panel.viz);
    return [
      {
        ...layoutEntryOf(panel),
        definition: {
          minColumnSpan: minSize.columnSpan,
          minRowSpan: minSize.rowSpan,
        },
      },
    ];
  });
};

/**
 * Back to the page's default set and positions (`seeded`, the role template or
 * the code default). Presets the board has beyond the template are user-made,
 * so they stay, appended at their default size.
 */
export const resetBoard = (
  board: DashboardBoard,
  definitions: ReadonlyArray<PanelDefinition>,
  page: PanelPage,
  seeded: DashboardBoard = seedBoard(definitions, page),
): DashboardBoard => {
  const seededIds = new Set(seeded.panels.map((panel) => panel.id));
  const byKey = new Map(
    definitions.map((definition) => [definition.key, definition]),
  );
  const presets = board.panels.flatMap((panel) => {
    const definition = byKey.get(panel.key);
    if (definition?.kind !== 'preset' || seededIds.has(panel.id)) return [];
    return [
      {
        ..._.omit(panel, 'columnOffset'),
        ...sizeOf(definition, panel.viz).defaultSize,
      },
    ];
  });
  return {
    panels: [...seeded.panels, ...presets],
    knownKeys: [...new Set([...seeded.knownKeys, ...board.knownKeys])],
  };
};

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 1;

/**
 * Validates a stored board against the catalog: unknown or off-page keys,
 * duplicate ids and malformed fields drop instead of crashing the route.
 * Returns null when nothing usable is stored.
 */
export const sanitizeBoard = (
  value: unknown,
  definitions: ReadonlyArray<PanelDefinition>,
  page: PanelPage,
): DashboardBoard | null => {
  if (!value || typeof value !== 'object') return null;
  const { panels, knownKeys } = value as Partial<
    Record<keyof DashboardBoard, unknown>
  >;
  if (!Array.isArray(panels)) return null;
  const byKey = new Map(
    definitions.map((definition) => [definition.key, definition]),
  );
  const seenIds = new Set<string>();
  const sanitized = panels.flatMap((item): Array<PersistedPanelV2> => {
    if (!item || typeof item !== 'object') return [];
    const panel = item as PersistedPanelV2;
    const definition =
      typeof panel.key === 'string' ? byKey.get(panel.key) : undefined;
    if (
      typeof panel.id !== 'string' ||
      seenIds.has(panel.id) ||
      !definition ||
      !definition.page.includes(page) ||
      (panel.title !== undefined && typeof panel.title !== 'string') ||
      (panel.viz !== undefined && !VIZ_TYPES.includes(panel.viz))
    ) {
      return [];
    }
    seenIds.add(panel.id);
    const { defaultSize } = sizeOf(definition, panel.viz);
    const settings = sanitizePanelSettings(panel.settings, definition);
    return [
      {
        ..._.omit(panel, 'settings'),
        ...(settings ? { settings } : {}),
        columnSpan: isPositiveNumber(panel.columnSpan)
          ? panel.columnSpan
          : defaultSize.columnSpan,
        rowSpan: isPositiveNumber(panel.rowSpan)
          ? panel.rowSpan
          : defaultSize.rowSpan,
      },
    ];
  });
  return {
    panels: sanitized,
    knownKeys: Array.isArray(knownKeys)
      ? knownKeys.filter((key): key is string => typeof key === 'string')
      : [],
  };
};

/**
 * Drops corrupt entries of the legacy `custom_dashboard_panels` value. Kind and
 * resource are checked against the known sets: a retired kind is exactly what
 * an old payload looks like.
 */
export const sanitizePanels = (value: unknown): Array<PersistedPanel> => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is PersistedPanel => {
    if (!item || typeof item !== 'object') return false;
    const panel = item as PersistedPanel;
    return (
      typeof panel.id === 'string' &&
      (PANEL_TYPES as ReadonlyArray<string>).includes(panel.panelType) &&
      !!panel.descriptor &&
      (RESOURCE_KEYS as ReadonlyArray<string>).includes(
        panel.descriptor.resourceType,
      ) &&
      (panel.descriptor.title === undefined ||
        typeof panel.descriptor.title === 'string')
    );
  });
};

const presetPanelFromLegacy = (
  panel: PersistedPanel,
  entry?: BoardLayoutEntry,
): PersistedPanelV2 => {
  const layout = DEFAULT_PANEL_LAYOUTS[panel.panelType];
  return {
    id: panel.id,
    key: presetKey(panel.descriptor.resourceType),
    viz: PANEL_TYPE_TO_VIZ[panel.panelType],
    title: panel.descriptor.title,
    filter: panel.descriptor.filter ?? null,
    order: panel.descriptor.order ?? null,
    gridView: panel.descriptor.gridView ?? null,
    columnSpan: entry?.columnSpan ?? layout.columnSpan ?? 2,
    rowSpan: entry?.rowSpan ?? layout.rowSpan ?? 2,
    ...(entry?.columnOffset ? { columnOffset: { ...entry.columnOffset } } : {}),
  };
};

/**
 * Builds a board from the pre-catalog localStorage values: the unified layout
 * list (`dashboard_board_items` / `admin_dashboard_board_items`) and the custom
 * panels. Layout ids become the known keys, so built-in cards a release added
 * since are still appended. Null when neither value holds anything.
 */
export const migrateLegacyBoard = ({
  layout,
  customPanels,
}: {
  layout: unknown;
  customPanels: unknown;
}): DashboardBoard | null => {
  const entries = Array.isArray(layout)
    ? layout.filter(
        (entry): entry is BoardLayoutEntry =>
          !!entry && typeof entry === 'object' && typeof entry.id === 'string',
      )
    : [];
  const legacyPanels = sanitizePanels(customPanels);
  if (entries.length === 0 && legacyPanels.length === 0) return null;
  const legacyById = new Map(legacyPanels.map((panel) => [panel.id, panel]));
  const layoutIds = new Set(entries.map((entry) => entry.id));
  return {
    panels: [
      ...entries.map((entry) => {
        const legacy = legacyById.get(entry.id);
        if (legacy) return presetPanelFromLegacy(legacy, entry);
        return {
          id: entry.id,
          key: entry.id,
          // sanitizeBoard replaces a missing span with the catalog default.
          columnSpan: entry.columnSpan ?? 0,
          rowSpan: entry.rowSpan ?? 0,
          ...(entry.columnOffset
            ? { columnOffset: { ...entry.columnOffset } }
            : {}),
        };
      }),
      ...legacyPanels
        .filter((panel) => !layoutIds.has(panel.id))
        .map((panel) => presetPanelFromLegacy(panel)),
    ],
    knownKeys: entries
      .filter((entry) => !legacyById.has(entry.id))
      .map((entry) => entry.id),
  };
};

/** The custom-panel shape the panel modal and the sider read. */
export const toLegacyPanel = (
  panel: PersistedPanelV2,
  definition: PanelDefinition,
): PersistedPanel | null => {
  if (definition.kind !== 'preset' || !definition.source) return null;
  return {
    id: panel.id,
    panelType: VIZ_TO_PANEL_TYPE[panel.viz ?? definition.viz ?? 'table'],
    descriptor: {
      resourceType: definition.source,
      title: panel.title,
      filter: panel.filter ?? null,
      order: panel.order ?? null,
      gridView: panel.gridView ?? null,
      resourceGroups: panel.settings?.resourceGroups ?? null,
    },
  };
};

/** The stored board as the page shows it: sanitized, seeded when empty, synced with the catalog. */
export const resolveBoard = (
  stored: unknown,
  definitions: ReadonlyArray<PanelDefinition>,
  page: PanelPage,
): DashboardBoard =>
  syncBoard(
    sanitizeBoard(stored, definitions, page) ?? seedBoard(definitions, page),
    definitions,
    page,
  );

/** The keys of the cards a board renders for this viewer: on the board, visible and not locked. */
export const renderedPanelKeys = (
  board: DashboardBoard,
  definitions: ReadonlyArray<PanelDefinition>,
  context: PanelCatalogContext,
): Set<string> => {
  const usable = new Set(
    catalogFor(definitions, context)
      .filter((entry) => !entry.locked)
      .map((entry) => entry.definition.key),
  );
  return new Set(
    board.panels.map((panel) => panel.key).filter((key) => usable.has(key)),
  );
};
