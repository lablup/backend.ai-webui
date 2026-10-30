/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../../hooks';
import { useCurrentUserRole } from '../../hooks/backendai';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import DashboardPanelContent from './DashboardPanelContent';
import { PanelHeaderSettingsContext } from './PanelSettingsHeaderControls';
import type { BoardLayoutEntry } from './boardLayout';
import {
  addPanel,
  applyLayout,
  catalogFor,
  panelTitleKey,
  removePanel,
  resetBoard,
  resolveBoard,
  siderEntries,
  sizeOf,
  toBoardLayout,
  toLegacyPanel,
  updatePanel,
  type CatalogEntry,
} from './boardModel';
import { updateBoard } from './dashboardConfig';
import { createPanel, panelConfigFromInput } from './defaults';
import { DetailLinkContext, resolveDetailLink } from './detailLink';
import { effectivePanelType, panelRegistry } from './panelRegistry';
import {
  effectivePanelSettings,
  nextOverride,
  overrideKeyOf,
  overriddenSettings,
  panelSettingOverridesAtom,
} from './panelSettingOverrides';
import { availableResourceKeys, resolvePanelTitle } from './resourceRegistry';
import type {
  DashboardBoard,
  DashboardPageQueryRefs,
  PanelCatalogConfig,
  PanelDefinition,
  PanelInput,
  PanelPage,
  PanelSettings,
  PersistedPanel,
  PersistedPanelV2,
  ResourceKey,
} from './types';
import {
  useDashboardBoards,
  type DashboardBoardsState,
} from './useDashboardBoards';
import { BAIBoardItemErrorBoundary, type BAIBoardItem } from 'backend.ai-ui';
import { useAtom } from 'jotai';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';

/** Where a board is kept. The next storage backend replaces `useBoardStore`, nothing else. */
export type BoardStore = (
  page: PanelPage,
  catalog: ReadonlyArray<PanelDefinition>,
) => {
  /** The stored board, unsanitized; null when nothing is stored. */
  board: unknown;
  save: (board: DashboardBoard) => void;
  /** What "Reset layout" restores; the code default when absent. */
  template?: DashboardBoard;
  /** The page's boards, for the board tabs and the refresh interval. */
  boards: DashboardBoardsState;
};

/** Keeps the page's active board in `userConfig.dashboard` (manager app config). */
export const useAppConfigBoardStore: BoardStore = (page, catalog) => {
  'use memo';
  const boards = useDashboardBoards(page, catalog);
  return {
    board: boards.activeBoard,
    save: (board) =>
      boards.update((config) =>
        updateBoard(config, boards.activeBoard.id, (active) => ({
          ...active,
          panels: board.panels,
          knownKeys: board.knownKeys,
        })),
      ),
    template: boards.template,
    boards,
  };
};

const useBoardStore: BoardStore = useAppConfigBoardStore;

export interface UseDashboardBoardOptions {
  page: PanelPage;
  /** The page query is refetching. */
  isRefetching: boolean;
  queryRefs: DashboardPageQueryRefs;
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
  /** Adds or removes several catalog cards in one save. */
  setPanelsActive: (keys: ReadonlyArray<string>, active: boolean) => void;
  customPanels: Array<PersistedPanel>;
  availableResources: ReadonlyArray<ResourceKey>;
  /** `experimental_session_resource_grid`, which gates the grid panel kind. */
  gridEnabled: boolean;
  addCustomPanel: (input: PanelInput) => void;
  updateCustomPanel: (id: string, input: PanelInput) => void;
  removePanel: (id: string) => void;
  resetLayout: () => void;
  /** A panel on the board whose card takes settings; null otherwise. */
  settingsTargetOf: (id: string) => PanelSettingsTarget | null;
  updatePanelSettings: (
    id: string,
    settings: PanelSettings | undefined,
  ) => void;
  boards: DashboardBoardsState;
}

export interface PanelSettingsTarget {
  title: string;
  definition: PanelDefinition;
  settings?: PanelSettings;
}

