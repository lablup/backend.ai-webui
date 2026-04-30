/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentListDeleteMutation } from '../__generated__/DeploymentListDeleteMutation.graphql';
import {
  DeploymentList_modelDeploymentConnection$data,
  DeploymentList_modelDeploymentConnection$key,
} from '../__generated__/DeploymentList_modelDeploymentConnection.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import BAIRadioGroup from './BAIRadioGroup';
import DeploymentOwnerInfo from './DeploymentOwnerInfo';
import DeploymentStatusTag, { DeploymentStatus } from './DeploymentStatusTag';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Alert, App, Tag, Typography, theme } from 'antd';
import {
  BAIConfirmModalWithInput,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAITable,
  filterOutEmpty,
  filterOutNullAndUndefined,
  toLocalId,
  useBAILogger,
  type BAIColumnType,
  type BAINameActionCellAction,
  type BAITableProps,
  type GraphQLFilter,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

type DeploymentEdge = NonNullable<
  NonNullable<DeploymentList_modelDeploymentConnection$data['edges']>[number]
>;
type DeploymentNode = NonNullable<DeploymentEdge['node']>;

interface DeploymentSort {
  field: string;
  order: 'ASC' | 'DESC';
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

/** All valid order strings accepted by BAITable for deployments. */
export const availableDeploymentOrderValues = [
  'name',
  '-name',
  'createdAt',
  '-createdAt',
] as const;

export type DeploymentOrderValue =
  (typeof availableDeploymentOrderValues)[number];

/**
 * Convert a BAITable order string (e.g. `'-createdAt'`) to the structured
 * `DeploymentSort` shape expected by the server `DeploymentOrderBy` input.
 * Returns `undefined` for unrecognised keys so callers can safely skip
 * building the `orderBy` variable.
 */
export const tableOrderToSort = (
  order: string | null | undefined,
): DeploymentSort | undefined => {
  if (!order) return undefined;
  const descending = order.startsWith('-');
  const columnKey = descending ? order.slice(1) : order;
  const field = COLUMN_KEY_TO_FIELD[columnKey];
  if (!field) return undefined;
  return { field, order: descending ? 'DESC' : 'ASC' };
};

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

export type DeploymentStatusCategory = 'running' | 'finished';

export interface DeploymentListProps extends Omit<
  BAITableProps<DeploymentNode>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  deploymentsFrgmt: DeploymentList_modelDeploymentConnection$key;
  filter?: string;
  setFilter: (value: string) => void;
  onChangeOrder?: (order: string | null) => void;
  statusCategory?: DeploymentStatusCategory;
  onStatusCategoryChange?: (value: DeploymentStatusCategory) => void;
  /**
   * `'user'` — standard user-owned list (myDeployments / projectDeployments).
   * `'admin'` — admin list. Shows the Owner column and — when the manager
   * supports `model-deployment-extended-filter` (>= 26.4.3) — exposes
   * Domain / Project / Resource Group filters.
   */
  mode: 'user' | 'admin';
  /** Called when a row name is clicked. Receives the deployment global ID. */
  onRowClick?: (deploymentId: string) => void;
  /** Called when the edit action button is clicked. Receives the deployment global ID. */
  onEditClick?: (deploymentId: string) => void;
  /** Called after a deployment is successfully deleted. Use to refresh the list. */
  onDeleteComplete?: () => void;
  /** Extra elements rendered at the end of the toolbar row (e.g. refresh + create buttons). */
  toolbarEnd?: React.ReactNode;
}

const DeploymentList: React.FC<DeploymentListProps> = ({
  deploymentsFrgmt,
  filter,
  setFilter,
  onChangeOrder,
  statusCategory = 'running',
  onStatusCategoryChange,
  mode,
  onRowClick,
  onEditClick,
  onDeleteComplete,
  toolbarEnd,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const { logger } = useBAILogger();
  const baiClient = useSuspendedBackendaiClient();
  const [deletingDeployment, setDeletingDeployment] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [commitDeleteMutation, isInFlightDeleteMutation] =
    useMutation<DeploymentListDeleteMutation>(graphql`
      mutation DeploymentListDeleteMutation($input: DeleteDeploymentInput!) {
        deleteModelDeployment(input: $input) {
          id
        }
      }
    `);

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
              tags
            }
            networkAccess {
              endpointUrl
            }
            replicaState {
              desiredReplicaCount
            }
            totalReplicas: replicas {
              count
            }
            runningReplicas: replicas(filter: { status: { equals: RUNNING } }) {
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
      dataIndex: 'name',
      sorter: true,
      fixed: 'left' as const,
      render: (_text, row) => {
        const name = row.metadata?.name ?? '-';
        const isDestroying = ['STOPPING', 'STOPPED', 'TERMINATED'].includes(
          row.metadata?.status ?? '',
        );
        const actions: BAINameActionCellAction[] = [];
        if (onEditClick) {
          actions.push({
            key: 'edit',
            title: t('deployment.EditDeployment'),
            icon: <EditOutlined />,
            disabled: isDestroying,
            onClick: () => onEditClick(row.id),
          });
        }
        actions.push({
          key: 'delete',
          title: t('deployment.DeleteDeployment'),
          icon: <DeleteOutlined />,
          type: 'danger',
          disabled: isDestroying,
          onClick: () => setDeletingDeployment({ id: row.id, name }),
        });
        return (
          <BAINameActionCell
            title={name}
            onTitleClick={onRowClick ? () => onRowClick(row.id) : undefined}
            actions={actions}
            showActions="always"
          />
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
        if (!modelName)
          return <Typography.Text type="secondary">-</Typography.Text>;
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
      key: 'endpointUrl',
      title: t('deployment.EndpointUrl'),
      render: (_text, row) => {
        const url = row.networkAccess?.endpointUrl;
        if (!url) return <Typography.Text type="secondary">-</Typography.Text>;
        return (
          <Typography.Link href={url} target="_blank" rel="noreferrer">
            {url}
          </Typography.Link>
        );
      },
    },
    {
      key: 'tags',
      title: t('deployment.Tags'),
      render: (_text, row) => {
        const tags = row.metadata?.tags ?? [];
        if (tags.length === 0)
          return <Typography.Text type="secondary">-</Typography.Text>;
        return (
          <BAIFlex wrap="wrap" gap="xs">
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </BAIFlex>
        );
      },
    },
    {
      key: 'createdAt',
      title: t('deployment.CreatedAt'),
      dataIndex: 'createdAt',
      sorter: true,
      render: (_text, row) => {
        const createdAt = row.metadata?.createdAt;
        return createdAt ? dayjs(createdAt).format('ll LT') : '-';
      },
    },
    isAdminMode && {
      key: 'domainName',
      title: t('deployment.Domain'),
      render: (_text, row) => {
        const domain = row.metadata?.domainName;
        return domain ? (
          <Typography.Text>{domain}</Typography.Text>
        ) : (
          <Typography.Text type="secondary">-</Typography.Text>
        );
      },
    },
    isAdminMode && {
      key: 'owner',
      title: t('deployment.Owner'),
      render: (_text, row) => <DeploymentOwnerInfo deploymentFrgmt={row} />,
    },
  ]);

  // Merge fragment-derived total into the pagination config supplied by the
  // parent so callers don't need to separately query for count.
  const paginationWithTotal =
    tableProps.pagination === false
      ? (false as const)
      : { ...tableProps.pagination, total: totalCount };

  return (
    <>
      <BAIFlex direction="column" align="stretch" gap="sm">
        <BAIFlex justify="between" wrap="wrap" gap="sm">
          <BAIFlex gap="sm" align="start" wrap="wrap" style={{ flexShrink: 1 }}>
            <BAIRadioGroup
              value={statusCategory}
              onChange={(e) => onStatusCategoryChange?.(e.target.value)}
              options={[
                { label: t('deployment.Running'), value: 'running' },
                { label: t('deployment.status.Terminated'), value: 'finished' },
              ]}
            />
            <BAIGraphQLPropertyFilter
              filterProperties={filterProperties}
              value={filterValue}
              onChange={(next) => {
                setFilter(stringifyFilter(next));
              }}
            />
          </BAIFlex>
          {toolbarEnd}
        </BAIFlex>
        <div style={{ overflowX: 'auto' }}>
          <BAITable<DeploymentNode>
            rowKey="id"
            scroll={{ x: 'max-content' }}
            showSorterTooltip={false}
            locale={{ emptyText: t('deployment.NoDeployments') }}
            {...tableProps}
            dataSource={deployments}
            columns={columns}
            onChangeOrder={(order) => {
              onChangeOrder?.(order || null);
            }}
            pagination={paginationWithTotal}
          />
        </div>
      </BAIFlex>
      <BAIConfirmModalWithInput
        open={!!deletingDeployment}
        title={t('deployment.DeleteDeployment')}
        content={
          <BAIFlex direction="column" gap="md" align="stretch">
            <Alert type="warning" title={t('dialog.warning.CannotBeUndone')} />
            <BAIFlex>
              <Typography.Text style={{ marginRight: token.marginXXS }}>
                {t('dialog.TypeNameToConfirmDeletion')}
              </Typography.Text>
              (
              <Typography.Text code>{deletingDeployment?.name}</Typography.Text>
              )
            </BAIFlex>
          </BAIFlex>
        }
        confirmText={deletingDeployment?.name ?? ''}
        inputProps={{ placeholder: deletingDeployment?.name ?? '' }}
        okText={t('button.Delete')}
        okButtonProps={{ loading: isInFlightDeleteMutation }}
        onOk={() => {
          if (!deletingDeployment) return;
          commitDeleteMutation({
            variables: {
              input: {
                id: toLocalId(deletingDeployment.id) ?? deletingDeployment.id,
              },
            },
            onCompleted: (_response, errors) => {
              if (errors && errors.length > 0) {
                logger.error('Failed to delete deployment', errors);
                message.error(t('deployment.FailedToDeleteDeployment'));
                return;
              }
              message.success(t('deployment.DeploymentDeleted'));
              setDeletingDeployment(null);
              onDeleteComplete?.();
            },
            onError: (error) => {
              logger.error('Failed to delete deployment', error);
              message.error(t('deployment.FailedToDeleteDeployment'));
            },
          });
        }}
        onCancel={() => setDeletingDeployment(null)}
      />
    </>
  );
};

export default DeploymentList;
