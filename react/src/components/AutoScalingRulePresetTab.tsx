/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  AutoScalingRulePresetTabQuery,
  AutoScalingRulePresetTabQuery$variables,
  QueryDefinitionFilter,
} from '../__generated__/AutoScalingRulePresetTabQuery.graphql';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import PrometheusQueryPresetList from './PrometheusQueryPresetList';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Skeleton } from 'antd';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  type GraphQLFilter,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsJson, useQueryStates } from 'nuqs';
import React, { Suspense, useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const AutoScalingRulePresetTab: React.FC = () => {
  'use memo';
  const { t } = useTranslation();

  const [queryParam, setQueryParam] = useQueryStates(
    {
      filter: parseAsJson<GraphQLFilter>((value) => value as GraphQLFilter),
    },
    { history: 'push' },
  );

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [fetchKey, updateFetchKey] = useFetchKey();

  // QueryDefinitionFilter only supports a flat `name` filter today, so collapse
  // any AND/OR wrapper produced by BAIGraphQLPropertyFilter back to a flat object.
  const flattenGraphQLFilter = (
    filter: GraphQLFilter | null | undefined,
  ): QueryDefinitionFilter | null => {
    if (!filter) return null;
    if (filter.AND && Array.isArray(filter.AND)) {
      return Object.assign({}, ...filter.AND) as QueryDefinitionFilter;
    }
    if (filter.OR && Array.isArray(filter.OR)) {
      return Object.assign({}, ...filter.OR) as QueryDefinitionFilter;
    }
    return filter as QueryDefinitionFilter;
  };

  const queryVariables: AutoScalingRulePresetTabQuery$variables = {
    offset: baiPaginationOption.offset,
    limit: baiPaginationOption.limit,
    filter: flattenGraphQLFilter(queryParam.filter),
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { prometheusQueryPresets } =
    useLazyLoadQuery<AutoScalingRulePresetTabQuery>(
      graphql`
        query AutoScalingRulePresetTabQuery(
          $offset: Int
          $limit: Int
          $filter: QueryDefinitionFilter
        ) {
          prometheusQueryPresets(
            offset: $offset
            limit: $limit
            filter: $filter
          ) {
            count
            edges {
              node {
                id
                ...PrometheusQueryPresetListFragment
              }
            }
          }
        }
      `,
      deferredQueryVariables,
      {
        fetchPolicy:
          deferredFetchKey === INITIAL_FETCH_KEY
            ? 'store-and-network'
            : 'network-only',
        fetchKey:
          deferredFetchKey === INITIAL_FETCH_KEY ? undefined : deferredFetchKey,
      },
    );

  const isPending =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  const presetNodes = _.compact(
    _.map(prometheusQueryPresets?.edges, (edge) => edge?.node),
  );

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex direction="row" justify="between" wrap="wrap" gap="sm">
        <BAIFlex gap="sm" align="start" wrap="wrap" style={{ flexShrink: 1 }}>
          <BAIGraphQLPropertyFilter
            combinationMode="AND"
            value={queryParam.filter ?? undefined}
            onChange={(value) => {
              setQueryParam({ filter: value ?? null });
              setTablePaginationOption({ current: 1 });
            }}
            filterProperties={[
              {
                key: 'name',
                propertyLabel: t('prometheusQueryPreset.Name'),
                type: 'string',
              },
            ]}
          />
        </BAIFlex>
        <BAIFlex gap="xs">
          <BAIFetchKeyButton
            value={fetchKey}
            onChange={updateFetchKey}
            loading={isPending}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled
            // TODO(needs-frontend): wire up create modal in FR-2451 sub-task 3
          >
            {t('prometheusQueryPreset.AddPreset')}
          </Button>
        </BAIFlex>
      </BAIFlex>
      <Suspense fallback={<Skeleton active />}>
        <PrometheusQueryPresetList
          presetsFrgmt={presetNodes}
          loading={isPending}
          pagination={{
            pageSize: tablePaginationOption.pageSize,
            current: tablePaginationOption.current,
            total: prometheusQueryPresets?.count,
            onChange(current, pageSize) {
              if (_.isNumber(current) && _.isNumber(pageSize)) {
                setTablePaginationOption({ current, pageSize });
              }
            },
          }}
        />
      </Suspense>
    </BAIFlex>
  );
};

export default AutoScalingRulePresetTab;
