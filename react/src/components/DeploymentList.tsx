/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DeploymentList_modelDeploymentConnection$data,
  DeploymentList_modelDeploymentConnection$key,
} from '../__generated__/DeploymentList_modelDeploymentConnection.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import DeploymentOwnerInfo from './DeploymentOwnerInfo';
import DeploymentStatusTag, { DeploymentStatus } from './DeploymentStatusTag';
import { Typography, theme } from 'antd';
import {
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAITable,
  filterOutEmpty,
  filterOutNullAndUndefined,
  type BAIColumnType,
  type GraphQLFilter,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

type DeploymentEdge = NonNullable<
  NonNullable<
    DeploymentList_modelDeploymentConnection$data['edges']
  >[number]
>;
type DeploymentNode = NonNullable<DeploymentEdge['node']>;

/**
 * Deployment sort direction as emitted by the server-side `DeploymentOrderBy`
 * input. Parent pages own the URL state and pass the current value through.
 */
export type DeploymentSortOrder = 'ASC' | 'DESC';

/**
 * Structured sort value matching the server-side `DeploymentOrderBy` shape.
 * `field` is one of the `DeploymentOrderField` enum values
 * (`NAME`, `CREATED_AT`, `DOMAIN`, `PROJECT`, `RESOURCE_GROUP`, `TAG`, ...).
 */
export interface DeploymentSort {
  field: string;
  order: DeploymentSortOrder;
}

/** Maps BAITable column keys (camelCase) → server-side enum field. */
const COLUMN_KEY_TO_FIELD: Record<string, string> = {
  name: 'NAME',
  createdAt: 'CREATED_AT',
  domainName: 'DOMAIN',
  projectName: 'PROJECT',
  resourceGroup: 'RESOURCE_GROUP',
  tag: 'TAG',
};

const FIELD_TO_COLUMN_KEY: Record<string, string> = _.invert(
  COLUMN_KEY_TO_FIELD,
);

/**
 * BAITable exchanges sort state via a single string (e.g. `'name'`,
 * `'-createdAt'`). Convert that string to the structured `DeploymentSort`
 * shape the parent (and server-side `DeploymentOrderBy`) expects, and vice
 * versa.
 */
const tableOrderToSort = (
  order: string | null | undefined,
): DeploymentSort | undefined => {
  if (!order) return undefined;
  const descending = order.startsWith('-');
  const columnKey = descending ? order.slice(1) : order;
  const field = COLUMN_KEY_TO_FIELD[columnKey];
  if (!field) return undefined;
  return { field, order: descending ? 'DESC' : 'ASC' };
};

const sortToTableOrder = (
  sort: DeploymentSort | undefined,
): string | undefined => {
  if (!sort) return undefined;
  const columnKey = FIELD_TO_COLUMN_KEY[sort.field];
  if (!columnKey) return undefined;
  return sort.order === 'DESC' ? `-${columnKey}` : columnKey;
};

/**
 * Safely parse the stringified filter prop into a `GraphQLFilter` object.
 * Invalid JSON and non-object values are treated as "no filter" so the
 * component degrades gracefully when the URL state is malformed.
 */
const parseFilterString = (
  filter: string | undefined,
): GraphQLFilter | undefined => {
  if (!filter) return undefined;
  try {
    const parsed = JSON.parse(filter);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as GraphQLFilter;
    }
    return undefined;
  } catch {
    return undefined;
  }
};

const stringifyFilter = (filter: GraphQLFilter | undefined): string => {
  if (!filter || Object.keys(filter).length === 0) return '';
  return JSON.stringify(filter);
};

export interface DeploymentListProps {
  /**
   * Relay fragment reference for a `ModelDeploymentConnection`. The owning
   * page (e.g. `DeploymentListPage` / `AdminDeploymentListPage`) passes the
   * connection read from its own query.
   */
  deploymentsFrgmt: DeploymentList_modelDeploymentConnection$key;

  /**
   * Current filter value. Expected to be a JSON-serialized
   * `GraphQLFilter` (as produced by `BAIGraphQLPropertyFilter`). Empty string
   * or `undefined` means "no filter".
   *
   * The parent owns the URL state; this component parses on the way in and
   * serializes on the way out.
   */
  filter?: string;
  setFilter: (value: string) => void;

  /** Current server-side sort (field + direction). */
  sort?: DeploymentSort;
  setSort: (value: DeploymentSort | undefined) => void;

  /** 1-indexed page number. */
  page: number;
  setPage: (value: number) => void;

  /** Rows per page. */
  pageSize: number;
  setPageSize: (value: number) => void;

  /**
   * `'user'` — standard user-owned list (myDeployments / projectDeployments).
   * `'admin'` — admin list. Shows the Owner column and — when the manager
   * supports `model-deployment-extended-filter` (>= 26.4.3) — exposes
   * Domain / Project / Resource Group filters.
   */
  mode: 'user' | 'admin';

  /** Whether the table body should show the loading spinner. */
  loading?: boolean;

  /** Called when a row name is clicked. Receives the deployment global ID. */
  onRowClick?: (deploymentId: string) => void;
}

