import {
  convertBinarySizeUnit,
  filterNonNullItems,
  toFixedFloorWithoutTrailingZeros,
  transformSorterToOrderString,
} from '../helper';
import { useUpdatableState } from '../hooks';
import { ResourceSlotName, useResourceSlotsDetails } from '../hooks/backendai';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useResourceGroupsForCurrentProject } from '../hooks/useCurrentProject';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import BAIProgressWithLabel from './BAIProgressWithLabel';
import BAIPropertyFilter from './BAIPropertyFilter';
import BAIRadioGroup from './BAIRadioGroup';
import Flex from './Flex';
import { ResourceTypeIcon } from './ResourceNumber';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import {
  AgentSummaryListQuery,
  AgentSummaryListQuery$data,
} from './__generated__/AgentSummaryListQuery.graphql';
import {
  CheckCircleOutlined,
  LoadingOutlined,
  MinusCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button, Table, TableProps, theme, Tooltip, Typography } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { ColumnsType, ColumnType } from 'antd/es/table';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { FetchPolicy, useLazyLoadQuery } from 'react-relay';

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
  const [isPendingStatusFetch, startStatusFetchTransition] = useTransition();
  const [isPendingRefresh, startRefreshTransition] = useTransition();
  const [isPendingPageChange, startPageChangeTransition] = useTransition();
  const [selectedStatus, setSelectedStatus] = useState('ALIVE');
  const [optimisticSelectedStatus, setOptimisticSelectedStatus] =
    useState(selectedStatus);
  const [isPendingFilter, startFilterTransition] = useTransition();

  const [filterString, setFilterString] = useState<string>();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 20,
  });
  const [order, setOrder] = useState<string>();

  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [fetchPolicy] = useState<FetchPolicy>('network-only');
  const updateFetchKeyInTransition = () =>
    startRefreshTransition(() => {
      updateFetchKey();
    });
  const { allSftpScalingGroups } = useResourceGroupsForCurrentProject();

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
    {
      limit: baiPaginationOption.limit,
      offset: baiPaginationOption.offset,
      filter: filterString,
      order,
      status: selectedStatus,
    },
    {
      fetchKey,
      fetchPolicy,
    },
  );

  // Hide sFTP upload agents
  const filteredAgentSummaryList = _.filter(
    agent_summary_list?.items,
    (item) => !_.includes(allSftpScalingGroups, item?.scaling_group),
  );

  const columns: ColumnsType<AgentSummary> = [
    {
      title: '#',
      fixed: 'left',
      render: (id, record, index) => {
        return (
          index +
          1 +
          (tablePaginationOption.current - 1) * tablePaginationOption.pageSize
        );
      },
      showSorterTooltip: false,
      rowScope: 'row',
    },
    {
      title: <>ID</>,
      key: 'id',
      dataIndex: 'id',
      fixed: 'left',
      render: (value, record) => {
        return (
          <Flex direction="column" align="start">
            <Typography.Text>{value}</Typography.Text>
          </Flex>
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
      render: (value, record) => {
        const parsedOccupiedSlots: {
          [key in ResourceSlotName]: string | undefined;
        } = JSON.parse(record?.occupied_slots || '{}');
        const parsedAvailableSlots: {
          [key in ResourceSlotName]: string | undefined;
        } = JSON.parse(record?.available_slots || '{}');
        return (
          <Flex direction="column" gap="xxs">
            {_.map(
              parsedAvailableSlots,
              (value: string | number, key: ResourceSlotName) => {
                if (key === 'cpu') {
                  const cpuPercent = _.toFinite(
                    (_.toNumber(parsedOccupiedSlots.cpu) /
                      _.toNumber(parsedAvailableSlots.cpu)) *
                      100,
                  );
                  return (
                    <Flex key={key} justify="between" style={{ minWidth: 220 }}>
                      <Flex gap="xxs">
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
                      </Flex>
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
                    </Flex>
                  );
                } else if (key === 'mem') {
                  const memPercent = _.toFinite(
                    (_.toNumber(parsedOccupiedSlots.mem) /
                      _.toNumber(parsedAvailableSlots.mem)) *
                      100,
                  );
                  return (
                    <Flex
                      key={'mem'}
                      justify="between"
                      style={{ minWidth: 220 }}
                    >
                      <Flex gap="xxs">
                        <ResourceTypeIcon type={'mem'} />
                        <Typography.Text>
                          {convertBinarySizeUnit(
                            parsedOccupiedSlots.mem,
                            'g',
                            0,
                          )?.numberFixed ?? 0}
                          /
                          {convertBinarySizeUnit(
                            parsedAvailableSlots.mem,
                            'g',
                            0,
                          )?.numberFixed ?? 0}
                        </Typography.Text>
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: token.sizeXS }}
                        >
                          GiB
                        </Typography.Text>
                      </Flex>
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
                    </Flex>
                  );
                } else if (parsedAvailableSlots[key]) {
                  const percent = _.toFinite(
                    (_.toNumber(parsedOccupiedSlots[key]) /
                      _.toNumber(parsedAvailableSlots[key])) *
                      100,
                  );
                  return (
                    <Flex
                      key={key}
                      justify="between"
                      style={{ minWidth: 220 }}
                      gap="xxs"
                    >
                      <Flex gap="xxs">
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
                      </Flex>
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
                    </Flex>
                  );
                }
              },
            )}
          </Flex>
        );
      },
    },
    {
      title: t('agent.Schedulable'),
      key: 'schedulable',
      dataIndex: 'schedulable',
      render: (value) => {
        return (
          <Flex justify="center">
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
          </Flex>
        );
      },
      sorter: true,
    },
  ];
  const [hiddenColumnKeys, setHiddenColumnKeys] =
    useHiddenColumnKeysSetting('AgentSummaryList');

  return (
    <Flex direction="column" align="stretch" style={containerStyle}>
      <Flex
        justify="between"
        align="start"
        gap="xs"
        style={{ padding: token.paddingXS }}
        wrap="wrap"
      >
        <Flex
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
            value={
              isPendingStatusFetch ? optimisticSelectedStatus : selectedStatus
            }
            onChange={(e) => {
              const value = e.target.value;
              setOptimisticSelectedStatus(value);
              startStatusFetchTransition(() => {
                setSelectedStatus(value);
              });
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
            value={filterString}
            // loading={isPendingFilter}
            onChange={(value) => {
              startFilterTransition(() => {
                setFilterString(value);
              });
            }}
          />
        </Flex>
        <Flex gap="xs">
          <Tooltip title={t('button.Refresh')}>
            <Button
              loading={isPendingRefresh}
              onClick={() => updateFetchKeyInTransition()}
              icon={<ReloadOutlined />}
            ></Button>
          </Tooltip>
        </Flex>
      </Flex>
      <Table
        bordered
        scroll={{ x: 'max-content' }}
        rowKey={'id'}
        dataSource={filterNonNullItems(filteredAgentSummaryList)}
        showSorterTooltip={false}
        columns={
          _.filter(
            columns,
            (column) => !_.includes(hiddenColumnKeys, _.toString(column?.key)),
          ) as ColumnType<AnyObject>[]
        }
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          showSizeChanger: true,
          total: agent_summary_list?.total_count,
          current: tablePaginationOption.current,
          showTotal(total, range) {
            return `${range[0]}-${range[1]} of ${total} items`;
          },
          pageSizeOptions: ['10', '20', '50'],
          style: { marginRight: token.marginXS },
        }}
        onChange={({ pageSize, current }, filters, sorter) => {
          startPageChangeTransition(() => {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({
                current,
                pageSize,
              });
            }
            setOrder(transformSorterToOrderString(sorter));
          });
        }}
        loading={{
          spinning:
            isPendingPageChange || isPendingStatusFetch || isPendingFilter,
          indicator: <LoadingOutlined />,
        }}
        {...tableProps}
      />
      <Flex
        justify="end"
        style={{
          padding: token.paddingXXS,
        }}
      >
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={() => {
            toggleColumnSettingModal();
          }}
        />
      </Flex>
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
    </Flex>
  );
};

export default AgentSummaryList;
