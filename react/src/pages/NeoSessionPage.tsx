import AllocatedResourcesCard from '../components/AllocatedResourcesCard';
import BAIStartSimpleCard from '../components/BAIStartSimpleCard';
import Flex from '../components/Flex';
import NeoSessionList from '../components/NeoSessionList';
import SessionsIcon from '../components/icons/SessionsIcon';
import { useUpdatableState, useWebUINavigate } from '../hooks';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { NeoSessionPage_ServiceListQuery } from './__generated__/NeoSessionPage_ServiceListQuery.graphql';
import { NeoSessionPage_SessionListQuery } from './__generated__/NeoSessionPage_SessionListQuery.graphql';
import { Card, Typography, Button, Tabs, Badge, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import { t } from 'i18next';
import _ from 'lodash';
import React, { useState } from 'react';
import { useLazyLoadQuery } from 'react-relay';

const TAB_ITEMS_MAP = {
  all: t('general.All'),
  interactive: t('session.Interactive'),
  batch: t('session.Batch'),
  inference: t('session.Inference'),
  system: 'System',
};

interface NeoSessionPageProps {}

const NeoSessionPage: React.FC<NeoSessionPageProps> = (props) => {
  const { token } = theme.useToken();
  const webuiNavigate = useWebUINavigate();
  const [
    sessionFetchKey,
    // setSessionFetchKey
  ] = useUpdatableState('initial-fetch');
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 10,
  });
  const { id: projectId } = useCurrentProjectValue();
  const [order, setOrder] = useState<string>();
  const [servicesFetchKey, updateServicesFetchKey] =
    useUpdatableState('initial-fetch');

  const { compute_session_list } =
    useLazyLoadQuery<NeoSessionPage_SessionListQuery>(
      graphql`
        query NeoSessionPage_SessionListQuery(
          $limit: Int!
          $offset: Int!
          $group_id: String
          $status: String
          $order: String
        ) {
          compute_session_list(
            limit: $limit
            offset: $offset
            group_id: $group_id
            status: $status
            order: $order
          ) {
            items {
              id
              type
              session_id
              name
              created_at
              terminated_at
              containers {
                live_stat
                last_stat
              }
              status
              occupied_slots
              resource_opts
            }
            total_count
          }
        }
      `,
      {
        limit: baiPaginationOption.limit,
        offset: baiPaginationOption.offset,
        group_id: projectId,
        order,
      },
      {
        fetchKey:
          sessionFetchKey === 'initial-fetch'
            ? 'store-and-network'
            : 'network-only',
        fetchPolicy: 'network-only',
      },
    );

  const { endpoint_list: modelServiceList } =
    useLazyLoadQuery<NeoSessionPage_ServiceListQuery>(
      graphql`
        query NeoSessionPage_ServiceListQuery(
          $offset: Int!
          $projectID: UUID
          $limit: Int!
          $filter: String
        ) {
          endpoint_list(
            offset: $offset
            limit: $limit
            project: $projectID
            filter: $filter
          ) {
            total_count
            items {
              status
            }
          }
        }
      `,
      {
        offset: baiPaginationOption.offset,
        limit: 10,
        projectID: projectId,
        filter: null,
      },
      {
        fetchPolicy: 'network-only',
        fetchKey: servicesFetchKey,
      },
    );

  const allActiveSessionCount =
    _.filter(compute_session_list?.items, (item) =>
      _.includes(
        [
          'RESTARTING',
          'PREPARING',
          'PULLING',
          'RUNNING',
          'RUNNING_DEGRADED',
          'PENDING',
          'SCHEDULED',
        ],
        item?.status,
      ),
    ).length +
    (_.filter(modelServiceList?.items, (item) => item?.status !== 'TERMINATED')
      .length ?? 0);

  const interactiveSessionCount = _.filter(
    compute_session_list?.items,
    (item) =>
      _.includes(
        [
          'RESTARTING',
          'PREPARING',
          'PULLING',
          'RUNNING',
          'RUNNING_DEGRADED',
          'PENDING',
          'SCHEDULED',
        ],
        item?.status,
      ) && item?.type === 'INTERACTIVE',
  ).length;

  const batchSessionCount = _.filter(
    compute_session_list?.items,
    (item) =>
      _.includes(
        [
          'RESTARTING',
          'PREPARING',
          'PULLING',
          'RUNNING',
          'RUNNING_DEGRADED',
          'PENDING',
          'SCHEDULED',
        ],
        item?.status,
      ) && item?.type === 'BATCH',
  ).length;

  const inferenceSessionCount = _.filter(
    compute_session_list?.items,
    (item) =>
      _.includes(
        [
          'RESTARTING',
          'PREPARING',
          'PULLING',
          'RUNNING',
          'RUNNING_DEGRADED',
          'PENDING',
          'SCHEDULED',
        ],
        item?.status,
      ) && item?.type === 'INFERENCE',
  ).length;
  const systemSessionCount = _.filter(
    compute_session_list?.items,
    (item) =>
      _.includes(
        [
          'RESTARTING',
          'PREPARING',
          'PULLING',
          'RUNNING',
          'RUNNING_DEGRADED',
          'PENDING',
          'SCHEDULED',
        ],
        item?.status,
      ) && item?.type === 'SYSTEM',
  ).length;

  const MOCK_TOTAL_DATA = {
    all: `${allActiveSessionCount}`,
    interactive: `${interactiveSessionCount} / ${allActiveSessionCount}`,
    batch: `${batchSessionCount} / ${allActiveSessionCount}`,
    inference: `${inferenceSessionCount} / ${allActiveSessionCount}`,
    system: `${systemSessionCount} / ${allActiveSessionCount}`,
  };

  return (
    <Flex direction="column" align="stretch" gap={'lg'}>
      <Flex align="start" gap={'lg'}>
        <BAIStartSimpleCard
          icon={<SessionsIcon />}
          title={'Create a Session'}
          footerButtonProps={{
            onClick: () => {
              webuiNavigate('/session/start');
            },
            children: 'Start Session',
          }}
          styles={{
            body: {
              height: 192,
            },
          }}
        />
        <AllocatedResourcesCard width={936} />
      </Flex>
      <Flex align="stretch" direction="column">
        <Card>
          <Flex justify="between" style={{ marginBottom: 22 }}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {t('session.launcher.Sessions')}
            </Typography.Title>
            <Button
              type="primary"
              onClick={() => webuiNavigate('/session/start')}
            >
              Start Session
            </Button>
          </Flex>
          <Tabs
            type="card"
            items={_.map(TAB_ITEMS_MAP, (label, key) => ({
              key,
              label: (
                <Flex style={{ width: 124 }} justify="center" gap={10}>
                  {label}
                  <Badge
                    count={_.get(MOCK_TOTAL_DATA, key)}
                    color={token.colorPrimary}
                  />
                </Flex>
              ),
              children: <NeoSessionList key={key} sessionType={key} />,
            }))}
          />
        </Card>
      </Flex>
    </Flex>
  );
};

export default NeoSessionPage;
