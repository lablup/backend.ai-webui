import {
  AgentSummaryListQuery,
  AgentSummaryListQuery$data,
  AgentSummaryListQuery$variables,
} from '../__generated__/AgentSummaryListQuery.graphql';
import {
  convertToBinaryUnit,
  toFixedFloorWithoutTrailingZeros,
} from '../helper';
import { INITIAL_FETCH_KEY, useFetchKey } from '../hooks';
import { ResourceSlotName, useResourceSlotsDetails } from '../hooks/backendai';
import { useBAIPaginationOptionStateOnSearchParamLegacy } from '../hooks/reactPaginationQueryOptions';
import { useResourceGroupsForCurrentProject } from '../hooks/useCurrentProject';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import BAIProgressWithLabel from './BAIProgressWithLabel';
import BAIRadioGroup from './BAIRadioGroup';
import { ResourceTypeIcon } from './ResourceNumber';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import {
  CheckCircleOutlined,
  MinusCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button, TableProps, theme, Tooltip, Typography } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { ColumnsType, ColumnType } from 'antd/es/table';
import {
  filterOutNullAndUndefined,
  BAITable,
  BAIFlex,
  BAIPropertyFilter,
  mergeFilterValues,
} from 'backend.ai-ui';
import _ from 'lodash';
import React, { useDeferredValue, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';
import { StringParam, useQueryParams, withDefault } from 'use-query-params';

type AgentSummary = NonNullable<
  AgentSummaryListQuery$data['agent_summary_list']
>['items'][number];

interface AgentSummaryListProps {
  containerStyle?: React.CSSProperties;
  tableProps?: Omit<TableProps, 'dataSource'>;
}

const AgentSummaryList: React.FC<AgentSummaryListProps> = ({
  containerStyle,
  tableProps,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const [visibleColumnSettingModal, { toggle: toggleColumnSettingModal }] =
    useToggle();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParamLegacy({
    current: 1,
    pageSize: 20,
  });

  const [queryParams, setQuery] = useQueryParams({
    order: withDefault(StringParam, undefined),
    filter: withDefault(StringParam, undefined),
    status: withDefault(StringParam, 'ALIVE'),
  });

  const [fetchKey, updateFetchKey] = useFetchKey();
  const { sftpResourceGroups } = useResourceGroupsForCurrentProject();

  const sftpExclusionFilter =
    sftpResourceGroups && sftpResourceGroups.length > 0
      ? `!(scaling_group in [${sftpResourceGroups.map((group) => `"${group}"`).join(', ')}])`
      : undefined;

  const queryVariables: AgentSummaryListQuery$variables = useMemo(
    () => ({
      limit: baiPaginationOption.limit,
      offset: baiPaginationOption.offset,
      filter: mergeFilterValues([queryParams.filter, sftpExclusionFilter]),
      order: queryParams.order,
      status: queryParams.status,
    }),
    [
      baiPaginationOption.limit,
      baiPaginationOption.offset,
      queryParams.filter,
      queryParams.order,
      queryParams.status,
      sftpExclusionFilter,
    ],
  );
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.AgentSummaryList',
  );

  const { agent_summary_list } = useLazyLoadQuery<AgentSummaryListQuery>(
    graphql`
      query AgentSummaryListQuery(
        $limit: Int!
        $offset: Int!
        $filter: String
        $status: String
        $order: String
      ) {
        agent_summary_list(
          limit: $limit
          offset: $offset
          filter: $filter
          status: $status
          order: $order
        ) {
          items {
            id
            status
            architecture
            available_slots
            occupied_slots
            scaling_group
            schedulable
          }
          total_count
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

  const columns: ColumnsType<AgentSummary> = [
    {
      title: <>ID</>,
      key: 'id',
      dataIndex: 'id',
      fixed: 'left',
      render: (value) => {
        return (
          <BAIFlex direction="column" align="start">
            <Typography.Text>{value}</Typography.Text>
          </BAIFlex>
        );
      },
      sorter: true,
    },
    {
      title: t('agent.Architecture'),
      key: 'architecture',
      dataIndex: 'architecture',
    },
    {
      title: t('agent.Allocation'),
      key: 'allocation',
      render: (_value, record) => {
        const parsedOccupiedSlots: {
          [key in ResourceSlotName]: string | undefined;
        } = JSON.parse(record?.occupied_slots || '{}');
        const parsedAvailableSlots: {
          [key in ResourceSlotName]: string | undefined;
        } = JSON.parse(record?.available_slots || '{}');
        return (
          <BAIFlex direction="column" gap="xxs">
            {_.map(
              parsedAvailableSlots,
              (_value: string | number, key: ResourceSlotName) => {
                if (key === 'cpu') {
                  const cpuPercent = _.toFinite(
                    (_.toNumber(parsedOccupiedSlots.cpu) /
                      _.toNumber(parsedAvailableSlots.cpu)) *
                      100,
                  );
                  return (
                    <BAIFlex
                      key={key}
                      justify="between"
                      style={{ minWidth: 220 }}
                    >
                      <BAIFlex gap="xxs">
                        <ResourceTypeIcon key={key} type={key} />
                        <Typography.Text>
                          {toFixedFloorWithoutTrailingZeros(
                            parsedOccupiedSlots.cpu || 0,
                            0,
                          )}
                          /
                          {toFixedFloorWithoutTrailingZeros(
                            parsedAvailableSlots.cpu || 0,
                            0,
                          )}
                        </Typography.Text>
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: token.sizeXS }}
                        >
                          {mergedResourceSlots?.cpu?.display_unit}
                        </Typography.Text>
                      </BAIFlex>
                      <BAIProgressWithLabel
                        percent={cpuPercent}
                        strokeColor={
                          cpuPercent > 80
                            ? token.colorError
                            : token.colorSuccess
                        }
                        width={120}
                        valueLabel={
                          toFixedFloorWithoutTrailingZeros(cpuPercent, 1) + ' %'
                        }
                      />
                    </BAIFlex>
                  );
                } else if (key === 'mem') {
                  const memPercent = _.toFinite(
                    (_.toNumber(parsedOccupiedSlots.mem) /
                      _.toNumber(parsedAvailableSlots.mem)) *
                      100,
                  );
                  return (
                    <BAIFlex
                      key={'mem'}
                      justify="between"
                      style={{ minWidth: 220 }}
                    >
                      <BAIFlex gap="xxs">
                        <ResourceTypeIcon type={'mem'} />
                        <Typography.Text>
                          {convertToBinaryUnit(parsedOccupiedSlots.mem, 'g', 0)
                            ?.numberFixed ?? 0}
                          /
                          {convertToBinaryUnit(parsedAvailableSlots.mem, 'g', 0)
                            ?.numberFixed ?? 0}
                        </Typography.Text>
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: token.sizeXS }}
                        >
                          GiB
                        </Typography.Text>
                      </BAIFlex>
                      <BAIProgressWithLabel
                        percent={memPercent}
                        strokeColor={
                          memPercent > 80
                            ? token.colorError
                            : token.colorSuccess
                        }
                        width={120}
                        valueLabel={
                          toFixedFloorWithoutTrailingZeros(memPercent, 1) + ' %'
                        }
                      />
                    </BAIFlex>
                  );
                } else if (parsedAvailableSlots[key]) {
                  const percent = _.toFinite(
                    (_.toNumber(parsedOccupiedSlots[key]) /
                      _.toNumber(parsedAvailableSlots[key])) *
                      100,
                  );
                  return (
                    <BAIFlex
                      key={key}
                      justify="between"
                      style={{ minWidth: 220 }}
                      gap="xxs"
                    >
                      <BAIFlex gap="xxs">
                        <ResourceTypeIcon key={key} type={key} />
                        <Typography.Text>
                          {toFixedFloorWithoutTrailingZeros(
                            parsedOccupiedSlots[key] || 0,
                            2,
                          )}
                          /
                          {toFixedFloorWithoutTrailingZeros(
                            parsedAvailableSlots[key],
                            2,
                          )}
                        </Typography.Text>
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: token.sizeXS }}
                        >
                          {mergedResourceSlots?.[key]?.display_unit}
                        </Typography.Text>
                      </BAIFlex>
                      <BAIProgressWithLabel
                        percent={percent}
                        strokeColor={
                          percent > 80 ? token.colorError : token.colorSuccess
                        }
                        width={120}
                        valueLabel={
                          toFixedFloorWithoutTrailingZeros(percent, 1) + ' %'
                        }
                      />
                    </BAIFlex>
                  );
                }
              },
            )}
          </BAIFlex>
        );
      },
    },
    {
      title: t('general.ResourceGroup'),
      key: 'scaling_group',
      dataIndex: 'scaling_group',
      sorter: true,
    },
    {
      title: t('agent.Schedulable'),
      key: 'schedulable',
      dataIndex: 'schedulable',
      render: (value) => {
        return (
          <BAIFlex justify="center">
            {value === true ? (
              <CheckCircleOutlined
                style={{
                  color: token.colorSuccess,
                  fontSize: token.fontSizeXL,
                }}
              />
            ) : (
              <MinusCircleOutlined
                style={{
                  color: token.colorTextDisabled,
                  fontSize: token.fontSizeXL,
                }}
              />
            )}
          </BAIFlex>
        );
      },
      sorter: true,
    },
  ];
  const [hiddenColumnKeys, setHiddenColumnKeys] =
    useHiddenColumnKeysSetting('AgentSummaryList');

  return (
    <BAIFlex direction="column" align="stretch" style={containerStyle} gap="sm">
      <BAIFlex justify="between" align="start" gap="xs" wrap="wrap">
        <BAIFlex
          direction="row"
          gap={'sm'}
          align="start"
          style={{ flex: 1 }}
          wrap="wrap"
        >
          <BAIRadioGroup
            options={[
              {
                label: t('agent.Connected'),
                value: 'ALIVE',
              },
              {
                label: t('agent.Terminated'),
                value: 'TERMINATED',
              },
            ]}
            value={queryParams.status}
            onChange={(e) => {
              const value = e.target.value;
              setQuery({ status: value }, 'replaceIn');
            }}
          />

          <BAIPropertyFilter
            filterProperties={[
              {
                key: 'id',
                propertyLabel: 'ID',
                type: 'string',
              },
              {
                key: 'schedulable',
                propertyLabel: t('agent.Schedulable'),
                type: 'boolean',
                options: [
                  {
                    label: t('general.Enabled'),
                    value: 'true',
                  },
                  {
                    label: t('general.Disabled'),
                    value: 'false',
                  },
                ],
              },
            ]}
            value={queryParams.filter}
            onChange={(value) => {
              setQuery({ filter: value }, 'replaceIn');
              setTablePaginationOption({ current: 1 });
            }}
          />
        </BAIFlex>
        <BAIFlex gap="xs">
          <Tooltip title={t('button.Refresh')}>
            <Button
              loading={deferredFetchKey !== fetchKey}
              onClick={() => updateFetchKey()}
              icon={<ReloadOutlined />}
            ></Button>
          </Tooltip>
        </BAIFlex>
      </BAIFlex>
      <BAITable
        bordered
        scroll={{ x: 'max-content' }}
        rowKey={'id'}
        dataSource={filterOutNullAndUndefined(agent_summary_list?.items)}
        showSorterTooltip={false}
        columns={
          _.filter(
            columns,
            (column) => !_.includes(hiddenColumnKeys, _.toString(column?.key)),
          ) as ColumnType<AnyObject>[]
        }
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: agent_summary_list?.total_count ?? 0,
          onChange(current, pageSize) {
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
        loading={deferredQueryVariables !== queryVariables}
        {...tableProps}
      />
      <TableColumnsSettingModal
        open={visibleColumnSettingModal}
        onRequestClose={(values) => {
          values?.selectedColumnKeys &&
            setHiddenColumnKeys(
              _.difference(
                columns.map((column) => _.toString(column.key)),
                values?.selectedColumnKeys,
              ),
            );
          toggleColumnSettingModal();
        }}
        columns={columns}
        hiddenColumnKeys={hiddenColumnKeys}
      />
    </BAIFlex>
  );
};

export default AgentSummaryList;
