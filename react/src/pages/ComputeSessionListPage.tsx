import BAILink from '../components/BAILink';
import BAIPropertyFilter, {
  mergeFilterValues,
} from '../components/BAIPropertyFilter';
import Flex from '../components/Flex';
import SessionNodes from '../components/SessionNodes';
import { filterNonNullItems, transformSorterToOrderString } from '../helper';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { ComputeSessionListPageQuery } from './__generated__/ComputeSessionListPageQuery.graphql';
import { LoadingOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Radio, Tabs, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';
import {
  JsonParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';

type TypeFilterType = 'all' | 'interactive' | 'batch' | 'inference' | 'system';
const ComputeSessionList = () => {
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
  const [isPendingPageChange, startPageChangeTransition] = useTransition();
  const [isPendingFilterChange, startFilterChangeTransition] = useTransition();

  const [query, setQuery] = useQueryParams({
    order: StringParam,
    filterString: StringParam,
    typeFilterType: withDefault(StringParam, 'all'),
    runningFilterType: withDefault(StringParam, 'running'),
  });

  const { order, filterString, typeFilterType, runningFilterType } = query;

  const typeFilter =
    typeFilterType === 'all' ? undefined : `type == "${typeFilterType}"`;

  const statusFilter =
    runningFilterType === 'running'
      ? 'status != "TERMINATED" & status != "CANCELLED"'
      : 'status == "TERMINATED" | status == "CANCELLED"';

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
        filter: mergeFilterValues([statusFilter, filterString, typeFilter]),
        order,
        runningTypeFilter: 'status != "TERMINATED" & status != "CANCELLED"',
      },
      {
        fetchPolicy: 'network-only',
      },
    );

  return (
    <>
      {/* TODO: add legacy opener */}
      {/* <SessionDetailAndContainerLogOpenerForLegacy /> */}
      <Card
        bordered={false}
        title={t('webui.menu.Sessions')}
        extra={[
          <BAILink to={'/session/start'}>
            <Button type="primary">Start Session</Button>
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
        <Tabs
          type="card"
          activeKey={typeFilterType}
          onChange={(key) => {
            startFilterChangeTransition(() => {
              setQuery({ typeFilterType: key as TypeFilterType });
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
        <Flex direction="column" align="stretch" gap={'sm'}>
          <Flex gap={'sm'} align="start">
            <Radio.Group
              optionType="button"
              value={runningFilterType}
              onChange={(e) => {
                startFilterChangeTransition(() => {
                  setQuery({ runningFilterType: e.target.value });
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
              value={filterString || undefined}
              onChange={(value) => {
                startFilterChangeTransition(() => {
                  setQuery({ filterString: value });
                  setTablePaginationOption({ current: 1 });
                });
              }}
            />
          </Flex>
          <SessionNodes
            rowSelection={{
              type: 'checkbox',
              // onChange: (selectedRowKeys, selectedRows) => {
              //   console.log(
              //     `selectedRowKeys: ${selectedRowKeys}`,
              //     'selectedRows: ',
              //     selectedRows,
              //   );
              // },
            }}
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
              spinning: isPendingPageChange || isPendingFilterChange,
              indicator: <LoadingOutlined />,
            }}
            onChange={({ current, pageSize }, filters, sorter) => {
              startPageChangeTransition(() => {
                if (_.isNumber(current) && _.isNumber(pageSize)) {
                  setTablePaginationOption({ current, pageSize });
                }
                setQuery({ order: transformSorterToOrderString(sorter) });
              });
            }}
          />
        </Flex>
      </Card>
    </>
  );
};

export default ComputeSessionList;
