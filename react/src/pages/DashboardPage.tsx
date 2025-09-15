import { DashboardPageQuery } from '../__generated__/DashboardPageQuery.graphql';
import BAIBoard, { BAIBoardItem } from '../components/BAIBoard';
import MyResource from '../components/MyResource';
import MyResourceWithinResourceGroup from '../components/MyResourceWithinResourceGroup';
import MySession from '../components/MySession';
import RecentlyCreatedSession from '../components/RecentlyCreatedSession';
import TotalResourceWithinResourceGroup, {
  useIsAvailableTotalResourceWithinResourceGroup,
} from '../components/TotalResourceWithinResourceGroup';
import { INITIAL_FETCH_KEY, useFetchKey } from '../hooks';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import { useInterval } from '../hooks/useIntervalValue';
import { Skeleton, theme } from 'antd';
import { filterOutEmpty } from 'backend.ai-ui';
import _ from 'lodash';
import { Suspense, useTransition } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useCurrentUserRole } from 'src/hooks/backendai';

const DashboardPage: React.FC = () => {
  const { token } = theme.useToken();

  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const userRole = useCurrentUserRole();

  const [fetchKey, updateFetchKey] = useFetchKey();
  const [isPendingIntervalRefetch, startIntervalRefetchTransition] =
    useTransition();

  const [localStorageBoardItems, setLocalStorageBoardItems] =
    useBAISettingUserState('dashboard_board_items');

  const isAvailableTotalResourcePanel =
    useIsAvailableTotalResourceWithinResourceGroup();

  const queryRef = useLazyLoadQuery<DashboardPageQuery>(
    graphql`
      query DashboardPageQuery(
        $projectId: UUID!
        $resourceGroup: String
        $skipTotalResourceWithinResourceGroup: Boolean!
        $isSuperAdmin: Boolean!
        $agentNodeFilter: String!
      ) {
        ...MySessionQueryFragment @arguments(projectId: $projectId)
        ...RecentlyCreatedSessionFragment @arguments(projectId: $projectId)
        ...TotalResourceWithinResourceGroupFragment
          @skip(if: $skipTotalResourceWithinResourceGroup)
          @alias
          @arguments(
            resourceGroup: $resourceGroup
            isSuperAdmin: $isSuperAdmin
            agentNodeFilter: $agentNodeFilter
          )
      }
    `,
    {
      projectId: currentProject.id,
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
            <MySession
              queryRef={queryRef}
              isRefetching={isPendingIntervalRefetch}
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
          <MyResource
            fetchKey={fetchKey}
            refetching={isPendingIntervalRefetch}
          />
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
          <MyResourceWithinResourceGroup
            fetchKey={fetchKey}
            refetching={isPendingIntervalRefetch}
          />
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
  const mergedBoardItems = filterOutEmpty(
    _.map(initialBoardItems, (item) => {
      const updatedItem = _.find(
        localStorageBoardItems,
        (itemInStorage) => itemInStorage.id === item.id,
      );
      return { ...item, ...updatedItem };
    }),
  );

  return (
    <BAIBoard
      movable
      resizable
      bordered
      items={mergedBoardItems}
      onItemsChange={(event) => {
        const changedItems = [...event.detail.items];
        setLocalStorageBoardItems(
          _.map(changedItems, (item) => _.omit(item, 'data')),
        );
      }}
    />
  );
};

export default DashboardPage;
