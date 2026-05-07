/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  AdminDeploymentListPageQuery,
  DeploymentFilter,
  DeploymentOrderField,
  DeploymentStatus,
  OrderDirection,
} from '../__generated__/AdminDeploymentListPageQuery.graphql';
import { DeploymentSettingModal_deployment$key } from '../__generated__/DeploymentSettingModal_deployment.graphql';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import DeploymentList, {
  availableDeploymentOrderValues,
  tableOrderToSort,
  type DeploymentOrderValue,
  type DeploymentStatusCategory,
} from '../components/DeploymentList';
import DeploymentSettingModal from '../components/DeploymentSettingModal';
import PrometheusPresetTab from '../components/PrometheusPresetTab';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import AdminDeploymentPresetListPage from './AdminDeploymentPresetListPage';
import AdminModelCardListPage from './AdminModelCardListPage';
import { Skeleton } from 'antd';
import type { CardTabListType } from 'antd/es/card';
import {
  BAICard,
  BAIFetchKeyButton,
  filterOutEmpty,
  INITIAL_FETCH_KEY,
  toLocalId,
  useFetchKey,
} from 'backend.ai-ui';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useSearchParams } from 'react-router-dom';

const parseFilterVariable = (
  filter: string | null | undefined,
): DeploymentFilter | undefined => {
  if (!filter) return undefined;
  try {
    const parsed = JSON.parse(filter);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as DeploymentFilter;
    }
    return undefined;
  } catch {
    return undefined;
  }
};

const AdminDeploymentListPageContent: React.FC = () => {
  'use memo';
  const webUINavigate = useWebUINavigate();
  const [editingDeploymentFrgmt, setEditingDeploymentFrgmt] =
    useState<DeploymentSettingModal_deployment$key | null>(null);

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
      filter: parseAsString.withDefault(''),
      order: parseAsStringLiteral(availableDeploymentOrderValues),
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

  const sort = tableOrderToSort(queryParams.order);
  const finishedStatuses: ReadonlyArray<DeploymentStatus> = ['STOPPED'];
  const statusCategoryFilter: DeploymentFilter =
    queryParams.statusCategory === 'finished'
      ? { status: { in: finishedStatuses } }
      : { status: { notIn: finishedStatuses } };
  const queryVariables = {
    filter: {
      ...parseFilterVariable(queryParams.filter),
      ...statusCategoryFilter,
    },
    orderBy: sort
      ? [
          {
            field: sort.field as DeploymentOrderField,
            direction: sort.order as OrderDirection,
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
          ...DeploymentList_modelDeploymentConnection
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

  const isLoading =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  return (
    <>
      <DeploymentList
        mode="admin"
        deploymentsFrgmt={adminDeployments}
        filter={queryParams.filter}
        setFilter={(value) => {
          setQueryParams({ filter: value || null });
          setTablePaginationOption({ current: 1 });
        }}
        order={queryParams.order ?? undefined}
        onChangeOrder={(order) => {
          setQueryParams({ order: (order as DeploymentOrderValue) ?? null });
        }}
        statusCategory={queryParams.statusCategory}
        onStatusCategoryChange={(value) => {
          setQueryParams({ statusCategory: value });
          setTablePaginationOption({ current: 1 });
        }}
        pagination={{
          ...tablePaginationOption,
          onChange: (current, pageSize) => {
            setTablePaginationOption({ current, pageSize });
          },
        }}
        tableSettings={{
          columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
        loading={isLoading}
        onRowClick={(deploymentId) => {
          webUINavigate(`/deployments/${toLocalId(deploymentId)}`);
        }}
        onEditClick={(frgmt) => setEditingDeploymentFrgmt(frgmt)}
        onDeleteComplete={updateFetchKey}
        toolbarEnd={
          <BAIFetchKeyButton
            value={fetchKey}
            onChange={updateFetchKey}
            autoUpdateDelay={15_000}
            loading={isLoading}
          />
        }
      />
      <DeploymentSettingModal
        open={!!editingDeploymentFrgmt}
        deploymentFrgmt={editingDeploymentFrgmt}
        onRequestClose={(success) => {
          setEditingDeploymentFrgmt(null);
          if (success) updateFetchKey();
        }}
      />
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
