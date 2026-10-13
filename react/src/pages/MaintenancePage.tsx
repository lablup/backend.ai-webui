/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  RetentionPolicyFilter,
  RetentionPolicyListQuery as RetentionPolicyListQueryType,
  RetentionPolicyOrderBy,
} from '../__generated__/RetentionPolicyListQuery.graphql';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import MaintenanceSettingList from '../components/MaintenanceSettingList';
import RetentionPolicyList, {
  RETENTION_POLICY_LIST_DEFAULT_PAGE_SIZE,
  RetentionPolicyListQuery,
} from '../components/RetentionPolicyList';
import { convertFirstOrderByToString, convertToOrderBy } from '../helper';
import { useBrowserPopstateEffect, useKeyedSnapshot } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import {
  BAISkeleton,
  BAICard,
  availableRetentionPolicySorterValues,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import {
  parseAsJson,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
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
const orderParser = parseAsStringLiteral(
  availableRetentionPolicySorterValues,
).withDefault('category');

type TabKey = 'maintenance' | 'retention-policy';
type RetentionPolicyVariables = RetentionPolicyListQueryType['variables'];

type TabSnapshot = {
  queryParams: {
    order: typeof orderParser.defaultValue;
    filter: string | null;
  };
  tablePaginationOption: { current: number; pageSize: number };
};

const defaultSnapshotOf = (_tab: TabKey): TabSnapshot => ({
  queryParams: { order: orderParser.defaultValue, filter: null },
  tablePaginationOption: {
    current: 1,
    pageSize: RETENTION_POLICY_LIST_DEFAULT_PAGE_SIZE,
  },
});

const filterParser = parseAsJson<RetentionPolicyFilter>((value) =>
  _.pick(value as RetentionPolicyFilter, ['category', 'enabled']),
);

const retentionPolicyVariablesOf = (
  order: string | null,
  filter: string | null,
  pagination: { current: number; pageSize: number },
): RetentionPolicyVariables => ({
  filter: (filter && filterParser.parse(filter)) || null,
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
      filter: parseAsString,
    },
    { history: 'replace' },
  );
  const { tablePaginationOption, setTablePaginationOption } =
    useBAIPaginationOptionStateOnSearchParam(
      defaultSnapshotOf(queryParams.tab).tablePaginationOption,
    );

  const [retentionPolicyQueryRef, loadRetentionPolicyQuery] =
    useQueryLoader<RetentionPolicyListQueryType>(RetentionPolicyListQuery);

  // What the URL currently describes — both the snapshot `useKeyedSnapshot`
  // stores for the active tab and what a browser navigation reloads from.
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
    const pageSize = variables.limit ?? RETENTION_POLICY_LIST_DEFAULT_PAGE_SIZE;
    const pagination = {
      current: Math.floor((variables.offset ?? 0) / pageSize) + 1,
      pageSize,
    };
    const order = convertFirstOrderByToString(variables.orderBy);
    const filter = _.isEmpty(variables.filter)
      ? null
      : JSON.stringify(variables.filter);
    loadRetentionPolicyQuery(
      retentionPolicyVariablesOf(order, filter, pagination),
      { fetchPolicy: 'store-and-network', ...options },
    );
    setQueryParams({ order: order ? orderParser.parse(order) : null, filter });
    setTablePaginationOption(pagination);
  };

  // The maintenance tab has no preloaded query.
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
