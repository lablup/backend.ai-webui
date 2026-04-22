/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentReplicasTabRefetchQuery } from '../__generated__/DeploymentReplicasTabRefetchQuery.graphql';
import { DeploymentReplicasTab_deployment$key } from '../__generated__/DeploymentReplicasTab_deployment.graphql';
import { convertToOrderBy } from '../helper';
import ReplicaStatusTag, { ReplicaStatus } from './ReplicaStatusTag';
import { Descriptions, Drawer, Tag, Typography } from 'antd';
import { DescriptionsItemType } from 'antd/es/descriptions';
import {
  BAIColumnType,
  BAIFetchKeyButton,
  BAIFlex,
  BAIId,
  BAITable,
  filterOutEmpty,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import React, { useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

const replicaOrderValues = ['CREATED_AT_ASC', 'CREATED_AT_DESC'] as const;

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
}

const DeploymentReplicasTab: React.FC<DeploymentReplicasTabProps> = ({
  deploymentFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const [queryParams, setQueryParams] = useQueryStates(
    {
      current: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(10),
      order:
        parseAsStringLiteral(replicaOrderValues).withDefault('CREATED_AT_DESC'),
      selected: parseAsString,
    },
    {
      history: 'replace',
      urlKeys: {
        current: 'rCurrent',
        pageSize: 'rPageSize',
        order: 'rOrder',
        selected: 'rSelected',
      },
    },
  );

  const limit = queryParams.pageSize;
  const offset =
    queryParams.current > 1 ? (queryParams.current - 1) * limit : 0;

  const [data, refetch] = useRefetchableFragment<
    DeploymentReplicasTabRefetchQuery,
    DeploymentReplicasTab_deployment$key
  >(
    graphql`
      fragment DeploymentReplicasTab_deployment on ModelDeployment
      @argumentDefinitions(
        orderBy: { type: "[ReplicaOrderBy!]" }
        limit: { type: "Int" }
        offset: { type: "Int" }
      )
      @refetchable(queryName: "DeploymentReplicasTabRefetchQuery") {
        id
        networkAccess {
          endpointUrl
        }
        paginatedReplicas: replicas(
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
    `,
    deploymentFrgmt,
  );

  const replicas =
    data.paginatedReplicas?.edges
      ?.map((edge) => edge?.node)
      ?.filter((n): n is NonNullable<typeof n> => Boolean(n)) ?? [];

  type ReplicaNode = (typeof replicas)[number];

  const selectedReplica = replicas.find(
    (replica) => replica.id === queryParams.selected,
  );

  const doRefetch = (overrides?: {
    order?: string | null;
    limit?: number;
    offset?: number;
  }) => {
    startRefetchTransition(() => {
      refetch(
        {
          orderBy: convertToOrderBy(
            overrides?.order !== undefined
              ? overrides.order
              : queryParams.order,
          ),
          limit: overrides?.limit ?? limit,
          offset: overrides?.offset ?? offset,
        },
        { fetchPolicy: 'network-only' },
      );
    });
  };

  const columns: BAIColumnType<ReplicaNode>[] = filterOutEmpty([
    {
      key: 'id',
      title: t('deployment.ReplicaId'),
      dataIndex: 'id',
      render: (value: string) => <BAIId globalId={value} />,
    },
    {
      key: 'livenessStatus',
      title: t('deployment.HealthStatus'),
      dataIndex: 'livenessStatus',
      render: (value: string | null | undefined) => (
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
      // ModelReplica type does not expose `trafficRatio` directly today — that
      // value lives on the sibling `Route` object. When the backend adds a
      // pass-through field (or this tab adopts a `routes(deploymentId: …)`
      // parallel query), wire it here. See FR-2677.
      key: 'trafficRatio',
      title: t('deployment.TrafficRatio'),
      render: () => (
        // TODO(needs-backend): FR-2677 — expose `trafficRatio` on ModelReplica
        // (or merge Route data) so the replica row can show per-replica load
        // balancing weight.
        <Typography.Text type="secondary">—</Typography.Text>
      ),
    },
    {
      key: 'sessionId',
      title: t('deployment.SessionId'),
      dataIndex: 'sessionId',
      render: (value: string | null | undefined) =>
        value ? (
          <BAIId uuid={value} />
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
      render: (value: string | null | undefined) =>
        value ? dayjs(value).format('lll') : '-',
    },
  ]);

  const drawerItems: DescriptionsItemType[] = selectedReplica
    ? filterOutEmpty([
        {
          key: 'replicaId',
          label: t('deployment.ReplicaId'),
          children: <BAIId globalId={selectedReplica.id} ellipsis={false} />,
        },
        {
          key: 'readinessStatus',
          label: t('deployment.ReadinessStatus'),
          children: (
            <Tag>
              {t(
                `replicaStatus.${readinessStatusI18nKey(
                  selectedReplica.readinessStatus,
                )}`,
                {
                  defaultValue: selectedReplica.readinessStatus ?? '-',
                },
              )}
            </Tag>
          ),
        },
        {
          key: 'livenessStatus',
          label: t('deployment.LivenessStatus'),
          children: (
            <ReplicaStatusTag
              status={toReplicaTagStatus(selectedReplica.livenessStatus)}
            />
          ),
        },
        {
          key: 'activenessStatus',
          label: t('deployment.ActivenessStatus'),
          children: (
            <Tag
              color={
                selectedReplica.activenessStatus === 'ACTIVE'
                  ? 'green'
                  : 'default'
              }
            >
              {selectedReplica.activenessStatus ?? '-'}
            </Tag>
          ),
        },
        selectedReplica.sessionId && {
          key: 'sessionId',
          label: t('deployment.SessionId'),
          children: <BAIId uuid={selectedReplica.sessionId} ellipsis={false} />,
        },
        selectedReplica.revision && {
          key: 'revision',
          label: t('deployment.Revision'),
          children: selectedReplica.revision.name,
        },
        data.networkAccess?.endpointUrl && {
          key: 'endpointUrl',
          label: t('deployment.EndpointUrl'),
          children: (
            <Typography.Text copyable>
              {data.networkAccess.endpointUrl}
            </Typography.Text>
          ),
        },
        {
          key: 'createdAt',
          label: t('deployment.CreatedAt'),
          children: selectedReplica.createdAt
            ? dayjs(selectedReplica.createdAt).format('lll')
            : '-',
        },
      ])
    : [];

  return (
    <>
      <BAIFlex
        justify="end"
        align="center"
        gap="sm"
        wrap="wrap"
        style={{ marginBottom: 12 }}
      >
        <BAIFetchKeyButton
          loading={isPendingRefetch}
          value=""
          onChange={() => doRefetch()}
        />
      </BAIFlex>
      <BAITable<ReplicaNode>
        rowKey={(record) => record.id}
        dataSource={replicas}
        columns={columns}
        loading={isPendingRefetch}
        size="small"
        scroll={{ x: 'max-content' }}
        onRow={(record) => ({
          onClick: () => setQueryParams({ selected: record.id }),
          style: { cursor: 'pointer' },
        })}
        pagination={{
          pageSize: queryParams.pageSize,
          current: queryParams.current,
          total: data.paginatedReplicas?.count ?? 0,
          onChange: (current, pageSize) => {
            setQueryParams({ current, pageSize });
            const newOffset = current > 1 ? (current - 1) * pageSize : 0;
            doRefetch({ limit: pageSize, offset: newOffset });
          },
        }}
        order={queryParams.order}
        onChangeOrder={(newOrder) => {
          setQueryParams({
            order:
              (newOrder as (typeof replicaOrderValues)[number]) ??
              'CREATED_AT_DESC',
          });
          doRefetch({ order: newOrder ?? null });
        }}
      />
      <Drawer
        title={t('deployment.ReplicaDetail')}
        size="large"
        open={!!selectedReplica}
        onClose={() => setQueryParams({ selected: null })}
        destroyOnHidden
      >
        {selectedReplica && (
          <Descriptions column={1} size="small" bordered items={drawerItems} />
        )}
      </Drawer>
    </>
  );
};

/**
 * Maps the GraphQL `ReadinessStatus` enum to the i18n key suffix registered
 * under `replicaStatus.*`. Defaults to `NotChecked` for unknown values so the
 * tag always renders something readable.
 */
const readinessStatusI18nKey = (
  readinessStatus: string | null | undefined,
): string => {
  switch (readinessStatus) {
    case 'HEALTHY':
      return 'Healthy';
    case 'UNHEALTHY':
      return 'Unhealthy';
    case 'NOT_CHECKED':
    default:
      return 'NotChecked';
  }
};

export default DeploymentReplicasTab;
