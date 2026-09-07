/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  ConnectedKernelListV2Query,
  KernelV2Filter,
  KernelV2OrderBy,
} from '../../__generated__/ConnectedKernelListV2Query.graphql';
import { ContainerLogModalFragment$key } from '../../__generated__/ContainerLogModalFragment.graphql';
import { convertToOrderBy } from '../../helper';
import { useBAIPaginationOptionState } from '../../hooks/reactPaginationQueryOptions';
import ContainerLogModal from './ContainerLogModal';
import { Badge } from '@astryxdesign/core/Badge';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import {
  badgeVariantForStatus,
  safeDecodeUuid,
  BAIColumnsType,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIId,
  BAITable,
  BAIText,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { ScrollTextIcon } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type Kernel = NonNullable<
  NonNullable<
    ConnectedKernelListV2Query['response']['sessionKernelsV2']
  >['edges'][number]
>['node'];

// `KernelV2Status` is not exported as a standalone type by the compiler, so the
// filter options are listed from the schema enum.
const KERNEL_STATUSES = [
  'PENDING',
  'SCHEDULED',
  'PREPARING',
  'PREPARED',
  'CREATING',
  'RUNNING',
  'TERMINATING',
  'TERMINATED',
  'CANCELLED',
];

interface ConnectedKernelListV2Props {
  sessionId: string;
  sessionFrgmtForLogModal: ContainerLogModalFragment$key;
  fetchKey?: string;
}

const ConnectedKernelListV2: React.FC<ConnectedKernelListV2Props> = ({
  sessionId,
  sessionFrgmtForLogModal,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [kernelIdForLogModal, setKernelIdForLogModal] = useState<string>();
  const [filter, setFilter] = useState<KernelV2Filter>();
  const [order, setOrder] = useState<string | null>('cluster.clusterIdx');
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 10 });

  const deferredFetchKey = useDeferredValue(fetchKey);
  const deferredFilter = useDeferredValue(filter);
  const deferredOrder = useDeferredValue(order);
  const deferredLimit = useDeferredValue(baiPaginationOption.limit);
  const deferredOffset = useDeferredValue(baiPaginationOption.offset);

  const { sessionKernelsV2 } = useLazyLoadQuery<ConnectedKernelListV2Query>(
    graphql`
      query ConnectedKernelListV2Query(
        $scope: SessionScope!
        $filter: KernelV2Filter
        $orderBy: [KernelV2OrderBy!]
        $limit: Int
        $offset: Int
      ) {
        sessionKernelsV2(
          scope: $scope
          filter: $filter
          orderBy: $orderBy
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              cluster {
                clusterHostname
                clusterIdx
              }
              lifecycle {
                status
              }
              resource {
                agentId
                containerId
              }
            }
          }
        }
      }
    `,
    {
      scope: { sessionId },
      filter: deferredFilter,
      orderBy: convertToOrderBy<KernelV2OrderBy>(deferredOrder),
      limit: deferredLimit,
      offset: deferredOffset,
    },
    {
      fetchKey: deferredFetchKey,
      fetchPolicy: 'store-and-network',
    },
  );

  const columns: BAIColumnsType<Kernel> = [
    {
      title: t('kernel.Hostname'),
      dataIndex: ['cluster', 'clusterHostname'],
      sorter: true,
      render: (hostname, record) => {
        const kernelId = safeDecodeUuid(record.id);
        return (
          <>
            <Text>{hostname}</Text>
            <IconButton
              variant="ghost"
              size="sm"
              icon={<ScrollTextIcon />}
              label={t('session.SeeContainerLogs')}
              tooltip={t('session.SeeContainerLogs')}
              isDisabled={!kernelId}
              onClick={() => {
                kernelId && setKernelIdForLogModal(kernelId);
              }}
            />
          </>
        );
      },
    },
    {
      title: t('kernel.Status'),
      dataIndex: ['lifecycle', 'status'],
      sorter: true,
      render: (status) => (
        <Badge
          variant={badgeVariantForStatus('kernel', status)}
          label={status}
        />
      ),
    },
    {
      title: t('kernel.AgentId'),
      dataIndex: ['resource', 'agentId'],
      render: (id) => (_.isEmpty(id) ? '-' : <BAIText copyable>{id}</BAIText>),
    },
    {
      title: t('kernel.KernelId'),
      fixed: 'left',
      dataIndex: 'id',
      render: (id) => {
        const kernelId = safeDecodeUuid(id);
        return kernelId ? <BAIId uuid={kernelId} /> : '-';
      },
    },
    {
      title: t('kernel.ContainerId'),
      dataIndex: ['resource', 'containerId'],
      render: (id) => (_.isEmpty(id) ? '-' : <BAIId uuid={id} />),
    },
  ];

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIGraphQLPropertyFilter
        value={filter}
        onChange={(next) => {
          setFilter(next);
          setTablePaginationOption({ current: 1 });
        }}
        filterProperties={[
          {
            key: 'id',
            propertyLabel: t('kernel.KernelId'),
            type: 'uuid',
          },
          {
            key: 'status',
            propertyLabel: t('kernel.Status'),
            type: 'enum',
            strictSelection: true,
            options: _.map(KERNEL_STATUSES, (status) => ({
              label: status,
              value: status,
            })),
          },
        ]}
      />
      <BAITable
        scroll={{ x: 'max-content' }}
        bordered
        loading={
          deferredFilter !== filter ||
          deferredOrder !== order ||
          deferredLimit !== baiPaginationOption.limit ||
          deferredOffset !== baiPaginationOption.offset
        }
        rowKey="id"
        columns={columns}
        dataSource={_.map(sessionKernelsV2?.edges, 'node')}
        order={order}
        onChangeOrder={(nextOrder) => {
          setOrder(nextOrder ?? null);
          setTablePaginationOption({ current: 1 });
        }}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: sessionKernelsV2?.count ?? 0,
          onChange: (current, pageSize) => {
            setTablePaginationOption({ current, pageSize });
          },
        }}
      />

      <BAIUnmountAfterClose>
        <ContainerLogModal
          open={!!kernelIdForLogModal}
          sessionFrgmt={sessionFrgmtForLogModal || null}
          defaultKernelId={kernelIdForLogModal}
          onCancel={() => {
            setKernelIdForLogModal(undefined);
          }}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default ConnectedKernelListV2;
