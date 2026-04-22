/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  AdminDeploymentListPageQuery,
  DeploymentFilter,
  DeploymentOrderBy,
  DeploymentOrderField,
  OrderDirection,
} from '../__generated__/AdminDeploymentListPageQuery.graphql';
import DeploymentList, {
  type DeploymentSort,
} from '../components/DeploymentList';
import { useWebUINavigate } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { Skeleton } from 'antd';
import {
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  INITIAL_FETCH_KEY,
  toLocalId,
  useFetchKey,
} from 'backend.ai-ui';
import { parseAsString, useQueryStates } from 'nuqs';
import React, { Suspense, useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Encode a `DeploymentSort` into a compact URL-friendly string (e.g.
 * `CREATED_AT:DESC`). Empty / undefined sorts are serialized as an empty
 * string so `nuqs` drops the param from the URL.
 */
const encodeSort = (sort: DeploymentSort | undefined): string => {
  if (!sort) return '';
  return `${sort.field}:${sort.order}`;
};

const decodeSort = (
  value: string | null | undefined,
): DeploymentSort | undefined => {
  if (!value) return undefined;
  const [field, order] = value.split(':');
  if (!field || (order !== 'ASC' && order !== 'DESC')) return undefined;
  return { field, order };
};

/**
 * Safely parse the JSON-serialized `filter` URL param into a
 * `DeploymentFilter`. Invalid payloads degrade to "no filter" so a
 * malformed URL never crashes the page.
 */
const parseFilterVariable = (
  filter: string | null | undefined,
): DeploymentFilter | undefined => {
  if (!filter) return undefined;
  try {
    const parsed = JSON.parse(filter);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as DeploymentFilter;
    }
    return undefined;
  } catch {
    return undefined;
  }
};

const toOrderBy = (
  sort: DeploymentSort | undefined,
): DeploymentOrderBy[] | undefined => {
  if (!sort) return undefined;
  return [
    {
      field: sort.field as DeploymentOrderField,
      direction: sort.order as OrderDirection,
    },
  ];
};

const AdminDeploymentListPageContent: React.FC = () => {
  'use memo';
  const webUINavigate = useWebUINavigate();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQueryParams] = useQueryStates(
    {
      filter: parseAsString.withDefault(''),
      sort: parseAsString.withDefault(''),
    },
    {
      history: 'replace',
    },
  );

  const sort = decodeSort(queryParams.sort);

  const [fetchKey, updateFetchKey] = useFetchKey();

  const queryVariables = {
    filter: parseFilterVariable(queryParams.filter),
    orderBy: toOrderBy(sort),
    first: baiPaginationOption.first ?? baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { adminDeployments } = useLazyLoadQuery<AdminDeploymentListPageQuery>(
    graphql`
      query AdminDeploymentListPageQuery(
        $filter: DeploymentFilter
        $orderBy: [DeploymentOrderBy!]
        $first: Int
        $offset: Int
      ) {
        adminDeployments(
          filter: $filter
          orderBy: $orderBy
          first: $first
          offset: $offset
        ) {
          ...DeploymentList_modelDeploymentConnection
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
      fetchKey: deferredFetchKey,
    },
  );

  const isLoading =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex direction="row" justify="end">
        <BAIFetchKeyButton
          value={fetchKey}
          onChange={updateFetchKey}
          autoUpdateDelay={15_000}
          loading={isLoading}
        />
      </BAIFlex>
      {adminDeployments ? (
        <DeploymentList
          mode="admin"
          deploymentsFrgmt={adminDeployments}
          filter={queryParams.filter}
          setFilter={(value) => {
            setQueryParams({ filter: value || null });
            setTablePaginationOption({ current: 1 });
          }}
          sort={sort}
          setSort={(value) => {
            setQueryParams({ sort: encodeSort(value) || null });
          }}
          page={tablePaginationOption.current}
          setPage={(value) => {
            setTablePaginationOption({ current: value });
          }}
          pageSize={tablePaginationOption.pageSize}
          setPageSize={(value) => {
            setTablePaginationOption({ current: 1, pageSize: value });
          }}
          loading={isLoading}
          onRowClick={(deploymentId) => {
            webUINavigate(`/deployments/${toLocalId(deploymentId)}`);
          }}
        />
      ) : null}
    </BAIFlex>
  );
};

const AdminDeploymentListPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();

  return (
    <BAICard title={t('deployment.AdminDeployments')}>
      <Suspense fallback={<Skeleton active />}>
        <AdminDeploymentListPageContent />
      </Suspense>
    </BAICard>
  );
};

export default AdminDeploymentListPage;
