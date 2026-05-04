/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DeploymentReplicasTabListQuery,
  ReplicaOrderBy,
} from '../__generated__/DeploymentReplicasTabListQuery.graphql';
import { DeploymentReplicasTab_deployment$key } from '../__generated__/DeploymentReplicasTab_deployment.graphql';
import { convertToOrderBy } from '../helper';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import ReplicaStatusTag, { ReplicaStatus } from './ReplicaStatusTag';
import SessionDetailDrawer from './SessionDetailDrawer';
import { Tag, Typography } from 'antd';
import {
  BAIColumnType,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIId,
  BAINameActionCell,
  BAITable,
  BAIUnmountAfterClose,
  type GraphQLFilter,
  filterOutEmpty,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

const availableReplicaSorterKeys = ['createdAt'] as const;
const availableReplicaSorterValues = [
  ...availableReplicaSorterKeys,
  ...availableReplicaSorterKeys.map((key) => `-${key}` as const),
] as const;
const isEnableSorter = (key: string) =>
  _.includes(availableReplicaSorterKeys, key);

/**
 * Maps the GraphQL `LivenessStatus` of a `ModelReplica` (plus the lifecycle
 * statuses exposed via `ReplicaStatus` enum) to the props accepted by
 * `ReplicaStatusTag`. Health states come from `livenessStatus` and lifecycle
 * states are overlaid from the replica's `status` field when available.
 */
const toReplicaTagStatus = (livenessStatus?: string | null): ReplicaStatus => {
  switch (livenessStatus) {
    case 'HEALTHY':
      return 'HEALTHY';
    case 'UNHEALTHY':
      return 'UNHEALTHY';
    case 'DEGRADED':
      return 'DEGRADED';
    case 'NOT_CHECKED':
    default:
      return 'NOT_CHECKED';
  }
};

interface DeploymentReplicasTabProps {
  deploymentFrgmt: DeploymentReplicasTab_deployment$key;
  deploymentId: string;
}

const DeploymentReplicasTab: React.FC<DeploymentReplicasTabProps> = ({
  deploymentFrgmt,
  deploymentId,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.DeploymentReplicasTab',
  );

  const [queryParams, setQueryParams] = useQueryStates(
    {
      current: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(10),
      order: parseAsStringLiteral(availableReplicaSorterValues),
      rFilter: parseAsString,
    },
    {
      history: 'replace',
      urlKeys: {
        current: 'rCurrent',
        pageSize: 'rPageSize',
        order: 'rOrder',
        rFilter: 'rFilter',
      },
    },
  );

  useFragment(
    graphql`
      fragment DeploymentReplicasTab_deployment on ModelDeployment {
        id
      }
    `,
    deploymentFrgmt,
  );

  const parseReplicaFilter = (filter: string | null) => {
    if (!filter) return null;
    try {
      const parsed = JSON.parse(filter);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed
        : null;
    } catch {
      return null;
    }
  };

  const stringifyReplicaFilter = (
    filter: GraphQLFilter | undefined,
  ): string => {
    if (!filter || Object.keys(filter).length === 0) return '';
    return JSON.stringify(filter);
  };

  const [queryVars, setQueryVars] = useState(() => ({
    filter: queryParams.rFilter
      ? parseReplicaFilter(queryParams.rFilter)
      : null,
    orderBy: convertToOrderBy<ReplicaOrderBy>(
      queryParams.order ?? '-createdAt',
    ),
    limit: queryParams.pageSize,
    offset:
      queryParams.current > 1
        ? (queryParams.current - 1) * queryParams.pageSize
        : 0,
  }));

  const [fetchKey, setFetchKey] = useState(0);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

  const { deployment: listData } =
    useLazyLoadQuery<DeploymentReplicasTabListQuery>(
      graphql`
        query DeploymentReplicasTabListQuery(
          $deploymentId: ID!
          $filter: ReplicaFilter
          $orderBy: [ReplicaOrderBy!]
          $limit: Int
          $offset: Int
        ) {
          deployment(id: $deploymentId) {
            replicas(
              filter: $filter
              orderBy: $orderBy
              limit: $limit
              offset: $offset
            ) {
              count
              edges {
                node {
                  id
                  sessionId
                  revisionId
                  readinessStatus
                  livenessStatus
                  activenessStatus
                  createdAt
                  revision {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      `,
      { deploymentId, ...queryVars },
      { fetchKey, fetchPolicy: 'network-only' },
    );

  const replicas =
    listData?.replicas?.edges
      ?.map((edge) => edge?.node)
      ?.filter((n): n is NonNullable<typeof n> => Boolean(n)) ?? [];

  type ReplicaNode = (typeof replicas)[number];

  const doRefetch = (overrides?: {
    filter?: ReturnType<typeof parseReplicaFilter>;
    orderBy?: ReturnType<typeof convertToOrderBy<ReplicaOrderBy>>;
    limit?: number;
    offset?: number;
  }) => {
    startTransition(() => {
      setQueryVars((prev) => ({ ...prev, ...overrides }));
    });
  };

  const replicaStatusOptions = [
    { label: t('replicaStatus.Provisioning'), value: 'PROVISIONING' },
    { label: t('replicaStatus.Running'), value: 'RUNNING' },
    { label: t('replicaStatus.Terminating'), value: 'TERMINATING' },
    { label: t('replicaStatus.Terminated'), value: 'TERMINATED' },
    { label: t('replicaStatus.FailedToStart'), value: 'FAILED_TO_START' },
  ];

  const filterProperties = [
    {
      key: 'status',
      propertyLabel: t('general.Status'),
      type: 'enum' as const,
      options: replicaStatusOptions,
    },
  ];

  const filterValue: GraphQLFilter | undefined = queryParams.rFilter
    ? (parseReplicaFilter(queryParams.rFilter) ?? undefined)
    : undefined;

  const columns: BAIColumnType<ReplicaNode>[] = filterOutEmpty([
    {
      key: 'id',
      title: t('deployment.ReplicaId'),
      dataIndex: 'id',
      fixed: 'left',
      render: (value: string) => <BAIId globalId={value} copyable />,
    },
    {
      key: 'livenessStatus',
      title: t('deployment.HealthStatus'),
      dataIndex: 'livenessStatus',
      render: (value: string | null | undefined) => (
        // TODO(needs-backend): FR-2787 — expose failure reason / error message
        // from the replica once the backend adds a `failureReason` field to
        // `ModelReplica` so unhealthy replicas surface actionable error info.
        <ReplicaStatusTag status={toReplicaTagStatus(value)} />
      ),
    },
    {
      key: 'activenessStatus',
      title: t('deployment.ActivePool'),
      dataIndex: 'activenessStatus',
      render: (value: string | null | undefined) => (
        <Tag color={value === 'ACTIVE' ? 'green' : 'default'}>
          {value === 'ACTIVE'
            ? t('deployment.status.Healthy')
            : t('deployment.status.NotChecked')}
        </Tag>
      ),
    },
    {
      // TODO(needs-backend): FR-2677 — expose `trafficRatio` on ModelReplica
      // (or merge Route data) so the replica row can show per-replica load
      // balancing weight.
      key: 'trafficRatio',
      title: t('deployment.TrafficRatio'),
      defaultHidden: true,
      render: (value) => value ?? '-',
    },
    {
      // TODO(needs-backend): BA-5838 — ModelReplica.sessionId returns the
      // replica's own route_id instead of the compute session ID. Hidden by
      // default until the backend fix lands so users don't see wrong data.
      key: 'sessionId',
      title: t('deployment.SessionId'),
      dataIndex: 'sessionId',
      defaultHidden: true,
      render: (value: string | null | undefined) =>
        value ? (
          <BAINameActionCell
            title={value}
            onTitleClick={() => setSelectedSessionId(value)}
          />
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      key: 'revision',
      title: t('deployment.Revision'),
      render: (_: unknown, record: ReplicaNode) =>
        record.revision?.name ?? (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      key: 'createdAt',
      title: t('deployment.CreatedAt'),
      dataIndex: 'createdAt',
      sorter: isEnableSorter('createdAt'),
      render: (value: string | null | undefined) =>
        value ? dayjs(value).format('lll') : '-',
    },
  ]);

  return (
    <>
      <BAIFlex
        justify="between"
        align="center"
        gap="xs"
        style={{ marginBottom: 12 }}
      >
        <BAIGraphQLPropertyFilter
          filterProperties={filterProperties}
          value={filterValue}
          onChange={(next) => {
            const str = stringifyReplicaFilter(next);
            const parsed = parseReplicaFilter(str || null);
            setQueryParams({ rFilter: str || null, current: 1 });
            doRefetch({ filter: parsed, offset: 0 });
          }}
        />
        <BAIFetchKeyButton
          loading={isPending}
          value=""
          onChange={() => {
            startTransition(() => setFetchKey((k) => k + 1));
          }}
        />
      </BAIFlex>
      <BAITable<ReplicaNode>
        rowKey={(record) => record.id}
        dataSource={replicas}
        columns={columns}
        loading={isPending}
        size="small"
        scroll={{ x: 'max-content' }}
        tableSettings={{
          columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
        order={queryParams.order ?? undefined}
        onChangeOrder={(newOrder) => {
          setQueryParams({
            order: newOrder as
              | (typeof availableReplicaSorterValues)[number]
              | null,
          });
          doRefetch({ orderBy: convertToOrderBy<ReplicaOrderBy>(newOrder) });
        }}
        pagination={{
          pageSize: queryParams.pageSize,
          current: queryParams.current,
          total: listData?.replicas?.count ?? 0,
          onChange: (current, pageSize) => {
            setQueryParams({ current, pageSize });
            const newOffset = current > 1 ? (current - 1) * pageSize : 0;
            doRefetch({ limit: pageSize, offset: newOffset });
          },
        }}
      />
      <BAIUnmountAfterClose>
        <SessionDetailDrawer
          open={!!selectedSessionId}
          sessionId={selectedSessionId ?? undefined}
          onClose={() => setSelectedSessionId(null)}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default DeploymentReplicasTab;
