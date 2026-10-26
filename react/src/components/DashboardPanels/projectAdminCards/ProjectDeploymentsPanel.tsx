/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ProjectDeploymentsPanelQuery } from '../../../__generated__/ProjectDeploymentsPanelQuery.graphql';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import DeploymentHealthTable from '../memberCards/DeploymentHealthTable';
import MemberCard, { NoProjectText } from '../memberCards/MemberCard';
import type { PanelComponentProps } from '../types';
import { adminProjectId } from './projectCardData';
import { filterOutNullAndUndefined } from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const ProjectDeploymentsTable: React.FC<{
  projectId: string;
  fetchKey: string;
}> = ({ projectId, fetchKey }) => {
  'use memo';
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 5 });
  const variables = {
    projectId,
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredVariables = useDeferredValue(variables);
  const data = useLazyLoadQuery<ProjectDeploymentsPanelQuery>(
    graphql`
      query ProjectDeploymentsPanelQuery(
        $projectId: UUID!
        $limit: Int!
        $offset: Int!
      ) {
        deployments: projectDeployments(
          scope: { projectId: $projectId }
          filter: { destroyedAt: { isNull: true } }
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
        data.deployments?.edges.map((edge) => edge?.node),
      )}
      total={data.deployments?.count ?? 0}
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

/** The project's live deployments with replica health, newest first. */
const ProjectDeploymentsPanel: React.FC<PanelComponentProps> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const projectId = adminProjectId(scope);
  return (
    <MemberCard
      title={t('dashboard.card.DeploymentStatus')}
      tooltip={t('dashboard.card.DeploymentStatusTooltip')}
      fetchKey={fetchKey}
    >
      {(key) =>
        projectId ? (
          <ProjectDeploymentsTable projectId={projectId} fetchKey={key} />
        ) : (
          <NoProjectText />
        )
      }
    </MemberCard>
  );
};

export default ProjectDeploymentsPanel;
