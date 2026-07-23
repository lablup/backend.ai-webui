/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminDeploymentDeleteMutation } from '../__generated__/AdminDeploymentDeleteMutation.graphql';
import type {
  AdminDeploymentQuery as AdminDeploymentQueryType,
  DeploymentFilter,
  DeploymentOrderField,
  DeploymentStatus,
  OrderDirection,
} from '../__generated__/AdminDeploymentQuery.graphql';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import AutoUpdateFetchKeyButton from './AutoUpdateFetchKeyButton';
import BAIRadioGroup from './BAIRadioGroup';
import DeploymentRevisionDetailDrawer from './DeploymentRevisionDetailDrawer';
import DeploymentSettingModal from './DeploymentSettingModal';
import { DeleteFilled } from '@ant-design/icons';
import { App, Typography } from 'antd';
import {
  BAIDeleteConfirmModal,
  BAIDeploymentTagChips,
  BAIFlex,
  BAIGraphQLFilterProperty,
  BAIGraphQLPropertyFilter,
  BAIModelDeploymentNodes,
  BAINameActionCell,
  type BAITableSettings,
  BAIUnmountAfterClose,
  DeploymentOrderValue,
  filterOutEmpty,
  filterOutNullAndUndefined,
  isDeploymentInStoppedCategory,
  isValidUUID,
  parseDeploymentOrder,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { SquarePenIcon } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  PreloadedQuery,
  useMutation,
  usePreloadedQuery,
  UseQueryLoaderLoadQueryOptions,
} from 'react-relay';

type DeploymentStatusCategory = 'running' | 'finished';

export const AdminDeploymentQuery = graphql`
  query AdminDeploymentQuery(
    $filter: DeploymentFilter
    $orderBy: [DeploymentOrderBy!]
    $limit: Int
    $offset: Int
  ) {
    adminDeployments(
      filter: $filter
      orderBy: $orderBy
      limit: $limit
      offset: $offset
    ) {
      count
      edges {
        node {
          id
          ...BAIModelDeploymentNodesFragment
          ...DeploymentSettingModal_deployment
          metadata {
            name
            status
          }
          currentRevision @since(version: "26.4.3") {
            id
            revisionNumber
            ...DeploymentRevisionDetail_revision
          }
        }
      }
    }
  }
`;

export interface AdminDeploymentProps {
  queryRef: PreloadedQuery<AdminDeploymentQueryType>;
  onReload: (
    variables: AdminDeploymentQueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void;
  tableSettings: BAITableSettings;
}

const finishedStatuses: ReadonlyArray<DeploymentStatus> = ['STOPPED'];
const statusCategoryFilterFor = (
  category: DeploymentStatusCategory,
): DeploymentFilter =>
  category === 'finished'
    ? { status: { in: finishedStatuses } }
    : { status: { notIn: finishedStatuses } };

const AdminDeployment = ({
  queryRef,
  onReload,
  tableSettings,
}: AdminDeploymentProps) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const baiClient = useSuspendedBackendaiClient();
  const webUINavigate = useWebUINavigate();

  const [editingDeploymentId, setEditingDeploymentId] = useState<string | null>(
    null,
  );
  const [deletingDeploymentId, setDeletingDeploymentId] = useState<
    string | null
  >(null);
  const [drawerRevisionId, setDrawerRevisionId] = useState<string | null>(null);

  const supportsExtendedFilter = baiClient.supports(
    'model-deployment-extended-filter',
  );

  const mergedFilter = queryRef.variables.filter as DeploymentFilter | undefined;
  const statusCategory: DeploymentStatusCategory = mergedFilter?.status?.in?.includes(
    'STOPPED',
  )
    ? 'finished'
    : 'running';
  const userFilter = _.omit(mergedFilter, 'status') as DeploymentFilter;

  const orderEntry = queryRef.variables.orderBy?.[0];
  const order = orderEntry
    ? (`${orderEntry.direction === 'DESC' ? '-' : ''}${orderEntry.field}` as DeploymentOrderValue)
    : undefined;

  const pageSize = queryRef.variables.limit ?? 10;
  const offset = queryRef.variables.offset ?? 0;
  const current = pageSize ? Math.floor(offset / pageSize) + 1 : 1;

  const deferredQueryRef = useDeferredValue(queryRef);
  const isRefetching = deferredQueryRef !== queryRef;

  const { adminDeployments } = usePreloadedQuery<AdminDeploymentQueryType>(
    AdminDeploymentQuery,
    deferredQueryRef,
  );

  const deploymentNodes = filterOutNullAndUndefined(
    _.map(adminDeployments?.edges, 'node'),
  );
  const total = adminDeployments?.count ?? 0;
  const editingDeployment =
    editingDeploymentId == null
      ? null
      : (deploymentNodes.find((n) => n.id === editingDeploymentId) ?? null);
  const deletingDeployment =
    deletingDeploymentId == null
      ? null
      : (deploymentNodes.find((n) => n.id === deletingDeploymentId) ?? null);
  const drawerRevision =
    drawerRevisionId == null
      ? null
      : (deploymentNodes.find((n) => n.id === drawerRevisionId)
          ?.currentRevision ?? null);

