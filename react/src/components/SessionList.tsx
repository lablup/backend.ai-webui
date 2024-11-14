import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { useBackendAIImageMetaData } from '../hooks';
import BAIIntervalView from './BAIIntervalView';
import DoubleTag from './DoubleTag';
import Flex from './Flex';
import ImageMetaIcon from './ImageMetaIcon';
import ResourceNumber from './ResourceNumber';
import SessionInfoCell from './SessionListColums/SessionInfoCell';
import { SessionListQuery } from './__generated__/SessionListQuery.graphql';
import { FolderOutlined, GroupOutlined } from '@ant-design/icons';
import { Table, TableProps, Tag, Typography, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

type Session = NonNullable<
  SessionListQuery['response']['compute_session_list']
>['items'][0];
interface SessionListProps extends Omit<TableProps<any>, 'dataSource'> {
  status?: string[];
  limit?: number;
  currentPage?: number;
  pageSize?: number;
  projectId?: string;
  filter: (item: Session) => boolean;
  extraFetchKey?: string;
}

const SessionList: React.FC<SessionListProps> = ({
  status = [],
  limit = 50,
  currentPage = 1,
  pageSize = 50,
  projectId,
  filter,
  extraFetchKey = '',
  ...tableProps
}) => {
  const baiClient = useSuspendedBackendaiClient();

  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');
  const deferredMergedFetchKey = useDeferredValue(fetchKey + extraFetchKey);
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [, { getImageAliasName, getBaseVersion, getBaseImage }] =
    useBackendAIImageMetaData();

  if (
    !baiClient.supports('avoid-hol-blocking') &&
    status.includes('SCHEDULED')
  ) {
    status = status.filter((e) => e !== 'SCHEDULED');
  }

  const { compute_session_list } = useLazyLoadQuery<SessionListQuery>(
    graphql`
      query SessionListQuery(
        $limit: Int!
        $offset: Int!
        $ak: String
        $group_id: String
        $status: String
        $skipClusterSize: Boolean!
      ) {
        compute_session_list(
          limit: $limit
          offset: $offset
          access_key: $ak
          group_id: $group_id
          status: $status
        ) {
          items {
            id
            type
            session_id
            name
            image
            architecture
            created_at
            terminated_at
            status
            status_info
            service_ports
            mounts
            occupied_slots
            resource_opts
            access_key
            starts_at
            scaling_group
            agents
            image
            cluster_size @skipOnClient(if: $skipClusterSize)
            ...SessionInfoCellFragment
          }
        }
      }
    `,
    {
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
      status: status?.join(','),
      group_id: projectId,

      // skipOnClients
      skipClusterSize: !baiClient.supports('multi-container'),
    },
    {
      fetchKey: deferredMergedFetchKey,
      fetchPolicy: 'network-only',
    },
  );

  const statusTagColor = {
    //prepare
    RESTARTING: 'blue',
    PREPARED: 'blue',
    PREPARING: 'blue',
    PULLING: 'blue',
    //running
    RUNNING: 'green',
    PENDING: 'green',
    SCHEDULED: 'green',
    //error
    ERROR: 'red',
    //finished return undefined
  };

  const statusInfoTagColor = {
    'idle-timeout': 'green',
    'user-requested': 'green',
    scheduled: 'green',
    'self-terminated': 'green',
    'no-available-instances': 'red',
    'failed-to-start': 'red',
    'creation-failed': 'red',
  };

  const typeTagColor = {
    INTERACTIVE: 'green',
    BATCH: 'darkgreen',
    INFERENCE: 'blue',
  };

  return (
    <>
      <Table
        scroll={{ x: 'max-content' }}
        columns={[
          {
            title: t('session.SessionInfo'),
            render(value, record, index) {
              return (
                <SessionInfoCell
                  key={record.session_id}
                  sessionFrgmt={record}
                  sessionNameList={_.map(
                    (compute_session_list?.items || []).filter(filter) || [],
                    'name',
                  )}
                  onRename={() => {
                    updateFetchKey(
                      record.session_id + new Date().toISOString(),
                    );
                  }}
                />
              );
            },
            fixed: 'left',
          },
          {
            title: t('session.Status'),
            dataIndex: 'status',
            render(value, record) {
              return (
                <>
                  {record.status_info !== '' ? (
                    <DoubleTag
                      values={[
                        { label: value, color: _.get(statusTagColor, value) },
                        {
                          label: record.status_info,
                          color: _.get(statusInfoTagColor, record.status_info),
                        },
                      ]}
                    />
                  ) : (
                    <Tag color={_.get(statusTagColor, value)}>{value}</Tag>
                  )}
                </>
              );
            },
          },
          {
            title: t('general.Control'),
          },
          {
            title: t('session.Configuration'),
            dataIndex: 'mounts',
            render(value, record) {
              return (
                <>
                  {value.length > 0 ? (
                    <Flex gap="xxs" style={{ width: 200 }}>
                      <FolderOutlined />
                      <Typography.Text
                        ellipsis={{
                          tooltip: {
                            overlayInnerStyle: { width: 'max-content' },
                            title: _.map(value, (mountedFolder) => {
                              return <div>{mountedFolder}</div>;
                            }),
                          },
                        }}
                      >
                        {value.join(', ')}
                      </Typography.Text>
                    </Flex>
                  ) : (
                    <Flex gap="xxs" style={{ color: token.colorTextDisabled }}>
                      <FolderOutlined />
                      No mount
                    </Flex>
                  )}
                  <Flex gap="xxs">
                    <GroupOutlined />
                    {record.scaling_group}
                  </Flex>
                  <Flex gap="xxs">
                    {record.occupied_slots &&
                      _.map(
                        JSON.parse(record.occupied_slots),
                        (value, type) => {
                          return (
                            <ResourceNumber
                              key={type}
                              // @ts-ignore
                              type={type}
                              value={_.toString(value)}
                              opts={{
                                shmem: _.sum(
                                  _.map(
                                    JSON.parse(record.resource_opts),
                                    (item) => {
                                      return item.shmem;
                                    },
                                  ),
                                ),
                              }}
                            />
                          );
                        },
                      )}
                  </Flex>
                </>
              );
            },
          },
          {
            title: t('session.Usage'),
          },
          {
            title: t('session.Reservation'),
            dataIndex: 'created_at',
            render(value, record) {
              const localeStringDate = new Date(value).toLocaleString();

              return (
                <Flex direction="column" gap="xs">
                  {localeStringDate}
                  <BAIIntervalView
                    callback={() => {
                      return baiClient.utils.elapsedTime(
                        value,
                        record.terminated_at,
                      );
                    }}
                    delay={1000}
                    render={(intervalValue) => (
                      <DoubleTag
                        values={[
                          { label: t('session.ElapsedTime') },
                          {
                            label: intervalValue,
                          },
                        ]}
                      />
                    )}
                  />
                </Flex>
              );
            },
          },
          {
            title: t('session.EnvironmentInfo'),
            render: (record) => {
              return (
                <Tag color="gold">
                  <Flex direction="column">
                    <Flex gap="xxs">
                      <ImageMetaIcon image={record.image} />
                      {/*<div> to apply gap */}
                      <div>{getImageAliasName(record.image)}</div>
                      {getBaseVersion(record.image)}
                    </Flex>
                    <Flex gap="xxs">
                      {/*<div> to apply gap */}
                      <div>{getBaseImage(record.image)}</div>
                      {record.architecture}
                    </Flex>
                  </Flex>
                </Tag>
              );
            },
          },
          {
            title: t('session.SessionType'),
            dataIndex: 'type',
            render: (value) => {
              return <Tag color={_.get(typeTagColor, value)}>{value}</Tag>;
            },
          },
          ...(baiClient.is_admin || !!baiClient._config.hideAgents
            ? [
                {
                  title: t('session.Agents'),
                  dataIndex: 'agents',
                  render(value: string[]) {
                    return _.map(value, (agent) => {
                      return agent;
                    });
                  },
                },
              ]
            : []),
        ]}
        // @ts-ignore
        dataSource={(compute_session_list?.items || []).filter(filter)}
        // dataSource={_.filter(compute_session_list?.items || [], () => {})}
        // pagination={{

        // }}
        {...tableProps}
      />
    </>
  );
};

export default SessionList;
