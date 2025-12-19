import {
  AgentNodesFragment$data,
  AgentNodesFragment$key,
} from '../__generated__/AgentNodesFragment.graphql';
import {
  convertToBinaryUnit,
  convertToDecimalUnit,
  convertUnitValue,
  toFixedFloorWithoutTrailingZeros,
} from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useResourceSlotsDetails } from '../hooks/backendai';
import { useThemeMode } from '../hooks/useThemeMode';
import AgentSettingModal from './AgentSettingModal';
import BAIIntervalView from './BAIIntervalView';
import BAIProgressWithLabel from './BAIProgressWithLabel';
import DoubleTag from './DoubleTag';
import { ResourceTypeIcon } from './ResourceNumber';
import {
  CheckCircleOutlined,
  MinusCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, Tag, theme } from 'antd';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAIColumnType,
  BAITable,
  BAITableProps,
  BAIFlex,
  toLocalId,
  BAIText,
  parseObjectMap,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { AgentSettingModalFragment$key } from 'src/__generated__/AgentSettingModalFragment.graphql';

export type AgentNodeInList = NonNullable<AgentNodesFragment$data[number]>;

const availableAgentSorterKeys = [
  'id',
  'status',
  'status_changed',
  'region',
  'scaling_group',
  'schedulable',
  'first_contact',
  'lost_at',
  'version',
  'available_slots',
  'occupied_slots',
] as const;

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
} as const;

const RESOURCE_USAGE_WARNING_THRESHOLD = 80;

export const availableAgentSorterValues = [
  ...availableAgentSorterKeys,
  ...availableAgentSorterKeys.map((k) => `-${k}` as const),
] as const;

const isEnableSorter = (key: string) =>
  _.includes(availableAgentSorterKeys, key);

interface AgentNodesProps
  extends Omit<
    BAITableProps<AgentNodeInList>,
    'dataSource' | 'columns' | 'onChangeOrder'
  > {
  agentsFrgmt: AgentNodesFragment$key;
  disableSorter?: boolean;
  onChangeOrder?: (
    order: (typeof availableAgentSorterValues)[number] | null,
  ) => void;
}

