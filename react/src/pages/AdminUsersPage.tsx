/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AdminUserCredentialListQuery as AdminUserCredentialListQueryType } from '../__generated__/AdminUserCredentialListQuery.graphql';
import {
  AdminUserManagementQuery as AdminUserManagementQueryType,
  UserV2Filter,
  UserV2OrderBy,
} from '../__generated__/AdminUserManagementQuery.graphql';
import AdminUserCredentialList, {
  AdminUserCredentialListQuery,
} from '../components/AdminUserCredentialList';
import AdminUserManagement, {
  AdminUserManagementQuery,
} from '../components/AdminUserManagement';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import { convertFromOrderBy, convertToOrderBy } from '../helper';
import { useKeyedSnapshot } from '../hooks';
import { useTOTPSupported } from '../hooks/backendai';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { Skeleton } from 'antd';
import { CardTabListType } from 'antd/es/card';
import { BAIFlex, BAICard, availableUserV2SorterValues } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { Suspense, useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useQueryLoader,
  type UseQueryLoaderLoadQueryOptions,
} from 'react-relay';

const tabParser = parseAsStringLiteral(['users', 'credentials']).withDefault(
  'users',
);

type TabKey = 'users' | 'credentials';
type UsersVariables = AdminUserManagementQueryType['variables'];
type CredentialsVariables = AdminUserCredentialListQueryType['variables'];
type TabVariables = UsersVariables | CredentialsVariables;

/**
 * FR-3387 pilot: the page is the single owner of URL state and query
 * fetching. The URL seeds the initial tab and variables at mount and is a
 * write-only mirror afterwards; per-tab variables are snapshotted by
 * `useKeyedSnapshot`, restored synchronously on tab change, and loaded via
 * `useQueryLoader` (render-as-you-fetch). Children receive `queryRef` +
 * `onReload` and own no URL state.
 */
const AdminUsersPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { isTOTPSupported } = useTOTPSupported();

  const [queryParams, setQueryParams] = useQueryStates(
    {
      tab: tabParser,
      filter: parseAsString,
      order: parseAsString,
      status: parseAsStringLiteral(['ACTIVE', 'INACTIVE']).withDefault(
        'ACTIVE',
      ),
      activeType: parseAsStringLiteral(['active', 'inactive']).withDefault(
        'active',
      ),
    },
    { history: 'replace' },
  );
  const { tablePaginationOption, setTablePaginationOption } =
    useBAIPaginationOptionStateOnSearchParam(
      queryParams.tab === 'credentials'
        ? { current: 1, pageSize: 20 }
        : { current: 1, pageSize: 10 },
    );

  const [usersQueryRef, loadUsersQuery] =
    useQueryLoader<AdminUserManagementQueryType>(AdminUserManagementQuery);
  const [credentialsQueryRef, loadCredentialsQuery] =
    useQueryLoader<AdminUserCredentialListQueryType>(
      AdminUserCredentialListQuery,
    );

  // The retained queryRefs hold each tab's last requested variables; the
  // snapshot hook reads them per key so every capture is a consistent pair.
  const [currentTab, setAfterSnapshot] = useKeyedSnapshot<
    TabKey,
    TabVariables | undefined
  >(queryParams.tab, (tab) =>
    tab === 'users' ? usersQueryRef?.variables : credentialsQueryRef?.variables,
  );

  const buildInitialUsersVariables = (): UsersVariables => {
    let urlFilter: UserV2Filter | null = null;
    try {
      urlFilter = queryParams.filter
        ? (JSON.parse(queryParams.filter) as UserV2Filter)
        : null;
    } catch {
      urlFilter = null;
    }
    const order = _.includes(availableUserV2SorterValues, queryParams.order)
      ? queryParams.order
      : null;
    return {
      filter: {
        ..._.omit(urlFilter ?? {}, 'status'),
        status:
          queryParams.status === 'ACTIVE'
            ? { equals: 'ACTIVE' }
            : { notEquals: 'ACTIVE' },
      },
      orderBy: convertToOrderBy<Required<UserV2OrderBy>>(order),
      limit: tablePaginationOption.pageSize,
      offset:
        (tablePaginationOption.current - 1) * tablePaginationOption.pageSize,
      isNotSupportTotp: !isTOTPSupported,
    };
  };

  const buildInitialCredentialsVariables = (): CredentialsVariables => ({
    limit: tablePaginationOption.pageSize,
    offset:
      (tablePaginationOption.current - 1) * tablePaginationOption.pageSize,
    is_active: queryParams.activeType !== 'inactive',
    filter: queryParams.filter,
    order: queryParams.order,
  });

  const defaultUsersVariables = (): UsersVariables => ({
    filter: { status: { equals: 'ACTIVE' } },
    limit: 10,
    offset: 0,
    isNotSupportTotp: !isTOTPSupported,
  });

  const defaultCredentialsVariables = (): CredentialsVariables => ({
    limit: 20,
    offset: 0,
    is_active: true,
  });

  const mirrorVariablesToUrl = (
    tab: TabKey,
    variables: TabVariables,
    historyMode: 'push' | 'replace',
  ) => {
    if (tab === 'users') {
      const v = variables as UsersVariables;
      const restFilter = _.omit(v.filter ?? {}, 'status');
      setQueryParams(
        {
          tab,
          filter: _.isEmpty(restFilter) ? null : JSON.stringify(restFilter),
          order: convertFromOrderBy(v.orderBy),
          status: v.filter?.status?.equals === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
          activeType: null,
        },
        { history: historyMode },
      );
      setTablePaginationOption({
        current: Math.floor((v.offset ?? 0) / (v.limit ?? 10)) + 1,
        pageSize: v.limit ?? 10,
      });
    } else {
      const v = variables as CredentialsVariables;
      setQueryParams(
        {
          tab,
          filter: v.filter ?? null,
          order: v.order ?? null,
          status: null,
          activeType: v.is_active === false ? 'inactive' : 'active',
        },
        { history: historyMode },
      );
      setTablePaginationOption({
        current: Math.floor((v.offset ?? 0) / (v.limit ?? 20)) + 1,
        pageSize: v.limit ?? 20,
      });
    }
  };

  const handleTabChange = (key: string) => {
    const tab = tabParser.parse(key) ?? tabParser.defaultValue;
    if (tab === currentTab) return;
    const restored = setAfterSnapshot(tab);
    const variables =
      restored ??
      (tab === 'users'
        ? defaultUsersVariables()
        : defaultCredentialsVariables());
    // A revisited tab's retained queryRef already holds its data — show it
    // without refetching (freshness is the child's refresh button's job).
    if (tab === 'users' && !usersQueryRef) {
      loadUsersQuery(variables as UsersVariables);
    } else if (tab === 'credentials' && !credentialsQueryRef) {
      loadCredentialsQuery(variables as CredentialsVariables);
    }
    mirrorVariablesToUrl(tab, variables, 'push');
  };

  const handleUsersReload = (
    variables: UsersVariables,
    options?: UseQueryLoaderLoadQueryOptions,
  ) => {
    loadUsersQuery(variables, options);
    mirrorVariablesToUrl('users', variables, 'replace');
  };

  const handleCredentialsReload = (
    variables: CredentialsVariables,
    options?: UseQueryLoaderLoadQueryOptions,
  ) => {
    loadCredentialsQuery(variables, options);
    mirrorVariablesToUrl('credentials', variables, 'replace');
  };

  // Entries that bypass the tab-change handler (initial mount, direct URL
  // entry, reload) build the active tab's variables from the URL; a tab
  // reached with a warm queryRef (back/forward) needs no load at all.
  const ensureActiveTabLoaded = useEffectEvent(() => {
    if (currentTab === 'users' && !usersQueryRef) {
      loadUsersQuery(buildInitialUsersVariables());
    }
    if (currentTab === 'credentials' && !credentialsQueryRef) {
      loadCredentialsQuery(buildInitialCredentialsVariables());
    }
  });
  useEffect(() => {
    ensureActiveTabLoaded();
  }, [currentTab]);

  const tabItems: CardTabListType[] = [
    {
      key: 'users',
      label: t('credential.Users'),
    },
    {
      key: 'credentials',
      label: t('credential.Credentials'),
    },
  ];

  return (
    <BAICard
      activeTabKey={currentTab}
      onTabChange={handleTabChange}
      tabList={tabItems}
    >
      <Suspense fallback={<Skeleton active />}>
        {currentTab === 'users' && (
          <BAIErrorBoundary>
            <BAIFlex direction="column" align="stretch">
              {usersQueryRef ? (
                <AdminUserManagement
                  queryRef={usersQueryRef}
                  onReload={handleUsersReload}
                />
              ) : (
                <Skeleton active />
              )}
            </BAIFlex>
          </BAIErrorBoundary>
        )}
        {currentTab === 'credentials' && (
          <BAIErrorBoundary>
            <BAIFlex direction="column" align="stretch">
              {credentialsQueryRef ? (
                <AdminUserCredentialList
                  queryRef={credentialsQueryRef}
                  onReload={handleCredentialsReload}
                />
              ) : (
                <Skeleton active />
              )}
            </BAIFlex>
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default AdminUsersPage;
