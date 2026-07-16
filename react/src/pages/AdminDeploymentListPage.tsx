/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminDeploymentListPageDeleteMutation } from '../__generated__/AdminDeploymentListPageDeleteMutation.graphql';
import type {
  AdminDeploymentListPageQuery,
  DeploymentFilter,
  DeploymentOrderField,
  DeploymentStatus,
  OrderDirection,
} from '../__generated__/AdminDeploymentListPageQuery.graphql';
import type { DeploymentRevisionDetail_revision$key } from '../__generated__/DeploymentRevisionDetail_revision.graphql';
import AutoUpdateFetchKeyButton from '../components/AutoUpdateFetchKeyButton';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import BAIRadioGroup from '../components/BAIRadioGroup';
import DeploymentRevisionDetailDrawer from '../components/DeploymentRevisionDetailDrawer';
import DeploymentSettingModal from '../components/DeploymentSettingModal';
import PrometheusPresetTab from '../components/PrometheusPresetTab';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import AdminDeploymentPresetListPage from './AdminDeploymentPresetListPage';
import AdminModelCardListPage from './AdminModelCardListPage';
import { DeleteFilled } from '@ant-design/icons';
import { App, Skeleton, Typography } from 'antd';
import type { CardTabListType } from 'antd/es/card';
import {
  BAICard,
  BAIDeleteConfirmModal,
  BAIDeploymentTagChips,
  BAIFlex,
  BAIGraphQLFilterProperty,
  BAIGraphQLPropertyFilter,
  BAIModelDeploymentNodes,
  BAINameActionCell,
  BAIUnmountAfterClose,
  DeploymentOrderValue,
  INITIAL_FETCH_KEY,
  availableDeploymentSorterValues,
  filterOutEmpty,
  filterOutNullAndUndefined,
  isDeploymentInStoppedCategory,
  isValidUUID,
  parseDeploymentOrder,
  toLocalId,
  useBAILogger,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { SquarePenIcon } from 'lucide-react';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { useSearchParams } from 'react-router-dom';

type DeploymentStatusCategory = 'running' | 'finished';

const AdminDeploymentListPageContent: React.FC = () => {
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
  const [drawerRevisionFrgmt, setDrawerRevisionFrgmt] =
    useState<DeploymentRevisionDetail_revision$key | null>(null);

  const supportsExtendedFilter = baiClient.supports(
    'model-deployment-extended-filter',
  );

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQueryParams] = useQueryStates(
    {
      filter: parseAsJson<DeploymentFilter>((value) =>
        typeof value === 'object' && value !== null && !Array.isArray(value)
          ? (value as DeploymentFilter)
          : ({} as DeploymentFilter),
      ),
      order: parseAsStringLiteral(availableDeploymentSorterValues),
      statusCategory: parseAsStringLiteral<DeploymentStatusCategory>([
        'running',
        'finished',
      ]).withDefault('running'),
    },
    { history: 'replace' },
  );

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.AdminDeploymentListPage',
  );

  const [fetchKey, updateFetchKey] = useFetchKey();

  const finishedStatuses: ReadonlyArray<DeploymentStatus> = ['STOPPED'];
  const statusCategoryFilter: DeploymentFilter =
    queryParams.statusCategory === 'finished'
      ? { status: { in: finishedStatuses } }
      : { status: { notIn: finishedStatuses } };

  const sort = parseDeploymentOrder(queryParams.order);
  const queryVariables = {
    filter: {
      ...(queryParams.filter ?? {}),
      ...statusCategoryFilter,
    },
    orderBy: sort
      ? [
          {
            field: sort.field as DeploymentOrderField,
            direction: sort.direction as OrderDirection,
          },
        ]
      : undefined,
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { adminDeployments } = useLazyLoadQuery<AdminDeploymentListPageQuery>(
    graphql`
      query AdminDeploymentListPageQuery(
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
    `,
    deferredQueryVariables,
    {
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
      fetchKey: deferredFetchKey,
    },
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

  const isLoading =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  const [commitDeleteMutation, isInFlightDeleteMutation] =
    useMutation<AdminDeploymentListPageDeleteMutation>(graphql`
      mutation AdminDeploymentListPageDeleteMutation(
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
              value={queryParams.statusCategory}
              onChange={(e) => {
                setQueryParams({ statusCategory: e.target.value });
                setTablePaginationOption({ current: 1 });
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
              value={queryParams.filter ?? undefined}
              onChange={(value) => {
                setQueryParams({ filter: value ?? null });
                setTablePaginationOption({ current: 1 });
              }}
            />
          </BAIFlex>
          <AutoUpdateFetchKeyButton
            settingId="admin-deployment-list"
            defaultAutoUpdateDelay={15_000}
            value={fetchKey}
            onChange={updateFetchKey}
            loading={isLoading}
          />
        </BAIFlex>
        <BAIModelDeploymentNodes
          deploymentsFrgmt={deploymentNodes}
          loading={isLoading}
          order={queryParams.order}
          onChangeOrder={(order) => {
            setQueryParams({ order: (order as DeploymentOrderValue) ?? null });
          }}
          pagination={{
            current: tablePaginationOption.current,
            pageSize: tablePaginationOption.pageSize,
            total,
            onChange: (current, pageSize) =>
              setTablePaginationOption({ current, pageSize }),
          }}
          tableSettings={{
            columnOverrides,
            onColumnOverridesChange: setColumnOverrides,
          }}
          // Mirror the column set the legacy `DeploymentList` (mode="admin")
          // exposed: drop newly-introduced keys (replicas / currentRevisionId
          // / preferredDomainName / strategyType) and restore the original
          // default-visible set, including `owner`.
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
                let next = col;
                if (col.key === 'name') {
                  next = {
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
                } else if (col.key === 'currentRevisionNumber') {
                  next = {
                    ...col,
                    render: (_value, record) => {
                      // `record` here is narrowed to BAIModelDeploymentNodesFragment;
                      // recover the wider node (with `...DeploymentRevisionDetail_revision`
                      // on `currentRevision`) from the page-level query result
                      // so the drawer receives a fragment ref it can consume.
                      const wider = deploymentNodes.find(
                        (n) => n.id === record.id,
                      );
                      const revision = wider?.currentRevision;
                      if (revision?.revisionNumber == null) {
                        return (
                          <Typography.Text type="secondary">-</Typography.Text>
                        );
                      }
                      return (
                        <Typography.Link
                          onClick={() => setDrawerRevisionFrgmt(revision)}
                        >{`#${revision.revisionNumber}`}</Typography.Link>
                      );
                    },
                  };
                } else if (col.key === 'tags') {
                  next = {
                    ...col,
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
                if (col.key === 'name') return next;
                return {
                  ...next,
                  defaultHidden: !defaultVisibleKeys.has(col.key as string),
                };
              });
          }}
        />
      </BAIFlex>
      <DeploymentSettingModal
        open={!!editingDeployment}
        deploymentFrgmt={editingDeployment ?? null}
        onRequestClose={(success) => {
          setEditingDeploymentId(null);
          if (success) updateFetchKey();
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
              updateFetchKey();
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
          open={!!drawerRevisionFrgmt}
          revisionFrgmt={drawerRevisionFrgmt}
          onClose={() => setDrawerRevisionFrgmt(null)}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

const AdminDeploymentListPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'deployments';
  const navigate = useWebUINavigate();
  const baiClient = useSuspendedBackendaiClient();
  const isPrometheusPresetSupported = baiClient.supports(
    'prometheus-query-preset',
  );
  const isDeploymentPresetSupported = baiClient.supports('deployment-preset');

  const tabItems: CardTabListType[] = filterOutEmpty([
    {
      key: 'deployments',
      label: t('webui.menu.Deployments'),
    },
    {
      key: 'model-store-management',
      label: t('adminModelCard.ModelStoreManagement'),
    },
    isPrometheusPresetSupported && {
      key: 'prometheus-preset',
      label: t('webui.menu.PrometheusPreset'),
    },
    isDeploymentPresetSupported && {
      key: 'deployment-presets',
      label: t('adminDeploymentPreset.TabTitle'),
    },
  ]);

  return (
    <BAICard
      variant="borderless"
      activeTabKey={currentTab}
      onTabChange={(key) =>
        navigate({
          pathname: '/admin-deployments',
          search: `?tab=${key}`,
        })
      }
      tabList={tabItems}
    >
      <Suspense fallback={<Skeleton active />}>
        {currentTab === 'deployments' && (
          <BAIErrorBoundary>
            <AdminDeploymentListPageContent />
          </BAIErrorBoundary>
        )}
        {currentTab === 'model-store-management' && (
          <BAIErrorBoundary>
            <AdminModelCardListPage />
          </BAIErrorBoundary>
        )}
        {currentTab === 'prometheus-preset' && isPrometheusPresetSupported && (
          <BAIErrorBoundary>
            <PrometheusPresetTab />
          </BAIErrorBoundary>
        )}
        {currentTab === 'deployment-presets' && isDeploymentPresetSupported && (
          <BAIErrorBoundary>
            <AdminDeploymentPresetListPage />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default AdminDeploymentListPage;
