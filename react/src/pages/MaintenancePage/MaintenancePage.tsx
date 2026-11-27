/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ClientIPMaskingPolicyFilter } from '../../__generated__/AdminClientIpMaskingPolicyListQuery.graphql';
import {
  RetentionPolicyFilter,
  AdminRetentionPolicyQuery as AdminRetentionPolicyQueryType,
  RetentionPolicyOrderBy,
} from '../../__generated__/AdminRetentionPolicyQuery.graphql';
import BAIErrorBoundary from '../../components/BAIErrorBoundary';
import { convertFirstOrderByToString, convertToOrderBy } from '../../helper';
import { useBrowserPopstateEffect, useKeyedSnapshot } from '../../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../../hooks/reactPaginationQueryOptions';
import AdminClientIpMaskingPolicyList, {
  CLIENT_IP_MASKING_FILTER_KEYS,
} from './components/AdminClientIpMaskingPolicyList';
import AdminRetentionPolicy, {
  ADMIN_RETENTION_POLICY_DEFAULT_PAGE_SIZE,
  AdminRetentionPolicyQuery,
} from './components/AdminRetentionPolicy';
import MaintenanceSettingList from './components/MaintenanceSettingList';
import {
  BAISkeleton,
  BAICard,
  availableRetentionPolicySorterValues,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { Suspense, useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useQueryLoader,
  type UseQueryLoaderLoadQueryOptions,
} from 'react-relay';

const tabParser = parseAsStringLiteral([
  'maintenance',
  'retention-policy',
  'client-ip-masking',
]).withDefault('maintenance');
const orderParser = parseAsStringLiteral(
  availableRetentionPolicySorterValues,
).withDefault('category');

type TabKey = 'maintenance' | 'retention-policy' | 'client-ip-masking';
type RetentionPolicyVariables = AdminRetentionPolicyQueryType['variables'];

// One `filter` search param, shared by the retention and client IP masking tabs.
type MaintenanceFilter = RetentionPolicyFilter & ClientIPMaskingPolicyFilter;

type TabSnapshot = {
  queryParams: {
    order: typeof orderParser.defaultValue;
    filter: MaintenanceFilter | null;
  };
  tablePaginationOption: { current: number; pageSize: number };
};

const defaultSnapshotOf = (_tab: TabKey): TabSnapshot => ({
  queryParams: { order: orderParser.defaultValue, filter: null },
  tablePaginationOption: {
    current: 1,
    pageSize: ADMIN_RETENTION_POLICY_DEFAULT_PAGE_SIZE,
  },
});

const filterParser = parseAsJson<MaintenanceFilter>((value) =>
  _.pick(value as MaintenanceFilter, [
    'category',
    'enabled',
    ...CLIENT_IP_MASKING_FILTER_KEYS,
  ]),
);

const retentionPolicyVariablesOf = (
  order: string | null,
  filter: RetentionPolicyFilter | null,
  pagination: { current: number; pageSize: number },
): RetentionPolicyVariables => ({
  filter: _.isEmpty(filter) ? null : filter,
  orderBy: convertToOrderBy<RetentionPolicyOrderBy>(
    (order && orderParser.parse(order)) ?? orderParser.defaultValue,
  ),
  limit: pagination.pageSize,
  offset: (pagination.current - 1) * pagination.pageSize,
});

const MaintenancePage = () => {
  'use memo';
  const { t } = useTranslation();
  const [queryParams, setQueryParams] = useQueryStates(
    {
      tab: tabParser,
      order: orderParser,
      filter: filterParser,
    },
    { history: 'replace' },
  );
  const { tablePaginationOption, setTablePaginationOption } =
    useBAIPaginationOptionStateOnSearchParam(
      defaultSnapshotOf(queryParams.tab).tablePaginationOption,
    );

  const [retentionPolicyQueryRef, loadRetentionPolicyQuery] =
    useQueryLoader<AdminRetentionPolicyQueryType>(AdminRetentionPolicyQuery);

  const currentSnapshot: TabSnapshot = {
    queryParams: _.omit(queryParams, 'tab'),
    tablePaginationOption,
  };

  const [currentTab, setCurrentTab, peekTabSnapshot] = useKeyedSnapshot<
    TabKey,
    TabSnapshot
  >(queryParams.tab, currentSnapshot);

  const handleRetentionPolicyReload = (
    variables: RetentionPolicyVariables,
    options?: UseQueryLoaderLoadQueryOptions,
  ) => {
    const pageSize =
      variables.limit ?? ADMIN_RETENTION_POLICY_DEFAULT_PAGE_SIZE;
    const pagination = {
      current: Math.floor((variables.offset ?? 0) / pageSize) + 1,
      pageSize,
    };
    const order = convertFirstOrderByToString(variables.orderBy);
    const filter = _.isEmpty(variables.filter)
      ? null
      : (variables.filter ?? null);
    loadRetentionPolicyQuery(
      retentionPolicyVariablesOf(order, filter, pagination),
      { fetchPolicy: 'store-and-network', ...options },
    );
    setQueryParams({ order: order ? orderParser.parse(order) : null, filter });
    setTablePaginationOption(pagination);
  };

  const loadTabQuery = (tab: TabKey, snapshot: TabSnapshot) => {
    if (tab !== 'retention-policy') return;
    loadRetentionPolicyQuery(
      retentionPolicyVariablesOf(
        snapshot.queryParams.order,
        snapshot.queryParams.filter,
        snapshot.tablePaginationOption,
      ),
      { fetchPolicy: 'store-and-network' },
    );
  };

  const loadTabFromQueryParams = () => {
    loadTabQuery(queryParams.tab, currentSnapshot);
  };

  const loadTabOnMount = useEffectEvent(loadTabFromQueryParams);
  useEffect(() => {
    loadTabOnMount();
  }, []);

  useBrowserPopstateEffect(loadTabFromQueryParams);

  return (
    <BAICard
      activeTabKey={currentTab}
      onTabChange={(key) => {
        const tab = tabParser.parse(key) ?? tabParser.defaultValue;
        if (tab === currentTab) return;
        const snapshot = peekTabSnapshot(tab) ?? defaultSnapshotOf(tab);
        setCurrentTab(tab);
        loadTabQuery(tab, snapshot);
        setQueryParams({ tab, ...snapshot.queryParams }, { history: 'push' });
        setTablePaginationOption(snapshot.tablePaginationOption);
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
        {
          key: 'client-ip-masking',
          label: t('clientIpMasking.ClientIpMasking'),
        },
      ]}
    >
      <Suspense fallback={<BAISkeleton />}>
        {currentTab === 'maintenance' && (
          <BAIErrorBoundary>
            <MaintenanceSettingList />
          </BAIErrorBoundary>
        )}
        {currentTab === 'retention-policy' && (
          <BAIErrorBoundary>
            {retentionPolicyQueryRef ? (
              <AdminRetentionPolicy
                queryRef={retentionPolicyQueryRef}
                onReload={handleRetentionPolicyReload}
              />
            ) : (
              <BAISkeleton />
            )}
          </BAIErrorBoundary>
        )}
        {currentTab === 'client-ip-masking' && (
          <BAIErrorBoundary>
            <AdminClientIpMaskingPolicyList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default MaintenancePage;
