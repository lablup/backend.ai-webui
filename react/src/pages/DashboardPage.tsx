import AvailableResourcesCard from '../components/AvailableResourcesCard';
import MySessionCard from '../components/MySessionCard';
import RecentlyCreatedSessionCard from '../components/RecentlyCreatedSessionCard';
import { filterEmptyItem } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { DashboardPageQuery } from './__generated__/DashboardPageQuery.graphql';
import { Col, Grid, Row } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { useLazyLoadQuery } from 'react-relay';

const DashboardPage: React.FC = () => {
  const { lg } = Grid.useBreakpoint();

  // to avoid flickering
  useSuspendedBackendaiClient();

  const currentProject = useCurrentProjectValue();

  const queryRef = useLazyLoadQuery<DashboardPageQuery>(
    graphql`
      query DashboardPageQuery($projectId: UUID) {
        ...MySessionCardQueryFragment @arguments(projectId: $projectId)
        ...RecentlyCreatedSessionCardFragment @arguments(projectId: $projectId)
      }
    `,
    {
      projectId: currentProject.id,
    },
    {},
  );

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
        content: <RecentlyCreatedSessionCard queryRef={queryRef} />,
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
