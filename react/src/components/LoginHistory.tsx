/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  LoginHistoryOrderBy,
  LoginHistoryQuery as LoginHistoryQueryType,
} from '../__generated__/LoginHistoryQuery.graphql';
import { convertToOrderBy } from '../helper';
import AutoUpdateFetchKeyButton from './AutoUpdateFetchKeyButton';
import {
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAILoginHistoryTable,
  type BAILoginHistoryTableProps,
  loginResultFilterOptions,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  PreloadedQuery,
  usePreloadedQuery,
  UseQueryLoaderLoadQueryOptions,
} from 'react-relay';

export const LoginHistoryQuery = graphql`
  query LoginHistoryQuery(
    $filter: LoginHistoryFilter
    $orderBy: [LoginHistoryOrderBy!]
    $limit: Int
    $offset: Int
  ) {
    myLoginHistoryV2(
      filter: $filter
      orderBy: $orderBy
      limit: $limit
      offset: $offset
    ) {
      count
      edges {
        node {
          ...BAILoginHistoryTableFragment
        }
      }
    }
  }
`;

export interface LoginHistoryProps extends Omit<
  BAILoginHistoryTableProps,
  | 'loginHistoryFrgmt'
  | 'loading'
  | 'order'
  | 'onChangeOrder'
  | 'dataSource'
  | 'pagination'
  | 'customizeColumns'
> {
  queryRef: PreloadedQuery<LoginHistoryQueryType>;
  onReload: (
    variables: LoginHistoryQueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void;
}

/**
 * LoginHistory - Reads a preloaded `myLoginHistoryV2` query and renders it as a
 * `BAILoginHistoryTable` with a filter bar and a refresh button. The consumer owns
 * `useQueryLoader` / `loadQuery`; this view reads the `queryRef` via
 * `usePreloadedQuery` and re-runs filter / sort / refresh / paging through
 * `onReload`. Reading the *deferred* `queryRef` keeps the previous rows visible
 * while the next result loads (inline loading, no Suspense-fallback flash).
 * Login history is read-only, so unlike `LoginSession` there is no row action or
 * mutation here — only filtering, sorting, and offset pagination. Render inside a
 * `Suspense` (+ `BAIErrorBoundary`) boundary.
 */
const LoginHistory = ({
  queryRef,
  onReload,
  ...tableProps
}: LoginHistoryProps) => {
  'use memo';
  const { t } = useTranslation();

  const filter = queryRef.variables.filter ?? undefined;
  const orderBy = queryRef.variables.orderBy?.[0];
  const order = orderBy
    ? `${orderBy.direction === 'DESC' ? '-' : ''}${_.camelCase(orderBy.field)}`
    : null;
  const pageSize = queryRef.variables.limit ?? 10;
  const offset = queryRef.variables.offset ?? 0;
  const current = pageSize ? Math.floor(offset / pageSize) + 1 : 1;

  const deferredQueryRef = useDeferredValue(queryRef);
  const isRefetching = deferredQueryRef !== queryRef;

  const data = usePreloadedQuery<LoginHistoryQueryType>(
    LoginHistoryQuery,
    deferredQueryRef,
  );

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex justify="between" wrap="wrap" gap="sm">
        <BAIGraphQLPropertyFilter
          value={filter}
          onChange={(next) => {
            onReload(
              { ...queryRef.variables, filter: next, offset: 0 },
              { fetchPolicy: 'network-only' },
            );
          }}
          filterProperties={[
            {
              key: 'result',
              propertyLabel: t('loginHistory.Result'),
              type: 'enum',
              fixedOperator: 'equals',
              strictSelection: true,
              options: loginResultFilterOptions,
            },
            {
              key: 'domainName',
              propertyLabel: t('loginHistory.Domain'),
              type: 'string',
              fixedOperator: 'contains',
            },
            {
              key: 'createdAt',
              propertyLabel: t('loginHistory.LoginTime'),
              type: 'datetime',
              defaultOperator: 'after',
            },
          ]}
        />
        <AutoUpdateFetchKeyButton
          settingId="login-history"
          value=""
          onChange={() => {
            onReload(queryRef.variables, { fetchPolicy: 'network-only' });
          }}
          loading={isRefetching}
        />
      </BAIFlex>
      <BAILoginHistoryTable
        resizable
        loading={isRefetching}
        order={order}
        onChangeOrder={(nextOrder) => {
          onReload(
            {
              ...queryRef.variables,
              orderBy: convertToOrderBy<LoginHistoryOrderBy>(nextOrder),
              offset: 0,
            },
            { fetchPolicy: 'network-only' },
          );
        }}
        pagination={{
          pageSize,
          current,
          total: data.myLoginHistoryV2?.count ?? 0,
          onChange: (nextCurrent, nextPageSize) => {
            onReload(
              {
                ...queryRef.variables,
                limit: nextPageSize,
                offset: nextCurrent > 1 ? (nextCurrent - 1) * nextPageSize : 0,
              },
              { fetchPolicy: 'network-only' },
            );
          },
        }}
        loginHistoryFrgmt={filterOutNullAndUndefined(
          _.map(data.myLoginHistoryV2?.edges, 'node'),
        )}
        {...tableProps}
      />
    </BAIFlex>
  );
};

export default LoginHistory;
