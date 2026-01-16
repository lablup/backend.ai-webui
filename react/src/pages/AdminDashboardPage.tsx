import { AdminDashboardPageQuery } from '../__generated__/AdminDashboardPageQuery.graphql';
import BAIBoard, { BAIBoardItem } from '../components/BAIBoard';
import RecentlyCreatedSession from '../components/RecentlyCreatedSession';
import SessionCountDashboardItem from '../components/SessionCountDashboardItem';
import TotalResourceWithinResourceGroup, {
  useIsAvailableTotalResourceWithinResourceGroup,
} from '../components/TotalResourceWithinResourceGroup';
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import { Skeleton, theme } from 'antd';
import {
  filterOutEmpty,
  INITIAL_FETCH_KEY,
  useFetchKey,
  useInterval,
} from 'backend.ai-ui';
import _ from 'lodash';
import { Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import ActiveAgents from 'src/components/ActiveAgents';
import AgentStats from 'src/components/AgentStats';
import { useCurrentUserRole } from 'src/hooks/backendai';

const AdminDashboardPage: React.FC = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const userRole = useCurrentUserRole();
  const baiClient = useSuspendedBackendaiClient();

  const [fetchKey, updateFetchKey] = useFetchKey();
  const [isPendingIntervalRefetch, startIntervalRefetchTransition] =
    useTransition();

  const [localStorageBoardItems, setLocalStorageBoardItems] =
    useBAISettingUserState('admin_dashboard_board_items');

  const isAvailableTotalResourcePanel =
    useIsAvailableTotalResourceWithinResourceGroup();

  const isAgentStatsSupported = baiClient.supports('agent-stats');

  const queryRef = useLazyLoadQuery<AdminDashboardPageQuery>(
    graphql`
      query AdminDashboardPageQuery(
        $scopeId: ScopeField
        $resourceGroup: String
        $skipTotalResourceWithinResourceGroup: Boolean!
        $skipAgentStats: Boolean!
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
        ...AgentStatsFragment @skip(if: $skipAgentStats) @alias
      }
    `,
    {
      scopeId: `project:${currentProject.id}`,
      resourceGroup: currentResourceGroup || 'default',
      skipTotalResourceWithinResourceGroup: !isAvailableTotalResourcePanel,
      skipAgentStats: !isAgentStatsSupported,
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
  }, 30_000);

  const initialBoardItems: Array<BAIBoardItem> = filterOutEmpty([
    {
      id: 'activeSessions',
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
              title={t('session.ActiveSessions')}
            />
          </Suspense>
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
    {
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

  // TODO: Issue occurs when newly added items in new webui version are not saved in localStorage
  // and thus not displayed on screen.
  // Opted-out items should also be stored separately in localStorage, and newly added items
  // should be included in initialBoardItems.
  const newlyAddedItems = _.filter(
    initialBoardItems,
    (item) =>
      !_.find(
        localStorageBoardItems,
        (itemInStorage) => itemInStorage.id === item.id,
      ),
  );
  const localstorageBoardItemsWithData = filterOutEmpty(
    _.map(localStorageBoardItems, (item) => {
      const matchedData = _.find(
        initialBoardItems,
        (initialItem) => initialItem.id === item.id,
      )?.data;
      return matchedData ? { ...item, data: matchedData } : undefined;
    }),
  );
  const boardItems = [...localstorageBoardItemsWithData, ...newlyAddedItems];
  return (
    <BAIBoard
      movable
      resizable
      bordered
      items={boardItems}
      onItemsChange={(event) => {
        const changedItems = [...event.detail.items];
        setLocalStorageBoardItems(
          _.map(changedItems, (item) => _.omit(item, 'data')),
        );
      }}
    />
  );
};

export default AdminDashboardPage;
