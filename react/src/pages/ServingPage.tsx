import BAICard from '../components/BAICard';
import BAIFetchKeyButton from '../components/BAIFetchKeyButton';
import BAIPropertyFilter, {
  mergeFilterValues,
} from '../components/BAIPropertyFilter';
import BAIRadioGroup from '../components/BAIRadioGroup';
import EndpointList from '../components/EndpointList';
import Flex from '../components/Flex';
import { filterEmptyItem } from '../helper';
import { useUpdatableState, useWebUINavigate } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useDeferredQueryParams } from '../hooks/useDeferredQueryParams';
import { ServingPageQuery } from './__generated__/ServingPageQuery.graphql';
import { Button, Skeleton, theme, Typography } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React, { Suspense, useDeferredValue, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';
import { StringParam, withDefault } from 'use-query-params';

const ServingPage: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const currentUserRole = useCurrentUserRole();
  const webuiNavigate = useWebUINavigate();
  const currentProject = useCurrentProjectValue();

  const [queryParams, setQuery] = useDeferredQueryParams({
    order: StringParam,
    filter: StringParam,
    lifecycleStage: withDefault(StringParam, 'created&destroying'),
  });

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 10,
  });

  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');

  const lifecycleStageFilter =
    queryParams.lifecycleStage === 'created&destroying'
      ? `lifecycle_stage == "created" | lifecycle_stage == "destroying"`
      : `lifecycle_stage == "${queryParams.lifecycleStage}"`;

  const queryVariables = useMemo(
    () => ({
      offset: baiPaginationOption.offset,
      limit: baiPaginationOption.limit,
      projectID: currentProject.id,
      filter: mergeFilterValues([lifecycleStageFilter, queryParams.filter]),
      order: queryParams.order,
    }),
    [baiPaginationOption, currentProject.id, lifecycleStageFilter, queryParams],
  );

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { endpoint_list } = useLazyLoadQuery<ServingPageQuery>(
    graphql`
      query ServingPageQuery(
        $offset: Int!
        $limit: Int!
        $projectID: UUID
        $filter: String
        $order: String
      ) {
        endpoint_list(
          offset: $offset
          limit: $limit
          project: $projectID
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
    <Flex direction="column" align="stretch" gap={'md'}>
      <BAICard
        title={t('webui.menu.Serving')}
        extra={
          <Flex gap={'xs'}>
            <BAIFetchKeyButton
              value={fetchKey}
              onChange={updateFetchKey}
              autoUpdateDelay={7000}
              loading={
                deferredQueryVariables !== queryVariables ||
                deferredFetchKey !== fetchKey
              }
            />
            <Button
              type="primary"
              onClick={() => webuiNavigate('/service/start')}
            >
              {t('modelService.StartService')}
            </Button>
          </Flex>
        }
        styles={{
          body: {
            padding: 0,
            paddingTop: 1,
            overflow: 'hidden',
          },
        }}
      >
        <Flex
          direction="column"
          align="stretch"
          gap={'sm'}
          style={{ padding: token.paddingMD }}
        >
          <Flex direction="row" justify="between" wrap="wrap" gap={'sm'}>
            <Flex
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
                    label: 'Active',
                    value: 'created&destroying',
                  },
                  {
                    label: 'Destroyed',
                    value: 'destroyed',
                  },
                ]}
              />
              <BAIPropertyFilter
                filterProperties={filterEmptyItem([
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
                  currentUserRole === 'admin' && {
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
            </Flex>
          </Flex>
          <Suspense fallback={<Skeleton active />}>
            <EndpointList
              // @ts-ignore
              endpointsFrgmt={endpoint_list?.items}
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                current: tablePaginationOption.current,
                total: endpoint_list?.total_count,
                showTotal: (total) => (
                  <Typography.Text type="secondary">
                    {t('general.TotalItems', { total: total })}
                  </Typography.Text>
                ),
              }}
              loading={deferredQueryVariables !== queryVariables}
              onChange={({ current, pageSize }, filters, sorter) => {
                if (_.isNumber(current) && _.isNumber(pageSize)) {
                  setTablePaginationOption({ current, pageSize });
                }
                setQuery(
                  { order: transformSorterToOrderString(sorter) },
                  'replaceIn',
                );
              }}
              onDeleted={() => {
                updateFetchKey();
              }}
            />
          </Suspense>
        </Flex>
      </BAICard>
    </Flex>
  );
};

export default ServingPage;
