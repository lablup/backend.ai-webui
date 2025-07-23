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
import {
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

const DashboardPage: React.FC = () => {
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();

  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const [localStorageBoardItems, setLocalStorageBoardItems] =
    useBAISettingUserState('dashboard_board_items');

  const queryRef = useLazyLoadQuery<DashboardPageQuery>(
    graphql`
      query DashboardPageQuery(
        $projectId: UUID!
        $resourceGroup: String # TODO: Skip to query if hideAgents is true
      ) # $hideAgents: Boolean!
      {
        ...MySessionQueryFragment @arguments(projectId: $projectId)
        ...RecentlyCreatedSessionFragment @arguments(projectId: $projectId)
        ...TotalResourceWithinResourceGroupFragment
          @arguments(resourceGroup: $resourceGroup)
        # @skip(if: $hideAgents)
      }
    `,
    {
      projectId: currentProject.id,
      resourceGroup: currentResourceGroup || 'default',
      // hideAgents: !baiClient?._config?.hideAgents,
    },
    {
      fetchPolicy:
        deferredFetchKey === 'initial-fetch'
          ? 'store-and-network'
          : 'network-only',
      fetchKey:
        deferredFetchKey === 'initial-fetch' ? undefined : deferredFetchKey,
    },
  );

  useInterval(() => {
    startRefetchTransition(() => {
      updateFetchKey();
    });
  }, 15_000);

  const initialBoardItems = useMemo(() => {
    const defaultBoardItems: Array<BAIBoardItem> = filterEmptyItem([
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
                <Skeleton
                  active
                  style={{ padding: `0px ${token.marginMD}px` }}
                />
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
            <Suspense
              fallback={
                <Skeleton
                  active
                  style={{ padding: `0px ${token.marginMD}px` }}
                />
              }
            >
              <MyResource
                isRefetching={deferredFetchKey !== fetchKey}
                fetchKey={deferredFetchKey}
              />
            </Suspense>
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
            <Suspense
              fallback={
                <Skeleton
                  active
                  style={{ padding: `0px ${token.marginMD}px` }}
                />
              }
            >
              <MyResourceWithinResourceGroup
                isRefetching={deferredFetchKey !== fetchKey}
                fetchKey={deferredFetchKey}
              />
            </Suspense>
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
            <Suspense
              fallback={
                <Skeleton
                  active
                  style={{ padding: `0px ${token.marginMD}px` }}
                />
              }
            >
              <TotalResourceWithinResourceGroup
                queryRef={queryRef}
                isRefetching={isPendingRefetch}
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
            <Suspense
              fallback={
                <Skeleton
                  active
                  style={{ padding: `0px ${token.marginMD}px` }}
                />
              }
            >
              <RecentlyCreatedSession
                queryRef={queryRef}
                isRefetching={isPendingRefetch}
              />
            </Suspense>
          ),
        },
      },
    ]);

    if (localStorageBoardItems) {
      const boardItemsWithContent = _.map(localStorageBoardItems, (item) => {
        const initialItem = _.find(
          defaultBoardItems,
          (defaultItem) => defaultItem.id === item.id,
        );
        return initialItem
          ? {
              ...item,
              data: initialItem.data,
              definition: initialItem.definition,
            }
          : null;
      });

      return filterEmptyItem(boardItemsWithContent);
    }

    return defaultBoardItems;
  }, [
    queryRef,
    fetchKey,
    deferredFetchKey,
    isPendingRefetch,
    baiClient?._config?.hideAgents,
    localStorageBoardItems,
    token.marginMD,
  ]);

  const [boardItems, setBoardItems] =
    useState<Array<BAIBoardItem>>(initialBoardItems);

  useEffect(() => {
    setBoardItems(initialBoardItems);
  }, [initialBoardItems]);

  return (
    <BAIBoard
      movable
      resizable
      bordered
      items={boardItems}
      onItemsChange={(event) => {
        const changedItems = [...event.detail.items];
        setBoardItems(changedItems);
        setLocalStorageBoardItems(
          _.map(changedItems, (item) => _.omit(item, 'data')),
        );
      }}
    />
  );
};

export default DashboardPage;
