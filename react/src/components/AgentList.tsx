import {
  bytesToGB,
  iSizeToSize,
  toFixedFloorWithoutTrailingZeros,
  transformSorterToOrderString,
} from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { useResourceSlotsDetails } from '../hooks/backendai';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useThemeMode } from '../hooks/useThemeMode';
import AgentDetailModal from './AgentDetailModal';
import AgentSettingModal from './AgentSettingModal';
import BAIIntervalText from './BAIIntervalText';
import BAIProgressWithLabel from './BAIProgressWithLabel';
import BAIPropertyFilter from './BAIPropertyFilter';
import DoubleTag from './DoubleTag';
import Flex from './Flex';
import { ResourceTypeIcon } from './ResourceNumber';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import { AgentDetailModalFragment$key } from './__generated__/AgentDetailModalFragment.graphql';
import {
  AgentListQuery,
  AgentListQuery$data,
} from './__generated__/AgentListQuery.graphql';
import { AgentSettingModalFragment$key } from './__generated__/AgentSettingModalFragment.graphql';
import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  MinusCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import {
  Button,
  Segmented,
  Table,
  TableProps,
  Tag,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { ColumnsType, ColumnType } from 'antd/es/table';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { FetchPolicy, useLazyLoadQuery } from 'react-relay';

type Agent = NonNullable<AgentListQuery$data['agent_list']>['items'][number];

interface AgentListProps {
  containerStyle?: React.CSSProperties;
  tableProps?: Omit<TableProps, 'dataSource'>;
}

const AgentList: React.FC<AgentListProps> = ({
  containerStyle,
  tableProps,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();
  const [resourceSlotsDetails] = useResourceSlotsDetails();
  const [currentAgentInfo, setCurrentAgentInfo] =
    useState<AgentDetailModalFragment$key | null>();
  const [currentSettingAgent, setCurrentSettingAgent] =
    useState<AgentSettingModalFragment$key | null>();
  const [isOpenColumnsSetting, setIsOpenColumnsSetting] = useState(false);
  const baiClient = useSuspendedBackendaiClient();
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

  const { agent_list } = useLazyLoadQuery<AgentListQuery>(
    graphql`
      query AgentListQuery(
        $limit: Int!
        $offset: Int!
        $filter: String
        $status: String
        $order: String
      ) {
        agent_list(
          limit: $limit
          offset: $offset
          filter: $filter
          status: $status
          order: $order
        ) {
          items {
            id
            status
            version
            addr
            architecture
            region
            compute_plugins
            first_contact
            lost_at
            status_changed
            live_stat
            cpu_cur_pct
            mem_cur_bytes
            available_slots
            occupied_slots
            scaling_group
            schedulable
            ...AgentDetailModalFragment
            ...AgentSettingModalFragment
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

  const columns: ColumnsType<Agent> = [
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
      title: <>ID / {t('agent.Endpoint')}</>,
      key: 'id',
      dataIndex: 'id',
      fixed: 'left',
      render: (value, record) => {
        return (
          <Flex direction="column" align="start">
            <Typography.Text>{value}</Typography.Text>
            <Typography.Text type="secondary">{record?.addr}</Typography.Text>
          </Flex>
        );
      },
      sorter: true,
    },
    {
      title: t('agent.Region'),
      key: 'region',
      dataIndex: 'region',
      render: (value) => {
        const platformData: {
          [key: string]: { color: string; icon: string };
        } = {
          aws: { color: 'orange', icon: 'aws' },
          amazon: { color: 'orange', icon: 'aws' },
          azure: { color: 'blue', icon: 'azure' },
          gcp: { color: 'lightblue', icon: 'gcp' },
          google: { color: 'lightblue', icon: 'gcp' },
          nbp: { color: 'green', icon: 'nbp' },
          naver: { color: 'green', icon: 'nbp' },
          openstack: { color: 'red', icon: 'openstack' },
          dgx: { color: 'green', icon: 'local' },
          local: { color: 'yellow', icon: 'local' },
        };

        const regionData = _.split(value, '/');
        const platform = regionData?.[0];
        const location = regionData?.length > 1 ? regionData[1] : '';
        const { color, icon } = platformData[platform] || {
          color: 'yellow',
          icon: 'local',
        };
        return (
          <Flex gap={'xxs'}>
            <img
              alt={value}
              src={`/resources/icons/${icon}.png`}
              style={{
                width: '32px',
                height: '32px',
                filter: isDarkMode && icon === 'local' ? 'invert(1)' : '',
              }}
            />
            {location !== '' ? (
              <DoubleTag
                values={[
                  { label: location, color: color },
                  { label: platform, color: color },
                ]}
              />
            ) : (
              <Tag color={color}>{platform}</Tag>
            )}
          </Flex>
        );
      },
    },
    {
      title: t('agent.Architecture'),
      key: 'architecture',
      dataIndex: 'architecture',
    },
    {
      title: t('agent.Starts'),
      key: 'first_contact',
      dataIndex: 'first_contact',
      render: (value) => {
        return (
          <Flex direction="column">
            <Typography.Text>{dayjs(value).format('ll LTS')}</Typography.Text>
            <DoubleTag
              values={[
                t('agent.Running'),
                <BAIIntervalText
                  callback={() => {
                    return baiClient.utils.elapsedTime(value, Date.now());
                  }}
                  delay={1000}
                />,
              ]}
            />
          </Flex>
        );
      },
      sorter: true,
    },
    {
      title: t('agent.Allocation'),
      key: 'allocation',
      render: (value, record) => {
        const parsedOccupiedSlots = JSON.parse(record?.occupied_slots || '{}');
        const parsedAvailableSlots = JSON.parse(
          record?.available_slots || '{}',
        );
        return (
          <Flex direction="column" gap="xxs">
            {_.map(_.keys(parsedAvailableSlots), (key) => {
              if (key === 'cpu') {
                return (
                  <Flex key={key} justify="between" style={{ minWidth: 220 }}>
                    <Flex gap="xxs">
                      <ResourceTypeIcon key={key} type={key} />
                      <Typography.Text>
                        {toFixedFloorWithoutTrailingZeros(
                          parsedOccupiedSlots[key] || 0,
                          0,
                        )}
                        /
                        {toFixedFloorWithoutTrailingZeros(
                          parsedAvailableSlots[key],
                          0,
                        )}
                      </Typography.Text>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: token.sizeXS }}
                      >
                        {resourceSlotsDetails?.cpu?.display_unit}
                      </Typography.Text>
                    </Flex>
                    <BAIProgressWithLabel
                      percent={
                        ((parsedOccupiedSlots[key] || 0) /
                          parsedAvailableSlots[key]) *
                        100
                      }
                      strokeColor={
                        ((parsedOccupiedSlots[key] || 0) /
                          parsedAvailableSlots[key]) *
                          100 >
                        80
                          ? token.colorError
                          : token.colorSuccess
                      }
                      width={120}
                      valueLabel={
                        toFixedFloorWithoutTrailingZeros(
                          _.toFinite(
                            ((parsedOccupiedSlots[key] || 0) /
                              parsedAvailableSlots[key]) *
                              100,
                          ),
                          1,
                        ) + ' %'
                      }
                    />
                  </Flex>
                );
              } else if (key === 'mem') {
                return (
                  <Flex key={key} justify="between" style={{ minWidth: 220 }}>
                    <Flex gap="xxs">
                      <ResourceTypeIcon key={key} type={key} />
                      <Typography.Text>
                        {iSizeToSize(parsedOccupiedSlots[key], 'g', 0)
                          ?.numberFixed ?? 0}
                        /
                        {iSizeToSize(parsedAvailableSlots[key], 'g', 0)
                          ?.numberFixed ?? 0}
                      </Typography.Text>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: token.sizeXS }}
                      >
                        GiB
                      </Typography.Text>
                    </Flex>
                    <BAIProgressWithLabel
                      percent={
                        ((parsedOccupiedSlots[key] || 0) /
                          parsedAvailableSlots[key]) *
                        100
                      }
                      strokeColor={
                        ((parsedOccupiedSlots[key] || 0) /
                          parsedAvailableSlots[key]) *
                          100 >
                        80
                          ? token.colorError
                          : token.colorSuccess
                      }
                      width={120}
                      valueLabel={
                        toFixedFloorWithoutTrailingZeros(
                          _.toFinite(
                            ((parsedOccupiedSlots[key] || 0) /
                              parsedAvailableSlots[key]) *
                              100,
                          ),
                          1,
                        ) + ' %'
                      }
                    />
                  </Flex>
                );
              } else if (parsedAvailableSlots[key]) {
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
                          parsedOccupiedSlots[key],
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
                        {resourceSlotsDetails?.[key]?.display_unit}
                      </Typography.Text>
                    </Flex>
                    <BAIProgressWithLabel
                      percent={
                        (parsedOccupiedSlots[key] / parsedAvailableSlots[key]) *
                        100
                      }
                      strokeColor={
                        (parsedOccupiedSlots[key] / parsedAvailableSlots[key]) *
                          100 >
                        80
                          ? token.colorError
                          : token.colorSuccess
                      }
                      width={120}
                      valueLabel={
                        toFixedFloorWithoutTrailingZeros(
                          _.toFinite(
                            (parsedOccupiedSlots[key] /
                              parsedAvailableSlots[key]) *
                              100,
                          ),
                          1,
                        ) + ' %'
                      }
                    />
                  </Flex>
                );
              }
            })}
          </Flex>
        );
      },
    },
    {
      title: t('agent.Utilization'),
      key: 'live_stat',
      dataIndex: 'live_stat',
      render: (value, record) => {
        const parsedValue = JSON.parse(value || '{}');
        const available_slots = JSON.parse(record?.available_slots || '{}');
        if (record?.status === 'ALIVE') {
          const liveStat = {
            cpu_util: { capacity: 0, current: 0, ratio: 0 },
            mem_util: { capacity: 0, current: 0, ratio: 0 },
          };
          if (parsedValue && parsedValue.node && parsedValue.devices) {
            const numCores = _.keys(parsedValue.devices.cpu_util).length;
            liveStat.cpu_util.capacity = _.toFinite(
              parsedValue.node.cpu_util.capacity,
            );
            liveStat.cpu_util.current = _.toFinite(
              parsedValue.node.cpu_util.current,
            );
            liveStat.cpu_util.ratio =
              liveStat.cpu_util.current /
                liveStat.cpu_util.capacity /
                numCores || 0;
            liveStat.mem_util.capacity = _.toInteger(
              available_slots.mem || parsedValue.node.mem.capacity,
            );
            liveStat.mem_util.current = _.toInteger(
              parsedValue.node.mem.current,
            );
            liveStat.mem_util.ratio =
              liveStat.mem_util.current / liveStat.mem_util.capacity || 0;
          }
          _.forEach(_.keys(parsedValue?.node), (statKey) => {
            if (
              ['cpu_util', 'mem', 'disk', 'net_rx', 'net_tx'].includes(statKey)
            )
              return;
            if (_.includes(statKey, '_util')) {
              // core utilization
              liveStat[statKey as keyof typeof liveStat] = {
                capacity:
                  statKey === 'cuda_util'
                    ? _.toFinite(parsedValue.node[statKey]['stats.max'])
                    : _.toFinite(parsedValue.node[statKey].capacity),
                current: _.toFinite(parsedValue.node[statKey].current),
                ratio: _.toFinite(parsedValue.node[statKey].current) / 100 || 0,
              };
            } else if (statKey.includes('_mem')) {
              // memory utilization
              liveStat[statKey as keyof typeof liveStat] = {
                capacity: _.toFinite(parsedValue.node[statKey].capacity),
                current: _.toFinite(parsedValue.node[statKey].current),
                ratio: _.toFinite(parsedValue.node[statKey].pct) / 100 || 0,
              };
            }
          });
          return (
            <Flex direction="column" gap="xxs">
              <Flex justify="between" style={{ minWidth: 200 }}>
                <Typography.Text>
                  {resourceSlotsDetails?.cpu?.human_readable_name}
                </Typography.Text>
                <BAIProgressWithLabel
                  percent={liveStat.cpu_util.ratio * 100}
                  width={120}
                  valueLabel={
                    toFixedFloorWithoutTrailingZeros(
                      _.toFinite(liveStat.cpu_util.ratio * 100),
                      1,
                    ) + ' %'
                  }
                />
              </Flex>
              <Flex justify="between" style={{ minWidth: 200 }}>
                <Typography.Text>
                  {resourceSlotsDetails?.mem?.human_readable_name}
                </Typography.Text>
                <BAIProgressWithLabel
                  percent={liveStat.mem_util.ratio}
                  width={120}
                  valueLabel={
                    iSizeToSize(_.toString(liveStat.mem_util.current), 'g')
                      ?.numberFixed +
                    '/' +
                    iSizeToSize(_.toString(liveStat.mem_util.capacity), 'g')
                      ?.numberFixed +
                    ' GiB'
                  }
                />
              </Flex>
              {_.map(_.keys(parsedValue?.node), (statKey) => {
                if (['cpu_util', 'mem'].includes(statKey)) {
                  return;
                }
                if (_.includes(statKey, '_util')) {
                  const deviceName = _.split(statKey, '_')[0] + '.device';
                  return (
                    <Flex
                      justify="between"
                      style={{ minWidth: 200, width: 'min-content' }}
                      gap="xxs"
                    >
                      <Typography.Text>
                        {
                          resourceSlotsDetails?.[deviceName]
                            ?.human_readable_name
                        }
                        (util)
                      </Typography.Text>
                      <BAIProgressWithLabel
                        width={120}
                        percent={
                          (liveStat[statKey as keyof typeof liveStat].current /
                            liveStat[statKey as keyof typeof liveStat]
                              .capacity) *
                            100 || 0
                        }
                        valueLabel={
                          _.toFinite(
                            toFixedFloorWithoutTrailingZeros(
                              liveStat[statKey as keyof typeof liveStat].ratio *
                                100,
                              1,
                            ),
                          ) + ' %'
                        }
                      />
                    </Flex>
                  );
                }
                if (_.includes(statKey, '_mem')) {
                  const deviceName = _.split(statKey, '_')[0] + '.device';
                  return (
                    <Flex
                      justify="between"
                      style={{ minWidth: 200, width: 'min-content' }}
                      gap="xxs"
                    >
                      <Typography.Text>
                        {
                          resourceSlotsDetails?.[deviceName]
                            ?.human_readable_name
                        }
                        (mem)
                      </Typography.Text>
                      <BAIProgressWithLabel
                        width={120}
                        percent={
                          (liveStat[statKey as keyof typeof liveStat].current /
                            liveStat[statKey as keyof typeof liveStat]
                              .capacity) *
                            100 || 0
                        }
                        valueLabel={
                          iSizeToSize(
                            _.toString(
                              liveStat[statKey as keyof typeof liveStat]
                                .current,
                            ),
                            'g',
                          )?.numberFixed +
                          '/' +
                          iSizeToSize(
                            _.toString(
                              liveStat[statKey as keyof typeof liveStat]
                                .capacity,
                            ),
                            'g',
                          )?.numberFixed +
                          ' GiB'
                        }
                      />
                    </Flex>
                  );
                }
              })}
            </Flex>
          );
        } else {
          return t('agent.NoAvailableLiveStat');
        }
      },
    },
    {
      title: t('agent.DiskPerc'),
      key: 'disk_perc',
      render: (value, record) => {
        const parsedDisk =
          JSON.parse(record?.live_stat || '{}')?.node?.disk ?? {};
        const pctValue = _.toFinite(parsedDisk.pct) || 0;
        const pct = _.toFinite(toFixedFloorWithoutTrailingZeros(pctValue, 2));
        const color = pct > 80 ? token.colorError : token.colorSuccess;
        return (
          <Flex direction="column">
            <BAIProgressWithLabel
              valueLabel={toFixedFloorWithoutTrailingZeros(pct, 1) + ' %'}
              percent={pct}
              strokeColor={color}
              width={120}
            />
            <Typography.Text style={{ fontSize: token.fontSizeSM }}>
              {bytesToGB(parsedDisk?.current)}GB /{' '}
              {bytesToGB(parsedDisk?.capacity)}GB
            </Typography.Text>
          </Flex>
        );
      },
    },
    {
      title: t('general.ResourceGroup'),
      key: 'resource_group',
      dataIndex: 'scaling_group',
      sorter: true,
    },
    {
      title: t('agent.Status'),
      key: 'status',
      dataIndex: 'status',
      render: (value, record) => {
        const parsedComputePlugins = JSON.parse(
          record?.compute_plugins || '{}',
        );
        const parsedAvailableSlots = JSON.parse(
          record?.available_slots || '{}',
        );
        return (
          <Flex direction="column" gap="xxs" align="start">
            <DoubleTag
              values={[
                { label: 'Agent' },
                {
                  label: record?.version,
                  color:
                    value === 'ALIVE'
                      ? 'green'
                      : value === 'TERMINATED'
                        ? 'red'
                        : 'blue',
                },
              ]}
            />
            {parsedComputePlugins?.cuda ? (
              <>
                {parsedComputePlugins?.cuda?.cuda_version ? (
                  <DoubleTag
                    values={[
                      { label: 'CUDA' },
                      {
                        label: parsedComputePlugins?.cuda?.cuda_version,
                        color: 'green',
                      },
                    ]}
                  />
                ) : (
                  <Tag color="green">CUDA Disabled</Tag>
                )}
                <DoubleTag
                  values={[
                    { label: 'CUDA Plugin' },
                    {
                      label: parsedComputePlugins?.cuda?.version,
                      color: 'blue',
                    },
                  ]}
                />
                {_.includes(_.keys(parsedAvailableSlots), 'cuda.shares') ? (
                  <Tag color="blue">Fractional GPU™</Tag>
                ) : null}
              </>
            ) : null}
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
                  color: token.colorPrimary,
                  fontSize: token.fontSizeXL,
                }}
              />
            ) : (
              <MinusCircleOutlined
                style={{
                  color: token.colorError,
                  fontSize: token.fontSizeXL,
                }}
              />
            )}
          </Flex>
        );
      },
      sorter: true,
    },
    {
      title: t('general.Control'),
      key: 'control',
      fixed: 'right',
      render: (value, record) => {
        return (
          <Flex>
            <Button
              size="large"
              style={{
                color: token.colorSuccess,
              }}
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => setCurrentAgentInfo(record)}
            />
            <Button
              size="large"
              style={{
                color: token.colorInfo,
              }}
              type="text"
              icon={<SettingOutlined />}
              onClick={() => setCurrentSettingAgent(record)}
            />
          </Flex>
        );
      },
    },
  ];
  const [displayedColumnKeys, setDisplayedColumnKeys] = useLocalStorageState(
    'backendaiwebui.AgentList.displayedColumnKeys',
    {
      defaultValue: columns.map((column) => _.toString(column.key)),
    },
  );

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
          <Segmented
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
            onChange={(value) => {
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
                key: 'addr',
                propertyLabel: t('agent.Endpoint'),
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
        dataSource={agent_list?.items}
        showSorterTooltip={false}
        columns={
          _.filter(columns, (column) =>
            displayedColumnKeys?.includes(_.toString(column.key)),
          ) as ColumnType<AnyObject>[]
        }
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          showSizeChanger: true,
          total: agent_list?.total_count,
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
            setIsOpenColumnsSetting(true);
          }}
        />
      </Flex>
      <AgentDetailModal
        agentDetailModalFrgmt={currentAgentInfo}
        open={!!currentAgentInfo}
        onRequestClose={() => setCurrentAgentInfo(null)}
      />
      <AgentSettingModal
        agentSettingModalFrgmt={currentSettingAgent}
        open={!!currentSettingAgent}
        onRequestClose={(success) => {
          if (success) {
            updateFetchKeyInTransition();
          }
          setCurrentSettingAgent(null);
        }}
      />
      <TableColumnsSettingModal
        open={isOpenColumnsSetting}
        onRequestClose={(values) => {
          values?.selectedColumnKeys &&
            setDisplayedColumnKeys(values?.selectedColumnKeys);
          setIsOpenColumnsSetting(false);
        }}
        columns={columns}
        displayedColumnKeys={displayedColumnKeys ? displayedColumnKeys : []}
      />
    </Flex>
  );
};

export default AgentList;
