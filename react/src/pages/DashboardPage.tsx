import AvailableResourcesCard from '../components/AvailableResourcesCard';
import MySessionCard from '../components/MySessionCard';
import RecentlyCreatedSessionCard from '../components/RecentlyCreatedSessionCard';
import { filterEmptyItem } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { Card, Col, Row } from 'antd';
import _ from 'lodash';

const DashboardPage: React.FC = () => {
  // to avoid flickering
  useSuspendedBackendaiClient();

  const items = filterEmptyItem([
    {
      id: 'mySession',
      rowSpan: 3,
      columnSpan: 1,
      columnOffset: { 6: 0, 4: 0 },
      data: {
        content: <MySessionCard />,
      },
    },
    {
      id: 'allocatedResources',
      rowSpan: 3,
      columnSpan: 1,
      columnOffset: { 6: 1, 4: 1 },
      data: {
        content: <AvailableResourcesCard />,
      },
    },
    {
      id: 'recentlyCreatedSession',
      rowSpan: 3,
      columnSpan: 2,
      columnOffset: { 6: 0, 4: 0 },
      data: {
        content: <RecentlyCreatedSessionCard />,
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
              <Card
                styles={{
                  body: {
                    height: '100%',
                    padding: 0,
                  },
                }}
              >
                {item.data.content}
              </Card>
            </Col>
          );
        })}
      </Row>
    </>
  );
};

export default DashboardPage;
