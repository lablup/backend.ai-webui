/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  LoginSessionOrderBy,
  LoginSessionQuery as LoginSessionQueryType,
} from '../__generated__/LoginSessionQuery.graphql';
import type { LoginSessionRevokeMutation } from '../__generated__/LoginSessionRevokeMutation.graphql';
import { convertToOrderBy } from '../helper';
import { LogoutOutlined } from '@ant-design/icons';
import { App } from 'antd';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAILoginSessionTable,
  type BAILoginSessionTableProps,
  BAINameActionCell,
  type LoginSessionNodeInList,
  filterOutEmpty,
  filterOutNullAndUndefined,
  toLocalId,
  useMutationWithPromise,
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

export const LoginSessionQuery = graphql`
  query LoginSessionQuery(
    $filter: LoginSessionFilter
    $orderBy: [LoginSessionOrderBy!]
    $limit: Int
    $offset: Int
  ) {
    myLoginSessionsV2(
      filter: $filter
      orderBy: $orderBy
      limit: $limit
      offset: $offset
    ) {
      count
      edges {
        node {
          ...BAILoginSessionTableFragment
        }
      }
    }
  }
`;

export interface LoginSessionProps extends Omit<
  BAILoginSessionTableProps,
  | 'loginSessionsFrgmt'
  | 'loading'
  | 'order'
  | 'onChangeOrder'
  | 'dataSource'
  | 'pagination'
  | 'customizeColumns'
> {
  queryRef: PreloadedQuery<LoginSessionQueryType>;
  onReload: (
    variables: LoginSessionQueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void;
}

/**
 * LoginSession - Reads a preloaded `myLoginSessionsV2` query and renders it as a
 * `BAILoginSessionTable` with a filter bar and a refresh button. The consumer owns
 * `useQueryLoader` / `loadQuery`; this view reads the `queryRef` via
 * `usePreloadedQuery` and re-runs filter / sort / refresh through `onReload`.
 * Reading the *deferred* `queryRef` keeps the previous rows visible while the
 * next result loads (inline loading, no Suspense-fallback flash). Attaches the
 * per-row revoke action (`myRevokeLoginSession`) to the access key column via
 * `customizeColumns`. Render inside a `Suspense` (+ `BAIErrorBoundary`) boundary.
 */
const LoginSession = ({
  queryRef,
  onReload,
  ...tableProps
}: LoginSessionProps) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();

  const revokeSessionMutation =
    useMutationWithPromise<LoginSessionRevokeMutation>(graphql`
      mutation LoginSessionRevokeMutation($sessionId: UUID!) {
        myRevokeLoginSession(sessionId: $sessionId) {
          success
        }
      }
    `);

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

  const data = usePreloadedQuery<LoginSessionQueryType>(
    LoginSessionQuery,
    deferredQueryRef,
  );

  const revokeSession = async (record: LoginSessionNodeInList) => {
    try {
      const res = await revokeSessionMutation({
        sessionId: toLocalId(record.id),
      });
      if (!res.myRevokeLoginSession?.success) {
        message.error(t('loginSession.RevokeFailed'));
        return;
      }
      message.success(t('loginSession.RevokeSucceeded'));
      onReload(queryRef.variables, { fetchPolicy: 'network-only' });
    } catch (error) {
      message.error(
        (Array.isArray(error)
          ? error[0]?.message
          : (error as Error)?.message) ?? t('loginSession.RevokeFailed'),
      );
    }
  };

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
              key: 'accessKey',
              propertyLabel: t('loginSession.AccessKey'),
              type: 'string',
              fixedOperator: 'contains',
            },
            {
              key: 'createdAt',
              propertyLabel: t('loginSession.CreatedAt'),
              type: 'datetime',
              defaultOperator: 'after',
            },
          ]}
        />
        <BAIFetchKeyButton
          value=""
          onChange={() => {
            onReload(queryRef.variables, { fetchPolicy: 'network-only' });
          }}
          loading={isRefetching}
          autoUpdateDelay={7_000}
        />
      </BAIFlex>
      <BAILoginSessionTable
        resizable
        loading={isRefetching}
        order={order}
        onChangeOrder={(nextOrder) => {
          onReload(
            {
              ...queryRef.variables,
              orderBy: convertToOrderBy<LoginSessionOrderBy>(nextOrder),
              offset: 0,
            },
            { fetchPolicy: 'network-only' },
          );
        }}
        pagination={{
          pageSize,
          current,
          total: data.myLoginSessionsV2?.count ?? 0,
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
        customizeColumns={(baseColumns) =>
          _.map(baseColumns, (column) =>
            column.key === 'user'
              ? {
                  ...column,
                  render: (__: unknown, record: LoginSessionNodeInList) => (
                    <BAINameActionCell
                      title={record.user?.basicInfo.email || '-'}
                      showActions="always"
                      actions={filterOutEmpty([
                        {
                          key: 'revoke',
                          title: t('loginSession.RevokeSession'),
                          icon: <LogoutOutlined />,
                          type: 'danger' as const,
                          popConfirm: {
                            title: t('loginSession.RevokeSessionConfirm'),
                            description: record.accessKey,
                            okText: t('button.Revoke'),
                            okButtonProps: { danger: true },
                            cancelText: t('button.Cancel'),
                            onConfirm: () => revokeSession(record),
                          },
                        },
                      ])}
                    />
                  ),
                }
              : column,
          )
        }
        loginSessionsFrgmt={filterOutNullAndUndefined(
          _.map(data.myLoginSessionsV2?.edges, 'node'),
        )}
        {...tableProps}
      />
    </BAIFlex>
  );
};

export default LoginSession;
