import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import DoubleTag from './DoubleTag';
import Flex from './Flex';
import ResourceNumber from './ResourceNumber';
import SessionInfoCell from './SessionListColums/SessionInfoCell';
import { SessionListQuery } from './__generated__/SessionListQuery.graphql';
import { FolderOutlined, GroupOutlined } from '@ant-design/icons';
import { Table, TableProps, Tag, theme } from 'antd';
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
            access_key
            starts_at
            scaling_group
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

  const setSessionTypeTagColor = (value: string) => {
    switch (value) {
      case 'INTERACTIVE':
        return 'green';
      case 'BATCH':
        return 'darkgreen';
      case 'INFERENCE':
        return 'blue';
    }
  };

  return (
    <>
      <Table
        scroll={{ x: true }}
        columns={[
          {
            title: t('session.SessionInfo'),
            render(value, record, index) {
              console.log(record);
              return (
                <SessionInfoCell
                  key={record.session_id}
                  sessionFrgmt={record}
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
                    <Flex gap="xxs">
                      <FolderOutlined />
                      {value.join(', ')}
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
                  {record.occupied_slots &&
                    _.map(JSON.parse(record.occupied_slots), (value, type) => {
                      return (
                        <ResourceNumber
                          key={type}
                          // @ts-ignore
                          type={type}
                          value={_.toString(value)}
                        />
                      );
                    })}
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
              const elapsedTime = baiClient.utils.elapsedTime(
                value,
                record.terminated_at,
              );
              return (
                <Flex direction="column" gap="xs">
                  {localeStringDate}
                  <DoubleTag values={[t('session.ElapsedTime'), elapsedTime]} />
                </Flex>
              );
            },
          },
          {
            title: t('session.Architecture'),
            dataIndex: 'architecture',
            render: (value) => {
              return <Tag color="gold">{value}</Tag>;
            },
          },
          {
            title: t('session.SessionType'),
            dataIndex: 'type',
            render: (value) => {
              const sessionTypeTagColor = setSessionTypeTagColor(value);
              return <Tag color={sessionTypeTagColor}>{value}</Tag>;
            },
          },
          {
            title: t('session.Agent'),
          },
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
