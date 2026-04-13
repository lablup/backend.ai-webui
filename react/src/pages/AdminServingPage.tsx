/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AdminServingPageQuery } from '../__generated__/AdminServingPageQuery.graphql';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import BAIRadioGroup from '../components/BAIRadioGroup';
import EndpointList from '../components/EndpointList';
import { useWebUINavigate } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useBAIPaginationOptionStateOnSearchParamLegacy } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useEffectiveAdminRole } from '../hooks/useCurrentUserProjectRoles';
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
import React, { Suspense, useDeferredValue, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const AdminModelCardListPage = React.lazy(
  () => import('./AdminModelCardListPage'),
);

const ServingTabContent: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const effectiveRole = useEffectiveAdminRole();
  const currentProject = useCurrentProjectValue();

  // Path B (interim): legacy `endpoint_list(project: UUID)` for project admins.
  // Domain-admin scope cannot be precisely matched via the current schema —
  // `endpoint_list` has no `scope_id` argument and there is no `endpoint_nodes`
  // Relay node. Leave unfiltered for domainAdmin until backend support lands.
  // TODO(needs-backend): FR-2313 — domain-scope RBAC for endpoint_list
  const projectFilter =
    effectiveRole === 'projectAdmin' ? (currentProject.id ?? null) : null;

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
      project: projectFilter,
    }),
    [baiPaginationOption, lifecycleStageFilter, queryParam, projectFilter],
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
        $project: UUID
      ) {
        endpoint_list(
          offset: $offset
          limit: $limit
          filter: $filter
          order: $order
          project: $project
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
  const isSuperAdmin = currentUserRole === 'superadmin';

  const [queryParam, setQueryParam] = useQueryStates(
    {
      tab: parseAsString.withDefault('serving'),
    },
    { history: 'push' },
  );

  return (
    <BAICard
      activeTabKey={queryParam.tab}
      onTabChange={(key) => {
        webUINavigate(
          {
            pathname: '/admin-serving',
            search: new URLSearchParams({
              tab: key,
            }).toString(),
          },
          {
            params: {
              tab: key,
            },
          },
        );
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
      ])}
    >
      <Suspense fallback={<Skeleton active />}>
        {queryParam.tab === 'serving' && <ServingTabContent />}
        {queryParam.tab === 'model-store' && isSuperAdmin && (
          <BAIErrorBoundary>
            <AdminModelCardListPage />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default AdminServingPage;
