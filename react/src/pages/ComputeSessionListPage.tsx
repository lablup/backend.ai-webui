import BAILink from '../components/BAILink';
import BAIPropertyFilter, {
  mergeFilterValues,
} from '../components/BAIPropertyFilter';
import TerminateSessionModal from '../components/ComputeSessionNodeItems/TerminateSessionModal';
import Flex from '../components/Flex';
import SessionNodes from '../components/SessionNodes';
import {
  filterNonNullItems,
  handleRowSelectionChange,
  transformSorterToOrderString,
} from '../helper';
import { useUpdatableState } from '../hooks';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useDeferredQueryParams } from '../hooks/useDeferredQueryParams';
import { useInterval } from '../hooks/useIntervalValue';
import {
  ComputeSessionListPageQuery,
  ComputeSessionListPageQuery$data,
  ComputeSessionListPageQuery$variables,
} from './__generated__/ComputeSessionListPageQuery.graphql';
import { LoadingOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Radio, Tabs, theme, Tooltip } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { PowerOffIcon } from 'lucide-react';
import { startTransition, useDeferredValue, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TypeFilterType = 'all' | 'interactive' | 'batch' | 'inference' | 'system';
type SessionNode = NonNullableNodeOnEdges<
  ComputeSessionListPageQuery$data['compute_session_nodes']
>;
const ComputeSessionListPage = () => {
  const currentProject = useCurrentProjectValue();

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [selectedSessionList, setSelectedSessionList] = useState<
    Array<SessionNode>
  >([]);
  const [isOpenTerminateModal, setOpenTerminateModal] = useState(false);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQuery] = useDeferredQueryParams({
    order: StringParam,
    filter: StringParam,
    type: withDefault(StringParam, 'all'),
    statusCategory: withDefault(StringParam, 'running'),
  });

  const [, setSessionDetailId] = useQueryParam('sessionDetail', StringParam);
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

  const isNotRunningCategory = (status?: string | null) => {
    return status === 'TERMINATED' || status === 'CANCELLED';
  };

  const [fetchKey, updateFetchKey] = useUpdatableState('first');

  const queryVariables: ComputeSessionListPageQuery$variables = {
    projectId: currentProject.id,
    offset: baiPaginationOption.offset,
    first: baiPaginationOption.first,
    filter: mergeFilterValues([statusFilter, queryParams.filter, typeFilter]),
    order: queryParams.order,
    runningTypeFilter: 'status != "TERMINATED" & status != "CANCELLED"',
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);

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
                id @required(action: THROW)
                ...SessionNodesFragment
                ...TerminateSessionModalFragment
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
      deferredQueryVariables,
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
            const storedQuery = queryMapRef.current[key] || {
              statusCategory: 'running',
            };
            setQuery(
              { ...storedQuery, type: key as TypeFilterType },
              'replace',
            );
            setTablePaginationOption({ current: 1 });
            setSelectedSessionList([]);
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
          <Flex justify="between">
            <Flex gap={'sm'} align="start">
              <Radio.Group
                optionType="button"
                value={queryParams.statusCategory}
                onChange={(e) => {
                  setQuery({ statusCategory: e.target.value }, 'replaceIn');
                  setTablePaginationOption({ current: 1 });
                  setSelectedSessionList([]);
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
                  setQuery({ filter: value }, 'replaceIn');
                  setTablePaginationOption({ current: 1 });
                  setSelectedSessionList([]);
                }}
              />
            </Flex>
            <Flex gap={'sm'}>
              {selectedSessionList.length > 0 && (
                <>
                  {t('general.NSelected', {
                    count: selectedSessionList.length,
                  })}
                  <Tooltip
                    title={t('session.TerminateSession')}
                    placement="topLeft"
                  >
                    <Button
                      icon={<PowerOffIcon color={token.colorError} />}
                      onClick={() => {
                        setOpenTerminateModal(true);
                      }}
                    />
                  </Tooltip>
                </>
              )}
            </Flex>
          </Flex>
          <SessionNodes
            onClickSessionName={(session) => {
              setSessionDetailId(session.row_id);
            }}
            rowSelection={{
              type: 'checkbox',
              // Preserve selected rows between pages, but clear when filter changes
              preserveSelectedRowKeys: true,
              getCheckboxProps(record) {
                return {
                  disabled: isNotRunningCategory(record.status),
                };
              },
              onChange: (selectedRowKeys) => {
                // Using selectedRowKeys to retrieve selected rows since selectedRows lack nested fragment types
                handleRowSelectionChange(
                  selectedRowKeys,
                  filterNonNullItems(
                    compute_session_nodes?.edges.map((e) => e?.node),
                  ),
                  setSelectedSessionList,
                );
              },
              selectedRowKeys: _.map(selectedSessionList, (i) => i.id),
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
              spinning: queryVariables !== deferredQueryVariables,
              indicator: <LoadingOutlined />,
            }}
            onChange={({ current, pageSize }, filters, sorter) => {
              if (_.isNumber(current) && _.isNumber(pageSize)) {
                setTablePaginationOption({ current, pageSize });
              }
              setQuery(
                { order: transformSorterToOrderString(sorter) },
                'replaceIn',
              );
            }}
          />
        </Flex>
      </Card>
      <TerminateSessionModal
        open={isOpenTerminateModal}
        sessionFrgmts={selectedSessionList}
        onRequestClose={(success) => {
          setOpenTerminateModal(false);
          if (success) {
            setSelectedSessionList([]);
          }
        }}
      />
    </>
  );
};

export default ComputeSessionListPage;
