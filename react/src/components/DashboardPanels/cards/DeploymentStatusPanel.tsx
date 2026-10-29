/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentStatusPanelDomainQuery } from '../../../__generated__/DeploymentStatusPanelDomainQuery.graphql';
import type { DeploymentStatusPanelMineQuery } from '../../../__generated__/DeploymentStatusPanelMineQuery.graphql';
import type { DeploymentStatusPanelProjectQuery } from '../../../__generated__/DeploymentStatusPanelProjectQuery.graphql';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import type { CardScope } from '../cardScope';
import DeploymentHealthTable, {
  type DeploymentHealthNode,
} from '../memberCards/DeploymentHealthTable';
import type { PanelComponentProps } from '../types';
import ScopedCard from './ScopedCard';
import { filterOutNullAndUndefined } from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface PageArgs {
  limit: number;
  offset: number;
  fetchKey: string;
}

type DeploymentPage = {
  nodes: ReadonlyArray<DeploymentHealthNode>;
  total: number;
};

type Connection = {
  readonly count: number;
  readonly edges: ReadonlyArray<
    | { readonly node: DeploymentHealthNode | null | undefined }
    | null
    | undefined
  >;
} | null;

const toPage = (connection: Connection | undefined): DeploymentPage => ({
  nodes: filterOutNullAndUndefined(connection?.edges.map((edge) => edge?.node)),
  total: connection?.count ?? 0,
});

// Destroyed deployments stay in the connections; only live ones are listed.
const LIVE = { destroyedAt: { isNull: true } } as const;

const useMineDeployments = (
  projectId: string,
  { limit, offset, fetchKey }: PageArgs,
): DeploymentPage => {
  'use memo';
  const data = useLazyLoadQuery<DeploymentStatusPanelMineQuery>(
    graphql`
      query DeploymentStatusPanelMineQuery(
        $filter: DeploymentFilter!
        $limit: Int!
        $offset: Int!
      ) {
        deployments: myDeployments(
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
              ...BAIModelDeploymentNodesFragment @arguments(withDetails: false)
            }
          }
        }
      }
    `,
    { filter: { ...LIVE, projectId: { equals: projectId } }, limit, offset },
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return toPage(data.deployments);
};

const useProjectDeployments = (
  projectId: string,
  { limit, offset, fetchKey }: PageArgs,
): DeploymentPage => {
  'use memo';
  const data = useLazyLoadQuery<DeploymentStatusPanelProjectQuery>(
    graphql`
      query DeploymentStatusPanelProjectQuery(
        $projectId: UUID!
        $filter: DeploymentFilter!
        $limit: Int!
        $offset: Int!
      ) {
        deployments: projectDeployments(
          scope: { projectId: $projectId }
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
              ...BAIModelDeploymentNodesFragment @arguments(withDetails: false)
            }
          }
        }
      }
    `,
    { projectId, filter: LIVE, limit, offset },
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return toPage(data.deployments);
};

const MineDeployments: React.FC<
  PageArgs & {
    projectId: string;
    children: (page: DeploymentPage) => React.ReactNode;
  }
> = ({ projectId, children, ...args }) => {
  'use memo';
  return children(useMineDeployments(projectId, args));
};

const ProjectDeployments: React.FC<
  PageArgs & {
    projectId: string;
    children: (page: DeploymentPage) => React.ReactNode;
  }
> = ({ projectId, children, ...args }) => {
  'use memo';
  return children(useProjectDeployments(projectId, args));
};

const DomainDeployments: React.FC<
  PageArgs & {
    domainId: string;
    children: (page: DeploymentPage) => React.ReactNode;
  }
> = ({ domainId, children, limit, offset, fetchKey }) => {
  'use memo';
  const data = useLazyLoadQuery<DeploymentStatusPanelDomainQuery>(
    graphql`
      query DeploymentStatusPanelDomainQuery(
        $domainId: UUID!
        $filter: DeploymentFilter!
        $limit: Int!
        $offset: Int!
      ) {
        deployments: scopedDeployments(
          scope: { domain: [{ value: $domainId }] }
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
    { domainId, filter: LIVE, limit, offset },
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return children(toPage(data.deployments));
};

/** One page of live deployments in the scope, newest first. */
const DeploymentPageOf: React.FC<
  PageArgs & {
    scope: CardScope;
    children: (page: DeploymentPage) => React.ReactNode;
  }
> = ({ scope, ...args }) => {
  'use memo';
  switch (scope.kind) {
    case 'mine':
      return <MineDeployments projectId={scope.projectId} {...args} />;
    case 'project':
      return <ProjectDeployments projectId={scope.projectId} {...args} />;
    case 'domain':
      return <DomainDeployments domainId={scope.domainId} {...args} />;
  }
};
const DeploymentList: React.FC<{ scope: CardScope; fetchKey: string }> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 5 });
  const page = {
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredPage = useDeferredValue(page);
  return (
    <DeploymentPageOf scope={scope} fetchKey={fetchKey} {...deferredPage}>
      {({ nodes, total }) => (
        <DeploymentHealthTable
          nodes={nodes}
          total={total}
          loading={deferredPage.offset !== page.offset}
          pagination={{
            pageSize: tablePaginationOption.pageSize,
            current: tablePaginationOption.current,
            onChange: (current, pageSize) =>
              setTablePaginationOption({ current, pageSize }),
          }}
        />
      )}
    </DeploymentPageOf>
  );
};

/** Live deployments in the page's scope with replica health, newest first. */
const DeploymentStatusPanel: React.FC<PanelComponentProps> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{
        mine: { title: t('dashboard.card.MyDeployments') },
        project: {
          title: t('dashboard.card.DeploymentStatus'),
          tooltip: t('dashboard.card.DeploymentStatusTooltip'),
        },
        domain: {
          title: t('dashboard.card.DeploymentStatus'),
          tooltip: t('dashboard.card.DomainDeploymentStatusTooltip'),
        },
      }}
    >
      {(cardScope, key) => <DeploymentList scope={cardScope} fetchKey={key} />}
    </ScopedCard>
  );
};

export default DeploymentStatusPanel;
