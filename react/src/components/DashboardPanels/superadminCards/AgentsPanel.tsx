/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AgentsPanelQuery } from '../../../__generated__/AgentsPanelQuery.graphql';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import ScopedCard from '../cards/ScopedCard';
import StatRow from '../charts/StatRow';
import { countText, readCounts } from '../countAliases';
import { readPrimary } from '../panelPermission';
import type { PanelComponentProps } from '../types';
import { AGENT_STATUSES } from './superadminCardData';
import {
  BAIAgentTable,
  BAIFlex,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const COLUMN_KEYS = ['row_id', 'scaling_group', 'status', 'schedulable'];

const AgentList: React.FC<{ fetchKey: string }> = ({ fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 5 });
  // The legacy connection takes `first` + `offset` as its offset mode, like the agent list page.
  const variables = {
    first: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredVariables = useDeferredValue(variables);
  const data = useLazyLoadQuery<AgentsPanelQuery>(
    graphql`
      query AgentsPanelQuery($first: Int!, $offset: Int!) {
        alive: agentsV2(filter: { status: { equals: ALIVE } }, limit: 1)
          @catch(to: RESULT) {
          count
        }
        lost: agentsV2(filter: { status: { equals: LOST } }, limit: 1)
          @catch(to: RESULT) {
          count
        }
        restarting: agentsV2(
          filter: { status: { equals: RESTARTING } }
          limit: 1
        ) @catch(to: RESULT) {
          count
        }
        terminated: agentsV2(
          filter: { status: { equals: TERMINATED } }
          limit: 1
        ) @catch(to: RESULT) {
          count
        }
        agents: agent_nodes(order: "status", first: $first, offset: $offset)
          @catch(to: RESULT) {
          count
          edges {
            node {
              id
              container_count
              ...BAIAgentTableFragment
            }
          }
        }
      }
    `,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const agents = readPrimary(data.agents);
  const statusCounts = readCounts(data, [
    'alive',
    'lost',
    'restarting',
    'terminated',
  ]);
  const counts = {
    ALIVE: statusCounts.alive,
    LOST: statusCounts.lost,
    RESTARTING: statusCounts.restarting,
    TERMINATED: statusCounts.terminated,
  };
  const nodes = filterOutNullAndUndefined(
    agents?.edges.map((edge) => edge?.node),
  );
  const containerCounts = new Map(
    nodes.map((node) => [node.id, node.container_count ?? 0]),
  );

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <StatRow
        items={AGENT_STATUSES.map((status) => ({
          key: status,
          label: status,
          value: countText(counts[status]),
          size: 'sm',
        }))}
      />
      <BAIAgentTable
        size="small"
        agentsFragment={nodes}
        loading={deferredVariables !== variables}
        customizeColumns={(columns) => [
          ...columns
            .filter((column) => COLUMN_KEYS.includes(String(column.key)))
            .map((column) => ({ ...column, sorter: false })),
          {
            key: 'containers',
            title: t('dashboard.card.Containers'),
            align: 'right',
            render: (_value: unknown, agent: { id: string }) =>
              containerCounts.get(agent.id) ?? 0,
          },
        ]}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: agents?.count ?? 0,
          onChange: (current, pageSize) =>
            setTablePaginationOption({ current, pageSize }),
        }}
      />
    </BAIFlex>
  );
};

/** Every agent of the cluster by status, and the agents themselves. */
const AgentsPanel: React.FC<PanelComponentProps> = ({ scope, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const heading = {
    title: t('dashboard.card.Agents'),
    tooltip: t('dashboard.card.AgentsTooltip'),
  };
  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{ project: heading, domain: heading }}
    >
      {(_cardScope, key) => <AgentList fetchKey={key} />}
    </ScopedCard>
  );
};

export default AgentsPanel;
