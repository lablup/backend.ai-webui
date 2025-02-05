import BAILink from '../components/BAILink';
import BAIPropertyFilter, {
  mergeFilterValues,
} from '../components/BAIPropertyFilter';
import Flex from '../components/Flex';
import SessionNodes from '../components/SessionNodes';
import { filterNonNullItems, transformSorterToOrderString } from '../helper';
import { useUpdatableState } from '../hooks';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useDeferredQueryParams } from '../hooks/useDeferredQueryParams';
import { useInterval } from '../hooks/useIntervalValue';
import { ComputeSessionListPageQuery } from './__generated__/ComputeSessionListPageQuery.graphql';
import { LoadingOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Radio, Spin, Tabs, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { startTransition, useRef, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';
import { StringParam, withDefault } from 'use-query-params';

type TypeFilterType = 'all' | 'interactive' | 'batch' | 'inference' | 'system';
const ComputeSessionListPage = () => {
  const currentProject = useCurrentProjectValue();

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 10,
  });
  const [isPendingPageOnChange, startTableOnChangeTransition] = useTransition();
  const [isPendingFilterChange, startFilterChangeTransition] = useTransition();
  const [isPendingTabChange, startTabChangeTransition] = useTransition();

  const [queryParams, setQuery] = useDeferredQueryParams({
    order: StringParam,
    filter: StringParam,
    type: withDefault(StringParam, 'all'),
    statusCategory: withDefault(StringParam, 'running'),
  });
  const queryMapRef = useRef({
    [queryParams.type]: queryParams,
  });
  //
  queryMapRef.current[queryParams.type] = queryParams;

  const typeFilter =
    queryParams.type === 'all' || queryParams.type === undefined
      ? undefined
      : `type == "${queryParams.type}"`;

  const statusFilter =
    queryParams.statusCategory === 'running' ||
    queryParams.statusCategory === undefined
      ? 'status != "TERMINATED" & status != "CANCELLED"'
      : 'status == "TERMINATED" | status == "CANCELLED"';

  const [fetchKey, updateFetchKey] = useUpdatableState('first');

  const { compute_session_nodes, allRunningSessionForCount } =
    useLazyLoadQuery<ComputeSessionListPageQuery>(
      graphql`
        query ComputeSessionListPageQuery(
          $projectId: UUID!
          $first: Int = 20
          $offset: Int = 0
          $filter: String
          $order: String
          $runningTypeFilter: String!
        ) {
          compute_session_nodes(
            project_id: $projectId
            first: $first
            offset: $offset
            filter: $filter
            order: $order
          ) {
            edges @required(action: THROW) {
              node @required(action: THROW) {
                id
                ...SessionNodesFragment
              }
            }
            count
          }
          allRunningSessionForCount: compute_session_nodes(
            project_id: $projectId
            first: 0
            offset: 0
            filter: $runningTypeFilter
          ) {
            count
          }
        }
      `,
      {
        projectId: currentProject.id,
        offset: baiPaginationOption.offset,
        first: baiPaginationOption.first,
        filter: mergeFilterValues([
          statusFilter,
          queryParams.filter,
          typeFilter,
        ]),
        order: queryParams.order,
        runningTypeFilter: 'status != "TERMINATED" & status != "CANCELLED"',
      },
      {
        fetchPolicy: 'network-only',
        fetchKey,
      },
    );

  useInterval(() => {
    startTransition(() => {
      updateFetchKey();
    });
  }, 15_000);

  return (
    <>
      {/* TODO: add legacy opener */}
      {/* <SessionDetailAndContainerLogOpenerForLegacy /> */}
      <Card
        bordered={false}
        title={t('webui.menu.Sessions')}
        extra={[
          <BAILink to={'/session/start'} key={'start-session'}>
            <Button type="primary">{t('session.launcher.Start')}</Button>
          </BAILink>,
        ]}
        styles={{
          header: {
            borderBottom: 'none',
          },
          body: {
            paddingTop: 0,
          },
        }}
      >
        {/* {mergeFilterValues([statusFilter, queryParams.filter, typeFilter])} */}
        <Tabs
          type="card"
          activeKey={queryParams.type}
          onChange={(key) => {
            startTabChangeTransition(() => {
              const storedQuery = queryMapRef.current[key] || {
                statusCategory: 'running',
              };
              setQuery(
                { ...storedQuery, type: key as TypeFilterType },
                'replace',
              );
              setTablePaginationOption({ current: 1 });
            });
          }}
          items={_.map(
            {
              all: t('general.All'),
              interactive: t('session.Interactive'),
              batch: t('session.Batch'),
              inference: t('session.Inference'),
              system: t('session.System'),
            },
            (label, key) => ({
              key,
              label: (
                <Flex justify="center" gap={10}>
                  {label}
                  {key === 'all' && (
                    <Badge
                      count={allRunningSessionForCount?.count}
                      color={token.colorPrimary}
                      size="small"
                      showZero
                      style={{
                        paddingRight: token.paddingXS,
                        paddingLeft: token.paddingXS,
                        fontSize: 10,
                      }}
                    />
                  )}
                  {/*  */}
                </Flex>
              ),
            }),
          )}
        />
        <Spin spinning={isPendingTabChange} indicator={<LoadingOutlined />}>
          <Flex direction="column" align="stretch" gap={'sm'}>
            <Flex gap={'sm'} align="start">
              <Radio.Group
                optionType="button"
                value={queryParams.statusCategory}
                onChange={(e) => {
                  startFilterChangeTransition(() => {
                    setQuery({ statusCategory: e.target.value }, 'replaceIn');
                    setTablePaginationOption({ current: 1 });
                  });
                }}
                options={[
                  {
                    label: 'Running',
                    value: 'running',
                  },
                  {
                    label: 'Finished',
                    value: 'finished',
                  },
                ]}
              />
              <BAIPropertyFilter
                filterProperties={[
                  {
                    key: 'name',
                    propertyLabel: t('session.SessionName'),
                    type: 'string',
                  },
                ]}
                value={queryParams.filter || undefined}
                onChange={(value) => {
                  startFilterChangeTransition(() => {
                    setQuery({ filter: value }, 'replaceIn');
                    setTablePaginationOption({ current: 1 });
                  });
                }}
              />
            </Flex>
            <SessionNodes
              rowSelection={
                queryParams.statusCategory !== 'finished'
                  ? {
                      type: 'checkbox',
                      // onChange: (selectedRowKeys, selectedRows) => {
                      //   console.log(
                      //     `selectedRowKeys: ${selectedRowKeys}`,
                      //     'selectedRows: ',
                      //     selectedRows,
                      //   );
                      // },
                    }
                  : undefined
              }
              sessionsFrgmt={filterNonNullItems(
                compute_session_nodes?.edges.map((e) => e?.node),
              )}
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                current: tablePaginationOption.current,
                total: compute_session_nodes?.count ?? 0,
                // showTotal: (total) => {
                //   return total;
                // },
              }}
              loading={{
                spinning: isPendingPageOnChange || isPendingFilterChange,
                indicator: <LoadingOutlined />,
              }}
              onChange={({ current, pageSize }, filters, sorter) => {
                startTableOnChangeTransition(() => {
                  if (_.isNumber(current) && _.isNumber(pageSize)) {
                    setTablePaginationOption({ current, pageSize });
                  }
                  setQuery(
                    { order: transformSorterToOrderString(sorter) },
                    'replaceIn',
                  );
                });
              }}
            />
          </Flex>
        </Spin>
      </Card>
    </>
  );
};

export default ComputeSessionListPage;
