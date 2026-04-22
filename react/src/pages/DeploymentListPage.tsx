/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DeploymentFilter,
  DeploymentListPageQuery,
  DeploymentOrderBy,
} from '../__generated__/DeploymentListPageQuery.graphql';
import DeploymentList, { DeploymentSort } from '../components/DeploymentList';
import { useWebUINavigate } from '../hooks';
import { Button } from 'antd';
import { BAICard, BAIFlex, toLocalId } from 'backend.ai-ui';
import { PlusIcon } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import React, { useDeferredValue, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Parse the JSON-serialized `GraphQLFilter` stored in the URL back into the
 * shape accepted by the `myDeployments(filter: DeploymentFilter)` query
 * variable. Invalid / empty values become `undefined` so the server applies
 * no filter.
 */
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
 * Serialize a structured sort value into the JSON URL state and back.
 *
 * The `sort` URL parameter is stored as a JSON string so that both the
 * `field` enum value and `order` direction survive a round-trip through
 * `nuqs`. An absent / malformed value is treated as "no sort" and falls
 * back to the server default (most recently created first).
 */
const parseSortString = (raw: string | null): DeploymentSort | undefined => {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.field === 'string' &&
      (parsed.order === 'ASC' || parsed.order === 'DESC')
    ) {
      return parsed as DeploymentSort;
    }
    return undefined;
  } catch {
    return undefined;
  }
};

const stringifySort = (sort: DeploymentSort | undefined): string | null => {
  if (!sort) return null;
  return JSON.stringify(sort);
};

/**
 * User-facing deployment list page. Owns the `myDeployments` Relay query
 * and feeds the returned connection into `<DeploymentList mode="user" />`.
 *
 * URL-synced state (filter / sort / page / pageSize) is managed via `nuqs`
 * so the view survives refreshes and can be shared via link.
 */
const DeploymentListPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const webuiNavigate = useWebUINavigate();

  const [queryParams, setQueryParams] = useQueryStates(
    {
      filter: parseAsString,
      sort: parseAsString,
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(10),
    },
    { history: 'push' },
  );

  const sort = parseSortString(queryParams.sort);

  const queryVariables = useMemo(() => {
    const orderBy: DeploymentOrderBy[] | undefined = sort
      ? [
          {
            field: sort.field as DeploymentOrderBy['field'],
            direction: sort.order,
          },
        ]
      : undefined;
    return {
      filter: parseFilterForQuery(queryParams.filter),
      orderBy,
      first: queryParams.pageSize,
      offset:
        queryParams.page > 1
          ? (queryParams.page - 1) * queryParams.pageSize
          : 0,
    };
  }, [queryParams.filter, queryParams.page, queryParams.pageSize, sort]);

  const deferredQueryVariables = useDeferredValue(queryVariables);

  const { myDeployments } = useLazyLoadQuery<DeploymentListPageQuery>(
    graphql`
      query DeploymentListPageQuery(
        $filter: DeploymentFilter
        $orderBy: [DeploymentOrderBy!]
        $first: Int
        $offset: Int
      ) {
        myDeployments(
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
    { fetchPolicy: 'store-and-network' },
  );

  const isPending = deferredQueryVariables !== queryVariables;

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAICard
        variant="borderless"
        title={t('deployment.Deployments')}
        extra={
          <Button
            type="primary"
            icon={<PlusIcon size={16} />}
            onClick={() => webuiNavigate('/deployments/new')}
          >
            {t('deployment.CreateDeployment')}
          </Button>
        }
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
              setQueryParams({
                filter: value ? value : null,
                page: 1,
              });
            }}
            sort={sort}
            setSort={(value) => {
              setQueryParams({ sort: stringifySort(value) });
            }}
            page={queryParams.page}
            setPage={(value) => {
              setQueryParams({ page: value });
            }}
            pageSize={queryParams.pageSize}
            setPageSize={(value) => {
              setQueryParams({ pageSize: value });
            }}
            mode="user"
            loading={isPending}
            onRowClick={(deploymentId) => {
              // DeploymentList surfaces the global Relay ID; the route
              // expects a local UUID (see `/deployments/:deploymentId`).
              webuiNavigate(`/deployments/${toLocalId(deploymentId)}`);
            }}
          />
        ) : null}
      </BAICard>
    </BAIFlex>
  );
};

export default DeploymentListPage;
