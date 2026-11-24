/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../../app-shim';
import { generateUUID } from '../../helper/uuid';
import { useCurrentUserRole } from '../../hooks/backendai';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useIsCurrentProjectAdmin } from '../../hooks/useCurrentUserProjectRoles';
import { useEffectiveLoginConfig } from '../../hooks/useWebUIConfig';
import DashboardPanelContent from './DashboardPanelContent';
import DashboardPreviewMark from './DashboardPreviewMark';
import PanelFrame from './PanelFrame';
import { PanelHeaderSettingsContext } from './PanelSettingsHeaderControls';
import {
  applyAssistantActions as applyActionsToBoard,
  settingsTouchedBy,
  type DashboardAssistantAction,
  type DashboardAssistantCard,
} from './assistantActions';
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
  setPanelsHidden,
  toBoardLayout,
  toLegacyPanel,
  updatePanel,
  type CatalogEntry,
} from './boardModel';
import type { DashboardChatPanel } from './dashboardChat';
import {
  addBoard,
  createEmptyBoard,
  mergePanelEdits,
  updateBoard,
} from './dashboardConfig';
import {
  createPanel,
  panelConfigFromInput,
  settingsFromInput,
} from './defaults';
import { DetailLinkContext, resolveDetailLink } from './detailLink';
import { effectivePanelType, panelRegistry } from './panelRegistry';
import {
  effectivePanelSettings,
  nextOverride,
  overrideKeyOf,
  overriddenSettings,
  panelSettingOverridesAtom,
} from './panelSettingOverrides';
import { hasSetting, mergeSettings, panelDefinitionOf } from './panelSettings';
import { previewMarksOf } from './previewMarks';
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
    save: (board) => {
      const base = boards.activeBoard.panels;
      boards.update((config) =>
        updateBoard(config, boards.activeBoard.id, (active) => ({
          ...active,
          panels: mergePanelEdits(base, board.panels, active.panels),
          knownKeys: _.union(active.knownKeys, board.knownKeys),
        })),
      );
    },
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
  /** Panels the viewer may not read: left off the board, kept in the stored one. */
  deniedPanelIds?: ReadonlyMap<string, string>;
  /** Proposed changes the board previews without saving them. */
  draftActions?: ReadonlyArray<DashboardAssistantAction>;
}

