import {
  AgentListQuery,
  AgentListQuery$data,
  AgentListQuery$variables,
} from '../__generated__/AgentListQuery.graphql';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useThemeMode } from '../hooks/useThemeMode';
import AgentDetailDrawer from './AgentDetailDrawer';
import AgentDetailModal from './AgentDetailModal';
import AgentSettingModal from './AgentSettingModal';
import BAIRadioGroup from './BAIRadioGroup';
import {
  InfoCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useControllableValue } from 'ahooks';
import { Button, TableProps, Tag, theme, Tooltip } from 'antd';
import {
  BAIFlex,
  BAIPropertyFilter,
  BAIFlexProps,
  INITIAL_FETCH_KEY,
  mergeFilterValues,
  BAIColumnType,
  BAIDoubleTag,
  filterOutEmpty,
  AgentNodeInList,
  BAIAgentTable,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import _ from 'lodash';
import { parseAsString, useQueryStates } from 'nuqs';
import React, { useState, useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';

type Agent = NonNullable<
  NonNullable<AgentListQuery$data['agent_nodes']>['edges'][number]
>['node'];

interface AgentListProps {
  tableProps?: Omit<TableProps, 'dataSource'>;
  headerProps?: BAIFlexProps;
  fetchKey?: string;
  onChangeFetchKey?: (key: string) => void;
}

const AgentList: React.FC<AgentListProps> = ({
  tableProps,
  headerProps,
  ...otherProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();
  const [currentAgentInfo, setCurrentAgentInfo] = useState<Agent | null>();
  const [openDetailDrawer, setOpenDetailDrawer] = useState<boolean>(false);
  const [openSettingModal, setOpenSettingModal] = useState<boolean>(false);
  const [openInfoModal, setOpenInfoModal] = useState<boolean>(false);
  const [queryParams, setQueryParams] = useQueryStates({
    status: parseAsString.withDefault('ALIVE'),
    filter: parseAsString,
    order: parseAsString,
  });

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [fetchKey, setFetchKey] = useControllableValue(otherProps, {
    valuePropName: 'fetchKey',
    trigger: 'onChangeFetchKey',
    defaultValue: INITIAL_FETCH_KEY,
  });

  const statusFilter =
    queryParams.status === 'ALIVE'
      ? 'status == "ALIVE"'
      : 'status == "TERMINATED"';

  const queryVariables: AgentListQuery$variables = {
    offset: baiPaginationOption.offset,
    first: baiPaginationOption.limit,
    order: queryParams.order || '-first_contact',
    filter: mergeFilterValues([queryParams.filter, statusFilter]),
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const updateFetchKey = () => {
    setFetchKey(() => new Date().toISOString());
  };

  const { agent_nodes } = useLazyLoadQuery<AgentListQuery>(
    graphql`
      query AgentListQuery(
        $filter: String
        $order: String
        $offset: Int
        $first: Int
        $before: String
        $after: String
        $last: Int
      ) {
        agent_nodes(
          filter: $filter
          order: $order
          offset: $offset
          first: $first
          after: $after
          before: $before
          last: $last
        ) {
          edges {
            node {
              id
              ...BAIAgentTableFragment
              ...AgentDetailModalFragment
              ...AgentSettingModalFragment
              ...AgentDetailDrawerFragment
            }
          }
          count
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

  const controlColumn: BAIColumnType<AgentNodeInList> = {
    title: t('general.Control'),
    key: 'control',
    fixed: 'left',
    render: (_value, record) => {
      return (
        <BAIFlex>
          <Button
            style={{
              color: token.colorInfo,
            }}
            type="text"
            icon={<InfoCircleOutlined />}
            onClick={() => {
              const targetAgent = _.find(
                agent_nodes?.edges,
                (e) => e?.node?.id === record.id,
              )?.node;
              setCurrentAgentInfo(targetAgent || null);
              setOpenInfoModal(true);
            }}
          />
          <Button
            style={{
              color: token.colorInfo,
            }}
            type="text"
            icon={<SettingOutlined />}
            onClick={() => {
              const targetAgent = _.find(
                agent_nodes?.edges,
                (e) => e?.node?.id === record.id,
              )?.node;
              setCurrentAgentInfo(targetAgent || null);
              setOpenSettingModal(true);
            }}
          />
        </BAIFlex>
      );
    },
  };
  const regionColumn: BAIColumnType<AgentNodeInList> = {
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
            <BAIDoubleTag
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
  };

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.AgentList',
  );

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="sm"
      data-testid="agent-list"
    >
      <BAIFlex justify="between" align="start" wrap="wrap" {...headerProps}>
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
              setQueryParams({ status: e.target.value });
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
            value={queryParams.filter || undefined}
            onChange={(value) => {
              setQueryParams({ filter: value || null });
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
      <BAIAgentTable
        agentsFragment={filterOutEmpty(
          agent_nodes?.edges.map((e) => e?.node) ?? [],
        )}
        onClickAgentName={(agent) => {
          setOpenDetailDrawer(true);
          const targetAgent = _.find(
            agent_nodes?.edges,
            (e) => e?.node?.id === agent.id,
          )?.node;
          setCurrentAgentInfo(targetAgent || null);
        }}
        customizeColumns={(baseColumns) => [
          baseColumns[0],
          controlColumn,
          regionColumn,
          ...baseColumns.slice(3),
        ]}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          total: agent_nodes?.count || 0,
          current: tablePaginationOption.current,
          style: {
            marginRight: token.marginXS,
          },
          onChange: (current, pageSize) => {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({
                current,
                pageSize,
              });
            }
          },
        }}
        order={queryParams.order}
        onChangeOrder={(order) => {
          setQueryParams({ order });
        }}
        loading={
          deferredQueryVariables !== queryVariables ||
          deferredFetchKey !== fetchKey
        }
        tableSettings={{
          columnOverrides: columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
        {...tableProps}
      />
      <AgentDetailModal
        agentDetailModalFrgmt={currentAgentInfo}
        open={openInfoModal}
        onRequestClose={() => {
          setCurrentAgentInfo(null);
          setOpenInfoModal(false);
        }}
      />
      <AgentSettingModal
        agentSettingModalFrgmt={currentAgentInfo}
        open={openSettingModal}
        onRequestClose={(success) => {
          if (success) {
            updateFetchKey();
          }
          setOpenSettingModal(false);
          setCurrentAgentInfo(null);
        }}
      />
      <BAIUnmountAfterClose>
        <AgentDetailDrawer
          agentNodeFragment={currentAgentInfo}
          open={openDetailDrawer}
          onRequestClose={() => {
            setOpenDetailDrawer(false);
            setCurrentAgentInfo(null);
          }}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default AgentList;
