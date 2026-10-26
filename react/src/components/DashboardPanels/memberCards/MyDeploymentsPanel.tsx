/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { MyDeploymentsPanelQuery } from '../../../__generated__/MyDeploymentsPanelQuery.graphql';
import { useWebUINavigate } from '../../../hooks';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import { useProjectPath } from '../../../hooks/useRouteScope';
import type { PanelComponentProps } from '../types';
import MemberCard, { NoProjectText, mineProjectId } from './MemberCard';
import { Badge } from '@lablup/ui-common/Badge';
import {
  BAIModelDeploymentNodes,
  filterOutNullAndUndefined,
  toLocalId,
} from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const COLUMN_KEYS = ['name', 'status', 'replicaSummary'];

const MyDeploymentsTable: React.FC<{ projectId: string; fetchKey: string }> = ({
  projectId,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 5 });

  const variables = {
    // Destroyed deployments stay in `myDeployments`; only live ones count here.
    filter: { projectId: { equals: projectId }, destroyedAt: { isNull: true } },
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredVariables = useDeferredValue(variables);
  const data = useLazyLoadQuery<MyDeploymentsPanelQuery>(
    graphql`
      query MyDeploymentsPanelQuery(
        $filter: DeploymentFilter!
        $limit: Int!
        $offset: Int!
      ) {
        myDeployments(
          filter: $filter
          orderBy: [{ field: CREATED_AT, direction: DESC }]
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              replicaState {
                desiredReplicaCount
              }
              healthyReplicas: replicas(
                filter: { healthStatus: { equals: HEALTHY } }
              ) {
                count
              }
              ...BAIModelDeploymentNodesFragment
            }
          }
        }
      }
    `,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const nodes = filterOutNullAndUndefined(
    data.myDeployments?.edges.map((edge) => edge?.node),
  );
  const healthById = new Map(
    nodes.map((node) => [
      node.id,
      {
        healthy: node.healthyReplicas?.count ?? 0,
        desired: node.replicaState?.desiredReplicaCount ?? 0,
      },
    ]),
  );

  return (
    <BAIModelDeploymentNodes
      deploymentsFrgmt={nodes}
      disableSorter
      loading={deferredVariables !== variables}
      customizeColumns={(base) => [
        ...base
          .filter((column) => COLUMN_KEYS.includes(String(column.key)))
          .map((column) =>
            column.key === 'name'
              ? {
                  ...column,
                  onTitleClick: (record: { id: string }) =>
                    webuiNavigate(
                      `${buildProjectPath('deployments')}/${toLocalId(record.id)}`,
                    ),
                }
              : column,
          ),
        {
          key: 'health',
          title: t('dashboard.card.ReplicaHealth'),
          render: (_value: unknown, record: { id: string }) => {
            const health = healthById.get(record.id);
            if (!health || health.desired === 0) return '-';
            const isHealthy = health.healthy >= health.desired;
            return (
              <Badge
                variant={isHealthy ? 'success' : 'warning'}
                label={
                  isHealthy
                    ? t('dashboard.card.Healthy')
                    : t('dashboard.card.Unhealthy')
                }
              />
            );
          },
        },
      ]}
      pagination={{
        pageSize: tablePaginationOption.pageSize,
        current: tablePaginationOption.current,
        total: data.myDeployments?.count ?? 0,
        onChange: (current: number, pageSize: number) =>
          setTablePaginationOption({ current, pageSize }),
      }}
    />
  );
};

/** The viewer's deployments in the page's project with replica health. */
const MyDeploymentsPanel: React.FC<PanelComponentProps> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const projectId = mineProjectId(scope);
  return (
    <MemberCard title={t('dashboard.card.MyDeployments')} fetchKey={fetchKey}>
      {(key) =>
        projectId ? (
          <MyDeploymentsTable projectId={projectId} fetchKey={key} />
        ) : (
          <NoProjectText />
        )
      }
    </MemberCard>
  );
};

export default MyDeploymentsPanel;