export interface UseDashboardBoardResult {
  boardItems: Array<BAIBoardItem>;
  /** Persists what the board reported after a move or resize. */
  onLayoutChange: (reported: ReadonlyArray<BoardLayoutEntry>) => void;
  /** Single-instance entries for the sider checklist. */
  catalogEntries: Array<CatalogEntry>;
  activeKeys: ReadonlySet<string>;
  /** Catalog keys on the board that are hidden because the viewer may not read them. */
  deniedKeys: ReadonlySet<string>;
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
  /** The previewed board's cards, on-board ones first in board order. */
  assistantCards: Array<DashboardAssistantCard>;
  /** The previewed board's custom panels. */
  assistantPanels: Array<DashboardChatPanel>;
  /** The saved board's cards and custom panels, which a URL draft is read against. */
  savedAssistantCards: Array<DashboardAssistantCard>;
  savedAssistantPanels: Array<DashboardChatPanel>;
  /** True, after telling the user, when a preview is shown and a board edit must wait for Apply or Discard. */
  blockedByPreview: () => boolean;
  /** Applies the WebUI Assistant's proposed changes in one save. */
  applyAssistantActions: (
    actions: ReadonlyArray<DashboardAssistantAction>,
  ) => void;
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
  deniedPanelIds,
  draftActions,
}: UseDashboardBoardOptions): UseDashboardBoardResult => {
  'use memo';
  const { t } = useTranslation();
  const role = useCurrentUserRole();
  const isProjectAdmin = useIsCurrentProjectAdmin();
  const loginConfig = useEffectiveLoginConfig();
  const [gridEnabled] = useBAISettingUserState(
    'experimental_session_resource_grid',
  );
  const {
    board: storedBoard,
    save: saveBoard,
    template,
    boards,
  } = useBoardStore(page, catalog);
  const { message } = App.useApp();
  // A card edit during a preview would save the previewed state: Apply or Discard first.
  const isPreviewing = !!draftActions?.length;
  const blockedByPreview = () => {
    if (!isPreviewing) return false;
    message.info(t('dashboard.agentDraft.FinishPreviewFirst'));
    return true;
  };
  const save = (next: DashboardBoard) => {
    if (blockedByPreview()) return;
    saveBoard(next);
  };
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

  // A card the draft re-ranges shows the draft's range, not a header pick.
  const touchedByDraft = settingsTouchedBy(draftActions ?? []);
  const overrideOf = (panelId: string) =>
    touchedByDraft === 'all' || touchedByDraft.includes(panelId)
      ? undefined
      : settingOverrides[overrideKey(panelId)];

  const config: PanelCatalogConfig = {
    blockList: loginConfig.blockList ?? [],
    inactiveList: loginConfig.inactiveList ?? [],
    hideAgents: !!loginConfig.hideAgents,
    enableModelFolders: !!loginConfig.enableModelFolders,
  };
  const visibleEntries = catalogFor(catalog, {
    page,
    role,
    config,
    isProjectAdmin,
  });
  const visibleByKey = new Map(
    visibleEntries.map((entry) => [entry.definition.key, entry]),
  );
  const definitionByKey = new Map(
    catalog.map((definition) => [definition.key, definition]),
  );

  const board = resolveBoard(storedBoard, catalog, page);

  const isRenderable = (panel: PersistedPanelV2) => {
    const entry = visibleByKey.get(panel.key);
    return !!entry && !entry.locked && !deniedPanelIds?.has(panel.id);
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
    if (blockedByPreview()) return;
    clearOverrides([id]);
    save(removePanel(board, id));
  };

  const addCustomPanel = (input: PanelInput) => {
    const panel = createPanel(input);
    const definition = definitionByKey.get(panel.key);
    if (definition) save(addPanel(board, definition, panel));
  };

  const updateCustomPanel = (id: string, input: PanelInput) => {
    if (blockedByPreview()) return;
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
    // Like a settings-modal save, the saved default replaces a header pick.
    clearOverrides([id]);
    save(
      updatePanel(board, id, {
        ...next,
        ...resized,
        settings: settingsFromInput(current.settings, input),
      }),
    );
  };

  const setPanelsActive = (keys: ReadonlyArray<string>, active: boolean) => {
    if (blockedByPreview()) return;
    // A user-made panel is listed by its id and only hidden, so unchecking it keeps it.
    const presetIds = new Set(
      board.panels
        .filter((panel) => definitionByKey.get(panel.key)?.kind === 'preset')
        .map((panel) => panel.id),
    );
    // Folded into one board: saving per key would keep only the last change.
    const next = keys
      .filter((key) => !presetIds.has(key))
      .reduce(
        (current, key) => {
          const definition = definitionByKey.get(key);
          if (!definition) return current;
          return active
            ? addPanel(current, definition, {}, page)
            : removePanel(current, key);
        },
        setPanelsHidden(
          board,
          keys.filter((key) => presetIds.has(key)),
          !active,
        ),
      );
    if (!active) clearOverrides(keys);
    if (next !== board) save(next);
  };

  // A card reads its header pick over its saved settings; edits and saves keep using `panel`.
  const contentOf = (panel: PersistedPanelV2): React.ReactNode => {
    const catalogDefinition = definitionByKey.get(panel.key);
    if (!catalogDefinition) return null;
    const definition = panelDefinitionOf(catalogDefinition, panel);
    const override = overrideOf(panel.id);
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
              deniedFrame={(body) => (
                <PanelFrame title={t(panelTitleKey(definition, role, page))}>
                  {body}
                </PanelFrame>
              )}
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
                    onChangeSettings={(patch) =>
                      save(
                        updatePanel(board, panel.id, {
                          settings: mergeSettings(panel.settings, patch),
                        }),
                      )
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
          isUserPanel
          deniedFrame={(body) => (
            <PanelFrame
              title={resolvePanelTitle(viewLegacyPanel.descriptor, t)}
              onEdit={() => {
                if (!blockedByPreview()) onRequestEditCustomPanel(legacyPanel);
              }}
              onRemove={() => removeById(panel.id)}
            >
              {body}
            </PanelFrame>
          )}
        >
          {({ fetchKey, vars }) => (
            <Panel
              descriptor={viewLegacyPanel.descriptor}
              fetchKey={fetchKey}
              refreshedAt={vars.refreshedAt}
              panelId={panel.id}
              onEdit={() => {
                if (!blockedByPreview()) onRequestEditCustomPanel(legacyPanel);
              }}
              onRemove={() => removeById(panel.id)}
            />
          )}
        </DashboardPanelContent>
      </BAIBoardItemErrorBoundary>,
    );
  };

  const draftNewBoard = draftActions?.find(
    (action) => action.type === 'createBoard',
  );
  const shownBoard = draftActions?.length
    ? applyActionsToBoard(board, draftActions, {
        definitionByKey,
        catalog,
        page,
        template,
        emptyBoard: draftNewBoard
          ? createEmptyBoard({ id: 'draft', title: '' }, catalog, page)
          : undefined,
      })
    : board;
  const savedLayout = toBoardLayout(board, catalog, isRenderable);
  const previewMarks = draftActions?.length
    ? previewMarksOf(
        new Set(savedLayout.map((entry) => entry.id)),
        draftActions,
      )
    : new Map();
  const markedContent = (id: string, content: React.ReactNode) => {
    const mark = previewMarks.get(id);
    return mark ? (
      <DashboardPreviewMark mark={mark}>{content}</DashboardPreviewMark>
    ) : (
      content
    );
  };
  const boardItems: Array<BAIBoardItem> = toBoardLayout(
    shownBoard,
    catalog,
    isRenderable,
  ).map((entry) => {
    const panel = shownBoard.panels.find((item) => item.id === entry.id)!;
    return {
      ...entry,
      data: { content: markedContent(panel.id, contentOf(panel)) },
    };
  });
  // A card the preview hides stays where it was, dimmed, after the card that preceded it.
  const previewItems = [...boardItems];
  if (!draftNewBoard) {
    savedLayout.forEach((entry, index) => {
      if (previewMarks.get(entry.id)?.kind !== 'hidden') return;
      if (previewItems.some((item) => item.id === entry.id)) return;
      const panel = board.panels.find((item) => item.id === entry.id);
      if (!panel) return;
      const before = _.findLast(savedLayout.slice(0, index), (prior) =>
        previewItems.some((item) => item.id === prior.id),
      );
      const at = before
        ? previewItems.findIndex((item) => item.id === before.id) + 1
        : 0;
      previewItems.splice(at, 0, {
        ...entry,
        data: { content: markedContent(panel.id, contentOf(panel)) },
      });
    });
  }

  const customPanels = board.panels.flatMap((panel) => {
    const definition = definitionByKey.get(panel.key);
    const legacyPanel = definition ? toLegacyPanel(panel, definition) : null;
    return legacyPanel ? [legacyPanel] : [];
  });

  const titleOf = (panel: PersistedPanelV2, definition: PanelDefinition) => {
    const legacyPanel = toLegacyPanel(panel, definition);
    return legacyPanel
      ? resolvePanelTitle(legacyPanel.descriptor, t)
      : t(panelTitleKey(definition, role, page));
  };
  const assistantCardOf = (
    panel: PersistedPanelV2,
    shown: boolean,
  ): DashboardAssistantCard | null => {
    const catalogDefinition = definitionByKey.get(panel.key);
    if (!catalogDefinition) return null;
    const definition = panelDefinitionOf(catalogDefinition, panel);
    return {
      id: panel.id,
      title: titleOf(panel, definition),
      shown,
      ...(shown
        ? { columnSpan: panel.columnSpan, rowSpan: panel.rowSpan }
        : {}),
      ...(hasSetting(definition, 'range')
        ? {
            range:
              effectivePanelSettings(
                panel.settings,
                overrideOf(panel.id),
                definition,
              )?.range ?? 'default',
          }
        : {}),
    };
  };
  /** A board as the assistant reads it: its cards and its custom panels. */
  const assistantViewOf = (viewed: DashboardBoard) => {
    const onBoardIds = new Set(
      toBoardLayout(viewed, catalog, isRenderable).map((entry) => entry.id),
    );
    const cards = [
      ...viewed.panels
        .filter((panel) => onBoardIds.has(panel.id))
        .map((panel) => assistantCardOf(panel, true)),
      // User-made panels taken off the board, then the catalog cards not on it.
      ...viewed.panels
        .filter((panel) => panel.hidden && isRenderable(panel))
        .map((panel) => assistantCardOf(panel, false)),
      ...siderEntries(visibleEntries)
        .filter(
          (entry) => !viewed.panels.some((p) => p.key === entry.definition.key),
        )
        .map((entry) =>
          assistantCardOf(
            {
              id: entry.definition.key,
              key: entry.definition.key,
              ...entry.definition.defaultSize,
            },
            false,
          ),
        ),
    ].filter((card): card is DashboardAssistantCard => !!card);
    const panels = viewed.panels.flatMap((panel): Array<DashboardChatPanel> => {
      const definition = definitionByKey.get(panel.key);
      const legacy = definition ? toLegacyPanel(panel, definition) : null;
      if (!legacy) return [];
      const { descriptor } = legacy;
      return [
        {
          id: panel.id,
          title: resolvePanelTitle(descriptor, t),
          input: {
            panelType: legacy.panelType,
            resourceType: descriptor.resourceType,
            title: descriptor.title,
            filter: descriptor.filter,
            order: descriptor.order,
            gridView: descriptor.gridView,
            chart: descriptor.chart,
            range: descriptor.range,
          },
        },
      ];
    });
    return { cards, panels };
  };
  // The previewed board, so a follow-up request sees the chat's earlier changes.
  const { cards: assistantCards, panels: assistantPanels } =
    assistantViewOf(shownBoard);
  // The saved board, which a draft carried in the URL is read against.
  const savedAssistantView = draftActions?.length
    ? assistantViewOf(board)
    : { cards: assistantCards, panels: assistantPanels };

  return {
    boardItems: previewItems,
    // A preview is not saved, so a move made on it would land on the stored layout.
    onLayoutChange: (reported) => {
      if (!draftActions?.length) saveBoard(applyLayout(board, reported));
    },
    catalogEntries: siderEntries(visibleEntries),
    // Catalog keys of the cards on the board, plus the ids of the user-made panels shown on it.
    activeKeys: new Set(
      board.panels.flatMap((panel) =>
        panel.hidden ? [] : [panel.key, panel.id],
      ),
    ),
    deniedKeys: new Set(
      board.panels
        .filter((panel) => deniedPanelIds?.has(panel.id))
        .map((panel) => panel.key),
    ),
    setPanelsActive,
    customPanels,
    availableResources: availableResourceKeys(role),
    gridEnabled: !!gridEnabled,
    addCustomPanel,
    updateCustomPanel,
    removePanel: removeById,
    settingsTargetOf: (id) => {
      const panel = board.panels.find((item) => item.id === id);
      const catalogDefinition = panel
        ? definitionByKey.get(panel.key)
        : undefined;
      const definition =
        panel && catalogDefinition
          ? panelDefinitionOf(catalogDefinition, panel)
          : undefined;
      if (!panel || !definition?.settings?.length) return null;
      const legacyPanel = toLegacyPanel(panel, definition);
      return {
        title: legacyPanel
          ? resolvePanelTitle(legacyPanel.descriptor, t)
          : t(panelTitleKey(definition, role, page)),
        definition,
        settings: panel.settings,
      };
    },
    // The modal edits resource group and range; the table's column picks stay.
    updatePanelSettings: (id, settings) => {
      if (blockedByPreview()) return;
      const current = board.panels.find((item) => item.id === id)?.settings;
      save(
        updatePanel(board, id, {
          settings: mergeSettings(settings, {
            columnOverrides: current?.columnOverrides,
          }),
        }),
      );
      setOverride(id, undefined);
    },
    resetLayout: () => {
      if (blockedByPreview()) return;
      clearOverrides('all');
      save(resetBoard(board, catalog, page, template));
    },
    boards,
    assistantCards,
    assistantPanels,
    blockedByPreview,
    savedAssistantCards: savedAssistantView.cards,
    savedAssistantPanels: savedAssistantView.panels,
    applyAssistantActions: (actions) => {
      const newBoard = actions.find((action) => action.type === 'createBoard');
      if (newBoard) {
        const empty = createEmptyBoard(
          { id: generateUUID(), title: newBoard.title },
          catalog,
          page,
        );
        const filled = applyActionsToBoard(board, actions, {
          definitionByKey,
          catalog,
          page,
          template,
          emptyBoard: empty,
        });
        // Changes before createBoard stay on the current board.
        const before = actions.slice(0, actions.indexOf(newBoard));
        const current = applyActionsToBoard(board, before, {
          definitionByKey,
          catalog,
          page,
          template,
        });
        if (current !== board) clearOverrides(settingsTouchedBy(before));
        // One update: two in a row would each start from this render's config.
        // The active board merges as save() does, so another tab's edits survive.
        boards.update((config) =>
          addBoard(
            current === board
              ? config
              : updateBoard(config, boards.activeBoard.id, (active) => ({
                  ...active,
                  panels: mergePanelEdits(
                    boards.activeBoard.panels,
                    current.panels,
                    active.panels,
                  ),
                  knownKeys: _.union(active.knownKeys, current.knownKeys),
                })),
            { ...empty, panels: filled.panels, knownKeys: filled.knownKeys },
          ),
        );
        return;
      }
      const next = applyActionsToBoard(board, actions, {
        definitionByKey,
        catalog,
        page,
        template,
      });
      if (next === board) return;
      clearOverrides(settingsTouchedBy(actions));
      saveBoard(next);
    },
  };
};