  const [commitDeleteMutation, isInFlightDeleteMutation] =
    useMutation<AdminDeploymentDeleteMutation>(graphql`
      mutation AdminDeploymentDeleteMutation(
        $input: DeleteDeploymentInput!
      ) {
        deleteModelDeployment(input: $input) {
          id
        }
      }
    `);

  const uuidRule = {
    message: t('general.InvalidUUID'),
    validate: (value: string) => isValidUUID(value.toLowerCase()),
  };

  const filterProperties: Array<BAIGraphQLFilterProperty> = filterOutEmpty([
    {
      key: 'name',
      propertyLabel: t('deployment.filter.Name'),
      type: 'string',
    },
    {
      key: 'tags',
      propertyLabel: t('deployment.filter.Tags'),
      type: 'string',
    },
    {
      key: 'endpointUrl',
      propertyLabel: t('deployment.filter.EndpointUrl'),
      type: 'string',
    },
    {
      key: 'openToPublic',
      propertyLabel: t('deployment.filter.OpenToPublic'),
      type: 'boolean',
    },
    supportsExtendedFilter && {
      key: 'domainName',
      propertyLabel: t('deployment.filter.DomainName'),
      type: 'string' as const,
    },
    supportsExtendedFilter && {
      key: 'resourceGroup',
      propertyLabel: t('deployment.filter.ResourceGroup'),
      type: 'string' as const,
    },
    supportsExtendedFilter && {
      key: 'projectId',
      propertyLabel: t('deployment.filter.ProjectId'),
      type: 'uuid' as const,
      fixedOperator: 'equals' as const,
      rule: uuidRule,
    },
    supportsExtendedFilter && {
      key: 'createdAt',
      propertyLabel: t('deployment.filter.CreatedAt'),
      type: 'datetime' as const,
      operators: ['after' as const, 'before' as const],
      defaultOperator: 'after' as const,
    },
    supportsExtendedFilter && {
      key: 'destroyedAt',
      propertyLabel: t('deployment.filter.DestroyedAt'),
      type: 'datetime' as const,
      operators: ['after' as const, 'before' as const],
      defaultOperator: 'after' as const,
    },
  ]);

