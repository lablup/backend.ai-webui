/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  RetentionPolicyListQuery as RetentionPolicyListQueryType,
  RetentionPolicyOrderBy,
} from '../__generated__/RetentionPolicyListQuery.graphql';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import MaintenanceSettingList from '../components/MaintenanceSettingList';
import RetentionPolicyList, {
  RETENTION_POLICY_LIST_DEFAULT_PAGE_SIZE,
  RETENTION_POLICY_SORTER_KEYS,
  RetentionPolicyListQuery,
} from '../components/RetentionPolicyList';
import { RETENTION_CATEGORIES } from '../components/RetentionPolicySettingModal';
import { convertFirstOrderByToString, convertToOrderBy } from '../helper';
import { useBrowserPopstateEffect } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { BAISkeleton, BAICard } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsStringLiteral, useQueryStates } from 'nuqs';
import { Suspense, useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useQueryLoader,
  type UseQueryLoaderLoadQueryOptions,
} from 'react-relay';

const tabParser = parseAsStringLiteral([
  'maintenance',
  'retention-policy',
]).withDefault('maintenance');
const orderParser = parseAsStringLiteral([
  ...RETENTION_POLICY_SORTER_KEYS,
  ..._.map(RETENTION_POLICY_SORTER_KEYS, (key) => `-${key}` as const),
]).withDefault('category');

type RetentionPolicyVariables = RetentionPolicyListQueryType['variables'];

const defaultRetentionPolicyPagination = {
  current: 1,
  pageSize: RETENTION_POLICY_LIST_DEFAULT_PAGE_SIZE,
};

const retentionPolicyVariablesOf = (
  order: string | null,
  pagination: { current: number; pageSize: number },
): RetentionPolicyVariables => ({
  orderBy: convertToOrderBy<RetentionPolicyOrderBy>(
    (order && orderParser.parse(order)) ?? orderParser.defaultValue,
  ),
  limit: pagination.pageSize,
  offset: (pagination.current - 1) * pagination.pageSize,
  categoryLimit: RETENTION_CATEGORIES.length,
});

const MaintenancePage = () => {
  'use memo';
  const { t } = useTranslation();
  const [queryParams, setQueryParams] = useQueryStates(
    {
      tab: tabParser,
      order: orderParser,
    },
    { history: 'replace' },
  );
  const { tablePaginationOption, setTablePaginationOption } =
    useBAIPaginationOptionStateOnSearchParam(defaultRetentionPolicyPagination);

  const [retentionPolicyQueryRef, loadRetentionPolicyQuery] =
    useQueryLoader<RetentionPolicyListQueryType>(RetentionPolicyListQuery);

  const handleRetentionPolicyReload = (
    variables: RetentionPolicyVariables,
    options?: UseQueryLoaderLoadQueryOptions,
  ) => {
    const pageSize = variables.limit ?? RETENTION_POLICY_LIST_DEFAULT_PAGE_SIZE;
    const pagination = {
      current: Math.floor((variables.offset ?? 0) / pageSize) + 1,
      pageSize,
    };
    const order = convertFirstOrderByToString(variables.orderBy);
    loadRetentionPolicyQuery(retentionPolicyVariablesOf(order, pagination), {
      fetchPolicy: 'store-and-network',
      ...options,
    });
    setQueryParams({ order: order ? orderParser.parse(order) : null });
    setTablePaginationOption(pagination);
  };

  const loadTabFromQueryParams = () => {
    if (queryParams.tab !== 'retention-policy') return;
    loadRetentionPolicyQuery(
      retentionPolicyVariablesOf(queryParams.order, tablePaginationOption),
      { fetchPolicy: 'store-and-network' },
    );
  };

  const loadTabOnMount = useEffectEvent(loadTabFromQueryParams);
  useEffect(() => {
    loadTabOnMount();
  }, []);

  useBrowserPopstateEffect(loadTabFromQueryParams);

  return (
    <BAICard
      activeTabKey={queryParams.tab}
      onTabChange={(key) => {
        const tab = tabParser.parse(key) ?? tabParser.defaultValue;
        if (tab === queryParams.tab) return;
        if (tab === 'retention-policy') {
          loadRetentionPolicyQuery(
            retentionPolicyVariablesOf(null, defaultRetentionPolicyPagination),
            { fetchPolicy: 'store-and-network' },
          );
        }
        setQueryParams({ tab, order: null }, { history: 'push' });
        setTablePaginationOption(defaultRetentionPolicyPagination);
      }}
      tabList={[
        {
          key: 'maintenance',
          label: t('webui.menu.Maintenance'),
        },
        {
          key: 'retention-policy',
          label: t('retentionPolicy.DataRetention'),
        },
      ]}
    >
      <Suspense fallback={<BAISkeleton />}>
        {queryParams.tab === 'maintenance' && (
          <BAIErrorBoundary>
            <MaintenanceSettingList />
          </BAIErrorBoundary>
        )}
        {queryParams.tab === 'retention-policy' && (
          <BAIErrorBoundary>
            {retentionPolicyQueryRef ? (
              <RetentionPolicyList
                queryRef={retentionPolicyQueryRef}
                onReload={handleRetentionPolicyReload}
              />
            ) : (
              <BAISkeleton />
            )}
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default MaintenancePage;
