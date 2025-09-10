import { ServingPageQuery } from '../__generated__/ServingPageQuery.graphql';
import BAIFetchKeyButton from '../components/BAIFetchKeyButton';
import BAIRadioGroup from '../components/BAIRadioGroup';
import EndpointList from '../components/EndpointList';
import { useUpdatableState, useWebUINavigate } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { Button, Skeleton, theme } from 'antd';
import {
  filterOutEmpty,
  BAIFlex,
  BAICard,
  BAIPropertyFilter,
  mergeFilterValues,
} from 'backend.ai-ui';
import _ from 'lodash';
import React, { Suspense, useDeferredValue, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { StringParam, useQueryParams, withDefault } from 'use-query-params';

const ServingPage: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const currentUserRole = useCurrentUserRole();
  const webuiNavigate = useWebUINavigate();
  const currentProject = useCurrentProjectValue();

  const [queryParams, setQuery] = useQueryParams({
    order: withDefault(StringParam, '-created_at'),
    filter: StringParam,
    lifecycleStage: withDefault(StringParam, 'active'),
  });

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
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
    <BAIFlex direction="column" align="stretch" gap={'md'}>
      <BAICard
        title={t('webui.menu.Serving')}
        extra={
          <BAIFlex gap={'xs'}>
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
          </BAIFlex>
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
                    label: 'Active',
                    value: 'active',
                  },
                  {
                    label: 'Destroyed',
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
                  (currentUserRole === 'admin' ||
                    currentUserRole === 'superadmin') && {
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
              // @ts-ignore
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
              loading={deferredQueryVariables !== queryVariables}
              onChangeOrder={(order) => {
                setQuery({ order }, 'replaceIn');
              }}
              onDeleted={() => {
                updateFetchKey();
              }}
            />
          </Suspense>
        </BAIFlex>
      </BAICard>
    </BAIFlex>
  );
};

export default ServingPage;
