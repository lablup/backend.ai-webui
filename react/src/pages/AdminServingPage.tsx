/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AdminServingPageQuery } from '../__generated__/AdminServingPageQuery.graphql';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import BAIRadioGroup from '../components/BAIRadioGroup';
import EndpointList from '../components/EndpointList';
import { useWebUINavigate, useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useBAIPaginationOptionStateOnSearchParamLegacy } from '../hooks/reactPaginationQueryOptions';
import { Skeleton } from 'antd';
import {
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  BAIPropertyFilter,
  filterOutEmpty,
  mergeFilterValues,
  useUpdatableState,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsString, useQueryStates } from 'nuqs';
import React, { Suspense, useEffect, useDeferredValue, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const AdminModelCardListPage = React.lazy(
  () => import('./AdminModelCardListPage'),
);

const AdminDeploymentPresetListPage = React.lazy(
  () => import('./AdminDeploymentPresetListPage'),
);

const ServingTabContent: React.FC = () => {
  'use memo';
  const { t } = useTranslation();

  const [queryParam, setQueryParam] = useQueryStates(
    {
      order: parseAsString,
      filter: parseAsString,
      lifecycleStage: parseAsString.withDefault('active'),
    },
    { history: 'push' },
  );

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParamLegacy({
    current: 1,
    pageSize: 10,
  });

  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');

  const allowedLifecycleStages = ['active', 'destroyed'] as const;
  const lifecycleStage = allowedLifecycleStages.includes(
    queryParam.lifecycleStage as (typeof allowedLifecycleStages)[number],
  )
    ? queryParam.lifecycleStage
    : 'active';

  const lifecycleStageFilter =
    lifecycleStage === 'active'
      ? `lifecycle_stage != "destroyed"`
      : `lifecycle_stage == "destroyed"`;

  const queryVariables = useMemo(
    () => ({
      offset: baiPaginationOption.offset,
      limit: baiPaginationOption.limit,
      filter: mergeFilterValues([lifecycleStageFilter, queryParam.filter]),
      order: queryParam.order,
    }),
    [baiPaginationOption, lifecycleStageFilter, queryParam],
  );

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { endpoint_list } = useLazyLoadQuery<AdminServingPageQuery>(
    graphql`
      query AdminServingPageQuery(
        $offset: Int!
        $limit: Int!
        $filter: String
        $order: String
      ) {
        endpoint_list(
          offset: $offset
          limit: $limit
          filter: $filter
          order: $order
        ) {
          total_count
          items {
            ...EndpointListFragment
          }
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchPolicy:
        deferredFetchKey === 'initial-fetch'
          ? 'store-and-network'
          : 'network-only',
      fetchKey:
        deferredFetchKey === 'initial-fetch' ? undefined : deferredFetchKey,
    },
  );

  return (
    <BAIFlex direction="column" align="stretch" gap={'sm'}>
      <BAIFlex direction="row" justify="between" wrap="wrap" gap={'sm'}>
        <BAIFlex gap={'sm'} align="start" wrap="wrap" style={{ flexShrink: 1 }}>
          <BAIRadioGroup
            value={lifecycleStage}
            onChange={(e) => {
              setQueryParam({ lifecycleStage: e.target.value });
              setTablePaginationOption({ current: 1 });
            }}
            optionType="button"
            buttonStyle="solid"
            options={[
              {
                label: t('modelService.Active'),
                value: 'active',
              },
              {
                label: t('modelService.Destroyed'),
                value: 'destroyed',
              },
            ]}
          />
          <BAIPropertyFilter
            filterProperties={filterOutEmpty([
              {
                key: 'name',
                type: 'string',
                propertyLabel: t('modelService.EndpointName'),
              },
              {
                key: 'url',
                type: 'string',
                propertyLabel: t('modelService.ServiceEndpoint'),
              },
              {
                key: 'created_user_email',
                type: 'string',
                propertyLabel: t('modelService.Owner'),
              },
            ])}
            value={queryParam.filter || undefined}
            onChange={(value) => {
              setQueryParam({ filter: value ?? null });
              setTablePaginationOption({ current: 1 });
            }}
          />
        </BAIFlex>
        <BAIFlex gap={'xs'}>
          <BAIFetchKeyButton
            value={fetchKey}
            onChange={updateFetchKey}
            autoUpdateDelay={7_000}
            loading={
              deferredQueryVariables !== queryVariables ||
              deferredFetchKey !== fetchKey
            }
          />
        </BAIFlex>
      </BAIFlex>
      <Suspense fallback={<Skeleton active />}>
        <EndpointList
          // @ts-expect-error - Relay fragment type mismatch
          endpointsFrgmt={endpoint_list?.items}
          pagination={{
            pageSize: tablePaginationOption.pageSize,
            current: tablePaginationOption.current,
            total: endpoint_list?.total_count,
            onChange(current, pageSize) {
              if (_.isNumber(current) && _.isNumber(pageSize)) {
                setTablePaginationOption({ current, pageSize });
              }
            },
          }}
          order={queryParam.order}
          loading={
            deferredQueryVariables !== queryVariables ||
            deferredFetchKey !== fetchKey
          }
          onChangeOrder={(order) => {
            setQueryParam({ order });
          }}
          onDeleted={() => {
            updateFetchKey();
          }}
          isAdminMode
        />
      </Suspense>
    </BAIFlex>
  );
};

const AdminServingPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const currentUserRole = useCurrentUserRole();
  const webUINavigate = useWebUINavigate();
  const baiClient = useSuspendedBackendaiClient();
  const isSuperAdmin = currentUserRole === 'superadmin';
  const isDeploymentPresetSupported = baiClient.supports('deployment-preset');

  const [queryParam, setQueryParam] = useQueryStates(
    {
      tab: parseAsString.withDefault('serving'),
    },
    { history: 'push' },
  );

  // Fall back to 'serving' tab when access is not permitted
  useEffect(() => {
    if (
      queryParam.tab === 'deployment-presets' &&
      (!isSuperAdmin || !isDeploymentPresetSupported)
    ) {
      setQueryParam({ tab: 'serving' });
    }
  }, [
    queryParam.tab,
    isSuperAdmin,
    isDeploymentPresetSupported,
    setQueryParam,
  ]);

  return (
    <BAICard
      activeTabKey={queryParam.tab}
      onTabChange={(key) => {
        webUINavigate({
          pathname: '/admin-serving',
          search: new URLSearchParams({
            tab: key,
          }).toString(),
        });
        setQueryParam({ tab: key });
      }}
      tabList={filterOutEmpty([
        {
          key: 'serving',
          label: t('webui.menu.Serving'),
        },
        isSuperAdmin && {
          key: 'model-store',
          label: t('adminModelCard.ModelStoreManagement'),
        },
        isSuperAdmin &&
          isDeploymentPresetSupported && {
            key: 'deployment-presets',
            label: t('adminDeploymentPreset.TabTitle'),
          },
      ])}
    >
      <Suspense fallback={<Skeleton active />}>
        {queryParam.tab === 'serving' && <ServingTabContent />}
        {queryParam.tab === 'model-store' && isSuperAdmin && (
          <BAIErrorBoundary>
            <AdminModelCardListPage />
          </BAIErrorBoundary>
        )}
        {queryParam.tab === 'deployment-presets' &&
          isSuperAdmin &&
          isDeploymentPresetSupported && (
            <BAIErrorBoundary>
              <AdminDeploymentPresetListPage />
            </BAIErrorBoundary>
          )}
      </Suspense>
    </BAICard>
  );
};

export default AdminServingPage;