/** One page's board: the catalog resolved for the viewer, the stored layout, and the content per panel. */
export const useDashboardBoard = ({
  page,
  isRefetching,
  queryRefs,
  onRequestEditCustomPanel,
  catalog,
}: UseDashboardBoardOptions): UseDashboardBoardResult => {
  'use memo';
  const { t } = useTranslation();
  const role = useCurrentUserRole();
  const baiClient = useSuspendedBackendaiClient();
  const [gridEnabled] = useBAISettingUserState(
    'experimental_session_resource_grid',
  );
  const {
    board: storedBoard,
    save,
    template,
    boards,
  } = useBoardStore(page, catalog);
  const [settingOverrides, setSettingOverrides] = useAtom(
    panelSettingOverridesAtom,
  );
  const overrideKey = (panelId: string) =>
    overrideKeyOf(boards.activeBoard.id, panelId);
  const setOverride = (
    panelId: string,
    override: (typeof settingOverrides)[string] | undefined,
  ) =>
    setSettingOverrides((prev) =>
      override
        ? { ...prev, [overrideKey(panelId)]: override }
        : _.omit(prev, overrideKey(panelId)),
    );

  const config: PanelCatalogConfig = {
    blockList: baiClient?._config?.blockList ?? [],
    inactiveList: baiClient?._config?.inactiveList ?? [],
    hideAgents: !!baiClient?._config?.hideAgents,
    enableModelFolders: !!baiClient?._config?.enableModelFolders,
  };
  const visibleEntries = catalogFor(catalog, { page, role, config });
  const visibleByKey = new Map(
    visibleEntries.map((entry) => [entry.definition.key, entry]),
  );
  const definitionByKey = new Map(
    catalog.map((definition) => [definition.key, definition]),
  );

  const board = resolveBoard(storedBoard, catalog, page);

  const isRenderable = (panel: PersistedPanelV2) => {
    const entry = visibleByKey.get(panel.key);
    return !!entry && !entry.locked;
  };

  // A removed card's header pick goes with it, so a re-added card starts from its saved settings.
  const clearOverrides = (panelIds: ReadonlyArray<string> | 'all') =>
    setSettingOverrides((prev) =>
      _.omitBy(prev, (_override, key) =>
        panelIds === 'all'
          ? key.startsWith(overrideKeyOf(boards.activeBoard.id, ''))
          : panelIds.some((id) => key === overrideKey(id)),
      ),
    );

  const removeById = (id: string) => {
    clearOverrides([id]);
    save(removePanel(board, id));
  };

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

  const setPanelsActive = (keys: ReadonlyArray<string>, active: boolean) => {
    // Folded into one board: saving per key would keep only the last change.
    const next = keys.reduce((current, key) => {
      const definition = definitionByKey.get(key);
      if (!definition) return current;
      return active ? addPanel(current, definition) : removePanel(current, key);
    }, board);
    if (!active) clearOverrides(keys);
    if (next !== board) save(next);
  };

  // A card reads its header pick over its saved settings; edits and saves keep using `panel`.
  const contentOf = (panel: PersistedPanelV2): React.ReactNode => {
    const definition = definitionByKey.get(panel.key);
    if (!definition) return null;
    const override = settingOverrides[overrideKey(panel.id)];
    const effective = effectivePanelSettings(
      panel.settings,
      override,
      definition,
    );
    const viewPanel: PersistedPanelV2 = { ...panel, settings: effective };
    const withHeaderSettings = (content: React.ReactNode) =>
      definition.settings?.length ? (
        <PanelHeaderSettingsContext.Provider
          value={{
            definition,
            saved: panel.settings,
            effective,
            overridden: overriddenSettings(
              panel.settings,
              override,
              definition,
            ),
            onChange: (change) =>
              setOverride(
                panel.id,
                nextOverride(override, change, panel.settings, definition),
              ),
            onReset: () => setOverride(panel.id, undefined),
          }}
        >
          {content}
        </PanelHeaderSettingsContext.Provider>
      ) : (
        content
      );
    if (definition.kind === 'custom') {
      const Component = definition.Component;
      return Component
        ? withHeaderSettings(
            <DashboardPanelContent
              panel={viewPanel}
              isPageRefetching={isRefetching}
            >
              {(state) => (
                <DetailLinkContext.Provider
                  value={resolveDetailLink(definition, {
                    page,
                    settings: effective,
                  })}
                >
                  <Component
                    panel={viewPanel}
                    queryRefs={queryRefs}
                    onChangeFilter={(filter) =>
                      save(updatePanel(board, panel.id, { filter }))
                    }
                    {...state}
                  />
                </DetailLinkContext.Provider>
              )}
            </DashboardPanelContent>,
          )
        : null;
    }
    const legacyPanel = toLegacyPanel(panel, definition);
    const viewLegacyPanel = toLegacyPanel(viewPanel, definition);
    if (!legacyPanel || !viewLegacyPanel) return null;
    const Panel =
      panelRegistry[
        effectivePanelType(viewLegacyPanel, { gridEnabled: !!gridEnabled })
      ];
    return withHeaderSettings(
      <BAIBoardItemErrorBoundary
        // Keyed by kind and descriptor so a config edit clears a stuck error state.
        key={`${viewLegacyPanel.panelType}:${JSON.stringify(viewLegacyPanel.descriptor)}`}
        title={resolvePanelTitle(viewLegacyPanel.descriptor, t)}
        status="error"
      >
        <DashboardPanelContent
          panel={viewPanel}
          isPageRefetching={isRefetching}
        >
          {({ fetchKey }) => (
            <Panel
              descriptor={viewLegacyPanel.descriptor}
              fetchKey={fetchKey}
              panelId={panel.id}
              onEdit={() => onRequestEditCustomPanel(legacyPanel)}
              onRemove={() => removeById(panel.id)}
            />
          )}
        </DashboardPanelContent>
      </BAIBoardItemErrorBoundary>,
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
    catalogEntries: siderEntries(visibleEntries),
    activeKeys: new Set(board.panels.map((panel) => panel.key)),
    setPanelsActive,
    customPanels,
    availableResources: availableResourceKeys(role),
    gridEnabled: !!gridEnabled,
    addCustomPanel,
    updateCustomPanel,
    removePanel: removeById,
    settingsTargetOf: (id) => {
      const panel = board.panels.find((item) => item.id === id);
      const definition = panel ? definitionByKey.get(panel.key) : undefined;
      if (!panel || !definition?.settings?.length) return null;
      const legacyPanel = toLegacyPanel(panel, definition);
      return {
        title: legacyPanel
          ? resolvePanelTitle(legacyPanel.descriptor, t)
          : t(panelTitleKey(definition, role)),
        definition,
        settings: panel.settings,
      };
    },
    updatePanelSettings: (id, settings) => {
      save(updatePanel(board, id, { settings }));
      setOverride(id, undefined);
    },
    resetLayout: () => {
      clearOverrides('all');
      save(resetBoard(board, catalog, page, template));
    },
    boards,
  };
};
