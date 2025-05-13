import AvailableResourcesCard from '../components/AvailableResourcesCard';
import MySessionCard from '../components/MySessionCard';
import RecentlyCreatedSessionCard from '../components/RecentlyCreatedSessionCard';
import { filterEmptyItem } from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useInterval } from '../hooks/useIntervalValue';
import { DashboardPageQuery } from './__generated__/DashboardPageQuery.graphql';
import { Col, Grid, Row } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { useTransition } from 'react';
import { useLazyLoadQuery } from 'react-relay';

const DashboardPage: React.FC = () => {
  const { lg } = Grid.useBreakpoint();

  // to avoid flickering
  useSuspendedBackendaiClient();

  const currentProject = useCurrentProjectValue();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const queryRef = useLazyLoadQuery<DashboardPageQuery>(
    graphql`
      query DashboardPageQuery($projectId: UUID!) {
        ...MySessionCardQueryFragment @arguments(projectId: $projectId)
        ...RecentlyCreatedSessionCardFragment @arguments(projectId: $projectId)
      }
    `,
    {
      projectId: currentProject.id,
    },
    {
      fetchPolicy: fetchKey === 'first' ? 'store-and-network' : 'network-only',
      fetchKey,
    },
  );

  useInterval(() => {
    startRefetchTransition(() => {
      updateFetchKey();
    });
  }, 15_000);

  const items = filterEmptyItem([
    {
      id: 'mySession',
      rowSpan: 3,
      columnSpan: 1,
      columnOffset: { 6: 0, 4: 0 },
      data: {
        content: (
          <MySessionCard
            queryRef={queryRef}
            isRefetching={isPendingRefetch}
            style={{ minHeight: lg ? 200 : undefined }}
          />
        ),
      },
    },
    {
      id: 'allocatedResources',
      rowSpan: 3,
      columnSpan: 1,
      columnOffset: { 6: 1, 4: 1 },
      data: {
        content: (
          <AvailableResourcesCard
            style={{
              width: '100%',
              minHeight: lg ? 200 : undefined,
            }}
            isRefetching={isPendingRefetch}
            fetchKey={fetchKey}
          />
        ),
      },
    },
    {
      id: 'recentlyCreatedSession',
      rowSpan: 3,
      columnSpan: 2,
      columnOffset: { 6: 0, 4: 0 },
      data: {
        content: (
          <RecentlyCreatedSessionCard
            queryRef={queryRef}
            isRefetching={isPendingRefetch}
          />
        ),
      },
    },
    // {
    //   id: 'mostResourceAllocatedSession',
    //   rowSpan: 3,
    //   columnSpan: 2,
    //   columnOffset: { 6: 0, 4: 0 },
    //   data: {
    //     content: <></>,
    //   },
    // },
    // {
    //   id: 'pipelineStatus',
    //   rowSpan: 3,
    //   columnSpan: 2,
    //   columnOffset: { 6: 0, 4: 0 },
    //   data: {
    //     content: <></>,
    //   },
    // },
  ]);

  return (
    <>
      <Row gutter={[16, 16]}>
        {_.map(items, (item) => {
          return (
            <Col xs={24} lg={item.columnSpan === 2 ? 24 : 12}>
              {item.data.content}
            </Col>
          );
        })}
      </Row>
    </>
  );
};

export default DashboardPage;
