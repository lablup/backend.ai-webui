/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ConnectedKernelListRefetchQuery } from '../../__generated__/ConnectedKernelListRefetchQuery.graphql';
import {
  ConnectedKernelListSessionFragment$data,
  ConnectedKernelListSessionFragment$key,
} from '../../__generated__/ConnectedKernelListSessionFragment.graphql';
import { ContainerLogModalFragment$key } from '../../__generated__/ContainerLogModalFragment.graphql';
import ContainerLogModal from './ContainerLogModal';
import { Button, Tag, theme, Tooltip, Typography } from 'antd';
import type { ColumnType } from 'antd/lib/table';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAITable,
  BAIUnmountAfterClose,
  BAIDoubleTag,
} from 'backend.ai-ui';
import _ from 'lodash';
import { ScrollTextIcon } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

type Kernel = NonNullable<
  NonNullable<
    NonNullable<
      ConnectedKernelListSessionFragment$data['kernel_nodes']
    >['edges'][number]
  >['node']
>;

interface ConnectedKernelListProps {
  sessionFrgmt: ConnectedKernelListSessionFragment$key;
  sessionFrgmtForLogModal: ContainerLogModalFragment$key;
}

const kernelStatusTagColor = {
  // prepare
  PREPARING: 'blue',
  BUILDING: 'blue',
  PULLING: 'blue',
  PREPARED: 'blue',
  CREATING: 'blue',
  // running
  PENDING: 'green',
  SCHEDULED: 'green',
  RUNNING: 'green',
  RESTARTING: 'green',
  RESIZING: 'green',
  SUSPENDED: 'green',
  // terminated
  TERMINATING: 'default',
  TERMINATED: 'default',
  CANCELLED: 'default',
  // error
  ERROR: 'red',
};

const ConnectedKernelList: React.FC<ConnectedKernelListProps> = ({
  sessionFrgmt,
  sessionFrgmtForLogModal,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [kernelIdForLogModal, setKernelIdForLogModal] = useState<string>();
  const { token } = theme.useToken();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [order, setOrder] = useState<string>();

  const [session, refetch] = useRefetchableFragment<
    ConnectedKernelListRefetchQuery,
    ConnectedKernelListSessionFragment$key
  >(
    graphql`
      fragment ConnectedKernelListSessionFragment on ComputeSessionNode
      @argumentDefinitions(order: { type: "String", defaultValue: null })
      @refetchable(queryName: "ConnectedKernelListRefetchQuery") {
        kernel_nodes(order: $order) {
          edges {
            node {
              id
              row_id
              cluster_hostname
              cluster_idx
              cluster_role
              status
              status_info
              agent_id
              container_id
            }
          }
        }
      }
    `,
    sessionFrgmt,
  );

  const kernelNodes = filterOutNullAndUndefined(
    session.kernel_nodes?.edges.map((e) => e?.node),
  );

  const columns = filterOutEmpty<ColumnType<Kernel>>([
    {
      title: t('kernel.Hostname'),
      dataIndex: 'cluster_hostname',
      sorter: true,
      render: (hostname, record) => {
        return (
          <>
            <Typography.Text>{hostname}</Typography.Text>
            <Tooltip title={t('session.SeeContainerLogs')}>
              <Button
                icon={<ScrollTextIcon />}
                type="link"
                onClick={() => {
                  record.row_id && setKernelIdForLogModal(record.row_id);
                }}
                style={{
                  width: 'auto',
                  height: 'auto',
                  marginInlineStart: token.marginXXS,
                  border: 'none',
                }}
              />
            </Tooltip>
          </>
        );
      },
    },
    {
      title: t('kernel.Status'),
      dataIndex: 'status',
      sorter: true,
      render: (status, record) => {
        return (
          <>
            {record?.status_info !== '' ? (
              <BAIDoubleTag
                values={[
                  { label: status, color: _.get(kernelStatusTagColor, status) },
                  {
                    label: record?.status_info,
                    color: _.get(
                      kernelStatusTagColor,
                      record?.status_info ?? '',
                    ),
                  },
                ]}
              />
            ) : (
              <Tag color={_.get(kernelStatusTagColor, status)}>{status}</Tag>
            )}
          </>
        );
      },
    },
    {
      title: t('kernel.AgentId'),
      dataIndex: 'agent_id',
      sorter: true,
      render: (id) =>
        _.isEmpty(id) ? '-' : <Typography.Text copyable>{id}</Typography.Text>,
    },
    {
      title: t('kernel.KernelId'),
      fixed: 'left',
      dataIndex: 'row_id',
      render: (row_id) => (
        <>
          <Typography.Text copyable ellipsis>
            {row_id}
          </Typography.Text>
        </>
      ),
    },
    {
      title: t('kernel.ContainerId'),
      dataIndex: 'container_id',
      onCell: () => ({
        style: { maxWidth: 250 },
      }),
      render: (id) =>
        _.isEmpty(id) ? (
          '-'
        ) : (
          <Typography.Text copyable ellipsis>
            {id}
          </Typography.Text>
        ),
    },
  ]);

  return (
    <>
      {/* TODO: implement filter when compute_session_node query supports filter */}
      {/* <BAIPropertyFilter
        filterProperties={[
          {
            key: 'agent_id',
            propertyLabel: t('kernel.AgentId'),
            type: 'string',
          },
        ]}
        value={filterString}
        onChange={(value) => {
          startFilterTransition(() => {
            setFilterString(value);
          });
        }}
      /> */}
      <BAITable
        bordered
        loading={isPendingRefetch}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        columns={columns}
        dataSource={kernelNodes}
        order={order}
        onChangeOrder={(nextOrder) => {
          setOrder(nextOrder);
          startRefetchTransition(() => {
            refetch({ order: nextOrder ?? null });
          });
        }}
      />

      <BAIUnmountAfterClose>
        <ContainerLogModal
          open={!!kernelIdForLogModal}
          sessionFrgmt={sessionFrgmtForLogModal}
          defaultKernelId={kernelIdForLogModal}
          onCancel={() => {
            setKernelIdForLogModal(undefined);
          }}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default ConnectedKernelList;
