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
import { convertFirstOrderByToString, convertToOrderBy } from '../helper';
import { useBrowserPopstateEffect, useKeyedSnapshot } from '../hooks';
import { useSuspendedTOTPSupported } from '../hooks/backendai';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { Skeleton } from 'antd';
import { CardTabListType } from 'antd/es/card';
import { BAIFlex, BAICard, availableUserV2SorterValues } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import {
  parseAsJson,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import { Suspense, useEffect, useEffectEvent, useState } from 'react';
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
    status: 'ACTIVE',
    activeType: 'active',
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

  const [currentTab, setAfterSnapshot] = useKeyedSnapshot<TabKey, TabSnapshot>(
    queryParams.tab,
    {
      queryParams: _.omit(queryParams, 'tab'),
      tablePaginationOption,
    },
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
    loadUsersQuery(variables, options);
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
    loadCredentialsQuery(variables, options);
    const snapshot = snapshotOfVariables('credentials', variables);
    setQueryParams(
      { tab: 'credentials', ...snapshot.queryParams },
      { history: 'replace' },
    );
    setTablePaginationOption(snapshot.tablePaginationOption);
  };

  const loadInitialTabFromUrl = useEffectEvent(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab =
      tabParser.parse(searchParams.get('tab') ?? '') ?? tabParser.defaultValue;
    const defaults = defaultSnapshotOf(tab);
    const snapshot: TabSnapshot = {
      queryParams: {
        filter: searchParams.get('filter') ?? defaults.queryParams.filter,
        order: searchParams.get('order') ?? defaults.queryParams.order,
        status:
          statusParser.parse(searchParams.get('status') ?? '') ??
          defaults.queryParams.status,
        activeType:
          activeTypeParser.parse(searchParams.get('activeType') ?? '') ??
          defaults.queryParams.activeType,
      },
      tablePaginationOption: {
        current:
          parseInt(searchParams.get('current') ?? '') ||
          defaults.tablePaginationOption.current,
        pageSize:
          parseInt(searchParams.get('pageSize') ?? '') ||
          defaults.tablePaginationOption.pageSize,
      },
    };
    if (tab === 'users') {
      loadUsersQuery(usersVariablesOf(snapshot));
    } else {
      loadCredentialsQuery(credentialsVariablesOf(snapshot));
    }
  });

  const [popstateTick, setPopstateTick] = useState<number>(0);

  useBrowserPopstateEffect(() => {
    setPopstateTick((t) => t + 1);
  });

  useEffect(
    function loadTabOnMountAndPopstate() {
      loadInitialTabFromUrl();
    },
    [popstateTick],
  );

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
      onTabChange={(key) => {
        const tab = tabParser.parse(key) ?? tabParser.defaultValue;
        if (tab === currentTab) return;
        const snapshot = setAfterSnapshot(tab) ?? defaultSnapshotOf(tab);
        if (tab === 'users') {
          loadUsersQuery(usersVariablesOf(snapshot));
        } else {
          loadCredentialsQuery(credentialsVariablesOf(snapshot));
        }
        setQueryParams({ tab, ...snapshot.queryParams }, { history: 'push' });
        setTablePaginationOption(snapshot.tablePaginationOption);
      }}
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
