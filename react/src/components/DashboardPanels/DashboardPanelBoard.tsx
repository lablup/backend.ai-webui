/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AGENT_PREFILL_PARAM } from '../../helper/webmcpConstants';
import type { ProjectContextOrNull } from '../../types/projectContext';
import { dashboardEditModeAtom } from '../dashboardEditModeAtom';
import DashboardBoardSection from './DashboardBoardSection';
import DashboardBoardTabs from './DashboardBoardTabs';
import DashboardDraftConfirmBar from './DashboardDraftConfirmBar';
import DashboardEditSider from './DashboardEditSider';
import DashboardFilterBar from './DashboardFilterBar';
import './DashboardPanelBoard.css';
import DashboardPanelModal from './DashboardPanelModal';
import { useBoardItemVisibility } from './DashboardRefreshContext';
import { DashboardResourceGroupsProvider } from './DashboardResourceGroups';
import PanelSettingsModal from './PanelSettingsModal';
import { boardSortsAtom } from './ResourceTablePanel';
import {
  actionTargetId,
  type DashboardAssistantAction,
} from './assistantActions';
import {
  dashboardAgentAtom,
  latestAgentDraftParamAtom,
  type DashboardAgent,
} from './dashboardAgent';
import { describeDashboardAction } from './dashboardChat';
import { dashboardScopeKey } from './dashboardScope';
import {
  DASHBOARD_DRAFT_PARAM,
  createGetCurrentDashboardTool,
  createPrepareDashboardTool,
  draftOfRawActions,
  rawActionsOfParam,
} from './dashboardWebMCP';
import { DeniedPanelsContext, useDeniedPanels } from './panelPermission';
import { panelSettingOverridesAtom } from './panelSettingOverrides';
import { panelSourceSpecs } from './panelSourceSpecs';
import type {
  DashboardPageQueryRefs,
  DashboardScope,
  PanelDefinition,
  PanelPage,
  PersistedPanel,
} from './types';
import { useDashboardBoard } from './useDashboardBoard';
import {
  DashboardFilterContext,
  useDashboardFilters,
} from './useDashboardFilters';
import { useResetOnLeavingPath } from './useResetOnLeavingPath';
import {
  BAIBoard,
  BAIFlex,
  BAISkeleton,
  BAIUnmountAfterClose,
  useWebMCPTool,
  type BAIBoardProps,
} from 'backend.ai-ui';
import { useAtom, useSetAtom, useStore } from 'jotai';
import * as _ from 'lodash-es';
import { parseAsString, useQueryStates } from 'nuqs';
import React, {
  Suspense,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

/**
 * Narrower than ui-common's: six columns from 1100px (not 2100px) so a laptop
 * board is not four wide, four from 640px (not 912px) so the ~680px board
 * beside the edit sider still puts two 2-column cards in a row, and eight from
 * 2200px (not 2400px) so a 2560px window's ~2272px board is eight wide.
 */
const DASHBOARD_COLUMN_BREAKPOINTS: BAIBoardProps['columnBreakpoints'] = [
  { minWidth: 0, columns: 1 },
  { minWidth: 480, columns: 2 },
  { minWidth: 640, columns: 4 },
  { minWidth: 1100, columns: 6 },
  { minWidth: 2200, columns: 8 },
  { minWidth: 3000, columns: 10 },
  { minWidth: 3600, columns: 12 },
];

export interface DashboardPanelBoardProps {
  page: PanelPage;
  /** The project in the URL path; `null` on the superadmin page (ADR 0001). */
  project: ProjectContextOrNull;
  catalog: ReadonlyArray<PanelDefinition>;
  /** The page query is refetching. */
  isRefetching: boolean;
  queryRefs: DashboardPageQueryRefs;
}

const ASSISTANT_HIGHLIGHT_CLASS = 'dashboard-panel-board__assistant-target';
const ASSISTANT_REVEAL_MS = 2000;

/** The first card an assistant change leaves on the board, to scroll to. */
const firstShownCardOf = (actions: ReadonlyArray<DashboardAssistantAction>) =>
  actions
    .filter((action) => action.type !== 'hide')
    .map(actionTargetId)
    .find(Boolean);

/** The page's allowed resource groups under a boundary of its own. */
const WithResourceGroups: React.FC<{
  scope: DashboardScope;
  fallback: React.ReactNode;
  children: React.ReactNode;
}> = ({ scope, fallback, children }) => (
  // A failed lookup leaves the cards on their saved groups instead of failing the page.
  <ErrorBoundary
    fallbackRender={() => children}
    resetKeys={[JSON.stringify(scope)]}
  >
    <Suspense fallback={fallback}>
      <DashboardResourceGroupsProvider scope={scope}>
        {children}
      </DashboardResourceGroupsProvider>
    </Suspense>
  </ErrorBoundary>
);

/**
 * A dashboard page's board under the dashboard bar (board tabs and refresh). Moving and resizing work at
 * all times; edit mode opens the sider that adds and removes cards and
 * manages custom panels. The admin pages keep several boards behind tabs; the
 * member page keeps one. Mount it inside a `DashboardRefreshProvider`.
 */
const DashboardPanelBoard: React.FC<DashboardPanelBoardProps> = ({
  page,
  project,
  catalog,
  isRefetching,
  queryRefs,
}) => {
  'use memo';
  const [editMode, setEditMode] = useAtom(dashboardEditModeAtom);
  const setBoardSorts = useSetAtom(boardSortsAtom);
  const setSettingOverrides = useSetAtom(panelSettingOverridesAtom);
  const [panelModalState, setPanelModalState] = useState<{
    open: boolean;
    panel?: PersistedPanel;
  }>({ open: false });
  // The id outlives `open` until after-close, so the closing modal keeps its content.
  const [settingsPanelId, setSettingsPanelId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  // A WebUI Assistant proposal the board previews until Apply or Discard.
  const [draftActions, setDraftActions] =
    useState<ReadonlyArray<DashboardAssistantAction> | null>(null);
  const setDashboardAgent = useSetAtom(dashboardAgentAtom);
  const { t } = useTranslation();
  // A preview `bai_prepare_dashboard` filled travels in the URL, so its link reopens it.
  const [agentDraftQuery, setAgentDraftQuery] = useQueryStates(
    {
      [DASHBOARD_DRAFT_PARAM]: parseAsString,
      [AGENT_PREFILL_PARAM]: parseAsString,
    },
    { history: 'replace' },
  );
  const agentDraftParam = agentDraftQuery[DASHBOARD_DRAFT_PARAM];
  // The draft the tool last wrote: two calls before the next render must build on each other.
  const jotaiStore = useStore();
  useEffect(() => {
    jotaiStore.set(latestAgentDraftParamAtom, agentDraftParam);
  }, [jotaiStore, agentDraftParam]);
  const clearAgentDraftQuery = () => {
    jotaiStore.set(latestAgentDraftParamAtom, null);
    setAgentDraftQuery({
      [DASHBOARD_DRAFT_PARAM]: null,
      [AGENT_PREFILL_PARAM]: null,
    });
  };

  // These atoms are global: clear them when leaving the page, but not when a
  // suspending query remounts the board on the same path (that would drop an early click).
  useResetOnLeavingPath(() => {
    setEditMode(false);
    setBoardSorts({});
    setSettingOverrides({});
  });

  const denied = useDeniedPanels();
  const {
    boardItems,
    onLayoutChange,
    catalogEntries,
    activeKeys,
    deniedKeys,
    setPanelsActive,
    customPanels,
    availableResources,
    gridEnabled,
    addCustomPanel,
    updateCustomPanel,
    removePanel,
    resetLayout,
    settingsTargetOf,
    updatePanelSettings,
    boards,
    assistantCards,
    assistantPanels,
    savedAssistantCards,
    savedAssistantPanels,
    applyAssistantActions,
  } = useDashboardBoard({
    page,
    catalog,
    isRefetching,
    queryRefs,
    deniedPanelIds: denied.deniedPanels,
    draftActions: draftActions ?? undefined,
    onRequestEditCustomPanel: (panel) =>
      setPanelModalState({ open: true, panel }),
  });
  const settingsTarget = settingsPanelId
    ? settingsTargetOf(settingsPanelId)
    : null;

  // Outlines and scrolls to the cards a WebUI Assistant proposal changes.
  const highlightedCardRef = useRef<Element | null>(null);
  const cardElementOf = (id: string) =>
    boardContainerRef.current?.querySelector(
      `[data-board-item-id="${CSS.escape(id)}"]`,
    ) ?? null;
  const highlightCard = (id: string | null) => {
    highlightedCardRef.current?.classList.remove(ASSISTANT_HIGHLIGHT_CLASS);
    highlightedCardRef.current = id ? cardElementOf(id) : null;
    highlightedCardRef.current?.classList.add(ASSISTANT_HIGHLIGHT_CLASS);
  };
  const revealCard = (id: string) => {
    // Two frames: the save re-renders the board before the card exists.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const element = cardElementOf(id);
        if (!element) return;
        element.scrollIntoView({ block: 'center', behavior: 'smooth' });
        element.classList.add(ASSISTANT_HIGHLIGHT_CLASS);
        window.setTimeout(
          () => element.classList.remove(ASSISTANT_HIGHLIGHT_CLASS),
          ASSISTANT_REVEAL_MS,
        );
      }),
    );
  };

  const assistantContext: DashboardAgent['context'] = {
    page,
    cards: assistantCards,
    panels: assistantPanels,
    sources: panelSourceSpecs(availableResources, { gridEnabled, t }),
    canCreateBoard: page !== 'project',
  };
  const savedAssistantContext: DashboardAgent['context'] = {
    ...assistantContext,
    cards: savedAssistantCards,
    panels: savedAssistantPanels,
  };
  // The URL's draft replaces the preview whenever it changes; an emptied one is left to Discard.
  const [agentDraftParamSeen, setAgentDraftParamSeen] = useState<string | null>(
    null,
  );
  if (agentDraftParam !== agentDraftParamSeen) {
    setAgentDraftParamSeen(agentDraftParam);
    if (agentDraftParam) {
      const actions = _.compact(
        draftOfRawActions(
          rawActionsOfParam(agentDraftParam),
          savedAssistantContext,
        ).map((item) => item.action),
      );
      setDraftActions(actions.length ? actions : null);
    }
  }

  // The WebUI Assistant's chat edits this board through the agent it reads here.
  const dashboardAgent: DashboardAgent = {
    context: assistantContext,
    draft: draftActions ?? [],
    propose: (actions) => {
      setDraftActions((current) => {
        // One new board per preview: a second would drop what the first collected.
        let hasNewBoard = !!current?.some((a) => a.type === 'createBoard');
        return [
          ...(current ?? []),
          ...actions.filter((a) => {
            if (a.type !== 'createBoard') return true;
            if (hasNewBoard) return false;
            hasNewBoard = true;
            return true;
          }),
        ];
      });
      const target = actions.map(actionTargetId).find(Boolean);
      if (target) revealCard(target);
    },
    apply: () => {
      if (!draftActions?.length) return;
      highlightCard(null);
      applyAssistantActions(draftActions);
      setDraftActions(null);
      clearAgentDraftQuery();
      const changedId = firstShownCardOf(draftActions);
      if (changedId) revealCard(changedId);
    },
    discard: () => {
      highlightCard(null);
      setDraftActions(null);
      clearAgentDraftQuery();
    },
    highlight: highlightCard,
    reveal: revealCard,
  };
  // Every render: the agent carries this render's board and draft.
  useEffect(() => {
    setDashboardAgent(dashboardAgent);
  });
  useEffect(() => () => setDashboardAgent(null), [setDashboardAgent]);

  const describe = (action: DashboardAssistantAction) =>
    describeDashboardAction(action, assistantContext, t);
  const getRawDraft = () =>
    rawActionsOfParam(jotaiStore.get(latestAgentDraftParamAtom));
  useWebMCPTool(
    createGetCurrentDashboardTool({
      getContext: () => assistantContext,
      getRawDraft,
      describe,
    }),
  );
  useWebMCPTool(
    createPrepareDashboardTool({
      getContext: () => assistantContext,
      getSavedContext: () => savedAssistantContext,
      getRawDraft,
      getSearch: () => window.location.search,
      pathWith: (search) => `${window.location.pathname}${search}`,
      openPreview: (search) => {
        const params = new URLSearchParams(search);
        jotaiStore.set(
          latestAgentDraftParamAtom,
          params.get(DASHBOARD_DRAFT_PARAM),
        );
        setAgentDraftQuery({
          [DASHBOARD_DRAFT_PARAM]: params.get(DASHBOARD_DRAFT_PARAM),
          [AGENT_PREFILL_PARAM]: params.get(AGENT_PREFILL_PARAM),
        });
      },
      describe,
    }),
  );

  const filters = useDashboardFilters(page, boards, project);
  const scopeKey = dashboardScopeKey(page, filters.scope);
  denied.setScope(scopeKey);
  // A preview belongs to the board and scope it was asked on.
  const draftTarget = `${boards.activeBoard.id}|${scopeKey}`;
  const [draftTargetSeen, setDraftTargetSeen] = useState(draftTarget);
  if (draftTarget !== draftTargetSeen) {
    setDraftTargetSeen(draftTarget);
    setDraftActions(null);
  }
  const onDraftTargetChange = useEffectEvent(() => {
    if (agentDraftParam) clearAgentDraftQuery();
  });
  // Compared, not skipped on mount: an agent's link opens on the board it was made on.
  const lastDraftTargetRef = useRef(draftTarget);
  useEffect(() => {
    if (lastDraftTargetRef.current === draftTarget) return;
    lastDraftTargetRef.current = draftTarget;
    onDraftTargetChange();
  }, [draftTarget]);
  useBoardItemVisibility(boardContainerRef);

  const scrollBoardEndIntoView = () => {
    // New panels append at the board's end; without this an add looks like a no-op.
    requestAnimationFrame(() => {
      boardContainerRef.current?.scrollIntoView({
        block: 'end',
        behavior: 'smooth',
      });
    });
  };

  // Each card waits for the page's allowed resource groups on its own, under a
  // boundary keyed by the scope: a project change keeps the bar and the board
  // mounted and shows only the cards' loading.
  const scopedItems = boardItems.map((item) => ({
    ...item,
    data: {
      ...item.data,
      content: (
        <WithResourceGroups
          key={scopeKey}
          scope={filters.scope}
          fallback={<BAISkeleton />}
        >
          {item.data.content}
        </WithResourceGroups>
      ),
    },
  }));

  return (
    // The provider also covers the panel modal, whose previews read the page's project.
    <DashboardFilterContext
      value={{
        scope: filters.scope,
        project: filters.project,
        currentProjectId: filters.currentProjectId,
      }}
    >
      <BAIFlex
        direction="row"
        align="stretch"
        gap="lg"
        style={{ width: '100%' }}
      >
        <div ref={boardContainerRef} style={{ flex: 1, minWidth: 0 }}>
          <BAIFlex direction="column" align="stretch" gap="md">
            <DashboardFilterBar filters={filters} isRefetching={isRefetching}>
              {page !== 'project' ? (
                <DashboardBoardTabs boards={boards} />
              ) : null}
            </DashboardFilterBar>
            <DeniedPanelsContext value={denied.reporterFor(scopeKey)}>
              <BAIBoard
                movable
                resizable
                bordered
                columnBreakpoints={DASHBOARD_COLUMN_BREAKPOINTS}
                items={scopedItems}
                // The board is controlled: the next render must hand back exactly
                // what it reported, or it snaps back.
                onItemsChange={(event) => {
                  onLayoutChange(
                    _.map(event.detail.items, (item) =>
                      _.omit(item, ['data', 'title', 'description']),
                    ),
                  );
                }}
              />
            </DeniedPanelsContext>
          </BAIFlex>
        </div>
        {editMode ? (
          <DashboardEditSider
            page={page}
            catalogEntries={catalogEntries}
            activeKeys={activeKeys}
            deniedKeys={deniedKeys}
            onTogglePanels={(keys, active) => {
              setPanelsActive(keys, active);
              if (active) scrollBoardEndIntoView();
            }}
            panels={customPanels}
            onRequestAdd={() => setPanelModalState({ open: true })}
            onRequestEdit={(panel) => setPanelModalState({ open: true, panel })}
            onRemove={removePanel}
            onResetLayout={resetLayout}
            settingsTargetOf={settingsTargetOf}
            onRequestSettings={(panelId) => {
              setSettingsPanelId(panelId);
              setIsSettingsOpen(true);
            }}
            boardSection={
              page !== 'project' ? (
                <DashboardBoardSection
                  page={page}
                  boards={boards}
                  catalog={catalog}
                />
              ) : undefined
            }
          />
        ) : null}
        <BAIUnmountAfterClose>
          <WithResourceGroups scope={filters.scope} fallback={null}>
            <PanelSettingsModal
              open={isSettingsOpen && !!settingsTarget}
              title={settingsTarget?.title ?? ''}
              definition={settingsTarget?.definition ?? { kind: 'custom' }}
              settings={settingsTarget?.settings}
              onSubmit={(settings) => {
                if (settingsPanelId)
                  updatePanelSettings(settingsPanelId, settings);
              }}
              onRequestClose={() => setIsSettingsOpen(false)}
              afterClose={() => setSettingsPanelId(null)}
            />
          </WithResourceGroups>
        </BAIUnmountAfterClose>
        {/* Unmounted after the close animation, so each open starts fresh: two
          consecutive Adds would otherwise share the preview-driven state. */}
        <BAIUnmountAfterClose>
          <DashboardPanelModal
            open={panelModalState.open}
            initialPanel={panelModalState.panel}
            availableResources={availableResources}
            gridEnabled={gridEnabled}
            onRequestClose={() => setPanelModalState({ open: false })}
            onSubmit={(input) => {
              if (panelModalState.panel) {
                updateCustomPanel(panelModalState.panel.id, input);
              } else {
                addCustomPanel(input);
                scrollBoardEndIntoView();
              }
            }}
          />
        </BAIUnmountAfterClose>
        {draftActions?.length ? (
          <DashboardDraftConfirmBar
            count={draftActions.length}
            newBoardTitle={
              draftActions.find((action) => action.type === 'createBoard')
                ?.title
            }
            onApply={dashboardAgent.apply}
            onDiscard={dashboardAgent.discard}
          />
        ) : null}
      </BAIFlex>
    </DashboardFilterContext>
  );
};

export default DashboardPanelBoard;
