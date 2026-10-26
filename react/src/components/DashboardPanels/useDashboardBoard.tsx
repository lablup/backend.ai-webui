/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../../hooks';
import { useCurrentUserRole } from '../../hooks/backendai';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../../hooks/useCurrentProject';
import type { BoardLayoutEntry } from './boardLayout';
import {
  addPanel,
  applyLayout,
  catalogFor,
  migrateLegacyBoard,
  removePanel,
  resetBoard,
  sanitizeBoard,
  seedBoard,
  sizeOf,
  syncBoard,
  toBoardLayout,
  toLegacyPanel,
  updatePanel,
  type CatalogEntry,
} from './boardModel';
import { createPanel, panelConfigFromInput } from './defaults';
import { effectivePanelType, panelRegistry } from './panelRegistry';
import { availableResourceKeys, resolvePanelTitle } from './resourceRegistry';
import type {
  DashboardBoard,
  DashboardPageQueryRefs,
  PanelCatalogConfig,
  PanelDefinition,
  PanelInput,
  PanelPage,
  PersistedPanel,
  PersistedPanelV2,
  ResourceKey,
} from './types';
import { BAIBoardItemErrorBoundary, type BAIBoardItem } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

/** Where a board is kept. The next storage backend replaces `useBoardStore`, nothing else. */
export type BoardStore = (page: PanelPage) => {
  /** The stored board, unsanitized; null when nothing is stored. */
  board: unknown;
  save: (board: DashboardBoard) => void;
};

const BOARD_SETTING_KEYS = {
  project: 'dashboard_board.project',
  projectAdmin: 'dashboard_board.projectAdmin',
  admin: 'dashboard_board.admin',
} as const;

/**
 * Keeps each page's board in localStorage. Until a page's board is first saved
 * it is read from the pre-catalog keys, so existing layouts carry over.
 */
export const useLocalStorageBoardStore: BoardStore = (page) => {
  'use memo';
  const [stored, setStored] = useBAISettingUserState(BOARD_SETTING_KEYS[page]);
  const [legacyLayout] = useBAISettingUserState('dashboard_board_items');
  const [legacyAdminLayout] = useBAISettingUserState(
    'admin_dashboard_board_items',
  );
  const [legacyCustomPanels] = useBAISettingUserState(
    'custom_dashboard_panels',
  );
  const legacyBoard =
    page === 'project'
      ? migrateLegacyBoard({
          layout: legacyLayout,
          customPanels: legacyCustomPanels,
        })
      : page === 'admin'
        ? migrateLegacyBoard({ layout: legacyAdminLayout, customPanels: [] })
        : null;
  return {
    board: stored ?? legacyBoard,
    save: (board) => setStored(board),
  };
};

const useBoardStore: BoardStore = useLocalStorageBoardStore;

export interface UseDashboardBoardOptions {
  page: PanelPage;
  fetchKey: string;
  isRefetching: boolean;
  queryRefs: DashboardPageQueryRefs;
  onRefresh: () => void;
  /** Opens the panel modal pre-filled with a custom panel. */
  onRequestEditCustomPanel: (panel: PersistedPanel) => void;
  catalog: ReadonlyArray<PanelDefinition>;
}

export interface UseDashboardBoardResult {
  boardItems: Array<BAIBoardItem>;
  /** Persists what the board reported after a move or resize. */
  onLayoutChange: (reported: ReadonlyArray<BoardLayoutEntry>) => void;
  /** Single-instance entries for the sider checklist. */
  catalogEntries: Array<CatalogEntry>;
  activeKeys: ReadonlySet<string>;
  setPanelActive: (key: string, active: boolean) => void;
  customPanels: Array<PersistedPanel>;
  availableResources: ReadonlyArray<ResourceKey>;
  /** `experimental_session_resource_grid`, which gates the grid panel kind. */
  gridEnabled: boolean;
  addCustomPanel: (input: PanelInput) => void;
  updateCustomPanel: (id: string, input: PanelInput) => void;
  removePanel: (id: string) => void;
  resetLayout: () => void;
}