  return (
    <>
      <BAIFlex direction="column" align="stretch" gap="sm">
        <BAIFlex justify="between" wrap="wrap" gap="sm">
          <BAIFlex gap="sm" align="start" wrap="wrap" style={{ flexShrink: 1 }}>
            <BAIRadioGroup
              value={statusCategory}
              onChange={(e) => {
                const nextCategory = e.target
                  .value as DeploymentStatusCategory;
                onReload(
                  {
                    ...queryRef.variables,
                    filter: {
                      ...userFilter,
                      ...statusCategoryFilterFor(nextCategory),
                    },
                    offset: 0,
                  },
                  { fetchPolicy: 'network-only' },
                );
              }}
              options={[
                { label: t('deployment.Running'), value: 'running' },
                {
                  label: t('deployment.status.Terminated'),
                  value: 'finished',
                },
              ]}
            />
            <BAIGraphQLPropertyFilter<DeploymentFilter>
              filterProperties={filterProperties}
              value={userFilter ?? undefined}
              onChange={(value) => {
                onReload(
                  {
                    ...queryRef.variables,
                    filter: {
                      ...(value ?? {}),
                      ...statusCategoryFilterFor(statusCategory),
                    },
                    offset: 0,
                  },
                  { fetchPolicy: 'network-only' },
                );
              }}
            />
          </BAIFlex>
          <AutoUpdateFetchKeyButton
            settingId="admin-deployment-list"
            defaultAutoUpdateDelay={15_000}
            onChange={() =>
              onReload(queryRef.variables, { fetchPolicy: 'network-only' })
            }
            loading={isRefetching}
          />
        </BAIFlex>
        <BAIModelDeploymentNodes
          deploymentsFrgmt={deploymentNodes}
          loading={isRefetching}
          order={order}
          onChangeOrder={(nextOrder) => {
            const sort = parseDeploymentOrder(nextOrder ?? undefined);
            onReload(
              {
                ...queryRef.variables,
                orderBy: sort
                  ? [
                      {
                        field: sort.field as DeploymentOrderField,
                        direction: sort.direction as OrderDirection,
                      },
                    ]
                  : undefined,
                offset: 0,
              },
              { fetchPolicy: 'network-only' },
            );
          }}
          pagination={{
            current,
            pageSize,
            total,
            onChange: (nextCurrent, nextPageSize) =>
              onReload(
                {
                  ...queryRef.variables,
                  limit: nextPageSize,
                  offset:
                    nextCurrent > 1 ? (nextCurrent - 1) * nextPageSize : 0,
                },
                { fetchPolicy: 'network-only' },
              ),
          }}
          tableSettings={tableSettings}
          // Drop the replicas / currentRevisionId / preferredDomainName /
          // strategyType columns entirely and show `owner` by default,
          // alongside name/currentRevisionNumber/status/replicaSummary/
          // model/createdAt.
          customizeColumns={(base) => {
            const allowedKeys = [
              'name',
              'currentRevisionNumber',
              'status',
              'replicaSummary',
              'model',
              'createdAt',
              'owner',
              'id',
              'endpointUrl',
              'tags',
              'updatedAt',
              'openToPublic',
              'resourceGroup',
              'domainName',
              'projectId',
            ];
            const defaultVisibleKeys = new Set([
              'name',
              'currentRevisionNumber',
              'status',
              'replicaSummary',
              'model',
              'createdAt',
              'owner',
            ]);
            return base
              .filter((col) => allowedKeys.includes(col.key as string))
              .map((col) => {
                if (col.key === 'name') {
                  return {
                    ...col,
                    render: (_value, record) => {
                      const destroying = isDeploymentInStoppedCategory(
                        record.metadata?.status,
                      );
                      return (
                        <BAINameActionCell
                          title={record.metadata?.name ?? '-'}
                          onTitleClick={() =>
                            webUINavigate(
                              `/admin-deployments/${toLocalId(record.id)}`,
                            )
                          }
                          copyable
                          showActions="always"
                          actions={[
                            {
                              key: 'edit',
                              title: t('deployment.EditDeployment'),
                              icon: <SquarePenIcon />,
                              disabled: destroying,
                              onClick: () => setEditingDeploymentId(record.id),
                            },
                            {
                              key: 'delete',
                              title: t('deployment.DeleteDeployment'),
                              icon: <DeleteFilled />,
                              type: 'danger',
                              disabled: destroying,
                              onClick: () => setDeletingDeploymentId(record.id),
                            },
                          ]}
                        />
                      );
                    },
                  };
                }
                const defaultHidden = !defaultVisibleKeys.has(
                  col.key as string,
                );
                if (col.key === 'currentRevisionNumber') {
                  return {
                    ...col,
                    defaultHidden,
                    render: (_value, record) => {
                      const revisionNumber = deploymentNodes.find(
                        (n) => n.id === record.id,
                      )?.currentRevision?.revisionNumber;
                      if (revisionNumber == null) {
                        return (
                          <Typography.Text type="secondary">-</Typography.Text>
                        );
                      }
                      return (
                        <Typography.Link
                          onClick={() => setDrawerRevisionId(record.id)}
                        >{`#${revisionNumber}`}</Typography.Link>
                      );
                    },
                  };
                }
                if (col.key === 'tags') {
                  return {
                    ...col,
                    defaultHidden,
                    render: (_value, record) => (
                      <BAIDeploymentTagChips
                        metadataFrgmt={record.metadata}
                        stopRowClick
                        onTagClick={(tag) => {
                          webUINavigate({
                            pathname: '/admin-deployments',
                            search: new URLSearchParams({
                              filter: JSON.stringify({
                                tags: { iContains: tag },
                              }),
                            }).toString(),
                          });
                        }}
                        fallback={
                          <Typography.Text type="secondary">-</Typography.Text>
                        }
                      />
                    ),
                  };
                }
                return { ...col, defaultHidden };
              });
          }}
        />
      </BAIFlex>
      <DeploymentSettingModal
        open={!!editingDeployment}
        deploymentFrgmt={editingDeployment ?? null}
        onRequestClose={(success) => {
          setEditingDeploymentId(null);
          if (success) {
            onReload(queryRef.variables, { fetchPolicy: 'network-only' });
          }
        }}
      />
      <BAIDeleteConfirmModal
        open={!!deletingDeployment}
        title={t('deployment.DeleteDeployment')}
        target={t('deployment.Deployment')}
        items={
          deletingDeployment
            ? [
                {
                  key: deletingDeployment.id,
                  label: deletingDeployment.metadata?.name ?? '',
                },
              ]
            : []
        }
        confirmText={deletingDeployment?.metadata?.name ?? ''}
        requireConfirmInput
        inputProps={{
          placeholder: deletingDeployment?.metadata?.name ?? '',
        }}
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
              setDeletingDeploymentId(null);
              onReload(queryRef.variables, { fetchPolicy: 'network-only' });
            },
            onError: (error) => {
              logger.error('Failed to delete deployment', error);
              message.error(t('deployment.FailedToDeleteDeployment'));
            },
          });
        }}
        onCancel={() => setDeletingDeploymentId(null)}
      />
      <BAIUnmountAfterClose>
        <DeploymentRevisionDetailDrawer
          open={!!drawerRevision}
          revisionFrgmt={drawerRevision}
          onClose={() => setDrawerRevisionId(null)}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default AdminDeployment;
