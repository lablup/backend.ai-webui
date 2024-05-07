import { bytesToGB, iSizeToSize } from '../helper';
import { localeCompare } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useResourceSlotsDetails } from '../hooks/backendai';
import { useBAIPaginationQueryOptions } from '../hooks/reactPaginationQueryOptions';
import { useThemeMode } from '../hooks/useThemeMode';
import AgentDetailModal from './AgentDetailModal';
import AgentSettingModal from './AgentSettingModal';
import AutoRefreshSwitch from './AutoRefreshSwitch';
import BAIIntervalText from './BAIIntervalText';
import BAIProgressWithLabel from './BAIProgressWithLabel';
import DoubleTag from './DoubleTag';
import Flex from './Flex';
import { ResourceTypeIcon, ResourceTypeKey } from './ResourceNumber';
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
  MinusCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import { Button, Table, TableProps, Tag, theme, Typography } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { ColumnsType, ColumnType } from 'antd/es/table';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';

type Agent = NonNullable<AgentListQuery$data['agent_list']>['items'][number];

interface AgentListProps extends Omit<TableProps, 'dataSource'> {
  page?: number;
  pageSize?: number;
  filter?: string;
  order?: string;
}

const AgentList: React.FC<AgentListProps> = ({
  page,
  pageSize,
  filter,
  order,
  ...tableProps
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
  const [, setParams] = useQueryParams({
    page: NumberParam,
    pageSize: NumberParam,
    filter: StringParam,
    order: StringParam,
  });

  useEffect(() => {
    setParams({ filter: filter });
  }, [filter, setParams]);

  const agentListQuery = graphql`
    query AgentListQuery(
      $limit: Int!
      $offset: Int!
      $filter: String
      $status: String
    ) {
      agent_list(
        limit: $limit
        offset: $offset
        filter: $filter
        status: $status
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
  `;

  const [paginationStates, { refresh }] = useBAIPaginationQueryOptions({
    query: agentListQuery,
    defaultVariables: {
      page: page ?? 1,
      pageSize: pageSize ?? 50,
      filter,
      order,
    },
  });

  const { agent_list } = useLazyLoadQuery<AgentListQuery>(
    agentListQuery,
    paginationStates.variables,
    paginationStates.refreshedQueryOptions,
  );

  const columns: ColumnsType<Agent> = [
    {
      title: '#',
      fixed: 'left',
      render: (id, record, index) => {
        return (
          index + 1 + (paginationStates.page - 1) * paginationStates.pageSize
        );
      },
      showSorterTooltip: false,
      rowScope: 'row',
    },
    {
      title: t('agent.Endpoint'),
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
      sorter: (a, b) => localeCompare(a?.id, b?.id),
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
      sorter: (a, b) => localeCompare(a?.architecture, b?.architecture),
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
      sorter: (a, b) => localeCompare(a?.first_contact, b?.first_contact),
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
                  <Flex justify="between" style={{ minWidth: 220 }}>
                    <Flex gap="xxs">
                      <ResourceTypeIcon key={key} type={key} />
                      <Typography.Text>
                        {parsedOccupiedSlots[key] ?? 0}/
                        {parsedAvailableSlots[key] ?? 0}
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
                        _.toFinite(
                          (parsedOccupiedSlots[key] /
                            parsedAvailableSlots[key]) *
                            100,
                        ).toFixed(2) + ' %'
                      }
                    />
                  </Flex>
                );
              } else if (key === 'mem') {
                return (
                  <Flex justify="between" style={{ minWidth: 220 }}>
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
                        _.toFinite(
                          (parsedOccupiedSlots[key] /
                            parsedAvailableSlots[key]) *
                            100,
                        ).toFixed(2) + ' %'
                      }
                    />
                  </Flex>
                );
              } else if (
                parsedOccupiedSlots[key] &&
                parsedAvailableSlots[key]
              ) {
                return (
                  <Flex justify="between" style={{ minWidth: 220 }}>
                    <Flex gap="xxs">
                      <ResourceTypeIcon
                        key={key as ResourceTypeKey}
                        type={key as ResourceTypeKey}
                      />
                      <Typography.Text>
                        {parsedOccupiedSlots[key] ?? 0}/
                        {parsedAvailableSlots[key] ?? 0}
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
                        _.toFinite(
                          (parsedOccupiedSlots[key] /
                            parsedAvailableSlots[key]) *
                            100,
                        ).toFixed(2) + ' %'
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
              (liveStat.cpu_util.current /
                liveStat.cpu_util.capacity /
                numCores) *
                100 || 0;
            liveStat.mem_util.capacity = _.toInteger(
              parsedValue.node.mem.capacity,
            );
            liveStat.mem_util.current = _.toInteger(
              parsedValue.node.mem.current,
            );
            liveStat.mem_util.ratio =
              (liveStat.mem_util.current / liveStat.mem_util.capacity) * 100 ||
              0;
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
                  percent={liveStat.cpu_util.ratio}
                  width={120}
                  valueLabel={
                    _.toFinite(liveStat.cpu_util.ratio.toFixed(1)) + ' %'
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
                          liveStat[statKey as keyof typeof liveStat].ratio
                        }
                        valueLabel={
                          _.toFinite(
                            liveStat[
                              statKey as keyof typeof liveStat
                            ].ratio.toFixed(1),
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
                          liveStat[statKey as keyof typeof liveStat].ratio
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
        const pctValue = parseFloat(parsedDisk.pct) || 0;
        const pct = parseFloat(pctValue.toFixed(1));
        const color = pct > 80 ? token.colorError : token.colorSuccess;
        return (
          <Flex direction="column">
            <BAIProgressWithLabel
              valueLabel={pct + ' %'}
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
      sorter: (a, b) => {
        return localeCompare(a?.scaling_group, b?.scaling_group);
      },
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
      sorter: (a, b) =>
        Number(a?.schedulable ?? false) - Number(b?.schedulable ?? false),
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
    <>
      <Flex justify="end" gap="xs" style={{ margin: token.marginXS }}>
        <AutoRefreshSwitch
          onRefresh={() => {
            //refresh current
            refresh(
              paginationStates.page,
              paginationStates.pageSize,
              paginationStates.order,
              paginationStates.filter,
            );
          }}
          interval={5000}
        >
          {t('agent.AutoRefreshEvery5s')}
        </AutoRefreshSwitch>
        <Button
          onClick={() =>
            refresh(
              paginationStates.page,
              paginationStates.pageSize,
              paginationStates.order,
              paginationStates.filter,
            )
          }
          icon={<ReloadOutlined />}
        >
          {t('button.Refresh')}
        </Button>
      </Flex>
      <Table
        scroll={{ x: 'max-content' }}
        rowKey={'id'}
        dataSource={agent_list?.items}
        columns={
          _.filter(columns, (column) =>
            displayedColumnKeys?.includes(_.toString(column.key)),
          ) as ColumnType<AnyObject>[]
        }
        pagination={{
          pageSize: paginationStates.pageSize,
          showSizeChanger: true,
          total: agent_list?.total_count,
          current: paginationStates.page || 1,
          showTotal(total, range) {
            return `${range[0]}-${range[1]} of ${total} items`;
          },
          style: { marginRight: token.marginXS },
        }}
        onChange={({ pageSize: newPageSize, current: newPage }) => {
          refresh(newPage, newPageSize, filter, order);
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
            refresh(
              paginationStates.page,
              paginationStates.pageSize,
              paginationStates.order,
              paginationStates.filter,
            );
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
    </>
  );
};

export default AgentList;
