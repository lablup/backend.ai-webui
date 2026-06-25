import type {
  AuditLogOrderBy,
  AuditLogScope,
  RBACElementType,
  ScopedAuditLogQuery as ScopedAuditLogQueryType,
} from '../__generated__/ScopedAuditLogQuery.graphql';
import { convertToOrderBy } from '../helper';
import {
  BAIAuditLogNodes,
  type BAIAuditLogNodesProps,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  filterOutNullAndUndefined,
  useFetchKey,
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

export type { AuditLogScope };

export const ScopedAuditLogQuery = graphql`
  query ScopedAuditLogQuery(
    $scope: AuditLogScope!
    $filter: AuditLogFilter
    $orderBy: [AuditLogOrderBy!]
    $limit: Int
    $offset: Int
  ) {
    scopedAuditLogsV2(
      scope: $scope
      filter: $filter
      orderBy: $orderBy
      limit: $limit
      offset: $offset
    ) {
      count
      edges {
        node {
          ...BAIAuditLogNodesFragment
        }
      }
    }
  }
`;

export interface ScopedAuditLogProps extends Omit<
  BAIAuditLogNodesProps,
  | 'auditLogFrgmt'
  | 'loading'
  | 'order'
  | 'onChangeOrder'
  | 'dataSource'
  | 'pagination'
> {
  queryRef: PreloadedQuery<ScopedAuditLogQueryType>;
  onReload: (
    variables: ScopedAuditLogQueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void;
  /**
   * The RBAC entity types that make up this audit-log scope (e.g. for a
   * deployment view: `MODEL_DEPLOYMENT`, `DEPLOYMENT_TOKEN`,
   * `DEPLOYMENT_POLICY`, `DEPLOYMENT_REVISION`). When provided with more than
   * one type, an `entityType` enum drill-down filter is added to the filter bar
   * so users can narrow the (OR'd) scope to a single type. The consumer owns the
   * query scope; this prop only drives the filter UI.
   */
  scopeEntityTypes?: ReadonlyArray<RBACElementType>;
}

/**
 * ScopedAuditLog - Reads a preloaded `scopedAuditLogsV2` query and renders it as
 * a `BAIAuditLogNodes` table with a filter bar and a refresh button. Mirrors the
 * `DeploymentSchedulingHistoryModal` idiom: the consumer owns `useQueryLoader` /
 * `loadQuery` (and the scope); this view reads the `queryRef` via
 * `usePreloadedQuery` and re-runs filter / sort / refresh through `onReload`.
 * Reading the *deferred* `queryRef` keeps the previous rows visible while the
 * next result loads (inline loading, no Suspense-fallback flash). Render inside a
 * `Suspense` (+ `BAIErrorBoundary`) boundary.
 */
const ScopedAuditLog = ({
  queryRef,
  onReload,
  scopeEntityTypes,
  ...tableProps
}: ScopedAuditLogProps) => {
  'use memo';
  const { t } = useTranslation();
  const [fetchKey, updateFetchKey] = useFetchKey();

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

  const data = usePreloadedQuery<ScopedAuditLogQueryType>(
    ScopedAuditLogQuery,
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
            // Drill-down by entity type within the scope. Only meaningful when
            // the scope spans more than one entity type (e.g. a deployment scope
            // OR'ing MODEL_DEPLOYMENT + DEPLOYMENT_TOKEN/POLICY/REVISION); a
            // single-type scope has nothing to narrow.
            ...((scopeEntityTypes?.length ?? 0) > 1
              ? [
                  {
                    key: 'entityType',
                    propertyLabel: t('auditLog.EntityType'),
                    type: 'enum' as const,
                    strictSelection: true,
                    fixedOperator: 'equals' as const,
                    options: scopeEntityTypes?.map((value) => ({
                      label: value,
                      value,
                    })),
                  },
                ]
              : []),
            {
              key: 'status',
              propertyLabel: t('auditLog.Status'),
              type: 'enum',
              strictSelection: true,
              options: [
                { label: 'SUCCESS', value: 'SUCCESS' },
                { label: 'ERROR', value: 'ERROR' },
                { label: 'RUNNING', value: 'RUNNING' },
                { label: 'UNKNOWN', value: 'UNKNOWN' },
              ],
            },
            {
              key: 'operation',
              propertyLabel: t('auditLog.Operation'),
              type: 'string',
              fixedOperator: 'contains',
            },
            {
              key: 'triggeredBy',
              propertyLabel: t('auditLog.TriggeredBy'),
              type: 'string',
              fixedOperator: 'contains',
              placeholder: t('auditLog.TriggeredByFilterPlaceholder'),
            },
            {
              key: 'createdAt',
              propertyLabel: t('auditLog.Time'),
              type: 'datetime',
              defaultOperator: 'after',
            },
          ]}
        />
        <BAIFetchKeyButton
          value={fetchKey}
          onChange={(key) => {
            updateFetchKey(key);
            onReload(queryRef.variables, { fetchPolicy: 'network-only' });
          }}
          loading={isRefetching}
          autoUpdateDelay={7_000}
        />
      </BAIFlex>
      <BAIAuditLogNodes
        resizable
        loading={isRefetching}
        order={order}
        onChangeOrder={(nextOrder) => {
          onReload(
            {
              ...queryRef.variables,
              orderBy: convertToOrderBy<AuditLogOrderBy>(nextOrder),
              offset: 0,
            },
            { fetchPolicy: 'network-only' },
          );
        }}
        pagination={{
          pageSize,
          current,
          total: data.scopedAuditLogsV2?.count ?? 0,
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
        auditLogFrgmt={filterOutNullAndUndefined(
          _.map(data.scopedAuditLogsV2?.edges, 'node'),
        )}
        {...tableProps}
      />
    </BAIFlex>
  );
};

export default ScopedAuditLog;
