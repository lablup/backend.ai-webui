import { AgentDetailModalFragment$key } from '../__generated__/AgentDetailModalFragment.graphql';
import {
  AgentListQuery,
  AgentListQuery$data,
} from '../__generated__/AgentListQuery.graphql';
import { AgentSettingModalFragment$key } from '../__generated__/AgentSettingModalFragment.graphql';
import {
  convertToBinaryUnit,
  convertToDecimalUnit,
  convertUnitValue,
  toFixedFloorWithoutTrailingZeros,
} from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { ResourceSlotName, useResourceSlotsDetails } from '../hooks/backendai';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import { useThemeMode } from '../hooks/useThemeMode';
import AgentDetailModal from './AgentDetailModal';
import AgentSettingModal from './AgentSettingModal';
import BAIIntervalView from './BAIIntervalView';
import BAIProgressWithLabel from './BAIProgressWithLabel';
import BAIRadioGroup from './BAIRadioGroup';
import DoubleTag from './DoubleTag';
import { ResourceTypeIcon } from './ResourceNumber';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  MinusCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button, TableProps, Tag, theme, Tooltip, Typography } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { ColumnsType, ColumnType } from 'antd/es/table';
import {
  filterOutNullAndUndefined,
  BAITable,
  BAIFlex,
  BAIPropertyFilter,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type Agent = NonNullable<AgentListQuery$data['agent_list']>['items'][number];

interface AgentListProps {
  tableProps?: Omit<TableProps, 'dataSource'>;
}

const AgentList: React.FC<AgentListProps> = ({ tableProps }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const [currentAgentInfo, setCurrentAgentInfo] =
    useState<AgentDetailModalFragment$key | null>();
  const [currentSettingAgent, setCurrentSettingAgent] =
    useState<AgentSettingModalFragment$key | null>();
  const [visibleColumnSettingModal, { toggle: toggleColumnSettingModal }] =
    useToggle();
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
    pageSize: 10,
  });
  const [order, setOrder] = useState<string>();

  const [fetchKey, updateFetchKey] = useUpdatableState('first');
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
      fetchPolicy: fetchKey === 'first' ? 'store-and-network' : 'network-only',
    },
  );

  const columns: ColumnsType<Agent> = [
    {
      title: <>ID / {t('agent.Endpoint')}</>,
      key: 'id',
      dataIndex: 'id',
      fixed: 'left',
      render: (value, record) => {
        return (
          <BAIFlex direction="column" align="start">
            <Typography.Text>{value}</Typography.Text>
            <Typography.Text type="secondary">{record?.addr}</Typography.Text>
          </BAIFlex>
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
          <BAIFlex gap={'xxs'}>
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
          </BAIFlex>
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
          <BAIFlex direction="column">
            <Typography.Text>{dayjs(value).format('ll LTS')}</Typography.Text>
            <BAIIntervalView
              callback={() => {
                return baiClient.utils.elapsedTime(value, Date.now());
              }}
              delay={1000}
              render={(intervalValue) => (
                <DoubleTag
                  values={[
                    { label: t('agent.Running') },
                    {
                      label: intervalValue,
                    },
                  ]}
                />
              )}
            />
          </BAIFlex>
        );
      },
      sorter: true,
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
          <BAIFlex direction="column" gap="xxs">
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
                          &nbsp;/&nbsp;
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
                          &nbsp;/&nbsp;
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
                          &nbsp;/&nbsp;
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
                capacity: _.toFinite(parsedValue.node[statKey].capacity) || 100,
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
          const baseUnit =
            convertUnitValue(_.toString(liveStat.mem_util.capacity), 'auto')
              ?.unit || 'g';
          return (
            <BAIFlex direction="column" gap="xxs">
              <BAIFlex
                justify="between"
                style={{ minWidth: 200, width: '100%' }}
              >
                <Typography.Text>
                  {mergedResourceSlots?.cpu?.human_readable_name}
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
              </BAIFlex>
              <BAIFlex
                justify="between"
                style={{ minWidth: 200, width: '100%' }}
              >
                <Typography.Text>
                  {mergedResourceSlots?.mem?.human_readable_name}
                </Typography.Text>
                <BAIProgressWithLabel
                  percent={liveStat.mem_util.ratio * 100}
                  width={120}
                  valueLabel={
                    convertToBinaryUnit(
                      _.toString(liveStat.mem_util.current),
                      baseUnit,
                    )?.numberFixed +
                    ' / ' +
                    convertToBinaryUnit(
                      _.toString(liveStat.mem_util.capacity),
                      baseUnit,
                    )?.displayValue
                  }
                />
              </BAIFlex>
              {_.map(_.keys(parsedValue?.node), (statKey) => {
                if (['cpu_util', 'mem'].includes(statKey)) {
                  return;
                }
                if (_.includes(statKey, '_util')) {
                  const deviceName = _.split(statKey, '_')[0] + '.device';
                  return (
                    <BAIFlex
                      key={statKey}
                      justify="between"
                      style={{ minWidth: 200, width: '100%' }}
                      gap="xxs"
                    >
                      <Typography.Text>
                        {mergedResourceSlots?.[deviceName]?.human_readable_name}
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
                    </BAIFlex>
                  );
                }
                if (_.includes(statKey, '_mem')) {
                  const deviceName = _.split(statKey, '_')[0] + '.device';
                  const baseUnit =
                    convertUnitValue(
                      _.toString(
                        liveStat[statKey as keyof typeof liveStat].capacity,
                      ),
                      'auto',
                    )?.unit || 'g';
                  return (
                    <BAIFlex
                      key={statKey}
                      justify="between"
                      style={{ minWidth: 200, width: '100%' }}
                      gap="xxs"
                    >
                      <Typography.Text>
                        {mergedResourceSlots?.[deviceName]?.human_readable_name}
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
                          convertToBinaryUnit(
                            _.toString(
                              liveStat[statKey as keyof typeof liveStat]
                                .current,
                            ),
                            baseUnit,
                          )?.numberFixed +
                          ' / ' +
                          convertToBinaryUnit(
                            _.toString(
                              liveStat[statKey as keyof typeof liveStat]
                                .capacity,
                            ),
                            baseUnit,
                          )?.displayValue
                        }
                      />
                    </BAIFlex>
                  );
                }
              })}
            </BAIFlex>
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
        const baseUnit =
          convertUnitValue(parsedDisk?.capacity, 'auto', {
            base: 1000,
          })?.unit || 'g';
        return (
          <BAIFlex direction="column">
            <BAIProgressWithLabel
              valueLabel={toFixedFloorWithoutTrailingZeros(pct, 1) + ' %'}
              percent={pct}
              strokeColor={color}
              width={120}
            />
            <Typography.Text style={{ fontSize: token.fontSizeSM }}>
              {convertToDecimalUnit(parsedDisk?.current, baseUnit)?.numberFixed}
              &nbsp;/&nbsp;
              {
                convertToDecimalUnit(parsedDisk?.capacity, baseUnit)
                  ?.displayValue
              }
            </Typography.Text>
          </BAIFlex>
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
          <BAIFlex direction="column" gap="xxs" align="start">
            <DoubleTag
              values={[
                { label: 'Agent' },
                {
                  label: record?.version || '',
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
          </BAIFlex>
        );
      },
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
    {
      title: t('general.Control'),
      key: 'control',
      fixed: 'right',
      render: (value, record) => {
        return (
          <BAIFlex>
            <Button
              style={{
                color: token.colorSuccess,
              }}
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => setCurrentAgentInfo(record)}
            />
            <Button
              style={{
                color: token.colorInfo,
              }}
              type="text"
              icon={<SettingOutlined />}
              onClick={() => setCurrentSettingAgent(record)}
            />
          </BAIFlex>
        );
      },
    },
  ];

  const [hiddenColumnKeys, setHiddenColumnKeys] =
    useHiddenColumnKeysSetting('AgentList');

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex justify="between" align="start" wrap="wrap">
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
        </BAIFlex>
        <BAIFlex gap="xs">
          <Tooltip title={t('button.Refresh')}>
            <Button
              loading={isPendingRefresh}
              onClick={() => updateFetchKeyInTransition()}
              icon={<ReloadOutlined />}
            ></Button>
          </Tooltip>
        </BAIFlex>
      </BAIFlex>
      <BAITable
        size="small"
        scroll={{ x: 'max-content' }}
        rowKey={'id'}
        dataSource={filterOutNullAndUndefined(agent_list?.items)}
        showSorterTooltip={false}
        columns={
          _.filter(
            columns,
            (column) => !_.includes(hiddenColumnKeys, _.toString(column?.key)),
          ) as ColumnType<AnyObject>[]
        }
        resizable
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          total: agent_list?.total_count,
          current: tablePaginationOption.current,
          extraContent: (
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => {
                toggleColumnSettingModal();
              }}
            />
          ),
          onChange(current, pageSize) {
            startPageChangeTransition(() => {
              if (_.isNumber(current) && _.isNumber(pageSize)) {
                setTablePaginationOption({
                  current,
                  pageSize,
                });
              }
            });
          },
        }}
        onChangeOrder={(order) => {
          startPageChangeTransition(() => {
            setOrder(order);
          });
        }}
        loading={isPendingPageChange || isPendingStatusFetch || isPendingFilter}
        {...tableProps}
      />
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

export default AgentList;