const AgentNodes: React.FC<AgentNodesProps> = ({
  agentsFrgmt,
  disableSorter,
  onChangeOrder,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const baiClient = useSuspendedBackendaiClient();
  const [currentSettingAgent, setCurrentSettingAgent] =
    useState<AgentSettingModalFragment$key | null>(null);

  const agents = useFragment(
    graphql`
      fragment AgentNodesFragment on AgentNode @relay(plural: true) {
        id @required(action: NONE)
        region
        scaling_group
        schedulable
        available_slots
        occupied_slots
        addr
        first_contact
        live_stat
        version
        compute_plugins
        status
        status_changed
        lost_at
        hardware_metadata
        auto_terminate_abusing_kernel
        local_config
        container_count
        gpu_alloc_map
        permissions
        ...AgentSettingModalFragment
      }
    `,
    agentsFrgmt,
  );

  const filteredAgents = filterOutNullAndUndefined(agents);

  const columns = _.map(
    filterOutEmpty<BAIColumnType<AgentNodeInList>>([
      {
        key: 'id',
        dataIndex: 'id',
        title: `ID / ${t('agent.Endpoint')}`,
        render: (value, agent) => (
          <BAIFlex direction="column" align="start">
            <BAIText>{toLocalId(value)}</BAIText>
            <BAIText type="secondary">{agent?.addr}</BAIText>
          </BAIFlex>
        ),
        sorter: isEnableSorter('id'),
        required: true,
        fixed: 'left',
      },
      {
        key: 'controls',
        title: t('general.Control'),
        fixed: 'left',
        render: (_value, agent) => {
          return (
            <BAIFlex>
              <Button
                style={{
                  color: token.colorInfo,
                }}
                type="text"
                icon={<SettingOutlined />}
                onClick={() => setCurrentSettingAgent(agent)}
              />
            </BAIFlex>
          );
        },
      },
      {
        key: 'status',
        dataIndex: 'status',
        title: t('agent.Status'),
        sorter: isEnableSorter('status'),
        render: (value) => (
          <Tag color={value === 'ALIVE' ? 'green' : 'default'}>{value}</Tag>
        ),
      },
      {
        key: 'schedulable',
        dataIndex: 'schedulable',
        title: t('agent.Schedulable'),
        sorter: isEnableSorter('schedulable'),
        render: (value: boolean) =>
          value ? (
            <BAIFlex align="center" justify="center">
              <CheckCircleOutlined
                style={{
                  color: token.colorSuccess,
                  fontSize: token.fontSizeXL,
                }}
              />
            </BAIFlex>
          ) : (
            <BAIFlex align="center" justify="center">
              <MinusCircleOutlined
                style={{
                  color: token.colorTextDisabled,
                  fontSize: token.fontSizeXL,
                }}
              />
            </BAIFlex>
          ),
      },
      {
        key: 'allocation',
        dataIndex: 'available_slots',
        title: t('agent.Allocation'),
        sorter: isEnableSorter('available_slots'),
        render: (_value, agent) => {
          const parsedOccupiedSlots = parseObjectMap(
            agent?.occupied_slots || '{}',
          );
          const parsedAvailableSlots = parseObjectMap(
            agent?.available_slots || '{}',
          );
          return (
            <BAIFlex direction="column" gap="xxs">
              {_.map(parsedAvailableSlots, (_v, key) => {
                // CPU allocation rendering
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
                        <ResourceTypeIcon type={key} />
                        <BAIText>
                          {toFixedFloorWithoutTrailingZeros(
                            parsedOccupiedSlots.cpu || 0,
                            0,
                          )}
                          &nbsp;/&nbsp;
                          {toFixedFloorWithoutTrailingZeros(
                            parsedAvailableSlots.cpu || 0,
                            0,
                          )}
                        </BAIText>
                        <BAIText
                          type="secondary"
                          style={{ fontSize: token.sizeXS }}
                        >
                          {mergedResourceSlots?.cpu?.display_unit}
                        </BAIText>
                      </BAIFlex>
                      <BAIProgressWithLabel
                        percent={cpuPercent}
                        strokeColor={
                          cpuPercent > RESOURCE_USAGE_WARNING_THRESHOLD
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
                  // Memory allocation rendering (binary units)
                  const memPercent = _.toFinite(
                    (_.toNumber(parsedOccupiedSlots.mem) /
                      _.toNumber(parsedAvailableSlots.mem)) *
                      100,
                  );
                  return (
                    <BAIFlex
                      key={key}
                      justify="between"
                      style={{ minWidth: 220 }}
                    >
                      <BAIFlex gap="xxs">
                        <ResourceTypeIcon type={'mem'} />
                        <BAIText>
                          {convertToBinaryUnit(parsedOccupiedSlots.mem, 'g', 0)
                            ?.numberFixed ?? 0}
                          &nbsp;/&nbsp;
                          {convertToBinaryUnit(parsedAvailableSlots.mem, 'g', 0)
                            ?.numberFixed ?? 0}
                        </BAIText>
                        <BAIText
                          type="secondary"
                          style={{ fontSize: token.sizeXS }}
                        >
                          GiB
                        </BAIText>
                      </BAIFlex>
                      <BAIProgressWithLabel
                        percent={memPercent}
                        strokeColor={
                          memPercent > RESOURCE_USAGE_WARNING_THRESHOLD
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
                  // Other accelerator resources (GPU, TPU, etc.)
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
                        <ResourceTypeIcon type={key} />
                        <BAIText>
                          {toFixedFloorWithoutTrailingZeros(
                            parsedOccupiedSlots[key] || 0,
                            2,
                          )}
                          &nbsp;/&nbsp;
                          {toFixedFloorWithoutTrailingZeros(
                            parsedAvailableSlots[key],
                            2,
                          )}
                        </BAIText>
                        <BAIText
                          type="secondary"
                          style={{ fontSize: token.sizeXS }}
                        >
                          {mergedResourceSlots?.[key]?.display_unit}
                        </BAIText>
                      </BAIFlex>
                      <BAIProgressWithLabel
                        percent={percent}
                        strokeColor={
                          percent > RESOURCE_USAGE_WARNING_THRESHOLD
                            ? token.colorError
                            : token.colorSuccess
                        }
                        width={120}
                        valueLabel={
                          toFixedFloorWithoutTrailingZeros(percent, 1) + ' %'
                        }
                      />
                    </BAIFlex>
                  );
                }
                return null;
              })}
            </BAIFlex>
          );
        },
      },
      {
        key: 'live_stat',
        dataIndex: 'live_stat',
        title: t('agent.Utilization'),
        sorter: isEnableSorter('live_stat'),
        render: (value, agent) => {
          const parsedValue = parseObjectMap(value || '{}');
          const available_slots = parseObjectMap(
            agent?.available_slots || '{}',
          );
          if (agent?.status === 'ALIVE') {
            // Initialize live stat structure for CPU and memory
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
            // Calculate device-specific utilization (GPU, TPU, etc.)
            _.forEach(_.keys(parsedValue?.node), (statKey) => {
              if (
                ['cpu_util', 'mem', 'disk', 'net_rx', 'net_tx'].includes(
                  statKey,
                )
              )
                return;
              if (_.includes(statKey, '_util')) {
                // core utilization
                liveStat[statKey as keyof typeof liveStat] = {
                  capacity:
                    _.toFinite(parsedValue.node[statKey].capacity) || 100,
                  current: _.toFinite(parsedValue.node[statKey].current),
                  ratio:
                    _.toFinite(parsedValue.node[statKey].current) / 100 || 0,
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
            // Render utilization metrics
            return (
              <BAIFlex direction="column" gap="xxs">
                <BAIFlex
                  // CPU
                  justify="between"
                  style={{ minWidth: 200, width: '100%' }}
                >
                  <BAIText>
                    {mergedResourceSlots?.cpu?.human_readable_name}
                  </BAIText>
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
                  // MEM
                  justify="between"
                  style={{ minWidth: 200, width: '100%' }}
                >
                  <BAIText>
                    {mergedResourceSlots?.mem?.human_readable_name}
                  </BAIText>
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
                  if (['cpu_util', 'mem', 'disk'].includes(statKey)) {
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
                        <BAIText>
                          {
                            mergedResourceSlots?.[deviceName]
                              ?.human_readable_name
                          }
                          (util)
                        </BAIText>
                        <BAIProgressWithLabel
                          width={120}
                          percent={
                            (liveStat[statKey as keyof typeof liveStat]
                              .current /
                              liveStat[statKey as keyof typeof liveStat]
                                .capacity) *
                              100 || 0
                          }
                          valueLabel={
                            _.toFinite(
                              toFixedFloorWithoutTrailingZeros(
                                liveStat[statKey as keyof typeof liveStat]
                                  .ratio * 100,
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
                        <BAIText>
                          {
                            mergedResourceSlots?.[deviceName]
                              ?.human_readable_name
                          }
                          (mem)
                        </BAIText>
                        <BAIProgressWithLabel
                          width={120}
                          percent={
                            (liveStat[statKey as keyof typeof liveStat]
                              .current /
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
                  if (_.includes(statKey, '_power')) {
                    const deviceName =
                      _.split(statKey, '_').slice(0, -1).join('-') + '.device';
                    const humanReadableName =
                      mergedResourceSlots?.[deviceName]?.human_readable_name;
                    return (
                      <BAIFlex
                        key={statKey}
                        justify="between"
                        style={{ minWidth: 200, width: '100%' }}
                        gap="xxs"
                      >
                        <BAIText>{`${humanReadableName}(power)`}</BAIText>
                        <BAIText>{`${toFixedFloorWithoutTrailingZeros(parsedValue.node[statKey]?.current, 2)} ${parsedValue.node[statKey].unit_hint}`}</BAIText>
                      </BAIFlex>
                    );
                  }
                  if (_.includes(statKey, '_temperature')) {
                    const deviceName =
                      _.split(statKey, '_').slice(0, -1).join('_') + '.device';
                    const humanReadableName =
                      mergedResourceSlots?.[deviceName]?.human_readable_name;
                    return (
                      <BAIFlex
                        key={statKey}
                        justify="between"
                        style={{ minWidth: 200, width: '100%' }}
                        gap="xxs"
                      >
                        <BAIText>{`${humanReadableName}(temp)`}</BAIText>
                        <BAIText>{`${toFixedFloorWithoutTrailingZeros(parsedValue.node[statKey]?.current, 2)} °C`}</BAIText>
                      </BAIFlex>
                    );
                  }
                  if (_.includes(['net_rx', 'net_tx'], statKey)) {
                    const convertedValue = convertToDecimalUnit(
                      parsedValue.node[statKey]?.current,
                      'auto',
                    );
                    return (
                      <BAIFlex
                        key={statKey}
                        justify="between"
                        style={{ minWidth: 200, width: '100%' }}
                        gap="xxs"
                      >
                        <BAIText>
                          {statKey === 'net_rx' ? 'Net Rx' : 'Net Tx'}
                        </BAIText>
                        <BAIText>
                          {`${convertedValue?.numberFixed ?? 0} ${convertedValue?.unit.toUpperCase() ?? ''}bps`}
                        </BAIText>
                      </BAIFlex>
                    );
                  }
                  return (
                    <BAIFlex
                      key={statKey}
                      justify="between"
                      style={{ minWidth: 200, width: '100%' }}
                      gap="xxs"
                    >
                      <BAIText>{statKey}</BAIText>
                      <BAIText>{`${toFixedFloorWithoutTrailingZeros(parsedValue.node[statKey]?.current ?? 0, 2)}${parsedValue.node[statKey]?.unit_hint ? ` ${parsedValue.node[statKey].unit_hint}` : ''}`}</BAIText>
                    </BAIFlex>
                  );
                })}
              </BAIFlex>
            );
          } else {
            return t('agent.NoAvailableLiveStat');
          }
        },
      },
      {
        key: 'disk_perc',
        dataIndex: 'disk_perc',
        title: t('agent.DiskPerc'),
        sorter: isEnableSorter('disk_perc'),
        render: (_value, agent) => {
          const parsedDisk =
            parseObjectMap(agent?.live_stat || '{}')?.node?.disk ?? {};
          const pctValue = _.toFinite(parsedDisk.pct) || 0;
          const pct = _.toFinite(toFixedFloorWithoutTrailingZeros(pctValue, 2));
          const color =
            pct > RESOURCE_USAGE_WARNING_THRESHOLD
              ? token.colorError
              : token.colorSuccess;
          const baseUnit =
            convertUnitValue(parsedDisk?.capacity, 'auto', { base: 1000 })
              ?.unit || 'g';
          return (
            <BAIFlex direction="column">
              <BAIProgressWithLabel
                valueLabel={toFixedFloorWithoutTrailingZeros(pct, 1) + ' %'}
                percent={pct}
                strokeColor={color}
                width={120}
              />
              {parsedDisk?.current && parsedDisk?.capacity && (
                <>
                  {
                    convertToDecimalUnit(parsedDisk?.current, baseUnit)
                      ?.numberFixed
                  }
                  &nbsp;/&nbsp;
                  {
                    convertToDecimalUnit(parsedDisk?.capacity, baseUnit)
                      ?.displayValue
                  }
                </>
              )}
            </BAIFlex>
          );
        },
      },
      {
        key: 'container_count',
        dataIndex: 'container_count',
        title: t('agent.Containers'),
        sorter: isEnableSorter('container_count'),
        render: (value) => (_.isNumber(value) ? value : '-'),
      },
      {
        key: 'region',
        dataIndex: 'region',
        title: t('agent.Region'),
        sorter: isEnableSorter('region'),
        render: (value) => {
          if (!value) return '-';
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
                  width: 32,
                  height: 32,
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
        key: 'scaling_group',
        dataIndex: 'scaling_group',
        title: t('general.ResourceGroup'),
        sorter: isEnableSorter('scaling_group'),
        render: (value) => value || '-',
      },
      {
        key: 'compute_plugins',
        dataIndex: 'compute_plugins',
        title: t('agent.ComputePlugins'),
        sorter: isEnableSorter('compute_plugins'),
        render: (value) => {
          const plugins: Record<string, any> = parseObjectMap(value || '{}');
          if (_.isEmpty(plugins)) return '-';
          return (
            <BAIFlex direction="column" align="start">
              {plugins.cpu && (
                <BAIText>
                  {plugins.cpu.machine} / {plugins.cpu.os_type}
                </BAIText>
              )}
              {_.map(
                _.filter(
                  _.entries(plugins),
                  ([pluginKey]) => !_.includes(['cpu', 'mem'], pluginKey),
                ),
                ([pluginKey, pluginValue]) => (
                  <BAIFlex
                    style={{ marginTop: token.marginXXS }}
                    key={pluginKey}
                    direction="column"
                    align="start"
                  >
                    <BAIText>
                      {mergedResourceSlots?.[pluginKey]?.human_readable_name ||
                        _.upperCase(pluginKey ?? '')}
                    </BAIText>
                    {_.isPlainObject(pluginValue) ? (
                      Object.entries(pluginValue).map(([k, v]) => (
                        <BAIText
                          key={k}
                          type="secondary"
                          style={{ marginLeft: token.margin }}
                        >
                          - {_.capitalize(_.replace(k, '_', ' '))}:{' '}
                          {_.toString(v)}
                        </BAIText>
                      ))
                    ) : (
                      <BAIText type="secondary">
                        - {String(pluginValue)}
                      </BAIText>
                    )}
                  </BAIFlex>
                ),
              )}
            </BAIFlex>
          );
        },
      },
      {
        key: 'hardware_metadata',
        dataIndex: 'hardware_metadata',
        title: t('agent.HardwareMetadata'),
        defaultHidden: true,
        sorter: isEnableSorter('hardware_metadata'),
        render: (value) => {
          const hardwareMetadata: Record<string, any> = parseObjectMap(
            value || '{}',
          );
          if (_.isEmpty(hardwareMetadata)) return '-';

          const renderMetadataItem = (
            data: any,
            key: string,
            depth: number = 0,
          ): React.ReactNode => {
            // Skip null, undefined, or empty objects
            if (
              _.isNull(data) ||
              _.isUndefined(data) ||
              (_.isPlainObject(data) && _.isEmpty(data))
            ) {
              return null;
            }

            const marginLeft = depth * token.margin;
            const isTopLevel = depth === 0;
            const displayKey = _.capitalize(_.replace(key, '_', ' '));

            if (_.isPlainObject(data)) {
              return (
                <BAIFlex
                  key={`${key}-${depth}`}
                  direction="column"
                  align="start"
                  style={{
                    marginTop: isTopLevel ? token.marginXXS : 0,
                    marginLeft,
                  }}
                >
                  <BAIText type={isTopLevel ? undefined : 'secondary'}>
                    {isTopLevel
                      ? mergedResourceSlots?.[key]?.human_readable_name ||
                        _.upperCase(key)
                      : `- ${displayKey}:`}
                  </BAIText>
                  {Object.entries(data).map(([subKey, subValue]) =>
                    renderMetadataItem(subValue, subKey, depth + 1),
                  )}
                </BAIFlex>
              );
            }

            // For primitive values
            return (
              <BAIText
                key={`${key}-${depth}`}
                type="secondary"
                style={{ marginLeft }}
              >
                - {displayKey}: {_.toString(data)}
              </BAIText>
            );
          };

          return (
            <BAIFlex direction="column" align="start">
              {_.map(hardwareMetadata, (deviceData, deviceKey) =>
                renderMetadataItem(deviceData, deviceKey, 0),
              )}
            </BAIFlex>
          );
        },
      },
      {
        key: 'version',
        dataIndex: 'version',
        title: t('agent.AgentVersion'),
        sorter: isEnableSorter('version'),
        render: (value) => value || '-',
      },
      {
        key: 'first_contact',
        dataIndex: 'first_contact',
        title: t('agent.Starts'),
        sorter: isEnableSorter('first_contact'),
        render: (value) =>
          value ? (
            <BAIFlex direction="column">
              <BAIText>{dayjs(value).format('ll LTS')}</BAIText>
              <BAIIntervalView
                callback={() => baiClient.utils.elapsedTime(value, Date.now())}
                delay={1000}
                render={(intervalValue) => (
                  <DoubleTag
                    values={[
                      { label: t('agent.Running') },
                      { label: intervalValue },
                    ]}
                  />
                )}
              />
            </BAIFlex>
          ) : (
            '-'
          ),
      },
      {
        key: 'status_changed',
        dataIndex: 'status_changed',
        title: t('agent.StatusChanged'),
        defaultHidden: true,
        sorter: isEnableSorter('status_changed'),
        render: (value) => (value ? dayjs(value).format('ll LTS') : '-'),
      },
      {
        key: 'lost_at',
        dataIndex: 'lost_at',
        title: t('agent.LostAt'),
        defaultHidden: true,
        sorter: isEnableSorter('lost_at'),
        render: (value) => (value ? dayjs(value).format('ll LTS') : '-'),
      },
      {
        key: 'auto_terminate_abusing_kernel',
        dataIndex: 'auto_terminate_abusing_kernel',
        title: t('agent.AutoTerminateAbusingKernel'),
        defaultHidden: true,
        sorter: isEnableSorter('auto_terminate_abusing_kernel'),
        render: (value: boolean) =>
          value ? (
            <BAIFlex align="center" justify="center">
              <CheckCircleOutlined style={{ color: token.colorSuccess }} />
            </BAIFlex>
          ) : (
            <BAIFlex align="center" justify="center">
              <MinusCircleOutlined style={{ color: token.colorTextDisabled }} />
            </BAIFlex>
          ),
      },
      {
        key: 'local_config',
        dataIndex: 'local_config',
        title: t('agent.Guard'),
        defaultHidden: true,
        sorter: isEnableSorter('local_config'),
        render: (value) => {
          const abuseReportPath = value?.agent?.['abuse-report-path'];
          const antiMining =
            abuseReportPath !== null &&
            abuseReportPath !== 'None' &&
            !!abuseReportPath;
          return antiMining ? (
            <Tag color="green">{t('agent.AntiMining')}</Tag>
          ) : (
            '-'
          );
        },
      },
      {
        key: 'gpu_alloc_map',
        dataIndex: 'gpu_alloc_map',
        title: 'GPU Allocation Map',
        defaultHidden: true,
        sorter: isEnableSorter('gpu_alloc_map'),
        render: (value) => {
          const parsedValue = parseObjectMap(value || '{}');
          const entries = _.map(
            parsedValue,
            (alloc: number, deviceId: string) =>
              `- ${deviceId}: ${toFixedFloorWithoutTrailingZeros(_.toNumber(alloc), 2)}`,
          );
          if (entries.length === 0) return '-';
          return (
            <BAIFlex direction="column" gap="xxs" align="start">
              {_.map(entries, (entry, index) => (
                <BAIText key={index}>{entry}</BAIText>
              ))}
            </BAIFlex>
          );
        },
      },
      {
        key: 'permissions',
        dataIndex: 'permissions',
        title: t('agent.Permissions'),
        defaultHidden: true,
        sorter: isEnableSorter('permissions'),
        width: 200,
        render: (value) => {
          if (!value || value.length === 0) return '-';
          return (
            <BAIFlex direction="column" gap="xxs" align="start">
              {_.map(value, (perm) => (
                <Tag key={perm}>{perm}</Tag>
              ))}
            </BAIFlex>
          );
        },
      },
    ]),
    (column) => (disableSorter ? _.omit(column, 'sorter') : column),
  );

  return (
    <>
      <BAITable
        resizable
        rowKey={'id'}
        size="small"
        dataSource={filteredAgents}
        columns={columns}
        scroll={{ x: 'max-content' }}
        onChangeOrder={(order) => {
          onChangeOrder?.(
            (order as (typeof availableAgentSorterValues)[number]) || null,
          );
        }}
        {...tableProps}
      />
      <Suspense>
        <AgentSettingModal
          agentNodeFrgmt={currentSettingAgent}
          open={!!currentSettingAgent}
          onRequestClose={() => {
            // TODO: refresh the agent list after successful update
            setCurrentSettingAgent(null);
          }}
        />
      </Suspense>
    </>
  );
};

export default AgentNodes;
