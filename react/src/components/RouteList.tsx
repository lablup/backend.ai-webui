import QuestionIconWithTooltip from './QuestionIconWithTooltip';
import SessionDetailDrawer from './SessionDetailDrawer';
import { Tag, Typography } from 'antd';
import {
  BAITable,
  filterOutNullAndUndefined,
  filterOutEmpty,
  BAIColumnType,
  BAIFlex,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import {
  RouteListFragment$key,
  RouteListFragment$data,
} from 'src/__generated__/RouteListFragment.graphql';

export type RouteInList = NonNullable<
  NonNullable<RouteListFragment$data>[number]
>;

interface RouteListProps {
  routesFrgmt?: RouteListFragment$key;
}

const RouteList: React.FC<RouteListProps> = ({ routesFrgmt }) => {
  const { t } = useTranslation();
  const [selectedSessionId, setSelectedSessionId] = useState<string>();

  const routes = useFragment(
    graphql`
      fragment RouteListFragment on RoutingNode @relay(plural: true) {
        routingId
        sessionId
        readinessStatus
        livenessStatus
        weight
        detail
        createdAt
      }
    `,
    routesFrgmt,
  );

  const filteredRoutes = filterOutNullAndUndefined(routes);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'green';
      case 'UNHEALTHY':
        return 'red';
      case 'DEGRADED':
        return 'orange';
      case 'NOT_CHECKED':
        return 'default';
      default:
        return 'blue';
    }
  };

  const columns = filterOutEmpty<BAIColumnType<RouteInList>>([
    {
      key: 'routingId',
      title: t('deployment.RoutingID'),
      dataIndex: 'routingId',
      fixed: 'left',
      render: (routingId) => (
        <Typography.Text ellipsis style={{ width: 150 }}>
          {routingId}
        </Typography.Text>
      ),
    },
    {
      key: 'readinessStatus',
      title: (
        <BAIFlex gap={'xxs'}>
          {t('deployment.ReadinessStatus')}
          <QuestionIconWithTooltip
            title={t('deployment.ReadinessStatusDesc')}
          />
        </BAIFlex>
      ),
      dataIndex: 'readinessStatus',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status || 'Unknown'}</Tag>
      ),
    },
    {
      key: 'livenessStatus',
      title: (
        <BAIFlex gap={'xxs'}>
          {t('deployment.LivenessStatus')}
          <QuestionIconWithTooltip title={t('deployment.LivenessStatusDesc')} />
        </BAIFlex>
      ),
      dataIndex: 'livenessStatus',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status || 'Unknown'}</Tag>
      ),
    },
    {
      key: 'sessionId',
      title: t('deployment.SessionID'),
      dataIndex: 'sessionId',
      render: (sessionId) => (
        <Typography.Link
          ellipsis
          style={{ width: 150 }}
          onClick={() => setSelectedSessionId(sessionId)}
        >
          {sessionId}
        </Typography.Link>
      ),
    },
    {
      key: 'weight',
      title: t('deployment.Weight'),
      dataIndex: 'weight',
      render: (weight) => (
        <BAIFlex gap={'xxs'}>
          <Typography.Text>{weight}</Typography.Text>
          {/* TODO: Show Traffic Ratio after server gives totalWeight */}
          {/* <Typography.Text type="secondary">
            (
            {totalWeight
              ? `${toFixedFloorWithoutTrailingZeros((weight / totalWeight) * 100, 1)}%`
              : '0%'}
            )
          </Typography.Text> */}
        </BAIFlex>
      ),
    },
    {
      key: 'createdAt',
      title: t('deployment.CreatedAt'),
      dataIndex: 'createdAt',
      render: (createdAt) => (
        <Typography.Text>{dayjs(createdAt).format('LLL')}</Typography.Text>
      ),
    },
  ]);

  return (
    <>
      <BAITable
        resizable
        columns={columns}
        dataSource={filteredRoutes}
        rowKey="id"
        size="small"
      />
      <BAIUnmountAfterClose>
        <SessionDetailDrawer
          open={!!selectedSessionId}
          sessionId={selectedSessionId}
          onClose={() => {
            setSelectedSessionId(undefined);
          }}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default RouteList;
