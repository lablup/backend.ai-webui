/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { MyDeploymentsPanelQuery } from '../../../__generated__/MyDeploymentsPanelQuery.graphql';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import type { PanelComponentProps } from '../types';
import DeploymentHealthTable from './DeploymentHealthTable';
import MemberCard, { NoProjectText, mineProjectId } from './MemberCard';
import { filterOutNullAndUndefined } from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const MyDeploymentsTable: React.FC<{ projectId: string; fetchKey: string }> = ({
  projectId,
  fetchKey,
}) => {
  'use memo';
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
  return (
    <DeploymentHealthTable
      nodes={filterOutNullAndUndefined(
        data.myDeployments?.edges.map((edge) => edge?.node),
      )}
      total={data.myDeployments?.count ?? 0}
      loading={deferredVariables !== variables}
      pagination={{
        pageSize: tablePaginationOption.pageSize,
        current: tablePaginationOption.current,
        onChange: (current, pageSize) =>
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
