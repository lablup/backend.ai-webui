import BAIFetchKeyButton from '../components/BAIFetchKeyButton';
import DeploymentList from '../components/DeploymentList';
import { INITIAL_FETCH_KEY, useFetchKey } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useDeferredQueryParams } from '../hooks/useDeferredQueryParams';
import { Button } from 'antd';
import {
  BAICard,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import _ from 'lodash';
import React, { useDeferredValue, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { DeploymentListPageQuery } from 'src/__generated__/DeploymentListPageQuery.graphql';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';
import { StringParam, withDefault } from 'use-query-params';

const DeploymentListPage: React.FC = () => {
  const { t } = useTranslation();

  const { tablePaginationOption, setTablePaginationOption } =
    useBAIPaginationOptionStateOnSearchParam({
      current: 1,
      pageSize: 10,
    });

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.DeploymentListPage',
  );

  const [fetchKey, updateFetchKey] = useFetchKey();

  const [queryParams, setQuery] = useDeferredQueryParams({
    order: withDefault(StringParam, '-created_at'),
    filter: withDefault(StringParam, undefined),
  });

  const queryVariables = useMemo(
    () => ({
      filter: queryParams.filter ? JSON.parse(queryParams.filter) : undefined,
      first: tablePaginationOption.pageSize,
    }),
    [queryParams.filter, tablePaginationOption.pageSize],
  );

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const deployments = useLazyLoadQuery<DeploymentListPageQuery>(
    graphql`
      query DeploymentListPageQuery($filter: DeploymentFilter, $first: Int) {
        deployments(filter: $filter, first: $first) {
          edges {
            node {
              id
              ...DeploymentListFragment
            }
          }
          count
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

  return (
    <BAIFlex direction="column" align="stretch" gap={'md'}>
      {/* <Row gutter={[16, 16]}>
        <Col span={24}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t('deployment.Deployments')}
          </Typography.Title>
        </Col>
      </Row> */}

      <BAICard
        variant="borderless"
        title={t('deployment.DeploymentList')}
        extra={
          <BAIFlex gap={'xs'}>
            <BAIFetchKeyButton
              loading={false}
              autoUpdateDelay={15_000}
              value={fetchKey}
              onChange={(newFetchKey) => {
                updateFetchKey(newFetchKey);
              }}
            />
            <Button type="primary">{t('deployment.CreateDeployment')}</Button>
          </BAIFlex>
        }
        styles={{
          header: {
            borderBottom: 'none',
          },
          body: {
            paddingTop: 0,
          },
        }}
      >
        <BAIFlex direction="column" align="stretch" gap={'sm'}>
          <BAIFlex justify="between" wrap="wrap" gap={'sm'}>
            <BAIFlex
              gap={'sm'}
              align="start"
              style={{
                flexShrink: 1,
              }}
              wrap="wrap"
            >
              <BAIGraphQLPropertyFilter
                filterProperties={[
                  {
                    key: 'name',
                    propertyLabel: t('deployment.Name'),
                    type: 'string',
                  },
                  {
                    key: 'status',
                    propertyLabel: t('deployment.Status'),
                    type: 'enum',
                    options: [
                      { label: 'Created', value: 'CREATED' },
                      { label: 'Deploying', value: 'DEPLOYING' },
                      { label: 'Ready', value: 'READY' },
                      { label: 'Stopping', value: 'STOPPING' },
                      { label: 'Stopped', value: 'STOPPED' },
                    ],
                    strictSelection: true,
                  },
                  {
                    key: 'openToPublic',
                    propertyLabel: t('deployment.Public'),
                    type: 'boolean',
                  },
                  {
                    key: 'tags',
                    propertyLabel: t('deployment.Tags'),
                    type: 'string',
                  },
                ]}
                combinationMode="AND"
                value={
                  queryParams.filter
                    ? JSON.parse(queryParams.filter)
                    : undefined
                }
                onChange={(value) => {
                  setQuery(
                    { filter: value ? JSON.stringify(value) : undefined },
                    'replaceIn',
                  );
                  setTablePaginationOption({ current: 1 });
                }}
              />
            </BAIFlex>
          </BAIFlex>

          <DeploymentList
            deploymentsFragment={filterOutNullAndUndefined(
              _.map(deployments?.deployments?.edges, (edge) => edge?.node),
            )}
            loading={false}
            pagination={{
              pageSize: tablePaginationOption.pageSize,
              current: tablePaginationOption.current,
              total: deployments?.deployments?.count || 0,
              onChange: (current, pageSize) => {
                if (_.isNumber(current) && _.isNumber(pageSize)) {
                  setTablePaginationOption({ current, pageSize });
                }
              },
            }}
            onChangeOrder={(order) => {
              setQuery({ order }, 'replaceIn');
            }}
            tableSettings={{
              columnOverrides: columnOverrides,
              onColumnOverridesChange: setColumnOverrides,
            }}
          />
        </BAIFlex>
      </BAICard>
    </BAIFlex>
  );
};

export default DeploymentListPage;
