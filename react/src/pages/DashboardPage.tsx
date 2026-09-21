/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DashboardPageQuery } from '../__generated__/DashboardPageQuery.graphql';
import ActiveAgents from '../components/ActiveAgents';
import AgentStats from '../components/AgentStats';
import BAIBoard, { BAIBoardItem } from '../components/BAIBoard';
import DashboardEditToggleButton from '../components/DashboardEditToggleButton';
import { useCustomPanels } from '../components/DashboardPanels';
import DashboardEditSider from '../components/DashboardPanels/DashboardEditSider';
import DashboardPanelModal from '../components/DashboardPanels/DashboardPanelModal';
import {
  mergeHiddenLayoutEntries,
  reconcileBoardLayout,
  type BoardLayoutEntry,
} from '../components/DashboardPanels/boardLayout';
import type { PersistedPanel } from '../components/DashboardPanels/types';
import MyResource from '../components/MyResource';
import MyResourceWithinResourceGroup from '../components/MyResourceWithinResourceGroup';
import QuotaPerStorageVolumeDashboardItem from '../components/QuotaPerStorageVolumeDashboardItem';
import RecentlyCreatedSession from '../components/RecentlyCreatedSession';
import SessionCountDashboardItem from '../components/SessionCountDashboardItem';
import StorageStatusPanelCard from '../components/StorageStatusPanelCard';
import TotalResourceWithinResourceGroup, {
  useIsAvailableTotalResourceWithinResourceGroup,
} from '../components/TotalResourceWithinResourceGroup';
import { breadcrumbExtraAtom } from '../components/breadcrumbExtraAtom';
import { dashboardEditModeAtom } from '../components/dashboardEditModeAtom';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import { useProjectPath } from '../hooks/useRouteScope';
import { toProjectContext } from '../types/projectContext';
import { useTheme } from '@astryxdesign/core/theme';
import {
  BAISkeleton,
  BAIBoardItemErrorBoundary,
  BAIFlex,
  BAIUnmountAfterClose,
  filterOutEmpty,
  INITIAL_FETCH_KEY,
  useFetchKey,
  useInterval,
} from 'backend.ai-ui';
import { useAtom, useSetAtom } from 'jotai';
import * as _ from 'lodash-es';
import {
  Suspense,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const DashboardPage: React.FC = () => {
  'use memo';
  const { token } = useTheme();
  const { t } = useTranslation();

  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const userRole = useCurrentUserRole();
  const baiClient = useSuspendedBackendaiClient();
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();

  const [fetchKey, updateFetchKey] = useFetchKey();
  // Deferring the fetchKey keeps the committed board on screen while the
  // interval-driven `network-only` refetch suspends in the background.
  // Feeding the raw fetchKey into useLazyLoadQuery made every 15s tick
  // re-suspend the whole page into the route-level fallback (FR-3386).
  const deferredFetchKey = useDeferredValue(fetchKey);
  const [isPendingIntervalRefetch, startIntervalRefetchTransition] =
    useTransition();
  const isRefetching =
    isPendingIntervalRefetch || fetchKey !== deferredFetchKey;

  const [localStorageBoardItems, setLocalStorageBoardItems] =
    useBAISettingUserState('dashboard_board_items');
  // Opt-in: the whole custom-panel feature is experimental. Off ⇒ no toggle, no
  // sider, no custom panels on the board — but nothing is deleted, so turning it
  // back on restores the saved panels and their positions.
  const [customPanelsEnabled] = useBAISettingUserState(
    'experimental_custom_dashboard_panels',
  );

  // Edit mode manages the CUSTOM PANELS (the sider plus each panel's edit/remove
  // controls). Dragging and resizing are never gated — the board is always
  // rearrangeable, edit mode only adds the panel-management affordances.
  const [editMode, setEditMode] = useAtom(dashboardEditModeAtom);
  const setBreadcrumbExtra = useSetAtom(breadcrumbExtraAtom);

  // Teleport the toggle into the breadcrumb right slot while this page is
  // mounted; on unmount clear it AND close edit mode — the atom is global, so
  // without this a revisit would start with the sider open.
  useEffect(() => {
    if (!customPanelsEnabled) return;
    setBreadcrumbExtra(<DashboardEditToggleButton />);
    return () => {
      setBreadcrumbExtra(null);
      setEditMode(false);
    };
  }, [customPanelsEnabled, setBreadcrumbExtra, setEditMode]);

  // Create/edit panel modal — one instance serves both flows (edit is pre-filled
  // via `panel`).
  const [panelModalState, setPanelModalState] = useState<{
    open: boolean;
    panel?: PersistedPanel;
  }>({ open: false });
  const boardContainerRef = useRef<HTMLDivElement>(null);

  // Decoupled "query-as-config" custom panels, rendered as additional items in
  // the SAME single board (a second Cloudscape <Board> would corrupt the shared
  // module-level DnD controller). The hook owns custom content + identity; the
  // unified `dashboard_board_items` list owns order/layout for built-in and custom
  // alike, so both are dragged/resized and persisted identically.
  const {
    panels,
    availableResources,
    gridEnabled,
    customDefaultLayout,
    customContentById,
    addPanel,
    updatePanel,
    removePanel,
  } = useCustomPanels({
    enabled: !!customPanelsEnabled,
    fetchKey: deferredFetchKey,
    onRequestEdit: (panel) => setPanelModalState({ open: true, panel }),
  });

  const isAvailableTotalResourcePanel =
    useIsAvailableTotalResourceWithinResourceGroup();

  const isAgentStatsSupported = baiClient.supports('agent-stats');

  const queryRef = useLazyLoadQuery<DashboardPageQuery>(
    graphql`
      query DashboardPageQuery(
        $scopeId: ScopeField
        $resourceGroup: String
        $skipTotalResourceWithinResourceGroup: Boolean!
        $isSuperAdmin: Boolean!
        $agentNodeFilter: String!
      ) {
        ...SessionCountDashboardItemFragment @arguments(scopeId: $scopeId)
        ...RecentlyCreatedSessionFragment @arguments(scopeId: $scopeId)
        ...TotalResourceWithinResourceGroupFragment
          @skip(if: $skipTotalResourceWithinResourceGroup)
          @alias
          @arguments(
            resourceGroup: $resourceGroup
            isSuperAdmin: $isSuperAdmin
            agentNodeFilter: $agentNodeFilter
          )
        ...AgentStatsFragment @include(if: $isSuperAdmin) @alias
      }
    `,
    {
      scopeId: `project:${currentProject.id}`,
      resourceGroup: currentResourceGroup || 'default',
      skipTotalResourceWithinResourceGroup: !isAvailableTotalResourcePanel,
      isSuperAdmin: _.isEqual(userRole, 'superadmin'),
      agentNodeFilter: `schedulable == true & status == "ALIVE" & scaling_group == "${currentResourceGroup}"`,
    },
    {
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
      fetchKey: deferredFetchKey,
    },
  );

  useInterval(() => {
    startIntervalRefetchTransition(() => {
      updateFetchKey();
    });
  }, 15_000);

  const initialBoardItems: Array<BAIBoardItem> = filterOutEmpty([
    {
      id: 'mySession',
      rowSpan: 2,
      columnSpan: 2,
      definition: {
        minRowSpan: 2,
        minColumnSpan: 2,
      },
      data: {
        content: (
          <Suspense
            fallback={
              <BAISkeleton style={{ padding: `0px ${token('--spacing-5')}` }} />
            }
          >
            <SessionCountDashboardItem
              queryRef={queryRef}
              isRefetching={isRefetching}
              title={
                _.isEqual(userRole, 'superadmin')
                  ? t('session.ActiveSessions')
                  : t('session.MySessions')
              }
            />
          </Suspense>
        ),
      },
    },
    {
      id: 'myResource',
      rowSpan: 2,
      columnSpan: 2,
      definition: {
        minRowSpan: 2,
        minColumnSpan: 2,
      },
      data: {
        content: (
          <BAIBoardItemErrorBoundary
            title={t('webui.menu.MyResources')}
            status="error"
          >
            <Suspense
              fallback={
                <BAISkeleton style={{ padding: token('--spacing-5') }} />
              }
            >
              <MyResource
                fetchKey={deferredFetchKey}
                refetching={isRefetching}
              />
            </Suspense>
          </BAIBoardItemErrorBoundary>
        ),
      },
    },
    {
      id: 'myResourceWithinResourceGroup',
      rowSpan: 2,
      columnSpan: 2,
      definition: {
        minRowSpan: 2,
        minColumnSpan: 2,
      },
      data: {
        content: (
          <BAIBoardItemErrorBoundary
            title={t('webui.menu.MyResourcesInResourceGroup')}
            status="error"
          >
            <Suspense
              fallback={
                <BAISkeleton style={{ padding: token('--spacing-5') }} />
              }
            >
              <MyResourceWithinResourceGroup
                fetchKey={deferredFetchKey}
                refetching={isRefetching}
              />
            </Suspense>
          </BAIBoardItemErrorBoundary>
        ),
      },
    },
    {
      id: 'folderStatus',
      rowSpan: 2,
      columnSpan: 2,
      definition: {
        minRowSpan: 2,
        minColumnSpan: 2,
      },
      data: {
        content: (
          <BAIBoardItemErrorBoundary
            title={t('data.FolderStatus')}
            status="error"
          >
            <Suspense
              fallback={
                <BAISkeleton style={{ padding: token('--spacing-5') }} />
              }
            >
              <StorageStatusPanelCard
                fetchKey={deferredFetchKey}
                onRequestBadgeClick={() => {
                  webuiNavigate({
                    pathname: buildProjectPath('data'),
                    search: new URLSearchParams({
                      invitation: 'true',
                    }).toString(),
                  });
                }}
              />
            </Suspense>
          </BAIBoardItemErrorBoundary>
        ),
      },
    },
    {
      id: 'quotaPerStorageVolume',
      rowSpan: 2,
      columnSpan: 2,
      definition: {
        minRowSpan: 2,
        minColumnSpan: 2,
      },
      data: {
        content: (
          <BAIBoardItemErrorBoundary
            title={t('data.QuotaPerStorageVolume')}
            status="error"
          >
            <Suspense
              fallback={
                <BAISkeleton style={{ padding: token('--spacing-5') }} />
              }
            >
              <QuotaPerStorageVolumeDashboardItem />
            </Suspense>
          </BAIBoardItemErrorBoundary>
        ),
      },
    },
    isAvailableTotalResourcePanel && {
      id: 'totalResourceWithinResourceGroup',
      rowSpan: 2,
      columnSpan: 2,
      definition: {
        minRowSpan: 2,
        minColumnSpan: 2,
      },
      data: {
        content: queryRef.TotalResourceWithinResourceGroupFragment && (
          <TotalResourceWithinResourceGroup
            queryRef={queryRef.TotalResourceWithinResourceGroupFragment}
            refetching={isRefetching}
          />
        ),
      },
    },
    _.isEqual(userRole, 'superadmin') &&
      isAgentStatsSupported &&
      queryRef.AgentStatsFragment && {
        id: 'agentStats',
        rowSpan: 2,
        columnSpan: 2,
        definition: {
          minRowSpan: 2,
          minColumnSpan: 2,
        },
        data: {
          content: (
            <Suspense
              fallback={
                <BAISkeleton
                  style={{ padding: `0px ${token('--spacing-5')}` }}
                />
              }
            >
              <AgentStats
                queryRef={queryRef.AgentStatsFragment}
                isRefetching={isRefetching}
              />
            </Suspense>
          ),
        },
      },
    _.isEqual(userRole, 'superadmin') && {
      id: 'activeAgents',
      rowSpan: 4,
      columnSpan: 4,
      definition: {
        minRowSpan: 3,
        minColumnSpan: 4,
      },
      data: {
        content: (
          <Suspense
            fallback={
              <BAISkeleton style={{ padding: `0px ${token('--spacing-5')}` }} />
            }
          >
            <ActiveAgents
              fetchKey={deferredFetchKey}
              onChangeFetchKey={() => updateFetchKey()}
            />
          </Suspense>
        ),
      },
    },
    {
      id: 'recentlyCreatedSession',
      rowSpan: 3,
      columnSpan: 4,
      definition: {
        minRowSpan: 2,
        minColumnSpan: 2,
      },
      data: {
        content: (
          <RecentlyCreatedSession
            queryRef={queryRef}
            isRefetching={isRefetching}
            // Page-level ambient narrowing (ADR-0001): the dashboard is
            // project-scoped, so the drawer compares against the current
            // project.
            project={toProjectContext(currentProject)}
          />
        ),
      },
    },
  ]);

  // Content-by-id for the whole board (built-in + custom).
  const contentById = new Map<string, BAIBoardItem['data']>();
  _.forEach(initialBoardItems, (item) => {
    contentById.set(item.id, item.data);
  });
  customContentById.forEach((content, id) => {
    contentById.set(id, { content });
  });

  // Seed layout (no content) for every renderable id: built-in first, then
  // custom. Only seeds ids the persisted unified list doesn't know yet.
  const defaultLayout: Array<BoardLayoutEntry> = [
    ..._.map(initialBoardItems, (item) => _.omit(item, 'data')),
    ...customDefaultLayout,
  ];

  // Cloudscape <Board> is controlled: next render's `items` must equal the
  // order + spans + columnOffset that onItemsChange last reported, or the board
  // snaps back. So ORDER and LAYOUT live in ONE persisted list
  // (`dashboard_board_items`); content is resolved by id every render.
  const orderedLayout = reconcileBoardLayout({
    // Array.isArray also heals corrupted storage (e.g. a raw "undefined"
    // string), which would otherwise crash the whole route.
    persistedLayout: Array.isArray(localStorageBoardItems)
      ? localStorageBoardItems
      : [],
    defaultLayout,
    renderableIds: new Set(contentById.keys()),
  });

  // Attach content by id to produce the controlled board items.
  const boardItems: Array<BAIBoardItem> = filterOutEmpty(
    _.map(orderedLayout, (item) => {
      const data = contentById.get(item.id);
      return data ? { ...item, data } : undefined;
    }),
  );

  return (
    // Row layout so the edit sider PUSHES the board (board reflows into the
    // remaining width) instead of an overlay covering the right panels.
    <BAIFlex direction="row" align="stretch" gap="lg" style={{ width: '100%' }}>
      <div ref={boardContainerRef} style={{ flex: 1, minWidth: 0 }}>
        <BAIBoard
          movable
          resizable
          bordered
          items={boardItems}
          onItemsChange={(event) => {
            // event.detail.items is the COMPLETE board in its new order, with
            // updated spans + columnOffset (Cloudscape's transformItems). Persist
            // it verbatim (minus runtime `data`) as the unified layout for every id
            // — built-in and custom alike. Because the next render rebuilds `items`
            // in exactly this order, the controlled board never reverts.
            setLocalStorageBoardItems(
              mergeHiddenLayoutEntries(
                _.map(event.detail.items, (item) => _.omit(item, 'data')),
                Array.isArray(localStorageBoardItems)
                  ? localStorageBoardItems
                  : [],
              ),
            );
          }}
        />
      </div>
      {customPanelsEnabled && editMode ? (
        <DashboardEditSider
          panels={panels}
          availableResources={availableResources}
          gridEnabled={gridEnabled}
          onRequestAdd={() => setPanelModalState({ open: true })}
          onRequestEdit={(panel) => setPanelModalState({ open: true, panel })}
          onRemove={removePanel}
          // [] (not undefined): the settings store stringifies values into
          // localStorage, and undefined becomes the literal "undefined" string,
          // which reads back as a non-array and crashed the page (FR-3063).
          onResetLayout={() => setLocalStorageBoardItems([])}
        />
      ) : null}
      {customPanelsEnabled ? (
        // Unmount after the close animation so every open starts from a fresh
        // instance. A `key` alone is not enough: two consecutive Adds share the
        // same key, so the modal is never remounted and its preview-driven
        // state (sort order, grid view) leaks from one new panel into the next.
        <BAIUnmountAfterClose>
          <DashboardPanelModal
            open={panelModalState.open}
            initialPanel={panelModalState.panel}
            availableResources={availableResources}
            gridEnabled={gridEnabled}
            onRequestClose={() => setPanelModalState({ open: false })}
            onSubmit={(input) => {
              if (panelModalState.panel) {
                updatePanel(panelModalState.panel.id, input);
              } else {
                addPanel(input);
                // New panels append at the board's end — bring them into view so
                // the add doesn't look like a no-op.
                requestAnimationFrame(() => {
                  boardContainerRef.current?.scrollIntoView({
                    block: 'end',
                    behavior: 'smooth',
                  });
                });
              }
            }}
          />
        </BAIUnmountAfterClose>
      ) : null}
    </BAIFlex>
  );
};

export default DashboardPage;
