/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  AgentsPanelQuery,
  AgentsPanelQuery$data,
} from '../../../__generated__/AgentsPanelQuery.graphql';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import ScopedCard from '../cards/ScopedCard';
import DonutChart from '../charts/DonutChart';
import { toDonutRows } from '../memberCards/memberCardData';
import type { PanelComponentProps } from '../types';
import { AGENT_STATUSES } from './superadminCardData';
import { Badge } from '@lablup/ui-common/Badge';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIBooleanToken,
  BAIFlex,
  BAITable,
  badgeVariantForStatus,
  filterOutNullAndUndefined,
  toLocalId,
} from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type AgentRow = NonNullable<
  NonNullable<
    NonNullable<AgentsPanelQuery$data['agents']>['edges'][number]
  >['node']
>;

const AgentList: React.FC<{ fetchKey: string }> = ({ fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 5 });
  const variables = {
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredVariables = useDeferredValue(variables);
  const data = useLazyLoadQuery<AgentsPanelQuery>(
    graphql`
      query AgentsPanelQuery($limit: Int!, $offset: Int!) {
        alive: agentsV2(filter: { status: { equals: ALIVE } }, limit: 1) {
          count
        }
        lost: agentsV2(filter: { status: { equals: LOST } }, limit: 1) {
          count
        }
        restarting: agentsV2(
          filter: { status: { equals: RESTARTING } }
          limit: 1
        ) {
          count
        }
        terminated: agentsV2(
          filter: { status: { equals: TERMINATED } }
          limit: 1
        ) {
          count
        }
        agents: agentsV2(
          orderBy: [
            { field: STATUS, direction: ASC }
            { field: ID, direction: ASC }
          ]
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              scalingGroup
              containerCount
              networkInfo {
                addr
              }
              statusInfo {
                status
                schedulable
              }
            }
          }
        }
      }
    `,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const counts = {
    ALIVE: data.alive?.count,
    LOST: data.lost?.count,
    RESTARTING: data.restarting?.count,
    TERMINATED: data.terminated?.count,
  };

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="md"
      style={{ flex: 1, minHeight: 0 }}
    >
      <DonutChart
        label={t('dashboard.card.Agents')}
        emptyText={t('agent.NoAgentToDisplay')}
        columnLabels={{
          name: t('agent.Status'),
          value: t('dashboard.card.Count'),
          percent: t('dashboard.card.Share'),
        }}
        rows={toDonutRows(
          AGENT_STATUSES.map((status) => ({
            key: status,
            label: status,
            count: counts[status],
          })),
        )}
      />
      <BAITable<AgentRow>
        size="small"
        rowKey="id"
        dataSource={filterOutNullAndUndefined(
          data.agents?.edges.map((edge) => edge?.node),
        )}
        loading={deferredVariables !== variables}
        scroll={{ x: 'max-content' }}
        columns={[
          {
            key: 'agent',
            title: t('agent.Agent'),
            // AgentV2 carries the agent's own id only in its Relay id.
            render: (_value, agent) => (
              <BAIFlex direction="column" align="start">
                <Text>{toLocalId(agent.id)}</Text>
                <Text type="supporting" size="sm">
                  {agent.networkInfo.addr}
                </Text>
              </BAIFlex>
            ),
          },
          {
            key: 'scalingGroup',
            title: t('agent.ResourceGroup'),
            render: (_value, agent) => agent.scalingGroup,
          },
          {
            key: 'status',
            title: t('agent.Status'),
            render: (_value, agent) => (
              <Badge
                variant={badgeVariantForStatus(
                  'agent',
                  agent.statusInfo.status,
                )}
                label={agent.statusInfo.status}
              />
            ),
          },
          {
            key: 'schedulable',
            title: t('agent.Schedulable'),
            render: (_value, agent) => (
              <BAIBooleanToken value={agent.statusInfo.schedulable} />
            ),
          },
          {
            key: 'containers',
            title: t('dashboard.card.Containers'),
            render: (_value, agent) => agent.containerCount ?? 0,
          },
        ]}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: data.agents?.count ?? 0,
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
