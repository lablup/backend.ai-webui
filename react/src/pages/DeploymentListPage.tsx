/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DeploymentFilter,
  DeploymentListPageQuery,
  DeploymentOrderBy,
  DeploymentStatus,
} from '../__generated__/DeploymentListPageQuery.graphql';
import DeploymentList, {
  availableDeploymentOrderValues,
  tableOrderToSort,
  type DeploymentOrderValue,
  type DeploymentStatusCategory,
} from '../components/DeploymentList';
import { useWebUINavigate } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { Button } from 'antd';
import {
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  INITIAL_FETCH_KEY,
  toLocalId,
  useFetchKey,
} from 'backend.ai-ui';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { useDeferredValue, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const parseFilterForQuery = (
  filter: string | null,
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

/**
 * User-facing deployment list page. Owns the `myDeployments` Relay query
 * and feeds the returned connection into `<DeploymentList mode="user" />`.
 *
 * URL-synced state (filter / order / pagination) is managed via `nuqs`
 * so the view survives refreshes and can be shared via link.
 */
const DeploymentListPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const webuiNavigate = useWebUINavigate();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({ current: 1, pageSize: 10 });

  const [queryParams, setQueryParams] = useQueryStates(
    {
      filter: parseAsString,
      order: parseAsStringLiteral(availableDeploymentOrderValues),
      statusCategory: parseAsStringLiteral<DeploymentStatusCategory>([
        'running',
        'finished',
      ]).withDefault('running'),
    },
    { history: 'replace' },
  );

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.DeploymentListPage',
  );

  const [fetchKey, updateFetchKey] = useFetchKey();

  const queryVariables = useMemo(() => {
    const sort = tableOrderToSort(queryParams.order);
    const orderBy: DeploymentOrderBy[] | undefined = sort
      ? [
          {
            field: sort.field as DeploymentOrderBy['field'],
            direction: sort.order as DeploymentOrderBy['direction'],
          },
        ]
      : undefined;
    const finishedStatuses: ReadonlyArray<DeploymentStatus> = ['STOPPED'];
    const statusCategoryFilter: DeploymentFilter =
      queryParams.statusCategory === 'finished'
        ? { status: { in: finishedStatuses } }
        : { status: { notIn: finishedStatuses } };
    const userFilter = parseFilterForQuery(queryParams.filter);
    return {
      filter: { ...userFilter, ...statusCategoryFilter },
      orderBy,
      limit: baiPaginationOption.limit,
      offset: baiPaginationOption.offset,
    };
  }, [
    queryParams.filter,
    queryParams.order,
    queryParams.statusCategory,
    baiPaginationOption.limit,
    baiPaginationOption.offset,
  ]);

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { myDeployments } = useLazyLoadQuery<DeploymentListPageQuery>(
    graphql`
      query DeploymentListPageQuery(
        $filter: DeploymentFilter
        $orderBy: [DeploymentOrderBy!]
        $limit: Int
        $offset: Int
      ) {
        myDeployments(
          filter: $filter
          orderBy: $orderBy
          limit: $limit
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

  const isPending =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAICard
        variant="borderless"
        title={t('deployment.Deployments')}
        styles={{
          header: { borderBottom: 'none' },
          body: { paddingTop: 0 },
        }}
      >
        {myDeployments ? (
          <DeploymentList
            deploymentsFrgmt={myDeployments}
            filter={queryParams.filter ?? undefined}
            setFilter={(value) => {
              setQueryParams({ filter: value || null });
              setTablePaginationOption({ current: 1 });
            }}
            order={queryParams.order ?? undefined}
            onChangeOrder={(order) => {
              setQueryParams({
                order: (order as DeploymentOrderValue) ?? null,
              });
            }}
            statusCategory={queryParams.statusCategory}
            onStatusCategoryChange={(value) => {
              setQueryParams({ statusCategory: value });
              setTablePaginationOption({ current: 1 });
            }}
            pagination={{
              ...tablePaginationOption,
              onChange: (current, pageSize) => {
                setTablePaginationOption({ current, pageSize });
              },
            }}
            tableSettings={{
              columnOverrides,
              onColumnOverridesChange: setColumnOverrides,
            }}
            mode="user"
            loading={isPending}
            onRowClick={(deploymentId) => {
              webuiNavigate(`/deployments/${toLocalId(deploymentId)}`);
            }}
            toolbarEnd={
              <BAIFlex gap="xs" align="center">
                <BAIFetchKeyButton
                  value={fetchKey}
                  onChange={updateFetchKey}
                  loading={isPending}
                />
                <Button
                  type="primary"
                  onClick={() => webuiNavigate('/deployments/start')}
                >
                  {t('deployment.CreateDeployment')}
                </Button>
              </BAIFlex>
            }
          />
        ) : null}
      </BAICard>
    </BAIFlex>
  );
};

export default DeploymentListPage;
