/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { KeypairResourcePolicyV2Query as KeypairResourcePolicyV2QueryType } from '../__generated__/KeypairResourcePolicyV2Query.graphql';
import type { ProjectResourcePolicyV2Query as ProjectResourcePolicyV2QueryType } from '../__generated__/ProjectResourcePolicyV2Query.graphql';
import type { UserResourcePolicyV2Query as UserResourcePolicyV2QueryType } from '../__generated__/UserResourcePolicyV2Query.graphql';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import KeypairResourcePolicyList from '../components/KeypairResourcePolicyList';
import KeypairResourcePolicyV2, {
  KeypairResourcePolicyV2Query,
} from '../components/KeypairResourcePolicyV2';
import ProjectResourcePolicyList from '../components/ProjectResourcePolicyList';
import ProjectResourcePolicyV2, {
  ProjectResourcePolicyV2Query,
} from '../components/ProjectResourcePolicyV2';
import UserResourcePolicyList from '../components/UserResourcePolicyList';
import UserResourcePolicyV2, {
  UserResourcePolicyV2Query,
} from '../components/UserResourcePolicyV2';
import { convertFirstOrderByToString, convertToOrderBy } from '../helper';
import {
  useBrowserPopstateEffect,
  useKeyedSnapshot,
  useSuspendedBackendaiClient,
} from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import {
  BAISkeleton,
  filterOutEmpty,
  BAICard,
  availableKeypairResourcePolicySorterValues,
  availableProjectResourcePolicySorterValues,
  availableUserResourcePolicySorterValues,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import {
  parseAsJson,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import React, { Suspense, useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useQueryLoader,
  type UseQueryLoaderLoadQueryOptions,
} from 'react-relay';

interface ResourcePolicyPageProps {}
const tabParser = parseAsStringLiteral([
  'keypair',
  'user',
  'project',
]).withDefault('keypair');
const orderParser = parseAsString.withDefault('-createdAt');
const filterParser = parseAsJson((value) => value);
const DEFAULT_PAGE_SIZE = 10;

type TabKey = typeof tabParser.defaultValue;
type TabVariables =
  | KeypairResourcePolicyV2QueryType['variables']
  | UserResourcePolicyV2QueryType['variables']
  | ProjectResourcePolicyV2QueryType['variables'];

// Which `order` strings each tab's query accepts; anything else falls back
// to the default so a hand-edited URL cannot fail GraphQL variable validation.
const sorterValuesOf: Record<TabKey, readonly string[]> = {
  keypair: availableKeypairResourcePolicySorterValues,
  user: availableUserResourcePolicySorterValues,
  project: availableProjectResourcePolicySorterValues,
};

type TabSnapshot = {
  queryParams: {
    filter: string | null;
    order: string;
  };
  tablePaginationOption: { current: number; pageSize: number };
};

const defaultSnapshot: TabSnapshot = {
  queryParams: {
    filter: null,
    order: orderParser.defaultValue,
  },
  tablePaginationOption: { current: 1, pageSize: DEFAULT_PAGE_SIZE },
};

const variablesOf = <V extends TabVariables>(
  tab: TabKey,
  snapshot: TabSnapshot,
) => {
  const { queryParams: params, tablePaginationOption: pagination } = snapshot;
  const order = _.includes(sorterValuesOf[tab], params.order)
    ? params.order
    : orderParser.defaultValue;
  // The URL parsers accept any integer; keep a hand-edited link from
  // requesting a negative limit / offset.
  const pageSize = Math.max(1, pagination.pageSize);
  const current = Math.max(1, pagination.current);
  return {
    filter: params.filter
      ? (filterParser.parse(params.filter) as V['filter'])
      : null,
    orderBy: convertToOrderBy<NonNullable<V['orderBy']>[number]>(order),
    limit: pageSize,
    offset: (current - 1) * pageSize,
  };
};

// Inverse of `variablesOf`, for mirroring child-driven reloads to the URL.
const snapshotOfVariables = (variables: TabVariables): TabSnapshot => {
  const pageSize = variables.limit ?? DEFAULT_PAGE_SIZE;
  return {
    queryParams: {
      filter: _.isEmpty(variables.filter)
        ? null
        : JSON.stringify(variables.filter),
      order:
        convertFirstOrderByToString(variables.orderBy) ??
        orderParser.defaultValue,
    },
    tablePaginationOption: {
      current: Math.floor((variables.offset ?? 0) / pageSize) + 1,
      pageSize,
    },
  };
};

const ResourcePolicyPage: React.FC<ResourcePolicyPageProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const supportsSubFilter = baiClient.supports('sub-filter');
  const supportsBinarySizeExpr = baiClient.supports('binary-size-expr');
  const supportsV2: Record<TabKey, boolean> = {
    keypair: supportsSubFilter,
    user: supportsSubFilter && supportsBinarySizeExpr,
    project: supportsSubFilter && supportsBinarySizeExpr,
  };

  const [queryParams, setQueryParams] = useQueryStates(
    {
      tab: tabParser,
      filter: parseAsString,
      order: orderParser,
    },
    { history: 'replace' },
  );
  const { tablePaginationOption, setTablePaginationOption } =
    useBAIPaginationOptionStateOnSearchParam(
      defaultSnapshot.tablePaginationOption,
    );

  const [keypairResourcePolicyQueryRef, loadKeypairResourcePolicyQuery] =
    useQueryLoader<KeypairResourcePolicyV2QueryType>(
      KeypairResourcePolicyV2Query,
    );
  const [userResourcePolicyQueryRef, loadUserResourcePolicyQuery] =
    useQueryLoader<UserResourcePolicyV2QueryType>(UserResourcePolicyV2Query);
  const [projectResourcePolicyQueryRef, loadProjectResourcePolicyQuery] =
    useQueryLoader<ProjectResourcePolicyV2QueryType>(
      ProjectResourcePolicyV2Query,
    );

  // What the URL currently describes — both the snapshot `useKeyedSnapshot`
  // stores for the active tab and what a browser navigation reloads from.
  const currentSnapshot: TabSnapshot = {
    queryParams: { filter: queryParams.filter, order: queryParams.order },
    tablePaginationOption,
  };

  const [currentTab, setCurrentTab, peekTabSnapshot] = useKeyedSnapshot<
    TabKey,
    TabSnapshot
  >(queryParams.tab, currentSnapshot);

  const loadTabQuery = (tab: TabKey, snapshot: TabSnapshot) => {
    // The legacy lists fetch on their own; only the V2 tables are preloaded.
    if (!supportsV2[tab]) return;
    const options = { fetchPolicy: 'store-and-network' } as const;
    if (tab === 'keypair') {
      loadKeypairResourcePolicyQuery(
        variablesOf<KeypairResourcePolicyV2QueryType['variables']>(
          tab,
          snapshot,
        ),
        options,
      );
    } else if (tab === 'user') {
      loadUserResourcePolicyQuery(
        variablesOf<UserResourcePolicyV2QueryType['variables']>(tab, snapshot),
        options,
      );
    } else {
      loadProjectResourcePolicyQuery(
        variablesOf<ProjectResourcePolicyV2QueryType['variables']>(
          tab,
          snapshot,
        ),
        options,
      );
    }
  };

  const mirrorSnapshot = (
    tab: TabKey,
    snapshot: TabSnapshot,
    history: 'push' | 'replace',
  ) => {
    setQueryParams({ tab, ...snapshot.queryParams }, { history });
    setTablePaginationOption(snapshot.tablePaginationOption);
  };

  // Child-driven reloads: load, then mirror the new variables to the URL.
  const reloadHandlerOf =
    <V extends TabVariables>(
      tab: TabKey,
      load: (variables: V, options?: UseQueryLoaderLoadQueryOptions) => void,
    ) =>
    (variables: V, options?: UseQueryLoaderLoadQueryOptions) => {
      load(variables, { fetchPolicy: 'store-and-network', ...options });
      mirrorSnapshot(tab, snapshotOfVariables(variables), 'replace');
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

  return (
    <BAICard
      activeTabKey={currentTab}
      onTabChange={(key) => {
        const tab = tabParser.parse(key) ?? tabParser.defaultValue;
        if (tab === currentTab) return;
        const snapshot = peekTabSnapshot(tab) ?? defaultSnapshot;
        setCurrentTab(tab);
        loadTabQuery(tab, snapshot);
        mirrorSnapshot(tab, snapshot, 'push');
      }}
      tabList={filterOutEmpty([
        {
          key: 'keypair',
          label: t('resourcePolicy.KeypairResourcePolicy'),
        },
        {
          key: 'user',
          label: t('resourcePolicy.UserResourcePolicy'),
        },
        {
          key: 'project',
          label: t('resourcePolicy.ProjectResourcePolicy'),
        },
      ])}
    >
      <Suspense fallback={<BAISkeleton />}>
        {currentTab === 'keypair' && (
          <BAIErrorBoundary>
            {supportsV2.keypair ? (
              keypairResourcePolicyQueryRef ? (
                <KeypairResourcePolicyV2
                  queryRef={keypairResourcePolicyQueryRef}
                  onReload={reloadHandlerOf(
                    'keypair',
                    loadKeypairResourcePolicyQuery,
                  )}
                />
              ) : (
                <BAISkeleton />
              )
            ) : (
              <KeypairResourcePolicyList />
            )}
          </BAIErrorBoundary>
        )}
        {currentTab === 'user' && (
          <BAIErrorBoundary>
            {supportsV2.user ? (
              userResourcePolicyQueryRef ? (
                <UserResourcePolicyV2
                  queryRef={userResourcePolicyQueryRef}
                  onReload={reloadHandlerOf(
                    'user',
                    loadUserResourcePolicyQuery,
                  )}
                />
              ) : (
                <BAISkeleton />
              )
            ) : (
              <UserResourcePolicyList />
            )}
          </BAIErrorBoundary>
        )}
        {currentTab === 'project' && (
          <BAIErrorBoundary>
            {supportsV2.project ? (
              projectResourcePolicyQueryRef ? (
                <ProjectResourcePolicyV2
                  queryRef={projectResourcePolicyQueryRef}
                  onReload={reloadHandlerOf(
                    'project',
                    loadProjectResourcePolicyQuery,
                  )}
                />
              ) : (
                <BAISkeleton />
              )
            ) : (
              <ProjectResourcePolicyList />
            )}
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default ResourcePolicyPage;
