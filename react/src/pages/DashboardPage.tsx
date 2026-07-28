/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DashboardPageQuery } from '../__generated__/DashboardPageQuery.graphql';
import ActiveAgents from '../components/ActiveAgents';
import AgentStats from '../components/AgentStats';
import BAIBoard, { BAIBoardItem } from '../components/BAIBoard';
import DashboardEditToggleButton from '../components/DashboardEditToggleButton';
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
import { Skeleton, theme } from 'antd';
import {
  BAIBoardItemErrorBoundary,
  filterOutEmpty,
  INITIAL_FETCH_KEY,
  useFetchKey,
  useInterval,
} from 'backend.ai-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import * as _ from 'lodash-es';
import { Suspense, useEffect, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const DashboardPage: React.FC = () => {
  'use memo';
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const userRole = useCurrentUserRole();
  const baiClient = useSuspendedBackendaiClient();
  const webuiNavigate = useWebUINavigate();

  const [fetchKey, updateFetchKey] = useFetchKey();
  const [isPendingIntervalRefetch, startIntervalRefetchTransition] =
    useTransition();

  const [localStorageBoardItems, setLocalStorageBoardItems] =
    useBAISettingUserState('dashboard_board_items');

  // Edit-mode gate: the board is locked by default. Only when edit mode is on are
  // the board items draggable/resizable. Toggled from the breadcrumb.
  const editMode = useAtomValue(dashboardEditModeAtom);
  const setBreadcrumbExtra = useSetAtom(breadcrumbExtraAtom);

  // Teleport the "Edit" toggle into the breadcrumb right slot while this page is
  // mounted; clear it on unmount.
  useEffect(() => {
    setBreadcrumbExtra(<DashboardEditToggleButton />);
    return () => setBreadcrumbExtra(null);
  }, [setBreadcrumbExtra]);

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
        fetchKey === INITIAL_FETCH_KEY ? 'store-and-network' : 'network-only',
      fetchKey,
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
              <Skeleton active style={{ padding: `0px ${token.marginMD}px` }} />
            }
          >
            <SessionCountDashboardItem
              queryRef={queryRef}
              isRefetching={isPendingIntervalRefetch}
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
            <MyResource
              fetchKey={fetchKey}
              refetching={isPendingIntervalRefetch}
            />
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
            <MyResourceWithinResourceGroup
              fetchKey={fetchKey}
              refetching={isPendingIntervalRefetch}
            />
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
              fallback={<Skeleton active style={{ padding: token.marginMD }} />}
            >
              <StorageStatusPanelCard
                fetchKey={fetchKey}
                onRequestBadgeClick={() => {
                  webuiNavigate({
                    pathname: '/data',
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
              fallback={<Skeleton active style={{ padding: token.marginMD }} />}
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
            refetching={isPendingIntervalRefetch}
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
                <Skeleton
                  active
                  style={{ padding: `0px ${token.marginMD}px` }}
                />
              }
            >
              <AgentStats
                queryRef={queryRef.AgentStatsFragment}
                isRefetching={isPendingIntervalRefetch}
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
              <Skeleton active style={{ padding: `0px ${token.marginMD}px` }} />
            }
          >
            <ActiveAgents
              fetchKey={fetchKey}
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
            isRefetching={isPendingIntervalRefetch}
          />
        ),
      },
    },
  ]);

  // Single unified ordered layout source for the board.
  //
  // Cloudscape <Board> is controlled: the `items` prop on the next render must
  // equal the order + spans + columnOffset that onItemsChange last reported, or
  // the board snaps back ("revert"). So ORDER and LAYOUT live in ONE persisted
  // list (`dashboard_board_items`); content is resolved by id every render.

  // Content-by-id for the whole board.
  const contentById = new Map<string, BAIBoardItem['data']>();
  _.forEach(initialBoardItems, (item) => {
    contentById.set(item.id, item.data);
  });

  // Default layout (id + spans + offset, no content) for every renderable id, in
  // seed order. Used only to seed ids that have no entry in the persisted unified
  // list yet (e.g. a new webui version added a built-in item).
  const defaultLayout: Array<Omit<BAIBoardItem, 'data'>> = _.map(
    initialBoardItems,
    (item) => _.omit(item, 'data'),
  );

  // The set of ids that are renderable right now (have content). A persisted
  // entry for an id that no longer exists (e.g. a removed custom panel, or an
  // item gated off by role) is dropped so the controlled `items` stays valid.
  const persistedLayout = localStorageBoardItems ?? [];
  const persistedIds = new Set(_.map(persistedLayout, (item) => item.id));

  // Unified order: persisted order first (filtered to ids that still render),
  // then any default-layout ids not yet persisted, appended in seed order.
  const orderedLayout: Array<Omit<BAIBoardItem, 'data'>> = [
    ..._.filter(persistedLayout, (item) => contentById.has(item.id)),
    ..._.filter(defaultLayout, (item) => !persistedIds.has(item.id)),
  ];

  // Attach content by id to produce the controlled board items.
  const boardItems: Array<BAIBoardItem> = filterOutEmpty(
    _.map(orderedLayout, (item) => {
      const data = contentById.get(item.id);
      return data ? { ...item, data } : undefined;
    }),
  );

  return (
    <BAIBoard
      movable={editMode}
      resizable={editMode}
      bordered
      items={boardItems}
      onItemsChange={(event) => {
        // event.detail.items is the COMPLETE board in its new order, with updated
        // spans + columnOffset (Cloudscape's transformItems). Persist it verbatim
        // (minus runtime `data`) as the unified layout. Because the next render
        // rebuilds `items` in exactly this order, the controlled board never reverts.
        setLocalStorageBoardItems(
          _.map(event.detail.items, (item) => _.omit(item, 'data')),
        );
      }}
    />
  );
};

export default DashboardPage;