/** One page's board: the catalog resolved for the viewer, the stored layout, and the content per panel. */
export const useDashboardBoard = ({
  page,
  fetchKey,
  isRefetching,
  queryRefs,
  onRefresh,
  onRequestEditCustomPanel,
  catalog,
}: UseDashboardBoardOptions): UseDashboardBoardResult => {
  'use memo';
  const { t } = useTranslation();
  const role = useCurrentUserRole();
  const baiClient = useSuspendedBackendaiClient();
  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const [gridEnabled] = useBAISettingUserState(
    'experimental_session_resource_grid',
  );
  const { board: storedBoard, save } = useBoardStore(page);

  const config: PanelCatalogConfig = {
    blockList: baiClient?._config?.blockList ?? [],
    inactiveList: baiClient?._config?.inactiveList ?? [],
    hideAgents: !!baiClient?._config?.hideAgents,
  };
  const visibleEntries = catalogFor(catalog, { page, role, config });
  const visibleByKey = new Map(
    visibleEntries.map((entry) => [entry.definition.key, entry]),
  );
  const definitionByKey = new Map(
    catalog.map((definition) => [definition.key, definition]),
  );

  const board = syncBoard(
    sanitizeBoard(storedBoard, catalog, page) ?? seedBoard(catalog, page),
    catalog,
    page,
  );

  const isRenderable = (panel: PersistedPanelV2) => {
    const entry = visibleByKey.get(panel.key);
    return !!entry && !entry.locked;
  };

  const removeById = (id: string) => save(removePanel(board, id));

  const addCustomPanel = (input: PanelInput) => {
    const panel = createPanel(input);
    const definition = definitionByKey.get(panel.key);
    if (definition) save(addPanel(board, definition, panel));
  };

  const updateCustomPanel = (id: string, input: PanelInput) => {
    const current = board.panels.find((panel) => panel.id === id);
    const next = panelConfigFromInput(input);
    const definition = definitionByKey.get(next.key);
    if (!current || !definition) return;
    // The stored size always wins over a default, so a kind switch must
    // rewrite it, or a table switched to a count keeps the table's spans.
    const resized =
      current.viz !== next.viz
        ? {
            ...sizeOf(definition, next.viz).defaultSize,
            columnOffset: undefined,
          }
        : {};
    save(updatePanel(board, id, { ...next, ...resized }));
  };

  const setPanelActive = (key: string, active: boolean) => {
    const definition = definitionByKey.get(key);
    if (!definition) return;
    save(active ? addPanel(board, definition) : removePanel(board, key));
  };

  const contentOf = (panel: PersistedPanelV2): React.ReactNode => {
    const definition = definitionByKey.get(panel.key);
    if (!definition) return null;
    if (definition.kind === 'custom') {
      const Component = definition.Component;
      return Component ? (
        <Component
          panel={panel}
          scope={{ type: 'project', projectId: currentProject.id ?? null }}
          vars={{
            projectId: currentProject.id ?? null,
            resourceGroup: currentResourceGroup ?? null,
          }}
          fetchKey={fetchKey}
          isRefetching={isRefetching}
          queryRefs={queryRefs}
          onRefresh={onRefresh}
        />
      ) : null;
    }
    const legacyPanel = toLegacyPanel(panel, definition);
    if (!legacyPanel) return null;
    const Panel =
      panelRegistry[
        effectivePanelType(legacyPanel, { gridEnabled: !!gridEnabled })
      ];
    return (
      <BAIBoardItemErrorBoundary
        // Keyed by kind and descriptor so a config edit clears a stuck error state.
        key={`${legacyPanel.panelType}:${JSON.stringify(legacyPanel.descriptor)}`}
        title={resolvePanelTitle(legacyPanel.descriptor, t)}
        status="error"
      >
        <Panel
          descriptor={legacyPanel.descriptor}
          fetchKey={fetchKey}
          panelId={panel.id}
          onEdit={() => onRequestEditCustomPanel(legacyPanel)}
          onRemove={() => removeById(panel.id)}
        />
      </BAIBoardItemErrorBoundary>
    );
  };

  const boardItems: Array<BAIBoardItem> = toBoardLayout(
    board,
    catalog,
    isRenderable,
  ).map((entry) => {
    const panel = board.panels.find((item) => item.id === entry.id)!;
    return { ...entry, data: { content: contentOf(panel) } };
  });

  const customPanels = board.panels.flatMap((panel) => {
    const definition = definitionByKey.get(panel.key);
    const legacyPanel = definition ? toLegacyPanel(panel, definition) : null;
    return legacyPanel ? [legacyPanel] : [];
  });

  return {
    boardItems,
    onLayoutChange: (reported) => save(applyLayout(board, reported)),
    catalogEntries: visibleEntries.filter(
      (entry) => entry.definition.kind === 'custom',
    ),
    activeKeys: new Set(board.panels.map((panel) => panel.key)),
    setPanelActive,
    customPanels,
    availableResources: availableResourceKeys(role),
    gridEnabled: !!gridEnabled,
    addCustomPanel,
    updateCustomPanel,
    removePanel: removeById,
    resetLayout: () => save(resetBoard(board, catalog, page)),
  };
};
