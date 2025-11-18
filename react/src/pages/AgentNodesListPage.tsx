import { AgentNodesListPageQuery } from '../__generated__/AgentNodesListPageQuery.graphql';
import AgentNodes, {
  availableAgentSorterValues,
} from '../components/AgentNodes';
import BAIRadioGroup from '../components/BAIRadioGroup';
import { INITIAL_FETCH_KEY, useFetchKey } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { Alert } from 'antd';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAIPropertyFilter,
  filterOutNullAndUndefined,
  mergeFilterValues,
} from 'backend.ai-ui';
import _ from 'lodash';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';

const AgentNodesListPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({ current: 1, pageSize: 10 });

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.AgentNodesListPage',
  );

  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral(availableAgentSorterValues).withDefault(
        '-first_contact',
      ),
      filter: parseAsString.withDefault(''),
      status: parseAsStringLiteral(['available', 'unavailable']).withDefault(
        'available',
      ),
    },
    { history: 'replace' },
  );

  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  // Construct filter string based on status
  const statusFilter =
    queryParams.status === 'available'
      ? `status == "ALIVE" | status == "RESTARTING"`
      : `status == "LOST" | status == "TERMINATED"`;

  const queryVariables = {
    first: baiPaginationOption.first,
    offset: baiPaginationOption.offset,
    filter: mergeFilterValues([statusFilter, queryParams.filter || undefined]),
    order: queryParams.order,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);

  const queryRef = useLazyLoadQuery<AgentNodesListPageQuery>(
    graphql`
      query AgentNodesListPageQuery(
        $first: Int = 20
        $offset: Int = 0
        $filter: String
        $order: String
      ) {
        agentNodesResult: agent_nodes(
          first: $first
          offset: $offset
          filter: $filter
          order: $order
        ) @catch(to: RESULT) {
          edges @required(action: THROW) {
            node @required(action: THROW) {
              id @required(action: THROW)
              ...AgentNodesFragment
            }
            cursor
          }
          count
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
      fetchKey: deferredFetchKey,
    },
  );
  const { agentNodesResult } = queryRef;
  const agent_nodes = agentNodesResult.ok ? agentNodesResult.value : null;

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex justify="between" wrap="wrap" gap="sm">
        <BAIFlex gap={'sm'} wrap="wrap" style={{ flex: 1 }}>
          <BAIRadioGroup
            options={[
              { label: t('agent.Connected'), value: 'available' },
              { label: t('agent.Terminated'), value: 'unavailable' },
            ]}
            value={queryParams.status}
            onChange={(e) => setQueryParams({ status: e.target.value })}
          />
          <BAIPropertyFilter
            // TODO: support date filter (status_changed, first_contact, lost_at)
            filterProperties={[
              { key: 'id', propertyLabel: 'ID', type: 'string' },
              {
                key: 'addr',
                propertyLabel: t('agent.Endpoint'),
                type: 'string',
              },
              {
                key: 'status',
                propertyLabel: t('agent.Status'),
                type: 'string',
                strictSelection: true,
                options: [
                  { label: 'ALIVE', value: 'ALIVE' },
                  { label: 'LOST', value: 'LOST' },
                  { label: 'RESTARTING', value: 'RESTARTING' },
                  { label: 'TERMINATED', value: 'TERMINATED' },
                ],
                defaultOperator: '==',
              },
              {
                key: 'schedulable',
                propertyLabel: t('agent.Schedulable'),
                type: 'boolean',
                options: [
                  { label: t('general.Enabled'), value: 'true' },
                  { label: t('general.Disabled'), value: 'false' },
                ],
              },
              {
                key: 'region',
                propertyLabel: t('agent.Region'),
                type: 'string',
              },
              {
                key: 'scaling_group',
                propertyLabel: t('general.ResourceGroup'),
                type: 'string',
              },
              {
                key: 'version',
                propertyLabel: t('agent.Version'),
                type: 'string',
              },
            ]}
            value={queryParams.filter}
            onChange={(value) => setQueryParams({ filter: value || '' })}
          />
        </BAIFlex>
        <BAIFlex gap={'xs'}>
          <BAIFetchKeyButton
            loading={
              deferredQueryVariables !== queryVariables ||
              deferredFetchKey !== fetchKey
            }
            value={fetchKey}
            onChange={(newFetchKey) => updateFetchKey(newFetchKey)}
            autoUpdateDelay={15_000}
          />
        </BAIFlex>
      </BAIFlex>
      {agent_nodes ? (
        <AgentNodes
          agentsFrgmt={filterOutNullAndUndefined(
            agent_nodes?.edges.map((e) => e?.node),
          )}
          order={queryParams.order}
          pagination={{
            pageSize: tablePaginationOption.pageSize,
            current: tablePaginationOption.current,
            total: agent_nodes.count || 0,
            onChange: (current, pageSize) => {
              if (_.isNumber(current) && _.isNumber(pageSize)) {
                setTablePaginationOption({ current, pageSize });
              }
            },
          }}
          onChangeOrder={(order) => {
            setQueryParams({ order: order || null });
          }}
          loading={
            deferredQueryVariables !== queryVariables ||
            deferredFetchKey !== fetchKey
          }
          tableSettings={{
            columnOverrides: columnOverrides,
            onColumnOverridesChange: setColumnOverrides,
          }}
        />
      ) : (
        <Alert
          type="error"
          showIcon
          message={t('error.FailedToLoadTableData')}
        />
      )}
    </BAIFlex>
  );
};

export default AgentNodesListPage;
