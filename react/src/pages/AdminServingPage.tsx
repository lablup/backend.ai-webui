/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AdminServingPageQuery } from '../__generated__/AdminServingPageQuery.graphql';
import BAIRadioGroup from '../components/BAIRadioGroup';
import EndpointList from '../components/EndpointList';
import { useBAIPaginationOptionStateOnSearchParamLegacy } from '../hooks/reactPaginationQueryOptions';
import { Skeleton, theme } from 'antd';
import {
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  BAIPropertyFilter,
  filterOutEmpty,
  mergeFilterValues,
  useUpdatableState,
} from 'backend.ai-ui';
import _ from 'lodash';
import React, { Suspense, useDeferredValue, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { StringParam, useQueryParams, withDefault } from 'use-query-params';

const AdminServingPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [queryParams, setQuery] = useQueryParams({
    order: withDefault(StringParam, '-created_at'),
    filter: StringParam,
    lifecycleStage: withDefault(StringParam, 'active'),
  });

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParamLegacy({
    current: 1,
    pageSize: 10,
  });

  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');

  const lifecycleStageFilter =
    queryParams.lifecycleStage === 'active'
      ? `lifecycle_stage != "destroyed"`
      : `lifecycle_stage == "${queryParams.lifecycleStage}"`;

  const queryVariables = useMemo(
    () => ({
      offset: baiPaginationOption.offset,
      limit: baiPaginationOption.limit,
      filter: mergeFilterValues([lifecycleStageFilter, queryParams.filter]),
      order: queryParams.order,
    }),
    [baiPaginationOption, lifecycleStageFilter, queryParams],
  );

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { endpoint_list } = useLazyLoadQuery<AdminServingPageQuery>(
    graphql`
      query AdminServingPageQuery(
        $offset: Int!
        $limit: Int!
        $filter: String
        $order: String
      ) {
        endpoint_list(
          offset: $offset
          limit: $limit
          filter: $filter
          order: $order
        ) {
          total_count
          items {
            ...EndpointListFragment
          }
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchPolicy:
        deferredFetchKey === 'initial-fetch'
          ? 'store-and-network'
          : 'network-only',
      fetchKey:
        deferredFetchKey === 'initial-fetch' ? undefined : deferredFetchKey,
    },
  );

  return (
    <BAIFlex direction="column" align="stretch" gap={'md'}>
      <BAICard
        title={t('webui.menu.Serving')}
        extra={
          <BAIFetchKeyButton
            value={fetchKey}
            onChange={updateFetchKey}
            autoUpdateDelay={7_000}
            loading={
              deferredQueryVariables !== queryVariables ||
              deferredFetchKey !== fetchKey
            }
          />
        }
        styles={{
          body: {
            padding: 0,
            paddingTop: 1,
            overflow: 'hidden',
          },
        }}
      >
        <BAIFlex
          direction="column"
          align="stretch"
          gap={'sm'}
          style={{ padding: token.paddingMD }}
        >
          <BAIFlex direction="row" justify="between" wrap="wrap" gap={'sm'}>
            <BAIFlex
              gap={'sm'}
              align="start"
              wrap="wrap"
              style={{ flexShrink: 1 }}
            >
              <BAIRadioGroup
                value={queryParams.lifecycleStage}
                onChange={(e) => {
                  setQuery({ lifecycleStage: e.target.value }, 'replaceIn');
                  setTablePaginationOption({ current: 1 });
                }}
                optionType="button"
                buttonStyle="solid"
                options={[
                  {
                    label: t('modelService.Active'),
                    value: 'active',
                  },
                  {
                    label: t('modelService.Destroyed'),
                    value: 'destroyed',
                  },
                ]}
              />
              <BAIPropertyFilter
                filterProperties={filterOutEmpty([
                  {
                    key: 'name',
                    type: 'string',
                    propertyLabel: t('modelService.EndpointName'),
                  },
                  {
                    key: 'url',
                    type: 'string',
                    propertyLabel: t('modelService.ServiceEndpoint'),
                  },
                  {
                    key: 'created_user_email',
                    type: 'string',
                    propertyLabel: t('modelService.Owner'),
                  },
                ])}
                value={queryParams.filter || undefined}
                onChange={(value) => {
                  setQuery({ filter: value }, 'replaceIn');
                  setTablePaginationOption({ current: 1 });
                }}
              />
            </BAIFlex>
          </BAIFlex>
          <Suspense fallback={<Skeleton active />}>
            <EndpointList
              // @ts-expect-error - Relay fragment type mismatch
              endpointsFrgmt={endpoint_list?.items}
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                current: tablePaginationOption.current,
                total: endpoint_list?.total_count,
                onChange(current, pageSize) {
                  if (_.isNumber(current) && _.isNumber(pageSize)) {
                    setTablePaginationOption({ current, pageSize });
                  }
                },
              }}
              order={queryParams.order}
              loading={
                deferredQueryVariables !== queryVariables ||
                deferredFetchKey !== fetchKey
              }
              onChangeOrder={(order) => {
                setQuery({ order }, 'replaceIn');
              }}
              onDeleted={() => {
                updateFetchKey();
              }}
              isAdminMode
            />
          </Suspense>
        </BAIFlex>
      </BAICard>
    </BAIFlex>
  );
};

export default AdminServingPage;
