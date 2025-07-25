import { DashboardPageQuery } from '../__generated__/DashboardPageQuery.graphql';
import BAIBoard, { BAIBoardItem } from '../components/BAIBoard';
import MyResource from '../components/MyResource';
import MyResourceWithinResourceGroup from '../components/MyResourceWithinResourceGroup';
import MySession from '../components/MySession';
import RecentlyCreatedSession from '../components/RecentlyCreatedSession';
import TotalResourceWithinResourceGroup from '../components/TotalResourceWithinResourceGroup';
import { filterEmptyItem } from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import { useInterval } from '../hooks/useIntervalValue';
import { Skeleton, theme } from 'antd';
import _ from 'lodash';
import { Suspense, useTransition } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

const DashboardPage: React.FC = () => {
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();

  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const [localStorageBoardItems, setLocalStorageBoardItems] =
    useBAISettingUserState('dashboard_board_items');

  const queryRef = useLazyLoadQuery<DashboardPageQuery>(
    graphql`
      query DashboardPageQuery(
        $projectId: UUID!
        $resourceGroup: String # TODO: Skip to query if hideAgents is true
        $hideAgents: Boolean!
      ) {
        ...MySessionQueryFragment @arguments(projectId: $projectId)
        ...RecentlyCreatedSessionFragment @arguments(projectId: $projectId)
        ...TotalResourceWithinResourceGroupFragment
          @skip(if: $hideAgents)
          @arguments(resourceGroup: $resourceGroup)
      }
    `,
    {
      projectId: currentProject.id,
      resourceGroup: currentResourceGroup || 'default',
      hideAgents: baiClient?._config?.hideAgents,
    },
    {
      fetchPolicy:
        fetchKey === 'initial-fetch' ? 'store-and-network' : 'network-only',
      fetchKey,
    },
  );

  useInterval(() => {
    startRefetchTransition(() => {
      updateFetchKey();
    });
  }, 15_000);

  const initialBoardItems: Array<BAIBoardItem> = filterEmptyItem([
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
            <MySession queryRef={queryRef} isRefetching={isPendingRefetch} />
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
          <MyResource fetchKey={fetchKey} isRefetching={isPendingRefetch} />
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
            isRefetching={isPendingRefetch}
          />
        ),
      },
    },
    !baiClient?._config?.hideAgents && {
      id: 'totalResourceWithinResourceGroup',
      rowSpan: 2,
      columnSpan: 2,
      definition: {
        minRowSpan: 2,
        minColumnSpan: 2,
      },
      data: {
        content: (
          <TotalResourceWithinResourceGroup
            queryRef={queryRef}
            isRefetching={isPendingRefetch}
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
            isRefetching={isPendingRefetch}
          />
        ),
      },
    },
  ]);

  // TODO: Issue occurs when newly added items in new webui version are not saved in localStorage
  // and thus not displayed on screen.
  // Opted-out items should also be stored separately in localStorage, and newly added items
  // should be included in initialBoardItems.
  const mergedBoardItems = filterEmptyItem(
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