const DeploymentList: React.FC<DeploymentListProps> = ({
  deploymentsFrgmt,
  filter,
  setFilter,
  sort,
  setSort,
  page,
  setPage,
  pageSize,
  setPageSize,
  mode,
  loading,
  onRowClick,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();

  const connection = useFragment(
    graphql`
      fragment DeploymentList_modelDeploymentConnection on ModelDeploymentConnection {
        count
        edges {
          node {
            id
            metadata {
              name
              status
              createdAt
              domainName
              projectId
            }
            replicaState {
              desiredReplicaCount
            }
            totalReplicas: replicas {
              count
            }
            runningReplicas: replicas(
              filter: { status: { equals: RUNNING } }
            ) {
              count
            }
            currentRevision @since(version: "26.4.3") {
              id
              modelMountConfig {
                vfolder {
                  id
                  name
                }
              }
            }
            ...DeploymentOwnerInfo_deployment
          }
        }
      }
    `,
    deploymentsFrgmt,
  );

  const deployments = filterOutNullAndUndefined(
    _.map(connection?.edges, 'node'),
  );
  const totalCount = connection?.count ?? 0;

  const isAdminMode = mode === 'admin';
  const supportsExtendedFilter =
    baiClient?.supports('model-deployment-extended-filter') ?? false;

  const filterValue = parseFilterString(filter);

  const baseFilterProperties = [
    {
      key: 'name',
      propertyLabel: t('deployment.filter.Name'),
      type: 'string' as const,
    },
    {
      key: 'tags',
      propertyLabel: t('deployment.filter.Tags'),
      type: 'string' as const,
    },
    {
      key: 'endpointUrl',
      propertyLabel: t('deployment.filter.EndpointUrl'),
      type: 'string' as const,
    },
  ];

  const extendedAdminFilterProperties =
    isAdminMode && supportsExtendedFilter
      ? [
          {
            key: 'domainName',
            propertyLabel: t('deployment.filter.DomainName'),
            type: 'string' as const,
          },
          {
            key: 'resourceGroup',
            propertyLabel: t('deployment.filter.ResourceGroup'),
            type: 'string' as const,
          },
          {
            key: 'createdAt',
            propertyLabel: t('deployment.filter.CreatedAt'),
            type: 'datetime' as const,
            operators: ['after' as const, 'before' as const],
            defaultOperator: 'after' as const,
          },
        ]
      : [];

  const filterProperties = [
    ...baseFilterProperties,
    ...extendedAdminFilterProperties,
  ];

  const columns: BAIColumnType<DeploymentNode>[] = filterOutEmpty([
    {
      key: 'name',
      title: t('deployment.Name'),
      dataIndex: ['metadata', 'name'],
      sorter: true,
      fixed: 'left' as const,
      render: (_text, row) => {
        const name = row.metadata?.name ?? '-';
        if (!onRowClick) {
          return <Typography.Text>{name}</Typography.Text>;
        }
        return (
          <Typography.Link
            onClick={() => onRowClick(row.id)}
            style={{ maxWidth: 240 }}
          >
            {name}
          </Typography.Link>
        );
      },
    },
    {
      key: 'status',
      title: t('deployment.filter.Status'),
      render: (_text, row) => {
        const status = row.metadata?.status as DeploymentStatus | undefined;
        if (!status) return '-';
        return <DeploymentStatusTag status={status} />;
      },
    },
    {
      key: 'replicaSummary',
      title: t('deployment.ReplicaSummary'),
      render: (_text, row) => {
        const running = row.runningReplicas?.count ?? 0;
        const desired = row.replicaState?.desiredReplicaCount ?? 0;
        const total = row.totalReplicas?.count ?? desired;
        // Prefer desired count as the denominator so ongoing (scaling)
        // deployments still surface the intended replica target. Fall back
        // to the observed total if desired is not reported.
        const denominator = desired > 0 ? desired : total;
        return (
          <Typography.Text>
            {t('deployment.HealthySummary', {
              healthy: running,
              total: denominator,
            })}
          </Typography.Text>
        );
      },
    },
    {
      key: 'model',
      title: t('deployment.Model'),
      render: (_text, row) => {
        const modelName =
          row.currentRevision?.modelMountConfig?.vfolder?.name ?? null;
        if (!modelName) return <Typography.Text type="secondary">-</Typography.Text>;
        return (
          <Typography.Text
            ellipsis={{ tooltip: modelName }}
            style={{ maxWidth: 200 }}
          >
            {modelName}
          </Typography.Text>
        );
      },
    },
    {
      key: 'createdAt',
      title: t('deployment.CreatedAt'),
      dataIndex: ['metadata', 'createdAt'],
      sorter: true,
      render: (_text, row) => {
        const createdAt = row.metadata?.createdAt;
        return createdAt ? dayjs(createdAt).format('ll LT') : '-';
      },
    },
    isAdminMode && {
      key: 'owner',
      title: t('deployment.Owner'),
      render: (_text, row) => <DeploymentOwnerInfo deploymentFrgmt={row} />,
    },
  ]);

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIGraphQLPropertyFilter
        style={{ marginBottom: token.marginXS }}
        filterProperties={filterProperties}
        value={filterValue}
        onChange={(next) => {
          setFilter(stringifyFilter(next));
          // Reset pagination when filters change.
          setPage(1);
        }}
      />
      <BAITable<DeploymentNode>
        rowKey="id"
        scroll={{ x: 'max-content' }}
        loading={loading}
        dataSource={deployments}
        columns={columns}
        showSorterTooltip={false}
        order={sortToTableOrder(sort)}
        onChangeOrder={(order) => {
          setSort(tableOrderToSort(order));
        }}
        pagination={{
          current: page,
          pageSize,
          total: totalCount,
          onChange: (nextPage, nextPageSize) => {
            if (nextPage !== page) setPage(nextPage);
            if (nextPageSize !== pageSize) setPageSize(nextPageSize);
          },
        }}
      />
    </BAIFlex>
  );
};

export default DeploymentList;
