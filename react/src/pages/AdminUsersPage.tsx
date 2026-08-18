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
  CREDENTIAL_LIST_DEFAULT_PAGE_SIZE,
} from '../components/AdminUserCredentialList';
import AdminUserManagement, {
  AdminUserManagementQuery,
  USER_LIST_DEFAULT_PAGE_SIZE,
} from '../components/AdminUserManagement';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import { BAISkeleton } from 'backend.ai-ui';
import { convertFirstOrderByToString, convertToOrderBy } from '../helper';
import { useBrowserPopstateEffect, useKeyedSnapshot } from '../hooks';
import { useSuspendedTOTPSupported } from '../hooks/backendai';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
// The tab-list item shape now comes from `BAICard` itself (`BAICardTabItem`,
// restated in BUI when the card stopped being antd's) instead of the deep
// `antd/es/card` subpath the frontier note used to point at (P15).
import {
  BAIFlex,
  BAICard,
  availableUserV2SorterValues,
  type BAICardTabItem,
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

const tabParser = parseAsStringLiteral(['users', 'credentials']).withDefault(
  'users',
);
const statusParser = parseAsStringLiteral(['ACTIVE', 'INACTIVE']).withDefault(
  'ACTIVE',
);
const activeTypeParser = parseAsStringLiteral([
  'active',
  'inactive',
]).withDefault('active');

type TabKey = 'users' | 'credentials';
type UsersVariables = AdminUserManagementQueryType['variables'];
type CredentialsVariables = AdminUserCredentialListQueryType['variables'];
type TabVariables = UsersVariables | CredentialsVariables;

type TabSnapshot = {
  queryParams: {
    filter: string | null;
    order: string | null;
    status: 'ACTIVE' | 'INACTIVE';
    activeType: 'active' | 'inactive';
  };
  tablePaginationOption: { current: number; pageSize: number };
};

const defaultSnapshotOf = (tab: TabKey): TabSnapshot => ({
  queryParams: {
    filter: null,
    order: null,
    status: statusParser.defaultValue,
    activeType: activeTypeParser.defaultValue,
  },
  tablePaginationOption: {
    current: 1,
    pageSize:
      tab === 'users'
        ? USER_LIST_DEFAULT_PAGE_SIZE
        : CREDENTIAL_LIST_DEFAULT_PAGE_SIZE,
  },
});

const AdminUsersPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const isTOTPSupported = useSuspendedTOTPSupported();

  const [queryParams, setQueryParams] = useQueryStates(
    {
      tab: tabParser,
      filter: parseAsString,
      order: parseAsString,
      status: statusParser,
      activeType: activeTypeParser,
    },
    { history: 'replace' },
  );
  const { tablePaginationOption, setTablePaginationOption } =
    useBAIPaginationOptionStateOnSearchParam(
      defaultSnapshotOf(queryParams.tab).tablePaginationOption,
    );

  const [usersQueryRef, loadUsersQuery] =
    useQueryLoader<AdminUserManagementQueryType>(AdminUserManagementQuery);
  const [credentialsQueryRef, loadCredentialsQuery] =
    useQueryLoader<AdminUserCredentialListQueryType>(
      AdminUserCredentialListQuery,
    );

  // What the URL currently describes — both the snapshot `useKeyedSnapshot`
  // stores for the active tab and what a browser navigation reloads from.
  const currentSnapshot: TabSnapshot = {
    queryParams: _.omit(queryParams, 'tab'),
    tablePaginationOption,
  };

  const [currentTab, setAfterSnapshot] = useKeyedSnapshot<TabKey, TabSnapshot>(
    queryParams.tab,
    currentSnapshot,
  );

  const usersVariablesOf = (snapshot: TabSnapshot): UsersVariables => {
    const { queryParams: params, tablePaginationOption: pagination } = snapshot;
    const filter = params.filter
      ? parseAsJson<UserV2Filter>((value) => value as UserV2Filter).parse(
          params.filter,
        )
      : null;
    const order = _.includes(availableUserV2SorterValues, params.order)
      ? params.order
      : null;
    return {
      filter: {
        ..._.omit(filter ?? {}, 'status'),
        status:
          params.status === 'ACTIVE'
            ? { equals: 'ACTIVE' }
            : { notEquals: 'ACTIVE' },
      },
      orderBy: convertToOrderBy<Required<UserV2OrderBy>>(order),
      limit: pagination.pageSize,
      offset: (pagination.current - 1) * pagination.pageSize,
      isNotSupportTotp: !isTOTPSupported,
    };
  };

  const credentialsVariablesOf = (
    snapshot: TabSnapshot,
  ): CredentialsVariables => {
    const { queryParams: params, tablePaginationOption: pagination } = snapshot;
    return {
      limit: pagination.pageSize,
      offset: (pagination.current - 1) * pagination.pageSize,
      is_active: params.activeType !== 'inactive',
      filter: params.filter,
      order: params.order,
    };
  };

  // Child-driven changes arrive as complete GraphQL variables; mirror them
  // back to the URL keys so the snapshot effect captures the new state.
  const snapshotOfVariables = (
    tab: TabKey,
    variables: TabVariables,
  ): TabSnapshot => {
    const pageSize =
      variables.limit ?? defaultSnapshotOf(tab).tablePaginationOption.pageSize;
    const tablePaginationOption = {
      current: Math.floor((variables.offset ?? 0) / pageSize) + 1,
      pageSize,
    };
    if (tab === 'users') {
      const v = variables as UsersVariables;
      const restFilter = _.omit(v.filter ?? {}, 'status');
      return {
        queryParams: {
          filter: _.isEmpty(restFilter) ? null : JSON.stringify(restFilter),
          order: convertFirstOrderByToString(v.orderBy),
          status: v.filter?.status?.equals === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
          activeType: 'active',
        },
        tablePaginationOption,
      };
    }
    const v = variables as CredentialsVariables;
    return {
      queryParams: {
        filter: v.filter ?? null,
        order: v.order ?? null,
        status: 'ACTIVE',
        activeType: v.is_active === false ? 'inactive' : 'active',
      },
      tablePaginationOption,
    };
  };

  const handleUsersReload = (
    variables: UsersVariables,
    options?: UseQueryLoaderLoadQueryOptions,
  ) => {
    loadUsersQuery(variables, {
      fetchPolicy: 'store-and-network',
      ...options,
    });
    const snapshot = snapshotOfVariables('users', variables);
    setQueryParams(
      { tab: 'users', ...snapshot.queryParams },
      { history: 'replace' },
    );
    setTablePaginationOption(snapshot.tablePaginationOption);
  };

  const handleCredentialsReload = (
    variables: CredentialsVariables,
    options?: UseQueryLoaderLoadQueryOptions,
  ) => {
    loadCredentialsQuery(variables, {
      fetchPolicy: 'store-and-network',
      ...options,
    });
    const snapshot = snapshotOfVariables('credentials', variables);
    setQueryParams(
      { tab: 'credentials', ...snapshot.queryParams },
      { history: 'replace' },
    );
    setTablePaginationOption(snapshot.tablePaginationOption);
  };

  const loadTabQuery = (tab: TabKey, snapshot: TabSnapshot) => {
    if (tab === 'users') {
      loadUsersQuery(usersVariablesOf(snapshot), {
        fetchPolicy: 'store-and-network',
      });
    } else {
      loadCredentialsQuery(credentialsVariablesOf(snapshot), {
        fetchPolicy: 'store-and-network',
      });
    }
  };

  // Queries the tab the URL currently describes. Every tab change afterwards
  // restores its snapshot and queries inside onTabChange.
  const loadTabFromQueryParams = () => {
    loadTabQuery(queryParams.tab, currentSnapshot);
  };

  // First visit: mount, direct URL entry, reload.
  const loadTabOnMount = useEffectEvent(loadTabFromQueryParams);
  useEffect(() => {
    loadTabOnMount();
  }, []);

  // Back/forward: the hook holds the callback until `queryParams` and
  // `tablePaginationOption` describe the URL the user navigated to.
  useBrowserPopstateEffect(loadTabFromQueryParams);

  const tabItems: BAICardTabItem[] = [
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
      onTabChange={(key) => {
        const tab = tabParser.parse(key) ?? tabParser.defaultValue;
        if (tab === currentTab) return;
        const snapshot = setAfterSnapshot(tab) ?? defaultSnapshotOf(tab);
        loadTabQuery(tab, snapshot);
        setQueryParams({ tab, ...snapshot.queryParams }, { history: 'push' });
        setTablePaginationOption(snapshot.tablePaginationOption);
      }}
      tabList={tabItems}
    >
      <Suspense fallback={<BAISkeleton />}>
        {currentTab === 'users' && (
          <BAIErrorBoundary>
            <BAIFlex direction="column" align="stretch">
              {usersQueryRef ? (
                <AdminUserManagement
                  queryRef={usersQueryRef}
                  onReload={handleUsersReload}
                />
              ) : (
                <BAISkeletonAstryx />
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
                <BAISkeletonAstryx />
              )}
            </BAIFlex>
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default AdminUsersPage;
