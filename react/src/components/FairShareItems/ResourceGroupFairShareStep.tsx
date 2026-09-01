/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  ResourceGroupFairShareStepQuery,
  ResourceGroupOrderBy,
} from '../../__generated__/ResourceGroupFairShareStepQuery.graphql';
import { convertToOrderBy } from '../../helper';
import { useBAIPaginationOptionStateOnSearchParam } from '../../hooks/reactPaginationQueryOptions';
import FairShareStepToolbar from './FairShareStepToolbar';
import ResourceGroupFairShareTable, {
  availableResourceGroupSorterValues,
  resourceGroupOrderFieldMap,
} from './ResourceGroupFairShareTable';
import { BAIFlex, INITIAL_FETCH_KEY, useFetchKey } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface ResourceGroupFairShareStepProps {
  loading?: boolean;
  onClickResourceGroupName?: (resourceGroupName: string) => void;
}

const ResourceGroupFairShareStep: React.FC<ResourceGroupFairShareStepProps> = ({
  loading,
  onClickResourceGroupName,
}) => {
  'use memo';

  const { t } = useTranslation();

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
      order: parseAsStringLiteral(availableResourceGroupSorterValues),
      filter: parseAsJson<any>((value) => value),
    },
    {
      history: 'replace',
    },
  );

  const queryVariables = {
    filter: {
      ...(queryParams.filter || {}),
    },
    order: convertToOrderBy<ResourceGroupOrderBy>(
      queryParams.order,
      resourceGroupOrderFieldMap,
    ) || [{ field: 'NAME', direction: 'DESC' }],
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { resourceGroups } = useLazyLoadQuery<ResourceGroupFairShareStepQuery>(
    graphql`
      query ResourceGroupFairShareStepQuery(
        $filter: ResourceGroupFilter
        $order: [ResourceGroupOrderBy!]
        $limit: Int
        $offset: Int
      ) {
        resourceGroups: adminResourceGroups(
          filter: $filter
          orderBy: $order
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              ...ResourceGroupFairShareTableFragment
            }
          }
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchKey: deferredFetchKey,
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
    },
  );

  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      <FairShareStepToolbar
        filterProperties={[
          {
            key: 'name',
            propertyLabel: t('fairShare.Name'),
            type: 'string',
          },
        ]}
        filterValue={queryParams.filter || {}}
        onChangeFilter={(filter) => {
          setQueryParams({
            filter: filter || null,
          });
          setTablePaginationOption({ current: 1 });
        }}
        fetchKeyLoading={fetchKey !== deferredFetchKey}
        onRefresh={() => {
          updateFetchKey();
        }}
      />
      <ResourceGroupFairShareTable
        resourceGroupNodeFragment={
          resourceGroups?.edges?.map((edge) => edge?.node) || null
        }
        onClickGroupName={(name) => {
          onClickResourceGroupName?.(name);
        }}
        afterUpdate={() => {
          updateFetchKey();
        }}
        loading={
          loading ||
          queryVariables !== deferredQueryVariables ||
          fetchKey !== deferredFetchKey
        }
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          total: resourceGroups?.count || 0,
          current: tablePaginationOption.current,
          onChange: (current, pageSize) => {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({
                current,
                pageSize,
              });
            }
          },
        }}
      />
    </BAIFlex>
  );
};

export default ResourceGroupFairShareStep;
