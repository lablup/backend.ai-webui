import {
  BAIAgentTableFragment$data,
  BAIAgentTableFragment$key,
} from '../../__generated__/BAIAgentTableFragment.graphql';
import {
  convertToBinaryUnit,
  convertToDecimalUnit,
  convertUnitValue,
  toFixedFloorWithoutTrailingZeros,
} from '../../helper';
import { useResourceSlotsDetails } from '../../hooks';
import BAIDoubleTag from '../BAIDoubleTag';
import BAIFlex from '../BAIFlex';
import BAIIntervalView from '../BAIIntervalView';
import BAILink from '../BAILink';
import BAIProgressWithLabel from '../BAIProgressWithLabel';
import { ResourceTypeIcon } from '../BAIResourceNumberWithIcon';
import BAITag from '../BAITag';
import BAIText from '../BAIText';
import { BAIColumnType, BAITable, BAITableProps } from '../Table';
import { ResourceSlotName, useConnectedBAIClient } from '../provider';
import { CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { theme, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type AgentNodeInList = NonNullable<
  NonNullable<BAIAgentTableFragment$data>[number]
>;

export const availableAgentSorterKeys = [
  'first_contact',
  'scaling_group',
  'status',
  'schedulable',
] as const;

export const availableAgentSorterValues = [
  ...availableAgentSorterKeys,
  ...availableAgentSorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableAgentSorterKeys, key);
};

export interface BAIAgentTableProps
  extends Omit<BAITableProps<any>, 'dataSource' | 'columns' | 'onChangeOrder'> {
  agentsFragment: BAIAgentTableFragment$key;
  onClickAgentName?: (agent: AgentNodeInList) => void;
  onChangeOrder?: (
    order: (typeof availableAgentSorterValues)[number] | undefined,
  ) => void;
  customizeColumns?: (
    baseColumns: BAIColumnType<AgentNodeInList>[],
  ) => BAIColumnType<AgentNodeInList>[];
}

const BAIAgentTable: React.FC<BAIAgentTableProps> = ({
  agentsFragment,
  onClickAgentName,
  onChangeOrder,
  customizeColumns,
  ...tableProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useConnectedBAIClient();

  const { mergedResourceSlots } = useResourceSlotsDetails();

  const agents = useFragment(
    graphql`
      fragment BAIAgentTableFragment on AgentNode @relay(plural: true) {
        id
        row_id
        addr
        region
        architecture
        first_contact
        occupied_slots
        available_slots
        live_stat
        status
        scaling_group
        compute_plugins
        version
        schedulable
      }
    `,
    agentsFragment,
  );

  const columns: ColumnsType<AgentNodeInList> = [
    {
      title: <>ID / {t('comp:AgentTable.Endpoint')}</>,
      key: 'row_id',
      dataIndex: 'row_id',
      fixed: 'left',
      render: (value, record) => {
        return (
          <BAIFlex direction="column" align="start">
            {onClickAgentName ? (
              <BAILink
                type="hover"
                onClick={() => {
                  onClickAgentName(record);
                }}
              >
                {value}
              </BAILink>
            ) : (
              <Typography.Text>{value}</Typography.Text>
            )}
            <Typography.Text type="secondary">{record?.addr}</Typography.Text>
          </BAIFlex>
        );
      },
      sorter: isEnableSorter('row_id'),
    },
    {
      title: t('comp:AgentTable.Region'),
      key: 'region',
      dataIndex: 'region',
      sorter: isEnableSorter('region'),
    },
    {
      title: t('comp:AgentTable.Architecture'),
      key: 'architecture',
      dataIndex: 'architecture',
      sorter: isEnableSorter('architecture'),
    },
    {
      title: t('comp:AgentTable.Starts'),
      key: 'first_contact',
      dataIndex: 'first_contact',
      render: (value, record) => {
        return (
          <BAIFlex direction="column" align="start">
            <Typography.Text>{dayjs(value).format('ll LTS')}</Typography.Text>
            {record?.status === 'ALIVE' && (
              <BAIIntervalView
                callback={() => {
                  return baiClient.utils.elapsedTime(value, Date.now());
                }}
                delay={1000}
                render={(intervalValue) => (
                  <BAIDoubleTag
                    values={[
                      { label: t('comp:AgentTable.Running') },
                      { label: intervalValue },
                    ]}
                  />
                )}
              />
            )}
          </BAIFlex>
        );
      },
      sorter: isEnableSorter('first_contact'),
    },
    {
      title: t('comp:AgentTable.Allocation'),
      key: 'allocated_resources',
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
      title: t('comp:AgentTable.Utilization'),
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
            liveStat.cpu_util.ratio = Math.min(
              _.toFinite(parsedValue.node.cpu_util.pct) / 100 / (numCores || 1),
              1,
            );
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
                // CPU
                justify="between"
                style={{ minWidth: 200, width: '100%' }}
                data-testid="live-stat-cpu"
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
                // MEM
                justify="between"
                style={{ minWidth: 200, width: '100%' }}
                data-testid="live-stat-mem"
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
                      data-testid={`live-stat-${statKey}`}
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
                      data-testid={`live-stat-${statKey}`}
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
                      data-testid={`live-stat-${statKey}`}
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
                      data-testid={`live-stat-${statKey}`}
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
                      data-testid={`live-stat-${statKey}`}
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
                    data-testid={`live-stat-${statKey}`}
                  >
                    <BAIText>{statKey}</BAIText>
                    <BAIText>{`${toFixedFloorWithoutTrailingZeros(parsedValue.node[statKey]?.current ?? 0, 2)}${parsedValue.node[statKey]?.unit_hint ? ` ${parsedValue.node[statKey].unit_hint}` : ''}`}</BAIText>
                  </BAIFlex>
                );
              })}
            </BAIFlex>
          );
        } else {
          return t('comp:AgentTable.NoAvailableLiveStat');
        }
      },
    },
    {
      title: t('comp:AgentTable.DiskPerc'),
      key: 'disk_pct',
      render: (_value, record) => {
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
          <BAIFlex direction="column" align="end">
            <BAIProgressWithLabel
              valueLabel={toFixedFloorWithoutTrailingZeros(pct, 1) + ' %'}
              percent={pct}
              strokeColor={color}
              width={120}
            />
            {!_.isEmpty(parsedDisk) && (
              <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                {
                  convertToDecimalUnit(parsedDisk?.current, baseUnit)
                    ?.numberFixed
                }
                &nbsp;/&nbsp;
                {
                  convertToDecimalUnit(parsedDisk?.capacity, baseUnit)
                    ?.displayValue
                }
              </Typography.Text>
            )}
          </BAIFlex>
        );
      },
    },
    {
      title: t('comp:AgentTable.ResourceGroup'),
      key: 'scaling_group',
      dataIndex: 'scaling_group',
      sorter: isEnableSorter('scaling_group'),
    },
    {
      title: t('comp:AgentTable.Status'),
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
            <BAIDoubleTag
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
                  <BAIDoubleTag
                    values={[
                      { label: 'CUDA' },
                      {
                        label: parsedComputePlugins?.cuda?.cuda_version,
                        color: 'green',
                      },
                    ]}
                  />
                ) : (
                  <BAITag color="green">CUDA Disabled</BAITag>
                )}
                <BAIDoubleTag
                  values={[
                    { label: 'CUDA Plugin' },
                    {
                      label: parsedComputePlugins?.cuda?.version,
                      color: 'blue',
                    },
                  ]}
                />
                {_.includes(_.keys(parsedAvailableSlots), 'cuda.shares') ? (
                  <BAITag color="blue" style={{ borderRadius: 0 }}>
                    Fractional GPU™
                  </BAITag>
                ) : null}
              </>
            ) : null}
          </BAIFlex>
        );
      },
      sorter: isEnableSorter('status'),
    },
    {
      title: t('comp:AgentTable.Schedulable'),
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
      sorter: isEnableSorter('schedulable'),
    },
  ];

  const mergedColumns = customizeColumns ? customizeColumns(columns) : columns;

  return (
    <BAITable<AgentNodeInList>
      scroll={{ x: 'max-content' }}
      {...tableProps}
      rowKey={(record) => record.id}
      dataSource={agents}
      columns={mergedColumns}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availableAgentSorterValues)[number]) || null,
        );
      }}
    />
  );
};

export default BAIAgentTable;
